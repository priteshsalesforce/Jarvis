import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Bell, CheckCircle2, MessageCircle, ExternalLink, Plus, Settings, Users,
  AlertTriangle, Calendar, Clock, ArrowRight, Send, Mic, X, Check,
  Loader2, LogOut, ChevronLeft, Sparkles, Activity, ShieldCheck,
  Zap, TrendingUp, FileText, MessageSquare, Lock,
  Database, LayoutDashboard, History, Sliders, ChevronRight,
  ChevronDown, Hash, Moon, Sun, MapPin, Video, UserCircle2,
  Maximize2, Bot, Tag, Folder, Search, Filter, Star,
  Wifi, WifiOff, Power, Edit2, Trash2, Copy, Globe,
} from 'lucide-react'

// ─── Sound engine ─────────────────────────────────────────────────────────────
// Tiny Web Audio API helpers — graceful no-op if AudioContext unavailable
function createBeep(freq = 440, dur = 0.08, vol = 0.04, type = 'sine') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = type; osc.frequency.value = freq
    gain.gain.setValueAtTime(vol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    osc.start(); osc.stop(ctx.currentTime + dur)
    setTimeout(() => ctx.close(), (dur + 0.1) * 1000)
  } catch (_) {}
}

const SFX = {
  tap:      () => createBeep(660, 0.05, 0.035),
  done:     () => { createBeep(523, 0.06, 0.04); setTimeout(() => createBeep(659, 0.09, 0.04), 70) },
  open:     () => createBeep(480, 0.07, 0.03, 'triangle'),
  close:    () => createBeep(360, 0.07, 0.025, 'triangle'),
  alert:    () => { createBeep(520, 0.08, 0.04); setTimeout(() => createBeep(440, 0.12, 0.03), 90) },
  whisper:  () => createBeep(880, 0.04, 0.02, 'sine'),
}

// ─── Haptics ──────────────────────────────────────────────────────────────────
const HX = {
  tap:    () => navigator.vibrate?.([8]),
  done:   () => navigator.vibrate?.([10, 30, 20]),
  alert:  () => navigator.vibrate?.([15, 20, 15]),
  error:  () => navigator.vibrate?.([20, 10, 20, 10, 20]),
}

// ─── Design tokens — LIGHT & DARK ─────────────────────────────────────────────
const THEMES = {
  light: {
    // Backgrounds
    appBg:       '#F4F2F9',   // very soft lavender tint
    surface:     '#FFFFFF',
    surfaceMid:  'rgba(255,255,255,0.7)',
    surfaceBlur: 'rgba(255,255,255,0.55)',
    rail:        '#FAFAFD',
    topBar:      'rgba(244,242,249,0.85)',
    // Brand
    core:        '#7526E3',
    coreMid:     '#9050E9',
    coreSoft:    'rgba(117,38,227,0.08)',
    coreGlow:    'rgba(117,38,227,0.2)',
    coreGrad:    'linear-gradient(135deg,#7526E3,#9050E9)',
    coreBright:  '#BA01FF',
    // Semantic
    teal:        '#0B827C',   tealSoft:  'rgba(11,130,124,0.1)',
    blue:        '#0B5CAB',   blueSoft:  'rgba(11,92,171,0.1)',
    amber:       '#8C4B02',   amberSoft: 'rgba(140,75,2,0.1)',
    red:         '#BA0517',   redSoft:   'rgba(186,5,23,0.08)',
    green:       '#2E844A',   greenSoft: 'rgba(46,132,74,0.1)',
    // Text
    text:        '#181818',
    textMid:     '#444444',
    textSoft:    '#747474',
    textXsoft:   '#A0A0A0',
    // Borders
    border:      'rgba(0,0,0,0.07)',
    borderMid:   'rgba(0,0,0,0.12)',
    // Shadows
    shadowSm:    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    shadowMd:    '0 4px 16px rgba(0,0,0,0.08)',
    shadowPurple:'0 4px 24px rgba(117,38,227,0.15)',
    // Blob gradients (ambient background)
    blob1: 'radial-gradient(ellipse at 20% 20%, rgba(117,38,227,0.07) 0%, transparent 60%)',
    blob2: 'radial-gradient(ellipse at 80% 80%, rgba(27,150,255,0.06) 0%, transparent 55%)',
    blob3: 'radial-gradient(ellipse at 60% 10%, rgba(1,195,179,0.05) 0%, transparent 50%)',
    font: '"SF Pro", system-ui, -apple-system, sans-serif',
  },
  dark: {
    appBg:       '#0F0D1A',
    surface:     'rgba(255,255,255,0.04)',
    surfaceMid:  'rgba(255,255,255,0.07)',
    surfaceBlur: 'rgba(20,17,36,0.7)',
    rail:        'rgba(0,0,0,0.3)',
    topBar:      'rgba(15,13,26,0.85)',
    core:        '#9050E9',
    coreMid:     '#AD7BEE',
    coreSoft:    'rgba(144,80,233,0.12)',
    coreGlow:    'rgba(144,80,233,0.3)',
    coreGrad:    'linear-gradient(135deg,#7526E3,#9050E9)',
    coreBright:  '#CB65FF',
    teal:        '#04E1CB',   tealSoft:  'rgba(4,225,203,0.1)',
    blue:        '#57A3FD',   blueSoft:  'rgba(87,163,253,0.1)',
    amber:       '#FCC003',   amberSoft: 'rgba(252,192,3,0.1)',
    red:         '#FF5D2D',   redSoft:   'rgba(255,93,45,0.08)',
    green:       '#45C65A',   greenSoft: 'rgba(69,198,90,0.1)',
    text:        'rgba(255,255,255,0.9)',
    textMid:     'rgba(255,255,255,0.6)',
    textSoft:    'rgba(255,255,255,0.38)',
    textXsoft:   'rgba(255,255,255,0.22)',
    border:      'rgba(255,255,255,0.07)',
    borderMid:   'rgba(255,255,255,0.13)',
    shadowSm:    '0 1px 3px rgba(0,0,0,0.3)',
    shadowMd:    '0 4px 24px rgba(0,0,0,0.35)',
    shadowPurple:'0 4px 32px rgba(144,80,233,0.22)',
    blob1: 'radial-gradient(ellipse at 20% 20%, rgba(117,38,227,0.12) 0%, transparent 60%)',
    blob2: 'radial-gradient(ellipse at 80% 80%, rgba(27,100,200,0.09) 0%, transparent 55%)',
    blob3: 'radial-gradient(ellipse at 60% 10%, rgba(4,225,203,0.06) 0%, transparent 50%)',
    font: '"SF Pro", system-ui, -apple-system, sans-serif',
  },
}

