# Jarvis — [266] DVS Demo Script (4-minute vision simulation)

**For:** [266] Design Vision Showcase · async video + live presentation
**Length:** Target **3:50**, hard cap **4:00**
**Hero flow:** "Marc's Mandatory Review" — the batch-approval reschedule (`reschedule` scenario in `web/src/App.jsx`)
**Persona:** Alex Rivera, Senior PM at NovaCorp · lives in Teams + Outlook
**One-line pitch:** *Jarvis is the ideal Executive Assistant for every employee — it watches your work, fixes your day before you ask, drafts every message, and sends nothing without your one-tap OK.*

---

## Recording setup (read once before you record)

- **Resolution:** Record the prototype at 1920×1080, browser zoom 100%, full-screen (hide bookmarks/tabs). Use the **light Teams shell** (matches marketplace framing).
- **Pace:** ~150 words/min. The voiceover below is ~560 words → lands ~3:45. Don't rush the two "pause" beats — they carry the emotion.
- **Cursor:** Move deliberately. Pause 1s on each click target before clicking so viewers track the action.
- **Captions:** Burn in captions (async viewers often watch muted). The bolded on-screen phrases double as caption anchors.
- **Music:** Optional, low bed, no lyrics. Cut it out under the closing VO so the vision line lands clean.
- **Title card (0:00–0:03):** "Jarvis — the autonomous employee action layer" with your name + PM/R&I co-presenters. Held static, then cut to the app.

---

## Shot-by-shot

### 1 — Cold open: the packed day · 0:03–0:30 (~27s)

**On screen:** Open on the **Today** view. The morning-brief header reads *"I handled 3 things overnight. 5 need you now, 2 can wait."* Slowly scroll the intent cards once, then settle on Alex's calendar rail showing a full afternoon.

**Voiceover:**
> "This is Alex — a product manager, three back-to-backs deep before lunch. Every morning, Jarvis hands over one short brief: here's what I already handled, here's what actually needs you. Not another inbox. Not another portal. A teammate that did the night shift."

**Tip:** Let the "I handled 3 overnight" line breathe — it's the whole thesis in one sentence.

---

### 2 — The interrupt · 0:30–0:58 (~28s)

**On screen:** Click the notification bell (or trigger the proactive notification). A **single calm toast** slides in: *"Marc just made a 2 PM product review mandatory. It collides with 3 things on your calendar. I've worked out a fix — want to see it?"* No spam, one notification.

**Voiceover:**
> "Then the day breaks. Marc — an SVP — drops a mandatory 2 PM review onto Alex's calendar. It collides with three meetings. A normal day, this is twenty minutes of apologising and rescheduling. Jarvis sends exactly one notification — calm, not noisy — and it already has a plan."

**Tip:** Point out, verbally, that this is the *only* ping. "Don't add to the noise" is a graded design value.

---

### 3 — What it read (trust + transparency) · 0:58–1:35 (~37s)

**On screen:** Click the notification. The **inline chat panel** slides in from the right (it does *not* leave the Today view). Expand the **"here's what I read"** lineage accordion — show Marc's invite, the **rank signal (SVP, outranks the afternoon)**, and the 3 detected conflicts with their source chips.

**Voiceover:**
> "Tap in, and Jarvis opens right here — inside the app, not over it. Before it does anything, it shows its work: this is Marc's invite, this is why he outranks your afternoon, and these are the three things in the way. Every claim is traceable to a source. Jarvis reads signals — not your private messages."

**Tip:** Hover the source chips so the plugin labels (Calendar, Teams, org rank) are visible in the recording.

---

### 4 — The batch: the hero moment · 1:35–2:25 (~50s)

**On screen:** Jarvis presents the plan as prose, then **one card**: *"I'm ready to send 4 Teams messages and 3 emails to make this happen. Take a look before I send."* The message table lists every recipient, channel, and one-line gist. Scroll the table slowly so all 7 rows are visible.

