/**
 * Build a Microsoft Teams app package (appPackage.zip) for the Jarvis personal
 * tab: substitutes the tab endpoint into the manifest template and zips the
 * manifest + the color/outline icons (all at the zip root, as Teams requires).
 *
 * Usage:
 *   TAB_ENDPOINT="https://<your-tunnel>.devtunnels.ms" npm run package:teams
 *   # or, for the static GitHub Pages demo:
 *   TAB_ENDPOINT="https://priteshsalesforce.github.io/Jarvis" npm run package:teams
 *   # default (no env): http://localhost:5174  (Teams needs HTTPS, so use a tunnel)
 *
 * Output: web/teams/appPackage.zip  →  sideload via Teams ▸ Apps ▸ Manage your
 * apps ▸ Upload a custom app.
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const teamsDir = resolve(root, 'teams')

const endpoint = (process.env.TAB_ENDPOINT || 'http://localhost:5174').replace(/\/$/, '')
const domain = endpoint.replace(/^https?:\/\//, '').replace(/\/.*$/, '')

const template = readFileSync(resolve(teamsDir, 'manifest.template.json'), 'utf8')
const manifest = template.replaceAll('{{TAB_ENDPOINT}}', endpoint).replaceAll('{{TAB_DOMAIN}}', domain)

const buildDir = resolve(teamsDir, 'build')
rmSync(buildDir, { recursive: true, force: true })
mkdirSync(buildDir, { recursive: true })
writeFileSync(resolve(buildDir, 'manifest.json'), manifest)
copyFileSync(resolve(teamsDir, 'color.png'), resolve(buildDir, 'color.png'))
copyFileSync(resolve(teamsDir, 'outline.png'), resolve(buildDir, 'outline.png'))

const zipPath = resolve(teamsDir, 'appPackage.zip')
if (existsSync(zipPath)) rmSync(zipPath)
execSync(`zip -j -X "${zipPath}" manifest.json color.png outline.png`, { cwd: buildDir, stdio: 'inherit' })

console.log(`\n✓ Built ${zipPath}`)
console.log(`  Tab endpoint: ${endpoint}`)
console.log(`  Valid domain: ${domain}`)
if (endpoint.startsWith('http://')) {
  console.warn('\n⚠ Teams requires HTTPS for tab content. Use a Dev Tunnel / ngrok HTTPS URL or the Pages URL.')
}
