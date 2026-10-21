import {
  CityStatus,
  CoverageLevels,
  FilterOption,
  FloodAlert,
  ModalityOption,
  PendingReport,
  SectorScope,
  SuspensionStatusType,
} from '../types';
import { MUNICIPALITY_DIRECTORY } from '../data/seedData';

export function filterCityStatuses(
  cities: CityStatus[],
  searchQuery: string,
  filter: FilterOption
): CityStatus[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return cities.filter((item) => {
    const matchesSearch =
      normalizedQuery === '' ||
      item.city.toLowerCase().includes(normalizedQuery) ||
      item.province.toLowerCase().includes(normalizedQuery) ||
      item.sourceAuthority.toLowerCase().includes(normalizedQuery);

    if (!matchesSearch) return false;

    if (filter === 'all') return true;
    if (filter === 'suspended') return item.status === 'suspended';
    if (filter === 'modular') return item.status === 'modular';
    if (filter === 'ongoing') return item.status === 'ongoing';
    return true;
  });
}

export interface UrlValidationResult {
  valid: boolean;
  error?: string;
}

export function validateOfficialUrl(rawUrl: string): UrlValidationResult {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: 'Mandatory Official Post URL is required for moderator verification.',
    };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        valid: false,
        error: 'URL must start with https:// or http:// (e.g., https://facebook.com/...).',
      };
    }
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return {
        valid: false,
        error: 'Please enter a complete web domain (e.g., facebook.com, gov.ph, x.com).',
      };
    }
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: 'Please enter a valid URL starting with https:// (e.g., https://www.facebook.com/MayorPage).',
    };
  }
}

export function modalityToStatus(modality: ModalityOption): SuspensionStatusType {
  return modality === 'Complete Cancellation' ? 'suspended' : 'modular';
}

export function lookupProvinceForCity(cityName: string): string {
  const match = MUNICIPALITY_DIRECTORY.find(
    (entry) => entry.city.toLowerCase() === cityName.trim().toLowerCase()
  );
  return match ? match.province : 'Metro Manila / Calabarzon';
}

export function approvePendingReport(
  currentCities: CityStatus[],
  report: PendingReport,
  verifiedAtTimestamp: string,
  moderatorName = 'Mod_OnDuty (Verified Desk)'
): CityStatus[] {
  const newStatus: SuspensionStatusType = modalityToStatus(report.modality);
  const existingIndex = currentCities.findIndex(
    (c) => c.city.toLowerCase() === report.city.toLowerCase()
  );

  const updatedCard: CityStatus = {
    id: existingIndex >= 0 ? currentCities[existingIndex].id : `city-${Date.now()}`,
    city: report.city,
    province: report.province || lookupProvinceForCity(report.city),
    status: newStatus,
    levels: report.levels,
    sector: report.sector,
    officialUrl: report.officialUrl,
    sourceAuthority: `Verified LGU / Mayor Post (${report.city} PIO)`,
    verifiedBy: moderatorName,
    verifiedAt: verifiedAtTimestamp,
    advisoryNote:
      report.notes && report.notes.trim().length > 0
        ? report.notes.trim()
        : `${report.modality} confirmed for ${report.levels} (${report.sector}). Verified against official LGU announcement.`,
    rainfallWarning: newStatus === 'suspended' ? 'Orange' : 'Yellow',
  };

  if (existingIndex >= 0) {
    const next = [...currentCities];
    next[existingIndex] = updatedCard;
    // Move newly updated card to the top so students immediately see newly verified advisories
    const [item] = next.splice(existingIndex, 1);
    return [item, ...next];
  }

  return [updatedCard, ...currentCities];
}

export interface RouteSafetyAssessment {
  headline: string;
  recommendation: string;
  severity: 'stop' | 'caution' | 'clear';
}

export function evaluateRouteSafety(
  homeStatus: CityStatus | undefined,
  schoolStatus: CityStatus | undefined,
  floodAlerts: FloodAlert[]
): RouteSafetyAssessment {
  if (schoolStatus?.status === 'suspended') {
    return {
      headline: 'DO NOT COMMUTE — SCHOOL CITY SUSPENDED',
      recommendation: `Classes in ${schoolStatus.city} are officially suspended (${schoolStatus.levels}, ${schoolStatus.sector}). Stay safe at home.`,
      severity: 'stop',
    };
  }

  if (schoolStatus?.status === 'modular') {
    return {
      headline: 'STAY HOME — SHIFTED TO ONLINE / MODULAR',
      recommendation: `In-person classes in ${schoolStatus.city} are shifted to asynchronous/online mode (${schoolStatus.levels}). No physical commute needed.`,
      severity: 'caution',
    };
  }

  if (homeStatus?.status === 'suspended') {
    return {
      headline: 'HIGH COMMUTE RISK — HOME CITY SUSPENDED, SCHOOL ONGOING',
      recommendation: `${homeStatus.city} has suspended classes due to local weather/flooding, though ${schoolStatus?.city ?? 'your school city'} remains ongoing. Coordinate with professors regarding flood-stranded excuse policies.`,
      severity: 'caution',
    };
  }

  const severeFloodsOnRoute = floodAlerts.filter(
    (f) =>
      f.passability !== 'PATV' &&
      (f.city.toLowerCase() === homeStatus?.city.toLowerCase() ||
        f.city.toLowerCase() === schoolStatus?.city.toLowerCase())
  );

  if (severeFloodsOnRoute.length > 0) {
    return {
      headline: 'ACTIVE FLOOD CHOKEPOINT ALONG CORRIDOR',
      recommendation: `Classes are ongoing, but ${severeFloodsOnRoute[0].location} is currently ${severeFloodsOnRoute[0].passability} (${severeFloodsOnRoute[0].depthLabel}). Allow +45 mins buffer.`,
      severity: 'caution',
    };
  }

  return {
    headline: 'CLASSES ONGOING — CORRIDOR PASSABLE',
    recommendation: `Both ${homeStatus?.city ?? 'Home'} and ${schoolStatus?.city ?? 'School'} report ongoing classes. Bring rain gear and monitor PAGASA updates.`,
    severity: 'clear',
  };
}

export function createPendingReportFromForm(input: {
  city: string;
  levels: CoverageLevels;
  modality: ModalityOption;
  sector: SectorScope;
  officialUrl: string;
  submittedBy?: string;
  notes?: string;
  timestamp: string;
}): PendingReport {
  return {
    id: `pend-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    city: input.city.trim(),
    province: lookupProvinceForCity(input.city),
    levels: input.levels,
    modality: input.modality,
    sector: input.sector,
    officialUrl: input.officialUrl.trim(),
    submittedBy: input.submittedBy?.trim() || '@student_patrol_anon',
    submittedAt: input.timestamp,
    notes: input.notes?.trim() || '',
  };
}
