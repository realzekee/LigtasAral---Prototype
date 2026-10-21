import React from 'react';
import { ArrowLeftRight, AlertTriangle, CheckCircle2, OctagonAlert, Navigation } from 'lucide-react';
import { CityStatus, FloodAlert } from '../types';
import { evaluateRouteSafety } from '../utils/suspensionLogic';

interface MyRouteCardProps {
  cities: CityStatus[];
  homeCity: string;
  schoolCity: string;
  onHomeCityChange: (city: string) => void;
  onSchoolCityChange: (city: string) => void;
  onSwapCities: () => void;
  floodAlerts: FloodAlert[];
}

function getStatusBadgeConfig(status: CityStatus['status'] | undefined) {
  if (status === 'suspended') {
    return {
      label: 'ALL SUSPENDED',
      bg: 'bg-red-600 text-white',
      text: 'text-red-300',
      border: 'border-red-500/40',
    };
  }
  if (status === 'modular') {
    return {
      label: 'FACE-TO-FACE SUSPENDED / MODULAR ON',
      bg: 'bg-amber-500 text-slate-950',
      text: 'text-amber-300',
      border: 'border-amber-500/40',
    };
  }
  return {
    label: 'CLASSES ONGOING',
    bg: 'bg-emerald-600 text-white',
    text: 'text-emerald-300',
    border: 'border-emerald-500/40',
  };
}

export const MyRouteCard: React.FC<MyRouteCardProps> = ({
  cities,
  homeCity,
  schoolCity,
  onHomeCityChange,
  onSchoolCityChange,
  onSwapCities,
  floodAlerts,
}) => {
  const homeStatus = cities.find((c) => c.city.toLowerCase() === homeCity.toLowerCase());
  const schoolStatus = cities.find((c) => c.city.toLowerCase() === schoolCity.toLowerCase());

  const homeBadge = getStatusBadgeConfig(homeStatus?.status);
  const schoolBadge = getStatusBadgeConfig(schoolStatus?.status);
  const safety = evaluateRouteSafety(homeStatus, schoolStatus, floodAlerts);

  const cityNames = Array.from(new Set(cities.map((c) => c.city))).sort();

  return (
    <section
      aria-labelledby="my-route-heading"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm"
    >
      {/* Top Row: Section Header & Swap Control */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <Navigation className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />
          <div>
            <h2 id="my-route-heading" className="text-base sm:text-lg font-bold text-white">
              Pinned &ldquo;My Route&rdquo; Commuter Check
            </h2>
            <p className="text-xs text-slate-400">
              Instant side-by-side status between your residence LGU and campus LGU
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSwapCities}
          className="min-h-[40px] px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
          <span>Swap Home &amp; School</span>
        </button>
      </div>

      {/* Side-by-Side Route Endpoints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Home City Endpoint */}
        <div className={`rounded-xl bg-slate-950/90 border ${homeBadge.border} p-4`}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <label
              htmlFor="home-city-select"
              className="text-xs font-semibold text-slate-400 tracking-wide"
            >
              Origin · Home City / Municipality
            </label>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {homeStatus ? homeStatus.province : 'Select City'}
            </span>
          </div>

          <select
            id="home-city-select"
            value={homeCity}
            onChange={(e) => onHomeCityChange(e.target.value)}
            className="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-2 text-sm sm:text-base font-bold text-white mb-3 outline-none cursor-pointer"
          >
            {cityNames.map((cityName) => (
              <option key={`home-${cityName}`} value={cityName}>
                {cityName}
              </option>
            ))}
          </select>

          {homeStatus ? (
            <div className="space-y-2">
              <div
                className={`inline-block px-3 py-1 rounded-md text-xs font-extrabold tracking-wide ${homeBadge.bg}`}
              >
                {homeBadge.label}
              </div>
              <div className="text-xs text-slate-300 flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-white">{homeStatus.levels}</span>
                <span aria-hidden="true">·</span>
                <span>{homeStatus.sector}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-slate-400">
                  Verified {homeStatus.verifiedAt}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No active LGU report found.</p>
          )}
        </div>

        {/* School City Endpoint */}
        <div className={`rounded-xl bg-slate-950/90 border ${schoolBadge.border} p-4`}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <label
              htmlFor="school-city-select"
              className="text-xs font-semibold text-slate-400 tracking-wide"
            >
              Destination · School / University City
            </label>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {schoolStatus ? schoolStatus.province : 'Select City'}
            </span>
          </div>

          <select
            id="school-city-select"
            value={schoolCity}
            onChange={(e) => onSchoolCityChange(e.target.value)}
            className="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-2 text-sm sm:text-base font-bold text-white mb-3 outline-none cursor-pointer"
          >
            {cityNames.map((cityName) => (
              <option key={`school-${cityName}`} value={cityName}>
                {cityName}
              </option>
            ))}
          </select>

          {schoolStatus ? (
            <div className="space-y-2">
              <div
                className={`inline-block px-3 py-1 rounded-md text-xs font-extrabold tracking-wide ${schoolBadge.bg}`}
              >
                {schoolBadge.label}
              </div>
              <div className="text-xs text-slate-300 flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-white">{schoolStatus.levels}</span>
                <span aria-hidden="true">·</span>
                <span>{schoolStatus.sector}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-slate-400">
                  Verified {schoolStatus.verifiedAt}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No active LGU report found.</p>
          )}
        </div>
      </div>

      {/* Synthesized Route Decision Banner */}
      <div
        className={`mt-4 rounded-xl p-3.5 border flex items-start gap-3 ${
          safety.severity === 'stop'
            ? 'bg-red-950/60 border-red-500/40 text-red-100'
            : safety.severity === 'caution'
              ? 'bg-amber-950/50 border-amber-500/40 text-amber-100'
              : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-100'
        }`}
      >
        {safety.severity === 'stop' ? (
          <OctagonAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
        ) : safety.severity === 'caution' ? (
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
        )}
        <div className="text-xs sm:text-sm">
          <p className="font-extrabold tracking-tight">{safety.headline}</p>
          <p className="text-slate-300 mt-0.5 leading-relaxed">{safety.recommendation}</p>
        </div>
      </div>
    </section>
  );
};
