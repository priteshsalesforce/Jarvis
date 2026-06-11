/**
 * Resolve a path inside the `public/` folder against Vite's configured `base`.
 *
 * Why this exists:
 *   When deployed to GitHub Pages (or any non-root subpath), assets must be
 *   prefixed with `import.meta.env.BASE_URL` (e.g. "/slack-demos/"). Hardcoded
 *   absolute paths like "/assets/foo.svg" break under a subpath. Use this
 *   helper anywhere a public asset is referenced from TSX/TS code.
 *
 * Examples:
 *   asset('/assets/slack-logo.svg')  -> "/slack-demos/assets/slack-logo.svg"
 *   asset('assets/slack-logo.svg')   -> "/slack-demos/assets/slack-logo.svg"
 */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL // always ends with "/"
  const cleaned = path.startsWith('/') ? path.slice(1) : path
  return `${base}${cleaned}`
}
