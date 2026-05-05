# Trust calibration — transparency gradient and guardrails

**Goal:** Define when JARVIS **nudges** vs **forces Negotiation Workspace** vs **blocks autopilot**, using one shared risk model so PM, legal, and engineering align.

**Related:** Evidence depth by tier → [LINEAGE-AND-CONTEXT-CARDS.md](LINEAGE-AND-CONTEXT-CARDS.md).

---

## 1. Scoring dimensions (collapse into Risk Tier)

Score each **task type** on these dimensions (use 1–3 or Low/Med/High per column). Legal / security own final tier assignment.

| Dimension | What it measures |
|-----------|------------------|
| **Irreversibility** | How hard to undo the outcome |
| **Blast radius** | One person vs team vs org / customers |
| **Financial / legal exposure** | Money, contracts, regulatory |
| **PII sensitivity** | Personal or sensitive data touched |
| **Audit requirement** | Must be explainable in an audit trail |
| **Time sensitivity** | Cost of delay or wrong-window execution |

**Rule of thumb:** Any **high** on Irreversibility, Blast radius, or Financial/legal usually pushes to **L3+**.

---

## 2. Risk tiers (L1–L4) and default UI posture

| Tier | Plain name | Examples | Opens Negotiation Workspace before execute? |
|------|------------|----------|-----------------------------------------------|
| **L1** | Low | Suggest a meeting time; draft text you send yourself | No |
| **L2** | Medium | Book a room; file low-risk IT ticket | No (prefer undo / soft confirm) |
| **L3** | High | Money movement, access grants, prod-impacting change, customer data | **Yes** |
| **L4** | Critical | Irreversible deploy, legal commitment, bulk PII export | **Yes** + **human-req** steps where policy requires |

---

## 3. Transparency gradient (what users see without opening the workspace)

| Tier | Minimum surface |
|------|-----------------|
| **L1–L2** | One-line **why** + optional expand |
| **L3** | **Why** + **last verified** + **source count** |
| **L4** | Same as L3 + **forced workspace** with full **Synthesis**, **Context Cards**, and **Plan Editor** before Execute |

---

## 4. Intervention levels (map Tier → default Intervention)

| Intervention | Name | Behavior |
|--------------|------|----------|
| **I0** | Nudge | Horizon pulse / light banner; no blocking |
| **I1** | Soft confirm | Toast or Whisper echo (“Say **confirm** to …”) |
| **I2** | Strong confirm | Explicit tap in UI |
| **I3** | Negotiation Workspace | Review plan, lineage, steps; then Execute |
| **I4** | Workspace + **human-req** | Same as I3; listed steps **never** auto-complete |

**Default mapping (tune per org):**

| Tier | Default intervention |
|------|---------------------|
| L1 | I0–I1 |
| L2 | I1–I2 |
| L3 | I3 |
| L4 | I4 |

---

## 5. Task × risk matrix (canonical tasks — fill for your org)

Columns include dimensions + outcome tier + intervention. Example rows pre-filled:

| Task | Irreversibility | Blast radius | Financial / legal | PII | Audit | Time sens. | **Tier** | **Intervention** |
|------|-----------------|--------------|---------------------|-----|-------|------------|---------|------------------|
| Book a room | Low | Low | Low | Low | Low | Low | L2 | I1 |
| Request laptop repair | Med | Low | Low | Med | Low | Med | L2 | I1–I2 |
| Approve small expense | Med | Low | Med | Low | Med | Low | L3 | I3 |
| Deploy to production | High | High | Low | Low | High | High | L4 | I4 |
| Change IAM / admin role | High | High | Med | Med | High | Med | L4 | I4 |
| *(add rows)* | | | | | | | | |

---

## 6. Guardrail patterns (short library)

- **No silent L3+:** No high-risk execution without entering the review path (narrow written exceptions only).
- **High-risk shows lineage:** At least one **snippet-level** source for L3+ (see lineage doc).
- **PII:** Mask in Whisper before model / log paths ([manifesto §7](../AMBIENT-FLOW-INTERFACE.md)).
- **human-req:** Model never marks a human step “done.”
- **Throttle:** Cap proactive nudges per hour; batch low-risk items.

---

## 7. Anti-patterns (trust calibration)

| Problem | “Too quiet” | “Too loud” |
|---------|-------------|------------|
| **What users feel** | Sneaky, untrustworthy | Nagging, exhausting |
| **Symptoms** | No provenance, no state change, surprise actions | Modal for every trivial action, duplicate alerts |
| **Guard** | Minimum transparency by tier; always show **what changed** | Route L1–L2 to I0–I2 only; batch and summarize |

---

**Next:** [MOTION-STATE-OF-SYNTHESIS.md](MOTION-STATE-OF-SYNTHESIS.md), [LINEAGE-AND-CONTEXT-CARDS.md](LINEAGE-AND-CONTEXT-CARDS.md).