const TIER_META_FN = (t) => ({
  L1: { color: t.teal,  bg: t.tealSoft,  label: 'Low risk',     dot: t.teal  },
  L2: { color: t.blue,  bg: t.blueSoft,  label: 'Review',       dot: t.blue  },
  L3: { color: t.amber, bg: t.amberSoft, label: 'Your decision',dot: t.amber },
  L4: { color: t.red,   bg: t.redSoft,   label: 'Gate required',dot: t.red   },
})

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
@keyframes breathe    { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.07)} }
@keyframes think      { 0%,100%{opacity:.5;transform:scale(.94)} 50%{opacity:1;transform:scale(1.1)} }
@keyframes heartbeat  { 0%,100%{transform:scale(1)} 14%{transform:scale(1.18)} 42%{transform:scale(1.08)} }
@keyframes ripple     { 0%{transform:scale(.8);opacity:.7} 100%{transform:scale(2.4);opacity:0} }
@keyframes slideUp    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideRight { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
@keyframes fadeIn     { from{opacity:0} to{opacity:1} }
@keyframes doneSlide  { to{opacity:0;transform:translateX(-32px) scale(.96)} }
@keyframes float      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes blobDrift  { 0%{transform:translate(0,0) scale(1)} 33%{transform:translate(20px,-15px) scale(1.04)} 66%{transform:translate(-10px,20px) scale(.97)} 100%{transform:translate(0,0) scale(1)} }
@keyframes blobDrift2 { 0%{transform:translate(0,0) scale(1)} 33%{transform:translate(-18px,12px) scale(1.03)} 66%{transform:translate(15px,-18px) scale(.98)} 100%{transform:translate(0,0) scale(1)} }
@keyframes softPop    { 0%{transform:scale(.92);opacity:0} 60%{transform:scale(1.02)} 100%{transform:scale(1);opacity:1} }
@keyframes spin       { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes shimmer    { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
@keyframes coreIdle   { 0%,100%{box-shadow:0 0 0 0 var(--glow-color)} 50%{box-shadow:0 0 16px 4px var(--glow-color)} }
.enter    { animation: slideUp .35s cubic-bezier(.16,1,.3,1) both; }
.enter-r  { animation: slideRight .35s cubic-bezier(.16,1,.3,1) both; }
.pop      { animation: softPop .3s cubic-bezier(.34,1.56,.64,1) both; }
.done     { animation: doneSlide .28s ease-out both; }
.fade     { animation: fadeIn .25s ease both; }
* { box-sizing: border-box; margin: 0; padding: 0; }
button { font-family: inherit; }
input, textarea, select { font-family: inherit; }
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 99px; }
::selection { background: rgba(117,38,227,0.15); }
`


// ─── Static data ──────────────────────────────────────────────────────────────
const INTENTS = [
  { id:'hero', tier:'L3', cat:'Most important right now', isHero:true,
    headline:'Legal approval is blocking your analytics pipeline',
    why:'DPA with CloudMetrics was filed 5 days ago. Amy Torres (reviewer) returns Wednesday — but pipeline go-live is Friday. SLA already breached.',
    action:'Draft escalation to General Counsel',
    source:'Salesforce · Case #DPA-8821',
    evidence:'Status: In Review · SLA +2 days · Amy Torres OOO until May 4',
    chatScenario:'p1' },
  { id:'y1', tier:'L2', cat:'Yesterday',
    headline:'Q2 planning left 3 unowned actions',
    why:'Email thread has 3 unread replies. Confluence page not updated in 4 days.',
    action:'Review & assign owners', source:'Outlook · Q2 Planning',
    evidence:'Thread "Q2 Planning — Apr 28" · 3 unread', chatScenario:null },
  { id:'y2', tier:'L1', cat:'Yesterday',
    headline:'Security cert expires in 3 days',
    why:'Annual compliance training incomplete. Deadline: Apr 30.',
    action:'Open LMS portal', source:'Workday · Compliance',
    evidence:'Status: Not started · Est. 45 min', chatScenario:null },
  { id:'f1', tier:'L3', cat:'Follow-up needed',
    headline:'Acme SOW needs your revision by EOD Thursday',
    why:'Legal approved redlines at 09:14. Sections 3.2 and 4.1 need update before sending to Maria Chen.',
    action:'Open SOW draft', source:'Outlook · Acme SOW v3',
    evidence:'Legal sign-off: received · Maria Chen deadline: May 1', chatScenario:null },
  { id:'f2', tier:'L1', cat:'Follow-up needed',
    headline:'Jordan Parker scorecard due in 18 hours',
    why:'Hiring panel debrief Wednesday 11 AM. Scorecard needed before then.',
    action:'Submit scorecard', source:'Greenhouse · Jordan Parker',
    evidence:'Role: Staff Engineer · Debrief: Wed 11 AM', chatScenario:null },
  { id:'e1', tier:'L2', cat:'In 90 minutes',
    headline:'QBR with SVP — prep bundle ready',
    why:'Deck found, 3 open actions surfaced, SVP context compiled.',
    action:'Open prep bundle', source:'Outlook · 10:00 AM', prepReady:true,
    evidence:'QBR-H2-2026.pptx · 3 open Apr 14 actions', chatScenario:'prep' },
  { id:'e2', tier:'L4', cat:'Today 2:00 PM',
    headline:'Prod deploy v3.8.2 — gate required',
    why:'CR-4471 approved. Blue/Green traffic shift needs your explicit confirmation.',
    action:'Review & arm', source:'Jira · CR-4471',
    evidence:'Rollback ready · On-call: Raj Mehta', chatScenario:null },
  { id:'p2', tier:'L2', cat:'Pending with you',
    headline:'Datadog license stuck in IT security — day 10',
    why:'Finance approved. IT security SLA is 5 days; currently at 10. Jarvis can draft a follow-up.',
    action:'Chase IT security', source:'ServiceNow · INC0038912',
    evidence:'Finance: Approved · IT Security: SLA +5 days', chatScenario:null },
]

const MANAGER_INTENTS = [
  { id:'mh', tier:'L3', cat:'Team risk', isHero:true,
    headline:'Liam Davis showing burnout signals — act this week',
    why:'55+ hour weeks for 3 sprints. Sentiment markers up 20%. Friday gap available, coverage identified.',
    action:'Review & authorise Wellness Day', source:'Jira + Slack (aggregated)',
    evidence:'Avg 57h/wk · Team avg 38h · +20% fatigue (no raw DMs)', chatScenario:'burnout' },
  { id:'m1', tier:'L2', cat:'Approval digest',
    headline:'3 routine approvals ready to batch-confirm',
    why:'Expense $340, PTO (no conflicts), laptop — all within policy.',
    action:'Batch approve', source:'Workday · Queue',
    evidence:'All 3 policy-checked · Exception: salary +11% flagged separately', chatScenario:null },
  { id:'m2', tier:'L2', cat:'Team readiness',
    headline:'React 19 gap causing 15% velocity drop',
    why:'4 engineers identified. Masterclass Friday 2–4 PM, no calendar conflicts.',
    action:'Enrol 4 engineers', source:'GitHub + Workday',
    evidence:'3-sprint pattern · 3.2d avg vs 1.8 expected', chatScenario:null },
  { id:'m3', tier:'L3', cat:'Hiring decision',
    headline:'Senior DevOps — 3 finalists, decision needed',
    why:'Candidate A scored 94/100. Panels aligned, budget confirmed, offer draft ready.',
    action:'Select & approve offer', source:'Lever ATS',
    evidence:'A: 94 · B: 81 · C: 79 · $12k relocation approved', chatScenario:null },
]

const TODAY_EVENTS = [
  { id:'ev1', time:'09:00', end:'09:30', title:'Standup — Platform team', type:'meeting', attendees:['Priya','Raj','Liam','+2'], location:'Teams', hasPrep:false },
  { id:'ev2', time:'10:00', end:'11:00', title:'QBR with SVP Sarah', type:'meeting', attendees:['Sarah Chen','Marcus T.'], location:'Teams', hasPrep:true },
  { id:'ev3', time:'11:30', end:'12:00', title:'Sprint Planning — Sprint 24', type:'meeting', attendees:['Dev team (8)'], location:'Teams', hasPrep:false },
  { id:'ev4', time:'13:00', end:'13:30', title:'1:1 with Sarah', type:'1on1', attendees:['Sarah Chen'], location:'Teams', hasPrep:false },
  { id:'ev5', time:'14:00', end:'14:30', title:'Prod Deploy v3.8.2 gate', type:'gate', attendees:['Raj Mehta','DevOps'], location:'Jira', hasPrep:true },
  { id:'ev6', time:'15:30', end:'16:00', title:'Acme Corp check-in', type:'external', attendees:['Maria Chen'], location:'Zoom', hasPrep:false },
]

const FEED_ITEMS = [
  { id:'fd1', time:'08:47', status:'done', emoji:'🧠', title:'Morning brief compiled',
    body:'Ranked 8 items from Workday, Outlook, Jira by deadline × impact.',
    steps:['Fetch Outlook flagged emails → 4 surfaced','Fetch Workday approvals → 3 items','Fetch Jira overdue → 3/9 surfaced','Score and rank'] },
  { id:'fd2', time:'08:51', status:'done', emoji:'⚠️', title:'Proactive nudge — security cert',
    body:'Detected 3-day expiry. Sent Teams notification with LMS deep link.',
    steps:['Workday compliance check','Training: Not started, deadline Apr 30','Composed nudge','Delivered via Teams ✓'] },
  { id:'fd3', time:'09:02', status:'running', emoji:'📋', title:'Meeting prep: QBR 10:00 AM',
    body:'Gathering deck, last meeting notes, SVP context.',
    steps:['Located QBR-H2-2026.pptx ✓','Apr 14 notes — 3 open actions ✓','Fetching SVP briefing history…','Draft bundle (pending)'] },
  { id:'fd4', time:'Yesterday', status:'done', emoji:'✅', title:'PTO requests auto-verified',
    body:'Checked 3 requests against calendar and policy. All clear.',
    steps:['Fetch Workday queue','Calendar conflict check','Policy validation','Surfaced in dashboard ✓'] },
]

const CHAT_SCENARIOS = {
  p1:[{role:'j',text:"I've pulled the full picture on Case #DPA-8821.\n\n**What's happening:** Amy Torres is OOO until Wednesday but your pipeline go-live is Friday. SLA already breached by 2 days.\n\n**I can do one of these right now:**\n\n**A** · Draft an escalation email to cc General Counsel\n**B** · Set a Thursday morning reminder with a follow-up prompt\n**C** · Show the full case timeline\n\nWhich would you like?"}],
  incident:[{role:'j',text:"🔴 **P1: Auth Service Down — INC-9942**\n\nEU-West-1 returning 503s on /v1/auth. Detected 4 min ago. 3 enterprise customers impacted. Incident owner: unassigned.\n\n**On-call identified:** Raj Mehta — available now.\n\n**A** · Assign Raj as owner in Salesforce\n**B** · Send Raj a Teams message with full context\n**C** · Open a war room channel\n\nPick one and I'll act immediately."}],
  prep:[{role:'j',text:"**QBR prep bundle — ready for 10:00 AM**\n\n📄 **Deck:** QBR-H2-2026.pptx (Priya edited yesterday)\n📋 **3 open actions** from Apr 14 — none closed\n💬 **SVP context:** Last discussion was budget; she flagged the 18% incident improvement\n\n**Suggested opening:** Lead with the incident metric — it's her stated priority.\n\nShall I draft a 3-point opener?"}],
  burnout:[{role:'j',text:"**Capacity warning: Liam Davis**\n\n55–61 hour weeks over 3 sprints (team avg: 38h). Slack sentiment shows +20% fatigue markers — aggregated only, no raw DMs were read.\n\n**Already prepared:**\n· Sloane as Friday backup\n· Draft wellness check-in message\n\n**Your call:**\n**A** · Authorise Wellness Day + confirm Sloane\n**B** · Review the draft message first\n**C** · Flag for 1:1 agenda\n\nI need your confirmation before any action."}],
}

const BEHAVIOURS = [
  {id:'b1',name:'Daily Morning Brief',desc:'Ranked brief at 9 AM.',schedule:'Weekdays · 9:00 AM',enabled:true},
  {id:'b2',name:'Meeting Prep',desc:'Notes 30 min before each meeting.',schedule:'Every day · 30 min before',enabled:true},
  {id:'b3',name:'Document Intelligence',desc:'Find and summarise docs on demand.',schedule:'On demand',enabled:true},
  {id:'b4',name:'Email Management',desc:'Triage and draft replies.',schedule:'Weekdays · 5:00 PM',enabled:false},
]

const CONNECTIONS = [
  {id:'c1',name:'Microsoft Teams',logo:'🟣',connected:true},
  {id:'c2',name:'Outlook Calendar',logo:'🔵',connected:true},
  {id:'c3',name:'OneDrive / SharePoint',logo:'🔷',connected:true},
  {id:'c4',name:'Workday',logo:'🟠',connected:true},
  {id:'c5',name:'Salesforce',logo:'☁️',connected:false},
  {id:'c6',name:'Jira',logo:'🔹',connected:false},
]

// ─── Conversations (Chat tab data) ───────────────────────────────────────────
const CONVERSATION_CATEGORIES = ['All', 'Decisions', 'Follow-ups', 'Incidents', 'Meetings', 'Analysis']

const CONVERSATIONS = [
  { id:'cv1', title:'Legal DPA escalation — Acme pipeline',
    preview:'I can draft an escalation to General Counsel right now. Want me to proceed?',
    time:'09:14', date:'Today', category:'Decisions', unread:1,
    messages:[
      {role:'j', text:"I've pulled the full picture on Case #DPA-8821.\n\n**Situation:** Amy Torres is OOO until Wednesday but your pipeline go-live is Friday. SLA already breached by 2 days.\n\n**I can do one of these right now:**\n\n**A** · Draft an escalation email to cc General Counsel\n**B** · Set a Thursday morning reminder\n**C** · Show the full case timeline\n\nWhich would you like?"},
    ]},
  { id:'cv2', title:'QBR prep — SVP meeting 10:00 AM',
    preview:'Deck found, 3 open actions surfaced, SVP context compiled.',
    time:'09:02', date:'Today', category:'Meetings', unread:0,
    messages:[
      {role:'j', text:"**QBR prep bundle — ready for 10:00 AM**\n\n📄 **Deck:** QBR-H2-2026.pptx (Priya edited yesterday)\n📋 **3 open actions** from Apr 14 — none closed\n💬 **SVP context:** Last discussion was budget; she flagged the 18% incident improvement\n\nShall I draft a 3-point opener?"},
      {role:'u', text:"Yes, draft the opener please"},
      {role:'j', text:"Here's a 3-point opener:\n\n1. **Progress on reliability** — We hit 99.95% uptime, a direct result of the incident process changes you asked about last quarter.\n2. **Revenue pipeline** — 3 deals at final stage, total ARR $2.1M. Acme is the largest, and we're on track.\n3. **Ask** — Approval to accelerate the CloudMetrics data pipeline (blocked by Legal right now — separate thread)."},
    ]},
  { id:'cv3', title:'P1 Incident — Auth Service Down',
    preview:'Raj Mehta assigned as incident owner. War room open.',
    time:'08:47', date:'Today', category:'Incidents', unread:0,
    messages:[
      {role:'j', text:"🔴 **P1: Auth Service Down — INC-9942**\n\nEU-West-1 returning 503s on /v1/auth. 3 enterprise customers impacted.\n\n**A** · Assign Raj as owner\n**B** · Send Raj a Teams message\n**C** · Open a war room channel"},
      {role:'u', text:"A"},
      {role:'j', text:"Done ✓ Raj Mehta assigned as incident owner in Salesforce. He's been notified via Teams with full context.\n\nI'll monitor and update you every 15 minutes or sooner if status changes."},
    ]},
  { id:'cv4', title:'Sprint 24 team readiness analysis',
    preview:'React 19 skill gap identified across 4 engineers.',
    time:'Yesterday', date:'Yesterday', category:'Analysis', unread:0,
    messages:[
      {role:'u', text:"What's causing the velocity drop this sprint?"},
      {role:'j', text:"I pulled the data across Jira and GitHub.\n\n**Root cause:** React 19 Transitions API — 4 engineers (Liam, Sam, Dev, Priya) are taking avg 3.2 days on tasks estimated at 1.8 days. This is a 3-sprint pattern.\n\n**Fix available:** A Masterclass is scheduled Friday 2–4 PM. No calendar conflicts for any of the 4.\n\nShall I enrol them?"},
    ]},
  { id:'cv5', title:'Acme SOW revision — Sections 3.2 & 4.1',
    preview:'Legal approved redlines. Maria Chen deadline is May 1.',
    time:'Apr 30', date:'Apr 30', category:'Follow-ups', unread:0,
    messages:[
      {role:'j', text:"Legal has approved redlines on the Acme SOW. Sections **3.2** and **4.1** need your revision before sending to Maria Chen.\n\nDeadline: **May 1 EOD**. That's tomorrow.\n\nShall I open the draft and highlight the changed sections?"},
      {role:'u', text:"Yes"},
      {role:'j', text:"Opened Acme SOW v3 in OneDrive. Sections 3.2 and 4.1 are highlighted with Legal's comments inline.\n\nOnce you're done, I can send it directly to Maria Chen with a covering note. Just let me know."},
    ]},
  { id:'cv6', title:'Liam Davis burnout risk — team wellness',
    preview:'Wellness Day authorised. Sloane covering Friday.',
    time:'Apr 29', date:'Apr 29', category:'Decisions', unread:0,
    messages:[
      {role:'j', text:"**Capacity warning: Liam Davis**\n\n55–61 hour weeks over 3 sprints. Sentiment markers +20%. I've identified Sloane as Friday backup with no conflicts.\n\nYour call:\n**A** · Authorise Wellness Day + confirm Sloane\n**B** · Review draft message to Liam first\n**C** · Flag for 1:1 instead"},
      {role:'u', text:"A — authorise it"},
      {role:'j', text:"Done ✓ Wellness Day approved for Friday. Sloane confirmed as backup coverage. I've sent Liam a warm Teams message letting him know, and updated the sprint board to redistribute his 2 remaining tasks."},
    ]},
]

const AGENTS_DATA = [
  {id:'a1', name:'Morning Brief', desc:'Ranked daily brief at 9 AM from Outlook, Workday, Jira.', schedule:'Weekdays · 9:00 AM', enabled:true, icon:'🌅', runs:142, lastRun:'Today 9:00 AM', color:'#7526E3'},
  {id:'a2', name:'Meeting Prep', desc:'Prep notes and context 30 min before every meeting.', schedule:'30 min before each', enabled:true, icon:'📋', runs:89, lastRun:'Today 9:30 AM', color:'#0B5CAB'},
  {id:'a3', name:'Document Intelligence', desc:'Find, summarise, and answer across docs on demand.', schedule:'On demand', enabled:true, icon:'📄', runs:34, lastRun:'Yesterday', color:'#0B827C'},
  {id:'a4', name:'Incident Responder', desc:'Detect Salesforce P1/P2 incidents and alert on-call.', schedule:'Continuous monitor', enabled:true, icon:'🚨', runs:7, lastRun:'Today 8:47 AM', color:'#BA0517'},
  {id:'a5', name:'Email Triage', desc:'Prioritise inbox and draft replies for flagged threads.', schedule:'Weekdays · 5:00 PM', enabled:false, icon:'📧', runs:0, lastRun:'Never', color:'#8C4B02'},
]

const TEMPLATES = [
  {id:'sf',icon:'☁️',name:'Salesforce Headless',desc:'Act on CRM signals — cases, opportunities, approvals.'},
  {id:'email',icon:'📧',name:'Email Management',desc:'Triage inbox and draft replies automatically.'},
  {id:'calendar',icon:'📅',name:'Calendar Intelligence',desc:'Meeting briefings and prep notes.'},
  {id:'workday',icon:'⚙️',name:'Automate Your Workday',desc:'Morning briefing combining email, calendar, tasks.'},
  {id:'incident',icon:'🚨',name:'Incident Response',desc:'React to Salesforce incidents and alert the right people.'},
  {id:'docs',icon:'📄',name:'Document Intelligence',desc:'Search, summarise, and answer across docs.'},
  {id:'scratch',icon:'✏️',name:'Start from scratch',desc:'Define everything yourself.'},
]

const CHAT_DOCS = [
  {name:'QBR-H2-2026.pptx',type:'Presentation',edited:'Yesterday · Priya',Icon:FileText,color:'#0B5CAB'},
  {name:'Apr 14 Meeting Notes.docx',type:'Document',edited:'18 days ago · Alex',Icon:FileText,color:'#2E844A'},
  {name:'CloudMetrics DPA - Case #DPA-8821',type:'Salesforce Case',edited:'5 days ago',Icon:Database,color:'#8C4B02'},
  {name:'Acme SOW v3 - Redlines.docx',type:'Contract',edited:'Today 09:14 · Legal',Icon:Lock,color:'#7526E3'},
]
const CHAT_PEOPLE = [
  {name:'Amy Torres',role:'Legal Reviewer',status:'OOO until May 4',avatar:'AT',color:'#8C4B02',online:false},
  {name:'Maria Chen',role:'Acme Corp — PM',status:'Online',avatar:'MC',color:'#0B5CAB',online:true},
  {name:'Raj Mehta',role:'Infra On-call',status:'Available',avatar:'RM',color:'#0B827C',online:true},
  {name:'Priya Nair',role:'Product Designer',status:'In meeting',avatar:'PN',color:'#7526E3',online:false},
]
const CHAT_CHANNELS = [
  {name:'#incident-response',unread:14,last:'Raj: Snapshot ready, initiating rollback…'},
  {name:'#acme-deal-room',unread:3,last:'Maria: Redlines approved ✓'},
  {name:'#platform-eng',unread:0,last:'Deploy window confirmed for 2 PM'},
  {name:'#legal-ops',unread:2,last:'DPA filed — awaiting Amy sign-off'},
]


// ─── Shared mini-components ────────────────────────────────────────────────────
function GlassCard({ children, style = {}, hover = true, onClick, className = '' }) {
  const T = window.__T
  const [hov, setHov] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => hover && setHov(true)} onMouseLeave={() => setHov(false)}
      className={className}
      style={{ borderRadius:16, background:T.surface, border:`1px solid ${hov ? T.borderMid : T.border}`,
        boxShadow: hov ? T.shadowPurple : T.shadowSm, backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
        transition:'box-shadow .2s, border-color .2s', cursor: onClick ? 'pointer' : 'default', ...style }}>
      {children}
    </div>
  )
}

function TierDot({ tier }) {
  const T = window.__T; const m = TIER_META_FN(T)[tier]; if (!m) return null
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, fontWeight:600,
      padding:'3px 9px', borderRadius:99, background:m.bg, color:m.color }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:m.color, flexShrink:0 }} />
      {m.label}
    </span>
  )
}

function Chip({ text, color }) {
  const T = window.__T
  return (
    <span style={{ fontSize:10, fontWeight:500, padding:'2px 8px', borderRadius:99,
      background: color ? `${color}12` : T.surface, color: color || T.textSoft,
      border:`1px solid ${color ? `${color}25` : T.border}` }}>{text}</span>
  )
}

function Btn({ children, variant='primary', onClick, style={}, icon: Icon, disabled=false }) {
  const T = window.__T
  const [hov, setHov] = useState(false)
  const base = {
    primary:  { background:hov?'#6520CC':T.core,  color:'white',   border:'none',                        shadow:T.shadowPurple },
    secondary:{ background:hov?T.surfaceMid:T.surface, color:T.text, border:`1px solid ${T.border}`,     shadow:'none' },
    ghost:    { background:'none',                  color:T.textMid, border:'none',                       shadow:'none' },
    danger:   { background:hov?'#9E0313':T.red,    color:'white',   border:'none',                        shadow:`0 4px 16px ${T.red}30` },
  }[variant] || {}
  return (
    <button type="button" disabled={disabled} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px 16px',
        borderRadius:12, fontSize:12, fontWeight:700, cursor:disabled?'default':'pointer',
        opacity:disabled?.4:1, transition:'all .15s', boxShadow:base.shadow,
        background:base.background, color:base.color, border:base.border||'none', ...style }}>
      {Icon && <Icon size={13} />}{children}
    </button>
  )
}

function Toggle({ value, onChange }) {
  const T = window.__T
  return (
    <div onClick={onChange} style={{ width:44, height:24, borderRadius:99, position:'relative', cursor:'pointer', flexShrink:0,
      background: value ? T.core : T.border, transition:'background .2s' }}>
      <div style={{ position:'absolute', top:3, width:18, height:18, borderRadius:'50%', background:'white',
        transition:'transform .2s, box-shadow .2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
        transform: value ? 'translateX(23px)' : 'translateX(3px)' }} />
    </div>
  )
}

// ─── Neural Core ──────────────────────────────────────────────────────────────
function NeuralCore({ state, onClick }) {
  const T = window.__T
  const stateMap = {
    idle:       { anim:'breathe 4s ease-in-out infinite',   label:'Ready',        color:T.core  },
    listening:  { anim:'breathe 1.5s ease-in-out infinite', label:'Listening…',   color:T.blue  },
    thinking:   { anim:'think .9s ease-in-out infinite',    label:'Thinking…',    color:T.coreMid },
    executing:  { anim:'heartbeat 1s ease-in-out infinite', label:'Acting…',      color:T.green },
    confirming: { anim:'breathe 2.5s ease-in-out infinite', label:'Your turn',    color:T.amber },
    degraded:   { anim:'breathe 6s ease-in-out infinite',   label:'Limited data', color:T.red   },
  }
  const c = stateMap[state] || stateMap.idle
  return (
    <button type="button" onClick={() => { SFX.tap(); onClick?.() }}
      style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer', padding:'4px 8px', borderRadius:12 }}>
      <div style={{ position:'relative', width:34, height:34 }}>
        {(state==='thinking'||state==='executing') && (
          <div className="ripple-ring" style={{ position:'absolute', inset:0, borderRadius:'50%',
            border:`1.5px solid ${c.color}`, opacity:.6 }} />
        )}
        <div style={{ width:34, height:34, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
          background:T.coreGrad, animation:c.anim,
          boxShadow: state==='idle' ? `0 0 0 0 ${T.coreGlow}` : `0 0 18px ${T.coreGlow}` }}>
          <Sparkles size={16} color="white" />
        </div>
      </div>
      <div style={{ lineHeight:1 }}>
        <p style={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.2em', color:T.textXsoft }}>JARVIS</p>
        <p style={{ fontSize:12, fontWeight:600, color:c.color, marginTop:2 }}>{c.label}</p>
      </div>
    </button>
  )
}

// ─── Day Arc ──────────────────────────────────────────────────────────────────
function DayArc({ done, total }) {
  const T = window.__T
  const pct = total > 0 ? done / total : 0
  const r = 22, circ = 2*Math.PI*r, dash = circ*(1-pct)
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      <div style={{ position:'relative', width:52, height:52 }}>
        <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform:'rotate(-90deg)' }}>
          <circle cx="26" cy="26" r={r} fill="none" stroke={T.border} strokeWidth="3" />
          <circle cx="26" cy="26" r={r} fill="none" stroke={T.core} strokeWidth="3"
            strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
            style={{ transition:'stroke-dashoffset .7s cubic-bezier(.4,0,.2,1)' }} />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:14, fontWeight:800, color:T.text, lineHeight:1 }}>{done}</span>
          <span style={{ fontSize:9, color:T.textSoft }}>/{total}</span>
        </div>
      </div>
      <div>
        <p style={{ fontSize:13, fontWeight:700, color:T.text, lineHeight:1.3 }}>
          {done===total && total>0 ? '🌟 Day cleared!' : `${total-done} remaining`}
        </p>
        <p style={{ fontSize:11, color:T.textSoft, marginTop:2 }}>
          {pct===0?'Let\'s begin.':pct<.5?'Good pace.':pct<1?'Almost done.':'Outstanding.'}
        </p>
      </div>
    </div>
  )
}

// ─── Hero Card ────────────────────────────────────────────────────────────────
function HeroCard({ intent, onAct, onDone, isDone }) {
  const T = window.__T; const tm = TIER_META_FN(T)
  if (isDone) return (
    <div className="done" style={{ marginBottom:12, padding:'14px 18px', borderRadius:16,
      background:T.greenSoft, border:`1px solid ${T.teal}30`, display:'flex', alignItems:'center', gap:12 }}>
      <CheckCircle2 size={18} color={T.green} />
      <div>
        <p style={{ fontWeight:700, fontSize:13, color:T.green }}>Handled.</p>
        <p style={{ fontSize:12, color:T.textSoft, marginTop:1 }}>{intent.headline}</p>
      </div>
    </div>
  )
  const m = tm[intent.tier]
  return (
    <div className="enter" style={{ marginBottom:12, borderRadius:20, overflow:'hidden', position:'relative',
      background: `linear-gradient(135deg, ${T.surface} 0%, ${m.bg} 100%)`,
      border:`1px solid ${m.color}30`, boxShadow:`0 2px 20px ${m.color}15, ${T.shadowSm}` }}>
      {/* Subtle shimmer accent line */}
      <div style={{ height:2, background:`linear-gradient(90deg,transparent,${m.color}60,transparent)`,
        backgroundSize:'300% 100%', animation:'shimmer 3s linear infinite' }} />
      <div style={{ padding:'18px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:T.textXsoft }}>Most important right now</span>
          <TierDot tier={intent.tier} />
        </div>
        <h2 style={{ fontSize:17, fontWeight:800, lineHeight:1.35, color:T.text, marginBottom:7 }}>{intent.headline}</h2>
        <p style={{ fontSize:13, lineHeight:1.65, color:T.textMid, marginBottom:14 }}>{intent.why}</p>
        <div style={{ padding:'8px 12px', borderRadius:10, marginBottom:16, fontFamily:'monospace', fontSize:11,
          background:T.surfaceMid, color:T.textSoft, backdropFilter:'blur(8px)' }}>
          {intent.evidence}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Btn variant="primary" icon={Sparkles} onClick={() => { SFX.tap(); HX.tap(); onAct(intent) }}
            style={{ fontSize:13 }}>{intent.action}</Btn>
          <Btn variant="secondary" onClick={() => { SFX.done(); HX.done(); onDone(intent.id) }}>Mark resolved</Btn>
        </div>
      </div>
    </div>
  )
}

// ─── Intent Card ──────────────────────────────────────────────────────────────
function IntentCard({ intent, idx, onAct, onDone, onDismiss, isDone }) {
  const T = window.__T; const tm = TIER_META_FN(T)
  const [expanded, setExpanded] = useState(false)
  if (isDone) return (
    <div className="done" style={{ marginBottom:8, padding:'10px 14px', borderRadius:12,
      background:T.greenSoft, border:`1px solid ${T.teal}25`, display:'flex', alignItems:'center', gap:8 }}>
      <Check size={12} color={T.green} />
      <span style={{ fontSize:12, color:T.green, fontWeight:600 }}>Done — {intent.headline}</span>
    </div>
  )
  const m = tm[intent.tier]
  return (
    <div className="enter" style={{ marginBottom:8, borderRadius:14, overflow:'hidden', animationDelay:`${idx*.05}s`,
      background:T.surface, border:`1px solid ${T.border}`,
      borderLeft:`3px solid ${m.color}`, boxShadow:T.shadowSm,
      backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', transition:'box-shadow .2s, border-color .2s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow=T.shadowPurple; e.currentTarget.style.borderColor=T.borderMid }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow=T.shadowSm; e.currentTarget.style.borderColor=T.border; e.currentTarget.style.borderLeftColor=m.color }}>
      <div style={{ padding:'12px 14px 10px' }}>
        {/* Header row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
          <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:T.textXsoft }}>{intent.cat}</span>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            {intent.prepReady && <Chip text="Prep ready" color={T.blue} />}
            <TierDot tier={intent.tier} />
          </div>
        </div>
        {/* Title */}
        <h3 style={{ fontSize:13, fontWeight:700, lineHeight:1.4, color:T.text, marginBottom:5, cursor:'pointer' }}
          onClick={() => { SFX.tap(); setExpanded(e=>!e) }}>{intent.headline}</h3>
        {/* Why — clipped or expanded */}
        <p style={{ fontSize:12, lineHeight:1.6, color:T.textMid, marginBottom:10,
          display:'-webkit-box', WebkitLineClamp:expanded?99:1, WebkitBoxOrient:'vertical', overflow:expanded?'visible':'hidden' }}>
          {intent.why}
        </p>
        {/* Evidence (only when expanded) */}
        {expanded && (
          <div style={{ marginBottom:10, padding:'7px 10px', borderRadius:8, fontFamily:'monospace', fontSize:11,
            background:T.surfaceMid, color:T.textSoft }}>
            <span style={{ display:'block', fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', color:T.textXsoft, marginBottom:3 }}>What Jarvis read</span>
            {intent.evidence}
          </div>
        )}
        {/* Footer */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:`1px solid ${T.border}`, paddingTop:8 }}>
          <Chip text={intent.source} />
          <div style={{ display:'flex', alignItems:'center', gap:2 }}>
            <button type="button" title="Expand" onClick={() => { SFX.tap(); setExpanded(e=>!e) }}
              style={{ padding:6, borderRadius:8, background:'none', border:'none', cursor:'pointer', color:T.textSoft, transition:'color .15s' }}>
              <ChevronDown size={13} style={{ transform:expanded?'rotate(180deg)':'', transition:'transform .2s' }} />
            </button>
            <button type="button" title="Mark done" onClick={() => { SFX.done(); HX.done(); onDone(intent.id) }}
              style={{ padding:6, borderRadius:8, background:'none', border:'none', cursor:'pointer', color:T.green }}>
              <Check size={13} />
            </button>
            <button type="button" title="Dismiss" onClick={() => { SFX.tap(); onDismiss(intent.id) }}
              style={{ padding:6, borderRadius:8, background:'none', border:'none', cursor:'pointer', color:T.textXsoft }}>
              <X size={13} />
            </button>
            <Btn variant="primary" icon={intent.chatScenario ? MessageCircle : Zap}
              onClick={() => { SFX.tap(); HX.tap(); onAct(intent) }}
              style={{ marginLeft:4, padding:'6px 12px', fontSize:11 }}>{intent.action}</Btn>
          </div>
        </div>
      </div>
    </div>
  )
}


// ─── Timeline Panel ────────────────────────────────────────────────────────────
// ─── Mini Calendar ────────────────────────────────────────────────────────────
function MiniCalendar() {
  const T = window.__T
  const days = ['Mo','Tu','We','Th','Fr','Sa','Su']
  // May 2026: starts on Friday (index 4)
  const startOffset = 4
  const totalDays = 31
  const today = 1
  const eventDays = new Set([1,5,8,12,15,19,22,26,29])
  const cells = []
  for (let i=0; i<startOffset; i++) cells.push(null)
  for (let d=1; d<=totalDays; d++) cells.push(d)
  return (
    <div style={{ padding:'16px 14px', borderRadius:16, background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadowSm, marginBottom:12 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <p style={{ fontSize:13, fontWeight:800, color:T.text }}>May 2026</p>
        <div style={{ display:'flex', gap:2 }}>
          <button type="button" style={{ width:24, height:24, borderRadius:6, border:'none', background:'none', cursor:'pointer', color:T.textSoft, display:'flex', alignItems:'center', justifyContent:'center' }}><ChevronLeft size={13}/></button>
          <button type="button" style={{ width:24, height:24, borderRadius:6, border:'none', background:'none', cursor:'pointer', color:T.textSoft, display:'flex', alignItems:'center', justifyContent:'center' }}><ChevronRight size={13}/></button>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:6 }}>
        {days.map(d => (
          <div key={d} style={{ textAlign:'center', fontSize:10, fontWeight:700, color:T.textXsoft, padding:'2px 0' }}>{d}</div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
        {cells.map((d, i) => (
          <div key={i} style={{ aspectRatio:'1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderRadius:8, cursor:d?'pointer':'default',
            background: d===today ? T.core : 'none',
            transition:'background .15s' }}
            onMouseEnter={e => { if(d && d!==today) e.currentTarget.style.background=T.coreSoft }}
            onMouseLeave={e => { if(d && d!==today) e.currentTarget.style.background='none' }}>
            {d && <>
              <span style={{ fontSize:11, fontWeight:d===today?800:500, color:d===today?'white':T.textMid, lineHeight:1 }}>{d}</span>
              {eventDays.has(d) && d!==today && (
                <div style={{ width:3, height:3, borderRadius:'50%', background:T.core, marginTop:2 }} />
              )}
              {d===today && (
                <div style={{ width:3, height:3, borderRadius:'50%', background:'rgba(255,255,255,0.7)', marginTop:2 }} />
              )}
            </>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Right Panel (Calendar + Feed) ───────────────────────────────────────────
function RightPanel({ onEventClick, onAddMeeting }) {
  const T = window.__T
  const typeColor = { meeting:T.blue, '1on1':T.core, gate:T.red, external:T.teal }
  const nowMinutes = 9*60+45
  const toMin = t => { const [h,m]=t.split(':').map(Number); return h*60+m }
  const [feedExpanded, setFeedExpanded] = useState(null)
  return (
    <div style={{ width:288, flexShrink:0, borderLeft:`1px solid ${T.border}`, overflowY:'auto', padding:'16px 14px 40px', background:T.rail }}>
      {/* ── Calendar card ── */}
      <MiniCalendar />

      {/* ── Today's schedule ── */}
      <div style={{ borderRadius:16, background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadowSm, marginBottom:12, overflow:'hidden' }}>
        <div style={{ padding:'12px 14px 10px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <p style={{ fontSize:12, fontWeight:800, color:T.text }}>Today's schedule</p>
          <Btn variant="secondary" icon={Plus} onClick={() => { SFX.tap(); onAddMeeting() }} style={{ padding:'4px 9px', fontSize:10 }}>Add</Btn>
        </div>
        <div style={{ padding:'10px 12px', position:'relative' }}>
          <div style={{ position:'absolute', left:28, top:10, bottom:10, width:1, background:T.border }} />
          {TODAY_EVENTS.map((ev, i) => {
            const evMin = toMin(ev.time)
            const isPast = evMin + 30 < nowMinutes
            const isNow = evMin <= nowMinutes && nowMinutes < toMin(ev.end)
            const color = typeColor[ev.type] || T.blue
            const showNowLine = i>0 && toMin(TODAY_EVENTS[i-1].time)<nowMinutes && evMin>=nowMinutes
            return (
              <div key={ev.id}>
                {showNowLine && (
                  <div style={{ display:'flex', alignItems:'center', gap:5, margin:'5px 0', paddingLeft:16 }}>
                    <div style={{ width:14, height:14, borderRadius:'50%', flexShrink:0, background:T.red, display:'flex', alignItems:'center', justifyContent:'center', zIndex:1, position:'relative' }}>
                      <div style={{ width:4, height:4, borderRadius:'50%', background:'white' }} />
                    </div>
                    <span style={{ fontSize:9, fontWeight:700, color:T.red }}>Now · 9:45</span>
                  </div>
                )}
                <div onClick={() => { SFX.tap(); HX.tap(); onEventClick(ev) }}
                  style={{ display:'flex', gap:6, marginBottom:6, cursor:'pointer', opacity:isPast?.45:1 }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:36, flexShrink:0 }}>
                    <span style={{ fontSize:9, fontWeight:600, color:T.textXsoft, marginBottom:3 }}>{ev.time}</span>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:isPast?T.border:color,
                      boxShadow:isNow?`0 0 6px ${color}80`:'none', zIndex:1, position:'relative' }} />
                  </div>
                  <div style={{ flex:1, padding:'6px 9px', borderRadius:10,
                    background:isNow?`${T.core}08`:T.surfaceMid,
                    border:`1px solid ${isNow?`${T.core}25`:T.border}` }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=`${T.core}35` }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor=isNow?`${T.core}25`:T.border }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:3 }}>
                      <p style={{ fontSize:11, fontWeight:700, color:T.text, lineHeight:1.3, flex:1 }}>{ev.title}</p>
                      {ev.hasPrep && <span style={{ fontSize:8, fontWeight:800, padding:'1px 5px', borderRadius:99, background:T.blueSoft, color:T.blue, flexShrink:0 }}>Prep</span>}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:3 }}>
                      <div style={{ width:4, height:4, borderRadius:'50%', background:color, flexShrink:0 }} />
                      <span style={{ fontSize:9, color:T.textSoft }}>{ev.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Feed inline ── */}
      <div style={{ borderRadius:16, background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadowSm, overflow:'hidden' }}>
        <div style={{ padding:'12px 14px 10px', borderBottom:`1px solid ${T.border}` }}>
          <p style={{ fontSize:12, fontWeight:800, color:T.text }}>Activity</p>
          <p style={{ fontSize:10, color:T.textSoft, marginTop:2 }}>Jarvis actions today</p>
        </div>
        <div style={{ padding:'8px 12px' }}>
          {FEED_ITEMS.slice(0,4).map((item, i) => (
            <div key={item.id} onClick={() => { SFX.tap(); setFeedExpanded(feedExpanded===item.id?null:item.id) }}
              style={{ padding:'9px 0', borderBottom: i<3?`1px solid ${T.border}`:'none', cursor:'pointer' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:16, flexShrink:0 }}>{item.emoji}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:1 }}>
                    <p style={{ fontSize:11, fontWeight:700, color:T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{item.title}</p>
                    <span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:99, flexShrink:0,
                      background:item.status==='running'?T.coreSoft:T.greenSoft,
                      color:item.status==='running'?T.core:T.green }}>
                      {item.status==='running'?'●':'✓'}
                    </span>
                  </div>
                  <p style={{ fontSize:10, color:T.textSoft, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.body}</p>
                </div>
              </div>
              {feedExpanded===item.id && (
                <div style={{ marginTop:8, paddingLeft:24 }}>
                  {item.steps.map((step, si) => {
                    const done = item.status==='done' || si<item.steps.length-1
                    return (
                      <div key={si} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                        <div style={{ width:14, height:14, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                          background:done?T.greenSoft:T.coreSoft }}>
                          {done ? <Check size={8} color={T.green} /> : <Loader2 size={8} color={T.core} style={{ animation:'spin 1s linear infinite' }} />}
                        </div>
                        <p style={{ fontSize:10, color:done?T.textSoft:T.core }}>{step}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Add Meeting Modal ────────────────────────────────────────────────────────
function AddMeetingModal({ onClose }) {
  const T = window.__T
  const [prep, setPrep] = useState(true)
  const inp = { width:'100%', padding:'9px 12px', borderRadius:10, fontSize:13, outline:'none',
    background:T.surfaceMid, border:`1px solid ${T.border}`, color:T.text, fontFamily:T.font,
    backdropFilter:'blur(8px)', transition:'border-color .15s' }
  const lbl = { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:T.textSoft, marginBottom:5 }
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', zIndex:300,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(6px)' }}>
      <div className="pop" style={{ width:'100%', maxWidth:440, borderRadius:24, overflow:'hidden',
        background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadowMd,
        backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)' }}>
        <div style={{ padding:'18px 22px 14px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <p style={{ fontSize:15, fontWeight:800, color:T.text }}>Add meeting</p>
          <Btn variant="ghost" icon={X} onClick={() => { SFX.close(); onClose() }} style={{ padding:6 }} />
        </div>
        <div style={{ padding:'18px 22px', display:'flex', flexDirection:'column', gap:14 }}>
          <div><label style={lbl}>Title</label><input style={inp} placeholder="Meeting title" onFocus={e=>e.target.style.borderColor=T.core} onBlur={e=>e.target.style.borderColor=T.border} /></div>
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ flex:1.2 }}><label style={lbl}>Date</label><input type="date" defaultValue="2026-05-01" style={inp} onFocus={e=>e.target.style.borderColor=T.core} onBlur={e=>e.target.style.borderColor=T.border} /></div>
            <div style={{ flex:1 }}><label style={lbl}>Start</label><input type="time" defaultValue="10:00" style={inp} onFocus={e=>e.target.style.borderColor=T.core} onBlur={e=>e.target.style.borderColor=T.border} /></div>
            <div style={{ flex:1 }}><label style={lbl}>End</label><input type="time" defaultValue="10:30" style={inp} onFocus={e=>e.target.style.borderColor=T.core} onBlur={e=>e.target.style.borderColor=T.border} /></div>
          </div>
          <div><label style={lbl}>Attendees</label><input style={inp} placeholder="Names or emails" onFocus={e=>e.target.style.borderColor=T.core} onBlur={e=>e.target.style.borderColor=T.border} /></div>
          <div>
            <label style={lbl}>Location</label>
            <div style={{ display:'flex', gap:8 }}>
              {['Teams','Zoom','In person'].map(loc => (
                <label key={loc} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:10, cursor:'pointer',
                  background:T.surfaceMid, border:`1px solid ${T.border}`, fontSize:12, color:T.textMid }}>
                  <input type="radio" name="loc" defaultChecked={loc==='Teams'} style={{ accentColor:T.core }} /> {loc}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 14px', borderRadius:12,
            background:T.surfaceMid, border:`1px solid ${T.border}` }}>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:T.text }}>Let Jarvis prep this meeting</p>
              <p style={{ fontSize:11, color:T.textSoft, marginTop:2 }}>Auto-fetch deck & notes 30 min before</p>
            </div>
            <Toggle value={prep} onChange={() => { SFX.tap(); setPrep(v=>!v) }} />
          </div>
        </div>
        <div style={{ padding:'14px 22px', borderTop:`1px solid ${T.border}`, display:'flex', gap:8, justifyContent:'flex-end' }}>
          <Btn variant="secondary" onClick={() => { SFX.close(); onClose() }}>Cancel</Btn>
          <Btn variant="primary" icon={Calendar} onClick={() => { SFX.done(); HX.done(); onClose() }}>Add to Calendar</Btn>
        </div>
      </div>
    </div>
  )
}


// ─── Chat Panel (4 tabs) ──────────────────────────────────────────────────────
function ChatPanel({ item, scenario, onClose, setCoreState, activeTab, setActiveTab, onExpandFull }) {
  const T = window.__T
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    if (scenario && CHAT_SCENARIOS[scenario]) {
      setThinking(true); setCoreState('thinking')
      const t = setTimeout(() => { setThinking(false); setCoreState('confirming'); setMessages(CHAT_SCENARIOS[scenario]) }, 1100)
      return () => clearTimeout(t)
    } else if (item) {
      setMessages([{ role:'j', text:`I can help with **"${item.headline}"**. What would you like to do?` }])
    }
  }, [scenario, item?.id])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages, thinking])

  const send = () => {
    if (!input.trim()) return
    SFX.whisper(); HX.tap()
    const txt = input; setInput('')
    setMessages(p => [...p, { role:'u', text:txt }])
    setThinking(true); setCoreState('thinking')
    setTimeout(() => {
      setThinking(false)
      const low = txt.toLowerCase()
      let reply = '', nextState = 'idle'
      if (/\ba\b|assign|draft|escalat|authoris/.test(low)) {
        reply = "Done ✓ Action taken and logged in Feed. I'll update you if there's a response."; nextState='executing'
        SFX.done(); HX.done()
        setTimeout(() => setCoreState('idle'), 2000)
      } else if (/\bb\b|remind|set|schedule/.test(low)) {
        reply = 'Reminder set for Thursday 9 AM ✓'; nextState='idle'; SFX.done()
      } else if (/\bc\b|show|details|more/.test(low)) {
        reply = 'Here are the full details:\n\n· Status: In Review\n· SLA breached: +2 days\n· Amy Torres OOO: until May 4\n· Next available reviewer: TBD\n\nShall I draft the escalation?'; nextState='confirming'
      } else {
        reply = 'Got it. I can draft, remind, or dig deeper. What helps most?'
      }
      setCoreState(nextState)
      setMessages(p => [...p, { role:'j', text:reply }])
    }, 900)
  }

  const tabs = [
    { id:'chat', label:'Chat', Icon:MessageCircle },
    { id:'docs', label:'Docs', Icon:FileText },
    { id:'people', label:'People', Icon:Users },
    { id:'channels', label:'Channels', Icon:Hash },
  ]

  const renderMsg = (text) => text.split('\n').map((line, li) => {
    if (!line) return <br key={li} />
    const parts = line.split(/\*\*(.*?)\*\*/)
    return <p key={li} style={{ marginTop:li>0?4:0 }}>{parts.map((p,pi) => pi%2===1 ? <strong key={pi}>{p}</strong> : p)}</p>
  })

  return (
    <div className="enter-r" style={{ position:'fixed', right:0, top:0, bottom:0, width:400, display:'flex', flexDirection:'column',
      zIndex:50, background:T.surfaceBlur, backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
      borderLeft:`1px solid ${T.border}`, boxShadow:`-6px 0 40px rgba(0,0,0,0.12)` }}>
      {/* Header */}
      <div style={{ padding:'14px 16px', borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
              background:T.coreGrad, boxShadow:`0 0 12px ${T.coreGlow}` }}>
              <Sparkles size={15} color="white" />
            </div>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:T.text }}>Jarvis</p>
              <p style={{ fontSize:10, color:T.textSoft }}>
                {scenario==='incident'?'🔴 P1 Active':'Negotiation workspace'}
              </p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <button type="button" title="Open full screen" onClick={() => { SFX.tap(); onExpandFull?.() }}
              style={{ width:28, height:28, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
                background:'none', border:'none', cursor:'pointer', color:T.textSoft, transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background=T.coreSoft; e.currentTarget.style.color=T.core }}
              onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color=T.textSoft }}>
              <Maximize2 size={13} />
            </button>
            <Btn variant="ghost" icon={X} onClick={() => { SFX.close(); onClose() }} style={{ padding:6 }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} type="button" onClick={() => { SFX.tap(); setActiveTab(id) }}
            style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'10px 4px',
              fontSize:11, fontWeight:700, border:'none', background:'none', cursor:'pointer', position:'relative',
              color: activeTab===id ? T.core : T.textSoft, transition:'color .15s' }}>
            <Icon size={12} />{label}
            {activeTab===id && <div style={{ position:'absolute', bottom:0, left:'10%', right:'10%', height:2,
              borderRadius:'2px 2px 0 0', background:T.core }} />}
          </button>
        ))}
      </div>

      {/* Context card — Chat tab only */}
      {activeTab==='chat' && item && !scenario && (
        <div style={{ margin:'12px 14px 0', padding:'11px 13px', borderRadius:12,
          background:T.surfaceMid, border:`1px solid ${T.border}` }}>
          <p style={{ fontSize:12, fontWeight:700, color:T.text, lineHeight:1.4, marginBottom:7 }}>{item.headline}</p>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            <TierDot tier={item.tier} />
            <Chip text={item.source} />
          </div>
          {item.evidence && (
            <p style={{ fontFamily:'monospace', fontSize:11, marginTop:8, color:T.textSoft, lineHeight:1.5 }}>
              <span style={{ display:'block', fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', color:T.textXsoft, marginBottom:3 }}>Evidence</span>
              {item.evidence}
            </p>
          )}
        </div>
      )}

      {/* Chat messages */}
      {activeTab==='chat' && (
        <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
          {messages.map((m,i) => (
            <div key={i} className="enter" style={{ display:'flex', justifyContent:m.role==='u'?'flex-end':'flex-start', animationDelay:`${i*.04}s` }}>
              {m.role==='j' && (
                <div style={{ width:26, height:26, borderRadius:'50%', flexShrink:0, marginRight:8, marginTop:2,
                  display:'flex', alignItems:'center', justifyContent:'center', background:T.coreGrad }}>
                  <Sparkles size={12} color="white" />
                </div>
              )}
              <div style={{ maxWidth:'84%', padding:'10px 13px', borderRadius:14, fontSize:12.5, lineHeight:1.65,
                ...(m.role==='u'
                  ? { background:T.coreGrad, color:'white' }
                  : { background:T.surfaceMid, color:T.text, border:`1px solid ${T.border}` }) }}>
                {renderMsg(m.text)}
              </div>
            </div>
          ))}
          {thinking && (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:26, height:26, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:T.coreGrad }}>
                <Sparkles size={12} color="white" />
              </div>
              <div style={{ padding:'10px 14px', borderRadius:14, display:'flex', alignItems:'center', gap:5,
                background:T.surfaceMid, border:`1px solid ${T.border}` }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:T.core,
                    animation:'breathe .9s ease-in-out infinite', animationDelay:`${i*.2}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      {/* Docs tab */}
      {activeTab==='docs' && (
        <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
          <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:T.textXsoft, marginBottom:4 }}>Related documents</p>
          {CHAT_DOCS.map((doc, i) => (
            <div key={i} className="enter" style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 13px', borderRadius:12,
              background:T.surfaceMid, border:`1px solid ${T.border}`, cursor:'pointer', transition:'all .15s', animationDelay:`${i*.06}s` }}
              onMouseEnter={e => { e.currentTarget.style.background=T.surface; e.currentTarget.style.borderColor=T.borderMid }}
              onMouseLeave={e => { e.currentTarget.style.background=T.surfaceMid; e.currentTarget.style.borderColor=T.border }}>
              <div style={{ width:34, height:34, borderRadius:9, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                background:`${doc.color}12` }}>
                <doc.Icon size={15} color={doc.color} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:12, fontWeight:600, color:T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.name}</p>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3 }}>
                  <Chip text={doc.type} color={doc.color} />
                  <span style={{ fontSize:10, color:T.textXsoft }}>{doc.edited}</span>
                </div>
              </div>
              <ExternalLink size={12} color={T.textXsoft} />
            </div>
          ))}
        </div>
      )}

      {/* People tab */}
      {activeTab==='people' && (
        <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
          <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:T.textXsoft, marginBottom:4 }}>Related people</p>
          {CHAT_PEOPLE.map((person, i) => (
            <div key={i} className="enter" style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 13px', borderRadius:12,
              background:T.surfaceMid, border:`1px solid ${T.border}`, animationDelay:`${i*.06}s` }}>
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{ width:38, height:38, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  background:`${person.color}18`, border:`1.5px solid ${person.color}40` }}>
                  <span style={{ fontSize:12, fontWeight:800, color:person.color }}>{person.avatar}</span>
                </div>
                <div style={{ position:'absolute', bottom:1, right:1, width:9, height:9, borderRadius:'50%',
                  background:person.online ? T.green : T.amber, border:`2px solid ${T.surface}` }} />
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:700, color:T.text }}>{person.name}</p>
                <p style={{ fontSize:11, color:T.textSoft }}>{person.role}</p>
                <p style={{ fontSize:10, color:person.online?T.green:T.amber, marginTop:2 }}>{person.status}</p>
              </div>
              <Btn variant="secondary" style={{ padding:'5px 11px', fontSize:11 }}>Message</Btn>
            </div>
          ))}
        </div>
      )}

      {/* Channels tab */}
      {activeTab==='channels' && (
        <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
          <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:T.textXsoft, marginBottom:4 }}>Related channels</p>
          {CHAT_CHANNELS.map((ch, i) => (
            <div key={i} className="enter" style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 13px', borderRadius:12,
              background:T.surfaceMid, border:`1px solid ${T.border}`, cursor:'pointer', transition:'all .15s', animationDelay:`${i*.06}s` }}
              onMouseEnter={e => e.currentTarget.style.borderColor=T.borderMid}
              onMouseLeave={e => e.currentTarget.style.borderColor=T.border}>
              <div style={{ width:34, height:34, borderRadius:9, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                background:T.coreSoft }}>
                <Hash size={14} color={T.core} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:T.text }}>{ch.name}</p>
                  {ch.unread > 0 && (
                    <span style={{ minWidth:18, height:18, padding:'0 5px', borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center',
                      background:T.core, color:'white', fontSize:9, fontWeight:800 }}>{ch.unread}</span>
                  )}
                </div>
                <p style={{ fontSize:11, color:T.textSoft, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ch.last}</p>
              </div>
              <ChevronRight size={13} color={T.textXsoft} />
            </div>
          ))}
        </div>
      )}

      {/* Whisper input — Chat tab */}
      {activeTab==='chat' && (
        <div style={{ padding:'12px 14px', borderTop:`1px solid ${T.border}`, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:14,
            background:T.surfaceMid, border:`1px solid ${T.border}`, backdropFilter:'blur(8px)',
            transition:'border-color .15s', boxShadow:T.shadowSm }}>
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&send()}
              onFocus={e=>e.currentTarget.parentElement.style.borderColor=T.core}
              onBlur={e=>e.currentTarget.parentElement.style.borderColor=T.border}
              placeholder='Try "A", "remind me", "show details"…'
              style={{ flex:1, fontSize:12.5, background:'none', border:'none', outline:'none', color:T.text, fontFamily:T.font }} />
            <Btn variant="primary" icon={Send} onClick={send} style={{ padding:'6px 10px' }} />
          </div>
          <p style={{ fontSize:10, textAlign:'center', marginTop:7, color:T.textXsoft }}>All actions logged in Feed</p>
        </div>
      )}
    </div>
  )
}


