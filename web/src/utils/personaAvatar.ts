import type { Persona } from '@/types'

/**
 * Default portrait URLs per persona id so the same character looks the same in every story.
 * Override any time via `persona.avatar` in demo.json.
 */
const DEFAULT_AVATAR_BY_PERSONA_ID: Record<string, string> = {
  sarah: 'https://randomuser.me/api/portraits/women/44.jpg',
  alex: 'https://randomuser.me/api/portraits/men/32.jpg',
  julia: 'https://randomuser.me/api/portraits/women/68.jpg',
  jason: 'https://randomuser.me/api/portraits/men/45.jpg',
  james: 'https://randomuser.me/api/portraits/men/55.jpg',
}

const FALLBACK_PORTRAITS = [
  'https://randomuser.me/api/portraits/women/65.jpg',
  'https://randomuser.me/api/portraits/men/76.jpg',
  'https://randomuser.me/api/portraits/women/90.jpg',
  'https://randomuser.me/api/portraits/men/22.jpg',
  'https://randomuser.me/api/portraits/women/33.jpg',
  'https://randomuser.me/api/portraits/men/41.jpg',
]

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Resolved profile image URL for a user persona; undefined for app/bot personas. */
export function resolvePersonaAvatarUrl(persona: Persona | undefined): string | undefined {
  if (!persona || persona.type === 'app') return undefined
  const explicit = persona.avatar?.trim()
  if (explicit) return explicit
  const byId = DEFAULT_AVATAR_BY_PERSONA_ID[persona.id]
  if (byId) return byId
  return FALLBACK_PORTRAITS[hashString(persona.id) % FALLBACK_PORTRAITS.length]
}
