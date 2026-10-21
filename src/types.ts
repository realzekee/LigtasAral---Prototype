export type SuspensionStatusType = 'suspended' | 'modular' | 'ongoing';

export type CoverageLevels =
  | 'All Levels'
  | 'Pre-school to Senior High'
  | 'Basic Ed (K-12) Only'
  | 'Tertiary / College Only'
  | 'College Included';

export type SectorScope = 'Public & Private' | 'Public Schools Only';

export type ModalityOption =
  | 'Complete Cancellation'
  | 'Shift to Asynchronous / Online Only';

export interface CityStatus {
  id: string;
  city: string;
  province: string;
  status: SuspensionStatusType;
  levels: CoverageLevels;
  sector: SectorScope;
  officialUrl: string;
  sourceAuthority: string;
  verifiedBy: string;
  verifiedAt: string;
  advisoryNote: string;
  rainfallWarning?: 'Red' | 'Orange' | 'Yellow' | 'None';
}

export interface PendingReport {
  id: string;
  city: string;
  province: string;
  levels: CoverageLevels;
  modality: ModalityOption;
  sector: SectorScope;
  officialUrl: string;
  submittedBy: string;
  submittedAt: string;
  notes?: string;
}

export type RejectionReason =
  | 'Outdated 2024 Graphic'
  | 'Invalid URL'
  | 'Unverified / Parody Account'
  | 'Mismatched Municipality';

export interface ModeratorActionLog {
  id: string;
  reportCity: string;
  action: 'approved' | 'rejected';
  moderator: string;
  timestamp: string;
  reason?: RejectionReason;
  officialUrl: string;
}

export type RailOperationalState = 'Normal' | 'Degraded Speed' | 'Crowded' | 'Provisionary Service';

export interface RailLineStatus {
  id: string;
  line: 'LRT-1' | 'LRT-2' | 'MRT-3';
  corridor: string;
  status: RailOperationalState;
  headwayMins: number;
  advisory: string;
  updatedAt: string;
}

export type MmdaPassabilityCode = 'PATV' | 'NPLV' | 'NPATV';

export interface FloodAlert {
  id: string;
  location: string;
  corridor: string;
  city: string;
  depthLabel: string;
  depthInches: number;
  passability: MmdaPassabilityCode;
  updatedAt: string;
}

export type FilterOption = 'all' | 'suspended' | 'modular' | 'ongoing';

export type AppViewMode = 'student' | 'moderator';