// ─── Welcome Screen ────────────────────────────────────────────────────────────
function WelcomeScreen({ onLogin }) {
  const T = window.__T
  return (
    <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:'40px 24px', position:'relative', minHeight:'100%' }}>
      {/* Ambient blobs */}
      <div style={{ position:'absolute', top:'5%', left:'10%', width:400, height:400, borderRadius:'50%',
        background:`radial-gradient(ellipse, ${T.coreSoft} 0%, transparent 70%)`,
        animation:'blobDrift 18s ease-in-out infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'10%', right:'10%', width:350, height:350, borderRadius:'50%',
        background:`radial-gradient(ellipse, ${T.blueSoft} 0%, transparent 70%)`,
        animation:'blobDrift2 22s ease-in-out infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:'40%', right:'25%', width:250, height:250, borderRadius:'50%',
        background:`radial-gradient(ellipse, ${T.tealSoft} 0%, transparent 70%)`,
        animation:'blobDrift 28s ease-in-out infinite .5s', pointerEvents:'none' }} />

      {/* Central orb */}
      <div className="float-anim" style={{ position:'relative', width:100, height:100, marginBottom:28 }}>
        <div className="ripple-ring" style={{ position:'absolute', inset:0, borderRadius:'50%', border:`1.5px solid ${T.core}50` }} />
        <div className="ripple-ring" style={{ position:'absolute', inset:0, borderRadius:'50%', border:`1.5px solid ${T.core}50`, animationDelay:'1.2s' }} />
        <div style={{ width:100, height:100, borderRadius:28, display:'flex', alignItems:'center', justifyContent:'center',
          background:T.coreGrad, boxShadow:`0 8px 32px ${T.coreGlow}, 0 0 0 8px ${T.coreSoft}`,
          animation:'breathe 4s ease-in-out infinite' }}>
          <Sparkles size={44} color="white" />
        </div>
      </div>

      {/* Heading */}
      <h1 style={{ fontSize:32, fontWeight:800, color:T.text, textAlign:'center', lineHeight:1.15, marginBottom:10, letterSpacing:'-0.02em' }}>
        Good morning, Alex.
      </h1>
      <p style={{ fontSize:15, color:T.textMid, textAlign:'center', marginBottom:28, maxWidth:360, lineHeight:1.6 }}>
        Jarvis has been watching. Your brief is ready — 8 items, 3 need you today.
      </p>

      {/* Stat pills */}
      <div style={{ display:'flex', gap:8, marginBottom:32, flexWrap:'wrap', justifyContent:'center' }}>
        {[
          { label:'8 items compiled', color:T.core },
          { label:'3 decisions needed', color:T.amber },
          { label:'2 auto-handled', color:T.green },
        ].map(({ label, color }, i) => (
          <div key={label} className="enter" style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 14px', borderRadius:99,
            background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadowSm,
            backdropFilter:'blur(12px)', animationDelay:`${i*.1}s` }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:color, flexShrink:0 }} />
            <span style={{ fontSize:12, fontWeight:600, color }}>{label}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button type="button" onClick={() => { SFX.tap(); HX.tap(); onLogin() }}
        style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 28px', borderRadius:16, fontSize:14, fontWeight:700,
          color:'white', background:T.coreGrad, border:'none', cursor:'pointer',
          boxShadow:`0 4px 24px ${T.coreGlow}`, transition:'all .2s', marginBottom:8 }}
        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow=`0 8px 32px ${T.coreGlow}` }}
        onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=`0 4px 24px ${T.coreGlow}` }}>
        <span style={{ fontSize:16 }}>☁️</span> Connect Salesforce to begin <ArrowRight size={15} />
      </button>
      <p style={{ fontSize:11, color:T.textXsoft, marginBottom:36 }}>OAuth 2.0 · No password stored</p>

      {/* Three pillars */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, width:'100%', maxWidth:520, marginBottom:28 }}>
        {[
          { Icon:Activity,     color:T.core,  title:'Know',       desc:'Prioritised brief before you even ask.' },
          { Icon:Zap,          color:T.green, title:'Do',         desc:'Completes low-risk tasks autonomously.' },
          { Icon:Sparkles, color:T.amber, title:'Anticipate', desc:'Detects what\'s missing or about to matter.' },
        ].map(({ Icon, color, title, desc }) => (
          <div key={title} style={{ padding:'16px 14px', borderRadius:16, textAlign:'center',
            background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadowSm,
            backdropFilter:'blur(12px)' }}>
            <div style={{ width:38, height:38, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 10px', background:`${color}12` }}>
              <Icon size={17} color={color} />
            </div>
            <p style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:4 }}>{title}</p>
            <p style={{ fontSize:11, color:T.textSoft, lineHeight:1.5 }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Feed View ────────────────────────────────────────────────────────────────
function FeedView() {
  const T = window.__T
  const [expanded, setExpanded] = useState(null)
  return (
    <div style={{ padding:'24px 24px 40px', maxWidth:640, overflowY:'auto', height:'100%' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h2 style={{ fontSize:18, fontWeight:800, color:T.text }}>Activity log</h2>
          <p style={{ fontSize:12, marginTop:3, color:T.textSoft }}>Every action Jarvis took — fully traceable.</p>
        </div>
      </div>
      <div style={{ position:'relative', paddingLeft:18 }}>
        <div style={{ position:'absolute', left:7, top:8, bottom:0, width:1, background:T.border }} />
        {FEED_ITEMS.map((item, i) => (
          <div key={item.id} className="enter" style={{ position:'relative', marginBottom:12, animationDelay:`${i*.08}s` }}>
            <div style={{ position:'absolute', left:-22, top:16, width:11, height:11, borderRadius:'50%',
              background:item.status==='running'?T.core:T.green,
              boxShadow:item.status==='running'?`0 0 8px ${T.coreGlow}`:'none', zIndex:1 }} />
            <GlassCard onClick={() => { SFX.tap(); setExpanded(expanded===item.id?null:item.id) }} style={{ padding:0, borderRadius:14, cursor:'pointer' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 15px' }}>
                <span style={{ fontSize:20, flexShrink:0 }}>{item.emoji}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                    <span style={{ fontWeight:700, fontSize:13, color:T.text }}>{item.title}</span>
                    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99,
                      background:item.status==='running'?T.coreSoft:T.greenSoft,
                      color:item.status==='running'?T.core:T.green }}>
                      {item.status==='running'?'● Running':'✓ Done'}
                    </span>
                  </div>
                  <p style={{ fontSize:11, color:T.textSoft }}>{item.body}</p>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                  <span style={{ fontSize:10, color:T.textXsoft }}>{item.time}</span>
                  <ChevronDown size={13} color={T.textXsoft} style={{ transform:expanded===item.id?'rotate(180deg)':'', transition:'transform .2s' }} />
                </div>
              </div>
              {expanded===item.id && (
                <div style={{ padding:'0 15px 14px', borderTop:`1px solid ${T.border}` }}>
                  <p style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em', color:T.textXsoft, marginTop:12, marginBottom:10 }}>Steps taken</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                    {item.steps.map((step, si) => {
                      const done = item.status==='done' || si<item.steps.length-1
                      return (
                        <div key={si} style={{ display:'flex', alignItems:'center', gap:9 }}>
                          <div style={{ width:18, height:18, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                            background:done?T.greenSoft:T.coreSoft }}>
                            {done
                              ? <Check size={9} color={T.green} />
                              : <Loader2 size={9} color={T.core} style={{ animation:'spin 1s linear infinite' }} />}
                          </div>
                          <p style={{ fontSize:12, color:done?T.textMid:T.core }}>{step}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Personalise View ─────────────────────────────────────────────────────────
// ─── Agents View (replaces Personalise) ───────────────────────────────────────
function AgentsView({ onNew }) {
  const T = window.__T
  const [agents, setAgents] = useState(AGENTS_DATA)
  const [conns, setConns] = useState(CONNECTIONS)
  const [activeSection, setActiveSection] = useState('agents')
  const toggleAgent = id => setAgents(p => p.map(a => a.id===id ? {...a, enabled:!a.enabled} : a))
  const sectionTab = (id, label) => (
    <button type="button" onClick={() => { SFX.tap(); setActiveSection(id) }}
      style={{ padding:'7px 18px', borderRadius:99, fontSize:12, fontWeight:700, border:'none', cursor:'pointer', transition:'all .2s',
        background: activeSection===id ? T.core : 'none',
        color: activeSection===id ? 'white' : T.textSoft }}>
      {label}
    </button>
  )
  return (
    <div style={{ padding:'24px 28px 48px', overflowY:'auto', height:'100%', maxWidth:900 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:T.text, letterSpacing:'-0.01em' }}>Agents</h1>
          <p style={{ fontSize:13, color:T.textSoft, marginTop:4 }}>AI agents that work for you continuously. Build, configure, and connect them to your tools.</p>
        </div>
        <Btn variant="primary" icon={Plus} onClick={() => { SFX.tap(); onNew() }} style={{ fontSize:13, padding:'9px 18px' }}>New Agent</Btn>
      </div>

      {/* Section tabs */}
      <div style={{ display:'inline-flex', gap:4, padding:'4px', borderRadius:99, background:T.surfaceMid, border:`1px solid ${T.border}`, marginBottom:28 }}>
        {sectionTab('agents', 'My Agents')}
        {sectionTab('connections', 'Connections')}
      </div>

      {/* ── My Agents ── */}
      {activeSection==='agents' && (
        <div>
          {/* Active agents */}
          <div style={{ marginBottom:32 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <p style={{ fontSize:13, fontWeight:800, color:T.text }}>Active</p>
              <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:99, background:T.greenSoft, color:T.green }}>
                {agents.filter(a=>a.enabled).length} running
              </span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:12 }}>
              {agents.filter(a=>a.enabled).map(agent => (
                <div key={agent.id} style={{ borderRadius:18, padding:'18px 18px 14px', background:T.surface,
                  border:`1px solid ${T.border}`, boxShadow:T.shadowSm, transition:'all .2s', position:'relative', overflow:'hidden' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow=T.shadowPurple; e.currentTarget.style.borderColor=T.borderMid }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow=T.shadowSm; e.currentTarget.style.borderColor=T.border }}>
                  {/* Subtle color stripe */}
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${agent.color},transparent)` }} />
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20,
                        background:`${agent.color}15`, flexShrink:0 }}>{agent.icon}</div>
                      <div>
                        <p style={{ fontSize:13, fontWeight:800, color:T.text }}>{agent.name}</p>
                        <p style={{ fontSize:10, color:T.textSoft, marginTop:1 }}>{agent.schedule}</p>
                      </div>
                    </div>
                    <Toggle value={agent.enabled} onChange={() => { SFX.tap(); toggleAgent(agent.id) }} />
                  </div>
                  <p style={{ fontSize:12, color:T.textMid, lineHeight:1.5, marginBottom:12 }}>{agent.desc}</p>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:10, borderTop:`1px solid ${T.border}` }}>
                    <div style={{ display:'flex', gap:12 }}>
                      <div>
                        <p style={{ fontSize:18, fontWeight:800, color:T.text, lineHeight:1 }}>{agent.runs}</p>
                        <p style={{ fontSize:9, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em', color:T.textXsoft }}>Runs</p>
                      </div>
                      <div>
                        <p style={{ fontSize:11, fontWeight:600, color:T.textMid, lineHeight:1 }}>{agent.lastRun}</p>
                        <p style={{ fontSize:9, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em', color:T.textXsoft }}>Last run</p>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:4 }}>
                      <button type="button" style={{ width:28, height:28, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:T.surfaceMid, border:`1px solid ${T.border}`, cursor:'pointer', color:T.textSoft }}><Edit2 size={11}/></button>
                      <button type="button" style={{ width:28, height:28, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:T.surfaceMid, border:`1px solid ${T.border}`, cursor:'pointer', color:T.textSoft }}><Copy size={11}/></button>
                    </div>
                  </div>
                </div>
              ))}
              {/* New agent CTA */}
              <div onClick={() => { SFX.tap(); onNew() }}
                style={{ borderRadius:18, padding:'18px', background:'none', border:`2px dashed ${T.border}`,
                  cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8,
                  minHeight:160, transition:'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=T.core; e.currentTarget.style.background=T.coreSoft }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.background='none' }}>
                <div style={{ width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:T.coreSoft }}>
                  <Plus size={18} color={T.core} />
                </div>
                <p style={{ fontSize:13, fontWeight:700, color:T.core }}>New Agent</p>
                <p style={{ fontSize:11, color:T.textSoft, textAlign:'center' }}>Build from a template or start from scratch</p>
              </div>
            </div>
          </div>

          {/* Inactive agents */}
          {agents.filter(a=>!a.enabled).length > 0 && (
            <div>
              <p style={{ fontSize:13, fontWeight:800, color:T.textSoft, marginBottom:12 }}>Inactive</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {agents.filter(a=>!a.enabled).map(agent => (
                  <div key={agent.id} style={{ borderRadius:14, padding:'13px 16px', background:T.surface,
                    border:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:14, opacity:.6 }}>
                    <div style={{ width:34, height:34, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, background:T.surfaceMid }}>{agent.icon}</div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:T.text }}>{agent.name}</p>
                      <p style={{ fontSize:11, color:T.textSoft }}>{agent.desc}</p>
                    </div>
                    <Toggle value={agent.enabled} onChange={() => { SFX.tap(); toggleAgent(agent.id) }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Connections ── */}
      {activeSection==='connections' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:12 }}>
            {conns.map(c => (
              <div key={c.id} style={{ borderRadius:18, padding:'18px', background:T.surface,
                border:`1px solid ${c.connected?T.borderMid:T.border}`, boxShadow:T.shadowSm, transition:'all .2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow=T.shadowMd}
                onMouseLeave={e => e.currentTarget.style.boxShadow=T.shadowSm}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <span style={{ fontSize:28 }}>{c.logo}</span>
                  <span style={{ fontSize:10, fontWeight:800, padding:'3px 9px', borderRadius:99,
                    background:c.connected?T.greenSoft:T.surfaceMid,
                    color:c.connected?T.green:T.textSoft }}>
                    {c.connected ? '● Connected' : 'Not connected'}
                  </span>
                </div>
                <p style={{ fontSize:14, fontWeight:800, color:T.text, marginBottom:3 }}>{c.name}</p>
                <p style={{ fontSize:11, color:T.textSoft, marginBottom:14 }}>
                  {c.connected ? 'Jarvis can read and act on data from this source.' : 'Connect to unlock Jarvis actions for this source.'}
                </p>
                <Btn variant={c.connected?'secondary':'primary'}
                  icon={c.connected?WifiOff:Wifi}
                  onClick={() => { SFX.tap(); setConns(p=>p.map(x=>x.id===c.id?{...x,connected:!x.connected}:x)) }}
                  style={{ width:'100%', justifyContent:'center' }}>
                  {c.connected ? 'Disconnect' : 'Connect'}
                </Btn>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Agent Wizard ─────────────────────────────────────────────────────────────
function AgentWizard({ onClose }) {
  const T = window.__T
  const [step, setStep] = useState(1); const [sel, setSel] = useState(null); const [ran, setRan] = useState(false); const [running, setRunning] = useState(false)
  const run = () => { setRunning(true); SFX.tap(); setTimeout(() => { setRunning(false); SFX.done(); setRan(true) }, 1500) }
  const inp = { width:'100%', padding:'9px 12px', borderRadius:10, fontSize:13, outline:'none', fontFamily:T.font,
    background:T.surfaceMid, border:`1px solid ${T.border}`, color:T.text }
  const lbl = { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:T.textSoft, marginBottom:5 }
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.25)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(8px)' }}>
      <div className="pop" style={{ width:'100%', maxWidth:600, maxHeight:'88vh', borderRadius:24, overflow:'hidden', display:'flex', flexDirection:'column',
        background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadowMd, backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)' }}>
        <div style={{ padding:'18px 22px', borderBottom:`1px solid ${T.border}`, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:15, fontWeight:800, color:T.core }}>
              {['Choose a template','Agent details','Schedule','Test & activate'][step-1]}
            </p>
            <p style={{ fontSize:11, color:T.textSoft, marginTop:2 }}>Step {step} of 4</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ display:'flex', gap:5 }}>
              {[1,2,3,4].map(s => (
                <div key={s} style={{ height:4, borderRadius:99, transition:'all .2s', width:s===step?20:5,
                  background:s<=step?T.core:T.border }} />
              ))}
            </div>
            <Btn variant="ghost" icon={X} onClick={() => { SFX.close(); onClose() }} style={{ padding:5 }} />
          </div>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'20px 22px' }}>
          {step===1 && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {TEMPLATES.map(t => (
                <button key={t.id} type="button" onClick={() => { SFX.tap(); setSel(t.id) }}
                  style={{ textAlign:'left', padding:'14px', borderRadius:14, cursor:'pointer', transition:'all .15s',
                    background:sel===t.id?T.coreSoft:T.surfaceMid, border:`1px solid ${sel===t.id?T.core:T.border}`,
                    boxShadow:sel===t.id?T.shadowPurple:T.shadowSm }}>
                  <div style={{ fontSize:20, marginBottom:6 }}>{t.icon}</div>
                  <p style={{ fontSize:12, fontWeight:700, color:T.text, marginBottom:3 }}>{t.name}</p>
                  <p style={{ fontSize:11, color:T.textSoft, lineHeight:1.4 }}>{t.desc}</p>
                </button>
              ))}
            </div>
          )}
          {step===2 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div><label style={lbl}>Name *</label><input style={inp} defaultValue={TEMPLATES.find(t=>t.id===sel)?.name||''} /></div>
              <div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                  <label style={lbl}>System prompt *</label>
                  <Btn variant="ghost" icon={Sparkles} style={{ fontSize:11, padding:'3px 8px', color:T.core }}>Generate with AI</Btn>
                </div>
                <textarea style={{ ...inp, height:120, resize:'none', fontFamily:'monospace', fontSize:11 }}
                  defaultValue={'## Trigger\n- User requests a document summary.\n\n## Rules\n1. Only access data with explicit permission.\n2. Never share data externally.'} />
              </div>
            </div>
          )}
          {step===3 && (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[{id:'auto',label:'Run automatically',desc:'Jarvis decides when relevant.'},{id:'scheduled',label:'Scheduled',desc:'Specific time — e.g. weekdays 9 AM.',hasTime:true},{id:'ondemand',label:'On demand',desc:'Only when you ask.'}].map(opt => (
                <label key={opt.id} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'13px 15px', borderRadius:12, cursor:'pointer',
                  background:T.surfaceMid, border:`1px solid ${T.border}` }}>
                  <input type="radio" name="sched" defaultChecked={opt.id==='scheduled'} style={{ marginTop:3, accentColor:T.core }} />
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:T.text }}>{opt.label}</p>
                    <p style={{ fontSize:11, marginTop:3, color:T.textSoft }}>{opt.desc}</p>
                    {opt.hasTime && (
                      <div style={{ display:'flex', gap:8, marginTop:10 }}>
                        <select style={{ ...inp, width:'auto', padding:'6px 10px', fontSize:12 }}><option>Every weekday</option><option>Daily</option></select>
                        <input type="time" defaultValue="09:00" style={{ ...inp, width:'auto', padding:'6px 10px', fontSize:12 }} />
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
          {step===4 && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div>
                <label style={lbl}>Simulation input</label>
                <textarea style={{ ...inp, height:100, resize:'none', marginBottom:10 }} defaultValue="My calendar has 3 back-to-back meetings starting in 30 minutes — prepare me." />
                <Btn variant="primary" icon={running?Loader2:Zap} onClick={run} style={{ width:'100%', justifyContent:'center' }}>
                  {running?'Running…':'Run simulation'}
                </Btn>
              </div>
              <GlassCard style={{ padding:0, overflow:'hidden' }}>
                <div style={{ padding:'9px 12px', borderBottom:`1px solid ${T.border}` }}>
                  <p style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:T.textXsoft }}>Preview</p>
                </div>
                <div style={{ padding:10, height:180, overflowY:'auto', display:'flex', flexDirection:'column', gap:7 }}>
                  {ran ? (<>
                    <div style={{ fontSize:11.5, padding:'9px 11px', borderRadius:12, background:T.surfaceMid, color:T.text }}>Hi — I'm your AI work assistant.</div>
                    <div style={{ fontSize:11.5, padding:'9px 11px', borderRadius:12, background:T.coreGrad, color:'white', alignSelf:'flex-end' }}>3 back-to-back meetings in 30 min — prepare me.</div>
                    <div style={{ fontSize:11.5, padding:'9px 11px', borderRadius:12, background:T.surfaceMid, color:T.text }}>Found your 3 meetings. Prep notes and docs ready. Want me to share?</div>
                  </>) : (
                    <p style={{ fontSize:12, color:T.textXsoft, textAlign:'center', margin:'auto' }}>Run simulation to preview.</p>
                  )}
                </div>
              </GlassCard>
            </div>
          )}
        </div>
        <div style={{ padding:'14px 22px', borderTop:`1px solid ${T.border}`, flexShrink:0, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          {step>1 ? <Btn variant="ghost" icon={ChevronLeft} onClick={() => { SFX.tap(); setStep(s=>s-1) }}>Back</Btn> : <div/>}
          <Btn variant="primary" disabled={step===1&&!sel} onClick={() => { SFX.tap(); step===4?onClose():setStep(s=>s+1) }}>
            {step===4?'Activate →':'Next →'}
          </Btn>
        </div>
      </div>
    </div>
  )
}

// ─── Conversations View ────────────────────────────────────────────────────────
function ConversationsView({ openConvId, onConvOpen, setCoreState }) {
  const T = window.__T
  const [activeCat, setActiveCat] = useState('All')
  const [activeConv, setActiveConv] = useState(openConvId || null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const endRef = useRef(null)

  // When openConvId changes from outside (expand from overlay), open that conv
  useEffect(() => { if (openConvId) { setActiveConv(openConvId) } }, [openConvId])

  const currentConv = CONVERSATIONS.find(c => c.id === activeConv)
  useEffect(() => {
    if (currentConv) setMessages(currentConv.messages)
  }, [activeConv])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages, thinking])

  const filtered = activeCat === 'All' ? CONVERSATIONS : CONVERSATIONS.filter(c => c.category === activeCat)

  const send = () => {
    if (!input.trim()) return
    SFX.whisper(); HX.tap()
    const txt = input; setInput('')
    setMessages(p => [...p, { role:'u', text:txt }])
    setThinking(true); setCoreState('thinking')
    setTimeout(() => {
      setThinking(false); setCoreState('idle')
      setMessages(p => [...p, { role:'j', text:"Got it. I've noted that and will follow up. Is there anything else you'd like me to handle?" }])
    }, 900)
  }

  const renderMsg = (text) => text.split('\n').map((line, li) => {
    if (!line) return <br key={li} />
    const parts = line.split(/\*\*(.*?)\*\*/)
    return <p key={li} style={{ marginTop:li>0?4:0 }}>{parts.map((p,pi) => pi%2===1 ? <strong key={pi}>{p}</strong> : p)}</p>
  })

  return (
    <div style={{ flex:1, display:'flex', overflow:'hidden', height:'100%' }}>
      {/* Left: conversation list */}
      <div style={{ width:280, flexShrink:0, borderRight:`1px solid ${T.border}`, display:'flex', flexDirection:'column', background:T.rail }}>
        {/* Search */}
        <div style={{ padding:'14px 12px 10px', borderBottom:`1px solid ${T.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:12,
            background:T.surfaceMid, border:`1px solid ${T.border}` }}>
            <Search size={13} color={T.textXsoft} />
            <input placeholder="Search conversations…" style={{ flex:1, fontSize:12, background:'none', border:'none', outline:'none', color:T.text, fontFamily:T.font }} />
          </div>
        </div>
        {/* Categories */}
        <div style={{ padding:'8px 12px', borderBottom:`1px solid ${T.border}`, display:'flex', gap:5, flexWrap:'wrap' }}>
          {CONVERSATION_CATEGORIES.map(cat => (
            <button key={cat} type="button" onClick={() => { SFX.tap(); setActiveCat(cat) }}
              style={{ padding:'4px 10px', borderRadius:99, fontSize:11, fontWeight:700, border:'none', cursor:'pointer', transition:'all .15s',
                background: activeCat===cat ? T.core : T.surfaceMid,
                color: activeCat===cat ? 'white' : T.textSoft }}>
              {cat}
            </button>
          ))}
        </div>
        {/* List */}
        <div style={{ flex:1, overflowY:'auto', padding:'8px 8px' }}>
          {filtered.map(conv => (
            <div key={conv.id} onClick={() => { SFX.tap(); setActiveConv(conv.id) }}
              style={{ padding:'11px 12px', borderRadius:12, marginBottom:4, cursor:'pointer', transition:'all .15s',
                background: activeConv===conv.id ? T.coreSoft : 'none',
                border: `1px solid ${activeConv===conv.id ? `${T.core}30` : 'transparent'}` }}
              onMouseEnter={e => { if(activeConv!==conv.id) e.currentTarget.style.background=T.surfaceMid }}
              onMouseLeave={e => { if(activeConv!==conv.id) e.currentTarget.style.background='none' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:3 }}>
                <p style={{ fontSize:12, fontWeight:700, color: activeConv===conv.id ? T.core : T.text, lineHeight:1.3, flex:1, marginRight:8 }}>{conv.title}</p>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4, flexShrink:0 }}>
                  <span style={{ fontSize:9, color:T.textXsoft }}>{conv.time}</span>
                  {conv.unread > 0 && (
                    <span style={{ width:16, height:16, borderRadius:'50%', background:T.core, color:'white', fontSize:9, fontWeight:800,
                      display:'flex', alignItems:'center', justifyContent:'center' }}>{conv.unread}</span>
                  )}
                </div>
              </div>
              <p style={{ fontSize:11, color:T.textSoft, lineHeight:1.4,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{conv.preview}</p>
              <div style={{ marginTop:5 }}>
                <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:99,
                  background:`${T.core}12`, color:T.core }}>{conv.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: open conversation */}
      {currentConv ? (
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Conv header */}
          <div style={{ padding:'14px 20px', borderBottom:`1px solid ${T.border}`, flexShrink:0,
            display:'flex', alignItems:'center', justifyContent:'space-between', background:T.topBar, backdropFilter:'blur(12px)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                background:T.coreGrad }}>
                <Sparkles size={15} color="white" />
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:800, color:T.text }}>{currentConv.title}</p>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:2 }}>
                  <span style={{ fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:99, background:`${T.core}12`, color:T.core }}>{currentConv.category}</span>
                  <span style={{ fontSize:10, color:T.textXsoft }}>{currentConv.date} · {currentConv.time}</span>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <Btn variant="secondary" icon={Tag} style={{ padding:'5px 10px', fontSize:11 }}>Categorise</Btn>
              <Btn variant="secondary" icon={Folder} style={{ padding:'5px 10px', fontSize:11 }}>Archive</Btn>
            </div>
          </div>
          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:12 }}>
            {messages.map((m, i) => (
              <div key={i} className="enter" style={{ display:'flex', justifyContent:m.role==='u'?'flex-end':'flex-start', animationDelay:`${i*.04}s` }}>
                {m.role==='j' && (
                  <div style={{ width:28, height:28, borderRadius:'50%', flexShrink:0, marginRight:10, marginTop:2,
                    display:'flex', alignItems:'center', justifyContent:'center', background:T.coreGrad }}>
                    <Sparkles size={13} color="white" />
                  </div>
                )}
                <div style={{ maxWidth:'72%', padding:'11px 15px', borderRadius:16, fontSize:13, lineHeight:1.65,
                  ...(m.role==='u'
                    ? { background:T.coreGrad, color:'white', borderBottomRightRadius:4 }
                    : { background:T.surface, color:T.text, border:`1px solid ${T.border}`, borderBottomLeftRadius:4 }) }}>
                  {renderMsg(m.text)}
                </div>
              </div>
            ))}
            {thinking && (
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:T.coreGrad }}>
                  <Sparkles size={13} color="white" />
                </div>
                <div style={{ padding:'10px 15px', borderRadius:16, display:'flex', alignItems:'center', gap:5,
                  background:T.surface, border:`1px solid ${T.border}` }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:T.core,
                      animation:'breathe .9s ease-in-out infinite', animationDelay:`${i*.2}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          {/* Input */}
          <div style={{ padding:'12px 20px 16px', borderTop:`1px solid ${T.border}`, flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 16px', borderRadius:16,
              background:T.surface, border:`1px solid ${T.border}`, backdropFilter:'blur(8px)' }}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
                onFocus={e=>e.currentTarget.parentElement.style.borderColor=T.core}
                onBlur={e=>e.currentTarget.parentElement.style.borderColor=T.border}
                placeholder="Continue the conversation…"
                style={{ flex:1, fontSize:13, background:'none', border:'none', outline:'none', color:T.text, fontFamily:T.font }} />
              <Btn variant="primary" icon={Send} onClick={send} style={{ padding:'6px 12px' }} />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}>
          <div style={{ width:56, height:56, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', background:T.coreSoft }}>
            <MessageCircle size={24} color={T.core} />
          </div>
          <p style={{ fontSize:14, fontWeight:700, color:T.text }}>Select a conversation</p>
          <p style={{ fontSize:12, color:T.textSoft }}>Choose from the list to read and continue</p>
        </div>
      )}
    </div>
  )
}

// ─── Whisper Bar ──────────────────────────────────────────────────────────────
function WhisperBar({ persona, coreState, setCoreState, onCommand }) {
  const T = window.__T
  const [val, setVal] = useState('')
  const [focused, setFocused] = useState(false)
  const submit = () => {
    if (!val.trim()) return
    SFX.whisper(); HX.tap()
    const v = val; setVal('')
    setCoreState('thinking')
    setTimeout(() => { onCommand(v); setCoreState('idle') }, 900)
  }
  const ph = persona==='manager' ? '"Team readiness brief" · "Batch approvals" · "Who is at risk?"'
    : '"Prep my 10 AM" · "Draft reply to Acme" · "What needs me today?"'
  return (
    <div style={{ padding:'10px 16px 14px', background:T.topBar, borderTop:`1px solid ${T.border}`, flexShrink:0, backdropFilter:'blur(12px)' }}>
      <div style={{ borderRadius:18, transition:'box-shadow .2s',
        boxShadow:focused?`0 0 0 2px ${T.core}40, ${T.shadowPurple}`:T.shadowSm }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 16px', borderRadius:18,
          background:T.surface, border:`1px solid ${focused?T.core:T.border}`, transition:'all .2s',
          backdropFilter:'blur(16px)' }}>
          <div style={{ color:coreState==='thinking'?T.core:T.textXsoft, flexShrink:0 }}>
            {coreState==='thinking'
              ? <Loader2 size={16} style={{ animation:'spin 1s linear infinite' }} />
              : <Sparkles size={16} />}
          </div>
          <input value={val} onChange={e=>setVal(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&submit()}
            onFocus={() => { setFocused(true); setCoreState('listening') }}
            onBlur={() => { setFocused(false); if(coreState==='listening') setCoreState('idle') }}
            placeholder={ph}
            style={{ flex:1, fontSize:13, background:'none', border:'none', outline:'none', color:T.text, fontFamily:T.font }} />
          <button type="button" style={{ padding:5, background:'none', border:'none', cursor:'pointer', color:T.textSoft }}>
            <Mic size={15} />
          </button>
          <Btn variant="primary" icon={ArrowRight} onClick={submit} style={{ padding:'6px 12px' }} />
        </div>
      </div>
    </div>
  )
}


// ─── Theme toggle button ───────────────────────────────────────────────────────
function ThemeToggle({ mode, onToggle }) {
  const T = window.__T
  return (
    <button type="button" onClick={() => { SFX.tap(); onToggle() }}
      style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:12,
        background:T.surfaceMid, border:`1px solid ${T.border}`, cursor:'pointer', transition:'all .15s', color:T.textMid, fontSize:12, fontWeight:600 }}
      onMouseEnter={e => { e.currentTarget.style.borderColor=T.core; e.currentTarget.style.color=T.core }}
      onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.textMid }}>
      {mode==='light' ? <Moon size={13} /> : <Sun size={13} />}
      {mode==='light' ? 'Dark' : 'Light'}
    </button>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState('light')
  const T = THEMES[mode]
  // Expose T globally for child components that reference window.__T
  window.__T = T

  const [scene, setScene] = useState('welcome')
  const [tab, setTab] = useState('today')
  const [persona, setPersona] = useState('employee')
  const [coreState, setCoreState] = useState('idle')
  const [chatItem, setChatItem] = useState(null)
  const [chatScenario, setChatScenario] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [chatTab, setChatTab] = useState('chat')
  const [showNotif, setShowNotif] = useState(false)
  const [notifDone, setNotifDone] = useState(false)
  const [doneIds, setDoneIds] = useState([])
  const [dismissIds, setDismissIds] = useState([])
  const [showWizard, setShowWizard] = useState(false)
  const [showAddMeeting, setShowAddMeeting] = useState(false)
  const [logging, setLogging] = useState(false)
  // Conversations tab — which conv to open (set when expanding from overlay)
  const [openConvId, setOpenConvId] = useState(null)

  const allIntents = persona==='manager' ? MANAGER_INTENTS : INTENTS
  const visibleIntents = allIntents.filter(i => !dismissIds.includes(i.id))
  const heroIntent = visibleIntents.find(i => i.isHero)
  const restIntents = visibleIntents.filter(i => !i.isHero)
  const doneCount = doneIds.filter(id => allIntents.find(i => i.id===id)).length

  // Proactive alert at 4s
  useEffect(() => {
    if (scene!=='app' || notifDone) return
    const t = setTimeout(() => { SFX.alert(); HX.alert(); setShowNotif(true) }, 4000)
    return () => clearTimeout(t)
  }, [scene, notifDone])

  const handleLogin = () => {
    SFX.tap(); setLogging(true)
    setTimeout(() => { setLogging(false); setScene('app'); setCoreState('thinking'); setTimeout(() => setCoreState('idle'), 2200) }, 1400)
  }
  const openChat = (item, scenario=null) => { setChatItem(item); setChatScenario(scenario); setShowChat(true); setChatTab('chat'); setCoreState('confirming'); SFX.open() }
  // Expand overlay panel → go to Conversations tab with that conversation open
  const expandToConversations = () => {
    // Find or create a conv matching the current chatItem
    const matchId = chatItem ? (CONVERSATIONS.find(c => c.title.toLowerCase().includes(chatItem.headline?.toLowerCase().slice(0,15)||''))?.id || 'cv1') : 'cv1'
    setOpenConvId(matchId)
    setShowChat(false)
    setTab('conversations')
    setCoreState('idle')
    SFX.open()
  }
  const handleAct = intent => openChat(intent, intent.chatScenario||null)
  const handleDone = id => { SFX.done(); HX.done(); setDoneIds(p=>[...p,id]); setTimeout(() => setDismissIds(p=>[...p,id]), 400) }
  const handleDismiss = id => { SFX.tap(); setDismissIds(p=>[...p,id]) }
  const handleNotifAct = () => { setShowNotif(false); setNotifDone(true); openChat(null,'incident') }
  const handleEventClick = ev => openChat({
    headline:ev.title, tier:'L2', source:ev.location,
    evidence:`${ev.time}–${ev.end} · ${ev.attendees.join(', ')}`,
    why:'Jarvis can pull prep notes, attendee context, and related docs for this meeting.',
  }, null)

  const navItems = [
    { id:'today',         label:'Today',         Icon:LayoutDashboard },
    { id:'conversations', label:'Conversations',  Icon:MessageCircle },
    { id:'feed',          label:'Feed',           Icon:History },
    { id:'agents',        label:'Agents',         Icon:Bot },
  ]

  // Loading screen
  if (logging) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:T.appBg, fontFamily:T.font, position:'relative', overflow:'hidden' }}>
      <style>{CSS}</style>
      {/* Blobs */}
      <div style={{ position:'absolute', top:'20%', left:'20%', width:300, height:300, borderRadius:'50%',
        background:`radial-gradient(ellipse, ${T.coreSoft} 0%, transparent 70%)`, animation:'blobDrift 12s ease-in-out infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'20%', right:'20%', width:280, height:280, borderRadius:'50%',
        background:`radial-gradient(ellipse, ${T.blueSoft} 0%, transparent 70%)`, animation:'blobDrift2 15s ease-in-out infinite', pointerEvents:'none' }} />
      <div className="float-anim" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20, zIndex:1 }}>
        <div style={{ position:'relative', width:72, height:72 }}>
          <div className="ripple-ring" style={{ position:'absolute', inset:0, borderRadius:'50%', border:`1.5px solid ${T.core}50` }} />
          <div style={{ width:72, height:72, borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center',
            background:T.coreGrad, boxShadow:`0 8px 32px ${T.coreGlow}`, animation:'breathe 2s ease-in-out infinite' }}>
            <Sparkles size={30} color="white" />
          </div>
        </div>
        <p style={{ color:T.text, fontWeight:700, fontSize:15 }}>Connecting to Salesforce…</p>
        <p style={{ fontSize:12, color:T.textSoft }}>Pulling your morning brief</p>
      </div>
    </div>
  )

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:T.appBg, fontFamily:T.font, position:'relative', transition:'background .3s' }}>
      <style>{CSS}</style>

      {/* Global ambient blobs (dashboard only, subtle) */}
      {scene==='app' && (<>
        <div style={{ position:'fixed', top:'5%', left:'30%', width:500, height:500, borderRadius:'50%', pointerEvents:'none', zIndex:0,
          background:T.blob1, animation:'blobDrift 25s ease-in-out infinite' }} />
        <div style={{ position:'fixed', bottom:'5%', right:'10%', width:400, height:400, borderRadius:'50%', pointerEvents:'none', zIndex:0,
          background:T.blob2, animation:'blobDrift2 30s ease-in-out infinite' }} />
        <div style={{ position:'fixed', top:'40%', left:'5%', width:300, height:300, borderRadius:'50%', pointerEvents:'none', zIndex:0,
          background:T.blob3, animation:'blobDrift 35s ease-in-out infinite 2s' }} />
      </>)}

      {/* Left rail — 52px */}
      <div style={{ width:52, display:'flex', flexDirection:'column', alignItems:'center', padding:'12px 0', gap:2,
        flexShrink:0, background:T.rail, borderRight:`1px solid ${T.border}`, zIndex:10, transition:'background .3s' }}>
        {[Activity, MessageSquare, Users, Calendar].map((Icon, i) => (
          <button key={i} type="button"
            style={{ width:38, height:38, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center',
              background:'none', border:'none', cursor:'pointer', transition:'background .15s', color:T.textXsoft }}
            onMouseEnter={e => { e.currentTarget.style.background=T.coreSoft; e.currentTarget.style.color=T.core }}
            onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color=T.textXsoft }}>
            <Icon size={18} />
          </button>
        ))}
        <div style={{ flex:1 }} />
        {/* Jarvis active */}
        <div style={{ position:'relative', marginBottom:8 }}>
          <div style={{ width:38, height:38, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center',
            background:T.coreGrad, boxShadow:`0 0 12px ${T.coreGlow}` }}>
            <Sparkles size={17} color="white" />
          </div>
          <div style={{ position:'absolute', right:-1, top:'20%', width:3, height:'60%', borderRadius:'3px 0 0 3px', background:T.core }} />
        </div>
        <button type="button" style={{ width:38, height:38, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center',
          background:'none', border:'none', cursor:'pointer', color:T.textXsoft, marginBottom:6 }}>
          <Settings size={16} />
        </button>
        <div style={{ width:30, height:30, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
          background:'#FF7043', marginBottom:8, cursor:'pointer' }}>
          <span style={{ fontSize:12, fontWeight:800, color:'white' }}>A</span>
        </div>
      </div>

      {/* Main column */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', position:'relative', zIndex:1 }}>

        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'0 16px', height:52, flexShrink:0, zIndex:10,
          background:T.topBar, borderBottom:`1px solid ${T.border}`,
          backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', transition:'background .3s' }}>
          <NeuralCore state={coreState} onClick={() => setCoreState('idle')} />
          <div style={{ width:1, height:24, background:T.border, flexShrink:0 }} />
          <nav style={{ display:'flex' }}>
            {navItems.map(({ id, label, Icon }) => (
              <button key={id} type="button" onClick={() => { SFX.tap(); setTab(id); if(scene!=='app') setScene('app') }}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'0 12px', height:52, fontSize:13, fontWeight:600,
                  background:'none', border:'none', cursor:'pointer', position:'relative',
                  color:tab===id&&scene==='app'?T.core:T.textSoft, transition:'color .15s' }}>
                <Icon size={14} />{label}
                {tab===id&&scene==='app' && (
                  <div style={{ position:'absolute', bottom:0, left:8, right:8, height:2, borderRadius:'2px 2px 0 0', background:T.core }} />
                )}
              </button>
            ))}
          </nav>
          <div style={{ flex:1 }} />

          {/* Persona toggle */}
          {scene==='app' && (
            <div style={{ display:'flex', alignItems:'center', borderRadius:10, overflow:'hidden', border:`1px solid ${T.border}` }}>
              {[['employee','Employee'],['manager','Manager']].map(([id,lbl]) => (
                <button key={id} type="button" onClick={() => { SFX.tap(); setPersona(id) }}
                  style={{ padding:'6px 14px', fontSize:11, fontWeight:700, border:'none', cursor:'pointer', transition:'all .15s',
                    background:persona===id?T.core:'transparent', color:persona===id?'white':T.textSoft }}>
                  {lbl}
                </button>
              ))}
            </div>
          )}

          <ThemeToggle mode={mode} onToggle={() => setMode(m=>m==='light'?'dark':'light')} />

          {/* Bell */}
          <button type="button" onClick={() => setShowNotif(v=>!v)}
            style={{ position:'relative', padding:7, borderRadius:10, background:'none', border:'none', cursor:'pointer',
              color:T.textSoft, transition:'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background=T.coreSoft; e.currentTarget.style.color=T.core }}
            onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color=T.textSoft }}>
            <Bell size={16} />
            {showNotif && !notifDone && (
              <span style={{ position:'absolute', top:5, right:5, width:7, height:7, borderRadius:'50%', background:T.red }} />
            )}
          </button>

          {/* Org badge */}
          {scene==='app' && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 10px', borderRadius:10, background:T.surfaceMid, border:`1px solid ${T.border}` }}>
              <div style={{ width:18, height:18, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:T.core }}>
                <span style={{ fontSize:8, fontWeight:800, color:'white' }}>O</span>
              </div>
              <div style={{ lineHeight:1 }}>
                <p style={{ fontSize:11, fontWeight:700, color:T.text }}>OrgFarm EPIC</p>
                <p style={{ fontSize:9, color:T.textXsoft }}>salesforce.com</p>
              </div>
            </div>
          )}
        </div>

        {/* Proactive alert */}
        {showNotif && !notifDone && (
          <div className="enter" style={{ position:'absolute', top:60, right:16, zIndex:100, width:310, borderRadius:18, overflow:'hidden',
            background:T.surface, border:`1px solid ${T.red}30`, boxShadow:`0 8px 32px ${T.red}18, ${T.shadowMd}`,
            backdropFilter:'blur(20px)' }}>
            <div style={{ padding:'10px 14px', background:`${T.red}10`, borderBottom:`1px solid ${T.red}20`,
              display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <AlertTriangle size={13} color={T.red} />
                <span style={{ fontWeight:800, fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', color:T.red }}>Proactive alert</span>
              </div>
              <Btn variant="ghost" icon={X} onClick={() => { setShowNotif(false); setNotifDone(true) }} style={{ padding:4 }} />
            </div>
            <div style={{ padding:'13px 14px' }}>
              <p style={{ fontWeight:700, fontSize:13, color:T.text, marginBottom:5 }}>🔴 P1: Auth Service Down</p>
              <p style={{ fontSize:12, lineHeight:1.6, color:T.textMid, marginBottom:12 }}>
                INC-9942 · EU-West-1 · 503s on /v1/auth · 3 enterprise customers impacted · Incident owner unassigned
              </p>
              <div style={{ display:'flex', gap:8 }}>
                <Btn variant="danger" onClick={handleNotifAct} style={{ flex:1, justifyContent:'center' }}>View & Act →</Btn>
                <Btn variant="secondary" onClick={() => { setShowNotif(false); setNotifDone(true) }}>Dismiss</Btn>
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          {scene==='welcome' && <WelcomeScreen onLogin={handleLogin} />}

          {scene==='app' && tab==='today' && (
            <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
              {/* Intent list */}
              <div style={{ flex:1, overflowY:'auto', padding:'20px 20px 100px' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:18 }}>
                  <div>
                    <p style={{ fontSize:11, fontWeight:600, color:T.textXsoft, marginBottom:3 }}>Thursday · May 1</p>
                    <h1 style={{ fontSize:21, fontWeight:800, lineHeight:1.2, color:T.text }}>
                      {persona==='manager' ? 'Your team needs 3 things.' : 'Jarvis has your brief ready.'}
                    </h1>
                    <p style={{ fontSize:13, marginTop:5, color:T.textSoft }}>
                      {persona==='manager'
                        ? "I watched overnight. Here's what I flagged."
                        : `${visibleIntents.length} items compiled from Salesforce, Outlook & Workday.`}
                    </p>
                  </div>
                  <DayArc done={doneCount} total={allIntents.length} />
                </div>
                {heroIntent && (
                  <HeroCard intent={heroIntent} onAct={handleAct} onDone={handleDone} isDone={doneIds.includes(heroIntent.id)} />
                )}
                {restIntents.map((intent, i) => (
                  <IntentCard key={intent.id} intent={intent} idx={i}
                    onAct={handleAct} onDone={handleDone} onDismiss={handleDismiss}
                    isDone={doneIds.includes(intent.id)} />
                ))}
                <div className="enter" style={{ marginTop:14, padding:'15px 17px', borderRadius:16,
                  background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadowSm,
                  backdropFilter:'blur(12px)', animationDelay:'.3s' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                    <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:T.coreSoft }}>
                      <Sparkles size={15} color={T.core} />
                    </div>
                    <div>
                      <p style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', color:T.core, marginBottom:5 }}>Jarvis overnight insight</p>
                      <p style={{ fontSize:13, fontWeight:600, lineHeight:1.55, color:T.text, marginBottom:4 }}>
                        {persona==='manager'
                          ? "Your team's velocity is 12% above target — but Liam's hours are masking a dependency risk on the Auth refactor."
                          : "Your Acme SOW response time is 40% faster than your last 3 deals. Pre-briefing Legal appears to be the variable."}
                      </p>
                      <p style={{ fontSize:11, color:T.textSoft }}>
                        {persona==='manager' ? 'Sprint 16 · Jira velocity · Liam Davis hours' : 'Outlook thread history · 4 recent SOW cycles'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Right panel: calendar + schedule + feed */}
              <RightPanel onEventClick={handleEventClick} onAddMeeting={() => setShowAddMeeting(true)} />
            </div>
          )}

          {scene==='app' && tab==='conversations' && (
            <ConversationsView openConvId={openConvId} onConvOpen={id=>setOpenConvId(id)} setCoreState={setCoreState} />
          )}
          {scene==='app' && tab==='feed' && <FeedView />}
          {scene==='app' && tab==='agents' && <AgentsView onNew={() => setShowWizard(true)} />}
        </div>

        {/* Whisper bar */}
        {scene==='app' && tab==='today' && (
          <WhisperBar persona={persona} coreState={coreState} setCoreState={setCoreState}
            onCommand={cmd => {
              const l = cmd.toLowerCase()
              if (l.includes('manager')||l.includes('team')) setPersona('manager')
              else if (l.includes('employee')||l.includes('my day')) setPersona('employee')
            }} />
        )}
      </div>

      {/* Chat sidebar */}
      {showChat && (
        <ChatPanel item={chatItem} scenario={chatScenario} setCoreState={setCoreState}
          activeTab={chatTab} setActiveTab={setChatTab}
          onExpandFull={expandToConversations}
          onClose={() => { setShowChat(false); setChatItem(null); setChatScenario(null); setCoreState('idle') }} />
      )}

      {showWizard && <AgentWizard onClose={() => setShowWizard(false)} />}
      {showAddMeeting && <AddMeetingModal onClose={() => setShowAddMeeting(false)} />}
    </div>
  )
}

