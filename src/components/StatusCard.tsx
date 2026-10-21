import React from 'react';
import { ExternalLink, ShieldCheck, OctagonAlert, Laptop, CheckCircle2 } from 'lucide-react';
import { CityStatus } from '../types';

interface StatusCardProps {
  item: CityStatus;
  isRouteEndpoint?: 'Home' | 'School' | 'Both' | null;
}

export const StatusCard: React.FC<StatusCardProps> = ({ item, isRouteEndpoint }) => {
  const statusConfig =
    item.status === 'suspended'
      ? {
          badgeText: 'ALL SUSPENDED',
          bannerBg: 'bg-red-600 text-white',
          cardBorder: 'border-red-500/40 hover:border-red-500/70',
          icon: OctagonAlert,
        }
      : item.status === 'modular'
        ? {
            badgeText: 'FACE-TO-FACE SUSPENDED / MODULAR ON',
            bannerBg: 'bg-amber-500 text-slate-950',
            cardBorder: 'border-amber-500/40 hover:border-amber-500/70',
            icon: Laptop,
          }
        : {
            badgeText: 'CLASSES ONGOING',
            bannerBg: 'bg-emerald-600 text-white',
            cardBorder: 'border-emerald-500/40 hover:border-emerald-500/70',
            icon: CheckCircle2,
          };

  const StatusIcon = statusConfig.icon;

  return (
    <article
      className={`bg-slate-900 border ${statusConfig.cardBorder} rounded-2xl p-5 flex flex-col justify-between transition-colors`}
    >
      <div>
        {/* City & Province Header */}
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              {item.city}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {item.province}
              {item.rainfallWarning && item.rainfallWarning !== 'None' ? (
                <>
                  <span aria-hidden="true"> · </span>
                  <span className="text-amber-300 font-medium">
                    PAGASA {item.rainfallWarning} Rainfall
                  </span>
                </>
              ) : null}
            </p>
          </div>

          {isRouteEndpoint && (
            <span className="text-xs font-mono font-semibold text-amber-300 tabular-nums shrink-0">
              Pinned: {isRouteEndpoint}
            </span>
          )}
        </div>

        {/* Prominent High-Contrast Status Banner */}
        <div
          className={`w-full rounded-xl px-3 py-2.5 mb-3.5 flex items-center gap-2 font-extrabold text-xs tracking-tight ${statusConfig.bannerBg}`}
        >
          <StatusIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{statusConfig.badgeText}</span>
        </div>

        {/* Unboxed Coverage Metadata with Clean Separators */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm font-semibold text-slate-200 mb-3 pb-3 border-b border-slate-800">
          <span>Coverage: {item.levels}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-amber-300">{item.sector}</span>
        </div>

        {/* Advisory Details */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
          {item.advisoryNote}
        </p>
      </div>

      {/* Footer: Moderator Verification & Official Source Link */}
      <div className="pt-3 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Double-Checked by Moderator</span>
          </div>
          <span className="font-mono tabular-nums text-slate-300 shrink-0">
            {item.verifiedAt}
          </span>
        </div>

        <div className="text-xs text-slate-400 truncate" title={item.sourceAuthority}>
          Source: {item.sourceAuthority} · {item.verifiedBy}
        </div>

        <a
          href={item.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full min-h-[42px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <span>View Official Mayor / LGU Post</span>
          <ExternalLink className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
};
