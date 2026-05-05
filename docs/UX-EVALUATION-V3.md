# Jarvis v3 — UX/UI Evaluation

**Evaluated against:** AMBIENT-FLOW-INTERFACE.md · UX principles · Psychological principles · UI design principles

---

## Verdict summary

The v3 prototype is **functionally correct but experientially inert**. It solves the "what" (right data, right structure) but completely ignores the "how it feels" — which is what determines whether a user returns every morning or abandons the app after three days. Below is the precise diagnosis.

---

## 1. Against AMBIENT-FLOW-INTERFACE.md

The manifesto defines five core concepts. None of them are honoured in v3.

| Manifesto concept | What it requires | What v3 does | Gap |
|---|---|---|---|
| **The Horizon** | Temporal view of the day. Show *space* rather than *load*. "You have space to create" not "You have 6 meetings". | Section header says "Today's Important Events". Grid of cards. No time dimension. No sense of flow. | ❌ Complete miss |
| **Intents** | Negotiable units of work with a lifecycle: staged → negotiating → executing → manifested. | Cards have no lifecycle state. Done = disappear. There is no negotiation, no staged state, no manifested confirmation. | ❌ Complete miss |
| **The Nexus** | Cross-functional bundles (IT + HR + Ops) as one card showing per-silo status. | Not present at all in v3. | ❌ Absent |
| **Neural Core** | Single-persona AI identity. Non-verbal state communication — breathing when idle, heartbeat when executing, amber when degraded. | Jarvis is a plain letter "J" in a purple circle. No state. No animation. No life. | ❌ Complete miss |
| **The Whisper Bar** | Bottom-anchored, feels like talking to a person not typing a query. Placeholder changes by context. | Plain input in a footer bar. No focus animation, no contextual placeholder change, no state feedback. | ⚠️ Partial |

**Manifesto alignment score: 1/5**

---

## 2. Against UX Design Principles

### 2.1 Hick's Law — the time to decide increases with the number of choices
**Violation.** Every dashboard card presents 4 actions simultaneously (✓ × 💬 ↗). With 10–12 cards visible, the user faces ~48 micro-decisions before they've even read anything. The primary action (chat with Jarvis) is the same visual weight as dismiss. There is no hierarchy of intent.

**Fix needed:** Primary action only visible on hover or as a single "Act" CTA. Secondary actions (done/dismiss) are gestural or on right-click.

### 2.2 Fitts's Law — targets should be large and close to the cursor
**Violation.** The four action icons are 15×15px, tightly packed, no touch target padding. On a 1x screen they are genuinely hard to hit accurately.

### 2.3 Miller's Law — 7 ± 2 chunks in working memory
**Violation.** The dashboard shows 4 sections × 3–4 cards = 12–16 items simultaneously. There is no progressive disclosure. Everything is presented at full detail at once. The user's brain is immediately overloaded.

**Fix needed:** Collapse sections to one-line summaries with a count. Expand on demand. Or show a maximum of 3 items per section with a "see all" affordance.

### 2.4 Jakob's Law — users expect familiar patterns
**Partial pass.** The Teams chrome is familiar. But the card-grid layout looks like a Jira board, not a personal assistant. It creates the mental model "this is a task tracker" not "this is my AI co-worker."

### 2.5 Von Restorff Effect — the thing that stands out is remembered
**Violation.** Everything is the same visual weight. High priority items look almost identical to Normal items — a 2px red dot is the only differentiator. Nothing pops. There is no moment that says "this is the one thing that matters right now."

**Fix needed:** A hero "most critical intent" at the top — full width, distinct treatment, before the grid begins.

### 2.6 Progressive Disclosure
**Violation.** Every card shows full body text (2–3 lines), source tag, source ref, and 4 actions. This is maximum information density with no disclosure hierarchy. Users who just need a quick scan are forced to read everything.

### 2.7 Aesthetic–Usability Effect
**The core problem.** Research consistently shows that users perceive more beautiful interfaces as easier to use, even when they are functionally identical. They also tolerate minor usability failures in beautiful products. v3 is aesthetically forgettable — grey cards on a grey background with small purple accents. It does not trigger the aesthetic–usability heuristic at all. Users will not want to return to it.

### 2.8 Goal Gradient Effect — motivation increases as you approach a goal
**Missing entirely.** There is no sense of progress. No "you've cleared 4 of 11 items" indicator. No satisfying completion state. No streak or momentum signal. Users get no psychological reward for returning and processing their brief.

**Fix needed:** A day-completion arc or progress bar that depletes as items are actioned. A satisfying "day cleared" moment.

### 2.9 Endowment Effect — we value things more once we've personalised them
**Missing.** The app does not feel like *Alex's* assistant. The greeting says "Good morning" but there is no personalisation visible on the surface. No name. No "last time you did X." No sense of memory.

### 2.10 Peak-End Rule — people judge experiences by their peak moment and their ending
**Missing.** There is no peak moment in the v3 experience. No single moment of delight, surprise, or genuine magic that the user will remember and tell others about. The proactive notification is the closest thing but it's a generic red box.

---

## 3. Against Psychological Principles

### 3.1 Intrinsic motivation (Self-Determination Theory)
SDT says people are intrinsically motivated when they feel **autonomy** (control), **competence** (mastery), and **relatedness** (connection). v3 undermines all three:
- **Autonomy**: The user cannot customise what they see on the dashboard without going to a separate Personalise tab.
- **Competence**: No feedback that actions taken had an effect. Items just disappear.
- **Relatedness**: The AI has no personality. "J" in a circle is not a collaborator.

