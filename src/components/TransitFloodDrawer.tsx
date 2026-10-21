import React, { useState } from 'react';
import {
  TrainFront,
  Waves,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  OctagonAlert,
} from 'lucide-react';
import { FloodAlert, MmdaPassabilityCode, RailLineStatus } from '../types';

interface TransitFloodDrawerProps {
  railStatuses: RailLineStatus[];
  floodAlerts: FloodAlert[];
}

export const TransitFloodDrawer: React.FC<TransitFloodDrawerProps> = ({
  railStatuses,
  floodAlerts,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [passabilityFilter, setPassabilityFilter] = useState<'ALL' | MmdaPassabilityCode>('ALL');

  const filteredFloods =
    passabilityFilter === 'ALL'
      ? floodAlerts
      : floodAlerts.filter((f) => f.passability === passabilityFilter);

  return (
    <aside
      aria-labelledby="transit-flood-heading"
      className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
    >
      {/* Collapsible Header Trigger */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-slate-800">
        <div>
          <h2
            id="transit-flood-heading"
            className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2"
          >
            <TrainFront className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />
            <span>Transit &amp; MMDA Flood Telemetry</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Live Rail Line Operations &amp; Road Passability (PATV / NPLV / NPATV)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="transit-flood-panel-body"
          className="min-h-[40px] px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>{isOpen ? 'Collapse Drawer' : 'Expand Drawer'}</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-amber-400" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4 text-amber-400" aria-hidden="true" />
          )}
        </button>
      </div>

      {isOpen && (
        <div id="transit-flood-panel-body" className="p-4 sm:p-5 space-y-6">
          {/* Section 1: Rail Line Statuses */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-300 tracking-wide">
                01. Metro Rail Status (LRT-1 · LRT-2 · MRT-3)
              </h3>
              <span className="text-xs font-mono tabular-nums text-slate-400">
                DOTr Rail Desk
              </span>
            </div>

            <div className="space-y-3">
              {railStatuses.map((rail) => {
                const statusColor =
                  rail.status === 'Normal'
                    ? 'text-emerald-300 bg-emerald-950/80 border-emerald-500/40'
                    : rail.status === 'Degraded Speed'
                      ? 'text-amber-300 bg-amber-950/80 border-amber-500/40'
                      : 'text-rose-300 bg-rose-950/80 border-rose-500/40';

                return (
                  <div
                    key={rail.id}
                    className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="font-mono font-extrabold text-sm text-white whitespace-nowrap shrink-0">
                          {rail.line}
                        </span>
                        <span className="text-xs text-slate-400 truncate min-w-0">
                          {rail.corridor}
                        </span>
                      </div>

                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded border whitespace-nowrap shrink-0 ${statusColor}`}
                      >
                        {rail.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-2">
                      {rail.advisory}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                      <span>Headway: ~{rail.headwayMins} mins</span>
                      <span>Updated {rail.updatedAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: MMDA Road Flood Alerts */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                <h3 className="text-xs font-bold text-slate-300 tracking-wide">
                  02. MMDA &amp; Cavite Road Flood Alerts
                </h3>
              </div>

              <div
                role="group"
                aria-label="Filter flood alerts by MMDA passability code"
                className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800"
              >
                {(['ALL', 'NPATV', 'NPLV', 'PATV'] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setPassabilityFilter(code)}
                    className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      passabilityFilter === code
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Passability Legend */}
            <div className="text-[11px] text-slate-400 mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>
                <strong className="text-emerald-400 font-mono">PATV</strong> Passable to All
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong className="text-amber-400 font-mono">NPLV</strong> Not Passable to Light Vehicles
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong className="text-red-400 font-mono">NPATV</strong> Not Passable to All
              </span>
            </div>

            <div className="space-y-2.5">
              {filteredFloods.map((flood) => {
                const badgeStyle =
                  flood.passability === 'NPATV'
                    ? {
                        bg: 'bg-red-600 text-white',
                        border: 'border-red-500/40',
                        icon: OctagonAlert,
                        meaning: 'Not Passable to All Vehicles',
                      }
                    : flood.passability === 'NPLV'
                      ? {
                          bg: 'bg-amber-500 text-slate-950',
                          border: 'border-amber-500/40',
                          icon: AlertTriangle,
                          meaning: 'Not Passable to Light Vehicles',
                        }
                      : {
                          bg: 'bg-emerald-600 text-white',
                          border: 'border-emerald-500/40',
                          icon: CheckCircle2,
                          meaning: 'Passable to All Vehicles',
                        };

                const PassIcon = badgeStyle.icon;

                return (
                  <div
                    key={flood.id}
                    className={`bg-slate-950/90 border ${badgeStyle.border} rounded-xl p-3.5`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                          {flood.location}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {flood.city} · {flood.corridor}
                        </p>
                      </div>

                      <span
                        title={badgeStyle.meaning}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono font-extrabold flex items-center gap-1 whitespace-nowrap shrink-0 ${badgeStyle.bg}`}
                      >
                        <PassIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>{flood.passability}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300 mt-2 pt-2 border-t border-slate-800/80 font-mono tabular-nums">
                      <span>Depth: {flood.depthLabel}</span>
                      <span className="text-slate-400">{flood.updatedAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
