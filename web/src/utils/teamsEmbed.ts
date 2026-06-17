import { useEffect, useState } from 'react'

/**
 * Detect when Jarvis is running embedded as a Microsoft Teams personal tab and
 * surface Teams' active theme.
 *
 * When embedded we hide the *simulated* Teams chrome (demo bar, title bar, app
 * rail) — Teams itself provides those — and let Teams drive the theme.
 *
 * Detection (in order):
 *   1. `?embed=1` / `?embed=teams` query param (force; useful for browser preview)
 *   2. Running inside an iframe (Teams renders tab content in an iframe)
 * When embedded, we also initialize the Teams JS SDK (dynamically, so it stays
 * out of the bundle for the standalone demo) to read + subscribe to the theme
 * and to call notifySuccess() so Teams stops the loading spinner.
 */
export type TeamsTheme = 'default' | 'dark' | 'contrast'

function detectEmbedded(): boolean {
  try {
    const p = new URLSearchParams(window.location.search)
    const e = p.get('embed')
    if (e === '1' || e === 'teams' || e === 'true') return true
    return window.self !== window.top
  } catch {
    return false
  }
}

/** Map a Teams theme string to the Jarvis app theme mode. */
export function teamsThemeToMode(t: TeamsTheme | string | null): 'light' | 'dark' | 'contrast' {
  if (t === 'dark') return 'dark'
  if (t === 'contrast') return 'contrast'
  return 'light'
}

export function useTeamsEmbed(): { embedded: boolean; teamsTheme: TeamsTheme | null } {
  const [embedded] = useState<boolean>(detectEmbedded)
  const [teamsTheme, setTeamsTheme] = useState<TeamsTheme | null>(null)

  useEffect(() => {
    if (!embedded) return
    let cancelled = false
    // Dynamic import keeps @microsoft/teams-js out of the standalone demo bundle.
    import('@microsoft/teams-js')
      .then(({ app }) =>
        app
          .initialize()
          .then(() => {
            try {
              app.notifySuccess()
            } catch {
              /* notifySuccess is a no-op outside a real Teams host */
            }
            return app.getContext()
          })
          .then((ctx) => {
            if (cancelled) return
            const theme = (ctx?.app?.theme as TeamsTheme | undefined) ?? 'default'
            setTeamsTheme(theme)
            app.registerOnThemeChangeHandler((t) => setTeamsTheme(t as TeamsTheme))
          })
      )
      .catch(() => {
        /* Not actually inside Teams (e.g. plain iframe preview) — ignore. */
      })
    return () => {
      cancelled = true
    }
  }, [embedded])

  return { embedded, teamsTheme }
}
