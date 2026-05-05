# Project JARVIS: Ambient Flow Interface

**The "Neural Command" Manifesto**

This document describes the product vision, vocabulary, architecture, and implementation guidance for the Ambient Flow interface. Use the same language in code, UI, and internal discussions so the experience stays humanized and consistent.

**Want a shorter read?** See [RESEARCH-PLAN-SIMPLE.md](RESEARCH-PLAN-SIMPLE.md) for the six research areas and expected outcomes in plain language.

---

## 1. Vision & Philosophy

The Ambient Flow interface is a departure from traditional **dashboard** architecture. Instead of presenting a user with a list of burdens (tasks), it presents a **Horizon of Intents**.

### From reactive to proactive

The system does not wait for commands; it grooms the workspace in the background and presents **staged outcomes**.

### Ambient orchestration

Complexity is handled **backstage** by specialized sub-routines, while the user interacts with a unified, high-level **Neural Core**.

### Intent negotiation

The AI is not a "magic button." It is a collaborator. Every complex action begins as a **Draft Intent** that the user can interrogate, edit, and tailor before committing to execution.

---

## 2. Core Taxonomy

Maintain this vocabulary throughout code and UI:

| Term | Meaning |
|------|---------|
| **The Horizon** | The temporal view of the user's day (replaces "Timeline" or "Schedule"). |
| **Intents** | Staged units of work across multiple domains (replaces "Tasks" or "Tickets"). |
| **The Nexus** | A bundle of cross-functional intents (e.g., Onboarding involves IT + HR + Ops). |
| **Neural Core** | The single-persona identity of the AI (replaces fragmented bot names). |
| **The Whisper Bar** | The bottom-weighted command input for natural language interaction. |

---

## 3. Architecture & Components

### A. The Trajectory Header

- **Function:** Anchors the user in time.
- **UX detail:** Show **space** rather than **load** (e.g., "You have space to create" vs "You have 6 meetings").
- **UI state:** Horizontal scrolling for future events. Active events use neural **pulses** for emphasis.

### B. Intent Cards

- **Function:** Negotiable units of work.
- **Design tokens:** Deep blacks (`#0A0A0A`), subtle borders (white at ~5% opacity), high-saturation category tags (e.g., blue for Nexus, red for Risk).
- **Interaction:** Clicking a card enters **Negotiation Mode**, not a generic "update" screen.

### C. The Negotiation Workspace (Modal)

- **The Dialog:** Conversational pane where the user asks *why* or *how*.
- **The Synthesis:** Block explaining the AI's reasoning and data sources.
- **The Plan Editor:** Reactive sidebar where steps can be added, removed, or re-prioritized.

---

## 4. Technical Implementation Guide (for Cursor)

### State management

Use a `currentIntents` state array that tracks the lifecycle of each intent:

| Status | Meaning |
|--------|---------|
| `staged` | Intelligence has prepared a draft. |
| `negotiating` | User is tailoring the plan in the Workspace. |
| `executing` | Background fleet is walking through the steps. |
| `manifested` | The action completed successfully. |

### Component hierarchy

```
App
├── NeuralCoreHUD (fixed top)
├── HorizonHeader (trajectory)
├── IntentGrid
│   ├── IntentCard (draft mode)
│   └── MetaCard (analytics / skills)
├── IntentWorkspace (modal / negotiation)
│   ├── IntelligenceDialog
│   └── PlanEditor
└── WhisperBar (fixed bottom)
```

### Animation principles (Tailwind / CSS)

| Pattern | Use |
|---------|-----|
| **Fade-up** | New intents entering the horizon. |
| **Neural pulse** | Slow, breathing opacity change for active background processes. |
| **Spatial drift** | Subtle Y-axis movement on card hover to suggest depth. |

---

## 5. Specialist Logic (the invisible fleet)

The user sees one **Neural Core**; implementation routes work through invisible **specialist profiles**:

| Specialist | Scope |
|------------|--------|
| **System** | DevOps, deployments, security. |
| **Ops** | Scheduling, travel, logistics. |
| **Intelligence** | Document synthesis, communications. |

---

## 6. Cursor expansion prompts

Copy these into Cursor to expand specific features:

**UI polish**

> Refine the Neural Core HUD to include a more fluid animation when specialists are active. Use Framer Motion to create a "breathing" aura around the BrainCircuit icon.

**Logic expansion**

> Expand the `handleSend` function in `IntentWorkspace` to parse user input for keywords like `delay`, `remove`, or `add` and dynamically update the `currentSteps` array.

**Persona depth**

> Create a "Team Health" dashboard for the Manager persona that visualizes burnout risk using a spatial heat-map instead of a traditional chart.

---

## 7. Security & trust layer

### Source citation

Every intent must include a **`sources`** array (e.g., Slack, Jira, Drive) so synthesis and actions remain traceable.

### PII guard

The Whisper Bar should **mask sensitive data** before it reaches the intelligence synthesis layer.

### Human-required tags

Critical steps must be tagged **`human-req`** so the system never executes high-risk actions autonomously.

---

## Document maintenance

When product language or architecture changes, update this file and align component names, state enums, and UI copy in the same change where possible.

**UX research deliverables** (trust, motion, Whisper grammar, lineage, Nexus, personas, validation): [research/README.md](research/README.md).
