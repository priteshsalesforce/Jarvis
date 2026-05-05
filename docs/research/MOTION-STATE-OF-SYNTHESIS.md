# Atmospheric UI — State of Synthesis motion language

**Goal:** Replace generic **Loading…** with **non-verbal** Neural Core feedback aligned to cognitive state (thinking vs waiting vs confirming). Align copy with HUD status (today’s prototype uses a single string such as “Deep Sync Active” in `web/src/App.jsx`).

**Related:** Listening state ↔ [WHISPER-COMMAND-GRAMMAR.md](WHISPER-COMMAND-GRAMMAR.md).

---

## 1. Standard states

| State | User mental model | When |
|-------|-------------------|------|
| **Idle** | Calm, ready | No active job |
| **Listening** | “It heard me” | Whisper focused / mic active |
| **Thinking** | Synthesis or retrieval in progress | Fetching, reasoning, drafting |
| **Confirming** | “Your turn” | Awaiting approval before risky steps |
| **Executing** | Background fleet running | Steps executing after confirm |
| **Degraded** | Partial or blocked | Permissions, timeout, source unavailable |

**HUD status copy examples (pick one per state):** Idle — “Ready”; Listening — “Listening”; Thinking — “Synthesizing”; Confirming — “Awaiting confirmation”; Executing — “Orchestrating”; Degraded — “Limited context.”

---

## 2. Motion tokens (Neural Core icon + aura)

| State | Icon / aura | Horizon / intent cards (optional) |
|-------|----------------|-------------------------------------|
| Idle | Slow **breath** (opacity pulse ~4–6s period) | No extra motion |
| Listening | Slight **brighten**; Whisper rail glow | — |
| Thinking | **Faster** pulse + slow **gradient drift** (“processing power”) | Faint pulse on active intent |
| Confirming | Pulse **settles**; stable halo | Highlight card awaiting action |
| Executing | **Heartbeat** or stepped pulse | Progress motion on active intent |
| Degraded | Slower pulse + **amber** tint | Short inline notice |

---

## 3. Token mapping — substitute “Loading…” strings

| Surface | Idle | Listening | Thinking | Confirming | Executing | Degraded |
|---------|------|-----------|----------|------------|-----------|----------|
| **Neural Core HUD** | Breath | Brighten + rim | Fast pulse + blur drift | Stable glow | Heartbeat | Amber drift |
| **Whisper Bar** | Default placeholder | Mic/listening indicator | “Gathering…” / motion only | Primary CTA emphasis | Optional subtle progress | Warning strip |
| **Intent card** | Static | — | Thin shimmer or dot pulse | “Action needed” border | Step tick animation | Warning chip |

Prefer **motion + one short verb** over paragraph loaders.

---

## 4. No-go list (accessibility and trust)

- No **strobe** or **>3 Hz** flashing on large fields (WCAG-friendly).
- No **infinite** high-frequency vibration or jitter on the Core icon.
- Avoid **red panic** for recoverable degraded states; reserve strong red for true critical alerts.
- Motion should **rest** in Idle (constant chaos = “too loud”).

---

## 5. Implementation note

Drive a single **`coreState`** enum from pipeline stages. CSS variables + optional Framer Motion for the Core aura; keep Horizon pulse optional and subtle.

---

**Next:** [WHISPER-COMMAND-GRAMMAR.md](WHISPER-COMMAND-GRAMMAR.md).