**Voiceover:**
> "Here's the moment. To clear 2 PM, this normally means seven separate messages — moving your 1:1, covering the sprint sync, declining a vendor, looping in Marc's EA. Jarvis drafts all seven, in your voice, and hands them to you as **one** card. Four Teams messages, three emails. Thirteen interruptions become a single decision."

**Tip:** This is the screenshot that goes in the deck. Frame it cleanly; this is the "north star" image.

---

### 5 — Inspect & tweak (taste + control) · 2:25–2:55 (~30s)

**On screen:** Expand the per-message preview for the note to **Sarah**. Edit one line to soften it (e.g. add "so sorry for the short notice"). Collapse it again — the rest of the batch is untouched.

**Voiceover:**
> "You stay in control of the words. Open any message, change a line — soften the note to Sarah — and Jarvis keeps your edit. It writes with taste: 'so sorry to move this,' never 'MEETING CANCELLED.' The judgement is yours; the labour is Jarvis's."

---

### 6 — One approval + the gate · 2:55–3:20 (~25s)

**On screen:** Click **"Approve all & send."** A **light gate modal** appears for the one rank-sensitive send (declining the external/SVP-adjacent meeting) with the policy line and an *I confirm* row. Confirm it.

**Voiceover:**
> "One tap approves all seven. And because one of them declines a meeting on your behalf, Jarvis asks once more — with the reason spelled out — before that single message goes. The right amount of friction, only where it matters. You never see a tier label; you just feel it."

---

### 7 — Done, and reversible · 3:20–3:42 (~22s)

**On screen:** Toast: *"Sent. Your 2 PM is clear for Marc."* Click into the **Feed** — the 7 sends are logged as **one grouped entry** with a one-click **Undo**.

**Voiceover:**
> "Done. The afternoon is clear. Every action lands in the Feed as one entry — and every single thing Jarvis does is reversible with one click. Nothing permanent, no surprises. That's the contract that makes this trustworthy enough to actually use."

---

### 8 — Vision close: 3+ releases out · 3:42–4:00 (~18s)

**On screen:** Quick, 2-second flash of the **Manager view** (team-readiness brief, burnout flag), then settle back on the Today brief. End on the title card.

**Voiceover:**
> "Today: one employee, one cleared afternoon. Next: the same trusted layer across every system, every team, and every manager's readiness brief. If Salesforce owns the employee action layer, the assistant stops being a chatbot — and starts being the way work gets done."

---

## The closing vision lines (for the live Q&A / final slide)

Use these verbatim if asked "where does this go?":

- **Next release:** Channel expansion (Slack parity), per-item hold in batch approval, richer manager signals.
- **+2 releases:** Cross-vendor orchestration (Workday + ServiceNow + Salesforce in one flow), voice + mobile.
- **+3 releases:** Jarvis as the default employee surface — proactive, in-the-flow, replacing portal-hopping for HR, IT, and ops.

---

## Timing budget (keep under 4:00)

| Beat | Window | Cumulative |
|---|---|---|
| Title card | 0:00–0:03 | 0:03 |
| 1. Packed day | 0:03–0:30 | 0:30 |
| 2. The interrupt | 0:30–0:58 | 0:58 |
| 3. What it read | 0:58–1:35 | 1:35 |
| 4. The batch (hero) | 1:35–2:25 | 2:25 |
| 5. Inspect & tweak | 2:25–2:55 | 2:55 |
| 6. Approval + gate | 2:55–3:20 | 3:20 |
| 7. Done + Undo | 3:20–3:42 | 3:42 |
| 8. Vision close | 3:42–4:00 | **4:00** |

**If you run long:** cut beat 5's second sentence and trim beat 8 to the last line. The hero (beat 4) and the gate (beat 6) are non-negotiable — they are the design thesis.

---

*Source: MVP-VISUAL-STORY.md · prototype `web/src/App.jsx` (`reschedule` scenario) · Built on Salesforce Agentforce*
