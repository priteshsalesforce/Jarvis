import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AddRegular,
  ArrowReplyRegular,
  ArrowRightRegular,
  AttachRegular,
  ChevronDownRegular,
  CopilotLineRegular,
  CopyRegular,
  EditLineHorizontal3Regular,
  EmojiAddRegular,
  EmojiRegular,
  ImageRegular,
  LoopRegular,
  MicRegular,
  MoreHorizontalRegular,
  SendFilled,
  ShareRegular,
  ThumbDislikeRegular,
  ThumbLikeRegular,
} from '@/components/icons/teams'
import { asset } from '@/utils/asset'
import type { ChatMessagePayload } from '@/types/chatMessage'
import { formatMessageWithMentions } from '@/components/chat/formatMessageWithMentions'
import { TeamsAdaptiveCard } from './TeamsAdaptiveCard'
import { buildCaseCard, buildConnectOAuthCard, buildTextCard, slackToAdaptiveText } from './cardMappers'
import { blockKitToAdaptiveCard } from './blockKitToAdaptiveCard'
import { getSlackBlockTemplateById } from '@/slackbot-templates/registry'
import { renderSlackTemplate } from '@/slackbot-templates/renderTemplate'
import { getFixtureForBlockKitTemplate } from '@/slackbot-templates/fixtures'

interface TeamsChatViewProps {
  messages: ChatMessagePayload[]
  pendingUserMessage?: { text: string; author: string; avatarUrl?: string }
  showThinking?: boolean
  thinkingStatusText?: string
  /** Render label for app persona (Slackbot, Employee Agent, etc.). Used when message.isApp. */
  appName: string
  /** App persona avatar URL used as fallback. */
  appAvatarUrl: string
  /** The author name that represents "me" — messages from this author render as outgoing bubbles. */
  selfAuthor?: string
  /** Send button callback for the pending user message — advances the demo. */
  onSend?: () => void
  /** Action button (choice / Adaptive Card Action.Submit) callback. */
  onChoiceClick?: (choice: string) => void
  /** Render the conversation as Microsoft Copilot's dedicated panel —
   *  inline "Copilot" header instead of avatar+App tag, plain markdown body
   *  with an action toolbar in place of the bubble, pill composer with
   *  round purple send + "AI-generated content may be incorrect" footer. */
  isCopilotPanel?: boolean
}

const USER_TYPING_MS_PER_CHAR = 50
const BOT_TYPING_MS_PER_CHAR = 10

function useCharTyping(fullText: string, active: boolean, msPerChar: number, onTick?: () => void): number {
  const [visible, setVisible] = useState(0)
  const tickRef = useRef(onTick)
  tickRef.current = onTick

  useEffect(() => {
    if (!active) {
      setVisible(fullText.length)
      return
    }
    if (fullText.length === 0) {
      setVisible(0)
      return
    }
    setVisible(0)
    let i = 0
    const t = window.setInterval(() => {
      i++
      setVisible(i)
      tickRef.current?.()
      if (i >= fullText.length) window.clearInterval(t)
    }, msPerChar)
    return () => window.clearInterval(t)
  }, [active, fullText, msPerChar])

  return visible
}

interface AnnotatedMessage {
  message: ChatMessagePayload
  isSelf: boolean
  showHeader: boolean
  /** Last outgoing message in the stream — renders the "read" receipt. */
  isLastOutgoing: boolean
}

/**
 * Tag each non-divider message with self/incoming + whether it's the first of
 * a consecutive run by the same author. Additionally tag the most recent
 * outgoing message so we can render a "read" receipt on it (matches the
 * Teams desktop pattern).
 */
