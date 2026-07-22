# Jarvis — The Autonomous Personal Assistant for Employees

> An autonomous employee **action layer**: Jarvis works in the background, hands you one morning brief, drafts every message in your voice, and sends nothing without your one-tap approval. Built as a Microsoft Teams personal tab on Salesforce Agentforce.

## Live Demo

**[Open the live demo →](https://git.soma.salesforce.com/pages/pritesh-chavan/Jarvis/)**

`https://git.soma.salesforce.com/pages/pritesh-chavan/Jarvis/`

> Hosted on Salesforce's internal GitHub Enterprise (git.soma) — requires Salesforce SSO to view.

The demo runs the full **"Marc's Mandatory Review"** flow: an SVP drops a mandatory 2 PM review that collides with three meetings, and Jarvis turns seven separate messages into a single batch approval — reschedule, decline, and cover, all cleared in one tap and reversible from the Feed.

> Tip: click the notification toast's **Review plan** button (or any intent card on Today) to open the reschedule plan in the full-screen intent view.

## What to look for

- **One morning brief** — "I handled 3 things overnight, 5 need you, 2 can wait." Not another inbox.
- **The batch card** — 4 Teams messages + 3 emails drafted in your voice, handed over as one card.
- **Silent trust tiering** — the right amount of friction only where it matters; a single light gate before an action sent in your name.
- **Reversible by design** — every action lands in the Feed as one entry, undoable in one click.

## Run it locally

```bash
cd web
npm install
npm run dev
```

Vite prints the local URL (e.g. `http://localhost:5173/`). Open it in your browser.

## Tech stack

- **React 19** + **Vite** — single-page prototype (`web/src/App.jsx`)
- **Fluent UI v9** + **Tailwind** — Teams-native look and feel
- **@microsoft/teams-js** — runs as a Teams personal tab
- **git.soma Pages** — the live demo is published to the `gh-pages` branch on git.soma (`npx vite build --base=/pages/pritesh-chavan/Jarvis/` then `npx gh-pages -d dist -b gh-pages -r <soma repo>.git`)

## Context

Built for the **[266] Design Vision Showcase**. Presentation and demo scripts live in [`docs/`](docs/) (`DVS-266-PRESENTATION.md`, `DVS-266-DEMO-SCRIPT.md`).

**Collaborators:** Deval Marolia (PM) · Bikramaditya Padhi (Eng) · Sneha Murali (R&I)
