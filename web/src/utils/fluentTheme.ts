import {
  teamsLightTheme,
  teamsDarkTheme,
  teamsHighContrastTheme,
  type Theme,
} from '@fluentui/react-components'

/**
 * Fluent UI v9 groundwork.
 *
 * Maps the Jarvis app theme mode to the matching official Fluent v9 *Teams*
 * theme so that Fluent v9 components (Button, Card, TabList, Dialog, Persona…)
 * render with Teams-accurate tokens once they're adopted. The app is wrapped in
 * a <FluentProvider theme={fluentThemeForMode(mode)}> which supplies these
 * tokens to any v9 component in the tree.
 */
export type AppThemeMode = 'light' | 'dark' | 'contrast'

export function fluentThemeForMode(mode: AppThemeMode): Theme {
  if (mode === 'dark') return teamsDarkTheme
  if (mode === 'contrast') return teamsHighContrastTheme
  return teamsLightTheme
}
