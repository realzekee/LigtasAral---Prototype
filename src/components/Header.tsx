import React, { useEffect, useState } from 'react';
import { CloudRain, PlusCircle, ShieldCheck, Compass, RotateCcw, AlertTriangle } from 'lucide-react';
import { AppViewMode } from '../types';

interface HeaderProps {
  mode: AppViewMode;
  onModeChange: (mode: AppViewMode) => void;
  pendingCount: number;
  onOpenReportModal: () => void;
  onResetDemoData: () => void;
  onOpenDisclaimerModal: () => void;
}

const WEATHER_BULLETINS = [
  'PAGASA: TCWS #1 Active in parts of Luzon · Orange Rainfall Warning over Cavite & Metro Manila',
  'PAGASA 5:00 AM Bulletin: Southwest Monsoon (Habagat) enhanced by Tropical Depression · Moderate to Intense Rain',
  'MMDA & DOTr Advisory: Free Rides deployed along Cavite–PITX & Commonwealth Corridors',
];

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  pendingCount,
  onOpenReportModal,
  onResetDemoData,
  onOpenDisclaimerModal,
}) => {
  const [pstTime, setPstTime] = useState<string>('05:20:00 AM');
  const [pstDate, setPstDate] = useState<string>('Wed, Oct 21 · Philippine Standard Time');
  const [bulletinIndex, setBulletinIndex] = useState<number>(0);

  useEffect(() => {
    const updateClock = () => {
      try {
        const now = new Date();
        const timeFormatter = new Intl.DateTimeFormat('en-PH', {
          timeZone: 'Asia/Manila',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
        const dateFormatter = new Intl.DateTimeFormat('en-PH', {
          timeZone: 'Asia/Manila',
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        setPstTime(timeFormatter.format(now));
        setPstDate(`${dateFormatter.format(now)} · PST (UTC+8)`);
      } catch {
        // Fallback if Intl timezone fails
        setPstTime('05:20:00 AM');
      }
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="lg:sticky lg:top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      {/* Top Emergency Weather & PST Ticker Bar */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-medium">
            <CloudRain className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <span className="tracking-tight">{WEATHER_BULLETINS[bulletinIndex]}</span>
            <button
              type="button"
              onClick={() => setBulletinIndex((prev) => (prev + 1) % WEATHER_BULLETINS.length)}
              className="text-amber-400/90 hover:text-amber-200 underline underline-offset-2 ml-1 whitespace-nowrap shrink-0 cursor-pointer"
              aria-label="Next weather bulletin"
            >
              Next Bulletin
            </button>
          </div>

          <div className="flex items-center gap-3 text-slate-300 font-mono tabular-nums ml-auto">
            <button
              type="button"
              onClick={onOpenDisclaimerModal}
              className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-sans font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Click to view prototype disclaimer notice"
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" aria-hidden="true" />
              <span>Prototype Only</span>
            </button>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{pstDate}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span
              className="text-amber-300 font-semibold"
              aria-label="Philippine Standard Time"
            >
              {pstTime} PST
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation & Controls Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Identity */}
        <div className="flex items-baseline gap-3">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              onModeChange('student');
            }}
            className="text-xl sm:text-2xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            LigtasAral <span className="text-amber-400 font-bold">#WalangPasok Hub</span>
          </a>
          <span className="hidden xl:inline-block text-xs text-slate-400 whitespace-nowrap">
            Verified LGU Class Suspensions &amp; Student Commute Safety
          </span>
        </div>

        {/* Mode Switch & Primary Action */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap ml-auto">
          {/* Mode Switch Toggle */}
          <div
            role="group"
            aria-label="Application View Mode"
            className="inline-flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl"
          >
            <button
              type="button"
              onClick={() => onModeChange('student')}
              aria-pressed={mode === 'student'}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'student'
                  ? 'bg-slate-100 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Student View</span>
            </button>

            <button
              type="button"
              onClick={() => onModeChange('moderator')}
              aria-pressed={mode === 'moderator'}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'moderator'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Moderator / Admin Deck</span>
              <span
                className={`font-mono tabular-nums text-xs px-1.5 py-0.5 rounded ${
                  mode === 'moderator'
                    ? 'bg-slate-950 text-amber-300 font-bold'
                    : 'bg-slate-800 text-amber-300'
                }`}
              >
                {pendingCount}
              </span>
            </button>
          </div>

          {/* + Report Suspension CTA */}
          <button
            type="button"
            onClick={onOpenReportModal}
            className="min-h-[42px] px-4 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>+ Report Suspension</span>
          </button>

          {/* Subtle Reset Demo State Button */}
          <button
            type="button"
            onClick={onResetDemoData}
            title="Reset demo data to initial seed state"
            aria-label="Reset demo data"
            className="min-h-[42px] min-w-[42px] px-2.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl transition-colors flex items-center justify-center shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
};
