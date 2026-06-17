# Run Jarvis inside Microsoft Teams (personal tab)

This packages the Jarvis web app as a **Teams personal tab** and runs it inside
your installed Teams desktop client. When embedded, Jarvis hides its *simulated*
Teams chrome (the demo title bar + app rail) and follows Teams' own theme —
Teams provides the real chrome.

There are two ways to run it:

- **Live dev** — your local Vite dev server, exposed over HTTPS via a tunnel, so
  every edit in Cursor hot-reloads inside the Teams tab. ← what you want
- **Static demo** — point the tab at the deployed GitHub Pages build (no live
  reload; you redeploy to update).

---

## 0. Prerequisite (30-second check)

In Teams: **Apps ▸ Manage your apps ▸ Upload a custom app**.
- If you see **Upload a custom app** → sideloading is allowed. ✅
- If it's missing → your org disabled it. Use a free
  [Microsoft 365 Developer tenant](https://developer.microsoft.com/microsoft-365/dev-program)
  and sign into Teams with that account.

Teams tab content **must be HTTPS** — that's why local dev needs a tunnel.

---

## 1. Live dev loop (recommended)

### a. Start the dev server
```bash
cd web
npm run dev          # serves http://localhost:5174
```

### b. Expose it over HTTPS with a Dev Tunnel
Microsoft Dev Tunnels (built into the `devtunnel` CLI / VS Code; free, no signup
beyond your MS account):
```bash
devtunnel user login
devtunnel host -p 5174 --allow-anonymous
# prints a public HTTPS URL, e.g. https://abc123-5174.usw2.devtunnels.ms
```
(ngrok works too: `ngrok http 5174`.)

### c. Make HMR reload through the tunnel
Restart the dev server with the tunnel host so the hot-reload websocket connects
back over `wss:443`:
```bash
TUNNEL_HOST=abc123-5174.usw2.devtunnels.ms npm run dev
```

### d. Build the app package pointing at the tunnel
```bash
TAB_ENDPOINT="https://abc123-5174.usw2.devtunnels.ms" npm run package:teams
# → web/teams/appPackage.zip
```

### e. Sideload into Teams
Teams ▸ **Apps ▸ Manage your apps ▸ Upload a custom app** ▸ select
`web/teams/appPackage.zip` ▸ **Add**. Jarvis opens as a personal tab.

Now edit any file in Cursor → Vite HMR → the Teams tab updates live. (You only
re-run steps **d–e** if you change the manifest or the tunnel URL.)

---

## 2. Static demo (no tunnel, no live reload)

```bash
TAB_ENDPOINT="https://priteshsalesforce.github.io/Jarvis" npm run package:teams
```
Sideload the zip as above. To update, push to `main` (GitHub Pages redeploys),
then just refresh the tab.

---

## How embedding works

- `src/utils/teamsEmbed.ts` detects the embed (via `?embed=1` or running inside
  Teams' iframe), initializes `@microsoft/teams-js`, calls `app.notifySuccess()`,
  and reads/subscribes to the Teams theme.
- `App.jsx` hides the demo bar, title bar and app rail when `embedded`, and maps
  the Teams theme (default/dark/contrast) onto its own theme.
- Preview embed mode in a normal browser any time:
  `http://localhost:5174/?embed=1`

## Files
- `manifest.template.json` — Teams manifest; `{{TAB_ENDPOINT}}` / `{{TAB_DOMAIN}}`
  are filled in by the package script.
- `color.png` (192×192) / `outline.png` (32×32) — app icons.
- `scripts/package-teams.mjs` — builds `appPackage.zip`.

> Note: `outline.png` should ideally be a white silhouette on transparent for the
> rail. The current one is derived from the brand mark — fine for dev; swap for a
> proper monochrome outline before publishing.
