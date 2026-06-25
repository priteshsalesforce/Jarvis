# Jarvis — DVS-266 Narration Script

**Companion to:** `dvs-266-presentation.html` (15 slides)
**For:** Live presentation to Nassan (VP, UX Design) · ~25 min talk + crit
**Delivery notes:** ~150 words/min. Lead with numbers, not adjectives. Pause on the BHAG. The middle of the deck is about the *product and interaction model* — the use case is proof of it, not the whole story. Hand the floor over at the end; the crit is the point of the meeting for him.

> The live prototype is the centerpiece **between Slide 8 and Slide 10**. Run the `reschedule` flow in the app, then return to Slide 10. Slide 9 is your fallback if the demo hiccups.

**Shape of the talk:**
1. **Pain → BHAG** (slides 1–3) — why this matters, the bar we set.
2. **The product** (slides 4–7) — what Jarvis is, the Intent concept, how an employee interacts, the UI. *This is what Nassan grades hardest: product and interaction, not a single flow.*
3. **The proof** (slides 8–10 + live demo) — one Intent lived end to end.
4. **The case** (slides 11–15) — business, partnerships, vision, validation, crit.

---

## Slide 1 — Title

> "Thanks for the time. In the next 25 minutes I want to show you Jarvis — the autonomous personal assistant for employees. First the problem and the bar we set. Then the product itself — the interaction model and how an employee lives with it day to day. Then I'll prove it with one flow, live. Hold your questions if you can — I've left the back half for crit."

*Then advance.*

---

## Slide 2 — The problem (quantified)

> "Meet Alex Rivera, a senior PM. A higher-ranked person drops a mandatory meeting on the calendar — and the day collapses. To clear a single 2 PM, Alex fires seven separate messages across two tools, and loses about forty minutes a day to rescheduling, apologising and chasing. When we walked PMs through the current flow, every one of them needed help to get it right."

*Then read the customer quote verbatim — that's the voice of the user, not a paraphrase:*

> "Killer use case is an ideal EA. Sets up meetings, cancels and adjusts them automatically as messages from higher-ranking people come in… keeps the user in the loop for approval of all correspondence — in batch mode, one message to handle 13 threads. It should NOT add to the noise. It should ALWAYS merit your time."

**Delivery:** Read the numbers flatly. No adjectives — the data carries it.

---

## Slide 3 — BHAG (the stake in the ground)

> "So here's our bar — not evolution, revolution."

*Read the line deliberately:*

> "Clear a blown-up afternoon in one tap — under sixty seconds, zero help docs."

*Then the sub-line:*

> "Consumer-grade simple. Zero reliance on help docs. If a user needs documentation to clear their afternoon, we haven't done our job."

**Delivery:** Slow down. Pause after the BHAG line and let it sit before moving into the product.

---

## Slide 4 — What Jarvis is (the product idea)

> "Before the demo, the product idea — because the use case is just one instance of it. Most work tools hand you a dashboard: a list of burdens you have to process. Jarvis inverts that. It works in the background and hands you a short brief — what it already handled, and the few things that actually need you. The mental model isn't a chatbot you query; it's a colleague that did the night shift. Everything you see is framed as what Jarvis did *for* you, before what you need to do."

**Why it's here:** Answers his "designed, not engineered" test — the UI mirrors the employee's mental model, not the backend.

---

## Slide 5 — The Intent (the core concept)

> "The atomic unit of the whole product is the Intent — a negotiable unit of work, not a task and not a ticket. Every Intent moves through the same four states: Jarvis stages a draft, you negotiate and tailor it, the background fleet executes, and it manifests as done. The user learns one interaction pattern and it works everywhere — rescheduling, an HR case, a leave plan. And every Intent carries its sources, so it's never a black box."

**Why it's here:** This is the ontology — his Rule C1. It's what makes Jarvis a coherent product instead of a pile of features.

---

## Slide 6 — How an employee interacts (a day with Jarvis)

