/**
 * Standalone chat-message payload type.
 *
 * Extracted from the Slack `StoryEngine.tsx` so the Teams shell + chat and the
 * Teams playback engine can share the shape without importing the heavy Slack
 * engine. Keep this in sync with the original interface if it ever changes.
 */
export interface ChatMessagePayload {
  id: string
  author: string
  text?: string
  timestamp?: string
  isApp?: boolean
  /** User message avatar; from persona.avatar or stable defaults — same persona id = same photo */
  avatarUrl?: string
  choices?: string[]
  templateId?: string
  templateContent?: Record<string, unknown>
  /** Persona names for mention formatting (e.g. "Alex Kim" -> @Alex Kim) */
  personaNames?: string[]
  /** When true, render as "New" tagged divider (switch-back strip); not a real message */
  isNewDivider?: boolean
}
