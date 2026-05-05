# JARVIS research plan — simple version

**What this is:** A checklist of design questions to answer *before* we over-build. The result is **short written guides** (not more code at first).

**End result in one sentence:** Everyone agrees *when* the AI can act alone, *how* it shows proof, *how* it moves and talks, and *how* different job roles get different helpful intents.

---

## The six topics (plain English)

| # | Topic | What we figure out | What you get |
|---|--------|---------------------|--------------|
| 1 | **Trust** | Some actions are small (book a room). Some are big (ship code). How does JARVIS know the difference, and when must it **stop and ask** instead of doing things quietly? | A simple **risk table** + **rules** (e.g. “big actions always open the review screen”). |
| 2 | **Motion** | The little **Neural Core** icon at the top should *feel* alive: thinking, waiting, ready for you to confirm. How do we show that **without** always writing “Loading…”? | A **cheat sheet**: each mode = one animation style. |
| 3 | **Commands** | People type messy words. If someone says **“wait,”** does that mean pause, cancel, or delete a step? We need **one clear meaning** per phrase. | A **small dictionary**: phrase → what the app does. |
| 4 | **Proof** | The AI should not just say “trust me.” It should show **where** the info came from (Slack, Jira, etc.) with a **real snippet** of the source, not only a link. | A **format** for “evidence cards” inside the review screen. |
| 5 | **Nexus** | Sometimes one problem touches **HR + IT + a project** at once. How do we **group** those into one card so people don’t jump between five portals? | **Rules** for when things bundle together + a **sketch** of one combined card. |
| 6 | **Roles** | A designer cares about different things than a manager. What **ready-made intents** should each role see first? | **Short profiles**: Designer intents vs Manager intents (and similar). |

---

## What “done” looks like

- A small set of **markdown files** in `docs/research/` (one file per topic is fine).
- Those files are enough for **design, product, and engineering** to stay aligned.
- **Building the UI** comes **after**—when these answers are stable.

**Status:** Deliverables live in **[research/README.md](research/README.md)** (plan filenames: `TRUST-AND-TRANSPARENCY.md`, …, plus `CROSS-VALIDATION.md`).

---

## How this connects to the big picture

- **Ambient Flow** = proactive suggestions and staged work, not endless dashboards. See [AMBIENT-FLOW-INTERFACE.md](AMBIENT-FLOW-INTERFACE.md) for names like Horizon, Intents, Neural Core, Whisper Bar.
- This research plan only answers: **how do we keep it safe, clear, and calm** while doing that?