function annotateMessages(messages: ChatMessagePayload[], selfAuthor?: string): AnnotatedMessage[] {
  let prevKey: string | null = null
  const annotated: AnnotatedMessage[] = messages.map((m) => {
    if (m.isNewDivider) {
      prevKey = null
      return { message: m, isSelf: false, showHeader: true, isLastOutgoing: false }
    }
    const isSelf = !m.isApp && Boolean(selfAuthor) && m.author === selfAuthor
    const key = (m.isApp ? 'app:' : 'user:') + m.author
    const showHeader = key !== prevKey
    prevKey = key
    return { message: m, isSelf, showHeader, isLastOutgoing: false }
  })

  // Walk backwards to find the most recent outgoing message and flag it.
  for (let i = annotated.length - 1; i >= 0; i--) {
    if (annotated[i].isSelf && !annotated[i].message.isNewDivider) {
      annotated[i].isLastOutgoing = true
      break
    }
  }

  return annotated
}

export function TeamsChatView({
  messages,
  pendingUserMessage,
  showThinking,
  thinkingStatusText,
  appName,
  appAvatarUrl,
  selfAuthor,
  onSend,
  onChoiceClick,
  isCopilotPanel,
}: TeamsChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollToBottom = () => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }

  const pendingText = pendingUserMessage?.text ?? ''
  const userTypedLen = useCharTyping(pendingText, Boolean(pendingUserMessage), USER_TYPING_MS_PER_CHAR, scrollToBottom)
  const userTypedDone = pendingUserMessage ? userTypedLen >= pendingText.length : false

  useEffect(() => {
    scrollToBottom()
  }, [messages, userTypedLen, showThinking])

  const annotated = useMemo(() => annotateMessages(messages, selfAuthor), [messages, selfAuthor])

  const latestAppMessage = [...messages].reverse().find((m) => m.isApp && !m.isNewDivider)
  const typingBotMessageId = latestAppMessage?.id

  /* NOTE: rendered as a fragment so the stream + composer become direct
   * children of the shell's <main className="teams-main"> flex container.
   * The previous nested <div className="teams-main"> wrapper had no flex
   * sizing, which made the stream collapse and the composer drift up under
   * the conversation header instead of sticking to the bottom. */
  return (
    <>
      <div className={`teams-stream ${isCopilotPanel ? 'teams-stream--copilot' : ''}`} ref={scrollRef}>
        <div className="teams-stream__spacer" />
        <DateDivider label="Today" />
        {annotated.map(({ message: msg, isSelf, showHeader, isLastOutgoing }) =>
          msg.isNewDivider ? (
            <NewDivider key={msg.id} />
          ) : (
            <TeamsMessage
              key={msg.id}
              message={msg}
              isSelf={isSelf}
              showHeader={showHeader}
              isLastOutgoing={isLastOutgoing}
              appName={appName}
              appAvatarUrl={appAvatarUrl}
              onChoiceClick={onChoiceClick}
              typingActive={msg.isApp === true && msg.id === typingBotMessageId}
              onTypingTick={scrollToBottom}
              isCopilotPanel={isCopilotPanel}
            />
          )
        )}
        {showThinking && (
          isCopilotPanel
            ? <CopilotThinkingRow status={thinkingStatusText} />
            : <ThinkingRow appName={appName} appAvatarUrl={appAvatarUrl} status={thinkingStatusText} />
        )}
      </div>

      <Composer
        pendingUserMessage={pendingUserMessage}
        pendingText={pendingText}
        typedLen={userTypedLen}
        typedDone={userTypedDone}
        onSend={onSend}
        isCopilotPanel={isCopilotPanel}
      />
    </>
  )
}

