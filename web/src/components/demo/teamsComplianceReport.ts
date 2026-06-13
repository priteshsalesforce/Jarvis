/**
 * Microsoft Teams app design-system compliance audit for the **Jarvis app**.
 *
 * This audits the Jarvis product surface itself — the personal-app/tab
 * experience built in `App.jsx` (Today, Conversations, Feed, Skills, the brief
 * cards, the chat/Copilot panel, Welcome and Setup) — NOT the Teams chrome
 * replica that wraps it. It is measured against the published Microsoft Teams
 * app design guidance:
 *   - Designing your Microsoft Teams app + UI templates/components
 *     (github.com/MicrosoftDocs/msteams-docs → msteams-platform/concepts/design)
 *   - Fluent 2 / Fluent UI (https://fluent2.microsoft.design)
 *   - Adaptive Cards (https://adaptivecards.io)
 *
 * Each criterion carries a `weight` (relative importance, summed and
 * normalised) and a `score` (0–100 — how well the Jarvis app matches the
 * guideline). The overall percentage is computed, never hardcoded, so the
 * badge stays honest as the app evolves.
 */

export type ComplianceStatus = 'pass' | 'partial' | 'gap'

export interface ComplianceCriterion {
  id: string
  /** Short label for the guideline category. */
  label: string
  /** Relative importance. Normalised against the sum of all weights. */
  weight: number
  /** 0–100 — how closely the implementation matches the Teams guideline. */
  score: number
  /** One-line evidence of what's already in place. */
  summary: string
  /** What to do to take this criterion to 100% (omitted when already 100). */
  recommendation?: string
}

/**
 * The audit. Scores reflect the Jarvis app surface implemented in
 * `web/src/App.jsx` (Today, Conversations, Feed, Skills, brief cards, the
 * chat/Copilot panel, Welcome and Setup).
 */
