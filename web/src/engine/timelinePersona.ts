import type { Persona, StoryStep } from '@/types'

/**
 * Resolve the active user persona at a given step index in a story timeline.
 *
 * Used by both the Slack and Teams engines (in full-story mode) to keep the
 * "you" persona — and the avatar shown in the workspace chrome — in sync
 * with whichever persona's view the demo is currently in. Without this,
 * multi-persona demos would render every surface from the first persona's
 * perspective even after a hand-off.
 *
 * Resolution precedence:
 *   1. Explicit `surface.context.personaId` on the most recent surface step
 *      (highest signal — author has stated whose view this segment is).
 *   2. `surface.context.with` matched against a user persona's name
 *      (e.g. a 1:1 DM "with" Sarah Chen → Sarah).
 *   3. The next user_action / user_message persona inside the current
 *      surface segment (forward scan up to the next surface).
 *   4. The most recent user persona that's actually acted prior to this
 *      step (last-known actor).
 *   5. The fallbackPersonaId (typically the first user persona).
 *
 * Rule (3) is what enables a surface step to "look ahead" and pick up the
 * incoming actor BEFORE they post their first message — so the avatar
 * flips at the moment of the surface change, not on the next interaction.
 */
export function resolveTimelineUserPersonaId(
  steps: StoryStep[],
  stepIndex: number,
  personas: Persona[],
  fallbackPersonaId?: string
): string | undefined {
  const userPersonas = personas.filter((p) => p.type === 'user')
  if (userPersonas.length === 0) return fallbackPersonaId

  const userPersonaIds = new Set(userPersonas.map((p) => p.id))
  const userPersonasByName = new Map(
    userPersonas.map((p) => [p.name.trim().toLowerCase(), p.id] as const)
  )

  let lastUserStepIndex = -1
  let lastUserPersonaId: string | undefined
  for (let i = stepIndex; i >= 0; i--) {
    const step = steps[i] as { content?: { personaId?: string } } | undefined
    const personaId = step?.content?.personaId
    if (personaId && userPersonaIds.has(personaId)) {
      lastUserStepIndex = i
      lastUserPersonaId = personaId
      break
    }
  }

  let lastSurfaceStepIndex = -1
  let surfaceExplicitPersonaId: string | undefined
  let surfaceWithPersonaId: string | undefined
  for (let i = stepIndex; i >= 0; i--) {
    const step = steps[i]
    if (!step || step.type !== 'surface') continue
    lastSurfaceStepIndex = i
    const ctx = (step as { context?: { personaId?: string; surface?: string; with?: string } }).context
    const explicit = ctx?.personaId
    if (typeof explicit === 'string' && userPersonaIds.has(explicit)) {
      surfaceExplicitPersonaId = explicit
    }
    if (ctx?.surface === 'dm' && typeof ctx?.with === 'string') {
      const matched = userPersonasByName.get(ctx.with.trim().toLowerCase())
      if (matched) surfaceWithPersonaId = matched
    }
    break
  }

  if (surfaceExplicitPersonaId) return surfaceExplicitPersonaId
  if (surfaceWithPersonaId) return surfaceWithPersonaId

  // After a fresh surface switch, look forward inside this segment for the
  // first user actor so the avatar flips at the surface boundary instead of
  // waiting for the user's first interaction.
  if (lastSurfaceStepIndex > lastUserStepIndex) {
    for (let i = lastSurfaceStepIndex + 1; i < steps.length; i++) {
      const step = steps[i]
      if (!step) continue
      if (step.type === 'surface') break
      const personaId = (step as { content?: { personaId?: string } })?.content?.personaId
      if (personaId && userPersonaIds.has(personaId)) return personaId
    }
  }

  return lastUserPersonaId ?? fallbackPersonaId
}