> "Here's how Alex actually lives with it. Setup happens once, inside Teams — pick your tools, set quiet hours, and turn one dial: how eagerly should Jarvis help — handle what you can, draft it I'll decide, or ask me every time. That single dial controls the whole experience without exposing any complexity. Then every morning: one brief. Open an Intent and a panel slides in *inside* the app — it shows what it read first. You negotiate or approve — edit a line, a soft confirm, or one tap. And everything lands in the Feed, reversible. Five moments. No portal-hopping."

**Why it's here:** Persona-centricity — his Rule C2. Grounds the abstract model in a real day.

---

## Slide 7 — Interface anatomy (the UI)

> "One calm surface carries all of this — the Today view, built on four ideas. The Neural Core is Jarvis's living presence — it breathes when idle, pulses when working, so you always feel its state without a Loading spinner. The Horizon shows your day as space, not load. Intent cards are negotiable, each with source chips and a silent risk tier. And the Whisper Bar lets you talk to it, not query it. The same shell carries every surface — the chat panel, the Feed, Skills you can toggle, and a manager view with team-readiness signals. One consistent system, not ten screens."

**Why it's here:** The craft and consistency story — his Rules C7/C8 (Lightning consistency, fluid interaction).

---

## Slide 8 — The hero flow (demo setup)

> "You've seen the model — now watch one Intent lived end to end. This is Marc's Mandatory Review. Marc is an SVP; he outranks Alex's whole afternoon. Watch for two beats: the batch card in the middle — that's the design thesis — and the single gate near the end, the right friction in exactly the right place."

*Then switch to the prototype and run the `reschedule` flow end-to-end.*

---

## [LIVE DEMO] — run in the prototype

Narrate each graded value as it happens:

1. **The interrupt** — "One calm notification. This is the *only* ping — don't add to the noise is a design value, not an accident."
2. **What it read** — "Before it does anything, it shows its work: Marc's invite, why he outranks the afternoon, the three conflicts. Every claim traces to a source. It reads signals, not your private messages."
3. **The plan** — "Move the 1:1, decline the vendor with a reschedule offer, let the sprint sync run without you. Each line editable — this is the Intent in its 'negotiating' state."
4. **The batch (hero)** — "Here's the moment. Seven messages, drafted in Alex's voice, handed over as one card."
5. **Inspect & tweak** — "Open the note to Sarah, soften one line — 'so sorry for the short notice.' The judgement is yours; the labour is Jarvis's."
6. **One approval + gate** — "One tap approves all seven. Because one declines an SVP-adjacent meeting, Jarvis asks once more, with the reason spelled out. The right amount of friction, only where it matters."
7. **Done & reversible** — "Sent. Afternoon cleared. The Intent has manifested — logged in the Feed as one entry, reversible with one click."

*Return to Slide 10.*

---

## Slide 9 — The batch card (fallback / north-star image)

*Use this slide if the live demo can't run, or to re-anchor the hero moment in the deck.*

> "Here's the moment. To clear 2 PM normally means seven separate messages. Jarvis drafts all seven, in Alex's voice, and hands them over as one card. Thirteen interruptions become a single decision. This is what 'don't add to the noise' looks like as an interface."

---

## Slide 10 — The trust contract (silent tiering)

> "Behind every action is a risk tier — but the user never sees a label. They feel the right amount of friction at the right time. Reading the inbox? Just done. Sending in your name? Shown in full first. Declining a meeting on an SVP-adjacent thread? One light gate with the reason spelled out. And everything is logged and reversible with one tap. The promise is simple: Jarvis reads signals, not secrets — and nothing that touches another person sends without your OK."

**Why it's here:** This is the interaction model's safety layer — and it pre-empts his "engineered, not designed" pitfall. The tier model drives behaviour silently; no L1/L2/L3 jargon anywhere.

---

## Slide 11 — Business outcomes

