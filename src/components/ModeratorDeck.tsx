import React, { useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  XCircle,
  Clock,
  FileWarning,
  PlusCircle,
} from 'lucide-react';
import { ModeratorActionLog, PendingReport, RejectionReason } from '../types';

interface ModeratorDeckProps {
  pendingReports: PendingReport[];
  modLogs: ModeratorActionLog[];
  onApproveReport: (report: PendingReport) => void;
  onRejectReport: (report: PendingReport, reason: RejectionReason) => void;
  onOpenReportModal: () => void;
}

const REJECTION_REASONS: RejectionReason[] = [
  'Outdated 2024 Graphic',
  'Invalid URL',
  'Unverified / Parody Account',
  'Mismatched Municipality',
];

export const ModeratorDeck: React.FC<ModeratorDeckProps> = ({
  pendingReports,
  modLogs,
  onApproveReport,
  onRejectReport,
  onOpenReportModal,
}) => {
  const [selectedReasons, setSelectedReasons] = useState<Record<string, RejectionReason>>({});

  const getReasonForReport = (id: string): RejectionReason => {
    return selectedReasons[id] || 'Outdated 2024 Graphic';
  };

  return (
    <div className="space-y-8">
      {/* Moderator Deck Header Banner */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-wide mb-1">
            <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Moderator / Admin Verification Console</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            The Double-Check Deck · Pending Crowdsourced Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Inspect every submitted LGU link to verify the publication timestamp and official seal
            before publishing to the student feed.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-right">
            <div className="text-xs text-slate-400">Pending Queue</div>
            <div className="text-2xl font-extrabold font-mono tabular-nums text-amber-400">
              {pendingReports.length}
            </div>
          </div>
        </div>
      </section>

      {/* Pending Submissions List */}
      <section aria-labelledby="pending-queue-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="pending-queue-heading" className="text-base sm:text-lg font-bold text-white">
            Awaiting Human Verification ({pendingReports.length})
          </h2>
        </div>

        {pendingReports.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <CheckCircle2
              className="w-10 h-10 text-emerald-400 mx-auto mb-3"
              aria-hidden="true"
            />
            <h3 className="text-base font-bold text-white">
              All Pending Reports Reviewed!
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
              The verification queue is currently clear. Every approved LGU announcement is now
              live on the Student Feed.
            </p>
            <button
              type="button"
              onClick={onOpenReportModal}
              className="mt-4 min-h-[42px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>Submit Test Crowd Report</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingReports.map((report) => {
              const currentReason = getReasonForReport(report.id);

              return (
                <article
                  key={report.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 transition-colors hover:border-slate-700"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Left 7 Cols: Report Metadata & Official Source Inspection */}
                    <div className="lg:col-span-7 space-y-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <h3 className="text-lg sm:text-xl font-extrabold text-white">
                            {report.city}{' '}
                            <span className="text-sm font-normal text-slate-400">
                              · {report.province}
                            </span>
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
                          <Clock className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                          <span>Submitted {report.submittedAt}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-300 font-semibold">{report.submittedBy}</span>
                        </div>
                      </div>

                      {/* Proposed Status Breakdown */}
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold">
                        <span
                          className={`px-2.5 py-1 rounded-md font-bold ${
                            report.modality === 'Complete Cancellation'
                              ? 'bg-red-600/20 text-red-300 border border-red-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {report.modality}
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-white">{report.levels}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-amber-300">{report.sector}</span>
                      </div>

                      {report.notes && (
                        <p className="text-xs sm:text-sm text-slate-300 bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
                          <strong className="text-slate-400">Reporter Note:</strong> {report.notes}
                        </p>
                      )}

                      {/* Official Post URL Inspection Row */}
                      <div className="pt-1 flex flex-wrap items-center gap-3">
                        <a
                          href={report.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[42px] px-4 py-2 bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                        >
                          <span>Open Official Link</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        </a>
                        <span className="text-xs font-mono text-slate-400 truncate max-w-xs sm:max-w-md">
                          {report.officialUrl}
                        </span>
                      </div>
                    </div>

                    {/* Right 5 Cols: Moderator Decision Controls */}
                    <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="text-xs font-bold text-slate-400">
                        Verification Action ({report.city})
                      </div>

                      {/* Green Approve Button */}
                      <button
                        type="button"
                        onClick={() => onApproveReport(report)}
                        className="w-full min-h-[44px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Approve &amp; Publish ({report.city})</span>
                      </button>

                      {/* Reject with Reason Selector */}
                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <label
                          htmlFor={`reject-reason-${report.id}`}
                          className="block text-[11px] font-semibold text-slate-400"
                        >
                          Rejection / Fake Memo Reason:
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <select
                            id={`reject-reason-${report.id}`}
                            value={currentReason}
                            onChange={(e) =>
                              setSelectedReasons((prev) => ({
                                ...prev,
                                [report.id]: e.target.value as RejectionReason,
                              }))
                            }
                            className="flex-1 min-h-[42px] bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none cursor-pointer"
                          >
                            {REJECTION_REASONS.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => onRejectReport(report, currentReason)}
                            className="min-h-[42px] px-3.5 py-2 bg-red-600/90 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>Reject / Fake Memo ({report.city})</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Moderator Verification History / Audit Log */}
      <section
        aria-labelledby="audit-log-heading"
        className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileWarning className="w-4 h-4 text-slate-400" aria-hidden="true" />
            <h2 id="audit-log-heading" className="text-sm sm:text-base font-bold text-white">
              Recent Moderator Verification Log
            </h2>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-400">
            {modLogs.length} actions logged
          </span>
        </div>

        <div className="divide-y divide-slate-800 text-xs">
          {modLogs.map((log) => (
            <div
              key={log.id}
              className="py-3 flex flex-wrap items-center justify-between gap-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`font-mono font-bold uppercase ${
                    log.action === 'approved' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {log.action === 'approved' ? 'APPROVED' : 'REJECTED'}
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="font-bold text-white">{log.reportCity}</span>
                {log.reason && (
                  <>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-red-300">Reason: {log.reason}</span>
                  </>
                )}
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-400">{log.moderator}</span>
              </div>

              <div className="flex items-center gap-3 font-mono tabular-nums text-slate-400">
                <a
                  href={log.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline"
                >
                  Source Link
                </a>
                <span>{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
