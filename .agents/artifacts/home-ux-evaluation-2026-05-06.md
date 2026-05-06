# Home (Today) page — UX evaluation

**Date:** 2026-05-06
**Scope:** `web/src/App.jsx` — the `tab === 'today'` view (lines ~3454–3560), supporting components: `WhisperBar` (hero mode), `HeroCard`, `IntentCard`, `RightPanel`, Jarvis overnight insight block.
**Measured against:** DESIGN-BRIEF-V3.md, AMBIENT-FLOW-INTERFACE.md, UX-EVALUATION-V3.md, plus standard UX heuristics.

---

## TL;DR
The Home page is trying to be **three pages stacked on one screen**:
1. A Gemini-style "Hi Alex · Where should we start?" hero with a giant whisper bar + 4 prompt categories.
2. A "Your brief · N of M complete" section with filter pills + a Hero intent card + 4–6 intent cards + a "Jarvis overnight insight" block.
3. A full right-rail schedule from 9 AM → 11 PM (14 hours × 52 px ≈ 728 px tall) with events + wellness suggestions.

Every surface is well-designed in isolation, but competing for the F-pattern first fixation. The page **pushes the brief below the fold** and violates several principles laid out in the team's own `AMBIENT-FLOW-INTERFACE.md` and `UX-EVALUATION-V3.md`.

**Verdict:** The Home page is too long and too loud at the top. It needs a single anchor, not three.

---

## 1. What the page contains (measured)

| Section | Vertical cost (approx.) | Location in file |
|---|---|---|
| Demo chrome + Teams chrome + top nav | 36 + 48 + 52 = 136 px fixed | 3170–3389 |
| Hero whisper bar block (50% width, `margin: 50px auto`) — greeting + 34 px headline + input + tools row + 4 prompt categories | ≈ 340–380 px | 3458–3466, 2876–2994 |
| "Your brief · N of M complete" H2 | ≈ 56 px (incl. 14 px margin) | 3468–3476 |
| Filter pills (All / Meetings / Need decision / Follow-ups) | ≈ 52 px | 3478–3512 |
| Hero intent card | ≈ 200 px | 3519–3523 |
| Rest intents (6 more cards @ ~120 px each) | ≈ 720 px | 3524–3529 |
| Jarvis overnight insight card | ≈ 120 px | 3530–3549 |
| Right rail: 14-hour day grid | 728 px (fixed, scrolls with page) | 1007–1116 |
| Trailing padding `0 60px` | 60 px | 3455 |

**Total content height of Home:** ≈ 2200–2400 px — that's roughly 2.5–3 screen heights on a 900 px viewport. The user must scroll ~2.5 screens to see the last intent card.

**First viewport (900 px) above-the-fold shows:** Teams chrome + "Hi Pritesh / Where should we start?" greeting + the input pill, with only the top of the prompt category row. The *brief* — the whole reason the product exists — is **entirely below the fold**.

---

## 2. Where it violates the team's own manifesto

From `AMBIENT-FLOW-INTERFACE.md`:
> "Instead of presenting a user with a list of burdens (tasks), it presents a **Horizon of Intents**."
> "Show **space** rather than **load**."

And from `UX-EVALUATION-V3.md` self-critique:
> "Every card is something the user must do. There is no sense that Jarvis has already done work."

The current Home leads with **an empty prompt box** — so the very first thing the user is asked to do is **type**. That is the opposite of proactive. The hero intent (`"Legal approval is blocking your analytics pipeline"`) — which is literally the most important thing on the page — is buried ~400 px down.

From `DESIGN-BRIEF-V3.md`:
> "Hero 'Now' moment at the top — before any list, show one dominant card."

The Home page places the **whisper bar** in the hero position, not the **Hero intent card**. This is the core mis-prioritisation.

---

## 3. Issues ranked by severity

### P0 — Page-level structural problems

1. **The hero is the wrong element.** The Gemini-style "Where should we start?" treats Jarvis as a blank prompt box (like ChatGPT on a new tab). But Jarvis's differentiator is that it has *already done the work overnight*. The hero should be the Hero Intent Card + the "Jarvis overnight insight" — both currently below the fold. The whisper bar is a tool, not a destination.

2. **Content is stacked vertically when it should be layered.** The schedule (right column) and the brief (left column) start at the same Y but the hero whisper bar above them forces both to begin ~450 px down. Because the schedule is 728 px tall and the brief is ~1200 px, there's a messy empty stripe of right-rail gutter once the schedule ends.

3. **The "overnight insight" is hidden at the bottom.** The one piece of variable-reward content (the one thing UX-EVALUATION-V3.md explicitly says will create a "peak moment") is the *last* thing the user sees. This is the most valuable section in the entire product and it's visually identical to an intent card.

