/**
 * Slack-template → Adaptive Card JSON mappers.
 *
 * Each existing Slack `templateId` is translated into an Adaptive Card 1.5
 * payload styled to match Teams' native cards.
 */

export type CardPayload = Record<string, unknown>

interface MapperContext {
  /** Choices to render as ActionSet buttons (from message.choices). */
  choices?: string[]
  /** When true, the card was already actioned (e.g. OAuth connected) — hide buttons. */
  actioned?: boolean
}

/** Strip Slack-specific markup so plain text renders correctly in Adaptive Cards. */
export function slackToAdaptiveText(input: string): string {
  if (!input) return ''
  return (
    input
      // Slack emoji codes — keep the colon form, browsers render emoji naturally
      .replace(/:white_check_mark:/g, '✅')
      .replace(/:tada:/g, '🎉')
      .replace(/:baby:/g, '👶')
      .replace(/:x:/g, '❌')
      .replace(/:warning:/g, '⚠️')
      .replace(/:rocket:/g, '🚀')
      .replace(/:wave:/g, '👋')
      .replace(/:thumbsup:/g, '👍')
      .replace(/:thumbsdown:/g, '👎')
      // Slack *bold* → markdown **bold** (Adaptive Cards supports markdown via TextBlock)
      .replace(/(^|[\s(])\*([^*\n]+?)\*(?=$|[\s.,!?:;)])/g, '$1**$2**')
      // Slack _italic_ → markdown *italic*
      .replace(/(^|[\s(])_([^_\n]+?)_(?=$|[\s.,!?:;)])/g, '$1*$2*')
  )
}

function actionSet(choices: string[] | undefined): CardPayload | null {
  if (!choices || choices.length === 0) return null
  return {
    type: 'ActionSet',
    spacing: 'medium',
    actions: choices.map((label, idx) => ({
      type: 'Action.Submit',
      title: label,
      // First action gets the primary style; positive = brand purple in our host config.
      style: idx === 0 ? 'positive' : 'default',
      data: { choice: label },
    })),
  }
}

/** Generic Slack-like text + optional buttons (used for `plain_text` and `text_with_buttons`). */
export function buildTextCard(text: string, ctx: MapperContext = {}): CardPayload {
  const body: CardPayload[] = []
  const cleanText = slackToAdaptiveText(text)
  if (cleanText.trim().length > 0) {
    body.push({
      type: 'TextBlock',
      text: cleanText,
      wrap: true,
      size: 'default',
      color: 'default',
    })
  }
  const actions = !ctx.actioned ? actionSet(ctx.choices) : null
  if (actions) body.push(actions)
  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.5',
    body,
  }
}

/** Case construct (Slack `construct_case`) → Adaptive Card with FactSet. */
export function buildCaseCard(content: {
  caseTitle?: string
  caseFields?: { label: string; value: string }[]
  caseStatus?: string
  caseNote?: string
  caseAvatarUrl?: string
  text?: string
}, ctx: MapperContext = {}): CardPayload {
  const body: CardPayload[] = []

  if (content.caseTitle) {
    body.push({
      type: 'TextBlock',
      text: slackToAdaptiveText(content.caseTitle),
      weight: 'bolder',
      size: 'medium',
      wrap: true,
    })
  }

  if (content.text) {
    body.push({
      type: 'TextBlock',
      text: slackToAdaptiveText(content.text),
      wrap: true,
      spacing: 'small',
    })
  }

  if (content.caseStatus) {
    body.push({
      type: 'TextBlock',
      text: `**Status:** ${content.caseStatus}`,
      wrap: true,
      color: 'accent',
      spacing: 'small',
    })
  }

  if (content.caseFields && content.caseFields.length > 0) {
    body.push({
      type: 'FactSet',
      spacing: 'medium',
      facts: content.caseFields.map((f) => ({ title: f.label, value: f.value })),
    })
  }

  if (content.caseNote) {
    body.push({
      type: 'TextBlock',
      text: slackToAdaptiveText(content.caseNote),
      wrap: true,
      isSubtle: true,
      size: 'small',
      spacing: 'medium',
    })
  }

  const actions = !ctx.actioned ? actionSet(ctx.choices) : null
  if (actions) body.push(actions)

  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.5',
    body,
  }
}

/** Connect OAuth card → branded "connect" card with allow action. */
export function buildConnectOAuthCard(content: {
  connectCardTitle?: string
  connectCardBody?: string
  connectCardFooter?: string
  connectConnectedTitle?: string
  connectConnectedBody?: string
  oauthIntegrationLogoUrl?: string
  oauthIntegrationName?: string
}, ctx: MapperContext = {}): CardPayload {
  if (ctx.actioned) {
    return {
      type: 'AdaptiveCard',
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      version: '1.5',
      body: [
        {
          type: 'ColumnSet',
          columns: [
            {
              type: 'Column',
              width: 'auto',
              items: [
                { type: 'TextBlock', text: '✅', size: 'large' },
              ],
            },
            {
              type: 'Column',
              width: 'stretch',
              items: [
                {
                  type: 'TextBlock',
                  text: content.connectConnectedTitle ?? `${content.oauthIntegrationName ?? 'App'} connected`,
                  weight: 'bolder',
                  wrap: true,
                  color: 'good',
                },
                content.connectConnectedBody && {
                  type: 'TextBlock',
                  text: slackToAdaptiveText(content.connectConnectedBody),
                  wrap: true,
                  isSubtle: true,
                  spacing: 'small',
                },
              ].filter(Boolean),
            },
          ],
        },
      ],
    }
  }

  const body: CardPayload[] = []

  body.push({
    type: 'ColumnSet',
    columns: [
      content.oauthIntegrationLogoUrl
        ? {
            type: 'Column',
            width: 'auto',
            items: [
              {
                type: 'Image',
                url: content.oauthIntegrationLogoUrl,
                size: 'small',
                style: 'default',
              },
            ],
          }
        : {
            type: 'Column',
            width: 'auto',
            items: [{ type: 'TextBlock', text: '🔗', size: 'large' }],
          },
      {
        type: 'Column',
        width: 'stretch',
        items: [
          {
            type: 'TextBlock',
            text: content.connectCardTitle ?? `Connect ${content.oauthIntegrationName ?? 'app'}`,
            weight: 'bolder',
            size: 'medium',
            wrap: true,
          },
          content.connectCardBody && {
            type: 'TextBlock',
            text: slackToAdaptiveText(content.connectCardBody),
            wrap: true,
            spacing: 'small',
          },
        ].filter(Boolean),
      },
    ],
  })

  if (content.connectCardFooter) {
    body.push({
      type: 'TextBlock',
      text: slackToAdaptiveText(content.connectCardFooter),
      wrap: true,
      isSubtle: true,
      size: 'small',
      spacing: 'medium',
    })
  }

  const actions = actionSet(ctx.choices ?? ['Connect'])
  if (actions) body.push(actions)

  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.5',
    body,
  }
}
