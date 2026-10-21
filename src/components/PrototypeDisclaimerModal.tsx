import React from 'react';
import { AlertTriangle, ExternalLink, ShieldAlert, Check } from 'lucide-react';

interface PrototypeDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrototypeDisclaimerModal: React.FC<PrototypeDisclaimerModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-modal-title"
    >
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100 overflow-hidden">
        {/* Subtle accent glow line at the top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500" />

        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
            <AlertTriangle className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <span className="inline-block text-[11px] font-mono font-bold tracking-wider uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded mb-1">
              DEMONSTRATION PROTOTYPE ONLY
            </span>
            <h2 id="disclaimer-modal-title" className="text-xl font-extrabold text-white tracking-tight">
              Prototype &amp; Simulation Notice
            </h2>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
          <p className="font-semibold text-amber-200 bg-amber-950/40 border border-amber-500/30 rounded-xl p-3">
            This web application is a prototype interface only. It is not affiliated with or endorsed by any government agency or school institution.
          </p>

          <p>
            All #WalangPasok class suspension advisories, PAGASA tropical cyclone / rainfall warnings, rail transit delays, and MMDA road flood levels displayed here are <strong>simulated mock data</strong> designed strictly for concept testing and UI/UX evaluation.
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
              <span>For Real-Time Official Announcements, Please Consult:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li>Your respective Mayor, Governor, or City Public Information Office (PIO)</li>
              <li>PAGASA Official Weather Bulletins (bagong.pagasa.dost.gov.ph)</li>
              <li>MMDA Metrobase Flood Updates (@MMDA)</li>
              <li>Your University or School Registrar official portals</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-amber-400/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />
            <span>I Understand — Proceed to Prototype</span>
          </button>
        </div>
      </div>
    </div>
  );
};