4. **Double-greeting + double-heading.** User sees:
   - "Hi Pritesh" → "Where should we start?" (34px)
   - "Your brief" (18px) + "3 of 8 complete"
   Two greetings, two page-titles. The second one is the real one. Pick one.

### P1 — Above-the-fold density

5. **Four prompt categories (Discover / Find / Create / Brainstorm) each open a dropdown of 4 prompts** = 16 hidden prompts + 4 visible category buttons + the placeholder example. That's a cognitive menu load reminiscent of a Word ribbon. First-run users don't know what any of these buckets mean; they'll either click all four or ignore them all. Violates Hick's Law *and* progressive disclosure.

6. **Whisper bar width is 50%** (`width: '50%', margin: '50px auto'`). On a 1440 px screen this is 720 px — fine. On a 1920 px screen it's 960 px, floating with ~480 px of empty gutter on both sides. The left-column brief below it is `flex:3` of `max-width:1280`. So the whisper bar can be **wider than the content it introduces** — it looks like a separate page.

7. **Filter pills always show zero counts** for some filters because the underlying regex is brittle (e.g. the `meetings` filter matches `/QBR|meeting|prep|standup|1:1|deploy|sync/` on `headline` — some cards with `prepReady:true` fall through, others over-match). Filters with zero should be de-emphasised or hidden.

8. **Right-rail schedule is fixed 14 hours tall regardless of what's in it.** 9 PM – 11 PM has one "Reading & wind-down" block and hundreds of px of white space. The rail height is driven by the grid, not the content density.

### P2 — Card-level issues

9. **Hero card and Intent cards look nearly identical.** The Hero has `fontSize:15` for title, the Intent cards also have `fontSize:15`. The only difference is `marginBottom: 12 vs 8` and slightly larger action icons. Von Restorff — the one thing that should pop does not. UX-EVALUATION-V3.md already flagged this for v3; v4 still has it.

10. **Tier (L1–L4) is completely invisible on the card.** `CardActionRow` hides on no-hover, and the tier color only appears as a 4px bullet before signal text (`background: m.color, opacity: .7`). The trust-tier system (L1 Low risk → L4 Gate required) is the core trust model per `DESIGN-BRIEF-V3.md` but a user cannot tell L1 from L4 at a glance.

11. **Card actions (Done · Remind · Remove) only appear on hover.** On a touchscreen or with a trackpad fly-through this is invisible. Fitts' Law + discoverability — if done/dismiss is the primary interaction, hiding it behind hover means most users will always click through to the ChatPanel.

12. **"Source" chips show vendor name, but the chip at the top + the chip at the bottom of the card are duplicated layouts** (source line above headline, evidence "· " list below). These convey almost the same metadata twice.

13. **Every card has `data-clickable`** and the whole surface opens ChatPanel — so clicking "Check ✓" to mark done requires stopping propagation precisely on a 24 px icon that only appears on hover. Miss by 8 px and you blow the card open instead of dismissing it.

### P3 — Motion / polish

14. **No motion tying the sections together.** The manifesto's "Neural pulse / fade-up / spatial drift" principles aren't applied on Home. Cards fade up with a 50 ms stagger (`enter` animation) and that's it. Nothing breathes after first paint.

15. **"Jarvis overnight insight" has no visual priority.** It uses the same radius (16 px), same surface, same shadow, same border as the intents above it. Given this is the one moment that creates return-usage, it should have a distinct treatment.

16. **Empty-state for the filter pills is broken** — if a user selects "Follow-ups" and there's only 1, the rest of the page shrinks oddly (because the right-rail is a fixed 728 px and the left becomes short).

---

## 4. Recommendations (prioritised)

### Do first (P0 — structural)

**R1. Collapse the hero. Lead with the brief.**
Replace the current 380 px greeting + whisper + category block with:
- A 56 px compact greeting strip: *"Good morning, Pritesh. I've compiled your brief — 3 things need you today."*
- Inline the whisper bar as a slim pill in the top bar (next to the Neural Core), OR leave it as the WhisperBar at the bottom (the compact variant already exists at line 2999). It shouldn't own the hero.
- Hero = the Hero Intent card (`intent.isHero === true`) — full-width, enlarged, distinct treatment.

**R2. Promote "Jarvis overnight insight" to position #2.**
Immediately under the Hero Intent card. Give it a distinctive treatment — gradient border or inline icon badge — so it doesn't look like another intent. This is the Variable Reward moment.

**R3. Cap the feed. Everything else behind a "see all".**
Show Hero + Overnight Insight + top 3 intents in priority order. Add a "See 4 more items" disclosure. This respects Miller's Law (7±2) which the repo's own UX-EVALUATION-V3.md calls out.

### Do second (P1 — density / width)

