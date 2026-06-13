/** @jsxImportSource react */
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  computeComplianceSummary,
  statusFor,
  type ComplianceStatus,
} from './teamsComplianceReport'

/** Brand-purple swatch + semantic status colors (Fluent palette). */
const STATUS_COLOR: Record<ComplianceStatus, string> = {
  pass: '#6BB700', // Fluent success green
  partial: '#F7B500', // Fluent warning amber
  gap: '#C4314B', // Fluent danger red
}

const STATUS_LABEL: Record<ComplianceStatus, string> = {
  pass: 'On spec',
  partial: 'Partial',
  gap: 'Gap',
}

function scoreColor(percent: number): string {
  if (percent >= 90) return STATUS_COLOR.pass
  if (percent >= 75) return STATUS_COLOR.partial
  return STATUS_COLOR.gap
}

/**
 * "Teams design" compliance badge + drop-down report, rendered inside the
 * demo black bar. Click to reveal the weighted score, per-category breakdown,
 * and the prioritised list of changes needed to reach 100% alignment with the
 * Microsoft Teams (Fluent 2) design system.
 */
export function TeamsComplianceReport() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  const summary = useMemo(() => computeComplianceSummary(), [])
  const accent = scoreColor(summary.percent)

  // Close on Escape or outside click.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onClick)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative flex items-center">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-white/40 transition-colors"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={`Jarvis app — Microsoft Teams design compliance: ${summary.percent} percent. Open report.`}
      >
        <span
          aria-hidden
          className="inline-block rounded-full"
          style={{ width: 8, height: 8, backgroundColor: accent }}
        />
        <span className="whitespace-nowrap">Teams app fit</span>
        <span className="font-semibold tabular-nums" style={{ color: accent }}>
          {summary.percent}%
        </span>
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Jarvis app — Microsoft Teams design compliance report"
          className="absolute right-0 top-full mt-2 z-50 w-[420px] max-w-[92vw] rounded-lg overflow-hidden text-left"
          style={{
            backgroundColor: '#FFFFFF',
            color: '#242424',
            boxShadow:
              '0 6.4px 14.4px 0 rgba(0,0,0,0.18), 0 1.2px 3.6px 0 rgba(0,0,0,0.12)',
            border: '1px solid #E1DFDD',
            fontFamily:
              "'Segoe UI','Segoe UI Web (West European)',-apple-system,BlinkMacSystemFont,Roboto,'Helvetica Neue',sans-serif",
          }}
        >
          <ReportHeader percent={summary.percent} accent={accent} onClose={() => setOpen(false)} />

          <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
            <SectionTitle>Guideline breakdown</SectionTitle>
            <ul className="flex flex-col gap-2.5 mt-2">
              {summary.criteria.map((c) => {
                const status = statusFor(c.score)
                return (
                  <li key={c.id}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          aria-hidden
                          className="inline-block rounded-full shrink-0"
                          style={{ width: 8, height: 8, backgroundColor: STATUS_COLOR[status] }}
                        />
                        <span className="text-[13px] font-semibold truncate" style={{ color: '#242424' }}>
                          {c.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className="text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5"
                          style={{
                            color: STATUS_COLOR[status],
                            backgroundColor: `${STATUS_COLOR[status]}1A`,
                          }}
                        >
                          {STATUS_LABEL[status]}
                        </span>
                        <span className="text-[12px] font-semibold tabular-nums" style={{ color: '#616161', width: 32, textAlign: 'right' }}>
                          {c.score}%
                        </span>
                      </div>
                    </div>
                    <div
                      className="mt-1 rounded-full overflow-hidden"
                      style={{ height: 4, backgroundColor: '#F0F0F0' }}
                      aria-hidden
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${c.score}%`, backgroundColor: STATUS_COLOR[status] }}
                      />
                    </div>
                    <p className="text-[12px] mt-1 leading-snug" style={{ color: '#616161' }}>
                      {c.summary}
                    </p>
                  </li>
                )
              })}
            </ul>

            <SectionTitle>{summary.recommendations.length > 0 ? 'To reach 100%' : 'Status'}</SectionTitle>
            {summary.recommendations.length === 0 ? (
              <div
                className="flex items-start gap-2.5 rounded-md p-3 mt-2"
                style={{ backgroundColor: '#F1FAEE', border: '1px solid #C5E8B7' }}
              >
                <span aria-hidden style={{ color: STATUS_COLOR.pass, lineHeight: '20px' }}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" focusable="false" aria-hidden>
                    <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div className="text-[12px] leading-snug" style={{ color: '#1F5014' }}>
                  <strong>Fully aligned with the Microsoft Teams design system.</strong>{' '}
                  All categories meet the guideline. Tokens, motion, iconography,
                  Adaptive Cards, the three Teams themes (Default / Dark / High
                  Contrast) and the WCAG 2.1 AA mechanisms are implemented — keep
                  this state by tracking against the Fluent 2 spec on each change.
                </div>
              </div>
            ) : (
            <>
            <p className="text-[12px] mt-1 leading-snug" style={{ color: '#616161' }}>
              Highest-impact fixes first. The number shows how many points each
              change adds to the overall score.
            </p>
            <ol className="flex flex-col gap-2 mt-2">
              {summary.recommendations.map(({ criterion, points }) => (
                <li
                  key={criterion.id}
                  className="flex items-start gap-2.5 rounded-md p-2.5"
                  style={{ backgroundColor: '#F7F7F7' }}
                >
                  <span
                    className="shrink-0 inline-flex items-center justify-center rounded text-[11px] font-bold tabular-nums"
                    style={{
                      minWidth: 38,
                      height: 20,
                      color: '#5B5FC7',
                      backgroundColor: '#E8EBFA',
                      padding: '0 6px',
                    }}
                  >
                    +{points}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold" style={{ color: '#242424' }}>
                      {criterion.label}
                    </div>
                    <div className="text-[12px] leading-snug" style={{ color: '#616161' }}>
                      {criterion.recommendation}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ReportHeader({
  percent,
  accent,
  onClose,
}: {
  percent: number
  accent: string
  onClose: () => void
}) {
  // Conic progress ring driven by the percentage.
  const ring = `conic-gradient(${accent} ${percent * 3.6}deg, #E1DFDD 0deg)`
  return (
    <div
      className="flex items-center gap-3.5 px-5 py-4"
      style={{ borderBottom: '1px solid #E1DFDD', backgroundColor: '#FAFAFA' }}
    >
      <div
        className="relative shrink-0 rounded-full flex items-center justify-center"
        style={{ width: 56, height: 56, background: ring }}
        role="img"
        aria-label={`${percent} percent aligned`}
      >
        <div
          className="rounded-full flex items-center justify-center"
          style={{ width: 44, height: 44, backgroundColor: '#FFFFFF' }}
        >
          <span className="text-[15px] font-bold tabular-nums" style={{ color: accent }}>
            {percent}%
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-bold" style={{ color: '#242424' }}>
          Jarvis app — Teams design compliance
        </div>
        <div className="text-[12px] leading-snug mt-0.5" style={{ color: '#616161' }}>
          How closely the Jarvis app surface follows the Microsoft Teams app
          design system.
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close report"
        className="shrink-0 rounded flex items-center justify-center focus:outline-none focus:ring-2"
        style={{ width: 28, height: 28, color: '#616161' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden focusable="false">
          <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3
      className="text-[11px] font-bold uppercase tracking-wide mt-4 first:mt-0"
      style={{ color: '#616161' }}
    >
      {children}
    </h3>
  )
}
