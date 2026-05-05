# Jarvis Design Brief v3 — Stakeholder Demo

**Based on:** POC video + Aditi/Bikramaditya transcript (Apr 27) + all research docs

---

## What the POC does well (keep)
- 4-section dashboard structure (Yesterday / Follow-ups / Today's Events / Pending with me) — real, useful, grounded
- Conversations tab with A3 agent integration
- Feed tab as ethical AI transparency log
- Personalization page: behaviour templates, schedule, connect external services
- Microsoft Teams native framing (iframe, Teams design patterns)
- Priority tags (High / Normal) on cards

## What the POC is missing vs our research (gaps to close)

### UX gaps
1. **No risk tier system** — cards show High/Normal but no trust model behind it (L1–L4)
2. **No evidence / lineage** — chat context blob is raw JSON, not a structured "here's what I read"
3. **No Intent negotiation** — clicking a card jumps to full conversation; no lightweight soft-confirm for low-risk items
4. **Feed is empty** — "No work plans found" — great concept, needs populated demo content
5. **Conversation creates new thread every time** — confirmed bug, breaks continuity
6. **No Neural Core state** — no visual feedback that Jarvis is thinking/executing/idle
7. **Behaviour test modal shows raw system prompt to user** — exposes implementation, erodes trust
8. **Dashboard is 4 equal columns** — Aditi explicitly said "we need not have four columns, maybe four sections"
9. **No sidebar chat panel** — Aditi explicitly asked for Slackbot-style inline chat instead of full tab switch
10. **No persona differentiation** — Employee and Manager see identical layout

### Narrative gaps (for stakeholder demo)
- No story arc — demo jumps feature-to-feature with no "day in the life" thread
- No proactive nudge moment — the product's key differentiator is never shown
- No "before Jarvis / after Jarvis" contrast
- Manager JTBD (team readiness, approval batching) is not demoed at all

---

## Demo story — 6-scene narrative arc

**Character:** Alex, a Senior Product Manager at a fictional company "NovaCorp"

| Scene | Beat | Key interaction |
|-------|------|----------------|
| 1 | Monday 9 AM — Alex opens Teams | Jarvis welcome + Salesforce SSO login | 
| 2 | Dashboard loads — "here's what matters" | 4 sections, proactive nudge banner, priority items |
| 3 | Alex clicks a Pending item (L2) | Sidebar chat panel slides in (not full tab switch) — soft confirm toast |
| 4 | Jarvis proactively detects a Salesforce incident | Notification badge → actionable nudge → one-click |
| 5 | Alex switches to Manager view | Team readiness brief, burnout flag, approval digest |
| 6 | Alex creates a new Behaviour | Template → AI generates plan → test → activate |

---

## Design decisions for v3 prototype

### Layout
- **Shell:** Microsoft Teams chrome (white top bar, left nav rail) — not our dark ambient shell
- **Dashboard:** Vertical scroll with 4 **stacked sections** (not 4 columns) on wide screen; cards in 2-col grid within each section
- **Sidebar:** Persistent right panel for chat (Slackbot pattern) — slides open without leaving dashboard
- **Top nav:** Dashboard · Feed · Personalise (3 tabs, clean)

### Interaction model
- Low-risk items (L1/L2): soft confirm inline on card — no full screen
- High-risk items (L3/L4): sidebar chat expands to negotiation workspace
- Feed: populated timeline of Jarvis background actions with status chips
- Notifications: bell with badge + popover tray (max 3)

### Visual language
- Follow Microsoft Fluent design: white backgrounds, blue (#6264A7 Teams purple / #0078D4 blue) accents
- Cards with subtle shadow, 8px radius, clean type
- Priority chips: red=High, amber=Normal, grey=Low
- Source chips: small logo + label
- NOT our dark theme — this needs to feel like a Teams-native app for marketplace approval

### Personas
- Toggle between "Alex (Employee/PM)" and "Alex (Manager)" in top right
- Manager view shows team readiness section replacing personal items
