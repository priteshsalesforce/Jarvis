# Persona-specific intent blueprints

**Goal:** Modular **Intent Blueprints** per role so the Neural Core reflects **professional identity** without forking the product. Same shell: Horizon, Intents, Negotiation Workspace, Whisper Bar ([manifesto](../AMBIENT-FLOW-INTERFACE.md)).

**Related:** Phrases → [WHISPER-COMMAND-GRAMMAR.md](WHISPER-COMMAND-GRAMMAR.md); Manager/dev patterns → `web/src/App.jsx` mock intents.

---

## 1. Blueprint template (repeat per intent)

| Field | Fill |
|-------|------|
| **Persona** | Role |
| **Intent name** | User-facing title |
| **Job to be done** | One sentence |
| **Default sources** | Systems for EvidenceRef / Context Cards |
| **Default risk tier** | L1–L4 |
| **Negotiation trigger** | When Workspace is forced (usually L3+) |
| **Typical steps** | system vs human-req |
| **Whisper vocabulary** | Short phrases users should try |

---

## 2. UX / Product Designer

| Intent | Job to be done | Default sources | Risk | Negotiation | Sample Whisper phrases |
|--------|----------------|-----------------|------|-------------|------------------------|
| **Design system drift** | Find UI diverging from tokens / components | Figma, Storybook, repo | L2–L3 | Drift spans prod impact | “Scan drift for checkout,” “open review” |
| **Figma → code handoff** | Frames → tickets + AC | Figma, Jira, Slack | L2–L3 | Cross-team handoff | “Create tickets from selection,” “add AC step” |
| **Research synthesis** | Interviews → themes + recs | Docs, slides, research repo | L2 | PII in notes | “Synthesize last 5 interviews,” “redact names” |

**Specialist routing:** Mostly **Intelligence**; **System** when opening tickets or repo hooks.

---

## 3. Developer / IC (align with prototype Developer mode)

| Intent | Job to be done | Default sources | Risk | Negotiation | Sample Whisper phrases |
|--------|----------------|-----------------|------|-------------|------------------------|
| **Safe deploy** | Ship with checks / rollback | CI, GitHub, APM | L3–L4 | Always | “Show plan,” “hold deploy until checks green” |
| **Incident triage** | Limit blast radius | APM, logs, alerts | L3–L4 | Always | “Why P95 spiked,” “add rollback step” |
| **Onboarding orchestration** | Cross-team setup | HRIS, ITSM, IAM | L3 | Yes | “Stage onboarding for …,” “who is human-req?” |

**Specialist routing:** **System** primary; **Intelligence** for summaries.

---

## 4. Manager / Lead (align with prototype Manager mode)

| Intent | Job to be done | Default sources | Risk | Negotiation | Sample Whisper phrases |
|--------|----------------|-----------------|------|-------------|------------------------|
| **Team velocity** | Bottlenecks without blame | Jira, GitHub, retro notes | L2–L3 | If reallocation commits money/people | “Where is the bottleneck?” |
| **Sentiment / wellbeing** | Early overload warning | Aggregated Slack, surveys | L3 | Sensitive | “Summarize team risk,” “show sources only” |
| **Capacity allocation** | Match people to work | Calendar, staffing tools | L3 | People commitments | “Who has bandwidth next sprint?” |

**Specialist routing:** **Intelligence** + **Ops**; careful **PII** and **aggregates-only** defaults.

---

## 5. Modular identity (product rule)

- **Surface:** Same Ambient Flow chrome.
- **Varies:** Default intents on Horizon, Whisper placeholders, blueprint library order, and **risk defaults** per domain—**not** separate apps.

---

**Next:** [CROSS-VALIDATION.md](CROSS-VALIDATION.md).
