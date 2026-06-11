import { useEffect, useRef } from 'react'
import * as AdaptiveCards from 'adaptivecards'

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

const hostConfig = new AdaptiveCards.HostConfig({
  fontFamily:
    "'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif",
  spacing: { small: 4, default: 8, medium: 16, large: 20, extraLarge: 24, padding: 12 },
  separator: { lineThickness: 1, lineColor: '#e1dfdd' },
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
    default: {
      backgroundColor: '#ffffff',
      foregroundColors: {
        default: { default: '#242424', subtle: '#616161' },
        accent: { default: '#5b5fc7', subtle: '#5b5fc7' },
        good: { default: '#107c10', subtle: '#107c10' },
        warning: { default: '#a4262c', subtle: '#a4262c' },
        attention: { default: '#c4314b', subtle: '#c4314b' },
        dark: { default: '#242424', subtle: '#616161' },
        light: { default: '#ffffff', subtle: '#f5f5f5' },
      },
    },
    emphasis: {
      backgroundColor: '#fafafa',
      foregroundColors: {
        default: { default: '#242424', subtle: '#616161' },
        accent: { default: '#5b5fc7', subtle: '#5b5fc7' },
        good: { default: '#107c10', subtle: '#107c10' },
        warning: { default: '#a4262c', subtle: '#a4262c' },
        attention: { default: '#c4314b', subtle: '#c4314b' },
        dark: { default: '#242424', subtle: '#616161' },
        light: { default: '#ffffff', subtle: '#f5f5f5' },
      },
    },
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
    title: {
      color: 'default',
      size: 'default',
      weight: 'bolder',
      wrap: true,
      maxWidth: 150,
    },
    value: {
      color: 'default',
      size: 'default',
      weight: 'default',
      wrap: true,
    },
    spacing: 8,
  },
})

export function TeamsAdaptiveCard({ card, onAction }: TeamsAdaptiveCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const ac = new AdaptiveCards.AdaptiveCard()
    ac.hostConfig = hostConfig
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
  }, [card, onAction])

  return <div ref={containerRef} className="teams-adaptive-card" />
}