function Composer({
  pendingUserMessage,
  pendingText,
  typedLen,
  typedDone,
  onSend,
  isCopilotPanel,
}: {
  pendingUserMessage?: { text: string; author: string; avatarUrl?: string }
  pendingText: string
  typedLen: number
  typedDone: boolean
  onSend?: () => void
  isCopilotPanel?: boolean
}) {
  const ready = Boolean(pendingUserMessage && typedDone)

  if (isCopilotPanel) {
    return (
      <div className="teams-composer teams-composer--copilot">
        <div className="teams-composer__copilot-box">
          <div
            className={`teams-composer__input teams-composer__input--copilot ${pendingUserMessage ? '' : 'teams-composer__input--placeholder'}`}
          >
            {pendingUserMessage ? (
              <span>
                {pendingText.slice(0, typedLen)}
                {!typedDone && <span className="teams-composer__caret" />}
              </span>
            ) : (
              <span>Message Copilot</span>
            )}
          </div>
          <div className="teams-composer__copilot-actions">
            <button className="teams-composer__copilot-icon-btn" type="button" tabIndex={-1} aria-label="More options">
              <AddRegular size={20} />
            </button>
            <span className="teams-composer__copilot-spacer" aria-hidden />
            <button className="teams-composer__copilot-icon-btn" type="button" tabIndex={-1} aria-label="Voice input">
              <MicRegular size={18} />
            </button>
            <button
              type="button"
              className={`teams-composer__copilot-send ${ready ? 'teams-composer__copilot-send--ready' : 'teams-composer__copilot-send--idle'}`}
              onClick={ready ? onSend : undefined}
              tabIndex={ready ? 0 : -1}
              aria-label="Send"
              disabled={!ready}
            >
              <ArrowRightRegular size={18} />
            </button>
          </div>
        </div>
        <div className="teams-composer__copilot-footer">AI-generated content may be incorrect</div>
      </div>
    )
  }

  return (
    <div className="teams-composer">
      <div className="teams-composer__box">
        <div
          className={`teams-composer__input ${pendingUserMessage ? '' : 'teams-composer__input--placeholder'}`}
        >
          {pendingUserMessage ? (
            <span>
              {pendingText.slice(0, typedLen)}
              {!typedDone && <span className="teams-composer__caret" />}
            </span>
          ) : (
            <span>Type a message</span>
          )}
        </div>
        <div className="teams-composer__actions">
          <button className="teams-composer__fmt-btn" type="button" tabIndex={-1} aria-label="Emoji">
            <EmojiRegular size={18} />
          </button>
          <button className="teams-composer__fmt-btn" type="button" tabIndex={-1} aria-label="Attach">
            <AttachRegular size={18} />
          </button>
          <button className="teams-composer__fmt-btn" type="button" tabIndex={-1} aria-label="Insert image">
            <ImageRegular size={18} />
          </button>
          <button className="teams-composer__fmt-btn" type="button" tabIndex={-1} aria-label="Loop component">
            <LoopRegular size={18} />
          </button>
          <button className="teams-composer__fmt-btn" type="button" tabIndex={-1} aria-label="Apps">
            <AddRegular size={18} />
          </button>
          <span className="teams-composer__divider" aria-hidden />
          <button
            type="button"
            className={`teams-composer__send ${ready ? 'teams-composer__send--ready' : 'teams-composer__send--idle'}`}
            onClick={ready ? onSend : undefined}
            tabIndex={ready ? 0 : -1}
            aria-label="Send"
            disabled={!ready}
          >
            <SendFilled size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

function DateDivider({ label }: { label: string }) {
  return (
    <div className="teams-date-divider" aria-hidden>
      <span className="teams-date-divider__label">{label}</span>
      <div className="teams-date-divider__line" />
    </div>
  )
}

function NewDivider() {
  return (
    <div className="teams-new-divider" aria-hidden>
      <div className="teams-new-divider__line" />
      <span className="teams-new-divider__label">New</span>
      <div className="teams-new-divider__line" />
    </div>
  )
}

function ThinkingRow({ appName, appAvatarUrl, status }: { appName: string; appAvatarUrl: string; status?: string }) {
  return (
    <div className="teams-msg teams-msg--incoming teams-msg--first">
      <div className="teams-msg__avatar">
        <img src={appAvatarUrl} alt="" />
      </div>
      <div className="teams-msg__body">
        <div className="teams-msg__head">
          <span className="teams-msg__name">{appName}</span>
          <span className="teams-msg__app-tag">App</span>
          <span className="teams-msg__time">just now</span>
        </div>
        <div className="teams-msg__bubble">
          <span className="teams-typing">
            <span>{status ?? 'Typing'}</span>
            <span className="teams-typing__dot" />
            <span className="teams-typing__dot" />
            <span className="teams-typing__dot" />
          </span>
        </div>
      </div>
    </div>
  )
}

/* Quick-reaction strip that appears above any message on hover. The four
 * left-most buttons render Microsoft's colored 3D Fluent Emoji PNGs (shipped
 * under public/assets/reactions/); the right-side cluster uses the outline
 * Fluent icons so it inherits the toolbar's text color. The whole strip is
 * decorative — every button is tabIndex={-1} and aria-hidden, same as the
 * rest of the Teams chrome in this demo. */
function ReactionsStrip() {
  const emoji = (file: string, label: string) => (
    <button
      className="teams-msg__reaction-btn teams-msg__reaction-btn--emoji"
      type="button"
      tabIndex={-1}
      title={label}
    >
      <img src={asset(`/assets/reactions/${file}`)} alt="" aria-hidden draggable={false} />
    </button>
  )
  return (
    <div className="teams-msg__reactions" aria-hidden>
      {emoji('thumbs-up.png', 'Like')}
      {emoji('heart.png', 'Heart')}
      {emoji('laugh.png', 'Laugh')}
      {emoji('wow.png', 'Wow')}
      <button className="teams-msg__reaction-btn" type="button" tabIndex={-1} title="Add reaction">
        <EmojiAddRegular size={18} />
      </button>
      <span className="teams-msg__reaction-divider" />
      <button className="teams-msg__reaction-btn" type="button" tabIndex={-1} title="Reply">
        <ArrowReplyRegular size={18} />
      </button>
      <button className="teams-msg__reaction-btn" type="button" tabIndex={-1} title="More">
        <MoreHorizontalRegular size={18} />
      </button>
    </div>
  )
}

function UserAvatarImg({ author, avatarUrl }: { author: string; avatarUrl?: string }) {
  const [failed, setFailed] = useState(false)
  if (!avatarUrl || failed) {
    return <span>{author.slice(0, 2).toUpperCase()}</span>
  }
  return <img src={avatarUrl} alt="" onError={() => setFailed(true)} />
}

/** Eye-shaped read receipt — small grey indicator in the bottom-right of the
 *  most recent outgoing message (matches new Teams desktop).
 */
function ReadReceiptIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden focusable="false">
      <path
        d="M7 3.5C4 3.5 1.6 5.3 0.6 6.7c-0.2 0.3-0.2 0.7 0 0.9C1.6 8.7 4 10.5 7 10.5s5.4-1.8 6.4-3.2c0.2-0.3 0.2-0.7 0-0.9C12.4 5 9.9 3.5 7 3.5z"
        stroke="currentColor"
        strokeWidth="0.9"
        fill="none"
      />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" />
    </svg>
  )
}