> "A vision needs a business case. Three ways this ladders up. Save time: about forty minutes a day per knowledge worker, multiplied across headcount. Save money: routine HR and IT requests get completed conversationally, so fewer ever reach the service desk. Make money: if Salesforce owns the employee action layer, the surface expands from HR Service into how all work gets done."

**Delivery:** Three crisp sentences. Don't linger.

---

## Slide 12 — Partnerships + competitive leapfrog

> "This doesn't get built in a silo. It rides Agentforce, plugs into HR Service Cloud, co-sells through the Teams marketplace, and orchestrates Workday and ServiceNow. And on the right is the leapfrog: Copilot and Glean answer questions. They don't quietly reshuffle your calendar by rank and hand you one batch approval. That orchestration — propose, batch, one-tap, reversible — is the thing competitors can't do today."

---

## Slide 13 — Vision, 3 releases out

> "Today it's one employee and one cleared afternoon. Next release: Slack parity, per-item hold in the batch, richer manager signals. Two out: cross-vendor orchestration — Workday, ServiceNow and Salesforce in one flow — plus voice and mobile. Three out: Jarvis becomes the default employee surface, replacing portal-hopping for HR, IT and ops. The assistant stops being a chatbot and starts being how work gets done."

---

## Slide 14 — Validation honesty

> "A note on rigour, because I know it matters to you. The pain here is already evident, so we deliberately spent our time on vision and craft rather than over-proving the problem. We've run a full heuristic pass against Fitts, Hick, Miller and peak-end. What we have *not* yet done is sit users in front of it — so next week I'm running a lightweight study: five PMs, one task — clear your afternoon — measuring ease, confidence and success against a six-and-a-half-to-seven-out-of-seven bar. I'd rather show you a plan than a fabricated number."

**Why it's here:** This is the single most important framing. User-validation is the thing Nassan hammers on. Turning the gap into a *deliberate, planned choice* is far stronger than a fabricated score.

---

## Slide 15 — Close / hand to crit

> "That's the ideal EA: it earned the interruption, and it never added to the noise. I'd love your read — especially on the Intent model and the trust contract, and whether the batch card carries the weight I think it does."

*Then stop talking and listen.*

**If asked "where does this go?"** — use the vision lines verbatim:
- **Next release:** Slack parity, per-item hold in batch approval, richer manager signals.
- **+2 releases:** Cross-vendor orchestration (Workday + ServiceNow + Salesforce in one flow), voice + mobile.
- **+3 releases:** Jarvis as the default employee surface — proactive, in-the-flow, replacing portal-hopping for HR, IT, and ops.

---

## Timing budget (~25 min + crit)

| Slide / beat | Target | Cumulative |
|---|---|---|
| 1. Title | 0:30 | 0:30 |
| 2. The pain | 2:00 | 2:30 |
| 3. BHAG | 1:00 | 3:30 |
| 4. What Jarvis is | 1:30 | 5:00 |
| 5. The Intent | 1:30 | 6:30 |
| 6. How an employee interacts | 1:30 | 8:00 |
| 7. Interface anatomy | 1:30 | 9:30 |
| 8. Hero flow setup | 0:45 | 10:15 |
| **Live demo** | 7:00 | 17:15 |
| 10. Trust contract | 1:45 | 19:00 |
| 11. Business outcomes | 1:30 | 20:30 |
| 12. Partnerships + leapfrog | 1:30 | 22:00 |
| 13. Vision | 1:15 | 23:15 |
| 14. Validation | 1:15 | 24:30 |
| 15. Close | 0:30 | 25:00 |
| **Crit / Q&A** | 5:00+ | 30:00 |

**The non-negotiables:** the pain (2), the BHAG (3), the Intent model (5), the live demo, and the trust contract (10). Those are the design thesis.

**If you run long:** merge slides 6 and 7 into a single "how it works" beat, trim Slide 13 to first and last lines, and cut Slide 11 to one sentence.