### 3.2 Cognitive Load Theory
**Working memory is limited to ~4 items.** v3 projects 12–16 simultaneously. This is the single biggest barrier to daily return. When opening the app feels like work rather than like relief, users stop opening it.

### 3.3 Disfluency effect (positive version)
Slight visual complexity in the *right places* (e.g., a rich "Neural Core" state indicator) makes the AI feel more capable and intelligent. v3's flat chrome does the opposite — it signals "basic tool."

### 3.4 Anchoring
The first thing a user sees anchors their mental model of the whole product. Currently the first thing is a grey card grid. The anchor should be: "Jarvis already did something for you this morning." — show what it did before showing what it wants you to do.

### 3.5 Variable Reward Schedule (Nir Eyal's Hook model)
The most habit-forming products have unpredictable rewards — you open them not knowing exactly what you'll find. v3's dashboard is completely predictable: same 4 sections, same cards, same format every time. There is no surprise. No "what did Jarvis figure out overnight?"

**Fix needed:** A "Jarvis insight" card that surfaces a genuinely unexpected synthesis — something the user would not have noticed themselves.

---

## 4. Against UI Design Principles

### 4.1 Visual hierarchy
**Absent.** Font sizes range from 10px to 14px. Everything is the same medium weight. The most important element — the primary action Jarvis wants you to take — is not visually dominant. A strong hierarchy would have: one H1 (today's most critical item), a secondary layer (the 4 sections), and tertiary detail (card body).

### 4.2 Colour as communication
**Underused.** The only colour in the interface is: the purple header bar, tiny coloured dots on priority chips, and a few coloured borders. The vast majority of the screen is #F3F2F1 grey on white. Colour should carry meaning (state, urgency, momentum) not just decoration.

### 4.3 Space and rhythm
**Wrong.** The 2-column grid creates a claustrophobic feeling. Cards bump against each other. There is no breathing room between sections. Paradoxically, adding more whitespace (larger gaps, taller section headers) would make the page feel like it has *less* content even though nothing is removed — reducing cognitive load.

### 4.4 Motion as communication
**Absent.** The manifesto dedicates an entire research doc to motion. v3 has zero intentional motion. No fade-in on load, no smooth transition when a card is dismissed, no breathing animation on the Neural Core, no progress indicator when Jarvis is thinking. Motion at the right moment — the card sliding away when marked done, the Neural Core pulsing when active — is not decoration. It is the difference between the app feeling alive vs feeling like a static webpage.

### 4.5 Typography
**Monotonous.** Using 4 different font sizes all between 10px–15px with weights ranging only from 400–700 creates visual sameness. A bold 28–32px "moment number" (e.g., the number of high-priority items) as a data viz element would immediately break the monotony and communicate at a glance.

### 4.6 The "first 5 seconds" test
A user opening Jarvis for the first time should understand within 5 seconds: **what the AI has done for me, what the most important thing is today, and what I should do first.** v3 fails this test — the eye has nowhere to land.

---

## 5. The core diagnosis in one paragraph

v3 is a **competent information display** wearing the skin of a **personal AI assistant**. It shows correct data in correct groupings. But it does not *feel* like an intelligent collaborator. It feels like a better-designed Jira board. The Ambient Flow manifesto calls for an interface that "grooms the workspace in the background and presents staged outcomes" — a **Horizon of Intents**, not a list of burdens. v3 presents exactly a list of burdens. Every card is something the user must do. There is no sense that Jarvis has already done work. There is no peak moment. There is no personality. There is no motion. There is no reward for completion. There is no reason to return tomorrow beyond obligation.

---

## 6. What v4 must do differently

### The non-negotiables
1. **Neural Core as a living entity** — animated state, not a static "J" circle. The core should breathe at idle, pulse when working, glow when something critical needs attention.
2. **Hero "Now" moment at the top** — before any list, show one dominant card: the single most important thing Jarvis has identified. Large. Striking. Actionable in one tap.
3. **Jarvis-first framing** — the dashboard header must lead with what Jarvis has *done*, not what the user needs to *do*. "I compiled your morning brief. 3 things need you today." Not just a list.
4. **Completion arc** — a visual day-progress indicator. As items are actioned, the arc fills. When all critical items are done, a satisfying "day cleared" moment. This is the goal-gradient + peak-end rule.
5. **Motion on every state change** — card dismissed: slide left + fade. Neural Core thinking: pulse. Item manifested: check animation. These are not decorations. They are the emotional layer.
6. **Progressive disclosure on cards** — card surface shows: title + priority + one-line reason + single CTA. Expanded state shows body. This reduces cognitive load by 60%.
7. **Jarvis "overnight insight"** — one card that says something the user genuinely didn't know. The unexpected synthesis that creates the variable reward moment.
8. **Colour with depth** — a richer palette that uses gradient, opacity, and saturation to separate layers. Not flat grey everything. The Neural Core aura, the section left-borders, the "now" card — each should have a distinct visual moment.
9. **Personality in microcopy** — Jarvis should speak like a sharp, trusted colleague, not a task tracker. "Before you start — here's what I found overnight." Not "Yesterday's Recap."
10. **Sidebar chat as a first-class surface** — not an afterthought. The Whisper Bar and sidebar should feel like the primary interaction surface, not a feature.
