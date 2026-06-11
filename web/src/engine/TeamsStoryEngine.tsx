import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSharedDemoMode } from '@/hooks/useSharedDemoMode'
import type { PersonaConfig, StoryConfig, StoryStep } from '@/types'
import { resolvePersonaAvatarUrl } from '@/utils/personaAvatar'
import { asset } from '@/utils/asset'
import { getActiveViewForStep, getSurfaceAtStep } from '@/engine/viewport'
import { resolveTimelineUserPersonaId } from '@/engine/timelinePersona'
import type { ChatMessagePayload } from '@/types/chatMessage'

/**
 * Persona id used by the demo persona bar to represent the "Full story
 * (step-by-step)" option. Inlined here (was imported from the Slack
 * StoryEngine, which is intentionally not ported).
 */
const FULL_STORY_PERSONA_ID = 'full'
import { DemoPersonaBar } from '@/components/demo/DemoPersonaBar'
import { ClickThroughOverlay } from '@/components/demo/ClickThroughOverlay'
import { TeamsShell, TeamsConversationHeader } from '@/components/layout/teams/TeamsShell'
import { TeamsChatView } from '@/components/chat/teams/TeamsChatView'
import { TeamsDatePickerDialog } from '@/components/chat/teams/TeamsDatePickerDialog'

const AUTO_ADVANCE_BASE_MS = 1000
const BOT_TYPING_MS_PER_CHAR = 10
const BOT_TYPING_BUFFER_MS = 120
const BOT_TO_USER_HANDOFF_MS = 1000

/**
 * Accept both `date-picker` (canonical builder spelling) and `date_picker`
 * (used in older Paternity Leave fixture) so the date modal opens regardless
 * of which separator the demo author chose. Mirrors the helper in
 * `StoryEngine.tsx`.
 */
function isDatePickerView(view: unknown): boolean {
  return view === 'date-picker' || view === 'date_picker'
}

interface TeamsStoryEngineProps {
  story: StoryConfig
  personaConfig?: PersonaConfig
  onPersonaChange?: (personaId: string | null) => void
  fullStoryMode?: boolean
}