export const TEAMS_COMPLIANCE_CRITERIA: ComplianceCriterion[] = [
  {
    id: 'fluent-components',
    label: 'Fluent UI components',
    weight: 12,
    score: 70,
    summary:
      'Buttons, cards, lists, inputs and dialogs are custom-built but follow Fluent geometry, spacing and the neutral/brand token palette.',
    recommendation:
      'Adopt the Fluent UI v9 / Teams UI Kit component library (Button, Card, Persona, TabList, Dialog) so behaviour, states and a11y come from the framework instead of bespoke markup.',
  },
  {
    id: 'theming',
    label: 'Theming (Default / Dark / High Contrast)',
    weight: 10,
    score: 95,
    summary:
      'All three Teams themes ship for the app — Default, Dark and High Contrast (black/white/yellow) — selectable from the demo switcher, synced to the Teams chrome; a coreText token keeps buttons readable on the accent.',
    recommendation:
      'Optionally align the brand ramp with a documented Teams-compatible brand (Jarvis purple #5C2E91 vs Teams #5B5FC7) where strict brand conformance is required.',
  },
  {
    id: 'typography',
    label: 'Typography',
    weight: 8,
    score: 95,
    summary:
      'Uses the Segoe UI Variable family with Fluent-scale sizes/weights across headings and body text.',
    recommendation:
      'Drive every text size from named Fluent type-ramp tokens (caption → title) instead of inline pixel values for full consistency.',
  },
  {
    id: 'iconography',
    label: 'Iconography',
    weight: 10,
    score: 95,
    summary:
      'The app now renders Fluent UI System Icons via a size-adapter over @fluentui/react-icons — same glyph family, stroke and metrics as Teams.',
    recommendation:
      'Replace the few closest-match glyphs (leaf, compass, life-buoy) with exact Fluent equivalents or bespoke Fluent-style SVGs.',
  },
  {
    id: 'navigation-layout',
    label: 'Navigation & tab layout',
    weight: 10,
    score: 70,
    summary:
      'Personal-app tab pattern (Today / Conversations / Feed / Skills) with a clear L1 nav and content that fills the stage.',
    recommendation:
      'In a real Teams app, let Teams render the title bar and app rail — drop the simulated chrome so the app content owns the full tab stage, per the tab design guidance.',
  },
  {
    id: 'adaptive-cards',
    label: 'Adaptive Cards & content',
    weight: 8,
    score: 60,
    summary:
      'Agent/Copilot replies and brief items render as bespoke React bubbles and cards.',
    recommendation:
      'Render agent messages and actionable briefs as Adaptive Cards (adaptivecards SDK) so they match how Teams bots/Copilot present content and support Action.Submit.',
  },
  {
    id: 'accessibility',
    label: 'Accessibility (WCAG 2.1 AA)',
    weight: 12,
    score: 70,
    summary:
      'Global focus-visible ring, semantic buttons and several ARIA labels; reduced-motion respected in the Teams chrome.',
    recommendation:
      'Audit the app pages for full keyboard operability, focus order, name/role/value on every control, and AA contrast in all themes; honour prefers-reduced-motion in App.jsx animations.',
  },
  {
    id: 'motion',
    label: 'Motion',
    weight: 6,
    score: 90,
    summary:
      'App animations use the Fluent easy-ease curve and now collapse to a single frame under prefers-reduced-motion (WCAG 2.3.3).',
    recommendation:
      'Re-time the remaining durations to named Fluent motion-duration tokens so timing can’t drift.',
  },
  {
    id: 'responsive',
    label: 'Responsive & adaptive layout',
    weight: 8,
    score: 60,
    summary:
      'Optimised for the desktop Teams stage with fluid max-width content columns.',
    recommendation:
      'Make the app responsive across the Teams breakpoints (narrow desktop, web and mobile) so it reflows rather than assuming a wide stage.',
  },
  {
    id: 'app-icon',
    label: 'App icon & manifest',
    weight: 5,
    score: 95,
    summary:
      'Ships a valid Teams app manifest (teams-manifest.json) with the required icon pair — color (jarvis-icon.png) + transparent outline (jarvis-icon-transparent.png) — accent color and personal-app static tabs.',
    recommendation:
      'Export the icons at the exact required sizes (192px color, 32px outline) and validate the package in the Teams Developer Portal.',
  },
  {
    id: 'dialogs',
    label: 'Dialogs / task modules',
    weight: 5,
    score: 90,
    summary:
      'Modals match Teams dialog metrics — radius-8 surface, header with close, primary/secondary footer, and a flat Fluent scrim (backdrop blur removed).',
    recommendation:
      'Use the Fluent Dialog component so focus-trap, Esc handling and sizing come from the framework.',
  },
  {
    id: 'voice',
    label: 'Content design & voice',
    weight: 6,
    score: 85,
    summary:
      'Concise, human microcopy that asks before acting and stays reversible — close to the Teams voice & tone.',
    recommendation:
      'Pass all strings through the Microsoft writing style guide (sentence case, concise CTAs, consistent terminology) for full alignment.',
  },
]

export interface ComplianceSummary {
  /** Overall weighted percentage, 0–100, rounded to the nearest integer. */
  percent: number
  criteria: ComplianceCriterion[]
  /** Criteria below 100, sorted by the number of points they would recover. */
  recommendations: Array<{
    criterion: ComplianceCriterion
    /** Weighted points (of 100) recoverable by taking this to 100%. */
    points: number
  }>
}

export function statusFor(score: number): ComplianceStatus {
  if (score >= 95) return 'pass'
  if (score >= 70) return 'partial'
  return 'gap'
}

export function computeComplianceSummary(
  criteria: ComplianceCriterion[] = TEAMS_COMPLIANCE_CRITERIA,
): ComplianceSummary {
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0) || 1
  const weighted = criteria.reduce((sum, c) => sum + c.weight * c.score, 0)
  const percent = Math.round(weighted / totalWeight)

  const recommendations = criteria
    .filter((c) => c.score < 100 && c.recommendation)
    .map((c) => ({
      criterion: c,
      points: Math.round(((c.weight * (100 - c.score)) / totalWeight) * 10) / 10,
    }))
    .sort((a, b) => b.points - a.points)

  return { percent, criteria, recommendations }
}
