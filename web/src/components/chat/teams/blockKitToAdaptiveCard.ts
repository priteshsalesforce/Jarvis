import { slackToAdaptiveText } from './cardMappers'

type Json = Record<string, unknown>

/**
 * Convert a Slack Block Kit `blocks[]` payload to an Adaptive Card 1.5 body.
 *
 * Handles the subset used by the bundled `src/slackbot-templates`:
 *   header, section (with text/fields/accessory image/button), context, divider,
 *   actions (button with primary/danger style), image.
 *
 * Unknown block/element types are dropped silently — the demos never depend on
 * Slack-only widgets like `input` blocks for which there's no clean Adaptive
 * Card equivalent.
 */
export function blockKitToAdaptiveCard(
  blocks: unknown[],
  options: { actioned?: boolean } = {}
): Json {
  const body: Json[] = []
  for (const block of blocks) {
    const mapped = mapBlock(block, options)
    if (Array.isArray(mapped)) body.push(...mapped)
    else if (mapped) body.push(mapped)
  }
  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.5',
    body,
  }
}

function mapBlock(block: unknown, options: { actioned?: boolean }): Json | Json[] | null {
  if (!block || typeof block !== 'object') return null
  const b = block as Json
  switch (b.type) {
    case 'header':
      return mapHeader(b)
    case 'image':
      return mapImage(b)
    case 'divider':
      return { type: 'TextBlock', text: '', separator: true, spacing: 'medium' }
    case 'section':
      return mapSection(b)
    case 'context':
      return mapContext(b)
    case 'actions':
      return options.actioned ? null : mapActions(b)
    default:
      return null
  }
}

function mapHeader(b: Json): Json | null {
  const text = (b.text as Json | undefined)?.text
  if (typeof text !== 'string') return null
  return {
    type: 'TextBlock',
    text: slackToAdaptiveText(text),
    weight: 'bolder',
    size: 'large',
    wrap: true,
  }
}

function mapImage(b: Json): Json | null {
  if (typeof b.image_url !== 'string') return null
  return {
    type: 'Image',
    url: b.image_url,
    altText: typeof b.alt_text === 'string' ? b.alt_text : undefined,
    spacing: 'small',
    size: 'stretch',
  }
}

function mapSection(b: Json): Json | Json[] | null {
  const text = b.text as Json | undefined
  const fields = Array.isArray(b.fields) ? (b.fields as Json[]) : []
  const accessory = b.accessory as Json | undefined
  const items: Json[] = []

  if (text && typeof text.text === 'string') {
    items.push({
      type: 'TextBlock',
      text: slackToAdaptiveText(text.text),
      wrap: true,
      size: 'default',
    })
  }

  if (fields.length > 0) {
    items.push({
      type: 'FactSet',
      spacing: 'small',
      facts: fields
        .filter((f) => typeof f.text === 'string')
        .map((f) => {
          const parts = (f.text as string).split(/:\n|:\s+/)
          const title = parts[0]?.replace(/[\*~]/g, '').trim() || 'Field'
          const value = parts.slice(1).join(': ').trim() || (f.text as string)
          return { title, value }
        }),
    })
  }

  if (accessory) {
    const mappedAccessory = mapAccessory(accessory)
    if (mappedAccessory) items.push(mappedAccessory)
  }

  if (items.length === 0) return null

  // When there's an accessory image, group as a ColumnSet to mirror Block Kit's right-aligned thumbnail.
  if (accessory && (accessory as Json).type === 'image' && items.length >= 2) {
    const last = items[items.length - 1]
    const main = items.slice(0, -1)
    return {
      type: 'ColumnSet',
      columns: [
        { type: 'Column', width: 'stretch', items: main },
        { type: 'Column', width: 'auto', items: [last] },
      ],
    }
  }
  return items
}

function mapAccessory(accessory: Json): Json | null {
  if (accessory.type === 'image' && typeof accessory.image_url === 'string') {
    return {
      type: 'Image',
      url: accessory.image_url,
      altText: typeof accessory.alt_text === 'string' ? accessory.alt_text : undefined,
      size: 'small',
      width: '120px',
    }
  }
  if (accessory.type === 'button') {
    const label = (accessory.text as Json | undefined)?.text
    if (typeof label !== 'string') return null
    return {
      type: 'ActionSet',
      spacing: 'small',
      actions: [
        {
          type: 'Action.Submit',
          title: label,
          data: { choice: label },
        },
      ],
    }
  }
  return null
}

function mapContext(b: Json): Json | null {
  const elements = (b.elements as unknown[] | undefined) ?? []
  const parts: string[] = []
  for (const el of elements) {
    if (!el || typeof el !== 'object') continue
    const e = el as Json
    if ((e.type === 'mrkdwn' || e.type === 'plain_text') && typeof e.text === 'string') {
      parts.push(slackToAdaptiveText(e.text))
    }
  }
  if (parts.length === 0) return null
  return {
    type: 'TextBlock',
    text: parts.join('  ·  '),
    wrap: true,
    isSubtle: true,
    size: 'small',
    spacing: 'small',
  }
}

function mapActions(b: Json): Json | null {
  const elements = (b.elements as unknown[] | undefined) ?? []
  const actions: Json[] = []
  for (const el of elements) {
    if (!el || typeof el !== 'object') continue
    const e = el as Json
    if (e.type !== 'button') continue
    const label = (e.text as Json | undefined)?.text
    if (typeof label !== 'string') continue
    const style = typeof e.style === 'string' ? e.style : undefined
    actions.push({
      type: 'Action.Submit',
      title: label,
      style:
        style === 'primary'
          ? 'positive'
          : style === 'danger'
            ? 'destructive'
            : 'default',
      data: { choice: label },
    })
  }
  if (actions.length === 0) return null
  return { type: 'ActionSet', spacing: 'medium', actions }
}
