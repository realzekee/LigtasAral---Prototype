import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, Link2, Send } from 'lucide-react';
import { CoverageLevels, ModalityOption, PendingReport, SectorScope } from '../types';
import { MUNICIPALITY_DIRECTORY } from '../data/seedData';
import { createPendingReportFromForm, validateOfficialUrl } from '../utils/suspensionLogic';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (report: PendingReport) => void;
}

const AFFECTED_LEVEL_OPTIONS: CoverageLevels[] = [
  'All Levels',
  'Basic Ed (K-12) Only',
  'Tertiary / College Only',
];

const MODALITY_OPTIONS: ModalityOption[] = [
  'Complete Cancellation',
  'Shift to Asynchronous / Online Only',
];

const SECTOR_OPTIONS: SectorScope[] = [
  'Public & Private',
  'Public Schools Only',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
}) => {
  const [citySearch, setCitySearch] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('General Trias');
  const [levels, setLevels] = useState<CoverageLevels>('All Levels');
  const [modality, setModality] = useState<ModalityOption>('Complete Cancellation');
  const [sector, setSector] = useState<SectorScope>('Public & Private');
  const [officialUrl, setOfficialUrl] = useState<string>('');
  const [submittedBy, setSubmittedBy] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredTowns = MUNICIPALITY_DIRECTORY.filter(
    (entry) =>
      citySearch.trim() === '' ||
      entry.city.toLowerCase().includes(citySearch.trim().toLowerCase()) ||
      entry.province.toLowerCase().includes(citySearch.trim().toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedCity.trim()) {
      setErrorMessage('Please select a Municipality / City.');
      return;
    }

    const urlCheck = validateOfficialUrl(officialUrl);
    if (!urlCheck.valid) {
      setErrorMessage(urlCheck.error || 'Please enter a valid Official Post URL.');
      return;
    }

    const nowFormatted = new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date()) + ' PST';

    const newReport = createPendingReportFromForm({
      city: selectedCity,
      levels,
      modality,
      sector,
      officialUrl,
      submittedBy,
      notes,
      timestamp: nowFormatted,
    });

    onSubmitReport(newReport);
    setOfficialUrl('');
    setNotes('');
    setErrorMessage(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl my-8">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h2 id="report-modal-title" className="text-lg sm:text-xl font-extrabold text-white">
              Submit #WalangPasok LGU Report
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Crowdsourced tip line for Cavite, Metro Manila &amp; nearby provinces
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[40px] min-w-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="report-city-select"
              className="block text-xs font-bold text-slate-300 mb-1.5"
            >
              1. Municipality / City (Cavite &amp; Metro Manila Directory)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={citySearch}
                onChange={(e) => {
                  const val = e.target.value;
                  setCitySearch(val);
                  const firstMatch = MUNICIPALITY_DIRECTORY.find(
                    (m) =>
                      m.city.toLowerCase().includes(val.trim().toLowerCase()) ||
                      m.province.toLowerCase().includes(val.trim().toLowerCase())
                  );
                  if (firstMatch) {
                    setSelectedCity(firstMatch.city);
                  }
                }}
                placeholder="Filter town (e.g. Dasmariñas, Pasay)..."
                aria-label="Filter town list"
                className="min-h-[42px] bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs sm:text-sm text-white outline-none"
              />
              <select
                id="report-city-select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="min-h-[42px] bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-white outline-none cursor-pointer"
              >
                {filteredTowns.length > 0 ? (
                  filteredTowns.map((entry) => (
                    <option key={entry.city} value={entry.city}>
                      {entry.city} ({entry.province})
                    </option>
                  ))
                ) : (
                  <option value={selectedCity}>{selectedCity}</option>
                )}
              </select>
            </div>
          </div>

          <fieldset>
            <legend className="block text-xs font-bold text-slate-300 mb-1.5">
              2. Affected Levels
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {AFFECTED_LEVEL_OPTIONS.map((option) => (
                <label
                  key={option}
                  className={`min-h-[42px] px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                    levels === option
                      ? 'bg-amber-400/15 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="affected-levels"
                    value={option}
                    checked={levels === option}
                    onChange={() => setLevels(option)}
                    className="accent-amber-400"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="block text-xs font-bold text-slate-300 mb-1.5">
              3. Suspension Modality
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MODALITY_OPTIONS.map((option) => (
                <label
                  key={option}
                  className={`min-h-[42px] px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                    modality === option
                      ? 'bg-amber-400/15 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="modality"
                    value={option}
                    checked={modality === option}
                    onChange={() => setModality(option)}
                    className="accent-amber-400"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="block text-xs font-bold text-slate-300 mb-1.5">
              4. School Sector
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SECTOR_OPTIONS.map((option) => (
                <label
                  key={option}
                  className={`min-h-[42px] px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                    sector === option
                      ? 'bg-amber-400/15 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="sector"
                    value={option}
                    checked={sector === option}
                    onChange={() => setSector(option)}
                    className="accent-amber-400"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="official-post-url"
              className="block text-xs font-bold text-slate-300 mb-1.5"
            >
              5. Mandatory Official Post URL (Mayor / LGU PIO / DepEd Link) *
            </label>
            <div className="relative">
              <Link2
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                id="official-post-url"
                type="url"
                required
                value={officialUrl}
                onChange={(e) => {
                  setOfficialUrl(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="https://www.facebook.com/MayorOfficialPage/posts/..."
                className="w-full min-h-[44px] bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm text-white outline-none font-mono"
              />
            </div>
          </div>

          {/* Optional Reporter Handle & Context Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="reporter-handle"
                className="block text-xs font-semibold text-slate-400 mb-1"
              >
                Your Handle / Org (Optional)
              </label>
              <input
                id="reporter-handle"
                type="text"
                value={submittedBy}
                onChange={(e) => setSubmittedBy(e.target.value)}
                placeholder="@cvsu_commuter"
                className="w-full min-h-[40px] bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="reporter-notes"
                className="block text-xs font-semibold text-slate-400 mb-1"
              >
                Memo Context / Quote (Optional)
              </label>
              <input
                id="reporter-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Executive Order No. 14 signed 4:50 AM"
                className="w-full min-h-[40px] bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Validation Error Alert */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-semibold flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Mandatory Anti-Fake News Disclaimer */}
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200/90 text-xs flex items-start gap-2.5 leading-relaxed">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              <strong>Verification Protocol:</strong> Every report is human-verified by moderators
              against the official post link before going live. No fake or outdated memos.
            </p>
          </div>

          {/* Submit & Cancel Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Submit to Verification Queue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
