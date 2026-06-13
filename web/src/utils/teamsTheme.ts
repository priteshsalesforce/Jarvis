import { useEffect, useState } from 'react'

/**
 * Microsoft Teams supports three themes: Default (light), Dark and High
 * Contrast. This module is the single source of truth for which theme the
 * Teams chrome is rendering in.
 *
 * The chosen *setting* is stored as `data-teams-theme` on <html>:
 *   - absent / "auto" → follow the OS (prefers-color-scheme / prefers-contrast)
 *   - "light" | "dark" | "contrast" → explicit override
 *
 * CSS in `teams.css` keys off the same attribute (and the matching media
 * queries) so visual theming is entirely declarative; this module only needs
 * to flip the attribute and let React components that care (e.g. the Adaptive
 * Card renderer) recompute their resolved theme.
 */
export type TeamsThemeMode = 'light' | 'dark' | 'contrast'
export type TeamsThemeSetting = 'auto' | TeamsThemeMode

const ATTR = 'data-teams-theme'
const EVENT = 'teams-theme-change'

export function getThemeSetting(): TeamsThemeSetting {
  if (typeof document === 'undefined') return 'auto'
  const v = document.documentElement.getAttribute(ATTR)
  if (v === 'light' || v === 'dark' || v === 'contrast') return v
  return 'auto'
}

/** Resolve a setting to the concrete mode actually being displayed. */
export function resolveTheme(setting: TeamsThemeSetting = getThemeSetting()): TeamsThemeMode {
  if (setting !== 'auto') return setting
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-contrast: more)').matches) return 'contrast'
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  }
  return 'light'
}

export function setThemeSetting(setting: TeamsThemeSetting): void {
  if (typeof document === 'undefined') return
  if (setting === 'auto') {
    document.documentElement.removeAttribute(ATTR)
  } else {
    document.documentElement.setAttribute(ATTR, setting)
  }
  window.dispatchEvent(new CustomEvent(EVENT))
}

/**
 * React hook returning the current setting + resolved mode, re-rendering when
 * the user flips the switcher or the OS preference changes.
 */
export function useTeamsTheme(): {
  setting: TeamsThemeSetting
  mode: TeamsThemeMode
  setSetting: (s: TeamsThemeSetting) => void
} {
  const [setting, setSetting] = useState<TeamsThemeSetting>(() => getThemeSetting())
  const [mode, setMode] = useState<TeamsThemeMode>(() => resolveTheme())

  useEffect(() => {
    const recompute = () => {
      setSetting(getThemeSetting())
      setMode(resolveTheme())
    }
    window.addEventListener(EVENT, recompute)
    const darkMq = window.matchMedia('(prefers-color-scheme: dark)')
    const contrastMq = window.matchMedia('(prefers-contrast: more)')
    darkMq.addEventListener('change', recompute)
    contrastMq.addEventListener('change', recompute)
    return () => {
      window.removeEventListener(EVENT, recompute)
      darkMq.removeEventListener('change', recompute)
      contrastMq.removeEventListener('change', recompute)
    }
  }, [])

  return {
    setting,
    mode,
    setSetting: (s) => {
      setThemeSetting(s)
      setSetting(s)
      setMode(resolveTheme(s))
    },
  }
}