**R4. Let the page breathe by compacting the right rail.**
The 14-hour day is too much. Show only `now → now + 6 h` by default (≈ 300 px) with a "Show full day" toggle. Past events collapse into a 1-line "9 AM standup — done" summary.

**R5. Remove the prompt category dropdowns from Home.**
Keep the 3 chip suggestions inline (the existing `employeeChips`: `['Prep my 10 AM', 'Draft reply to Acme', 'What needs me today?']`). Move Discover / Find / Create / Brainstorm to the ChatPanel where the user has committed to a conversation.

**R6. Fix the filter-pill width + regex.**
Count per filter before rendering, hide filters with 0. Use `intent.kind` or an explicit tag instead of regex on `headline`.

### Do third (P2 — card semantics)

**R7. Make tier visible at a glance.**
Left border of the Intent card should be the tier color (3–4 px), not just the evidence bullet. L4 should look materially different from L1.

**R8. Show card actions always, not on hover.**
Replace `visible={hover}` with `visible={true}` on desktop + touch. Use 32 px targets. Put them on the *side* of the card (right column), not the corner, so they have real hit area.

**R9. De-duplicate source + evidence.**
Either the vendor chip OR the "Jira · CR-4471 · Gate at 2 PM" evidence line — not both. The evidence already contains the source name in most records.

### Do fourth (P3 — polish)

**R10. Add a 300 ms fade-in stagger on first paint** from hero → insight → intent 1 → intent 2 …, so the page assembles itself rather than arriving as a dense wall.

**R11. Make the Neural Core actually react** when the page loads — a "thinking" pulse while the brief renders, then settle to idle. Currently the core just sits.

---

## 5. Proposed new Home structure

```
┌──────────────────────────────────────────────────────────────┐
│  Teams chrome (fixed)                                        │ 136px
├──────────────────────────────────────────────────────────────┤
│  ┌─ Compact greeting ────────────────────────────────┐       │
│  │  Good morning, Pritesh · 3 things need you today  │       │ 56px
│  └───────────────────────────────────────────────────┘       │
│  ┌─ HERO INTENT CARD (full width, large) ─────────┬─────────┐│
│  │  L3 · Salesforce                               │Schedule ││
│  │  Legal approval is blocking your pipeline      │ (6h     ││ 260px
│  │  [Handle it] [Remind me] [Dismiss]             │  view)  ││
│  └────────────────────────────────────────────────┤         ││
│  ┌─ OVERNIGHT INSIGHT (distinct treatment) ───────┤ now     ││
│  │  ✨ Your Acme SOW cycle is 40% faster…         │ 9:45    ││ 120px
│  └────────────────────────────────────────────────┤ ──      ││
│  Brief                              3 of 8 complete│ 10:00   ││
│  [All 7] [Meetings 2] [Decide 3] [Follow 2]        │ QBR…    ││ 52px
│  ┌─ Intent card 1 ─────────────────────────────────┤         ││
│  ├─ Intent card 2 ─────────────────────────────────┤         ││
│  ├─ Intent card 3 ─────────────────────────────────┤         ││ 3×120
│  │  › See 4 more                                   │         ││
│  └────────────────────────────────────────────────┴─────────┘│
│  WhisperBar (bottom, slim)                                   │ 56px
└──────────────────────────────────────────────────────────────┘
```

**Total vertical content:** ≈ 900–1000 px — fits in a single viewport on 14" and up, one short scroll on 13".

---

## 6. Expected impact

| Fix | Principle it honors | Expected effect |
|-----|---|---|
| R1: Lead with brief, not prompt | Ambient Flow manifesto, Anchoring, Peak-End | First 5 seconds answer "what did Jarvis do for me?" |
| R2: Promote overnight insight | Variable Reward, Von Restorff | Creates a memorable peak moment |
| R3: Cap cards, disclose rest | Miller's Law, Progressive Disclosure | Cognitive load drops ~60% |
| R4: Compact schedule | Space > Load (manifesto) | Page feels breathable, not a wall |
| R5: Drop category dropdowns | Hick's Law | Fewer false starts |
| R7/R8: Tier visible, actions visible | Fitts, Jakob | Faster triage, fewer accidental opens |

---

## 7. Things the current Home does well (keep)

- The Teams chrome (top bar + left rail + tab strip) is genuinely convincing as a Teams-native app.
- The filter-pill pattern is the right interaction model — just needs the counts to actually be correct.
- `RightPanel` suggestion blocks (lunch, focus time, meditation, reading) are a nice differentiator — keep them, just fold them into a compact "After work" section by default.
- Color palette and Fluent token choices are well-structured in `THEMES.light/dark`.
- The welcome/loading state with `breathe` animation on the Sparkles icon is the kind of motion the rest of the app should pick up.
