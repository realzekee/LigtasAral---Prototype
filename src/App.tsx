/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  X,
  CheckCircle2,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import {
  AppViewMode,
  CityStatus,
  FilterOption,
  ModeratorActionLog,
  PendingReport,
  RejectionReason,
} from './types';
import {
  INITIAL_CITY_STATUSES,
  INITIAL_FLOOD_ALERTS,
  INITIAL_MOD_LOGS,
  INITIAL_PENDING_REPORTS,
  INITIAL_RAIL_STATUSES,
} from './data/seedData';
import { approvePendingReport, filterCityStatuses } from './utils/suspensionLogic';
import { Header } from './components/Header';
import { MyRouteCard } from './components/MyRouteCard';
import { StatusCard } from './components/StatusCard';
import { TransitFloodDrawer } from './components/TransitFloodDrawer';
import { ReportModal } from './components/ReportModal';
import { ModeratorDeck } from './components/ModeratorDeck';
import { PrototypeDisclaimerModal } from './components/PrototypeDisclaimerModal';

const STORAGE_KEYS = {
  CITIES: 'ligtasaral_cities_v1',
  PENDING: 'ligtasaral_pending_v1',
  LOGS: 'ligtasaral_modlogs_v1',
  HOME_CITY: 'ligtasaral_home_city_v1',
  SCHOOL_CITY: 'ligtasaral_school_city_v1',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [mode, setMode] = useState<AppViewMode>('student');
  const [cities, setCities] = useState<CityStatus[]>(() =>
    loadFromStorage(STORAGE_KEYS.CITIES, INITIAL_CITY_STATUSES)
  );
  const [pendingReports, setPendingReports] = useState<PendingReport[]>(() =>
    loadFromStorage(STORAGE_KEYS.PENDING, INITIAL_PENDING_REPORTS)
  );
  const [modLogs, setModLogs] = useState<ModeratorActionLog[]>(() =>
    loadFromStorage(STORAGE_KEYS.LOGS, INITIAL_MOD_LOGS)
  );

  const [homeCity, setHomeCity] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.HOME_CITY, 'General Trias')
  );
  const [schoolCity, setSchoolCity] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.SCHOOL_CITY, 'Manila')
  );

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isDisclaimerModalOpen, setIsDisclaimerModalOpen] = useState<boolean>(true);

  const [bannerAlert, setBannerAlert] = useState<{
    type: 'success' | 'warning';
    message: string;
  } | null>(null);

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(cities));
    } catch {
      // Ignore storage quota errors
    }
  }, [cities]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.PENDING, JSON.stringify(pendingReports));
    } catch {
      // Ignore
    }
  }, [pendingReports]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(modLogs));
    } catch {
      // Ignore
    }
  }, [modLogs]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.HOME_CITY, JSON.stringify(homeCity));
      window.localStorage.setItem(STORAGE_KEYS.SCHOOL_CITY, JSON.stringify(schoolCity));
    } catch {
      // Ignore
    }
  }, [homeCity, schoolCity]);

  const filteredCities = useMemo(
    () => filterCityStatuses(cities, searchQuery, activeFilter),
    [cities, searchQuery, activeFilter]
  );

  const counts = useMemo(
    () => ({
      all: cities.length,
      suspended: cities.filter((c) => c.status === 'suspended').length,
      modular: cities.filter((c) => c.status === 'modular').length,
      ongoing: cities.filter((c) => c.status === 'ongoing').length,
    }),
    [cities]
  );

  const handleSwapRouteCities = () => {
    setHomeCity(schoolCity);
    setSchoolCity(homeCity);
  };

  const handleSubmitCrowdReport = (report: PendingReport) => {
    setPendingReports((prev) => [report, ...prev]);
    setBannerAlert({
      type: 'success',
      message: `Report for ${report.city} (${report.modality}) added to the Pending Verification Queue. Switch to "Moderator / Admin Deck" to verify and publish it.`,
    });
  };

  const handleApproveReport = (report: PendingReport) => {
    const nowTime =
      new Intl.DateTimeFormat('en-PH', {
        timeZone: 'Asia/Manila',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(new Date()) + ' PST';

    setCities((prev) => approvePendingReport(prev, report, nowTime));
    setPendingReports((prev) => prev.filter((item) => item.id !== report.id));
    setModLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        reportCity: report.city,
        action: 'approved',
        moderator: 'Mod_OnDuty (Verified Desk)',
        timestamp: nowTime,
        officialUrl: report.officialUrl,
      },
      ...prev,
    ]);
    setBannerAlert({
      type: 'success',
      message: `Approved & Published: ${report.city} (${report.modality}) is now live on the Student Feed.`,
    });
  };

  const handleRejectReport = (report: PendingReport, reason: RejectionReason) => {
    const nowTime =
      new Intl.DateTimeFormat('en-PH', {
        timeZone: 'Asia/Manila',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(new Date()) + ' PST';

    setPendingReports((prev) => prev.filter((item) => item.id !== report.id));
    setModLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        reportCity: report.city,
        action: 'rejected',
        moderator: 'Mod_OnDuty (Verified Desk)',
        timestamp: nowTime,
        reason,
        officialUrl: report.officialUrl,
      },
      ...prev,
    ]);
    setBannerAlert({
      type: 'warning',
      message: `Rejected report for ${report.city} — Flagged as "${reason}".`,
    });
  };

  const handleResetDemoData = () => {
    setCities(INITIAL_CITY_STATUSES);
    setPendingReports(INITIAL_PENDING_REPORTS);
    setModLogs(INITIAL_MOD_LOGS);
    setHomeCity('General Trias');
    setSchoolCity('Manila');
    setSearchQuery('');
    setActiveFilter('all');
    setBannerAlert({
      type: 'success',
      message: 'Demo seed data restored to initial 5:00 AM Cavite & Metro Manila state.',
    });
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Sticky Top Header */}
      <Header
        mode={mode}
        onModeChange={setMode}
        pendingCount={pendingReports.length}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onResetDemoData={handleResetDemoData}
        onOpenDisclaimerModal={() => setIsDisclaimerModalOpen(true)}
      />

      {/* Dismissible Action Feedback Alert */}
      {bannerAlert && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4">
          <div
            role="status"
            className={`rounded-xl p-3.5 border flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold ${
              bannerAlert.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/80 border-amber-500/40 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {bannerAlert.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
              )}
              <span>{bannerAlert.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setBannerAlert(null)}
              aria-label="Dismiss notification"
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {mode === 'student' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left/Main Column (8 cols on desktop): Route Card + Search/Filter + LGU Grid */}
            <div className="lg:col-span-8 space-y-6">
              <MyRouteCard
                cities={cities}
                homeCity={homeCity}
                schoolCity={schoolCity}
                onHomeCityChange={setHomeCity}
                onSchoolCityChange={setSchoolCity}
                onSwapCities={handleSwapRouteCities}
                floodAlerts={INITIAL_FLOOD_ALERTS}
              />

              <section
                aria-label="Search and filter class suspensions"
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search
                      className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search City, Municipality, or Province (e.g. General Trias, Manila, Cavite)..."
                      aria-label="Search by City, Municipality, or Province"
                      className="w-full min-h-[44px] bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search query"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Filter Segmented Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div
                    role="group"
                    aria-label="Filter cities by class suspension status"
                    className="flex flex-wrap items-center gap-1.5"
                  >
                    {(
                      [
                        { id: 'all', label: 'All', count: counts.all },
                        { id: 'suspended', label: 'Suspended Only', count: counts.suspended },
                        {
                          id: 'modular',
                          label: 'Online/Modular Only',
                          count: counts.modular,
                        },
                        { id: 'ongoing', label: 'Normal Classes', count: counts.ongoing },
                      ] as const
                    ).map((tab) => {
                      const isActive = activeFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveFilter(tab.id)}
                          aria-pressed={isActive}
                          className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                            isActive
                              ? 'bg-amber-400 text-slate-950 shadow-sm'
                              : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span
                            className={`font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded ${
                              isActive
                                ? 'bg-slate-950/20 text-slate-950 font-extrabold'
                                : 'bg-slate-900 text-slate-400'
                            }`}
                          >
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-xs text-slate-400 font-mono tabular-nums flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                    <span>
                      Showing {filteredCities.length} of {cities.length} LGUs
                    </span>
                  </div>
                </div>
              </section>

              <section aria-labelledby="live-feed-heading">
                <div className="flex items-center justify-between mb-3">
                  <h2
                    id="live-feed-heading"
                    className="text-base sm:text-lg font-extrabold text-white tracking-tight"
                  >
                    Verified LGU Class Status Feed
                  </h2>
                  <span className="text-xs text-slate-400">
                    Sorted by latest verified bulletin
                  </span>
                </div>

                {filteredCities.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
                    <p className="text-sm font-bold text-white">
                      No matching cities or municipalities found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try clearing your search query or switching the status filter to &ldquo;All&rdquo;.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveFilter('all');
                      }}
                      className="mt-4 min-h-[40px] px-4 py-2 bg-amber-400 text-slate-950 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Reset Search &amp; Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCities.map((item) => {
                      const isHome = item.city.toLowerCase() === homeCity.toLowerCase();
                      const isSchool = item.city.toLowerCase() === schoolCity.toLowerCase();
                      const routeRole =
                        isHome && isSchool
                          ? 'Both'
                          : isHome
                            ? 'Home'
                            : isSchool
                              ? 'School'
                              : null;

                      return (
                        <StatusCard
                          key={item.id}
                          item={item}
                          isRouteEndpoint={routeRole}
                        />
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Right Column (4 cols on desktop): Collapsible Transit & Flood Sidebar/Drawer */}
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <TransitFloodDrawer
                railStatuses={INITIAL_RAIL_STATUSES}
                floodAlerts={INITIAL_FLOOD_ALERTS}
              />
            </div>
          </div>
        ) : (
          <ModeratorDeck
            pendingReports={pendingReports}
            modLogs={modLogs}
            onApproveReport={handleApproveReport}
            onRejectReport={handleRejectReport}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 px-4 sm:px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <strong className="text-slate-300">LigtasAral #WalangPasok Hub (Prototype Only)</strong>{' '}
            · Civic Student Commute &amp; LGU Suspension Tracker Concept
            <button
              type="button"
              onClick={() => setIsDisclaimerModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 underline underline-offset-2 ml-1 cursor-pointer"
            >
              View Prototype Notice
            </button>
          </div>
          <div>
            Prototype demonstration only — all LGU statuses, PAGASA bulletins, and MMDA flood metrics
            are simulated and saved locally in your browser.
          </div>
        </div>
      </footer>

      {/* Crowdsourcing Submission Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={handleSubmitCrowdReport}
      />

      {/* Prototype Warning Pop-Up Dialog */}
      <PrototypeDisclaimerModal
        isOpen={isDisclaimerModalOpen}
        onClose={() => setIsDisclaimerModalOpen(false)}
      />
    </div>
  );
}