export function TeamsStoryEngine({ story, personaConfig, onPersonaChange, fullStoryMode = false }: TeamsStoryEngineProps) {
  const { search } = useLocation()
  const isSharedDemo = useSharedDemoMode()

  const steps = useMemo(() => {
    if (!personaConfig) return story.steps
    const set = new Set(personaConfig.stepIds)
    return story.steps.filter((s) => set.has(s.id))
  }, [story.steps, personaConfig])

  const totalSteps = steps.length
  const [currentStepIndex, setCurrentStepIndex] = useState(1)
  const [overlayEnabled, setOverlayEnabled] = useState(true)
  const [lastSelectedChoice, setLastSelectedChoice] = useState<string | null>(null)

  const goNext = useCallback(() => {
    setCurrentStepIndex((i) => Math.min(i + 1, totalSteps))
  }, [totalSteps])

  const goBack = useCallback(() => {
    setCurrentStepIndex((i) => Math.max(i - 1, 1))
  }, [])

  const handleChoiceClick = useCallback(
    (choice: string) => {
      setLastSelectedChoice(choice)
      setCurrentStepIndex((i) => {
        const idx0 = i - 1
        const choiceStepIndex = steps.findIndex(
          (s, idx) =>
            idx > idx0 &&
            s.type === 'user_action' &&
            (s as { content?: { choices?: string[] } }).content?.choices?.includes(choice)
        )
        if (choiceStepIndex >= 0) return Math.min(choiceStepIndex + 2, totalSteps)
        return Math.min(i + 1, totalSteps)
      })
    },
    [steps, totalSteps]
  )

  const prototypeName = personaConfig
    ? `${story.title} (${personaConfig.title}) — Teams`
    : `${story.title} — Teams`

  useEffect(() => {
    document.title = prototypeName
  }, [prototypeName])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goBack()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goBack])

  const userPersonas = story.personas.filter((p) => p.type === 'user')
  const appPersona = story.personas.find((p) => p.type === 'app')
  const stepIndex = currentStepIndex - 1
  /**
   * Determine which persona represents "me" so the chat view can render their
   * messages as outgoing (right-aligned, purple-tint) bubbles AND so the
   * Teams title-bar avatar reflects whose client we're imagining we're in.
   *
   * In persona-specific mode the selection is locked to the picked persona.
   * In full-story mode the resolver follows the timeline — same behavior as
   * Slack's rail avatar — so each surface hand-off (e.g. Alex → Sarah)
   * swaps the avatar AND flips outgoing-bubble alignment to match.
   */
  const activeTimelinePersonaId = personaConfig
    ? personaConfig.personaId
    : resolveTimelineUserPersonaId(steps, stepIndex, story.personas, userPersonas[0]?.id)
  const selfPersona = activeTimelinePersonaId
    ? story.personas.find((p) => p.id === activeTimelinePersonaId)
    : userPersonas[0]
  const selfAuthor = selfPersona?.name
  const fullStoryOption = {
    id: FULL_STORY_PERSONA_ID,
    name: 'Full story (step-by-step)',
    designation: '',
    role: '',
    type: 'user' as const,
  }
  const barPersonas = [fullStoryOption, ...userPersonas]
  const viewAsPersonaId = fullStoryMode ? FULL_STORY_PERSONA_ID : (personaConfig?.personaId ?? null)

  const currentStep = steps[stepIndex]
  const nextStep = steps[stepIndex + 1]
  const stepAfterNext = steps[stepIndex + 2]

  // ---- Per-demo agent branding (Teams flavor) -----------------------------
  // In Teams we replace the Slack-native bot ("Slackbot") with Microsoft's
  // own AI assistant — "Copilot" — and use the Copilot mark as its avatar.
  // Stories that ship their own enterprise agent (e.g. Employee Agent for HR
  // demos) keep their persona unchanged.
  const isEmployeeAgentStory =
    story.id === 'ai-platform-readiness-by-pritesh-chavan' ||
    story.id === 'employee-relocation-resolution-by-pritesh-chavan' ||
    story.id === 'regional-payroll-sync-resolution-by-pritesh-chavan'

  const rawAppName = appPersona?.name?.trim() ?? ''
  const isSlackbotPersona = /slack ?bot/i.test(rawAppName)
  const appName = isEmployeeAgentStory
    ? 'Employee Agent'
    : isSlackbotPersona || rawAppName === ''
      ? 'Copilot'
      : rawAppName
  const appAvatarUrl = isEmployeeAgentStory
    ? asset('/assets/hr-service-agent-avatar.png')
    : isSlackbotPersona || rawAppName === ''
      ? asset('/assets/copilot-icon.svg')
      : (appPersona?.avatar?.trim() || asset('/assets/copilot-icon.svg'))
  const isCopilot = appName === 'Copilot'

  const surface = getSurfaceAtStep(steps, stepIndex)
  const activeView = getActiveViewForStep(steps, stepIndex)

  // The new Teams desktop unifies chat + channel browsing under one "Chat"
  // rail entry. Channel demos surface through the "Teams and channels" section
  // inside that same Chat sidebar (with the relevant channel marked selected),
  // so the engine always lands on the 'chat' rail.
  const railActive = 'chat' as const

  const tenantName = story.workspaceName?.trim() || 'Acme Inc'
  const channelName = surface?.kind === 'channel' ? (surface.channel ?? 'general') : ''
  const channelLabel = channelName.replace(/^#/, '').trim()
  const channelInitials = (channelLabel || tenantName).slice(0, 2).toUpperCase()

  // Build chat state
  const state = computeTeamsChatState(
    steps,
    stepIndex,
    activeView,
    story.personas,
    lastSelectedChoice,
    appName
  )

  // Auto-advance logic mirrors Slack engine's behavior.
  const nextIsUserMessage = nextStep?.type === 'user_message'
  const nextIsBotReply = nextStep?.type === 'app_message' || nextStep?.type === 'thread_reply'
  const nextOpensDateModal = nextStep?.type === 'user_action' && stepAfterNext?.type === 'modal_open' && isDatePickerView((stepAfterNext as any).content?.view)
  const nextIsUserActionWithChoices = nextStep?.type === 'user_action' && (nextStep as any).content?.choices?.length
  const isAwaitExternalStep = currentStep?.type === 'user_action' && Boolean((currentStep as any).content?.awaitExternal)

  const currentTextLength =
    currentStep?.type === 'app_message' || currentStep?.type === 'thread_reply'
      ? ((currentStep as any).content?.text ?? '').length
      : 0
  const botReplyDelay =
    Math.max(AUTO_ADVANCE_BASE_MS, currentTextLength * BOT_TYPING_MS_PER_CHAR + BOT_TYPING_BUFFER_MS) +
    (nextIsUserMessage ? BOT_TO_USER_HANDOFF_MS : 0)

  const isUserMessageStep = currentStep?.type === 'user_message'
  const isChoiceStep = currentStep?.type === 'user_action' && (currentStep as any).content?.choices?.length
  const isUserActionOpeningModal =
    currentStep?.type === 'user_action' && nextStep?.type === 'modal_open' && isDatePickerView((nextStep as any).content?.view)
  const isModalOpenStep = (() => {
    if (isUserActionOpeningModal) return true
    if (currentStep?.type === 'modal_open' && isDatePickerView((currentStep as any).content?.view)) return true
    return false
  })()

  const autoAdvanceDelayMs =
    nextStep?.type === 'surface' ? null :
    currentStep?.type === 'bot_typing' ? AUTO_ADVANCE_BASE_MS :
    currentStep?.type === 'user_action' && nextIsBotReply && !nextOpensDateModal && !isAwaitExternalStep ? AUTO_ADVANCE_BASE_MS :
    currentStep?.type === 'app_message' && !nextOpensDateModal && !nextIsUserActionWithChoices ? botReplyDelay :
    currentStep?.type === 'thread_reply' && !nextIsUserActionWithChoices ? botReplyDelay :
    currentStep?.type === 'surface' ? AUTO_ADVANCE_BASE_MS :
    currentStep?.type === 'modal_submit' ? 600 :
    null

  useEffect(() => {
    if (isUserMessageStep || isModalOpenStep || autoAdvanceDelayMs == null) return
    if (isChoiceStep && nextStep?.type !== 'modal_open' && !nextIsBotReply) return
    const t = setTimeout(goNext, autoAdvanceDelayMs)
    return () => clearTimeout(t)
  }, [stepIndex, isUserMessageStep, isChoiceStep, isModalOpenStep, nextStep?.type, nextIsBotReply, autoAdvanceDelayMs, goNext])

  const hasChoicesInLatest = state.chatMessages.length > 0 &&
    Boolean(state.chatMessages[state.chatMessages.length - 1].choices)
  const showOverlay = !isUserMessageStep && !hasChoicesInLatest && !isModalOpenStep && autoAdvanceDelayMs == null

  // Build the chat sidebar. Pin the AI app at top (always selected when we're
  // in a 1:1 chat), then show the other user personas as recent chats. This
  // mimics the new Teams desktop where bots/apps are first-class chat entries.
  /* Demo JSON authors bot messages as "Slackbot" (and may @mention it in
     persona lists / body text). In Microsoft Teams there is no Slackbot —
     the equivalent is Copilot — so we rewrite every app message that
     references the literal string "Slackbot" to use the engine's canonical
     `appName` (which is already Copilot for Slackbot-based stories, or the
     custom agent name for Employee Agent stories). User-authored content is
     never touched. */
  const normalizedMessages = useMemo(() => {
    /* Local helpers — fresh regexes per call so the global flag's stateful
       lastIndex never bites us. */
    const hasSlackbot = (s: string) => /\bslack ?bot\b/i.test(s)
    const rewriteSlackbot = (s: string) => s.replace(/\bslack ?bot\b/gi, appName)

    return state.chatMessages.map((m) => {
      if (!m.isApp || m.isNewDivider) return m
      let dirty = false
      let author = m.author
      if (author && hasSlackbot(author)) {
        author = rewriteSlackbot(author)
        dirty = true
      }
      let text = m.text
      if (text && hasSlackbot(text)) {
        text = rewriteSlackbot(text)
        dirty = true
      }
      let personaNames = m.personaNames as string[] | undefined
      if (personaNames?.some(hasSlackbot)) {
        personaNames = personaNames.map((n) => (hasSlackbot(n) ? rewriteSlackbot(n) : n))
        dirty = true
      }
      return dirty ? { ...m, author, text, personaNames } : m
    })
  }, [state.chatMessages, appName])

  const inDmWithBot = surface?.kind !== 'channel'
  /* For Copilot demos the sidebar already shows a permanent "Copilot" pinned
     row at the top of the chat list (rendered by the shell). Adding the bot
     again as a Favorites entry would duplicate it. So we only push the bot
     into Favorites when the active agent is NOT Copilot (e.g. a custom
     "Employee Agent", an HR bot, etc.). */
  const botPreview = appPersona?.role || 'Here to help'
  const botChat = isCopilot
    ? null
    : {
        id: 'app',
        name: appName,
        avatarUrl: appAvatarUrl,
        initials: appName.slice(0, 2).toUpperCase(),
        preview: botPreview,
        time: 'now',
        selected: inDmWithBot,
        pinned: true,
        showStatus: false,
      }
  /* When the demo is talking to Copilot, light up the static pinned Copilot
     row in the shell sidebar with the white-card selected state. */
  const selectedPinned: 'copilot' | undefined =
    isCopilot && inDmWithBot ? 'copilot' : undefined
  // Surface user personas as recent chats — preview is their role so it
  // reads as "[Role]" rather than a fake message. The active persona is
  // included with a "(You)" suffix so demo viewers can see the chat they
  // would themselves be part of (mirrors the Slack engine's DM list).
  const personaChats = userPersonas
    .slice(0, 6)
    .map((p, idx) => ({
      id: p.id,
      name: p.id === selfPersona?.id ? `${p.name} (You)` : p.name,
      avatarUrl: resolvePersonaAvatarUrl(p),
      initials: p.name.slice(0, 2).toUpperCase(),
      preview: p.role || p.designation,
      time: ['11:42 AM', '11:30 AM', '11:02 AM', '10:48 AM', '10:40 AM', '10:29 AM'][idx] ?? '',
      selected: false,
    }))
  // Build the Teams tree. In channel demos we expose the channel currently in
  // use under the workspace's "team" so it appears highlighted.
  const teamsSidebar: NonNullable<React.ComponentProps<typeof TeamsShell>['teams']> = [
    {
      id: 'acme',
      name: tenantName,
      initials: tenantName.slice(0, 2).toUpperCase(),
      pinned: false,
      channels:
        surface?.kind === 'channel'
          ? [
              { id: 'general', name: 'General', selected: channelLabel.toLowerCase() === 'general' },
              {
                id: channelLabel || 'channel',
                name: channelLabel || 'channel',
                selected: true,
                unread: true,
              },
            ]
          : [{ id: 'general', name: 'General' }],
    },
  ]

  /**
   * Conversation header. For Copilot we skip the "App" pill (since it IS the
   * native AI) and use Copilot's Teams-style default tabs: [Chat, Pages, +].
   * For other agents we still show the "App" pill.
   */
  const conversationHeader = surface?.kind === 'channel'
    ? (
      <TeamsConversationHeader
        kind="channel"
        title={channelLabel}
        subtitle={tenantName}
        channelInitials={channelInitials}
        activeTab="Posts"
      />
    )
    : (
      <TeamsConversationHeader
        kind="chat"
        title={appName}
        avatarUrl={appAvatarUrl}
        isBot={!isCopilot}
        hideStatus
        isCopilotPanel={isCopilot && inDmWithBot}
        /* Always use the standard tab list to match the new Teams desktop */
      />
    )

  const defaultStart = '2026-03-15'
  const defaultEnd = '2026-03-22'
  const onModalSubmit = isUserActionOpeningModal ? () => { goNext(); goNext() } : goNext

  return (
    <div className="flex flex-col w-full h-screen" style={{ backgroundColor: 'var(--color-gray-900)' }}>
      <DemoPersonaBar
        breadcrumb={
          <>
            {!isSharedDemo && (
              <>
                <Link to="/" className="text-white/90 hover:text-white focus:outline-none focus:underline" style={{ color: 'rgba(204,204,204,1)' }}>
                  Demos
                </Link>
                <span className="text-white/60 mx-1.5">/</span>
              </>
            )}
            <Link
              to={{ pathname: `/demo/${story.id}/teams`, search }}
              className="text-white/90 hover:text-white focus:outline-none focus:underline"
              style={{ color: 'rgba(204,204,204,1)' }}
            >
              {story.title}
            </Link>
            <span className="text-white/60 mx-1.5">/</span>
            <span className="text-white">Microsoft Teams</span>
            {(personaConfig || fullStoryMode) && (
              <>
                <span className="text-white/60 mx-1.5">/</span>
                <span className="text-white">{fullStoryMode ? 'Full story (step-by-step)' : personaConfig!.title}</span>
              </>
            )}
          </>
        }
        personas={barPersonas}
        selectedPersonaId={viewAsPersonaId}
        onPersonaChange={onPersonaChange ?? (() => {})}
        currentStep={currentStepIndex}
        totalSteps={totalSteps}
        demoStepId={currentStep?.id}
        onBack={goBack}
        onNext={goNext}
        overlayEnabled={overlayEnabled}
        onOverlayToggle={setOverlayEnabled}
        showOverlayToggle={showOverlay}
      />

      <div className="flex flex-col flex-1 min-h-0 min-w-0 w-full overflow-hidden rounded-[12px]" style={{ backgroundColor: 'var(--color-gray-900)', padding: 0, position: 'relative' }}>
        <TeamsShell
          tenantName={tenantName}
          railActive={railActive}
          chats={botChat ? [botChat, ...personaChats] : personaChats}
          teams={teamsSidebar}
          meAvatarUrl={resolvePersonaAvatarUrl(selfPersona)}
          meInitials={selfPersona?.name.slice(0, 2).toUpperCase() ?? 'ME'}
          conversationHeader={conversationHeader}
          selectedPinned={selectedPinned}
        >
          <TeamsChatView
            messages={normalizedMessages}
            pendingUserMessage={state.pendingUserMessage}
            showThinking={state.showThinking}
            thinkingStatusText={state.thinkingStatusText?.replace(/\bslack ?bot\b/gi, appName)}
            appName={appName}
            appAvatarUrl={appAvatarUrl}
            selfAuthor={selfAuthor}
            onSend={goNext}
            onChoiceClick={handleChoiceClick}
            isCopilotPanel={isCopilot && inDmWithBot}
          />
        </TeamsShell>

        {showOverlay && <ClickThroughOverlay onNext={goNext} onBack={goBack} enabled={overlayEnabled} />}

        {isModalOpenStep && (
          <TeamsDatePickerDialog
            defaultStart={defaultStart}
            defaultEnd={defaultEnd}
            onSubmit={onModalSubmit}
            onCancel={goBack}
          />
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/*                Chat state computation (Teams-engine local)                */
/* ------------------------------------------------------------------------ */

export type View = 'slackbot' | 'channel' | 'thread'

interface ComputedState {
  chatMessages: ChatMessagePayload[]
  pendingUserMessage?: { text: string; author: string; avatarUrl?: string }
  showThinking: boolean
  thinkingStatusText?: string
}

/** @internal Exposed for engine unit tests in src/engine/TeamsStoryEngine.test.tsx. */
export function computeTeamsChatState(
  steps: StoryStep[],
  upToIndex: number,
  view: View,
  personas: StoryConfig['personas'],
  lastSelectedChoice: string | null,
  appName: string
): ComputedState {
  const chatMessages: ChatMessagePayload[] = []
  let pendingUserMessage: ComputedState['pendingUserMessage']
  let showThinking = false
  let thinkingStatusText: string | undefined
  const appPersona = personas.find((p) => p.type === 'app')
  const botName = appPersona?.name ?? appName

  let segment: 'dm' | 'channel' = 'dm'
  const segmentEntered: Record<'dm' | 'channel', boolean> = { dm: false, channel: false }
  let dedupeFirstAfterSwitch = false
  let lastChannelAppMessage: ChatMessagePayload | null = null

  for (let i = 0; i <= upToIndex; i++) {
    const step = steps[i]
    if (!step) continue

    if (step.type === 'surface') {
      const ctx = (step as any).context
      const newSegment: 'dm' | 'channel' = ctx?.surface === 'channel' ? 'channel' : 'dm'
      const reset = Boolean(ctx?.resetConversation)
      if (reset) {
        chatMessages.length = 0
        lastChannelAppMessage = null
      }
      if (segmentEntered[newSegment]) {
        if (view === 'slackbot' && newSegment === 'dm') {
          chatMessages.push({ id: `divider-${step.id}`, author: '', isNewDivider: true })
          dedupeFirstAfterSwitch = true
        }
        if ((view === 'channel' || view === 'thread') && newSegment === 'channel') {
          chatMessages.push({ id: `divider-${step.id}`, author: '', isNewDivider: true })
          dedupeFirstAfterSwitch = true
        }
      }
      segmentEntered[newSegment] = true
      segment = newSegment
      continue
    }

    if (view === 'slackbot' && segment !== 'dm') continue
    if ((view === 'channel' || view === 'thread') && segment !== 'channel') continue

    if (step.type === 'user_message') {
      if (view !== 'slackbot') continue
      const content = (step as any).content
      const persona = personas.find((p) => p.id === content?.personaId) ?? personas[0]
      const author = persona?.name ?? 'User'
      const text = content?.text ?? ''
      if (i === upToIndex) {
        pendingUserMessage = { text, author, avatarUrl: resolvePersonaAvatarUrl(persona) }
      } else {
        chatMessages.push({
          id: step.id,
          author,
          text,
          timestamp: 'just now',
          isApp: false,
          avatarUrl: resolvePersonaAvatarUrl(persona),
        })
      }
      continue
    }

    if (step.type === 'app_message') {
      const msg = buildAppMessage(step as any, steps, i, personas, lastSelectedChoice, botName)
      lastChannelAppMessage = msg
      if (dedupeFirstAfterSwitch) {
        const lastReal = [...chatMessages].reverse().find((m) => !m.isNewDivider)
        const dup =
          !!lastReal &&
          lastReal.author === msg.author &&
          (lastReal.text ?? '') === (msg.text ?? '') &&
          (lastReal.templateId ?? '') === (msg.templateId ?? '')
        dedupeFirstAfterSwitch = false
        if (dup) continue
      }
      chatMessages.push(msg)
      continue
    }

    if (step.type === 'thread_reply') {
      const msg = buildThreadReply(step as any, steps, i, personas, lastSelectedChoice, botName)
      if (dedupeFirstAfterSwitch) {
        const lastReal = [...chatMessages].reverse().find((m) => !m.isNewDivider)
        const dup =
          !!lastReal &&
          lastReal.author === msg.author &&
          (lastReal.text ?? '') === (msg.text ?? '') &&
          (lastReal.templateId ?? '') === (msg.templateId ?? '')
        dedupeFirstAfterSwitch = false
        if (dup) continue
      }
      if (view === 'channel' || view === 'thread') chatMessages.push(msg)
      continue
    }

    if (step.type === 'bot_typing') {
      if (view !== 'slackbot') continue
      if (dedupeFirstAfterSwitch) dedupeFirstAfterSwitch = false
      if (i === upToIndex) {
        showThinking = true
        thinkingStatusText = (step as any).content?.statusText
      }
      continue
    }

    if (step.type === 'user_action' || step.type === 'modal_open' || step.type === 'modal_submit') {
      if (view === 'slackbot') {
        if (step.type === 'user_action') {
          const content = (step as any).content
          const choices = content?.choices
          if (choices?.length && chatMessages.length > 0 && !content?.awaitExternal) {
            const last = chatMessages[chatMessages.length - 1]
            if (last.isApp && !last.choices) last.choices = choices
          }

          // Register the user's clicked option as an outgoing chat bubble.
          // Mirrors the Slack engine: skip for awaitExternal off-chat clicks and
          // for clicks that only open a date picker / OAuth modal.
          const nextStepForAction = steps[i + 1]
          const opensDateModal =
            nextStepForAction?.type === 'modal_open' &&
            isDatePickerView((nextStepForAction as any).content?.view)
          const opensOAuthModal =
            nextStepForAction?.type === 'modal_open' &&
            (nextStepForAction as any).content?.view === 'oauth-permission'
          const isAwaitExternal = Boolean(content?.awaitExternal)
          const shouldRegisterClick =
            !!choices?.length && !isAwaitExternal && !opensDateModal && !opensOAuthModal
          if (shouldRegisterClick) {
            if (chatMessages.length > 0) {
              const last = chatMessages[chatMessages.length - 1]
              if (last.isApp && last.choices) {
                last.choices = undefined
                if (last.templateContent && typeof last.templateContent === 'object') {
                  last.templateContent = { ...last.templateContent, choices: undefined }
                }
              }
            }
            const userPersona = personas.find((p) => p.id === content?.personaId)
            const author = userPersona?.name ?? 'You'
            const selectedLabel =
              lastSelectedChoice && choices.includes(lastSelectedChoice)
                ? lastSelectedChoice
                : choices[0]
            chatMessages.push({
              id: `${step.id}-click`,
              author,
              text: selectedLabel,
              timestamp: 'just now',
              isApp: false,
              avatarUrl: resolvePersonaAvatarUrl(userPersona),
            })
          }
        }
      }
      if (view === 'channel' || view === 'thread') {
        if (step.type === 'user_action') {
          const content = (step as any).content
          const choices = content?.choices
          if (view === 'channel' && choices?.length && chatMessages.length > 0) {
            const last = chatMessages[chatMessages.length - 1]
            if (last.isApp && !last.choices) last.choices = choices
          }
          if (view === 'thread' && choices?.length && lastChannelAppMessage && !lastChannelAppMessage.choices) {
            lastChannelAppMessage.choices = choices
          }

          const isAwaitExternal = Boolean(content?.awaitExternal)
          if (choices?.length && !isAwaitExternal) {
            if (view === 'channel' && chatMessages.length > 0) {
              const last = chatMessages[chatMessages.length - 1]
              if (last.isApp && last.choices) {
                last.choices = undefined
                if (last.templateContent && typeof last.templateContent === 'object') {
                  last.templateContent = { ...last.templateContent, choices: undefined }
                }
              }
            }
            if (view === 'thread' && lastChannelAppMessage && lastChannelAppMessage.choices) {
              lastChannelAppMessage.choices = undefined
              if (lastChannelAppMessage.templateContent && typeof lastChannelAppMessage.templateContent === 'object') {
                lastChannelAppMessage.templateContent = {
                  ...lastChannelAppMessage.templateContent,
                  choices: undefined,
                }
              }
            }
            const userPersona = personas.find((p) => p.id === content?.personaId)
            const author = userPersona?.name ?? 'You'
            const selectedLabel =
              lastSelectedChoice && choices.includes(lastSelectedChoice)
                ? lastSelectedChoice
                : choices[0]
            chatMessages.push({
              id: `${step.id}-click`,
              author,
              text: selectedLabel,
              timestamp: 'just now',
              isApp: false,
              avatarUrl: resolvePersonaAvatarUrl(userPersona),
            })
          }
        }
      }
    }
  }

  return { chatMessages, pendingUserMessage, showThinking, thinkingStatusText }
}

function buildAppMessage(
  step: { id: string; content: any },
  steps: StoryStep[],
  i: number,
  personas: StoryConfig['personas'],
  lastSelectedChoice: string | null,
  botName: string
): ChatMessagePayload {
  const content = step.content
  const persona = personas.find((p) => p.id === content?.personaId) ?? personas.find((p) => p.type === 'app')
  const next = steps[i + 1]
  const prev = steps[i - 1]
  let choices =
    content?.choices ?? (next?.type === 'user_action' ? (next as any).content?.choices : undefined)
  const followsChoiceStep = prev?.type === 'user_action' && (prev as any).content?.choices?.length
  const rawText = content?.text ?? ''
  const displayText =
    followsChoiceStep && rawText.includes('{{selectedChoice}}')
      ? rawText.replace(/\{\{selectedChoice\}\}/g, lastSelectedChoice ?? 'your selection')
      : rawText

  const templateContent: Record<string, unknown> = {
    text: displayText,
    choices: choices?.length ? choices : undefined,
    personaNames: personas.map((p) => p.name),
  }
  if (content?.caseTitle != null) templateContent.caseTitle = content.caseTitle
  if (content?.caseFields != null) templateContent.caseFields = content.caseFields
  if (content?.caseStatus != null) templateContent.caseStatus = content.caseStatus
  if (content?.caseNote != null) templateContent.caseNote = content.caseNote
  if (content?.caseAvatarUrl != null) templateContent.caseAvatarUrl = content.caseAvatarUrl
  if (content?.connectCardTitle != null) templateContent.connectCardTitle = content.connectCardTitle
  if (content?.connectCardBody != null) templateContent.connectCardBody = content.connectCardBody
  if (content?.connectCardFooter != null) templateContent.connectCardFooter = content.connectCardFooter
  if (content?.connectConnectedTitle != null) templateContent.connectConnectedTitle = content.connectConnectedTitle
  if (content?.connectConnectedBody != null) templateContent.connectConnectedBody = content.connectConnectedBody
  if (content?.templateId != null) templateContent.templateId = content.templateId
  if (content?.templateVariables != null) templateContent.templateVariables = content.templateVariables
  /**
   * Use the Teams-flavored bot name (`botName` — typically "Copilot") for
   * every app message, regardless of what the source persona is called in
   * the underlying Slack demo (e.g. "Slackbot").
   */
  return {
    id: step.id,
    author: persona?.type === 'app' ? botName : persona?.name ?? botName,
    text: displayText,
    timestamp: 'just now',
    isApp: true,
    choices: choices?.length ? choices : undefined,
    templateId: content?.templateId,
    templateContent: Object.keys(templateContent).length ? templateContent : undefined,
    personaNames: personas.map((p) => p.name),
  }
}

function buildThreadReply(
  step: { id: string; content: any },
  steps: StoryStep[],
  i: number,
  personas: StoryConfig['personas'],
  lastSelectedChoice: string | null,
  botName: string
): ChatMessagePayload {
  const content = step.content
  const next = steps[i + 1]
  const prev = steps[i - 1]
  const persona =
    content?.actor === 'app'
      ? personas.find((p) => p.type === 'app') ?? personas.find((p) => p.id === content?.personaId)
      : personas.find((p) => p.id === content?.personaId)
  const followsChoiceStep = prev?.type === 'user_action' && (prev as any).content?.choices?.length
  const rawText = content?.text ?? ''
  const displayText =
    followsChoiceStep && rawText.includes('{{selectedChoice}}')
      ? rawText.replace(/\{\{selectedChoice\}\}/g, lastSelectedChoice ?? 'your selection')
      : rawText
  const choices =
    content?.choices ?? (next?.type === 'user_action' ? (next as any).content?.choices : undefined)
  const hasChoices = Array.isArray(choices) && choices.length > 0
  const isApp = content?.actor === 'app'
  return {
    id: step.id,
    /* Same Teams-name override as buildAppMessage: bot replies always read
       as "Copilot" (botName) even when the source persona is "Slackbot". */
    author: isApp ? botName : persona?.name ?? botName,
    text: displayText,
    timestamp: 'just now',
    isApp,
    avatarUrl: !isApp ? resolvePersonaAvatarUrl(persona) : undefined,
    choices: hasChoices ? choices : undefined,
    templateId: content?.templateId,
    templateContent: { text: displayText, choices: hasChoices ? choices : undefined, personaNames: personas.map((p) => p.name) },
    personaNames: personas.map((p) => p.name),
  }
}
