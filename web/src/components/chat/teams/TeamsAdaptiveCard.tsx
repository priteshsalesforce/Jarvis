import { useEffect, useRef } from 'react'
import * as AdaptiveCards from 'adaptivecards'
import { useTeamsTheme } from '@/utils/teamsTheme'

interface TeamsAdaptiveCardProps {
  /** Adaptive Card JSON payload (https://adaptivecards.io) */
  card: Record<string, unknown>
  /** Invoked when a user clicks an Action.Submit. Receives the action's `data` field. */
  onAction?: (action: { id?: string; title?: string; data?: unknown }) => void
}

/**
 * Escape HTML special chars in user-supplied text so the markdown processor
 * can safely emit HTML tags around it.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Minimal Markdown → HTML processor wired into Adaptive Cards via
 * `AdaptiveCard.onProcessMarkdown`. Handles the subset our demos use:
 *   **bold** · *italic* · • bullet lines · [text](url) · single line breaks
 *
 * We intentionally avoid pulling in `markdown-it` to keep the bundle small;
 * the demos never use the long tail of markdown features.
 */
function processMarkdown(rawText: string): string {
  let html = escapeHtml(rawText)
  // Bold: **text** (run BEFORE italic so single * doesn't swallow it)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  // Italic: *text*
  html = html.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
  // Links: [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  )
  // Bullet list — group consecutive lines beginning with "•" or "- " into <ul>
  html = html.replace(/((?:^|\n)(?:•|- )[^\n]+(?:\n(?:•|- )[^\n]+)*)/g, (block) => {
    const items = block
      .trim()
      .split('\n')
      .map((line) => `<li>${line.replace(/^(?:•|- )\s*/, '')}</li>`)
      .join('')
    return `\n<ul class="teams-ac-list">${items}</ul>`
  })
  // Convert blank-line breaks to paragraph spacing
  html = html.replace(/\n\n+/g, '</p><p>')
  // Convert single line breaks to <br>
  html = html.replace(/\n/g, '<br>')
  return `<p>${html}</p>`
}

// Adaptive Cards is a singleton API — register the processor once.
AdaptiveCards.AdaptiveCard.onProcessMarkdown = (text, result) => {
  result.outputHtml = processMarkdown(text)
  result.didProcess = true
}

/**
 * Per-theme color palettes for the Adaptive Card host config. Teams renders
 * cards with theme-matched container styles, so we build one host config per
 * theme (Default / Dark / High-Contrast) and pick the live one at render.
 */
const CARD_PALETTES = {
  light: {
    canvas: '#ffffff',
    emphasis: '#fafafa',
    text: '#242424',
    subtle: '#616161',
    accent: '#5b5fc7',
    good: '#107c10',
    warning: '#a4262c',
    attention: '#c4314b',
    separator: '#e1dfdd',
  },
  dark: {
    canvas: '#2b2b2b',
    emphasis: '#333333',
    text: '#ffffff',
    subtle: '#c8c8c8',
    accent: '#a6a7dc',
    good: '#92c353',
    warning: '#ffaa44',
    attention: '#e37287',
    separator: '#404040',
  },
  contrast: {
    canvas: '#000000',
    emphasis: '#000000',
    text: '#ffffff',
    subtle: '#ffffff',
    accent: '#ffff00',
    good: '#3ff23f',
    warning: '#ffd700',
    attention: '#ff99a4',
    separator: '#ffffff',
  },
} as const

type CardTheme = keyof typeof CARD_PALETTES

function makeHostConfig(theme: CardTheme): AdaptiveCards.HostConfig {
  const p = CARD_PALETTES[theme]
  const fg = {
    default: { default: p.text, subtle: p.subtle },
    accent: { default: p.accent, subtle: p.accent },
    good: { default: p.good, subtle: p.good },
    warning: { default: p.warning, subtle: p.warning },
    attention: { default: p.attention, subtle: p.attention },
    dark: { default: p.text, subtle: p.subtle },
    light: { default: p.canvas, subtle: p.emphasis },
  }
  return new AdaptiveCards.HostConfig({
    fontFamily:
      "'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif",
    spacing: { small: 4, default: 8, medium: 16, large: 20, extraLarge: 24, padding: 12 },
    separator: { lineThickness: 1, lineColor: p.separator },
    supportsInteractivity: true,
    fontTypes: {
      default: {
        fontFamily:
          "'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif",
        fontSizes: { small: 12, default: 14, medium: 16, large: 20, extraLarge: 24 },
        fontWeights: { lighter: 200, default: 400, bolder: 600 },
      },
      monospace: {
        fontFamily: "'Cascadia Code', 'Consolas', monospace",
        fontSizes: { small: 12, default: 14, medium: 16, large: 20, extraLarge: 24 },
        fontWeights: { lighter: 200, default: 400, bolder: 600 },
      },
    },
    containerStyles: {
      default: { backgroundColor: p.canvas, foregroundColors: fg },
      emphasis: { backgroundColor: p.emphasis, foregroundColors: fg },
    },
    actions: {
      maxActions: 5,
      spacing: 'default',
      buttonSpacing: 8,
      showCard: { actionMode: 'inline', inlineTopMargin: 8 },
      actionsOrientation: 'horizontal',
      actionAlignment: 'left',
    },
    factSet: {
      title: { color: 'default', size: 'default', weight: 'bolder', wrap: true, maxWidth: 150 },
      value: { color: 'default', size: 'default', weight: 'default', wrap: true },
      spacing: 8,
    },
  })
}

const HOST_CONFIGS: Record<CardTheme, AdaptiveCards.HostConfig> = {
  light: makeHostConfig('light'),
  dark: makeHostConfig('dark'),
  contrast: makeHostConfig('contrast'),
}

export function TeamsAdaptiveCard({ card, onAction }: TeamsAdaptiveCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { mode } = useTeamsTheme()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const ac = new AdaptiveCards.AdaptiveCard()
    ac.hostConfig = HOST_CONFIGS[mode]
    ac.onExecuteAction = (action) => {
      if (!onAction) return
      const submit = action as AdaptiveCards.SubmitAction
      onAction({
        id: action.id,
        title: action.title,
        data: typeof submit.data !== 'undefined' ? submit.data : undefined,
      })
    }

    try {
      ac.parse(card)
      const rendered = ac.render()
      container.innerHTML = ''
      if (rendered) container.appendChild(rendered)
    } catch (err) {
      console.error('[TeamsAdaptiveCard] failed to render', err)
    }

    return () => {
      container.innerHTML = ''
    }
  }, [card, onAction, mode])

  return <div ref={containerRef} className="teams-adaptive-card" />
}