function TeamsMessage({
  message,
  isSelf,
  showHeader,
  isLastOutgoing,
  appName,
  appAvatarUrl,
  onChoiceClick,
  typingActive,
  onTypingTick,
  isCopilotPanel,
}: {
  message: ChatMessagePayload
  isSelf: boolean
  showHeader: boolean
  isLastOutgoing: boolean
  appName: string
  appAvatarUrl: string
  onChoiceClick?: (choice: string) => void
  typingActive?: boolean
  onTypingTick?: () => void
  isCopilotPanel?: boolean
}) {
  const isApp = message.isApp === true
  const personaNames = (message.personaNames as string[] | undefined) ?? []
  const rawText = message.text ?? ''
  const typingLen = useCharTyping(rawText, Boolean(isApp && typingActive && rawText.length > 0), BOT_TYPING_MS_PER_CHAR, onTypingTick)
  const typingComplete = typingLen >= rawText.length

  const templateId = message.templateId
  const templateContent = (message.templateContent ?? {}) as Record<string, unknown>
  const choices = (templateContent.choices as string[] | undefined) ?? message.choices
  const oauthConnected = Boolean(templateContent.oauthConnected)

  const displayName = isApp ? message.author || appName : message.author
  /* In the Copilot panel we never render Adaptive Cards — Copilot replies are
   * always rendered as inline markdown text. Other agents still card-up. */
  const showAdaptiveCard = isApp && !isCopilotPanel && typingComplete && shouldRenderAsCard(templateId, templateContent)
  const hasBubbleText = !showAdaptiveCard && rawText.length > 0

  /* Copilot-panel render path: an incoming app message becomes an inline
   * "Copilot" header + markdown body + action toolbar (no avatar, no bubble,
   * no card). Outgoing user messages keep a bubble but drop the timestamp
   * column to match the new Teams Copilot panel. */
  if (isCopilotPanel && isApp) {
    const visibleText = typingActive ? rawText.slice(0, typingLen) : rawText
    return (
      <div className="teams-msg teams-msg--copilot-reply">
        {/* Always show the Copilot logo + label on every reply, even when
            multiple Copilot turns are sent back-to-back. Matches the new
            Teams desktop, which doesn't collapse Copilot streaks the way a
            human chat does. */}
        <div className="teams-msg__copilot-head">
          <CopilotLineRegular size={20} />
          <span className="teams-msg__copilot-name">Copilot</span>
        </div>
        <div className="teams-msg__copilot-body">
          <CopilotMarkdown text={slackToAdaptiveText(visibleText)} personaNames={personaNames} />
        </div>
        {!showAdaptiveCard && choices && choices.length > 0 && typingComplete && (
          <div className="teams-msg__choices teams-msg__choices--copilot">
            {choices.map((c, idx) => (
              <button
                key={c}
                type="button"
                className={`teams-action-btn ${idx === 0 ? '' : 'teams-action-btn--secondary'}`}
                onClick={() => onChoiceClick?.(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        {typingComplete && rawText.length > 0 && <CopilotReplyToolbar />}
      </div>
    )
  }

  const handleCardAction = (action: { id?: string; title?: string; data?: unknown }) => {
    const data = action.data as { choice?: string } | undefined
    const choice = data?.choice ?? action.title
    if (choice) onChoiceClick?.(choice)
  }

  const handleButtonClick = (choice: string) => {
    onChoiceClick?.(choice)
  }

  const dirClass = isSelf ? 'teams-msg--outgoing' : 'teams-msg--incoming'
  const firstClass = showHeader ? 'teams-msg--first' : 'teams-msg--continued'
  const copilotOutClass = isCopilotPanel && isSelf ? 'teams-msg--copilot-out' : ''
  const timeLabel = message.timestamp ?? 'just now'

  return (
    <div className={`teams-msg ${dirClass} ${firstClass} ${copilotOutClass}`}>
      <ReactionsStrip />

      {/* Outgoing: timestamp lives on the far left, outside the bubble (new
          Teams desktop pattern). Incoming: timestamp is in the head block,
          above the bubble. In the Copilot panel the timestamp column is
          omitted entirely so the user bubble hugs the right edge. */}
      {isSelf && showHeader && !isCopilotPanel && <span className="teams-msg__time-col">{timeLabel}</span>}
      {isSelf && !showHeader && !isCopilotPanel && <span className="teams-msg__time-col teams-msg__time-col--placeholder" aria-hidden />}

      {/* Avatar column (incoming only). */}
      {!isSelf && (
        showHeader ? (
          <div className="teams-msg__avatar">
            {isApp ? <img src={appAvatarUrl} alt="" /> : <UserAvatarImg author={message.author} avatarUrl={message.avatarUrl} />}
          </div>
        ) : (
          <div className="teams-msg__avatar-spacer" aria-hidden />
        )
      )}

      <div className="teams-msg__body">
        {showHeader && !isSelf && (
          <div className="teams-msg__head">
            <span className="teams-msg__name">{displayName}</span>
            {isApp && <span className="teams-msg__app-tag">App</span>}
            <span className="teams-msg__time">{timeLabel}</span>
          </div>
        )}

        {hasBubbleText && (
          <div className="teams-msg__bubble">
            {formatMessageWithMentions(
              isApp && typingActive ? slackToAdaptiveText(rawText.slice(0, typingLen)) : slackToAdaptiveText(rawText),
              personaNames
            )}
            {isApp && typingActive && !typingComplete && <span className="teams-composer__caret" />}
          </div>
        )}

        {showAdaptiveCard && (
          <div className="teams-msg__card">
            <TeamsAdaptiveCard
              card={buildCardForTemplate(templateId, templateContent, { choices, actioned: oauthConnected })}
              onAction={handleCardAction}
            />
          </div>
        )}

        {!showAdaptiveCard && choices && choices.length > 0 && typingComplete && (
          <div className="teams-msg__choices">
            {choices.map((c, idx) => (
              <button
                key={c}
                type="button"
                className={`teams-action-btn ${idx === 0 ? '' : 'teams-action-btn--secondary'}`}
                onClick={() => handleButtonClick(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {isSelf && isLastOutgoing && !isCopilotPanel && (hasBubbleText || showAdaptiveCard) && (
          <span className="teams-msg__read-receipt" aria-label="Read">
            <ReadReceiptIcon />
          </span>
        )}
      </div>
    </div>
  )
}

function shouldRenderAsCard(templateId: string | undefined, content: Record<string, unknown>): boolean {
  if (!templateId) return false
  switch (templateId) {
    case 'text_with_buttons':
      return Array.isArray(content.choices) && (content.choices as unknown[]).length > 0
    case 'construct_case':
      return true
    case 'connect_oauth_card':
      return true
    default:
      // Any Block Kit template (System B) registered in `@/slackbot-templates`
      // also renders as an Adaptive Card via blockKitToAdaptiveCard.
      return getSlackBlockTemplateById(templateId) !== undefined
  }
}

function buildCardForTemplate(
  templateId: string | undefined,
  content: Record<string, unknown>,
  ctx: { choices?: string[]; actioned?: boolean }
) {
  const text = (content.text as string) ?? ''
  switch (templateId) {
    case 'text_with_buttons':
      return buildTextCard(text, ctx)
    case 'construct_case':
      return buildCaseCard(
        {
          caseTitle: content.caseTitle as string | undefined,
          caseFields: content.caseFields as { label: string; value: string }[] | undefined,
          caseStatus: content.caseStatus as string | undefined,
          caseNote: content.caseNote as string | undefined,
          caseAvatarUrl: content.caseAvatarUrl as string | undefined,
          text,
        },
        ctx
      )
    case 'connect_oauth_card':
      return buildConnectOAuthCard(
        {
          connectCardTitle: (content.connectCardTitle as string | undefined) ?? (content.connectConnectedTitle as string | undefined),
          connectCardBody: (content.connectCardBody as string | undefined) ?? (content.connectConnectedBody as string | undefined),
          connectCardFooter: content.connectCardFooter as string | undefined,
          connectConnectedTitle: content.connectConnectedTitle as string | undefined,
          connectConnectedBody: content.connectConnectedBody as string | undefined,
        },
        ctx
      )
    default: {
      // Block Kit template path (System B). Render via renderSlackTemplate +
      // blockKitToAdaptiveCard so Teams shows the same template as Slack.
      if (templateId && getSlackBlockTemplateById(templateId)) {
        const variables =
          (content.templateVariables as Record<string, unknown> | undefined) ??
          getFixtureForBlockKitTemplate(templateId)
        const rendered = renderSlackTemplate(templateId, variables, { strict: false })
        const blocks = rendered.payload?.blocks ?? []
        return blockKitToAdaptiveCard(blocks, { actioned: ctx.actioned })
      }
      return buildTextCard(text, ctx)
    }
  }
}

/* ------------------------------------------------------------------------
 * Copilot panel helpers
 *
 * The new Teams desktop renders Copilot's responses as inline text (no
 * avatar, no bubble, no Adaptive Card) followed by a small reply toolbar.
 * The helpers below implement that visual without breaking the existing
 * Slack-bot/agent render path that other demos rely on.
 * ---------------------------------------------------------------------- */

/** Lightweight markdown renderer for Copilot replies. Supports paragraphs,
 *  `**bold**` runs, unordered bullet lists (`- item` / `* item`), and
 *  persona-name mentions. We deliberately avoid pulling in a full markdown
 *  library — the surface needs to render quickly inside the typing
 *  animation and Copilot replies in our demos only use this small subset. */
function CopilotMarkdown({ text, personaNames }: { text: string; personaNames: string[] }) {
  if (!text) return null

  /* Split into "blocks": consecutive bullet lines collapse into a single
   * list, everything else becomes a paragraph. A blank line is a paragraph
   * separator. */
  const lines = text.split(/\r?\n/)
  type Block =
    | { kind: 'p'; lines: string[] }
    | { kind: 'ul'; items: string[] }
  const blocks: Block[] = []
  let buffer: string[] = []
  const flushParagraph = () => {
    if (buffer.length === 0) return
    blocks.push({ kind: 'p', lines: buffer })
    buffer = []
  }
  for (const raw of lines) {
    const line = raw.trimEnd()
    const bulletMatch = /^\s*[-*]\s+(.*)$/.exec(line)
    if (bulletMatch) {
      flushParagraph()
      const last = blocks[blocks.length - 1]
      if (last && last.kind === 'ul') last.items.push(bulletMatch[1])
      else blocks.push({ kind: 'ul', items: [bulletMatch[1]] })
      continue
    }
    if (line.trim() === '') {
      flushParagraph()
      continue
    }
    buffer.push(line)
  }
  flushParagraph()

  return (
    <>
      {blocks.map((b, i) =>
        b.kind === 'ul' ? (
          <ul key={i} className="teams-msg__copilot-list">
            {b.items.map((item, j) => (
              <li key={j}>{formatMessageWithMentions(item.replace(/\*\*([^*]+)\*\*/g, '*$1*'), personaNames)}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className="teams-msg__copilot-p">
            {formatMessageWithMentions(b.lines.join(' ').replace(/\*\*([^*]+)\*\*/g, '*$1*'), personaNames)}
          </p>
        )
      )}
    </>
  )
}

/** Action toolbar that sits below a completed Copilot reply. Static —
 *  mirrors the new Teams desktop affordances (copy / 👍 / 👎 / share /
 *  edit-pencil with chevron / more). All buttons are tab-stops-disabled
 *  because the demo's click-through is driven by the engine. */
function CopilotReplyToolbar() {
  return (
    <div className="teams-msg__copilot-toolbar" aria-hidden>
      <button className="teams-msg__copilot-tool-btn" type="button" tabIndex={-1} title="Copy">
        <CopyRegular size={18} />
      </button>
      <button className="teams-msg__copilot-tool-btn" type="button" tabIndex={-1} title="Good response">
        <ThumbLikeRegular size={18} />
      </button>
      <button className="teams-msg__copilot-tool-btn" type="button" tabIndex={-1} title="Bad response">
        <ThumbDislikeRegular size={18} />
      </button>
      <button className="teams-msg__copilot-tool-btn" type="button" tabIndex={-1} title="Share">
        <ShareRegular size={18} />
      </button>
      <button
        className="teams-msg__copilot-tool-btn teams-msg__copilot-tool-btn--combo"
        type="button"
        tabIndex={-1}
        title="Edit response"
      >
        <EditLineHorizontal3Regular size={18} />
        <ChevronDownRegular size={14} />
      </button>
      <button className="teams-msg__copilot-tool-btn" type="button" tabIndex={-1} title="More">
        <MoreHorizontalRegular size={18} />
      </button>
    </div>
  )
}

/** Copilot-flavored thinking indicator — small inline "Copilot" header plus
 *  the standard three-dot typing animation, no avatar or App tag. */
function CopilotThinkingRow({ status }: { status?: string }) {
  return (
    <div className="teams-msg teams-msg--copilot-reply">
      <div className="teams-msg__copilot-head">
        <CopilotLineRegular size={20} />
        <span className="teams-msg__copilot-name">Copilot</span>
      </div>
      <div className="teams-msg__copilot-body">
        <span className="teams-typing">
          <span>{status ?? 'Working on it'}</span>
          <span className="teams-typing__dot" />
          <span className="teams-typing__dot" />
          <span className="teams-typing__dot" />
        </span>
      </div>
    </div>
  )
}
