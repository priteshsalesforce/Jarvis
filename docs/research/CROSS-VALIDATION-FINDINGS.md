# Cross-validation findings — prototype v2

**Date:** 2026-05-01  
**Prototype:** `web/src/App.jsx` (full redesign)  
**Reviewer:** UX/UI design audit against `CROSS-VALIDATION.md` scenarios

---

## Part A — Trust calibration scenarios

| # | Scenario | Expected feel | Finding | Pass? | Severity |
|---|----------|---------------|---------|-------|----------|
| 1 | JARVIS books a room without asking (L2) | Soft confirm + undo; **no modal** | ✅ L1/L2 intents now route to `SoftConfirmToast` — a lightweight bottom toast, no blocking modal. Undo not yet present. | **Partial** | Low |
| 2 | JARVIS drafts an email but doesn't send (L1) | User sends; provenance optional | ✅ L1 intents use soft confirm. Draft is shown in synthesis without auto-sending. No forced evidence card. | **Pass** | — |
| 3 | JARVIS proposes prod deploy (L4) | Workspace opens; human-req on dangerous steps | ✅ L4 intents (`nexus_deploy`, `incident_response`) open the full Negotiation Workspace. All traffic-shift/deploy steps are tagged `human-req` with lock icon and amber warning strip. | **Pass** | — |
| 4 | User says "wait" mid-execution | Execution pauses after current step | ✅ `parseCommand()` maps "wait/hold/pause" → discourse.pause response. Reply says "I'll hold after the current step." However: no visible pause indicator on the intent card itself during executing state. | **Partial** | Medium |
| 5 | User gets 6 proactive banners in 10 min | Throttled / batched; feels loud if not | ✅ Notification tray limited to `slice(0, 3)` visible at once. Bell badge shows count. Tray is opt-in (tap bell). Not auto-popped. | **Pass** | — |
| 6 | High-risk action completes with no Context Cards | L3+ must show ≥1 snippet | ✅ L3/L4 intents all have `evidenceRefs` arrays with full `ContextCard` components. Evidence tab surfaced in Workspace. However: evidence tab is not **defaulted open** for L3+ — user must click to it. | **Partial** | Medium |
| 7 | Stale Jira shown as current | Stale badge or degraded Core state | ⚠️ `trustLevel: 'stale'` field exists on `EvidenceRef` model and `ContextCard` renders a "Stale" badge. But no current intent has a stale source in the dataset — the scenario isn't triggerable in the prototype yet. | **Not testable** | Medium |
| 8 | Whisper contains employee SSN pasted by mistake | PII masked before model/log | ❌ No PII masking in `WhisperBar`. Input goes straight to `handleWhisperCommand()`. No regex guard, no masking UI feedback. | **Fail** | High |
| 9 | Nexus bundles unrelated tickets | Merge vs link tree respected | ✅ Nexus intents (`onboarding_nexus_emp`, `onboarding_dev`, `hiring_nexus`) all show per-silo lanes. Unrelated intents are separate cards. The "Related" chip pattern from the spec is not yet implemented. | **Partial** | Low |
| 10 | Manager sentiment intent shows raw DMs | Aggregate only; not creepy detail | ✅ `burnout_alert` evidenceRef explicitly states "Aggregate only — no raw DMs read." Kind is `inference`, trust is `partial`. This is surfaced in the ContextCard. | **Pass** | — |
| 11 | Neural Core never stops vibrating | Idle returns to calm motion | ✅ CSS `@keyframes breathe` (4s period, gentle opacity) used for idle. Thinking uses `think` (fast alternate). Executing uses `heartbeat`. Each is distinct and idle is calm. | **Pass** | — |
| 12 | "Confirm" accepted for vague L4 action | Echo + second step required | ⚠️ `parseCommand` only allows "confirm/go ahead" auto-execute for L1/L2. L3/L4 goes to Workspace. However: inside the Workspace, the Execute button has no two-step confirm or echo of concrete nouns for L4 specifically. Single click executes. | **Partial** | High |

---

## Part B — Traceability review (L3+ paths)

| Check | Question | Status | Note |
|-------|----------|--------|------|
| B1 | Is Negotiation Workspace shown before execute on L3+? | ✅ Pass | `handleOpenIntent` routes tier L3/L4 to workspace via `setCoreState('confirming')` + `setSelectedIntent` |
| B2 | ≥1 EvidenceRef snippet tied to headline claim? | ✅ Pass | All L3/L4 intents have ≥2 evidenceRefs with snippet-level facts |
| B3 | Inference vs Fact distinctions visible? | ✅ Pass | `kind` pill in ContextCard shows Fact (emerald) / Inference (purple) |
| B4 | human-req steps impossible to auto-complete? | ✅ Pass | Steps tagged `human-req` render lock icon + amber warning "cannot auto-execute" |
| B5 | Freshness shown for time-sensitive evidence? | ✅ Pass | `capturedAt` shown on every ContextCard |
| B6 | If source fails, UI enters Degraded? | ❌ Fail | No degraded state triggered by source error in current prototype. `coreState: 'degraded'` exists in HUD config but nothing sets it. |

---

## Part C — Retro findings summary

### "Too quiet" failures found
- **S8 (High):** No PII masking in Whisper Bar — SSN or sensitive data would pass through silently.
- **B6 (Medium):** No degraded state when a source is unavailable — system would appear confident on stale/failed data.
- **S12 (High):** L4 Execute button has no two-step confirm. A single click on "Execute plan" fires the action after the Workspace review but without echoing the specific action back.

### "Too loud" failures found
- None critical. Notification throttle works. L1/L2 toast is lightweight.

### Calibration gaps (medium)
- **S4:** "Wait" command acknowledged in chat but no visual pause indicator on intent card.
- **S6:** Evidence tab not defaulted open for L3+ — users may not discover it before executing.
- **S7:** No stale-source test data present. Scenario untestable until a stale evidenceRef is added.
- **S9:** "Related" chip (for weakly-correlated intents that don't merge) not implemented.

---

## Prioritised fixes

| Priority | Fix | Status | Where |
|----------|-----|--------|-------|
| 🔴 P0 | Two-step L4 execute: echo action + typed `EXECUTE` token | ✅ Done — v2.1 | `IntentWorkspace` → arm → token input |
| 🔴 P0 | PII guard in Whisper: mask SSN/card/phone before submit; warn user | ✅ Done — v2.1 | `WhisperBar` → `sanitisePII()` |
| 🟡 P1 | Default Evidence tab open for L3/L4 so users see proof first | ✅ Done — v2.1 | `IntentWorkspace` initial tab state |
| 🟡 P1 | Stale evidenceRef on `incident_response` (Redis cluster data) | ✅ Done — v2.1 | Data layer |
| 🟡 P1 | Visual pause + executing overlays on IntentCard | ✅ Done — v2.1 | `IntentCard` + `executingIntentId` / `pausedIntentId` in App |
| 🟢 P2 | Degraded state triggered by source fetch failure simulation | ⏳ Backlog | `IntentWorkspace` |
| 🟢 P2 | "Related" chip for weakly-correlated intents | ⏳ Backlog | `IntentCard` |
| 🟢 P2 | Undo affordance for L2 soft-confirm executions | ⏳ Backlog | `SoftConfirmToast` |

**Build:** ✅ Clean — 163ms, no errors (verified `npm run build`).
