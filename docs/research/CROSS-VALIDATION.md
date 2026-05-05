# Cross-validation — trust scenarios and traceability checklist

**Companion tracks:** [TRUST-AND-TRANSPARENCY.md](TRUST-AND-TRANSPARENCY.md), [MOTION-STATE-OF-SYNTHESIS.md](MOTION-STATE-OF-SYNTHESIS.md), [LINEAGE-AND-CONTEXT-CARDS.md](LINEAGE-AND-CONTEXT-CARDS.md).

---

## Part A — Trust calibration quick test (scenarios)

Run through **prototype or wireframes**. For each row, ask: Does this feel **too quiet**, **too loud**, **about right**, or **unsafe**?

| # | Scenario | Expected tier feel | Pass criteria |
|---|----------|-------------------|---------------|
| 1 | JARVIS books a room without asking | L2 | Soft feedback + undo; **not** a modal |
| 2 | JARVIS drafts an email but does not send | L1 | User sends; provenance optional |
| 3 | JARVIS proposes prod deploy | L4 | **Workspace** opens; **human-req** on dangerous steps |
| 4 | User says “wait” mid-execution | — | Execution **pauses** after current step ([grammar](WHISPER-COMMAND-GRAMMAR.md)) |
| 5 | Same user gets 6 proactive banners in 10 minutes | — | **Throttle** / batch; feels **too loud** if not |
| 6 | High-risk action completes with no Context Cards | L3+ fail | ≥1 snippet ([lineage](LINEAGE-AND-CONTEXT-CARDS.md)) |
| 7 | Stale Jira still shown as current | — | **Stale** badge or degraded Core state |
| 8 | Whisper contains employee SSN pasted by mistake | — | **PII masked** before model/log |
| 9 | Nexus bundles unrelated tickets | — | **Merge vs link** tree respected |
|10 | Manager sentiment intent shows raw DMs | — | **Aggregate / policy**; not creepy detail |
|11 | Neural Core never stops vibrating | — | **Idle** returns to calm motion |
|12 | “Confirm” accepted for vague L4 action | — | **Echo + second step** required |

---

## Part B — Traceability review (before ship)

For **every** path that reaches **Confirm Execution** on **L3+**:

| Check | Question |
|-------|----------|
| B1 | Is **Negotiation Workspace** shown (unless a narrow written exception)? |
| B2 | Is there at least **one** EvidenceRef **snippet** tied to the headline claim? |
| B3 | Are **Inference** vs **Fact** distinctions visible where needed? |
| B4 | Are **human-req** steps impossible to auto-complete? |
| B5 | Is **freshness** shown for time-sensitive evidence? |
| B6 | If a source fails, does UI enter **Degraded** with an honest message? |

**Sign-off:** Product + Design + Security (and Legal if L4/financial).

---

## Part C — Quick retro prompts

After user testing:

- Where did users say **“creepy”** or **“it did something I didn’t know”**? → Track **quiet** failures.
- Where did users say **“annoying”** or **“too many popups”**? → Track **loud** failures.
- Map each finding to a **guardrail** or **intervention** adjustment in [TRUST-AND-TRANSPARENCY.md](TRUST-AND-TRANSPARENCY.md).
