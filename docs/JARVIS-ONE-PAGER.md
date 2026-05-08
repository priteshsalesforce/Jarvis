# Jarvis — One-Pager

**Your personal AI assistant at work. Inside Microsoft Teams.**

---

## What it is

Jarvis is an AI assistant for every employee at the company. It lives inside Microsoft Teams, watches the work systems you already use — Outlook, Calendar, OneDrive, Workday, Salesforce, Jira — and quietly handles the small stuff so you can focus on the rest. It asks before doing anything bigger.

Not a chatbot. **An action layer between you and the systems you already use.**

---

## The product in three ideas

| | |
|---|---|
| **Watches what matters** | One short brief every morning of what needs you today. |
| **Handles the small stuff** | Reminders, meeting prep, routine PTO, training nudges — handled, with one-click Undo. |
| **Asks before anything bigger** | Anything that affects other people — replies, requests, approvals — waits for your OK. |

---

## The user journey in 60 seconds

1. **Welcome** → 3 sections: what it is, how it works, why it's safe. One CTA.
2. **Setup** → 3 steps inside Teams: pick your tools, pick how eagerly it should help, set quiet hours. ~30 seconds.
3. **Today** → A daily brief of prioritised cards. *I handled 3 things overnight. 5 need you now, 2 can wait.* The hero card today is *"Your parental-leave plan needs sign-off before Friday"* — Jarvis already drafted the full handoff across Workday, Outlook, IT, and your team.
4. **Click a card** → A side chat opens inside the app. Jarvis writes prose, shows its thinking inline (4 plain-language steps), and offers tiered actions — file PTO autonomously, draft a handover note for review, or nominate a backup approver behind a confirmation gate.
5. **Audit trail** → Every action Jarvis takes lives in the Feed. One click to undo. No permanent surprises.

---

## Tiered actions — the trust contract

Behind the scenes, every action carries a tier. The user never sees the tier label; they see the right friction at the right time.

- **Autonomous** — Jarvis just does it. Logged with Undo.
- **Draft, you decide** — Jarvis drafts; you review and Send.
- **Confirm inline** — A short *Continue?* row before it runs.
- **Gate** — A modal with the policy line, an *I confirm* checkbox, and Run.

The user picks how eagerly Jarvis should help during Setup — *handle what you can*, *draft it I'll decide*, or *ask me every time*. That single dial controls the whole experience without exposing any of the underlying complexity.

---

## What you saw in the demo

| Surface | Job |
|---|---|
| **Welcome** | Sets the trust contract. 3 sections. |
| **Setup** | 3 plain-language steps inside Teams chrome. |
| **Today** | The home page. Whisper bar at the top, intent cards in the middle, schedule on the right. |
| **Chat panel** | Opens inside the app from any intent. Gemini-style prose, inline thinking accordion, tiered actions. |
| **Conversations** | Persistent history with Gemini-style sidebar — pin, search, new chat. |
| **Skills** | Recurring jobs Jarvis does on a schedule. One toggle per skill. |
| **Feed** | The audit trail. Every action, every step, with Undo. |
| **What I can do** | Conversational drawer — tell Jarvis to add or stop helping with something. |
| **Manager view** | Same shell, manager-grade signals — burnout, approvals, onboarding, hiring. |

---

## What's deliberate

- **No L1 / L2 / L3 / L4 jargon anywhere.** The tier model drives behaviour silently.
- **No avatar bubbles for Jarvis.** Reads as a document, not a chat log.
- **No "AI chief of staff" positioning.** This is for *every* employee, not senior leadership.
- **Inline chat panel, not floating overlay.** Lives inside the app, not over the Teams shell.
- **Sticky, centered title with one Related button.** No tab strip clutter.
- **Hover-only feedback icons** so the page reads clean by default.
- **Plain language in thinking steps.** No plugin badges, no system jargon.

---

## What's in MVP scope

From the PRD:

- ✅ Daily brief with actionable items
- ✅ Conversational retrieval across MS + Salesforce + Workday context
- ✅ Action-taking on low-risk tasks (autonomous, drafted, gated)
- ✅ Routine admin completion (PTO, training, IT tickets, profile)
- ✅ Proactive notifications via Teams
- ✅ Personalisation + guardrails (the Setup trust dial)
- ✅ "What I can do" capability discoverability
- ✅ Skills framework with OOTB + suggested skills
- ✅ Teams app + chat dual surface
- ✅ Manager team-readiness brief

**Deferred for now:** Slack parity, voice, mobile, full multi-vendor cross-platform workflows.

---

## Why this matters

- **Productivity.** Less context-switching, less portal-hopping. The same employee handles more in a day with less friction.
- **Service-cost reduction.** Fewer routine HR/IT tickets ever reach the service desk because Jarvis completes them conversationally.
- **Better employee experience.** A proactive, in-the-flow-of-work assistant beats another portal.
- **Manager effectiveness.** Managers spend more time on exceptions and team readiness, less on repetitive approvals.
- **Strategic platform value.** If Salesforce owns the employee action layer, the surface area expands from HR Service into broader employee work over time.

---

## The promise

> Every action is logged. Every action is reversible. Anything that affects other people waits for your OK. Jarvis reads signals, not secrets.

That promise is the product. Everything else is implementation.

---

*Built on Salesforce Agentforce · © 2026 OrgFarm EPIC*
