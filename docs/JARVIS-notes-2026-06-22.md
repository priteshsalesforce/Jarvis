# Jarvis — Meeting Notes & Action Plan

**This file stays in the Jarvis project.**

**Source:** "Autonomous ITSM DVS discussion" (Google Doc) · **Attendees:** Tanmay Jyot, Pritesh Chavan, Shantanu Singh · [Recording](https://drive.google.com/file/d/1KgRXPn5HEBIElpmTF9DkedPIVX35c6oT/view)
**Captured:** Jun 22, 2026

> Only the Jarvis-specific points from that meeting are below. The ITSM items (headless setup, autonomous detection, agentic UI, theme categorization, the 5-min DVS deck) live in the separate Autonomous ITSM notes.

---

## What belongs to this project (segregated)

### Decision — merge Home + Conversation into one unified view
- The Jarvis UI will **merge the Home and Conversation views into a single, cohesive space** rather than keeping them separate.
- Move **away from a task-based collaboration-tool pattern** toward a true **personal assistant**.
- Interaction-model feedback (Shantanu's critique of the current prototype):
  - Clicking a task opening a **separate** side panel/thread reads too much like a collaboration tool.
  - **Conversation history should not be treated as a separate item** — it belongs in the unified space.
  - Goal: avoid the confusion of switching contexts between "Home" and "Conversation."

### Open debate (UNRESOLVED) — Teams-first vs native assistant
- **You:** anchor on **Microsoft Teams** because ~**80% of customers** work there.
- **Shantanu:** the design vision should prioritize a **native assistant experience**, not be constrained by a collaboration tool's design limits (he used Slack as the cautionary example).
- This needs a decision before the Jarvis positioning is locked.

---

## Your tasks (from the notes)

| # | Task | Owner | Notes |
|---|------|-------|-------|
| 1 | Merge the Home + Conversation interface into one unified layout | Pritesh | Core design change to the prototype |
| 2 | Resolve the Teams-first vs native-assistant direction | Pritesh + Shantanu | Currently unresolved |

---

## How I can help — and what I need from you (per task)

**1. Merge Home + Conversation into a unified view**
- *I can:* implement the merge in the existing prototype (`web/src/App.jsx`) — fold the conversation thread inline into the Home/Today view so clicking a task continues in-place (no separate tab), with conversation history living in the same space.
- *I need from you:* (a) confirm you want me to build this in `web/src/App.jsx`; (b) the desired interaction — e.g. task click expands an inline thread vs. a persistent right rail that's part of Home; (c) any reference pattern you like (Gemini/ChatGPT unified canvas, etc.); (d) whether the left "Conversations" nav item should go away entirely.

**2. Resolve Teams-first vs native assistant**
- *I can:* write a short **decision brief** — pros/cons of each, what each implies for the UI, and a recommendation — so you and Shantanu can settle it quickly.
- *I need from you:* (a) any customer data behind the "80% on Teams" claim; (b) whether "native" means a standalone Salesforce app, an OS-level assistant, or embedded-in-Lightning; (c) who makes the final call and by when.

---

## Open questions to resolve
- Does the merged Home+Conversation change affect the Jarvis DVS deck/demo we already built (Marc's Mandatory Review)?
- Is Jarvis a **separate DVS vision** from Autonomous ITSM, or the assistant layer shown *within* the ITSM vision?
- Final positioning: Teams-first, native, or surface-agnostic?
