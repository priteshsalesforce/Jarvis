import { useTeamsTheme, type TeamsThemeSetting } from '@/utils/teamsTheme'

const OPTIONS: Array<{ value: TeamsThemeSetting; label: string }> = [
  { value: 'auto', label: 'Auto (system)' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'contrast', label: 'High contrast' },
]

/**
 * Compact Teams theme switcher for the demo black bar. Flips the
 * `data-teams-theme` attribute on <html>; `teams.css` does the rest. Lets a
 * demo viewer prove the prototype renders correctly in all three Teams themes
 * (Default / Dark / High Contrast).
 */
export function TeamsThemeSwitcher() {
  const { setting, setSetting } = useTeamsTheme()
  return (
    <label className="flex items-center gap-2 text-white text-sm">
      <span className="font-medium whitespace-nowrap">Theme</span>
      <select
        value={setting}
        onChange={(e) => setSetting(e.target.value as TeamsThemeSetting)}
        className="bg-white/10 text-white border-0 rounded px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
        aria-label="Teams theme"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value} className="bg-gray-900 text-white">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
