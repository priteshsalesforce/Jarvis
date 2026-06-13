import React, { useState, useEffect, useRef, useCallback } from 'react'
// Microsoft Fluent UI System Icons (Teams design system) via a thin adapter
// that preserves the Lucide `size`/`color` prop API. Swapped from lucide-react
// so the Jarvis app surface uses the same icon family as Teams.
import {
  Bell, CheckCircle2, MessageCircle, ExternalLink, Plus, Settings, Users,
  AlertTriangle, Calendar, Clock, ArrowRight, Send, Mic, X, Check,
  Loader2, LogOut, ChevronLeft, Sparkles, Activity, ShieldCheck,
  Zap, TrendingUp, FileText, MessageSquare, Lock,
  Database, LayoutDashboard, History, Sliders, ChevronRight,
  ChevronDown, Hash, Moon, Sun, MapPin, Video, UserCircle2,
  Maximize2, Bot, Tag, Folder, Search, Filter, Star,
  Wifi, WifiOff, Power, Edit2, Trash2, Copy, Globe,
  ThumbsUp, ThumbsDown, Info, Flag,
  Coffee, Brain, Leaf, Dumbbell, BookOpen,
  Phone, ArrowLeft, MoreHorizontal, Minus, Square,
  Compass, Wand2, PenSquare, Lightbulb,
  Cloud, Mail, Briefcase, Layers, LifeBuoy, GitBranch, Hash as HashIcon,
  Pin, PinOff,
} from '@/components/icons/fluent'
import { asset } from '@/utils/asset'
// Official Microsoft Teams (Fluent) icons — ported from the real Teams shell.
import {
  ChatRegular, PeopleTeamRegular, VideoCameraSmallRegular, BookContactsRegular,
  CalendarRegular, CopilotBrand, AlertRegular, AppsRegular,
  ChevronLeftRegular, ChevronRightRegular, SearchRegular, MoreHorizontalRegular,
} from '@/components/icons/teams'
import { TeamsComplianceReport } from '@/components/demo/TeamsComplianceReport.tsx'

// ─── Sound engine ─────────────────────────────────────────────────────────────
// UI sounds disabled — all SFX are no-ops so the demo stays silent everywhere.
const SFX = {
  tap:      () => {},
  done:     () => {},
  open:     () => {},
  close:    () => {},
  alert:    () => {},
  whisper:  () => {},
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
    // Backgrounds — Fluent colorNeutralBackground scale
    appBg:       '#F5F5F5',   // colorNeutralBackground3
    surface:     '#FFFFFF',   // colorNeutralBackground1
    surfaceMid:  '#FAFAFA',   // colorNeutralBackground2
    surfaceBlur: '#FFFFFF',   // flat — no blur surfaces
    rail:        '#E5EDF3',   // Teams chrome neutral blue-gray
    topBar:      '#E5EDF3',   // Teams chrome neutral blue-gray
    // Brand — Fluent brand purple
    core:        '#5C2E91',
    coreText:    '#FFFFFF',   // readable text on a `core`-filled surface (buttons)
    coreMid:     '#7C4EAE',
    coreSoft:    'rgba(92,46,145,0.08)',
    coreGlow:    'rgba(92,46,145,0.18)',
    coreGrad:    'linear-gradient(135deg,#5C2E91,#7C4EAE)',
    coreBright:  '#9B6EC8',
    // Semantic — Fluent status colors
    teal:        '#0E7A7A',   tealSoft:  'rgba(14,122,122,0.1)',
    blue:        '#0F6CBD',   blueSoft:  'rgba(15,108,189,0.1)',   // colorStatusInfo
    amber:       '#835B00',   amberSoft: 'rgba(131,91,0,0.1)',     // colorStatusWarning
    red:         '#BC2F32',   redSoft:   'rgba(188,47,50,0.08)',   // colorStatusDanger
    green:       '#107C41',   greenSoft: 'rgba(16,124,65,0.1)',    // colorStatusSuccess
    // Text — Fluent colorNeutralForeground scale
    text:        '#242424',   // colorNeutralForeground1
    textMid:     '#424242',   // colorNeutralForeground2
    textSoft:    '#616161',   // colorNeutralForeground3
    textXsoft:   '#707070',   // colorNeutralForeground4
    // Borders — Fluent colorNeutralStroke (solid)
    border:      '#D1D1D1',   // colorNeutralStroke1
    borderMid:   '#C7C7C7',   // colorNeutralStroke2
    // Shadows — Fluent two-layer elevation formula
    shadowSm:    '0 0.3px 0.9px 0 rgba(0,0,0,0.07), 0 1.6px 3.6px 0 rgba(0,0,0,0.11)',   // Fluent shadow-4 (Teams card)
    shadowMd:    '0 0.3px 0.9px 0 rgba(0,0,0,0.10), 0 3.2px 7.2px 0 rgba(0,0,0,0.13)',   // Fluent shadow-8 (Teams card hover)
    shadowPurple:'0 2px 8px rgba(92,46,145,0.10), 0 1px 2px rgba(92,46,145,0.06)',
    font: '"Segoe UI Variable", "Segoe UI", system-ui, -apple-system, sans-serif',
  },
  dark: {
    // Backgrounds — Fluent dark colorNeutralBackground scale
    appBg:       '#1F1F1F',   // colorNeutralBackground4 dark
    surface:     '#292929',   // colorNeutralBackground1 dark
    surfaceMid:  '#252525',   // colorNeutralBackground2 dark
    surfaceBlur: '#292929',
    rail:        '#252525',
    topBar:      '#292929',
    // Brand — lighter for dark backgrounds
    core:        '#9B6EC8',
    coreText:    '#FFFFFF',
    coreMid:     '#B38FD6',
    coreSoft:    'rgba(155,110,200,0.12)',
    coreGlow:    'rgba(155,110,200,0.25)',
    coreGrad:    'linear-gradient(135deg,#7C4EAE,#9B6EC8)',
    coreBright:  '#C4A0E2',
    teal:        '#2DC9C9',   tealSoft:  'rgba(45,201,201,0.12)',
    blue:        '#479EF5',   blueSoft:  'rgba(71,158,245,0.1)',
    amber:       '#FFC83D',   amberSoft: 'rgba(255,200,61,0.1)',
    red:         '#F87171',   redSoft:   'rgba(248,113,113,0.1)',
    green:       '#54B263',   greenSoft: 'rgba(84,178,99,0.12)',
    // Text — Fluent dark foreground scale
    text:        '#FFFFFF',
    textMid:     'rgba(255,255,255,0.78)',
    textSoft:    'rgba(255,255,255,0.5)',
    textXsoft:   'rgba(255,255,255,0.36)',
    // Borders — softened for dark mode (reduce visual line weight)
    border:      '#3A3A3A',
    borderMid:   '#454545',
    // Shadows — keep subtle to avoid stacked heavy edges
    shadowSm:    '0 1px 2px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.10)',
    shadowMd:    '0 2px 6px rgba(0,0,0,0.16), 0 1px 2px rgba(0,0,0,0.12)',
    shadowPurple:'0 2px 8px rgba(155,110,200,0.18), 0 1px 2px rgba(155,110,200,0.14)',
    font: '"Segoe UI Variable", "Segoe UI", system-ui, -apple-system, sans-serif',
  },
  // High Contrast — mirrors the Teams/Windows HC dark theme: pure-black
  // surfaces, white text + borders, yellow accent and cyan for secondary
  // status. Surfaces rely on borders (not fills/shadows) to separate, per HC
  // guidance.
  contrast: {
    appBg:       '#000000',
    surface:     '#000000',
    surfaceMid:  '#000000',
    surfaceBlur: '#000000',
    rail:        '#000000',
    topBar:      '#000000',
    core:        '#FFFF00',
    coreText:    '#000000',   // black text on the yellow accent (buttons)
    coreMid:     '#FFE600',
    coreSoft:    'rgba(255,255,0,0.15)',
    coreGlow:    'rgba(255,255,0,0.25)',
    coreGrad:    'linear-gradient(135deg,#FFFF00,#FFE600)',
    coreBright:  '#FFFF66',
    teal:        '#1AEBFF',   tealSoft:  'rgba(26,235,255,0.15)',
    blue:        '#1AEBFF',   blueSoft:  'rgba(26,235,255,0.15)',
    amber:       '#FFFF00',   amberSoft: 'rgba(255,255,0,0.15)',
    red:         '#FF6B6B',   redSoft:   'rgba(255,107,107,0.18)',
    green:       '#3FF23F',   greenSoft: 'rgba(63,242,63,0.15)',
    text:        '#FFFFFF',
    textMid:     '#FFFFFF',
    textSoft:    '#FFFFFF',
    textXsoft:   '#FFFFFF',
    border:      '#FFFFFF',
    borderMid:   '#FFFFFF',
    shadowSm:    'none',
    shadowMd:    'none',
    shadowPurple:'none',
    font: '"Segoe UI Variable", "Segoe UI", system-ui, -apple-system, sans-serif',
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
@import url('https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;600;700&display=swap');
@keyframes breathe    { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }
@keyframes think      { 0%,100%{opacity:.5;transform:scale(.95)} 50%{opacity:1;transform:scale(1.08)} }
@keyframes ripple     { 0%{transform:scale(.8);opacity:.7} 100%{transform:scale(2.4);opacity:0} }
@keyframes slideUp    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideRight { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
@keyframes fadeIn     { from{opacity:0} to{opacity:1} }
@keyframes doneSlide  { to{opacity:0;transform:translateX(-24px) scale(.97)} }
@keyframes softPop    { 0%{transform:scale(.95);opacity:0} 60%{transform:scale(1.01)} 100%{transform:scale(1);opacity:1} }
@keyframes spin       { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes shimmer    { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
@keyframes expandDown { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
.expand-down { animation: expandDown 150ms cubic-bezier(.33,0,.67,1) both; }
[data-clickable] * { cursor: pointer; }
.enter    { animation: slideUp  200ms cubic-bezier(.33,0,.67,1) both; }
.enter-r  { animation: slideRight 200ms cubic-bezier(.33,0,.67,1) both; }
.pop      { animation: softPop 150ms cubic-bezier(.33,0,.67,1) both; }
.done     { animation: doneSlide 200ms ease-out both; }
.fade     { animation: fadeIn 150ms ease both; }
* { box-sizing: border-box; margin: 0; padding: 0; }
button { font-family: inherit; }
input, textarea, select { font-family: inherit; }
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.25); border-radius: 2px; }
::selection { background: rgba(92,46,145,0.15); }
.card-action-tip:hover .tip-label { opacity: 1; }
.conv-row:hover .conv-pin { opacity: 1; }
.j-msg .j-feedback { opacity: 0; transition: opacity .15s; }
.j-msg:hover .j-feedback,
.j-feedback:focus-within { opacity: 1; }
@media (prefers-reduced-motion: reduce) {
  *, .enter, .enter-r, .pop, .done, .fade, .expand-down {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
`


// ─── Static data ──────────────────────────────────────────────────────────────
// Intents aligned with JTBDs in docs/Employee Personal AI Assistant Draft.md:
// Start-day brief · Routine admin · Proactive help · Life events · HR+IT joined · Meeting prep
const INTENTS = [
  { id:'hero', tier:'L3', cat:'Most important right now', isHero:true,
    headline:'Your parental leave plan needs sign-off before Friday',
    why:'You booked leave for Jun 2 – Sep 1. I drafted the full handoff plan across HR, IT, and your manager — backfill request, benefits update, calendar holds, and access handover. One sign-off triggers the sequence.',
    action:'Review leave handoff plan',
    source:'Workday · Life event',
    evidence:'Leave starts Jun 2 · Backfill lead time 3 weeks',
    chatScenario:'leave' },
  { id:'resch', tier:'L3', cat:'Just landed · needs you now',
    headline:'Marc made the 2 PM product review mandatory — clears with 1 tap',
    why:'Marc (SVP) outranks everything on your afternoon. I worked out the reshuffle and drafted every message — 4 on Teams, 3 emails. One approval sends them all and clears your 2 PM.',
    action:'Review the reshuffle', source:'Teams + Outlook · 11:40 AM',
    evidence:'Sender outranks 3 conflicting meetings · 7 messages drafted',
    chatScenario:'reschedule' },
  { id:'y1', tier:'L2', cat:'Yesterday',
    headline:'PTO request pending with your manager — 3 days',
    why:'Submitted Apr 29 for May 14–16. Manager SLA is 2 business days. I can draft a light nudge on your behalf.',
    action:'Nudge manager', source:'Workday · PTO',
    evidence:'Manager SLA +1 day · No calendar conflicts detected', chatScenario:null },
  { id:'y2', tier:'L1', cat:'Yesterday',
    headline:'Annual compliance training expires in 3 days',
    why:'Security + data-handling refresher incomplete. Deadline May 9. ~45 min to complete.',
    action:'Open LMS portal', source:'Workday · Compliance',
    evidence:'Deadline May 9 · ~45 min to complete', chatScenario:null },
  { id:'f1', tier:'L3', cat:'Follow-up needed',
    headline:'Benefits enrolment window closes Thursday',
    why:'Open enrolment ends May 8. Your dependents coverage still reflects last year — I can pre-fill based on your earlier selections.',
    action:'Review benefits selections', source:'Workday · Benefits',
    evidence:'Closes May 8 EOD · 2 dependents affected', chatScenario:null },
  { id:'f2', tier:'L1', cat:'Follow-up needed',
    headline:'Emergency contact on file is outdated',
    why:'Last updated Oct 2023. HR flagged it during the annual audit. One-field update.',
    action:'Update contact', source:'Workday · Profile',
    evidence:'Last updated Oct 2023 · Single-field edit', chatScenario:null },
  { id:'c1', tier:'L1', cat:'Follow-up needed',
    headline:'Asset attestation + GIS security survey due in 4 days',
    why:'GIS sent the annual asset attestation and security survey. I cross-checked the asset register — both devices assigned to you are still active, so attestation is one tap. The survey is ~8 min. Non-completion locks VPN access.',
    action:'Review & confirm assets', source:'ServiceNow · GIS',
    evidence:'Deadline May 12 · 2 assets to attest · ~8 min', chatScenario:null },
  { id:'e1', tier:'L2', cat:'In 90 minutes',
    headline:'QBR with SVP — prep bundle ready',
    why:'Deck found, 3 open actions surfaced, SVP context compiled.',
    action:'Open prep bundle', source:'Outlook · 10:00 AM', prepReady:true,
    evidence:'SVP meeting at 10 AM · 3 open actions from Apr 14', chatScenario:'prep' },
  { id:'e2', tier:'L4', cat:'Today 2:00 PM',
    headline:'Expense policy exception needs your sign-off',
    why:'$4,200 travel reimbursement is over your single-approver limit. Finance needs your explicit confirmation before it routes to the VP.',
    action:'Review & arm', source:'Workday · Expense',
    evidence:'Gate at 2 PM · Over-limit by $1,200', chatScenario:null },
  { id:'p2', tier:'L2', cat:'Pending with you',
    headline:'Laptop refresh ticket stuck in IT — day 10',
    why:'Asset request filed Apr 26. IT service SLA is 5 days; currently at 10. I can draft a follow-up.',
    action:'Chase IT', source:'ServiceNow · RITM0038912',
    evidence:'IT SLA +5 days · Finance already approved', chatScenario:null },
]

const MANAGER_INTENTS = [
  { id:'mh', tier:'L3', cat:'Team risk', isHero:true,
    headline:'Liam Davis showing burnout signals — act this week',
    why:'55+ hour weeks for 3 sprints. Sentiment markers up 20%. Friday gap available, coverage identified.',
    action:'Review & authorise Wellness Day', source:'Jira + Slack (aggregated)',
    evidence:'Liam at 57h/wk vs 38h team avg · Friday coverage ready', chatScenario:'burnout' },
  { id:'m1', tier:'L2', cat:'Approval digest',
    headline:'3 routine approvals ready to batch-confirm',
    why:'Expense $340, PTO (no conflicts), laptop — all within policy.',
    action:'Batch approve', source:'Workday · Queue',
    evidence:'All 3 within policy · Salary +11% flagged separately', chatScenario:'approvals' },
  { id:'m4', tier:'L2', cat:'Onboarding',
    headline:'New hire Priya starts Monday — plan 62% ready',
    why:'Laptop ordered, accounts provisioned, orientation booked. Missing: 1:1 schedule and team intro post.',
    action:'Complete onboarding plan', source:'Workday + ServiceNow',
    evidence:'Start date May 11 · 2 gaps remaining', chatScenario:null },
  { id:'m2', tier:'L2', cat:'Team readiness',
    headline:'React 19 gap causing 15% velocity drop',
    why:'4 engineers identified. Masterclass Friday 2–4 PM, no calendar conflicts.',
    action:'Enrol 4 engineers', source:'GitHub + Workday',
    evidence:'Velocity 3.2d vs 1.8 expected · Masterclass Fri 2 PM, no conflicts', chatScenario:null },
  { id:'m3', tier:'L3', cat:'Hiring decision',
    headline:'Senior DevOps — 3 finalists, decision needed',
    why:'Candidate A scored 94/100. Panels aligned, budget confirmed, offer draft ready.',
    action:'Select & approve offer', source:'Lever ATS',
    evidence:'Candidate A top-scored 94/100 · Offer draft + $12k relocation ready', chatScenario:null },
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
  { id:'fd0', time:'11:41', status:'done', emoji:'🗓️', title:'Cleared your afternoon for Marc\'s review',
    body:'Marc (SVP) made the 2 PM mandatory. Ranked the sender, reshuffled 3 conflicts, and sent 7 messages in your name — after your approval.',
    steps:['Ranked sender: SVP, outranks the afternoon','Drafted 4 Teams messages + 3 emails','You approved all in one tap','Sent ✓ · 1:1 moved to 4 PM, Acme rescheduled, calendar cleared, Salesforce case noted'] },
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
  incident:[{
    role:'j',
    text:"🔴 **P1: Auth Service Down — INC-9942**\n\nEU-West-1 returning 503s on /v1/auth. Detected 4 min ago. 3 enterprise customers impacted. Incident owner: unassigned.\n\n**On-call identified:** Raj Mehta — available now.",
    trace:{
      summary:'Detected anomaly across 2 services and identified on-call',
      steps:[
        { label:'Detected 503 spike on /v1/auth in EU-West-1', plugin:'DatadogPlugin',
          bullets:['Error rate: 94%','Latency P99: 12s','First alert: 4 min ago'] },
        { label:'Identified 3 impacted enterprise accounts', plugin:'SalesforcePlugin',
          bullets:['Acme Corp','CloudMetrics','TechBridge (SLA active)'] },
        { label:'Located on-call engineer: Raj Mehta', plugin:'WorkdayPlugin',
          bullets:['Status: Available','Last incident response: 14 days ago'] },
      ]
    },
    actions:[
      { label:'Assign Raj as owner in Salesforce', key:'A' },
      { label:'Send Raj a Teams message with full context', key:'B' },
      { label:'Open a war room channel', key:'C' },
    ]
  }],
  prep:[{
    role:'j',
    text:"**QBR prep bundle — ready for 10:00 AM**\n\n📄 **Deck:** QBR-H2-2026.pptx (Priya edited yesterday)\n📋 **3 open actions** from Apr 14 — none closed\n💬 **SVP context:** Last discussion was budget; she flagged the 18% incident improvement\n\n**Suggested opening:** Lead with the incident metric — it's her stated priority.\n\nShall I draft a 3-point opener?",
    trace:{
      summary:'Compiled 4 sources and surfaced 3 open actions',
      steps:[
        { label:'Located QBR deck in SharePoint', plugin:'SharePointPlugin',
          bullets:['QBR-H2-2026.pptx','Last edited yesterday by Priya Nair'] },
        { label:'Surfaced Apr 14 meeting notes', plugin:'OutlookPlugin',
          bullets:['3 open actions — none closed','Budget discussion flagged by SVP'] },
        { label:'Retrieved SVP briefing history', plugin:'SalesforcePlugin',
          bullets:['18% incident improvement noted','Budget: primary concern last quarter'] },
      ]
    },
  }],
  burnout:[{
    role:'j',
    text:"**Capacity warning: Liam Davis**\n\n55–61 hour weeks over 3 sprints (team avg: 38h). Slack sentiment shows +20% fatigue markers — aggregated only, no raw DMs were read.\n\n**Already prepared:** Sloane as Friday backup · Draft wellness check-in message\n\nI need your confirmation before any action.",
    trace:{
      summary:'Analysed 3 sprints of data and flagged 1 risk',
      steps:[
        { label:'Pulled Jira sprint hours for Liam Davis', plugin:'JiraPlugin',
          bullets:['Sprint 22: 58h · Sprint 23: 61h · Sprint 24: 55h','Team average: 38h/wk'] },
        { label:'Checked Slack sentiment (aggregated only)', plugin:'SlackPlugin',
          bullets:['+20% fatigue markers vs baseline','No raw DMs accessed'] },
        { label:'Identified coverage option: Sloane', plugin:'WorkdayPlugin',
          bullets:['No conflicts Friday','Familiar with Liam\'s current tasks'] },
      ]
    },
    actions:[
      { label:'Authorise Wellness Day + confirm Sloane', key:'A' },
      { label:'Review draft message to Liam first', key:'B' },
      { label:'Flag for 1:1 agenda instead', key:'C' },
    ]
  }],
  diskspace:[{
    role:'j',
    text:"**Proactive: Low disk space on prod-db-02**\n\n3 volumes below 15% threshold. No ticket filed yet. At current write rate, this will breach the P1 threshold in approximately 6 hours.",
    trace:{
      summary:'Detected anomaly across 3 volumes and estimated impact window',
      steps:[
        { label:'Polled prod-db-02 volume metrics', plugin:'DatadogPlugin',
          bullets:['/var: 8% free','/data: 11% free','/logs: 14% free'] },
        { label:'Estimated time to P1 threshold (< 5%)', plugin:'DatadogPlugin',
          bullets:['~6h at current write rate','Write spike expected at 2 PM deploy'] },
        { label:'Checked for existing tickets', plugin:'JiraPlugin',
          bullets:['No open incident found','Last disk cleanup: 43 days ago'] },
      ]
    },
    actions:[
      { label:'Create P2 ticket and assign Raj', key:'A' },
      { label:'Trigger log rotation script now', key:'B' },
      { label:'Send alert to #platform-eng', key:'C' },
    ]
  }],
  approvals:[{
    role:'j',
    text:"**3 purchase requisitions are pending your approval** — all within policy, totalling $2,840.",
    trace:{
      summary:'Policy-checked 3 requisitions against budget and approval limits',
      steps:[
        { label:'Fetched open requisitions from Workday', plugin:'WorkdayPlugin',
          bullets:['3 items submitted by Sam K., Dev P., Priya N.','All within 5-day SLA'] },
        { label:'Validated each against expense policy', plugin:'WorkdayPlugin',
          bullets:['All 3 within single-approver limit ($5k)','No duplicate submissions'] },
        { label:'Checked Q2 cost centre budget remaining', plugin:'FinancePlugin',
          bullets:['$34k remaining — all 3 clear','No flags raised'] },
      ]
    },
    table:{
      headers:['Submitter','Item','Amount','Status'],
      rows:[
        ['Sam K.','AWS credits top-up','$1,200','Policy ✓'],
        ['Dev P.','Figma annual licence','$840','Policy ✓'],
        ['Priya N.','Masterclass team seats','$800','Policy ✓'],
      ]
    },
    actions:[
      { label:'Approve all 3', key:'approve_all', tier:'L4' },
      { label:'Review individually', key:'review', tier:'L2' },
      { label:'Reject all', key:'reject', tier:'L4' },
    ]
  }],
  // Parental-leave orchestration — spans Workday + Outlook + ServiceNow + Slack.
  // Actions are deliberately tiered (L1 autonomous, L2 review, L4 gated).
  leave:[{
    role:'j',
    text:"**Parental-leave plan — Jun 2 to Sep 1**\n\nI pulled the handoff picture across HR, Calendar, IT, and your team.\n\n**What's ready:** PTO draft in Workday · OOO template · IT access handover · draft note to Priya · proposed backup approver.\n\nI need one decision from you per track. Pick what Jarvis handles autonomously vs. what you want to review.",
    trace:{
      summary:'Orchestrated 4 systems to prepare a leave handoff',
      steps:[
        { label:'Read Parental leave policy v3 from SharePoint', plugin:'WorkdayPlugin',
          bullets:['Policy allows 12 weeks paid (Jun 2 – Aug 25)','Additional 1 week unpaid to Sep 1 within policy','Notify window: 30 days before start date'] },
        { label:'Composed OOO auto-reply and booked calendar block', plugin:'OutlookPlugin',
          bullets:['Block: Jun 2 00:00 – Sep 1 23:59','Auto-reply: "I\'m on leave until Sep 1 — Priya Nair is covering"','Delegated calendar to Priya (view only, accept on your behalf off)'] },
        { label:'Prepared IT access handover ticket', plugin:'ServiceNowPlugin',
          bullets:['Draft RITM-0043001: suspend non-shared tokens','Keep shared inboxes active','Template based on Backfill request template v2'] },
        { label:'Drafted handover note and backup approver proposal', plugin:'SlackPlugin',
          bullets:['Warm tone note to Priya · 3 short sections','Backup approver candidate: Liam (based on overlap + seniority)','Sentiment signal: team has capacity Jun-Aug'] },
      ]
    },
    actions:[
      { label:'File PTO Jun 2 – Sep 1 in Workday',      key:'leave_pto',    tier:'L1' },
      { label:'Block calendar with OOO + auto-reply',   key:'leave_ooo',    tier:'L1' },
      { label:'Draft handover note to Priya',            key:'leave_note',   tier:'L2' },
      { label:'Nominate Liam as backup approver',        key:'leave_backup', tier:'L4' },
    ],
  }],
  // Killer use case — the "ideal EA". A higher-ranking person (Marc, SVP) drops a
  // mandatory meeting that collides with the afternoon. Jarvis ranks the sender,
  // works out the reshuffle, and drafts every message across Teams + email — then
  // hands the user ONE batch-approval card. One tap clears the calendar.
  // Embodies Alex's brief: don't add to the noise, always merit the time, taste + tact.
  reschedule:[{
    role:'j',
    text:"**Marc made the 2 PM product review mandatory.** It collides with 3 things on your calendar.\n\nHere's the fix I worked out to clear 2–3 PM:\n• Move your **1:1 with Sarah** to 4 PM\n• Step out of **sprint sync** — Priya will send notes\n• **Reschedule the Acme check-in** to tomorrow\n\nTo make it happen I'm ready to send **4 Teams messages and 3 emails**, clear your 2 PM, and add a note to the Salesforce case. Take a look — edit anything, then approve all at once.",
    trace:{
      summary:'Read 1 invite, ranked the sender, found 3 conflicts',
      steps:[
        { label:'Read Marc\'s invite + Teams message', plugin:'OutlookPlugin',
          bullets:['"Mandatory product review" · today 2:00–3:00 PM','Keyword match: "mandatory"','From: Marc T. (SVP, Product)'] },
        { label:'Checked sender rank against your org', plugin:'WorkdayPlugin',
          bullets:['Marc = SVP · 2 levels above you','Outranks every meeting on your afternoon'] },
        { label:'Found 3 calendar conflicts, 2–3 PM', plugin:'OutlookPlugin',
          bullets:['1:1 with Sarah — your report, movable','Sprint sync — Priya will send notes','Acme check-in — external, needs a reschedule note'] },
      ]
    },
    table:{
      headers:['To','Channel','Purpose','Status'],
      rows:[
        ['Sarah','Teams','Move 1:1 to 4 PM','Ready'],
        ['Sprint team','Teams','You\'ll miss sync — Priya to send notes','Ready'],
        ['Priya','Teams','Heads-up + request meeting notes','Ready'],
        ['#product-platform','Teams','FYI — offline 2–3 PM','Ready'],
        ['Acme (vendor)','Email','Decline check-in — two new slots offered','Ready'],
        ['Marc\'s attendees','Email','Confirm you\'ll attend at 2 PM','Ready'],
        ['Finance','Email','Expense sign-off lands by EOD','Ready'],
        ['Your calendar','Outlook','Clear & hold 2–3 PM for Marc','Ready'],
        ['Salesforce case','Salesforce','Add note: review bridge scheduled','Ready'],
      ]
    },
    actions:[
      { label:'Approve all & send', key:'reschedule_send', tier:'L4' },
      { label:'Review each message', key:'reschedule_review', tier:'L1' },
      { label:'Don\'t reschedule', key:'reschedule_cancel', tier:'L1' },
    ],
  }],
}

const BEHAVIOURS = [
  {id:'b1',name:'Daily Morning Brief',desc:'Ranked brief at 9 AM.',schedule:'Weekdays · 9:00 AM',enabled:true},
  {id:'b2',name:'Meeting Prep',desc:'Notes 30 min before each meeting.',schedule:'Every day · 30 min before',enabled:true},
  {id:'b3',name:'Document Intelligence',desc:'Find and summarise docs on demand.',schedule:'On demand',enabled:true},
  {id:'b4',name:'Email Management',desc:'Triage and draft replies.',schedule:'Weekdays · 5:00 PM',enabled:false},
]

// Connections — vendor logos live in /web/public/logos/. Fall back to a Lucide
// glyph for vendors we don't have a real logo file for (OneDrive/SharePoint).
const CONNECTIONS = [
  { id:'c1', name:'Microsoft Teams',       img:'/teams-logo.svg',         connected:true,  logo:'🟣' },
  { id:'c2', name:'Outlook Calendar',      img:'/logos/Outlook.png',      connected:true,  logo:'🔵' },
  { id:'c3', name:'OneDrive / SharePoint', Icon:Cloud, iconColor:'#0078D4', connected:true,  logo:'🔷' },
  { id:'c4', name:'Workday',               img:'/logos/Workday.png',      connected:true,  logo:'🟠' },
  { id:'c5', name:'Salesforce',            img:'/logos/Salesforce.webp',  connected:false, logo:'☁️' },
  { id:'c6', name:'Jira',                  img:'/logos/Jira.png',         connected:false, logo:'🔹' },
]

// Render helper — shows the real logo image if we have one, otherwise the
// fallback Lucide icon. `size` is the box edge in px.
function ConnectionLogo({ conn, size = 32 }) {
  if (conn.img) {
    return (
      <img src={conn.img} alt={conn.name}
        style={{ width:size, height:size, objectFit:'contain', display:'block' }} />
    )
  }
  if (conn.Icon) {
    const Icon = conn.Icon
    return <Icon size={Math.round(size * 0.7)} color={conn.iconColor || '#6B7280'} />
  }
  return <span style={{ fontSize:size * 0.85 }}>{conn.logo}</span>
}

// ─── Setup / Permissions model ───────────────────────────────────────────────
// Extended system catalog used in Setup Step 1 (Watch). Each entry maps to a
// "what it lets Jarvis see" sentence and is the source for the USE_CASE → system
// pre-toggle mapping.
const SETUP_SYSTEMS = [
  { id:'outlook',     name:'Outlook',              desc:'See email subjects, flags, and calendar metadata.' },
  { id:'calendar',    name:'Calendar',             desc:'Read your meetings, free/busy, and prep windows.' },
  { id:'onedrive',    name:'OneDrive / SharePoint',desc:'Find docs you own, no body reads without you asking.' },
  { id:'workday',     name:'Workday',              desc:'See PTO, benefits, compliance, profile data.' },
  { id:'salesforce',  name:'Salesforce',           desc:'Read cases, accounts, approvals assigned to you.' },
  { id:'jira',        name:'Jira',                 desc:'See tickets, sprint status, and velocity trends.' },
  { id:'slack',       name:'Slack',                desc:'Aggregated sentiment signals only — never raw DMs.' },
  { id:'servicenow',  name:'ServiceNow',           desc:'Track IT + HR service tickets you opened.' },
]

// L1 actions shown in Setup Step 2 ("Act — write without asking").
const L1_ACTIONS = [
  { id:'setReminders',  label:'Set reminders.' },
  { id:'draftReplies',  label:'Draft replies in your voice (you Send).' },
  { id:'bookFocus',     label:'Book focus blocks on free time.' },
  { id:'fileRoutinePto',label:'File routine PTO if there are no calendar conflicts.' },
  { id:'updateProfile', label:'Update profile fields (emergency contact, address).' },
  { id:'ackNonPolicy',  label:'Acknowledge non-policy notifications.' },
]

// L4 actions shown in Setup Step 3 ("Gate — always ask first").
const L4_ACTIONS = [
  { id:'sendExternal',   label:'Send to external customers.' },
  { id:'expenseLarge',   label:'Expense or purchase requests over $1,000.' },
  { id:'changeManager',  label:'Change manager / direct reports.' },
  { id:'changeBenefits', label:'Change benefits or compensation.' },
  { id:'prodDeploy',     label:'Production deploy gates.' },
  { id:'hireFire',       label:'Hire / promote / terminate.' },
]

// Use cases presented in welcome + Setup Step 0. Same 4 cards.
const USE_CASES = [
  { id:'legal',     emoji:'⚖️', tag:'Legal & Compliance', color:'#835B00',
    title:'DPA stuck? SLA breached?',
    body:"Jarvis detects when a review is overdue, identifies who's OOO, finds the backup, and drafts the escalation.",
    chips:['SalesforcePlugin','WorkdayPlugin','OutlookPlugin'],
    systems:['salesforce','workday','outlook'] },
  { id:'meetings',  emoji:'📊', tag:'Meetings & Prep', color:'#0F6CBD',
    title:'Walk into every meeting ready.',
    body:'Jarvis assembles the deck, surfaces open actions from last time, writes a 3-point opener.',
    chips:['OutlookPlugin','SharePointPlugin','SalesforcePlugin'],
    systems:['outlook','calendar','onedrive'] },
  { id:'incidents', emoji:'🚨', tag:'Incidents & Ops', color:'#BC2F32',
    title:"P1 fires while you're in a meeting?",
    body:'Jarvis detects it, assigns ownership, and sends the Teams message — under 90 seconds.',
    chips:['DatadogPlugin','SalesforcePlugin','TeamsPlugin'],
    systems:['salesforce','servicenow','jira'] },
  { id:'people',    emoji:'👥', tag:'People & Teams', color:'#107C41',
    title:'Burnout before it becomes a problem.',
    body:'Jarvis spots overwork patterns in Jira, finds coverage, drafts the welfare check-in.',
    chips:['JiraPlugin','SlackPlugin','WorkdayPlugin'],
    systems:['jira','slack','workday'] },
]

// Capabilities shown in the "What I can do" drawer. Keyed by USE_CASES id.
// Each row: { system, tier, action, example }
const CAPABILITIES = {
  legal: [
    { system:'Workday',     tier:'L1', action:'Track compliance training due dates',                example:'Annual security training due in 3 days — reminded you.' },
    { system:'Workday',     tier:'L1', action:'Surface policy updates that affect you',             example:'Parental-leave policy v3 published — flagged in your brief.' },
    { system:'Outlook',     tier:'L2', action:'Draft a question to Legal for review',               example:'Draft ready — you click Send.' },
    { system:'Workday',     tier:'L3', action:'Propose how to handle a compliance gap',             example:'Shows your options, you decide.' },
    { system:'Workday',     tier:'L4', action:'File a formal compliance attestation',               example:'Requires your explicit confirmation.' },
  ],
  meetings: [
    { system:'Outlook',     tier:'L1', action:'Assemble prep bundle 30 min before each meeting',    example:'QBR deck, notes, SVP context — ready at 9:30.' },
    { system:'SharePoint',  tier:'L1', action:'Surface related docs shared in the past 30 days',    example:'QBR-H2-2026.pptx · edited yesterday by Priya.' },
    { system:'Outlook',     tier:'L1', action:'Book focus blocks in free calendar windows',         example:'Blocked 2-hour focus after your QBR.' },
    { system:'Outlook',     tier:'L2', action:'Draft a meeting follow-up email for your review',    example:'Summary + 3 action items — you click Send.' },
    { system:'Outlook',     tier:'L3', action:'Propose rescheduling conflicts within preferences',  example:'Moves a 1:1, asks before it hits the invite.' },
  ],
  incidents: [
    { system:'Salesforce',  tier:'L1', action:'Detect P1/P2 incidents across owned services',       example:'INC-9942 Auth 503 spike — caught in 4 min.' },
    { system:'Workday',     tier:'L1', action:'Identify current on-call engineer',                  example:'Raj Mehta — available, last responded 14 days ago.' },
    { system:'Salesforce',  tier:'L2', action:'Draft Teams message to on-call with incident context',example:'Preview before sending — keeps you in the loop.' },
    { system:'Salesforce',  tier:'L3', action:'Open a war-room channel + invite stakeholders',      example:'Proposes members, you confirm.' },
    { system:'Salesforce',  tier:'L4', action:'Assign incident owner officially in Salesforce',     example:'Explicit "Run" required — audited.' },
  ],
  people: [
    { system:'Jira',        tier:'L1', action:'Track sprint hours and velocity per engineer',       example:'Liam at 57h/wk vs 38h team avg for 3 sprints.' },
    { system:'Slack',       tier:'L1', action:'Aggregate sentiment markers (never raw DMs)',        example:'+20% fatigue markers vs baseline — flagged.' },
    { system:'Workday',     tier:'L2', action:'Draft a wellness check-in message for your review',  example:'Warm tone, 3 sentences — you edit then Send.' },
    { system:'Workday',     tier:'L3', action:'Propose coverage from your team',                    example:'Sloane · no Friday conflicts — you confirm.' },
    { system:'Workday',     tier:'L4', action:'Authorise a Wellness Day on behalf of your report',  example:'Requires "I confirm" before anything moves.' },
  ],
}

// Default Setup preferences — used when the user picks "Use defaults · skip".
const DEFAULT_PREFS = {
  version: 1,
  useCases: [],
  systems: { outlook:true, calendar:true, onedrive:true, workday:false, salesforce:false, jira:false, slack:false, servicenow:false },
  l1: { setReminders:true, draftReplies:true, bookFocus:true, fileRoutinePto:true, updateProfile:true, ackNonPolicy:true },
  l4: { sendExternal:true, expenseLarge:true, changeManager:true, changeBenefits:true, prodDeploy:true, hireFire:true },
  notify: { p1:true, deadlines:true, approvals:true, teamRisk:true, weekly:true, channel:'teams' },
  quiet: { start:'19:00', end:'08:00', weekend:true },
}

const PREFS_KEY = 'jarvis.prefs.v1'
function loadPrefs() {
  try { const raw = localStorage.getItem(PREFS_KEY); if (!raw) return null; const p = JSON.parse(raw); return p && p.version === 1 ? p : null } catch { return null }
}
function savePrefs(p) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)) } catch {}
}

// ─── Conversations (Chat tab data) ───────────────────────────────────────────
const CONVERSATION_CATEGORIES = ['All', 'Decisions', 'Follow-ups', 'Incidents', 'Meetings', 'Analysis']

const CONVERSATIONS = [
  // ── Hero on Today: parental-leave plan ───────────────────────────────────
  { id:'cv1', title:'Parental-leave plan — Jun 2 to Sep 1',
    preview:"I drafted the full handoff across Workday, Outlook, IT, and your team.",
    time:'09:14', date:'Today', category:'Decisions', unread:1,
    messages:[
      { role:'j',
        text:"I drafted the full handoff for **Jun 2 to Sep 1** across HR, Calendar, IT, and your team. Pick what I should handle on my own and what you'd like to review first.",
        trace:{
          summary:'Orchestrated 4 systems to prepare a leave handoff',
          steps:[
            { label:'Read Parental leave policy v3', bullets:['Allows 12 weeks paid (Jun 2 – Aug 25)','+1 week unpaid to Sep 1 within policy','30-day notice window — within range'] },
            { label:'Composed OOO and blocked the calendar', bullets:['Block Jun 2 00:00 → Sep 1 23:59','Auto-reply: "On leave until Sep 1 — Priya covering"','Calendar delegated to Priya (view only)'] },
            { label:'Prepared IT access handover', bullets:['Draft RITM-0043001: suspend non-shared tokens','Shared inboxes stay active'] },
            { label:'Drafted handover note for Priya', bullets:['Warm tone, 3 short sections','Backup approver: Liam (overlap + seniority)'] },
          ]
        },
        actions:[
          { label:'File PTO Jun 2 – Sep 1 in Workday',    key:'leave_pto',    tier:'L1' },
          { label:'Block calendar with OOO + auto-reply', key:'leave_ooo',    tier:'L1' },
          { label:'Draft handover note to Priya',          key:'leave_note',   tier:'L2' },
          { label:'Nominate Liam as backup approver',      key:'leave_backup', tier:'L4' },
        ],
      },
    ]},

  // ── PTO nudge ────────────────────────────────────────────────────────────
  { id:'cv2', title:'PTO request — pending with your manager',
    preview:"Submitted Apr 29 for May 14–16. Manager SLA is 2 business days.",
    time:'08:51', date:'Today', category:'Follow-ups', unread:0,
    messages:[
      { role:'j',
        text:"Your PTO request for **May 14–16** has been with Sarah for 3 days. Manager SLA is 2 business days, and there are no calendar conflicts for that week. I can send a light nudge on your behalf.",
        trace:{
          summary:'Checked Workday queue and your manager calendar',
          steps:[
            { label:'Pulled the request from Workday', bullets:['Submitted Apr 29 at 14:02','Status: Pending with Sarah Chen'] },
            { label:'Checked your manager availability', bullets:['No OOO blocks today or yesterday','In-office both days'] },
            { label:'Calendar conflict check on May 14–16', bullets:['No team milestones','No meetings you own'] },
          ],
        },
        actions:[
          { label:'Send a light nudge to Sarah', key:'A' },
          { label:'Wait until tomorrow', key:'B' },
        ],
      },
      { role:'u', text:"Send the nudge" },
      { role:'j', text:"Sent. I kept it short and friendly: *Quick reminder that my May 14–16 PTO is still pending — let me know if anything blocks approval.* I'll let you know when she responds." },
    ]},

  // ── QBR prep (single Outlook source, no Acme) ────────────────────────────
  { id:'cv3', title:'QBR prep — SVP meeting 10:00 AM',
    preview:"Deck, last meeting actions, and SVP context — bundle ready.",
    time:'09:02', date:'Today', category:'Meetings', unread:0,
    messages:[
      { role:'j',
        text:"Your QBR with Sarah is at **10 AM**. The deck is ready, three actions from last time are still open, and Sarah's last priority was reliability. Want me to draft a 3-point opener?",
        trace:{
          summary:'Compiled prep across SharePoint and Outlook',
          steps:[
            { label:'Found the QBR deck in SharePoint', bullets:['QBR-H2-2026.pptx','Last edited yesterday by Priya'] },
            { label:'Pulled Apr 14 meeting notes from Outlook', bullets:['3 actions still open','None reassigned'] },
            { label:'Retrieved Sarah\'s briefing history', bullets:['Reliability flagged twice','+18% incident improvement noted'] },
          ],
        },
        actions:[
          { label:'Draft a 3-point opener', key:'A' },
          { label:'Open the deck', key:'B' },
          { label:'Show open actions only', key:'C' },
        ],
      },
      { role:'u', text:"Draft the opener" },
      { role:'j',
        text:"Here's a 3-point opener — tight, lead with reliability since that's her stated priority:\n\n1. **Reliability** — We hit 99.95% uptime this quarter, a direct outcome of the incident-process changes you asked for in Q1.\n2. **Throughput** — Sprint velocity is back on target after the React 19 ramp; team is averaging 1.9d per ticket vs. 3.2d a sprint ago.\n3. **Ask** — Approve the platform refresh budget so we can keep this momentum into H2." },
    ]},

  // ── Compliance training ──────────────────────────────────────────────────
  { id:'cv4', title:'Compliance training — due in 3 days',
    preview:"45 minutes. I can block calendar time tomorrow morning.",
    time:'08:38', date:'Today', category:'Follow-ups', unread:0,
    messages:[
      { role:'j',
        text:"Your annual security + data-handling refresher is due **May 9**. It's about 45 minutes. Want me to block 9:00 – 9:45 tomorrow on your calendar so it doesn't slip?",
        trace:{
          summary:'Checked Workday compliance and your free time',
          steps:[
            { label:'Pulled compliance status from Workday', bullets:['Module: Security + Data Handling','Last completed: May 2025'] },
            { label:'Found a free slot for tomorrow morning', bullets:['9:00 – 9:45 is open','No standing meetings before 10:00'] },
          ],
        },
        actions:[
          { label:'Block 9:00 – 9:45 tomorrow', key:'A' },
          { label:'Open the training now', key:'B' },
          { label:'Remind me Friday', key:'C' },
        ],
      },
    ]},

  // ── Benefits enrolment ───────────────────────────────────────────────────
  { id:'cv5', title:'Benefits enrolment — closes Thursday',
    preview:"Your dependent coverage hasn't rolled forward. I can pre-fill it.",
    time:'Yesterday', date:'Yesterday', category:'Follow-ups', unread:0,
    messages:[
      { role:'j',
        text:"Open enrolment closes **May 8 EOD**. Your dependent coverage still reflects last year's selections — you have two dependents on file. I can pre-fill this year's plan from those choices and surface only what's changed for you to confirm.",
        trace:{
          summary:'Checked Workday benefits and last year\'s plan',
          steps:[
            { label:'Pulled current benefits from Workday', bullets:['Plan: Premium PPO','Dependents: 2 covered','Renewal flag: not yet selected'] },
            { label:'Compared 2025 plan to 2026 options', bullets:['Premium PPO premium up $14/month','HSA contribution cap higher in 2026'] },
          ],
        },
        actions:[
          { label:'Pre-fill from last year', key:'A' },
          { label:'Walk me through the changes', key:'B' },
        ],
      },
      { role:'u', text:"Pre-fill" },
      { role:'j', text:"Done. Selections are saved as a draft in Workday — nothing is submitted yet. Three things changed: premium up by $14/mo, higher HSA cap, dental network unchanged. Review and submit when you're ready." },
    ]},

  // ── Manager: burnout (matches MANAGER_INTENTS hero) ──────────────────────
  { id:'cv6', title:'Liam Davis — capacity warning',
    preview:"55–61 hour weeks for 3 sprints. Sloane available Friday.",
    time:'Apr 29', date:'Apr 29', category:'Decisions', unread:0,
    messages:[
      { role:'j',
        text:"**Capacity warning on Liam.** Three sprints at 55–61 hours, fatigue markers +20% on aggregated Slack signals. Sloane has no Friday conflicts and is familiar with Liam's open work.",
        trace:{
          summary:'Reviewed 3 sprints of Jira and aggregated Slack signals',
          steps:[
            { label:'Pulled Jira sprint hours for Liam', bullets:['Sprint 22: 58h · 23: 61h · 24: 55h','Team average: 38h'] },
            { label:'Checked aggregated Slack sentiment', bullets:['+20% fatigue markers vs. baseline','No raw DMs accessed'] },
            { label:'Identified Friday coverage', bullets:['Sloane available, no conflicts','Familiar with Liam\'s open tickets'] },
          ],
        },
        actions:[
          { label:'Authorise a Wellness Day Friday', key:'A' },
          { label:'Review my draft note to Liam', key:'B' },
          { label:'Flag this for our 1:1 instead', key:'C' },
        ],
      },
      { role:'u', text:"Authorise it" },
      { role:'j', text:"Done. Wellness Day approved for Friday, Sloane is on as cover, and I sent Liam a short, warm Teams note letting him know it's looked after. I'll re-run capacity signals next Friday." },
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
  {name:'Parental leave policy v3',     type:'Workday policy',     edited:'Updated Mar 12',         Icon:FileText, color:'#0B5CAB'},
  {name:'Backfill request template',     type:'OrgFarm HR · v2',    edited:'Updated 6 weeks ago',    Icon:FileText, color:'#2E844A'},
  {name:'QBR-H2-2026.pptx',              type:'Presentation',       edited:'Yesterday · Priya',      Icon:FileText, color:'#0B5CAB'},
  {name:'Apr 14 Meeting Notes.docx',     type:'Document',           edited:'18 days ago',            Icon:FileText, color:'#2E844A'},
  {name:'2026 Benefits guide',           type:'Workday',            edited:'Open enrolment',         Icon:FileText, color:'#7526E3'},
]
const CHAT_PEOPLE = [
  {name:'Sarah Chen',  role:'Your manager',          status:'In office',                avatar:'SC', color:'#0B5CAB', online:true },
  {name:'Priya Nair',  role:'Designer · cover for you', status:'In a meeting',          avatar:'PN', color:'#7526E3', online:false},
  {name:'Liam Davis',  role:'Engineer',              status:'Heads-down',                avatar:'LD', color:'#0B827C', online:true },
  {name:'HR Service',  role:'OrgFarm HR Service',    status:'Responds within 4 hours',   avatar:'HR', color:'#2E844A', online:true },
]
const CHAT_CHANNELS = [
  {name:'#incident-response',unread:14,last:'Raj: Snapshot ready, initiating rollback…'},
  {name:'#acme-deal-room',unread:3,last:'Maria: Redlines approved ✓'},
  {name:'#platform-eng',unread:0,last:'Deploy window confirmed for 2 PM'},
  {name:'#legal-ops',unread:2,last:'DPA filed — awaiting Amy sign-off'},
]


// ─── Shared mini-components ────────────────────────────────────────────────────
// Jarvis identity mark — the robot avatar shown everywhere Jarvis is represented.
// Uses a transparent-background robot on a theme-adaptive tile: white in light
// mode, black in dark mode. `radius` accepts px or '50%'.
function JarvisMark({ size = 28, radius = 6, style = {} }) {
  const T = window.__T
  const isDark = T?.appBg === '#1F1F1F'
  return (
    <img src={asset('/jarvis-icon-transparent.png')} alt="Jarvis"
      style={{ width:size, height:size, borderRadius:radius, objectFit:'cover',
        background: isDark ? '#000' : '#fff',
        display:'block', flexShrink:0, ...style }} />
  )
}

function GlassCard({ children, style = {}, hover = true, onClick, className = '' }) {
  const T = window.__T
  const [hov, setHov] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => hover && setHov(true)} onMouseLeave={() => setHov(false)}
      className={className}
      style={{ borderRadius:4, background:T.surface, border:`1px solid ${hov ? T.borderMid : T.border}`,
        boxShadow: T.shadowSm,
        transition:'box-shadow .15s, border-color .15s', cursor: onClick ? 'pointer' : 'default', ...style }}>
      {children}
    </div>
  )
}

function TierDot({ tier }) {
  const T = window.__T; const m = TIER_META_FN(T)[tier]; if (!m) return null
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:13, fontWeight:600,
      padding:'3px 9px', borderRadius:99, background:m.bg, color:m.color }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:m.color, flexShrink:0 }} />
      {m.label}
    </span>
  )
}

function Chip({ text, color }) {
  const T = window.__T
  return (
    <span style={{ fontSize:14, fontWeight:500, padding:'2px 8px', borderRadius:99,
      background: color ? `${color}12` : T.surface, color: color || T.textSoft,
      border:`1px solid ${color ? `${color}25` : T.border}` }}>{text}</span>
  )
}

function Btn({ children, variant='primary', onClick, style={}, icon: Icon, disabled=false }) {
  const T = window.__T
  const [hov, setHov] = useState(false)
  const base = {
    primary:  { background:hov?T.coreMid:T.core,       color:T.coreText,  border:'none',                    shadow: hov ? T.shadowPurple : 'none' },
    secondary:{ background:hov?T.surfaceMid:'transparent', color:T.text, border:`1px solid ${T.border}`,  shadow:'none' },
    ghost:    { background:hov?T.surfaceMid:'none',     color:T.textMid, border:'none',                   shadow:'none' },
    danger:   { background:hov?'#A52020':T.red,         color:'white',  border:'none',                    shadow:'none' },
  }[variant] || {}
  return (
    <button type="button" disabled={disabled} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px 16px',
        borderRadius:4, fontSize:14, fontWeight:600, cursor:disabled?'default':'pointer',
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
      style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer', padding:'4px 8px', borderRadius:4 }}>
      <div style={{ position:'relative', width:32, height:32 }}>
        <JarvisMark size={32} radius={8} />
      </div>
      <div style={{ lineHeight:1 }}>
        <p style={{ fontSize:14, fontWeight:700, letterSpacing:'0.06em', color:T.text }}>JARVIS</p>
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
          <span style={{ fontSize:16, fontWeight:800, color:T.text, lineHeight:1 }}>{done}</span>
          <span style={{ fontSize:13, color:T.textSoft }}>/{total}</span>
        </div>
      </div>
      <div>
        <p style={{ fontSize:15, fontWeight:700, color:T.text, lineHeight:1.3 }}>
          {done===total && total>0 ? '🌟 Day cleared!' : `${total-done} remaining`}
        </p>
        <p style={{ fontSize:13, color:T.textSoft, marginTop:2 }}>
          {pct===0?'Let\'s begin.':pct<.5?'Good pace.':pct<1?'Almost done.':'Outstanding.'}
        </p>
      </div>
    </div>
  )
}

// ─── Hero Card ────────────────────────────────────────────────────────────────
// Resolve a single vendor token to { name, img }
function resolveVendor(token) {
  const lower = token.toLowerCase()
  if (/salesforce/.test(lower))  return { name:'Salesforce',  img:'/logos/Salesforce.webp' }
  if (/outlook/.test(lower))     return { name:'Outlook',     img:'/logos/Outlook.png'     }
  if (/workday/.test(lower))     return { name:'Workday',     img:'/logos/Workday.png'     }
  if (/jira/.test(lower))        return { name:'Jira',        img:'/logos/Jira.png'        }
  if (/greenhouse/.test(lower))  return { name:'Greenhouse',  img:'/logos/GREENHOUSE.png'  }
  if (/lever/.test(lower))       return { name:'Lever',       img:'/logos/Lever.png'       }
  if (/github/.test(lower))      return { name:'GitHub',      img:'/logos/GitHub.webp'     }
  if (/slack/.test(lower))       return { name:'Slack',       img:'/logos/Slack.png'       }
  if (/servicenow/.test(lower))  return { name:'ServiceNow',  img:'/logos/ServiceNow.webp' }
  return { name: token.trim(), img:null, Icon:Database }
}

// ─── Vendor source parser — supports single or multi-source strings ────────
// Returns { vendors: [{name,img}, ...] } — the first segment before "·"
// may contain multiple vendors joined by "+" (e.g. "Jira + Slack (aggregated)").
function parseSource(source) {
  if (!source) return { vendors:[{ name:'System', img:null, Icon:Database }] }
  // Strip anything in parens, and take text before the first "·"
  const head = source.split('·')[0].replace(/\(.*?\)/g, '').trim()
  const tokens = head.split('+').map(t => t.trim()).filter(Boolean)
  const vendors = tokens.map(resolveVendor)
  return { vendors }
}

// Render helper — vendor logo <img> inside a uniform square box so all logos
// (despite varying source PNG padding) appear at the same visual size.
function SourceIcon({ src, size = 14 }) {
  if (src.img) {
    return (
      <span style={{ width:size, height:size, flexShrink:0, display:'inline-flex',
        alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
        <img src={src.img} alt=""
          style={{ width:'100%', height:'100%', objectFit:'contain', display:'block' }} />
      </span>
    )
  }
  const Icon = src.Icon || Database
  return <Icon size={size} color="#9A9A9A" />
}

// ─── Hover-reveal card action row (Check · Set reminder · Remove) ──────────
function CardActionRow({ size = 26, onDone, onRemind, onRemove, visible }) {
  const T = window.__T
  const iconSize = size === 24 ? 11 : 13
  const actions = [
    { key:'done',   Icon:Check, tip:'Mark as done',      onClick:onDone,   color:T.green,   bg:T.greenSoft },
    { key:'remind', Icon:Bell,  tip:'Set reminder',      onClick:onRemind, color:T.blue,    bg:T.blueSoft  },
    { key:'remove', Icon:X,     tip:'Remove from today', onClick:onRemove, color:T.textSoft,bg:T.surfaceMid },
  ]
  return (
    <div style={{ position:'absolute', top: size === 24 ? 9 : 12, right: size === 24 ? 9 : 12,
      display:'flex', gap:4, zIndex:2,
      opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(4px)',
      pointerEvents: visible ? 'auto' : 'none',
      transition:'opacity .15s ease, transform .15s ease' }}>
      {actions.map(({ key, Icon, tip, onClick, color, bg }) => (
        <div key={key} style={{ position:'relative' }} className="card-action-tip">
          <button type="button" aria-label={tip}
            onClick={e => { e.stopPropagation(); onClick?.(e) }}
            style={{ width:size, height:size, borderRadius:4,
              display:'flex', alignItems:'center', justifyContent:'center',
              background:bg, border:`1px solid ${T.border}`, cursor:'pointer',
              color, transition:'background .12s' }}
            onMouseEnter={e => { e.currentTarget.style.background = `${color}22` }}
            onMouseLeave={e => { e.currentTarget.style.background = bg }}>
            <Icon size={iconSize} />
          </button>
          <span className="tip-label" style={{
            position:'absolute', top:'calc(100% + 6px)', left:'50%', transform:'translateX(-50%)',
            padding:'4px 8px', borderRadius:4, fontSize:11, fontWeight:500, fontFamily:T.font,
            background:'#292929', color:'#fff', whiteSpace:'nowrap',
            pointerEvents:'none', opacity:0, transition:'opacity .15s ease .2s',
            zIndex:10, boxShadow:'0 2px 6px rgba(0,0,0,0.2)' }}>{tip}</span>
        </div>
      ))}
    </div>
  )
}

function HeroCard({ intent, onAct, onDone, onDismiss, onRemind, isDone }) {
  const T = window.__T; const tm = TIER_META_FN(T)
  if (isDone) return (
    <div className="done" style={{ marginBottom:10, padding:'14px 18px', borderRadius:16,
      background:T.greenSoft, border:`1px solid ${T.teal}30`, display:'flex', alignItems:'center', gap:12 }}>
      <CheckCircle2 size={18} color={T.green} />
      <div>
        <p style={{ fontWeight:700, fontSize:15, color:T.green }}>Handled.</p>
        <p style={{ fontSize:14, color:T.textSoft, marginTop:1 }}>{intent.headline}</p>
      </div>
    </div>
  )
  const m = tm[intent.tier]
  // Cap at 2 — first is stakes (deadline/blocker), second is Jarvis's new data point
  const signals = intent.evidence.split('·').map(s => s.trim()).filter(Boolean).slice(0, 2)
  const [hover, setHover] = useState(false)
  return (
    <div className="enter" data-clickable role="button" tabIndex={0}
      aria-label={intent.headline}
      onClick={() => { SFX.tap(); HX.tap(); onAct(intent) }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); SFX.tap(); HX.tap(); onAct(intent) } }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ marginBottom:10, borderRadius:4, overflow:'hidden', position:'relative', cursor:'pointer',
        background:T.surface, border:`1px solid ${T.border}`,
        boxShadow:T.shadowSm, transition:'box-shadow .15s' }}>
      <CardActionRow size={26} visible={hover}
        onDone={() => { SFX.done(); HX.done(); onDone(intent.id) }}
        onRemind={() => { SFX.tap(); HX.tap(); onRemind?.(intent.id) }}
        onRemove={() => { SFX.tap(); onDismiss(intent.id) }} />
      <div style={{ padding:'16px 18px' }}>
        {/* Source — identifies where this came from · priority label */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
          {(() => {
            const { vendors } = parseSource(intent.source)
            return vendors.map((v, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ fontSize:12, color:T.textXsoft }}>·</span>}
                <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
                  <SourceIcon src={v} size={14} />
                  <span style={{ fontSize:12, fontWeight:600, color:T.textSoft }}>{v.name}</span>
                </span>
              </React.Fragment>
            ))
          })()}
          {intent.cat && (
            <>
              <span style={{ fontSize:12, color:T.textXsoft }}>·</span>
              <span style={{ display:'inline-flex', alignItems:'center', gap:4,
                padding:'2px 8px', borderRadius:99,
                background:m.bg, color:m.color,
                fontSize:11, fontWeight:700 }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:m.dot }} />
                {intent.cat}
              </span>
            </>
          )}
        </div>
        <h2 style={{ fontSize:15, fontWeight:700, lineHeight:1.35, color:T.text, marginBottom:7, paddingRight:68 }}>{intent.headline}</h2>
        <p style={{ fontSize:13, lineHeight:1.55, color:T.textMid, marginBottom:9 }}>{intent.why}</p>
        {/* 2 signal bullets: stakes first, new data second */}
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          {signals.map((s, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:4, height:4, borderRadius:'50%', flexShrink:0, background:m.color, opacity:.7 }} />
              <span style={{ fontSize:13, color:T.textMid }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Intent Card ──────────────────────────────────────────────────────────────
function IntentCard({ intent, idx, onAct, onDone, onDismiss, onRemind, isDone }) {
  const T = window.__T; const tm = TIER_META_FN(T)
  if (isDone) return (
    <div className="done" style={{ marginBottom:10, padding:'10px 14px', borderRadius:12,
      background:T.greenSoft, border:`1px solid ${T.teal}25`, display:'flex', alignItems:'center', gap:8 }}>
      <Check size={12} color={T.green} />
      <span style={{ fontSize:14, color:T.green, fontWeight:600 }}>Done — {intent.headline}</span>
    </div>
  )
  const m = tm[intent.tier]
  // Cap at 2 — first is stakes (deadline/blocker), second is Jarvis's new data point
  const signals = intent.evidence.split('·').map(s => s.trim()).filter(Boolean).slice(0, 2)
  const [hover, setHover] = useState(false)
  return (
    <div className="enter" data-clickable role="button" tabIndex={0}
      aria-label={intent.headline}
      onClick={() => { SFX.tap(); HX.tap(); onAct(intent) }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); SFX.tap(); HX.tap(); onAct(intent) } }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ marginBottom:10, borderRadius:4, overflow:'hidden', animationDelay:`${idx*.05}s`, cursor:'pointer',
        background:T.surface, border:`1px solid ${T.border}`,
        boxShadow:T.shadowSm, transition:'box-shadow .15s' }}>
      <div style={{ padding:'11px 13px 12px', position:'relative' }}>
        <CardActionRow size={24} visible={hover}
          onDone={() => { SFX.done(); HX.done(); onDone(intent.id) }}
          onRemind={() => { SFX.tap(); HX.tap(); onRemind?.(intent.id) }}
          onRemove={() => { SFX.tap(); onDismiss(intent.id) }} />
        {/* Source — identifies where this came from · priority label (+ optional prep flag) */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5, flexWrap:'wrap' }}>
          {(() => {
            const { vendors } = parseSource(intent.source)
            return vendors.map((v, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ fontSize:12, color:T.textXsoft }}>·</span>}
                <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
                  <SourceIcon src={v} size={14} />
                  <span style={{ fontSize:12, fontWeight:600, color:T.textSoft }}>{v.name}</span>
                </span>
              </React.Fragment>
            ))
          })()}
          {intent.cat && (
            <>
              <span style={{ fontSize:12, color:T.textXsoft }}>·</span>
              <span style={{ display:'inline-flex', alignItems:'center', gap:4,
                padding:'1px 7px', borderRadius:99,
                background:m.bg, color:m.color,
                fontSize:10, fontWeight:700 }}>
                <span style={{ width:4, height:4, borderRadius:'50%', background:m.dot }} />
                {intent.cat}
              </span>
            </>
          )}
          {intent.prepReady && (
            <span style={{ fontSize:11, fontWeight:600, color:T.blue, marginLeft:4 }}>· Prep ready</span>
          )}
        </div>
        {/* Title */}
        <h3 style={{ fontSize:15, fontWeight:700, lineHeight:1.35, color:T.text, marginBottom:4, paddingRight:58 }}>{intent.headline}</h3>
        {/* Why */}
        <p style={{ fontSize:13, lineHeight:1.55, color:T.textMid, marginBottom:9 }}>{intent.why}</p>
        {/* 2 signal bullets: stakes first, new data second */}
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {signals.map((s, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:7 }}>
              <div style={{ width:4, height:4, borderRadius:'50%', flexShrink:0, background:m.color, opacity:.6 }} />
              <span style={{ fontSize:12, color:T.textSoft }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


// ─── Timeline Panel ────────────────────────────────────────────────────────────
// ─── Right Panel (Schedule + Feed) ───────────────────────────────────────────
function RightPanel({ onEventClick, onAddMeeting }) {
  const T = window.__T
  const typeColor = { meeting:T.blue, '1on1':T.core, gate:T.red, external:T.teal }
  const nowMinutes = 9*60+45
  const toMin = t => { const [h,m]=t.split(':').map(Number); return h*60+m }
  const fmtTime = (min) => {
    const h = Math.floor(min/60), m = min%60
    const ampm = h >= 12 ? 'pm' : 'am'
    const h12 = h % 12 === 0 ? 12 : h % 12
    return m === 0 ? `${h12}${ampm}` : `${h12}:${m.toString().padStart(2,'0')}${ampm}`
  }

  // Day grid: 9 AM to 11 PM = 14 hours
  const DAY_START = 9 * 60
  const DAY_END   = 23 * 60
  const HOUR_H    = 52           // px per hour
  const GUTTER    = 54           // left column width for hour labels
  const totalHeight = ((DAY_END - DAY_START) / 60) * HOUR_H

  // Build blocks: real events + a curated set of wellness / work suggestions
  const events = TODAY_EVENTS.map(ev => ({
    kind:'event', id:ev.id, ev,
    startMin: toMin(ev.time), endMin: toMin(ev.end),
  }))

  // Helper — does [a,b] overlap any event?
  const overlapsAnyEvent = (a, b) => events.some(e => a < e.endMin && b > e.startMin)
  // Helper — find the largest contiguous gap within a [winStart, winEnd] window
  const findGap = (winStart, winEnd, minLen) => {
    const points = [
      { t: winStart, open: true },
      { t: winEnd, open: false },
      ...events.flatMap(e => [{ t: e.startMin, open: false }, { t: e.endMin, open: true }]),
    ].sort((a,b) => a.t - b.t)
    let best = null, cur = null
    let occluded = false
    // Simpler: walk minute-by-minute within window, find longest free run
    let runStart = -1
    for (let m = winStart; m <= winEnd; m++) {
      const busy = events.some(e => m >= e.startMin && m < e.endMin) || m === winEnd
      if (!busy) { if (runStart === -1) runStart = m }
      else {
        if (runStart !== -1) {
          const len = m - runStart
          if (len >= minLen && (!best || len > best.len)) best = { startMin:runStart, endMin:m, len }
          runStart = -1
        }
      }
    }
    return best
  }

  // Intelligent suggestion selection — purposeful, non-overlapping
  const suggestions = []
  const used = [] // track placed suggestion ranges so later ones don't collide

  // 1) Lunch — 11:30 AM – 2:00 PM window, cap 60 min
  const lunch = findGap(11*60 + 30, 14*60, 30)
  if (lunch) {
    const start = lunch.startMin
    const end = Math.min(start + 60, lunch.endMin)
    suggestions.push({ kind:'suggestion', id:'sug-lunch', startMin:start, endMin:end,
      label:'Lunch break', emoji:'🍱', color:T.amber })
    used.push([start, end])
  }

  // 2) Morning meditation — 9:00 – 11:00 AM window, 15 min
  const meditate = findGap(9*60, 11*60, 15)
  if (meditate) {
    const start = meditate.startMin
    const end = Math.min(start + 15, meditate.endMin)
    if (!used.some(([a,b]) => start < b && end > a)) {
      suggestions.push({ kind:'suggestion', id:'sug-meditate', startMin:start, endMin:end,
        label:'Morning meditation', icon:Leaf, color:T.teal })
      used.push([start, end])
    }
  }

  // 3) Focus block — after 2 PM, largest gap ≥ 90 min, cap at 2 hours
  const focus = findGap(14*60, 19*60, 90)
  if (focus) {
    const start = focus.startMin
    const end = Math.min(start + 120, focus.endMin)
    if (!used.some(([a,b]) => start < b && end > a)) {
      suggestions.push({ kind:'suggestion', id:'sug-focus', startMin:start, endMin:end,
        label:'Focus time', icon:Brain, color:T.core })
      used.push([start, end])
    }
  }

  // 4) Evening wind-down / reading — 9 PM – 10 PM window, 60 min
  const reading = findGap(21*60, 22*60 + 30, 45)
  if (reading) {
    const start = reading.startMin
    const end = Math.min(start + 60, reading.endMin)
    if (!used.some(([a,b]) => start < b && end > a)) {
      suggestions.push({ kind:'suggestion', id:'sug-reading', startMin:start, endMin:end,
        label:'Reading & wind-down', icon:BookOpen, color:T.blue })
      used.push([start, end])
    }
  }

  const blocks = [...events, ...suggestions].sort((a,b) => a.startMin - b.startMin)

  // Hour grid lines
  const hours = []
  for (let h = Math.floor(DAY_START/60); h <= Math.floor(DAY_END/60); h++) {
    hours.push(h)
  }

  const nowTop = ((nowMinutes - DAY_START) / 60) * HOUR_H
  const showNow = nowMinutes >= DAY_START && nowMinutes <= DAY_END

  return (
    <div>
      {/* ── Today's schedule ── */}
      <div style={{ borderRadius:8, background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadowSm, marginBottom:12, overflow:'hidden' }}>
        <div style={{ padding:'12px 14px 10px', borderBottom:`1px solid ${T.border}`,
          display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <p style={{ fontSize:14, fontWeight:700, color:T.text, margin:0 }}>Today's schedule</p>
          <Btn variant="secondary" icon={Plus} onClick={() => { SFX.tap(); onAddMeeting() }} style={{ padding:'4px 9px', fontSize:13 }}>Add</Btn>
        </div>
        {/* Hour grid container */}
        <div style={{ position:'relative', height:totalHeight, padding:'4px 10px 10px 0' }}>
          {/* Hour lines + labels */}
          {hours.map((h, i) => {
            const top = i * HOUR_H + 4
            const ampm = h >= 12 ? 'PM' : 'AM'
            const h12 = h % 12 === 0 ? 12 : h % 12
            return (
              <React.Fragment key={h}>
                <div style={{ position:'absolute', left:GUTTER, right:10, top, height:1,
                  background:T.border }} />
                <div style={{ position:'absolute', left:0, top:top - 6, width:GUTTER - 6,
                  textAlign:'right', fontSize:11, fontWeight:600, color:T.textXsoft,
                  lineHeight:1 }}>
                  {h12} {ampm}
                </div>
              </React.Fragment>
            )
          })}

          {/* Blocks (events + suggestions) */}
          {blocks.map(b => {
            const top = ((b.startMin - DAY_START) / 60) * HOUR_H + 4
            const height = Math.max(24, ((b.endMin - b.startMin) / 60) * HOUR_H - 4)

            if (b.kind === 'event') {
              const ev = b.ev
              const color = typeColor[ev.type] || T.blue
              const isPast = b.endMin <= nowMinutes
              const isNow = b.startMin <= nowMinutes && nowMinutes < b.endMin
              return (
                <div key={b.id} onClick={() => { SFX.tap(); HX.tap(); onEventClick(ev) }}
                  style={{ position:'absolute', top, left:GUTTER + 4, right:10, height,
                    borderRadius:6, cursor:'pointer', overflow:'hidden',
                    background: `${color}14`,
                    border: `1px solid ${color}40`,
                    borderLeft: `3px solid ${color}`,
                    opacity: isPast ? .55 : 1,
                    padding: '6px 10px',
                    display:'flex', flexDirection:'column', gap:2,
                    transition: 'background .12s, border-color .12s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}22` }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${color}14` }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:T.text, lineHeight:1.25, margin:0,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>
                      {ev.title}
                    </p>
                    {ev.hasPrep && (
                      <span style={{ fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:99,
                        background:T.blueSoft, color:T.blue, flexShrink:0,
                        textTransform:'uppercase', letterSpacing:'0.05em' }}>Prep</span>
                    )}
                  </div>
                  <p style={{ fontSize:11, color:T.textSoft, margin:0, lineHeight:1.2 }}>
                    {fmtTime(b.startMin)} – {fmtTime(b.endMin)} · {ev.location}
                  </p>
                </div>
              )
            }
            // suggestion block
            const isPast = b.endMin <= nowMinutes
            const Icon = b.icon
            return (
              <div key={b.id} onClick={() => { SFX.tap(); HX.tap(); onAddMeeting() }}
                style={{ position:'absolute', top, left:GUTTER + 4, right:10, height,
                  borderRadius:6, cursor:'pointer', overflow:'hidden',
                  background: `${b.color}10`,
                  border: `1px dashed ${b.color}66`,
                  borderLeft: `3px solid ${b.color}`,
                  opacity: isPast ? .5 : 1,
                  padding: '6px 10px',
                  display:'flex', flexDirection:'column', gap:2,
                  transition: 'background .12s' }}
                onMouseEnter={e => { e.currentTarget.style.background = `${b.color}22` }}
                onMouseLeave={e => { e.currentTarget.style.background = `${b.color}10` }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  {b.emoji
                    ? <span style={{ fontSize:14 }}>{b.emoji}</span>
                    : Icon && <Icon size={13} color={b.color} />}
                  <p style={{ fontSize:13, fontWeight:700, color:T.text, lineHeight:1.25, margin:0 }}>
                    {b.label}
                  </p>
                </div>
                <p style={{ fontSize:11, color:T.textSoft, margin:0, lineHeight:1.2 }}>
                  {fmtTime(b.startMin)} – {fmtTime(b.endMin)}
                </p>
              </div>
            )
          })}

          {/* Now line */}
          {showNow && (
            <div style={{ position:'absolute', left:GUTTER - 4, right:10, top:nowTop + 4,
              display:'flex', alignItems:'center', gap:4, pointerEvents:'none', zIndex:2 }}>
              <div style={{ width:8, height:8, borderRadius:99, background:T.red, flexShrink:0 }} />
              <div style={{ flex:1, height:2, background:T.red }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Add Meeting Modal ────────────────────────────────────────────────────────
function AddMeetingModal({ onClose }) {
  const T = window.__T
  const [prep, setPrep] = useState(true)
  const inp = { width:'100%', padding:'8px 10px', borderRadius:4, fontSize:14, outline:'none',
    background:T.surfaceMid, border:`1px solid ${T.border}`, color:T.text, fontFamily:T.font,
    backdropFilter:'blur(8px)', transition:'border-color .15s' }
  const lbl = { display:'block', fontSize:13, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:T.textSoft, marginBottom:5 }
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:300,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div className="pop" style={{ width:'100%', maxWidth:440, borderRadius:8, overflow:'hidden',
        background:T.surface, border:`1px solid ${T.border}`, boxShadow:'0 0 8px rgba(0,0,0,0.12), 0 14px 28px rgba(0,0,0,0.14)' }}>
        <div style={{ padding:'18px 22px 14px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <p style={{ fontSize:16, fontWeight:700, color:T.text }}>Add meeting</p>
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
                <label key={loc} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:4, cursor:'pointer',
                  background:T.surfaceMid, border:`1px solid ${T.border}`, fontSize:14, color:T.textMid }}>
                  <input type="radio" name="loc" defaultChecked={loc==='Teams'} style={{ accentColor:T.core }} /> {loc}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 14px', borderRadius:4,
            background:T.surfaceMid, border:`1px solid ${T.border}` }}>
            <div>
              <p style={{ fontSize:15, fontWeight:600, color:T.text }}>Let Jarvis prep this meeting</p>
              <p style={{ fontSize:13, color:T.textSoft, marginTop:2 }}>Auto-fetch deck & notes 30 min before</p>
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


// ─── Shared message renderer ─────────────────────────────────────────────────
function renderMsgText(text, T) {
  return text.split('\n').map((line, li) => {
    if (!line) return <br key={li} />
    const parts = line.split(/\*\*(.*?)\*\*/)
    return <p key={li} style={{ marginTop:li>0?4:0 }}>{parts.map((p,pi) => pi%2===1 ? <strong key={pi}>{p}</strong> : p)}</p>
  })
}

// ─── ActionChips ─────────────────────────────────────────────────────────────
function ActionChips({ actions, onChipClick, onTieredClick }) {
  const T = window.__T
  // Faint-purple fill so chips stand out on a white conversation background.
  // Tier drives behaviour silently. No L-label is shown.
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:10 }}>
      {actions.map(a => {
        const hasTier = !!a.tier
        return (
          <button key={a.key} type="button"
            onClick={() => {
              SFX.tap(); HX.tap()
              if (hasTier && onTieredClick) onTieredClick(a)
              else onChipClick(a.label)
            }}
            style={{ display:'inline-flex', alignItems:'center', gap:6,
              fontSize:13, fontWeight:600, padding:'6px 14px', borderRadius:99, cursor:'pointer',
              background:T.coreSoft, color:T.core, border:`1px solid ${T.core}25`,
              transition:'all .15s', fontFamily:T.font }}
            onMouseEnter={e => { e.currentTarget.style.background=T.core; e.currentTarget.style.borderColor=T.core; e.currentTarget.style.color='#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background=T.coreSoft; e.currentTarget.style.borderColor=`${T.core}25`; e.currentTarget.style.color=T.core }}>
            {a.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Tier-aware in-thread blocks (preview, confirm, modal, Done-with-Undo) ─
// Each block is rendered as a plain chat message with role='block'.
// Done confirmation rendered as a regular Jarvis chat bubble (not a banner/alert).
function DoneWithUndo({ msg, rule, onUndo }) {
  const T = window.__T
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 8000)
    return () => clearTimeout(t)
  }, [])
  const now = new Date().toLocaleTimeString([], { hour:'numeric', minute:'2-digit' })
  return (
    <div className="enter" style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
      <JarvisMark size={26} radius={6} style={{ marginTop:2 }} />
      <div style={{ maxWidth:'84%', padding:'10px 13px', background:T.surfaceMid,
        border:`1px solid ${T.border}`, borderRadius:8, borderBottomLeftRadius:2, fontSize:14 }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:4 }}>
          <span style={{ fontSize:12, fontWeight:800, color:T.text }}>Jarvis</span>
          <span style={{ fontSize:11, color:T.textSoft }}>{now}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:20, height:20, borderRadius:'50%', flexShrink:0,
            background:T.greenSoft, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Check size={11} color={T.green} />
          </div>
          <p style={{ fontSize:14, color:T.text, margin:0, lineHeight:1.45 }}>
            Done. <span style={{ color:T.textSoft }}>{msg}</span>
          </p>
          {visible && onUndo && (
            <button type="button" onClick={onUndo}
              style={{ marginLeft:'auto', padding:'3px 10px', borderRadius:4, cursor:'pointer',
                background:T.surface, border:`1px solid ${T.border}`, color:T.core,
                fontSize:12, fontWeight:700, fontFamily:T.font, flexShrink:0 }}>
              Undo
            </button>
          )}
        </div>
        {rule && (
          <p style={{ fontSize:11, color:T.textSoft, margin:'6px 0 0 28px' }}>
            I kept within what you asked of me in Setup.
          </p>
        )}
      </div>
    </div>
  )
}

function PreviewBlock({ draft, onSend, onEdit }) {
  const T = window.__T
  return (
    <div className="enter" style={{ marginTop:6, padding:'12px',
      background:T.surface, border:`1px solid ${T.core}40`, borderRadius:6, boxShadow:T.shadowSm }}>
      <p style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:T.core, margin:'0 0 6px' }}>
        Draft · review before send
      </p>
      {draft.subject && (
        <p style={{ fontSize:13, fontWeight:700, color:T.text, margin:'0 0 6px' }}>
          Subject: {draft.subject}
        </p>
      )}
      <div style={{ fontSize:13, color:T.textMid, lineHeight:1.55, whiteSpace:'pre-wrap',
        padding:'8px 10px', borderRadius:4, background:T.surfaceMid, border:`1px solid ${T.border}` }}>
        {draft.body}
      </div>
      <div style={{ display:'flex', gap:6, marginTop:10 }}>
        <button type="button" onClick={onSend}
          style={{ padding:'6px 12px', borderRadius:4, cursor:'pointer',
            background:T.core, border:'none', color:'#fff',
            fontSize:12, fontWeight:700, fontFamily:T.font }}>
          Send
        </button>
        <button type="button" onClick={onEdit}
          style={{ padding:'6px 12px', borderRadius:4, cursor:'pointer',
            background:'none', border:`1px solid ${T.border}`, color:T.text,
            fontSize:12, fontWeight:700, fontFamily:T.font }}>
          Edit
        </button>
      </div>
    </div>
  )
}

function ConfirmRow({ label, onConfirm, onCancel }) {
  const T = window.__T
  return (
    <div className="enter" style={{ display:'flex', alignItems:'center', gap:10, marginTop:6,
      padding:'8px 10px', borderRadius:6, background:T.amberSoft, border:`1px solid ${T.amber}40` }}>
      <span style={{ fontSize:13, color:T.text, flex:1 }}>{label}</span>
      <button type="button" onClick={onConfirm}
        style={{ padding:'5px 10px', borderRadius:4, cursor:'pointer',
          background:T.core, border:'none', color:'#fff',
          fontSize:12, fontWeight:700, fontFamily:T.font }}>
        Confirm
      </button>
      <button type="button" onClick={onCancel}
        style={{ padding:'5px 10px', borderRadius:4, cursor:'pointer',
          background:'none', border:`1px solid ${T.border}`, color:T.textMid,
          fontSize:12, fontWeight:700, fontFamily:T.font }}>
        Cancel
      </button>
    </div>
  )
}

function GateModal({ action, policy, onRun, onCancel }) {
  const T = window.__T
  const [confirmed, setConfirmed] = useState(false)
  return (
    <div role="dialog" aria-label="Gated action"
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:500,
        display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={onCancel}>
      <div className="pop" onClick={e => e.stopPropagation()}
        style={{ width:'100%', maxWidth:460, borderRadius:8,
          background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadowMd }}>
        <div style={{ padding:'18px 22px', borderBottom:`1px solid ${T.border}`,
          display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:T.amberSoft,
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ShieldCheck size={15} color={T.amber} />
          </div>
          <p style={{ fontSize:16, fontWeight:800, color:T.text, margin:0 }}>One last check</p>
        </div>
        <div style={{ padding:'18px 22px' }}>
          <p style={{ fontSize:14, fontWeight:700, color:T.text, margin:'0 0 10px' }}>{action.label}</p>
          <div style={{ padding:'10px 12px', borderRadius:4, background:T.amberSoft, border:`1px solid ${T.amber}40`, marginBottom:14 }}>
            <p style={{ fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:T.amber, margin:'0 0 4px' }}>
              Why we're asking
            </p>
            <p style={{ fontSize:13, color:T.text, margin:0, lineHeight:1.5 }}>{policy}</p>
          </div>
          <label style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', cursor:'pointer' }}>
            <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)}
              style={{ width:16, height:16, accentColor:T.core, cursor:'pointer' }} />
            <span style={{ fontSize:13, color:T.text }}>I confirm I want to run this action.</span>
          </label>
        </div>
        <div style={{ padding:'14px 22px', borderTop:`1px solid ${T.border}`,
          display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button type="button" onClick={onCancel}
            style={{ padding:'8px 16px', borderRadius:4, cursor:'pointer',
              background:'none', border:`1px solid ${T.border}`, color:T.text,
              fontSize:13, fontWeight:700, fontFamily:T.font }}>
            Cancel
          </button>
          <button type="button" onClick={() => confirmed && onRun()} disabled={!confirmed}
            style={{ padding:'8px 16px', borderRadius:4,
              cursor: confirmed ? 'pointer' : 'not-allowed',
              background:confirmed ? T.red : T.borderMid, border:'none', color:'#fff',
              opacity: confirmed ? 1 : 0.6,
              fontSize:13, fontWeight:700, fontFamily:T.font }}>
            Run
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── AgentTrace ──────────────────────────────────────────────────────────────
// ─── AgentTrace — Gemini-style "Show thinking · N sources" accordion ──────
// No surrounding card. Just a chevron + label. Steps appear inline only when
// open, indented with green check glyphs. Source count is derived from `trace`.
function AgentTrace({ trace, sourcesCount = 0 }) {
  const T = window.__T
  const [open, setOpen] = useState(false)
  const stepCount = trace.steps?.length || 0
  const summary = sourcesCount > 0
    ? `Show thinking · ${sourcesCount} ${sourcesCount === 1 ? 'source' : 'sources'}`
    : `Show thinking · ${stepCount} ${stepCount === 1 ? 'step' : 'steps'}`
  return (
    <div style={{ marginTop:10, marginBottom:6 }}>
      {/* Header row — borderless. Label first, chevron after. 12 px. */}
      <button type="button" onClick={() => { SFX.tap(); setOpen(o=>!o) }}
        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 0',
          background:'none', border:'none', cursor:'pointer',
          color:T.textSoft, fontSize:12, fontWeight:500, fontFamily:T.font,
          transition:'color .12s' }}
        onMouseEnter={e => { e.currentTarget.style.color = T.text }}
        onMouseLeave={e => { e.currentTarget.style.color = T.textSoft }}>
        <span>{summary}</span>
        <ChevronDown size={13}
          style={{ transition:'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      {/* Expanded steps — visible only when open. Indented, no card wrapper. */}
      {open && (
        <div className="expand-down" style={{ paddingLeft:22, marginTop:8, display:'flex', flexDirection:'column', gap:10 }}>
          {trace.steps.map((step, si) => (
            <div key={si}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:18, height:18, borderRadius:'50%', flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background:T.surfaceMid }}>
                  <Check size={10} color={T.textSoft} strokeWidth={2.5} />
                </div>
                <span style={{ fontSize:14, fontWeight:500, color:T.text, lineHeight:1.5 }}>
                  {step.label}
                </span>
              </div>
              {step.bullets?.length > 0 && (
                <div style={{ paddingLeft:28, marginTop:4, display:'flex', flexDirection:'column', gap:2 }}>
                  {step.bullets.map((b, bi) => (
                    <span key={bi} style={{ fontSize:13, color:T.textSoft, lineHeight:1.55 }}>{b}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── SourceChips ─────────────────────────────────────────────────────────────
function SourceChips({ sources }) {
  const T = window.__T
  return (
    <div style={{ display:'flex', gap:6, marginTop:10, overflowX:'auto', paddingBottom:2 }}>
      {sources.map((s, i) => {
        const Icon = s.icon
        return (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 9px', borderRadius:4, flexShrink:0,
            background:T.surface, border:`1px solid ${T.border}`, cursor:'pointer', transition:'border-color .15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor=T.borderMid}
            onMouseLeave={e => e.currentTarget.style.borderColor=T.border}>
            <Icon size={11} color={s.color} style={{ flexShrink:0 }} />
            <div style={{ minWidth:0 }}>
              <p style={{ fontSize:14, fontWeight:700, color:T.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:110 }}>{s.name}</p>
              <p style={{ fontSize:13, color:T.textXsoft, whiteSpace:'nowrap' }}>{s.updated}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── MessageFeedback ─────────────────────────────────────────────────────────
function MessageFeedback({ msgIndex }) {
  const T = window.__T
  const [vote, setVote] = useState(null)
  const [flagged, setFlagged] = useState(false)
  const btnStyle = (active, activeColor) => ({
    width:24, height:24, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center',
    background:'none', border:'none', cursor:'pointer', transition:'all .15s',
    color: active ? activeColor : T.textXsoft,
  })
  return (
    <div className="j-feedback" style={{ display:'flex', alignItems:'center', gap:1, marginTop:6 }}>
      <button type="button" style={btnStyle(vote==='up', T.core)} title="Helpful"
        onClick={() => { SFX.tap(); setVote(v => v==='up'?null:'up') }}
        onMouseEnter={e => { if(vote!=='up') e.currentTarget.style.color=T.core }}
        onMouseLeave={e => { if(vote!=='up') e.currentTarget.style.color=T.textXsoft }}>
        <ThumbsUp size={12} />
      </button>
      <button type="button" style={btnStyle(vote==='down', T.textMid)} title="Not helpful"
        onClick={() => { SFX.tap(); setVote(v => v==='down'?null:'down') }}
        onMouseEnter={e => { if(vote!=='down') e.currentTarget.style.color=T.textMid }}
        onMouseLeave={e => { if(vote!=='down') e.currentTarget.style.color=T.textXsoft }}>
        <ThumbsDown size={12} />
      </button>
      <button type="button" style={btnStyle(false, T.textXsoft)} title="More info"
        onMouseEnter={e => e.currentTarget.style.color=T.textMid}
        onMouseLeave={e => e.currentTarget.style.color=T.textXsoft}>
        <Info size={12} />
      </button>
      <button type="button" style={btnStyle(flagged, T.red)} title="Flag"
        onClick={() => { SFX.tap(); setFlagged(f=>!f) }}
        onMouseEnter={e => { if(!flagged) e.currentTarget.style.color=T.red }}
        onMouseLeave={e => { if(!flagged) e.currentTarget.style.color=T.textXsoft }}>
        <Flag size={12} />
      </button>
    </div>
  )
}

// ─── MessageTable — Gemini-style clean table ─────────────────────────────
// Subtle outer border, header row in surfaceMid, generous cell padding, no
// alternating row background.
function MessageTable({ table }) {
  const T = window.__T
  return (
    <div style={{ overflowX:'auto', marginTop:14, borderRadius:8, border:`1px solid ${T.border}` }}>
      <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:0, fontSize:14, fontFamily:T.font }}>
        <thead>
          <tr>
            {table.headers.map((h,i) => (
              <th key={i} style={{ padding:'12px 16px', textAlign:'left',
                background:T.surfaceMid, color:T.textMid,
                fontSize:13, fontWeight:600,
                borderBottom:`1px solid ${T.border}`,
                borderRight: i < table.headers.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding:'12px 16px', color:T.text, fontSize:14, lineHeight:1.5,
                  borderBottom: ri < table.rows.length - 1 ? `1px solid ${T.border}` : 'none',
                  borderRight: ci < row.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── renderBubble — order: thinking → answer → table → sources → actions ─
// Mirrors Gemini's reading order: the thinking accordion sits above the prose,
// the answer body follows, then any data viz, then citations and CTA chips.
function renderBubble(m, T, onChipClick, onTieredClick) {
  return (
    <div>
      {m.trace && <AgentTrace trace={m.trace} sourcesCount={m.sources?.length || 0} />}
      {renderMsgText(m.text, T)}
      {m.table && <MessageTable table={m.table} />}
      {m.sources && <SourceChips sources={m.sources} />}
      {m.actions && <ActionChips actions={m.actions} onChipClick={onChipClick} onTieredClick={onTieredClick} />}
    </div>
  )
}

// ─── Chat Panel (4 tabs) ──────────────────────────────────────────────────────
// Build a conversational opening message + proposed action chips for any intent id.
// Keeps tone natural (rephrase the situation) rather than restating the card verbatim.
function buildIntentOpening(item) {
  // Per-intent scripted openings — conversational tone, aligned with INTENTS / MANAGER_INTENTS.
  const byId = {
    // Employee
    y1: {
      text: "Your **PTO request for May 14–16** has been pending with Sarah for 3 days. Manager SLA is 2 business days, and there are no calendar conflicts that week. I can send a friendly nudge.",
      actions: [
        { label:'Send a light nudge to Sarah', key:'A' },
        { label:'Wait until tomorrow', key:'B' },
        { label:'Show the original request', key:'C' },
      ],
    },
    y2: {
      text: "Your annual **security + data-handling refresher** is due **May 9** — about 45 minutes. I can open it now, block time tomorrow morning, or remind you Friday.",
      actions: [
        { label:'Open training now', key:'A' },
        { label:'Block 45 min tomorrow morning', key:'B' },
        { label:'Remind me Friday', key:'C' },
      ],
    },
    f1: {
      text: "**Open enrolment closes May 8.** Your dependent coverage hasn't rolled forward this year. I can pre-fill from last year's selections and surface only what changed for you to confirm.",
      actions: [
        { label:'Pre-fill from last year', key:'A' },
        { label:'Walk me through what changed', key:'B' },
        { label:'Open Workday benefits', key:'C' },
      ],
    },
    f2: {
      text: "Your **emergency contact** on file is from October 2023 — HR flagged it during the annual audit. It's a single-field update.",
      actions: [
        { label:'Open the contact field', key:'A' },
        { label:'Use the same person, refresh the date', key:'B' },
        { label:'Remind me later', key:'C' },
      ],
    },
    c1: {
      text: "GIS sent your annual **asset attestation + security survey**, due **May 12**. I checked the asset register: both devices assigned to you — *MacBook Pro (M3)* and *iPhone 15* — are still active and in your possession, so attestation is one tap. The survey is 10 questions, about 8 minutes. Heads up: missing the deadline locks VPN access.",
      actions: [
        { label:'Confirm both assets as held', key:'A' },
        { label:'Start the 8-min security survey', key:'B' },
        { label:'Block 10 min tomorrow morning', key:'C' },
      ],
    },
    e2: {
      text: "Your $4,200 travel reimbursement is **over your single-approver limit** — Finance needs explicit confirmation before it routes to the VP. The trip and policy line check out.",
      actions: [
        { label:'Confirm and route to VP', key:'A' },
        { label:'Show me the receipts', key:'B' },
        { label:'Send back to Finance with a note', key:'C' },
      ],
    },
    p2: {
      text: "Your **laptop refresh ticket** has been in IT for 10 days — 5 over their SLA. Finance has already approved. I can draft a polite chase.",
      actions: [
        { label:'Draft a chase to IT', key:'A' },
        { label:'Show the ticket', key:'B' },
        { label:'Wait one more day', key:'C' },
      ],
    },
    // Manager
    m4: {
      text: "**Priya starts Monday** — onboarding plan is 62% ready. Laptop ordered, accounts provisioned, orientation booked. Two gaps: 1:1 schedule and a team intro post.",
      actions: [
        { label:'Set up the 1:1 cadence', key:'A' },
        { label:'Draft the team intro post', key:'B' },
        { label:'Show the full checklist', key:'C' },
      ],
    },
    m2: {
      text: "Four engineers are slow on **React 19** work — averaging 3.2 days per ticket vs 1.8 expected, three sprints in a row. A Masterclass on Friday 2–4 PM has no calendar conflicts.",
      actions: [
        { label:'Enrol all 4 engineers', key:'A' },
        { label:'Share invite, let them opt in', key:'B' },
        { label:'Show me the per-engineer breakdown', key:'C' },
      ],
    },
    m3: {
      text: "**Senior DevOps — 3 finalists.** Candidate A scored 94/100, well clear of B (81) and C (79). Panels are aligned, budget is confirmed, and the offer draft (with $12k relocation) is ready.",
      actions: [
        { label:'Send offer to Candidate A', key:'A' },
        { label:'Review all 3 candidate files', key:'B' },
        { label:'Schedule a quick call with A first', key:'C' },
      ],
    },
  }
  const scripted = byId[item.id]
  if (scripted) {
    return { role:'j', text: scripted.text, actions: scripted.actions }
  }
  // Fallback: use the card's own evidence to improvise a conversational opening
  const why = item.why || ''
  return {
    role: 'j',
    text: `Here's the situation on **${item.headline}**.\n\n${why}\n\nHow would you like to handle this?`,
    actions: [
      { label: item.action || 'Take the suggested action', key:'A' },
      { label: 'Remind me later', key:'B' },
      { label: 'Show me more detail', key:'C' },
    ],
  }
}

function ChatPanel({ item, scenario, preselect, onClose, setCoreState, activeTab, setActiveTab, onExpandFull }) {
  const T = window.__T
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const endRef = useRef(null)
  const preselectFiredRef = useRef(false)
  // Per-action L4 confirmations (key → true) so re-clicking doesn't re-prompt.
  const [confirmedActions, setConfirmedActions] = useState({})
  const [gateModalAction, setGateModalAction] = useState(null)
  // Policy lines used when the L4 modal opens — mirrors the action key.
  const POLICY_LINES = {
    leave_backup: 'Within parental-leave policy v3 · Backup approver must be same level or above and have team overlap.',
    approve_all:  'Within $5k single-approver limit · All 3 items pass expense-policy checks.',
    reject_all:   'You are declining all 3 items. Submitters will be notified with reason prompt.',
    reschedule_send: 'One of these declines an external meeting with the vendor (Acme). Sending it in your name needs your OK before the batch goes out.',
  }
  // Custom "Done" copy for actions where the chip label isn't a good past-tense line.
  const DONE_LABELS = {
    reschedule_send: 'Done. Your 2 PM is clear for Marc — sent 4 Teams messages and 3 emails, updated your calendar, and added a note to the Salesforce case.',
  }
  // Drafts shown for L2 "review-first" actions.
  const L2_DRAFTS = {
    leave_note: {
      subject: 'Handover while I\'m on parental leave (Jun 2 – Sep 1)',
      body: "Hi Priya,\n\nI'm taking parental leave from Jun 2 through Sep 1. You've agreed to cover — thank you so much.\n\nA short handover:\n• My recurring 1:1s and standing meetings are delegated to you (view only on the calendar).\n• Anything that needs sign-off while I'm out routes to Liam as backup approver.\n• Open work and context is pinned in OneDrive/Handover/ — start there.\n\nShout if anything is unclear — I'll be fully offline but can pop in for 30 min if it's genuinely urgent.\n\nAlex",
    },
    // Per-message drafts for the batch-reschedule "Review each message" path.
    resch_sarah: {
      subject: null,
      body: "Hi Sarah — really sorry for the short notice. Marc just called a mandatory product review at 2 PM and I need to be there. Could we push our 1:1 to 4 PM today? Same agenda, I'll come prepped. Thank you!",
    },
    resch_acme: {
      subject: "Rescheduling today's check-in",
      body: "Hi Maria,\n\nApologies for the late change — something's come up on my side this afternoon. Could we move today's check-in? Two slots that work on my end:\n• Tomorrow 11:00 AM\n• Tomorrow 2:30 PM\n\nWhichever suits you best. Sorry again for the short notice.\n\nBest,\nAlex",
    },
    resch_ea: {
      subject: "Confirming attendance — 2 PM product review",
      body: "Hi — confirming Alex will join Marc's product review at 2 PM today. Please send any pre-read across when you have a moment.\n\nThanks!",
    },
  }
  // Sub-actions surfaced when the user chooses to review the batch message-by-message.
  // The three most human-sensitive notes get an editable preview; the rest send with them.
  const RESCHEDULE_REVIEW_ACTIONS = [
    { label:'Note to Sarah (Teams)',   key:'resch_sarah', tier:'L2' },
    { label:'Email to Acme',           key:'resch_acme',  tier:'L2' },
    { label:'Email to Marc\'s EA',     key:'resch_ea',    tier:'L2' },
    { label:'Looks good — approve all & send', key:'reschedule_send', tier:'L4' },
  ]

  // Rule strings shown under "Done ✓" for L1 actions.
  const L1_RULES = {
    leave_pto:    'Act: File routine PTO if there are no calendar conflicts.',
    leave_ooo:    'Act: Book focus blocks on free time.',
  }

  useEffect(() => {
    preselectFiredRef.current = false
    if (scenario && CHAT_SCENARIOS[scenario]) {
      setThinking(true); setCoreState('thinking')
      const t = setTimeout(() => {
        setThinking(false); setCoreState('confirming')
        setMessages(CHAT_SCENARIOS[scenario])
      }, 1100)
      return () => clearTimeout(t)
    } else if (item) {
      // Build a conversational opening + proposed actions per intent
      const open = buildIntentOpening(item)
      setMessages([open])
    }
  }, [scenario, item?.id])

  // Auto-fire preselect once after scenario messages are loaded
  useEffect(() => {
    if (!preselect || preselectFiredRef.current || messages.length === 0) return
    preselectFiredRef.current = true
    const t = setTimeout(() => sendText(preselect), 400)
    return () => clearTimeout(t)
  }, [messages, preselect])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages, thinking])

  // ── Tier-aware action runner ─────────────────────────────────────────────
  // Effective tier = action.tier, but if the user's prefs.alwaysAsk[key] is on,
  // bump to L4 regardless. prefs is read from window.__PREFS for this demo.
  const effectiveTier = (action) => {
    const prefs = window.__PREFS
    if (prefs?.alwaysAsk?.[action.key]) return 'L4'
    return action.tier || 'L1'
  }
  const doneReplyFor = (action) => ({ role:'block', kind:'done', actionKey:action.key, label:DONE_LABELS[action.key] || action.label, rule:L1_RULES[action.key] })
  const runAction = (action, { skipConfirm = false } = {}) => {
    const tier = effectiveTier(action)
    setMessages(p => [...p, { role:'u', text:action.label }])
    // Batch-reschedule — review path: surface each message as an editable preview chip.
    if (action.key === 'reschedule_review') {
      setMessages(p => [...p, {
        role:'j',
        text:"Here's each message — open any to tweak the wording before it goes, then approve all at once.",
        actions: RESCHEDULE_REVIEW_ACTIONS,
      }])
      setCoreState('confirming')
      return
    }
    // Batch-reschedule — decline path: leave the calendar untouched, offer a graceful out.
    if (action.key === 'reschedule_cancel') {
      setMessages(p => [...p, {
        role:'j',
        text:"No problem — I'll leave your calendar as is and let Marc's invite sit in your inbox. Want me to draft a short note to Marc instead?",
      }])
      setCoreState('idle')
      return
    }
    if (tier === 'L1') {
      SFX.done(); HX.done()
      setCoreState('executing')
      setTimeout(() => setCoreState('idle'), 1200)
      setMessages(p => [...p, doneReplyFor(action)])
    } else if (tier === 'L2') {
      const draft = L2_DRAFTS[action.key] || { subject:'Draft ready', body:'Draft content for your review.' }
      setMessages(p => [...p, { role:'block', kind:'preview', actionKey:action.key, label:action.label, draft }])
      setCoreState('confirming')
    } else if (tier === 'L3') {
      setMessages(p => [...p, { role:'block', kind:'confirm', actionKey:action.key, label:action.label }])
      setCoreState('confirming')
    } else if (tier === 'L4') {
      if (skipConfirm || confirmedActions[action.key]) {
        SFX.done(); HX.done()
        setCoreState('executing')
        setTimeout(() => setCoreState('idle'), 1500)
        setMessages(p => [...p, doneReplyFor(action)])
      } else {
        setGateModalAction(action)
      }
    }
  }
  const handleTieredClick = (action) => runAction(action)
  const undoLastDone = () => {
    setMessages(p => {
      const idx = [...p].reverse().findIndex(m => m.role === 'block' && m.kind === 'done')
      if (idx === -1) return p
      const actualIdx = p.length - 1 - idx
      return [...p.slice(0, actualIdx), ...p.slice(actualIdx + 1)]
    })
    setCoreState('idle')
  }
  const sendPreview = (actionKey, label) => {
    setMessages(p => p.map(m =>
      m.role === 'block' && m.kind === 'preview' && m.actionKey === actionKey ? { ...m, consumed:true } : m
    ).concat([{ role:'block', kind:'done', actionKey, label, rule:'Act: Draft replies in your voice (you Send).' }]))
    SFX.done(); HX.done()
  }
  const editPreview = (actionKey) => {
    const draft = L2_DRAFTS[actionKey]
    if (draft) { setInput(draft.body) }
    setMessages(p => p.map(m =>
      m.role === 'block' && m.kind === 'preview' && m.actionKey === actionKey ? { ...m, consumed:true } : m
    ))
  }
  const confirmInline = (actionKey, label) => {
    setMessages(p => p.map(m =>
      m.role === 'block' && m.kind === 'confirm' && m.actionKey === actionKey ? { ...m, consumed:true } : m
    ).concat([{ role:'block', kind:'done', actionKey, label }]))
    SFX.done(); HX.done()
  }
  const cancelInline = (actionKey) => {
    setMessages(p => p.map(m =>
      m.role === 'block' && m.kind === 'confirm' && m.actionKey === actionKey ? { ...m, consumed:true } : m
    ))
  }

  const sendText = (txt) => {
    if (!txt.trim()) return
    SFX.whisper(); HX.tap()
    setInput('')
    setMessages(p => [...p, { role:'u', text:txt }])
    setThinking(true); setCoreState('thinking')
    setTimeout(() => {
      setThinking(false)
      const low = txt.toLowerCase()
      let reply = '', nextState = 'idle'
      if (/\ba\b|assign|draft|escalat|authoris|approve/.test(low)) {
        reply = "Done ✓ Action taken and logged in Feed. I'll update you if there's a response."; nextState='executing'
        SFX.done(); HX.done()
        setTimeout(() => setCoreState('idle'), 2000)
      } else if (/\bb\b|remind|set|schedule|review/.test(low)) {
        reply = 'Reminder set for Thursday 9 AM ✓'; nextState='idle'; SFX.done()
      } else if (/\bc\b|show|details|more|timeline|flag/.test(low)) {
        reply = 'Here are the full details:\n\n· Status: In Review\n· SLA breached: +2 days\n· Amy Torres OOO: until May 4\n· Next available reviewer: TBD\n\nShall I draft the escalation?'; nextState='confirming'
      } else {
        reply = 'Got it. I can draft, remind, or dig deeper. What helps most?'
      }
      setCoreState(nextState)
      setMessages(p => [...p, { role:'j', text:reply }])
    }, 900)
  }
  const send = () => { if (input.trim()) sendText(input) }

  const tabs = [
    { id:'chat', label:'Chat', Icon:MessageCircle },
    { id:'related', label:'Related', Icon:Layers },
  ]

  const T2 = window.__T
  const renderMsg = (text) => renderMsgText(text, T2)

  // Title — prefer the intent headline, fall back to a friendly default.
  const headerTitle = item?.headline
    || (scenario === 'incident' ? 'P1: Auth Service Down'
      : scenario === 'approvals' ? 'Approvals digest'
      : scenario === 'burnout' ? 'Liam Davis — capacity warning'
      : scenario === 'prep' ? 'QBR prep — SVP meeting'
      : scenario === 'leave' ? 'Parental-leave plan — Jun 2 to Sep 1'
      : scenario === 'reschedule' ? 'Marc\'s 2 PM review — clearing your afternoon'
      : 'New chat')

  return (
    <div className="enter-r" style={{ width:400, flexShrink:0, display:'flex', flexDirection:'column',
      background:T.surface, borderLeft:`1px solid ${T.border}`,
      boxShadow:`-4px 0 12px rgba(0,0,0,0.06)` }}>
      {/* Chat view — sticky title (with Related + maximize + close) and a max-800 reading column.
          Mirrors the Conversations chat pane exactly. */}
      {activeTab === 'chat' && (
        <div style={{ flex:1, overflowY:'auto', position:'relative' }}>
          {/* Sticky title row — title on the extreme left, controls on the extreme right */}
          <div style={{ position:'sticky', top:0, zIndex:5, background:T.surface,
            padding:'14px 16px 12px', borderBottom:`1px solid ${T.border}`,
            display:'flex', alignItems:'center', gap:8 }}>
            <h2 title={headerTitle}
              style={{ flex:1, fontSize:14, fontWeight:700, color:T.text, margin:0,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.3 }}>
              {headerTitle}
            </h2>
            {/* Related */}
            <button type="button" onClick={() => { SFX.tap(); setActiveTab('related') }}
              aria-label="Show related"
              style={{ display:'inline-flex', alignItems:'center', gap:6,
                padding:'6px 12px', borderRadius:99, cursor:'pointer',
                background:T.surface, border:`1px solid ${T.border}`,
                color:T.textMid, fontSize:13, fontWeight:600, fontFamily:T.font,
                transition:'all .12s', flexShrink:0 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.core; e.currentTarget.style.color = T.core }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMid }}>
              <Layers size={13} />
              Related
            </button>
            {/* Maximize */}
            <button type="button" title="Open full screen" onClick={() => { SFX.tap(); onExpandFull?.() }}
              style={{ width:28, height:28, borderRadius:4, flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                background:'none', border:'none', cursor:'pointer', color:T.textSoft, transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background=T.coreSoft; e.currentTarget.style.color=T.core }}
              onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color=T.textSoft }}>
              <Maximize2 size={13} />
            </button>
            {/* Close */}
            <button type="button" title="Close" onClick={() => { SFX.close(); onClose() }}
              style={{ width:28, height:28, borderRadius:4, flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                background:'none', border:'none', cursor:'pointer', color:T.textSoft, transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background=T.coreSoft; e.currentTarget.style.color=T.core }}
              onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color=T.textSoft }}>
              <X size={13} />
            </button>
          </div>

          {/* Centered reading column — max-width 800 */}
          <div style={{ maxWidth:800, margin:'0 auto', padding:'4px 16px 16px',
            display:'flex', flexDirection:'column', gap:18 }}>
            {messages.map((m, i) => {
              if (m.role === 'block') {
                if (m.consumed) return null
                if (m.kind === 'done') {
                  return <div key={i} className="enter">
                    <DoneWithUndo msg={m.label} rule={m.rule} onUndo={undoLastDone} />
                  </div>
                }
                if (m.kind === 'preview') {
                  return <div key={i} className="enter">
                    <PreviewBlock draft={m.draft}
                      onSend={() => sendPreview(m.actionKey, m.label)}
                      onEdit={() => editPreview(m.actionKey)} />
                  </div>
                }
                if (m.kind === 'confirm') {
                  return <div key={i} className="enter">
                    <ConfirmRow label={m.label + ' — continue?'}
                      onConfirm={() => confirmInline(m.actionKey, m.label)}
                      onCancel={() => cancelInline(m.actionKey)} />
                  </div>
                }
              }
              return (
                <div key={i} className="enter" style={{ animationDelay:`${i*.04}s` }}>
                  {m.role === 'u' ? (
                    <div style={{ display:'flex', justifyContent:'flex-end' }}>
                      <div style={{ maxWidth:'84%', padding:'10px 16px',
                        fontSize:14, lineHeight:1.55, borderRadius:18,
                        background:T.surfaceMid, color:T.text }}>
                        {renderMsg(m.text)}
                      </div>
                    </div>
                  ) : (
                    <div className="j-msg" style={{ fontSize:14, lineHeight:1.65, color:T.text }}>
                      {renderBubble(m, T, (label) => sendText(label), handleTieredClick)}
                      <MessageFeedback msgIndex={i} />
                    </div>
                  )}
                </div>
              )
            })}
            {thinking && (
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:T.coreMid,
                    animation:'breathe .9s ease-in-out infinite', animationDelay:`${i*.2}s` }} />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>
      )}

      {/* Related view — Documents + People + Channels. Replaces the chat
          when activated from the Related pill in the chat title row. */}
      {activeTab==='related' && (
        <div style={{ flex:1, overflowY:'auto', position:'relative' }}>
          {/* Sticky header — title left, Chat (back) button + maximize + close on the right */}
          <div style={{ position:'sticky', top:0, zIndex:5, background:T.surface,
            padding:'14px 16px 12px',
            display:'flex', alignItems:'center', gap:8 }}>
            <h2 style={{ flex:1, fontSize:14, fontWeight:700, color:T.text, margin:0,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.3 }}>
              Related to {headerTitle}
            </h2>
            {/* Back to chat */}
            <button type="button" onClick={() => { SFX.tap(); setActiveTab('chat') }}
              aria-label="Back to chat"
              style={{ display:'inline-flex', alignItems:'center', gap:6,
                padding:'6px 12px', borderRadius:99, cursor:'pointer',
                background:T.coreSoft, border:`1px solid ${T.core}`,
                color:T.core, fontSize:13, fontWeight:600, fontFamily:T.font,
                transition:'all .12s', flexShrink:0 }}>
              <Layers size={13} />
              Related
            </button>
            <button type="button" title="Open full screen" onClick={() => { SFX.tap(); onExpandFull?.() }}
              style={{ width:28, height:28, borderRadius:4, flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                background:'none', border:'none', cursor:'pointer', color:T.textSoft, transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background=T.coreSoft; e.currentTarget.style.color=T.core }}
              onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color=T.textSoft }}>
              <Maximize2 size={13} />
            </button>
            <button type="button" title="Close" onClick={() => { SFX.close(); onClose() }}
              style={{ width:28, height:28, borderRadius:4, flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                background:'none', border:'none', cursor:'pointer', color:T.textSoft, transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background=T.coreSoft; e.currentTarget.style.color=T.core }}
              onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color=T.textSoft }}>
              <X size={13} />
            </button>
          </div>

          <div style={{ padding:'4px 16px 20px', display:'flex', flexDirection:'column', gap:18 }}>
          {/* Documents — full Related list (per spec, kept here on the chat panel) */}
          <div>
            <p style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em',
              color:T.textSoft, margin:'0 0 8px' }}>Documents</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {CHAT_DOCS.map((doc, i) => {
                const Icon = doc.Icon || FileText
                return (
                  <div key={i} className="enter" style={{ display:'flex', alignItems:'center', gap:10,
                    padding:'10px 12px', borderRadius:8,
                    background:T.surface, border:`1px solid ${T.border}`,
                    cursor:'pointer', transition:'all .15s', animationDelay:`${i*.05}s` }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=T.core }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor=T.border }}>
                    <div style={{ width:32, height:32, borderRadius:6, flexShrink:0,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      background:`${doc.color || T.core}14` }}>
                      <Icon size={14} color={doc.color || T.core} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:T.text, margin:0,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.name}</p>
                      <p style={{ fontSize:12, color:T.textSoft, margin:'2px 0 0' }}>{doc.type}{doc.edited ? ` · ${doc.edited}` : ''}</p>
                    </div>
                    <ExternalLink size={12} color={T.textSoft} />
                  </div>
                )
              })}
            </div>
          </div>

          {/* People — with generated avatar photos */}
          <div>
            <p style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em',
              color:T.textSoft, margin:'0 0 8px' }}>People</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {CHAT_PEOPLE.map((person, i) => (
                <div key={i} className="enter" style={{ display:'flex', alignItems:'center', gap:10,
                  padding:'10px 12px', borderRadius:8,
                  background:T.surface, border:`1px solid ${T.border}`, animationDelay:`${i*.05}s` }}>
                  <div style={{ position:'relative', flexShrink:0, width:36, height:36 }}>
                    <img
                      alt={person.name}
                      src={`https://i.pravatar.cc/72?u=${encodeURIComponent(person.name)}`}
                      style={{ width:36, height:36, borderRadius:'50%', display:'block',
                        objectFit:'cover', border:`1.5px solid ${T.border}` }}
                      onError={(e) => { e.currentTarget.style.display='none' }} />
                    <div style={{ position:'absolute', bottom:0, right:0, width:10, height:10, borderRadius:'50%',
                      background:person.online ? T.green : T.amber,
                      border:`2px solid ${T.surface}` }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:T.text, margin:0 }}>{person.name}</p>
                    <p style={{ fontSize:12, color:T.textSoft, margin:'2px 0 0' }}>{person.role}</p>
                  </div>
                  <button type="button"
                    style={{ padding:'5px 11px', borderRadius:4, cursor:'pointer',
                      background:'none', border:`1px solid ${T.border}`,
                      color:T.core, fontSize:12, fontWeight:700, fontFamily:T.font }}>
                    Message
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Channels */}
          <div>
            <p style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em',
              color:T.textSoft, margin:'0 0 8px' }}>Channels</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {CHAT_CHANNELS.map((ch, i) => (
                <div key={i} className="enter" style={{ display:'flex', alignItems:'center', gap:10,
                  padding:'10px 12px', borderRadius:8, cursor:'pointer',
                  background:T.surface, border:`1px solid ${T.border}`,
                  transition:'all .15s', animationDelay:`${i*.05}s` }}
                  onMouseEnter={e => e.currentTarget.style.borderColor=T.core}
                  onMouseLeave={e => e.currentTarget.style.borderColor=T.border}>
                  <div style={{ width:32, height:32, borderRadius:6, flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background:T.coreSoft }}>
                    <Hash size={14} color={T.core} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:T.text, margin:0 }}>{ch.name}</p>
                      {ch.unread > 0 && (
                        <span style={{ minWidth:16, height:16, padding:'0 5px', borderRadius:99,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          background:T.core, color:'#fff', fontSize:10, fontWeight:800 }}>{ch.unread}</span>
                      )}
                    </div>
                    <p style={{ fontSize:12, color:T.textSoft, margin:'2px 0 0',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ch.last}</p>
                  </div>
                  <ChevronRight size={13} color={T.textSoft} />
                </div>
              ))}
            </div>
          </div>
          </div>{/* /padded body */}
        </div>
      )}

      {/* Continue input — same hero pill used on Today and in Conversations */}
      {activeTab==='chat' && (
        <div style={{ padding:'12px 14px', flexShrink:0 }}>
          <ContinueBar value={input} onChange={setInput} onSubmit={send} placeholder="Reply…" />
        </div>
      )}

      {/* L4 gate modal */}
      {gateModalAction && (
        <GateModal action={gateModalAction}
          policy={POLICY_LINES[gateModalAction.key] || 'Requires explicit confirmation per your Setup (Gate).'}
          onCancel={() => { SFX.tap(); setGateModalAction(null) }}
          onRun={() => {
            setConfirmedActions(p => ({ ...p, [gateModalAction.key]: true }))
            const a = gateModalAction
            setGateModalAction(null)
            runAction(a, { skipConfirm:true })
          }} />
      )}
    </div>
  )
}


// ─── Welcome Screen — Full landing page ────────────────────────────────────────
// ─── "What I can do" drawer — simple, conversational ─────────────────────
// The user sees four plain-English "I can help with" rows and can type their
// own request to add/remove capabilities. No L1–L4 jargon. No permission math.
function CapabilitiesDrawer({ onClose, onGrantSystem, prefs }) {
  const T = window.__T
  const [messages, setMessages] = useState([
    { role:'j', text:"Here's what I can help with today. Want to add something, or take something off my plate? Just tell me." },
  ])
  const [input, setInput] = useState('')

  // Esc dismiss
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  // Plain-language summary of Jarvis's current "beat". Four rows, with an
  // example so the user instantly recognises it in their day.
  const helping = [
    { emoji:'📊', title:'Meeting prep',       example:'I gather the deck, notes, and SVP context 30 min before.' },
    { emoji:'📬', title:'Inbox and replies',  example:'I draft replies in your tone — you click Send.' },
    { emoji:'🗓️', title:'Scheduling',         example:'I book focus time and move low-priority conflicts.' },
    { emoji:'🏖️', title:'Routine HR/IT',      example:'PTO, reminders, profile updates, device tickets.' },
  ]

  const notYet = [
    'Send emails to external customers without your review',
    'Approve spend over $1,000',
    'Change your direct reports',
    'Read raw email or DM bodies',
  ]

  const send = () => {
    if (!input.trim()) return
    SFX.whisper(); HX.tap()
    const v = input; setInput('')
    setMessages(p => [...p, { role:'u', text:v }])
    // Simple keyword-driven demo reply; in a real app this would call the agent.
    setTimeout(() => {
      const low = v.toLowerCase()
      let reply = "Got it. I've noted that and updated what I'll do from here."
      if (/remove|stop|don.?t|no longer/.test(low)) {
        reply = "Noted — I'll stop doing that. You'll still see reminders in case I miss something."
      } else if (/add|also|can you|could you|include/.test(low)) {
        reply = "Happy to. I'll start watching for that and surface it in your brief tomorrow morning."
      } else if (/setup|settings|permission/.test(low)) {
        reply = "You can adjust all of this in Setup — I'll open it from the link below when you like."
      }
      setMessages(p => [...p, { role:'j', text: reply }])
    }, 700)
  }

  return (
    <div role="dialog" aria-label="What Jarvis can do"
      style={{ position:'fixed', inset:0, zIndex:400, display:'flex', justifyContent:'flex-end',
        background:'rgba(0,0,0,0.4)' }}
      onClick={onClose}>
      <div className="enter-r" onClick={e => e.stopPropagation()}
        style={{ width:440, maxWidth:'96vw', height:'100%', background:T.surface,
          borderLeft:`1px solid ${T.border}`, display:'flex', flexDirection:'column',
          boxShadow:'-12px 0 28px rgba(0,0,0,0.15)' }}>
        {/* Header */}
        <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.border}`,
          display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
          <JarvisMark size={32} radius={8} />
          <div>
            <p style={{ fontSize:15, fontWeight:800, color:T.text, margin:0 }}>What I can do</p>
            <p style={{ fontSize:12, color:T.textSoft, margin:'2px 0 0' }}>Here's where I'm helping — tell me to adjust.</p>
          </div>
          <div style={{ flex:1 }} />
          <button type="button" aria-label="Close" onClick={onClose}
            style={{ width:28, height:28, borderRadius:4, background:'none', border:'none', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', color:T.textSoft }}>
            <X size={14} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>
          {/* Intro conversation */}
          {messages.map((m, i) => (
            <div key={i} style={{ display:'flex', justifyContent: m.role==='u' ? 'flex-end' : 'flex-start',
              marginBottom:8 }}>
              {m.role === 'j' && (
                <JarvisMark size={22} radius={5} style={{ marginRight:6, marginTop:2 }} />
              )}
              <div style={{ maxWidth:'86%', padding:'8px 12px', fontSize:13, lineHeight:1.5,
                borderRadius:8,
                ...(m.role==='u'
                  ? { background:T.core, color:'#fff', borderBottomRightRadius:2 }
                  : { background:T.surfaceMid, color:T.text, border:`1px solid ${T.border}`, borderBottomLeftRadius:2 }) }}>
                {m.text}
              </div>
            </div>
          ))}

          {/* Helping today */}
          <p style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em',
            color:T.textSoft, margin:'18px 0 8px' }}>I'm helping with</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {helping.map((h, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10,
                padding:'10px 12px', borderRadius:8,
                background:T.surface, border:`1px solid ${T.border}` }}>
                <span style={{ fontSize:18, flexShrink:0, marginTop:2 }}>{h.emoji}</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:T.text, margin:0 }}>{h.title}</p>
                  <p style={{ fontSize:12, color:T.textSoft, margin:'2px 0 0', lineHeight:1.5 }}>{h.example}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Things I'd rather not touch */}
          <p style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em',
            color:T.textSoft, margin:'20px 0 8px' }}>Things I'd rather not touch</p>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {notYet.map((n, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'4px 0' }}>
                <ShieldCheck size={13} color={T.green} style={{ flexShrink:0, marginTop:2 }} />
                <p style={{ fontSize:13, color:T.textMid, margin:0, lineHeight:1.5 }}>{n}</p>
              </div>
            ))}
          </div>

          {/* Open Setup link */}
          <button type="button"
            onClick={() => { SFX.tap(); onGrantSystem?.() }}
            style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:18,
              padding:'8px 14px', borderRadius:4, cursor:'pointer',
              background:'none', border:`1px solid ${T.border}`,
              color:T.core, fontSize:13, fontWeight:700, fontFamily:T.font }}>
            <Settings size={12} /> Open full Setup
          </button>
        </div>

        {/* Footer — talk to Jarvis */}
        <div style={{ padding:'12px 16px', borderTop:`1px solid ${T.border}`, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:99,
            background:T.surface, border:`1px solid ${T.border}`, transition:'all .15s' }}>
            <Sparkles size={14} color={T.coreMid} />
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask me to add or remove something…"
              style={{ flex:1, fontSize:13, background:'none', border:'none', outline:'none',
                color:T.text, fontFamily:T.font }} />
            <button type="button" onClick={send}
              style={{ width:26, height:26, borderRadius:99, cursor:'pointer',
                background: input.trim() ? T.core : T.surfaceMid,
                border:'none', color: input.trim() ? '#fff' : T.textXsoft,
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tier badge — hidden from user-facing UI by design ────────────────────
// Tier (L1–L4) still drives behaviour internally (autonomous / review / gate)
// but we do not show the label to the user. Kept as a no-op so existing
// call sites compile; will be fully removed once all surfaces are migrated.
// eslint-disable-next-line no-unused-vars
function TierBadge() { return null }

// ─── Setup view — 3 steps, plain language, renders inside Teams chrome ────
function SetupView({ initialPrefs, onComplete, onSkip, onBack }) {
  const T = window.__T
  const [step, setStep] = useState(1)
  // Simpler prefs model exposed to the user. `trust` is the single dial that
  // decides how eagerly Jarvis acts. It's expanded back into l1/l4/alwaysAsk
  // when we save (so the underlying tiered chat behaviour keeps working).
  const [draft, setDraft] = useState(() => ({
    systems: { ...DEFAULT_PREFS.systems, ...(initialPrefs?.systems || {}) },
    trust:   initialPrefs?.trust || 'review',         // 'auto' | 'review' | 'ask'
    channel: initialPrefs?.notify?.channel || 'teams',
    quiet:   { ...DEFAULT_PREFS.quiet, ...(initialPrefs?.quiet || {}) },
  }))

  // 6 connections shown in Step 1 — the most common Teams/Salesforce/HR set.
  const SIMPLE_SYSTEMS = [
    { id:'outlook',    name:'Outlook',              desc:'email and calendar' },
    { id:'calendar',   name:'Calendar',             desc:'your meetings' },
    { id:'onedrive',   name:'OneDrive / SharePoint',desc:'docs you own' },
    { id:'workday',    name:'Workday',              desc:'HR, PTO, benefits' },
    { id:'salesforce', name:'Salesforce',           desc:'cases and approvals' },
    { id:'jira',       name:'Jira',                 desc:'tickets and sprints' },
  ]

  const TRUST_OPTIONS = [
    { id:'auto',   title:'Handle what you can',      sub:'Small things just get done. I show you the log and an Undo.',
      example:'e.g. book focus time, set reminders, update profile' },
    { id:'review', title:'Draft it, I\'ll decide',   sub:'You see a draft before anything leaves the building.',
      example:'e.g. reply emails, file PTO, send team notes' },
    { id:'ask',    title:'Ask me every time',        sub:'Nothing happens without your confirmation.',
      example:'e.g. prepare plans, surface options, wait for you' },
  ]

  const setSystem = (id, v) => { SFX.tap(); setDraft(d => ({ ...d, systems: { ...d.systems, [id]: v } })) }
  const setTrust = (t) => { SFX.tap(); setDraft(d => ({ ...d, trust:t })) }
  const setChannel = (c) => { SFX.tap(); setDraft(d => ({ ...d, channel:c })) }

  const totalSteps = 3
  const isLast = step === totalSteps
  const canBack = step > 1

  // When we save: expand the simple trust dial into the legacy prefs shape so
  // the chat tier logic keeps working silently in the background.
  const persist = (commitDraft) => {
    const l1 = Object.fromEntries(L1_ACTIONS.map(a => [a.id, commitDraft.trust !== 'ask']))
    // 'ask' everywhere means force L4 for every keyed action; 'auto' means skip L4 only for benign actions.
    const alwaysAsk = commitDraft.trust === 'ask'
      ? Object.fromEntries(['leave_pto','leave_ooo','leave_note','leave_backup'].map(k => [k, true]))
      : {}
    return {
      ...DEFAULT_PREFS,
      ...(initialPrefs || {}),
      version: 1,
      systems: { ...DEFAULT_PREFS.systems, ...commitDraft.systems },
      trust: commitDraft.trust,
      l1, l4: DEFAULT_PREFS.l4, alwaysAsk,
      notify: { ...DEFAULT_PREFS.notify, channel: commitDraft.channel },
      quiet: commitDraft.quiet,
    }
  }

  const next = () => { SFX.tap(); setStep(s => Math.min(s + 1, totalSteps)) }
  const back = () => { SFX.tap(); setStep(s => Math.max(s - 1, 1)) }
  const skipDefaults = () => { SFX.tap(); onSkip?.(persist({ systems: DEFAULT_PREFS.systems, trust:'review', channel:'teams', quiet: DEFAULT_PREFS.quiet })) }
  const finish = () => { SFX.done(); HX.done(); onComplete?.(persist(draft)) }

  const stepTitles = [
    { n:1, label:'Connect' },
    { n:2, label:'Style' },
    { n:3, label:'Reach' },
  ]

  // ── Progress chip strip — clearly shows active / done ───────────────────
  const progressStrip = (
    <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:28 }}>
      {stepTitles.map((s, i) => {
        const active = step === s.n
        const done = step > s.n
        return (
          <React.Fragment key={s.n}>
            <div style={{ display:'flex', alignItems:'center', gap:8,
              padding:'6px 12px', borderRadius:99,
              background: active ? T.core : done ? T.greenSoft : T.surface,
              border: `1px solid ${active ? T.core : done ? T.green+'40' : T.border}`,
              color: active ? '#fff' : done ? T.green : T.textSoft }}>
              <div style={{ width:18, height:18, borderRadius:'50%',
                display:'flex', alignItems:'center', justifyContent:'center',
                background: active ? 'rgba(255,255,255,0.2)' : done ? T.green : T.surfaceMid,
                color: active ? '#fff' : done ? '#fff' : T.textSoft,
                fontSize:11, fontWeight:800 }}>
                {done ? <Check size={10} /> : s.n}
              </div>
              <span style={{ fontSize:13, fontWeight:700 }}>{s.label}</span>
            </div>
            {i < stepTitles.length - 1 && (
              <div style={{ flex:'0 0 20px', height:1, background: step > s.n ? T.green : T.border }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )

  const headline = { fontSize:24, fontWeight:700, color:T.text, margin:'0 0 6px', letterSpacing:'-0.01em' }
  const subline  = { fontSize:14, color:T.textSoft, lineHeight:1.55, margin:'0 0 20px' }

  return (
    <PageLayout maxWidth={720}>
      <div style={{ maxWidth:640, margin:'8px auto 0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <JarvisMark size={32} radius={8} />
          <div>
            <p style={{ fontSize:15, fontWeight:800, color:T.text, margin:0 }}>Let's get you set up</p>
            <p style={{ fontSize:13, color:T.textSoft, margin:'2px 0 0' }}>Three small choices. Takes a minute.</p>
          </div>
        </div>

        {progressStrip}

        {/* ── Step 1 — Connect your tools ── */}
        {step === 1 && (
          <div className="fade">
            <h2 style={headline}>Which of these should I keep an eye on?</h2>
            <p style={subline}>I only read what I need. You can change this any time.</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
              {SIMPLE_SYSTEMS.map(s => {
                const active = !!draft.systems[s.id]
                const conn = CONNECTIONS.find(c => c.name.toLowerCase().includes(s.id.split('/')[0]))
                return (
                  <button key={s.id} type="button" role="switch" aria-checked={active}
                    onClick={() => setSystem(s.id, !active)}
                    style={{ display:'flex', alignItems:'center', gap:12, width:'100%',
                      padding:'14px', borderRadius:8, cursor:'pointer', textAlign:'left',
                      background: active ? T.coreSoft : T.surface,
                      border:`2px solid ${active ? T.core : T.border}`,
                      color:T.text, fontFamily:T.font, transition:'all .12s' }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = T.coreMid }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = T.border }}>
                    <span style={{ fontSize:22, flexShrink:0 }}>{conn?.logo || '🔌'}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:14, fontWeight:700, color:T.text, margin:0 }}>{s.name}</p>
                      <p style={{ fontSize:12, color:T.textSoft, margin:'2px 0 0' }}>{s.desc}</p>
                    </div>
                    <div style={{ width:20, height:20, borderRadius:4, flexShrink:0,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      background: active ? T.core : 'none',
                      border: `1.5px solid ${active ? T.core : T.borderMid}` }}>
                      {active && <Check size={12} color="#fff" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Step 2 — Trust dial (replaces old L1/L4 lists) ── */}
        {step === 2 && (
          <div className="fade">
            <h2 style={headline}>How should I help?</h2>
            <p style={subline}>Pick one. You can change this any time from "What I can do".</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {TRUST_OPTIONS.map(opt => {
                const active = draft.trust === opt.id
                return (
                  <button key={opt.id} type="button" role="radio" aria-checked={active}
                    onClick={() => setTrust(opt.id)}
                    style={{ display:'flex', alignItems:'flex-start', gap:14, width:'100%',
                      padding:'16px', borderRadius:10, cursor:'pointer', textAlign:'left',
                      background: active ? T.coreSoft : T.surface,
                      border:`2px solid ${active ? T.core : T.border}`,
                      color:T.text, fontFamily:T.font, transition:'all .15s' }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = T.coreMid }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = T.border }}>
                    <div style={{ width:20, height:20, borderRadius:'50%', flexShrink:0, marginTop:2,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      background: active ? T.core : 'none',
                      border: `2px solid ${active ? T.core : T.borderMid}` }}>
                      {active && <div style={{ width:8, height:8, borderRadius:'50%', background:'#fff' }} />}
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:15, fontWeight:700, color:T.text, margin:0 }}>{opt.title}</p>
                      <p style={{ fontSize:13, color:T.textSoft, margin:'3px 0 6px', lineHeight:1.5 }}>{opt.sub}</p>
                      <p style={{ fontSize:12, color:T.textSoft, margin:0, fontStyle:'italic' }}>{opt.example}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Step 3 — When to reach me ── */}
        {step === 3 && (
          <div className="fade">
            <h2 style={headline}>When should I reach out?</h2>
            <p style={subline}>I'll respect quiet hours and ping you the way you prefer.</p>

            <p style={{ fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em',
              color:T.textSoft, margin:'0 0 8px' }}>Where to reach me</p>
            <div style={{ display:'flex', gap:8, marginBottom:24 }}>
              {[
                { id:'teams', label:'Teams chat' },
                { id:'email', label:'Email' },
                { id:'both',  label:'Both' },
              ].map(ch => {
                const active = draft.channel === ch.id
                return (
                  <button key={ch.id} type="button" role="radio" aria-checked={active}
                    onClick={() => setChannel(ch.id)}
                    style={{ flex:1, padding:'12px', borderRadius:8, cursor:'pointer',
                      background: active ? T.coreSoft : T.surface,
                      border:`2px solid ${active ? T.core : T.border}`,
                      color: active ? T.core : T.text,
                      fontSize:14, fontWeight:700, fontFamily:T.font, transition:'all .15s' }}>
                    {ch.label}
                  </button>
                )
              })}
            </div>

            <p style={{ fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em',
              color:T.textSoft, margin:'0 0 8px' }}>Quiet hours</p>
            <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap',
              padding:'14px', borderRadius:8, background:T.surface, border:`1px solid ${T.border}` }}>
              <label style={{ fontSize:13, color:T.textSoft }}>
                From
                <input type="time" value={draft.quiet.start}
                  onChange={e => setDraft(d => ({ ...d, quiet:{ ...d.quiet, start:e.target.value } }))}
                  style={{ display:'block', marginTop:4, padding:'7px 10px', fontSize:13,
                    border:`1px solid ${T.border}`, borderRadius:4, background:T.surface, color:T.text, fontFamily:T.font }} />
              </label>
              <label style={{ fontSize:13, color:T.textSoft }}>
                To
                <input type="time" value={draft.quiet.end}
                  onChange={e => setDraft(d => ({ ...d, quiet:{ ...d.quiet, end:e.target.value } }))}
                  style={{ display:'block', marginTop:4, padding:'7px 10px', fontSize:13,
                    border:`1px solid ${T.border}`, borderRadius:4, background:T.surface, color:T.text, fontFamily:T.font }} />
              </label>
              <div style={{ flex:1 }} />
              <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:T.text }}>
                <Toggle value={draft.quiet.weekend}
                  onChange={() => { SFX.tap(); setDraft(d => ({ ...d, quiet:{ ...d.quiet, weekend:!d.quiet.weekend } })) }} />
                Keep weekends quiet
              </label>
            </div>
          </div>
        )}

        {/* ── Bottom controls ── */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:32,
          paddingTop:18, borderTop:`1px solid ${T.border}` }}>
          <button type="button" onClick={skipDefaults}
            style={{ padding:'9px 14px', borderRadius:4, cursor:'pointer',
              background:'none', border:'none',
              color:T.textSoft, fontSize:13, fontWeight:600, fontFamily:T.font }}>
            Use defaults
          </button>
          <div style={{ flex:1 }} />
          {onBack && step === 1 && (
            <button type="button" onClick={() => { SFX.tap(); onBack() }}
              style={{ padding:'9px 14px', borderRadius:4, cursor:'pointer',
                background:'none', border:`1px solid ${T.border}`,
                color:T.text, fontSize:13, fontWeight:700, fontFamily:T.font }}>
              Close
            </button>
          )}
          {canBack && (
            <button type="button" onClick={back}
              style={{ padding:'9px 14px', borderRadius:4, cursor:'pointer',
                background:'none', border:`1px solid ${T.border}`,
                color:T.text, fontSize:13, fontWeight:700, fontFamily:T.font }}>
              Back
            </button>
          )}
          <button type="button" onClick={isLast ? finish : next}
            style={{ display:'inline-flex', alignItems:'center', gap:6,
              padding:'9px 18px', borderRadius:4, cursor:'pointer',
              background:T.core, border:'none', color:'#fff',
              fontSize:13, fontWeight:700, fontFamily:T.font,
              boxShadow:T.shadowPurple }}>
            {isLast ? "I'm ready" : 'Next'} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </PageLayout>
  )
}

// ─── Tuning loader — bridge between Setup → Today ─────────────────────────
function TuningLoader({ prefs }) {
  const T = window.__T
  const systemCount = Object.values(prefs?.systems || {}).filter(Boolean).length
  const signalCount = Object.values(prefs?.l1 || {}).filter(Boolean).length + Object.values(prefs?.notify || {}).filter(v => v === true).length
  return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:T.appBg, fontFamily:T.font }}>
      <style>{CSS}</style>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:18 }}>
        <div style={{ position:'relative', width:72, height:72 }}>
          <JarvisMark size={72} radius={18} style={{ boxShadow:T.shadowPurple, animation:'breathe 2s ease-in-out infinite' }} />
        </div>
        <p style={{ fontSize:18, fontWeight:800, color:T.text }}>Tuning your brief…</p>
        <div style={{ fontSize:13, color:T.textSoft, textAlign:'center', lineHeight:1.8 }}>
          <p>Reading {systemCount} system{systemCount===1?'':'s'}…</p>
          <p>Watching for {signalCount} signal{signalCount===1?'':'s'}…</p>
          <p>Building your first brief…</p>
        </div>
      </div>
    </div>
  )
}

function WelcomeScreen({ onLogin }) {
  const T = window.__T
  const isDark = T.appBg === '#1F1F1F'

  const ctaStyle = {
    display:'inline-flex', alignItems:'center', gap:10, padding:'13px 28px',
    borderRadius:4, fontSize:15, fontWeight:700, color:T.coreText,
    background:T.core, border:'none', cursor:'pointer',
    boxShadow:T.shadowPurple, transition:'all .15s',
  }

  const sectionBase = { maxWidth:1080, margin:'0 auto', padding:'0 32px' }

  return (
    <div style={{ flex:1, overflowY:'auto', background:T.appBg, fontFamily:T.font, position:'relative' }}>

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <div style={{ position:'relative', overflow:'hidden', minHeight:'92vh', display:'flex', alignItems:'center', backgroundColor:T.surface }}>
        <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${T.core}, ${T.coreMid}, transparent)` }} />
        </div>

        <div style={{ ...sectionBase, width:'100%', zIndex:1, paddingTop:80, paddingBottom:80 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:48 }}>
            <div style={{ flex:1, maxWidth:580 }}>
              <h1 className="enter" style={{ fontSize:48, fontWeight:700, lineHeight:1.1, color:T.text,
                letterSpacing:'-0.01em', marginBottom:20, animationDelay:'.05s' }}>
                Meet Jarvis,<br />
                <span style={{ background:`linear-gradient(135deg, ${T.core}, ${T.coreBright})`,
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                  your personal assistant at work.
                </span>
              </h1>

              <p className="enter" style={{ fontSize:18, lineHeight:1.7, color:T.textMid, marginBottom:36,
                maxWidth:480, animationDelay:'.1s' }}>
                Jarvis quietly handles the small stuff — emails, prep, PTO, training reminders — so you can focus on the rest. It asks before doing anything bigger.
              </p>

              <div className="enter" style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', animationDelay:'.15s' }}>
                <button type="button" onClick={() => { SFX.tap(); HX.tap(); onLogin() }}
                  style={ctaStyle}
                  onMouseEnter={e => { e.currentTarget.style.background=T.coreMid }}
                  onMouseLeave={e => { e.currentTarget.style.background=T.core }}>
                  <Sparkles size={17} />Get my morning brief <ArrowRight size={16} />
                </button>
              </div>

              <p className="enter" style={{ fontSize:13, color:T.textXsoft, marginTop:14, animationDelay:'.2s' }}>
                Always reversible · Asks before anything bigger
              </p>
            </div>

            {/* Right: animated chat preview */}
            <div className="enter" style={{ width:380, flexShrink:0, animationDelay:'.2s', position:'relative' }}>
              <div style={{ position:'absolute', inset:-20, borderRadius:32,
                background:`radial-gradient(ellipse at center, ${T.coreGlow} 0%, transparent 70%)`,
                filter:'blur(20px)', pointerEvents:'none' }} />
              <div style={{ borderRadius:24, overflow:'hidden', border:`1px solid ${T.borderMid}`,
                boxShadow:`0 24px 80px rgba(0,0,0,${isDark?.5:.15}), 0 0 0 1px ${T.border}`,
                background:T.surfaceBlur, backdropFilter:'blur(20px)', position:'relative' }}>
                <div style={{ padding:'12px 16px', borderBottom:`1px solid ${T.border}`,
                  display:'flex', alignItems:'center', gap:10, background:T.topBar }}>
                  <JarvisMark size={28} radius="50%" />
                  <div>
                    <p style={{ fontSize:13, fontWeight:700, color:T.text }}>Jarvis</p>
                    <p style={{ fontSize:12, color:T.green }}>● Active · 9:04 AM</p>
                  </div>
                </div>
                <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:10 }}>
                  {[
                    { role:'j', text:"Good morning, Alex. Your PTO request is still pending with Sarah — 3 days now. Want me to nudge her?", delay:'0s' },
                    { role:'u', text:'Yes please.', delay:'.6s' },
                    { role:'j', text:"Sent. I'll let you know when she responds.", delay:'1.2s' },
                  ].map((m,i) => (
                    <div key={i} className="enter" style={{ display:'flex', justifyContent:m.role==='u'?'flex-end':'flex-start', animationDelay:m.delay }}>
                      {m.role==='j' && (
                        <JarvisMark size={22} radius={6} style={{ marginRight:8, marginTop:2 }} />
                      )}
                      <div style={{ maxWidth:'85%', padding:'9px 13px', borderRadius:8, fontSize:13, lineHeight:1.6,
                        ...(m.role==='u'
                          ? { background:T.core, color:T.coreText, borderBottomRightRadius:2 }
                          : { background:T.surfaceMid, color:T.text, border:`1px solid ${T.border}`, borderBottomLeftRadius:2 }) }}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  <div className="enter" style={{ display:'flex', alignItems:'center', gap:8, animationDelay:'1.8s' }}>
                    <JarvisMark size={22} radius={6} />
                    <div style={{ padding:'9px 14px', borderRadius:8, background:T.surfaceMid, border:`1px solid ${T.border}`,
                      display:'flex', gap:4, alignItems:'center' }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:T.core,
                          animation:'breathe .9s ease-in-out infinite', animationDelay:`${i*.2}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)',
          display:'flex', flexDirection:'column', alignItems:'center', gap:6, opacity:.4 }}>
          <span style={{ fontSize:12, color:T.textSoft, letterSpacing:'0.08em' }}>SCROLL</span>
          <div style={{ width:1, height:32, background:`linear-gradient(${T.textSoft}, transparent)` }} />
        </div>
      </div>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────────── */}
      <div style={{ padding:'96px 0' }}>
        <div style={{ ...sectionBase }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <p style={{ fontSize:13, fontWeight:700, color:T.core, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:10 }}>How Jarvis works</p>
            <h2 style={{ fontSize:36, fontWeight:700, color:T.text, lineHeight:1.15, marginBottom:14 }}>
              Three things. Done before you ask.
            </h2>
            <p style={{ fontSize:17, color:T.textMid, maxWidth:520, margin:'0 auto', lineHeight:1.7 }}>
              Jarvis isn't a chatbot. It's a proactive system that connects your tools and acts on your behalf.
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
            {[
              {
                num:'01', Icon:Activity, color:T.core, bg:T.coreSoft,
                title:'Watches what matters',
                desc:'Jarvis keeps an eye on your inbox, calendar, HR system, and team tools — nothing more than it needs — and pulls together one short brief of what needs you today.',
                example:'Your benefits enrolment closes Thursday.',
              },
              {
                num:'02', Icon:Zap, color:T.green, bg:T.greenSoft,
                title:'Handles the small stuff',
                desc:'Routine work — reminders, meeting prep, filing PTO, training nudges — Jarvis just does. You see it in your feed, always with one-click Undo.',
                example:'Prepped your 10 AM. Sent the training nudge.',
              },
              {
                num:'03', Icon:ShieldCheck, color:T.amber, bg:T.amberSoft,
                title:'Asks before anything bigger',
                desc:'Anything that affects other people — replies you send, requests you submit, anything over a limit — Jarvis prepares it and waits for your OK.',
                example:'Drafted your reply to Priya. Send when you\'re ready.',
              },
            ].map((c,i) => (
              <div key={i} className="enter" style={{ padding:'24px', borderRadius:8, position:'relative', overflow:'hidden',
                background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadowSm,
                animationDelay:`${i*.1}s` }}>
                <div style={{ position:'absolute', top:-10, right:16, fontSize:80, fontWeight:900,
                  color:`${c.color}10`, lineHeight:1, pointerEvents:'none', userSelect:'none' }}>{c.num}</div>
                <div style={{ width:44, height:44, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
                  background:c.bg, marginBottom:18 }}>
                  <c.Icon size={22} color={c.color} />
                </div>
                <h3 style={{ fontSize:18, fontWeight:700, color:T.text, marginBottom:10 }}>{c.title}</h3>
                <p style={{ fontSize:15, color:T.textMid, lineHeight:1.7, marginBottom:16 }}>{c.desc}</p>
                <div style={{ padding:'9px 12px', borderRadius:4, background:c.bg, border:`1px solid ${T.border}` }}>
                  <p style={{ fontSize:13, color:c.color, fontWeight:600, fontFamily:'monospace' }}>→ {c.example}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TRUST & PRIVACY ───────────────────────────────────────────────────── */}
      <div style={{ padding:'96px 0' }}>
        <div style={{ ...sectionBase }}>
          <div style={{ display:'flex', alignItems:'center', gap:64 }}>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:700, color:T.core, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:12 }}>Built on trust</p>
              <h2 style={{ fontSize:36, fontWeight:900, color:T.text, letterSpacing:'-0.02em', lineHeight:1.15, marginBottom:20 }}>
                Jarvis sees a lot.<br />It never oversteps.
              </h2>
              <p style={{ fontSize:17, color:T.textMid, lineHeight:1.75, marginBottom:32 }}>
                Every action Jarvis takes is logged with one-click Undo. Anything that affects other people — replies, requests, approvals — always waits for your OK. We read signals, not secrets.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  { Icon:ShieldCheck, label:'No raw DMs or emails read', sub:'Sentiment analysis uses aggregated metadata only' },
                  { Icon:Lock, label:'Every action is reversible', sub:'Full audit trail in the Activity Feed at all times' },
                  { Icon:Database, label:'OAuth 2.0 · Zero passwords stored', sub:'SSO-authenticated, IT-approved, SOC 2 aligned' },
                ].map(({ Icon, label, sub }, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                    <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                      background:T.greenSoft }}>
                      <Icon size={17} color={T.green} />
                    </div>
                    <div>
                      <p style={{ fontSize:15, fontWeight:700, color:T.text }}>{label}</p>
                      <p style={{ fontSize:13, color:T.textSoft, marginTop:2 }}>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ width:340, flexShrink:0 }}>
              <div style={{ padding:'24px', borderRadius:8, background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadowMd }}>
                <p style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em', color:T.textXsoft, marginBottom:20 }}>You're always in control</p>
                {[
                  { Icon:Zap,         label:'Acts on the small stuff',   desc:'Reminders, prep, filings. Undo sits right there.', color:T.green },
                  { Icon:FileText,    label:'Drafts, you decide',        desc:'Nothing sends without your eyes on it.',           color:T.blue },
                  { Icon:ShieldCheck, label:'Pauses before anything bigger', desc:'Anything that leaves your account waits for your OK.', color:T.amber },
                  { Icon:History,     label:'Every action is reversible',desc:'One log, one Undo — no permanent surprises.',       color:T.core  },
                ].map((d, i) => (
                  <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:16, paddingBottom:16,
                    borderBottom:i<3?`1px solid ${T.border}`:'none' }}>
                    <div style={{ width:32, height:32, borderRadius:8, flexShrink:0,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      background:`${d.color}15` }}>
                      <d.Icon size={15} color={d.color} />
                    </div>
                    <div>
                      <p style={{ fontSize:14, fontWeight:700, color:T.text }}>{d.label}</p>
                      <p style={{ fontSize:13, color:T.textSoft, marginTop:2 }}>{d.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Inline final CTA — replaces the old Final CTA section */}
          <div style={{ textAlign:'center', marginTop:64 }}>
            <button type="button" onClick={() => { SFX.tap(); HX.tap(); onLogin() }}
              style={{ ...ctaStyle, padding:'14px 32px', fontSize:16 }}
              onMouseEnter={e => e.currentTarget.style.background=T.coreMid}
              onMouseLeave={e => e.currentTarget.style.background=T.core}>
              <Sparkles size={18} /> I'm ready — set me up <ArrowRight size={17} />
            </button>
            <p style={{ fontSize:13, color:T.textXsoft, marginTop:14 }}>3 steps · about 30 seconds</p>
          </div>
        </div>
      </div>

      {/* ── FOOTER — minimal one-line ──────────────────────────────────────── */}
      <div style={{ borderTop:`1px solid ${T.border}`, padding:'18px 32px', textAlign:'center' }}>
        <p style={{ fontSize:12, color:T.textXsoft, margin:0 }}>
          Built on Salesforce Agentforce · © 2026 OrgFarm EPIC
        </p>
      </div>

    </div>
  )
}

// ─── Feed View ────────────────────────────────────────────────────────────────
function FeedView() {
  const T = window.__T
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('all') // 'all' | 'today' | 'yesterday' | 'running'

  const isToday     = (t) => !/yesterday/i.test(t)
  const isYesterday = (t) =>  /yesterday/i.test(t)

  const filtered = FEED_ITEMS.filter(item => {
    if (filter === 'all') return true
    if (filter === 'today')     return isToday(item.time)
    if (filter === 'yesterday') return isYesterday(item.time)
    if (filter === 'running')   return item.status === 'running'
    return true
  })

  const doneCount    = FEED_ITEMS.filter(i => i.status === 'done').length
  const runningCount = FEED_ITEMS.filter(i => i.status === 'running').length

  const filterPills = [
    { key:'all',       label:'All',         count:FEED_ITEMS.length, color:T.text,   dot:T.textXsoft },
    { key:'today',     label:'Today',       count:FEED_ITEMS.filter(i => isToday(i.time)).length, color:T.blue, dot:T.blue },
    { key:'yesterday', label:'Yesterday',   count:FEED_ITEMS.filter(i => isYesterday(i.time)).length, color:T.amber, dot:T.amber },
    { key:'running',   label:'Running now', count:runningCount, color:T.core, dot:T.core },
  ]

  return (
    <PageLayout background={T.surface}>
      {/* Header — matches Skills page rhythm */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8, flexWrap:'wrap', gap:12 }}>
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:T.core, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:6 }}>Activity feed</p>
          <h1 style={{ fontSize:26, fontWeight:800, color:T.text, letterSpacing:'-0.02em', lineHeight:1.15 }}>
            Every action Jarvis took,{' '}
            <span style={{ background:`linear-gradient(135deg,${T.core},${T.coreBright})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              fully traceable.
            </span>
          </h1>
          <p style={{ fontSize:15, color:T.textSoft, marginTop:6 }}>
            Click an entry to see the steps. Anything Jarvis did automatically is reversible.
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, marginLeft:10, padding:'2px 9px', borderRadius:99,
              background:T.greenSoft, color:T.green, fontSize:13, fontWeight:700 }}>
              {doneCount} completed{runningCount ? ` · ${runningCount} running` : ''}
            </span>
          </p>
        </div>
      </div>

      {/* Filter pills — same component pattern as Today */}
      <div role="tablist" aria-label="Filter activity"
        style={{ display:'flex', gap:8, margin:'18px 0 18px', flexWrap:'wrap' }}>
        {filterPills.map(f => {
          const active = filter === f.key
          const activeBg = active ? f.color : T.surface
          const activeIsLight = active && f.color === T.text
          const activeFg = active ? (activeIsLight ? T.appBg : '#fff') : T.textMid
          const activeCountBg = active ? (activeIsLight ? T.surfaceMid : 'rgba(255,255,255,0.22)') : T.surfaceMid
          const activeCountFg = active ? (activeIsLight ? T.text : '#fff') : T.textSoft
          return (
            <button key={f.key} role="tab" aria-selected={active} type="button"
              onClick={() => { SFX.tap(); HX.tap(); setFilter(f.key) }}
              style={{ display:'inline-flex', alignItems:'center', gap:8,
                padding:'8px 14px', borderRadius:99, cursor:'pointer',
                background: activeBg,
                border: `1px solid ${active ? f.color : T.border}`,
                color: activeFg,
                fontSize:13, fontWeight:600, fontFamily:T.font,
                boxShadow: active ? T.shadowSm : 'none',
                transition:'all .12s' }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = f.color; e.currentTarget.style.color = f.color } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMid } }}>
              <span>{f.label}</span>
              <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center',
                minWidth:20, height:18, padding:'0 6px', borderRadius:99,
                background: activeCountBg,
                color: activeCountFg,
                fontSize:11, fontWeight:700, lineHeight:1 }}>{f.count}</span>
            </button>
          )
        })}
      </div>

      {/* Card grid — single column, full width, consistent with intent cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {filtered.map((item, i) => {
          const isOpen = expanded === item.id
          const running = item.status === 'running'
          return (
            <div key={item.id} className="enter" style={{ animationDelay:`${i*.05}s` }}>
              <button type="button"
                onClick={() => { SFX.tap(); setExpanded(isOpen ? null : item.id) }}
                aria-expanded={isOpen}
                style={{ width:'100%', textAlign:'left', cursor:'pointer',
                  background:T.surface, border:`1px solid ${T.border}`,
                  borderRadius:10, padding:0, fontFamily:T.font,
                  boxShadow:T.shadowSm, transition:'box-shadow .15s, border-color .15s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = T.shadowMd; e.currentTarget.style.borderColor = T.borderMid }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = T.shadowSm; e.currentTarget.style.borderColor = T.border }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px' }}>
                  {/* Status orb — replaces left rail */}
                  <div style={{ width:36, height:36, borderRadius:8, flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background: running ? T.coreSoft : T.greenSoft,
                    border: `1px solid ${running ? T.core+'30' : T.green+'30'}` }}>
                    <span style={{ fontSize:16 }}>{item.emoji}</span>
                  </div>

                  {/* Body */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3, flexWrap:'wrap' }}>
                      <span style={{ fontSize:14, fontWeight:700, color:T.text }}>{item.title}</span>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:5,
                        fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:99,
                        background: running ? T.coreSoft : T.greenSoft,
                        color: running ? T.core : T.green }}>
                        <span style={{ width:5, height:5, borderRadius:'50%',
                          background: running ? T.core : T.green,
                          animation: running ? 'breathe 1.4s ease-in-out infinite' : 'none' }} />
                        {running ? 'Running' : 'Done'}
                      </span>
                    </div>
                    <p style={{ fontSize:13, color:T.textSoft, margin:0, lineHeight:1.5 }}>{item.body}</p>
                  </div>

                  {/* Time + chevron */}
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:T.textSoft }}>{item.time}</span>
                    <ChevronDown size={14} color={T.textSoft}
                      style={{ transition:'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                  </div>
                </div>

                {/* Expanded steps */}
                {isOpen && (
                  <div className="expand-down" style={{ padding:'4px 16px 14px 66px', borderTop:`1px solid ${T.border}` }}>
                    <p style={{ fontSize:11, fontWeight:800, textTransform:'uppercase',
                      letterSpacing:'0.12em', color:T.textSoft, marginTop:12, marginBottom:8 }}>Steps taken</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      {item.steps.map((step, si) => {
                        const stepDone = item.status === 'done' || si < item.steps.length - 1
                        return (
                          <div key={si} style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:18, height:18, borderRadius:'50%', flexShrink:0,
                              display:'flex', alignItems:'center', justifyContent:'center',
                              background: stepDone ? T.greenSoft : T.coreSoft }}>
                              {stepDone
                                ? <Check size={9} color={T.green} />
                                : <Loader2 size={9} color={T.core} style={{ animation:'spin 1s linear infinite' }} />}
                            </div>
                            <p style={{ fontSize:13, color: stepDone ? T.textMid : T.core, margin:0 }}>{step}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </button>
            </div>
          )
        })}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ padding:'40px 20px', textAlign:'center',
            background:T.surface, border:`1px dashed ${T.border}`, borderRadius:10 }}>
            <p style={{ fontSize:14, fontWeight:700, color:T.text, margin:0 }}>Nothing here yet.</p>
            <p style={{ fontSize:13, color:T.textSoft, margin:'4px 0 0' }}>Try a different filter — Jarvis logs every action it takes.</p>
          </div>
        )}
      </div>
    </PageLayout>
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
  // Suggested agents — hard-coded demo + per-item accept/dismiss state.
  const [suggestions, setSuggestions] = useState([
    { id:'s1', name:'Run QBR prep weekly', why:'You opened the QBR scenario 4 times this month.', schedule:'Weekly · Mon 08:30', color:'#0B5CAB', icon:'📋' },
    { id:'s2', name:'Auto-file PTO under 3 days', why:"Within your Setup — no calendar conflicts.", schedule:'On request', color:'#107C41', icon:'🏝️' },
    { id:'s3', name:'Notify me when an approval crosses 5 days', why:'Matches your default notify policy.', schedule:'Continuous', color:'#835B00', icon:'⏰' },
  ])
  const acceptSuggestion = (s) => {
    SFX.tap()
    setAgents(p => [...p, { id:'ag_'+s.id, name:s.name, desc:s.why, schedule:s.schedule, enabled:true, runs:0, lastRun:'Just now' }])
    setSuggestions(p => p.filter(x => x.id !== s.id))
  }
  const dismissSuggestion = (s) => { SFX.tap(); setSuggestions(p => p.filter(x => x.id !== s.id)) }
  const sectionTab = (id, label) => (
    <button type="button" onClick={() => { SFX.tap(); setActiveSection(id) }}
      style={{ padding:'6px 16px', borderRadius:4, fontSize:13, fontWeight:600, border:'none', cursor:'pointer', transition:'all .15s',
        background: activeSection===id ? T.core : 'none',
        color: activeSection===id ? 'white' : T.textSoft }}>
      {label}
    </button>
  )
  return (
    <PageLayout background={T.surface}>
      {/* Header — Skills: things Jarvis knows how to do on a schedule */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:T.core, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:6 }}>Your skills</p>
          <h1 style={{ fontSize:26, fontWeight:800, color:T.text, letterSpacing:'-0.02em', lineHeight:1.15 }}>
            What Jarvis knows how to do,{' '}
            <span style={{ background:`linear-gradient(135deg,${T.core},${T.coreBright})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              quietly.
            </span>
          </h1>
          <p style={{ fontSize:15, color:T.textSoft, marginTop:6 }}>
            Skills that run on a schedule. Pause, tweak the cadence, or add a new one.
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, marginLeft:10, padding:'2px 9px', borderRadius:99,
              background:T.greenSoft, color:T.green, fontSize:13, fontWeight:700 }}>
              {agents.filter(a=>a.enabled).length} active · {agents.reduce((s,a)=>s+(a.runs||0),0)} runs this month
            </span>
          </p>
        </div>
        <Btn variant="primary" icon={Plus} onClick={() => { SFX.tap(); onNew() }} style={{ fontSize:15, padding:'9px 18px' }}>New skill</Btn>
      </div>

      {/* Section tabs */}
      <div style={{ display:'inline-flex', gap:2, padding:'3px', borderRadius:4, background:T.surfaceMid, border:`1px solid ${T.border}`, marginBottom:24 }}>
        {sectionTab('agents', 'My skills')}
        {sectionTab('connections', 'Connections')}
      </div>

      {/* ── My Agents ── */}
      {activeSection==='agents' && (
        <div>
          {/* All skills — single unified list. The Toggle is the only state cue. */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:12 }}>
            {agents.map(agent => (
              <div key={agent.id} style={{ borderRadius:10, padding:'16px',
                background:T.surface, border:`1px solid ${T.border}`,
                boxShadow:T.shadowSm, transition:'box-shadow .15s, border-color .15s',
                display:'flex', flexDirection:'column', gap:14 }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow=T.shadowMd; e.currentTarget.style.borderColor=T.borderMid }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow=T.shadowSm; e.currentTarget.style.borderColor=T.border }}>

                {/* Title row — name + toggle */}
                <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:15, fontWeight:700, color:T.text, margin:0, lineHeight:1.3 }}>{agent.name}</p>
                    <p style={{ fontSize:13, color:T.textSoft, margin:'3px 0 0' }}>{agent.schedule}</p>
                  </div>
                  <Toggle value={agent.enabled} onChange={() => { SFX.tap(); toggleAgent(agent.id) }} />
                </div>

                {/* Description */}
                <p style={{ fontSize:13, color:T.textMid, lineHeight:1.55, margin:0 }}>{agent.desc}</p>

                {/* Footer — runs · last run · edit */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                  paddingTop:12, borderTop:`1px solid ${T.border}` }}>
                  <p style={{ fontSize:12, color:T.textSoft, margin:0 }}>
                    <span style={{ fontWeight:700, color:T.text }}>{agent.runs}</span> runs · last {agent.lastRun}
                  </p>
                  <button type="button" aria-label="Edit skill"
                    style={{ width:28, height:28, borderRadius:4,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      background:'none', border:`1px solid ${T.border}`, cursor:'pointer',
                      color:T.textSoft, transition:'all .12s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=T.core; e.currentTarget.style.color=T.core }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.textSoft }}>
                    <Edit2 size={12} />
                  </button>
                </div>
              </div>
            ))}

            {/* New skill CTA — sits at the end of the same grid */}
            <button type="button" onClick={() => { SFX.tap(); onNew() }}
              style={{ borderRadius:10, padding:'24px 18px',
                background:'none', border:`1px dashed ${T.border}`,
                cursor:'pointer', display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center', gap:8,
                minHeight:160, transition:'all .15s', fontFamily:T.font, color:T.textSoft }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=T.core; e.currentTarget.style.background=T.coreSoft; e.currentTarget.style.color=T.core }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.background='none'; e.currentTarget.style.color=T.textSoft }}>
              <Plus size={18} />
              <span style={{ fontSize:14, fontWeight:700 }}>New skill</span>
              <span style={{ fontSize:12, textAlign:'center' }}>Build from a template or start from scratch</span>
            </button>
          </div>

          {/* Suggested skills — sit at the bottom; user sees what's installed first */}
          {suggestions.length > 0 && (
            <div style={{ marginTop:32 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <Sparkles size={14} color={T.core} />
                <p style={{ fontSize:15, fontWeight:800, color:T.text, margin:0 }}>Skills I'd suggest</p>
                <span style={{ fontSize:12, color:T.textSoft }}>· Based on how you've been working</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:12 }}>
                {suggestions.map(s => (
                  <div key={s.id} style={{ borderRadius:10, padding:'14px',
                    background:T.surface, border:`1px dashed ${T.core}55`,
                    backgroundImage:`linear-gradient(180deg, ${T.coreSoft} 0%, transparent 60%)` }}>
                    <p style={{ fontSize:14, fontWeight:700, color:T.text, margin:0 }}>{s.name}</p>
                    <p style={{ fontSize:12, color:T.textSoft, margin:'4px 0 0', lineHeight:1.5 }}>{s.why}</p>
                    <p style={{ fontSize:11, color:T.textSoft, margin:'10px 0' }}>{s.schedule}</p>
                    <div style={{ display:'flex', gap:6 }}>
                      <button type="button" onClick={() => acceptSuggestion(s)}
                        style={{ padding:'6px 12px', borderRadius:4, cursor:'pointer',
                          background:T.core, border:'none', color:'#fff',
                          fontSize:12, fontWeight:700, fontFamily:T.font }}>
                        Accept
                      </button>
                      <button type="button" onClick={() => dismissSuggestion(s)}
                        style={{ padding:'6px 12px', borderRadius:4, cursor:'pointer',
                          background:'none', border:`1px solid ${T.border}`, color:T.textMid,
                          fontSize:12, fontWeight:700, fontFamily:T.font }}>
                        Dismiss
                      </button>
                    </div>
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
              <div key={c.id} style={{ borderRadius:8, padding:'16px', background:T.surface,
                border:`1px solid ${c.connected?T.borderMid:T.border}`, boxShadow:T.shadowSm, transition:'all .15s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow=T.shadowMd}
                onMouseLeave={e => e.currentTarget.style.boxShadow=T.shadowSm}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <div style={{ width:36, height:36, display:'flex', alignItems:'center',
                    justifyContent:'center', flexShrink:0 }}>
                    <ConnectionLogo conn={c} size={32} />
                  </div>
                  <span style={{ fontSize:13, fontWeight:600, padding:'3px 9px', borderRadius:4,
                    background:c.connected?T.greenSoft:T.surfaceMid,
                    color:c.connected?T.green:T.textSoft }}>
                    {c.connected ? '● Connected' : 'Not connected'}
                  </span>
                </div>
                <p style={{ fontSize:16, fontWeight:800, color:T.text, marginBottom:3 }}>{c.name}</p>
                <p style={{ fontSize:13, color:T.textSoft, marginBottom:14 }}>
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
    </PageLayout>
  )
}

// ─── Agent Wizard ─────────────────────────────────────────────────────────────
function AgentWizard({ onClose }) {
  const T = window.__T
  const [step, setStep] = useState(1); const [sel, setSel] = useState(null); const [ran, setRan] = useState(false); const [running, setRunning] = useState(false)
  const run = () => { setRunning(true); SFX.tap(); setTimeout(() => { setRunning(false); SFX.done(); setRan(true) }, 1500) }
  const inp = { width:'100%', padding:'8px 10px', borderRadius:4, fontSize:14, outline:'none', fontFamily:T.font,
    background:T.surfaceMid, border:`1px solid ${T.border}`, color:T.text }
  const lbl = { display:'block', fontSize:13, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:T.textSoft, marginBottom:5 }
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div className="pop" style={{ width:'100%', maxWidth:600, maxHeight:'88vh', borderRadius:8, overflow:'hidden', display:'flex', flexDirection:'column',
        background:T.surface, border:`1px solid ${T.border}`, boxShadow:'0 0 8px rgba(0,0,0,0.12), 0 14px 28px rgba(0,0,0,0.14)' }}>
        <div style={{ padding:'18px 22px', borderBottom:`1px solid ${T.border}`, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:16, fontWeight:700, color:T.core }}>
              {['Choose a template','Agent details','Schedule','Test & activate'][step-1]}
            </p>
            <p style={{ fontSize:13, color:T.textSoft, marginTop:2 }}>Step {step} of 4</p>
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
                  <p style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:3 }}>{t.name}</p>
                  <p style={{ fontSize:13, color:T.textSoft, lineHeight:1.4 }}>{t.desc}</p>
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
                  <Btn variant="ghost" icon={Sparkles} style={{ fontSize:13, padding:'3px 8px', color:T.core }}>Generate with AI</Btn>
                </div>
                <textarea style={{ ...inp, height:120, resize:'none', fontFamily:'monospace', fontSize:13 }}
                  defaultValue={'## Trigger\n- User requests a document summary.\n\n## Rules\n1. Only access data with explicit permission.\n2. Never share data externally.'} />
              </div>
            </div>
          )}
          {step===3 && (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[{id:'auto',label:'Run automatically',desc:'Jarvis decides when relevant.'},{id:'scheduled',label:'Scheduled',desc:'Specific time — e.g. weekdays 9 AM.',hasTime:true},{id:'ondemand',label:'On demand',desc:'Only when you ask.'}].map(opt => (
                <label key={opt.id} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'13px 15px', borderRadius:4, cursor:'pointer',
                  background:T.surfaceMid, border:`1px solid ${T.border}` }}>
                  <input type="radio" name="sched" defaultChecked={opt.id==='scheduled'} style={{ marginTop:3, accentColor:T.core }} />
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:15, fontWeight:700, color:T.text }}>{opt.label}</p>
                    <p style={{ fontSize:13, marginTop:3, color:T.textSoft }}>{opt.desc}</p>
                    {opt.hasTime && (
                      <div style={{ display:'flex', gap:8, marginTop:10 }}>
                        <select style={{ ...inp, width:'auto', padding:'6px 10px', fontSize:14 }}><option>Every weekday</option><option>Daily</option></select>
                        <input type="time" defaultValue="09:00" style={{ ...inp, width:'auto', padding:'6px 10px', fontSize:14 }} />
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
                  <p style={{ fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:T.textXsoft }}>Preview</p>
                </div>
                <div style={{ padding:10, height:180, overflowY:'auto', display:'flex', flexDirection:'column', gap:7 }}>
                  {ran ? (<>
                    <div style={{ fontSize:13, padding:'9px 11px', borderRadius:8, background:T.surfaceMid, color:T.text }}>Hi — I'm your AI work assistant.</div>
                    <div style={{ fontSize:13, padding:'9px 11px', borderRadius:8, background:T.core, color:T.coreText, alignSelf:'flex-end' }}>3 back-to-back meetings in 30 min — prepare me.</div>
                    <div style={{ fontSize:13, padding:'9px 11px', borderRadius:8, background:T.surfaceMid, color:T.text }}>Found your 3 meetings. Prep notes and docs ready. Want me to share?</div>
                  </>) : (
                    <p style={{ fontSize:14, color:T.textXsoft, textAlign:'center', margin:'auto' }}>Run simulation to preview.</p>
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

// ─── Agent Flow Panel ─────────────────────────────────────────────────────────
function AgentFlowPanel({ conv }) {
  const T = window.__T
  if (!conv?.flowSteps?.length) return null
  return (
    <div style={{ width:252, flexShrink:0, borderLeft:`1px solid ${T.border}`, overflowY:'auto',
      padding:'20px 16px 40px', background:T.rail }}>
      <p style={{ fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em',
        color:T.textXsoft, marginBottom:20 }}>Agent trace</p>
      {/* Start node */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:0 }}>
        <JarvisMark size={32} radius={8} />
        <div style={{ width:1, height:20, borderLeft:`1.5px dashed ${T.borderMid}`, margin:'0 auto' }} />
      </div>
      {/* Steps */}
      {conv.flowSteps.map((step, i) => (
        <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div style={{ width:'100%', padding:'9px 11px', borderRadius:4,
            background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadowSm }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
              <div style={{ width:18, height:18, borderRadius:'50%', flexShrink:0, marginTop:1,
                display:'flex', alignItems:'center', justifyContent:'center', background:T.greenSoft }}>
                <Check size={9} color={T.green} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:600, color:T.text, lineHeight:1.4 }}>{step.label}</p>
                {step.plugin && (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:5,
                    fontSize:13, fontWeight:700, padding:'2px 7px', borderRadius:6,
                    background:`${T.core}12`, color:T.core, border:`1px solid ${T.core}20` }}>
                    <Database size={7} />{step.plugin}
                  </span>
                )}
              </div>
            </div>
          </div>
          {i < conv.flowSteps.length - 1 && (
            <div style={{ width:1, height:20, borderLeft:`1.5px dashed ${T.borderMid}`, margin:'0 auto' }} />
          )}
        </div>
      ))}
      {/* End node */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginTop:0 }}>
        <div style={{ width:1, height:20, borderLeft:`1.5px dashed ${T.borderMid}`, margin:'0 auto' }} />
        <div style={{ width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
          background:T.greenSoft, border:`2px solid ${T.green}` }}>
          <Check size={14} color={T.green} />
        </div>
        <p style={{ fontSize:14, fontWeight:600, color:T.green, marginTop:6 }}>Completed</p>
      </div>
    </div>
  )
}

// ─── Conversations View ────────────────────────────────────────────────────────
function ConversationsView({ openConvId, onConvOpen, setCoreState, coreState, persona }) {
  const T = window.__T
  // Local, mutable copy so we can pin / start a new chat without touching the
  // shared CONVERSATIONS demo data. Seeded once from the constant.
  const [convs, setConvs] = useState(() => CONVERSATIONS.map(c => ({ ...c, pinned:false })))
  const [activeConv, setActiveConv] = useState(openConvId || null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [relatedOpen, setRelatedOpen] = useState(false)
  const endRef = useRef(null)

  // When openConvId changes from outside (expand from overlay), open that conv
  useEffect(() => { if (openConvId) { setActiveConv(openConvId) } }, [openConvId])

  const currentConv = convs.find(c => c.id === activeConv)
  useEffect(() => {
    if (currentConv) setMessages(currentConv.messages || [])
  }, [activeConv])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages, thinking])

  // Sort: pinned first (preserve relative order), then everyone else.
  const sortedConvs = [...convs].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))

  const togglePin = (id) => {
    SFX.tap()
    setConvs(p => p.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c))
  }

  // "New chat" deselects whatever's open. The empty pane shows the WhisperBar
  // hero — same UI as Today. A real entry only appears once the user submits.
  const newChat = () => {
    SFX.tap(); HX.tap()
    setActiveConv(null)
    setMessages([])
    setInput('')
  }

  // Hero composer submit — turns the empty state into a brand-new conversation
  // seeded with the user's first message and Jarvis's first reply.
  const startNewChat = (txt) => {
    if (!txt.trim()) return
    SFX.whisper(); HX.tap()
    const id = 'cv_new_' + Date.now()
    const stamp = new Date().toLocaleTimeString([], { hour:'numeric', minute:'2-digit' })
    const title = txt.length > 48 ? txt.slice(0, 48) + '…' : txt
    const fresh = {
      id, title, preview: txt, time: stamp, date:'Today',
      pinned:false, unread:0,
      messages: [{ role:'u', text: txt }],
    }
    setConvs(p => [fresh, ...p])
    setActiveConv(id)
    setMessages(fresh.messages)
    setInput('')
    setThinking(true); setCoreState('thinking')
    setTimeout(() => {
      setThinking(false); setCoreState('idle')
      setMessages(p => [...p, { role:'j', text:"Got it — let's pick this apart. What outcome are you after?" }])
    }, 900)
  }

  const sendText = (txt) => {
    if (!txt.trim()) return
    SFX.whisper(); HX.tap()
    setInput('')
    setMessages(p => [...p, { role:'u', text:txt }])
    setThinking(true); setCoreState('thinking')
    // If the active thread is still titled "New chat", use the user's first
    // message as its working title so the sidebar stops showing "New chat".
    setConvs(p => p.map(c => (c.id === activeConv && c.title === 'New chat')
      ? { ...c, title: txt.length > 48 ? txt.slice(0, 48) + '…' : txt }
      : c))
    setTimeout(() => {
      setThinking(false); setCoreState('idle')
      setMessages(p => [...p, { role:'j', text:"Got it. I've noted that and will follow up. Is there anything else you'd like me to handle?" }])
    }, 900)
  }
  const send = () => { if (input.trim()) sendText(input) }

  const T2 = window.__T
  const renderMsg = (text) => renderMsgText(text, T2)

  return (
    <div style={{ flex:1, display:'flex', overflow:'hidden', height:'100%' }}>
      {/* Left: conversation list (grey rail) */}
      <div style={{ width:280, flexShrink:0, borderRight:`1px solid ${T.border}`, display:'flex', flexDirection:'column', background:T.appBg }}>
        {/* Search at the top of the rail */}
        <div style={{ padding:'14px 12px 6px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:99,
            background:T.surfaceMid, border:`1px solid ${T.border}` }}>
            <Search size={13} color={T.textSoft} />
            <input placeholder="Search conversations…" style={{ flex:1, fontSize:13, background:'none', border:'none', outline:'none', color:T.text, fontFamily:T.font }} />
          </div>
        </div>

        {/* New chat — plain sidebar row, like Gemini */}
        <div style={{ padding:'4px 6px 8px' }}>
          <button type="button" onClick={newChat}
            style={{ display:'flex', alignItems:'center', gap:12, width:'100%',
              padding:'9px 14px', borderRadius:99, cursor:'pointer',
              background:'none', border:'none',
              color:T.text, fontSize:14, fontWeight:500, fontFamily:T.font,
              textAlign:'left', transition:'background .12s' }}
            onMouseEnter={e => { e.currentTarget.style.background = T.surfaceMid }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none' }}>
            <PenSquare size={15} color={T.textSoft} />
            <span>New chat</span>
          </button>
        </div>
        {/* List — Gemini-style single-line items, selected pill, hover-revealed pin */}
        <div style={{ flex:1, overflowY:'auto', padding:'4px 6px' }}>
          {/* Pinned section header */}
          {sortedConvs.some(c => c.pinned) && (
            <p style={{ fontSize:11, fontWeight:700, color:T.textSoft,
              textTransform:'uppercase', letterSpacing:'0.08em',
              padding:'10px 14px 6px', margin:0 }}>Pinned</p>
          )}
          {sortedConvs.map((conv, idx) => {
            const active = activeConv === conv.id
            // Insert a "Recent" header at the boundary between pinned and the rest.
            const prev = sortedConvs[idx - 1]
            const showRecentHeader = !conv.pinned && (prev?.pinned)
            return (
              <React.Fragment key={conv.id}>
                {showRecentHeader && (
                  <p style={{ fontSize:11, fontWeight:700, color:T.textSoft,
                    textTransform:'uppercase', letterSpacing:'0.08em',
                    padding:'12px 14px 6px', margin:0 }}>Recent</p>
                )}
                <div className="conv-row" style={{ position:'relative' }}>
                  <button type="button"
                    onClick={() => { SFX.tap(); setActiveConv(conv.id) }}
                    title={conv.title}
                    style={{ display:'flex', alignItems:'center', width:'100%',
                      padding:'9px 36px 9px 14px', borderRadius:99, marginBottom:2,
                      cursor:'pointer', textAlign:'left',
                      background: active ? T.coreSoft : 'none',
                      border: 'none',
                      color: active ? T.core : T.text,
                      fontFamily: T.font,
                      transition:'background .12s, color .12s' }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.surfaceMid }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'none' }}>
                    <span style={{ flex:1, fontSize:14, fontWeight: active ? 700 : 500,
                      lineHeight:1.3,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {conv.title}
                    </span>
                  </button>
                  {/* Pin / Unpin — always visible if pinned, hover-reveal otherwise */}
                  <button type="button" aria-label={conv.pinned ? 'Unpin' : 'Pin'}
                    onClick={(e) => { e.stopPropagation(); togglePin(conv.id) }}
                    className="conv-pin"
                    style={{ position:'absolute', top:'50%', right:8, transform:'translateY(-50%)',
                      width:24, height:24, borderRadius:99, cursor:'pointer',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      background:'none', border:'none',
                      color: conv.pinned ? (active ? T.core : T.textMid) : T.textSoft,
                      opacity: conv.pinned ? 1 : 0,
                      transition:'opacity .12s, color .12s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = T.core }}
                    onMouseLeave={e => { e.currentTarget.style.color = conv.pinned ? (active ? T.core : T.textMid) : T.textSoft }}>
                    <Pin size={13} style={{ transform: conv.pinned ? 'rotate(45deg)' : 'rotate(0deg)' }} />
                  </button>
                </div>
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Right: open conversation — mirrors ChatPanel chat-pane design */}
      {currentConv ? (
        <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
          {/* Messages column — white background, single scroll surface so the
              centered title sticks while messages scroll behind it. */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden',
            background:T.surface, position:'relative' }}>

            {/* Scrollable area: sticky full-width title + max-800 reading column */}
            <div style={{ flex:1, overflowY:'auto', position:'relative' }}>
              {/* Sticky title — full pane width: H2 on the extreme left, Related CTA on the extreme right */}
              <div style={{ position:'sticky', top:0, zIndex:5, background:T.surface,
                padding:'18px 24px 14px',
                display:'flex', alignItems:'center', gap:12 }}>
                <h2 title={currentConv.title}
                  style={{ flex:1, fontSize:16, fontWeight:700, color:T.text, margin:0,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                    lineHeight:1.3 }}>
                  {currentConv.title}
                </h2>
                <button type="button" onClick={() => { SFX.tap(); setRelatedOpen(o => !o) }}
                  aria-label="Show related"
                  style={{ display:'inline-flex', alignItems:'center', gap:6,
                    padding:'6px 12px', borderRadius:99, cursor:'pointer',
                    background: relatedOpen ? T.coreSoft : T.surface,
                    border:`1px solid ${relatedOpen ? T.core : T.border}`,
                    color: relatedOpen ? T.core : T.textMid,
                    fontSize:13, fontWeight:600, fontFamily:T.font,
                    transition:'all .12s', flexShrink:0 }}
                  onMouseEnter={e => { if (!relatedOpen) { e.currentTarget.style.borderColor = T.core; e.currentTarget.style.color = T.core } }}
                  onMouseLeave={e => { if (!relatedOpen) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMid } }}>
                  <Layers size={13} />
                  Related
                </button>
              </div>

              {/* Centered reading column — max-width 800 */}
              <div style={{ maxWidth:800, margin:'0 auto', padding:'0 24px 16px',
                display:'flex', flexDirection:'column', gap:18 }}>
                {messages.map((m, i) => (
                  <div key={i} className="enter" style={{ animationDelay:`${i*.04}s` }}>
                    {m.role === 'u' ? (
                      // User bubble — right-aligned, soft surfaceMid
                      <div style={{ display:'flex', justifyContent:'flex-end' }}>
                        <div style={{ maxWidth:'84%', padding:'10px 16px',
                          fontSize:14, lineHeight:1.55, borderRadius:18,
                          background:T.surfaceMid, color:T.text }}>
                          {renderMsg(m.text)}
                        </div>
                      </div>
                    ) : (
                      // Jarvis prose — 14 px body, no bubble, hover-only feedback
                      <div className="j-msg" style={{ fontSize:14, lineHeight:1.65, color:T.text }}>
                        {renderBubble(m, T, (label) => sendText(label))}
                        <MessageFeedback msgIndex={i} />
                      </div>
                    )}
                  </div>
                ))}
                {thinking && (
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:T.coreMid,
                        animation:'breathe .9s ease-in-out infinite', animationDelay:`${i*.2}s` }} />
                    ))}
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </div>

            {/* Continue input — same hero pill used on Today */}
            <div style={{ padding:'14px 24px 18px', flexShrink:0 }}>
              <div style={{ maxWidth:720, margin:'0 auto' }}>
                <ContinueBar value={input} onChange={setInput} onSubmit={send} />
              </div>
            </div>
          </div>

          {/* Related pane — slides in from the right when the title CTA is on */}
          {relatedOpen && (
            <div className="enter-r" style={{ width:340, flexShrink:0,
              background:T.appBg, borderLeft:`1px solid ${T.border}`,
              display:'flex', flexDirection:'column' }}>
              <div style={{ padding:'14px 18px', display:'flex', alignItems:'center',
                justifyContent:'space-between' }}>
                <p style={{ fontSize:13, fontWeight:700, color:T.text, margin:0 }}>Related</p>
                <button type="button" aria-label="Close related"
                  onClick={() => { SFX.tap(); setRelatedOpen(false) }}
                  style={{ width:24, height:24, borderRadius:4, cursor:'pointer',
                    background:'none', border:'none', color:T.textSoft,
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <X size={13} />
                </button>
              </div>
              <div style={{ flex:1, overflowY:'auto', padding:'4px 14px 16px',
                display:'flex', flexDirection:'column', gap:14 }}>
                {/* Documents */}
                <div>
                  <p style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em',
                    color:T.textSoft, margin:'0 0 8px' }}>Documents</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {CHAT_DOCS.map((doc, i) => {
                      const Icon = doc.Icon || FileText
                      return (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:10,
                          padding:'10px 12px', borderRadius:8,
                          background:T.surface, border:`1px solid ${T.border}`, cursor:'pointer' }}>
                          <div style={{ width:30, height:30, borderRadius:6, flexShrink:0,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            background:`${doc.color || T.core}14` }}>
                            <Icon size={13} color={doc.color || T.core} />
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:13, fontWeight:700, color:T.text, margin:0,
                              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.name}</p>
                            <p style={{ fontSize:11, color:T.textSoft, margin:'2px 0 0' }}>{doc.type}{doc.edited ? ` · ${doc.edited}` : ''}</p>
                          </div>
                          <ExternalLink size={12} color={T.textSoft} />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* People */}
                <div>
                  <p style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em',
                    color:T.textSoft, margin:'0 0 8px' }}>People</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {CHAT_PEOPLE.map((person, i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:10,
                        padding:'10px 12px', borderRadius:8,
                        background:T.surface, border:`1px solid ${T.border}` }}>
                        <div style={{ position:'relative', flexShrink:0, width:32, height:32 }}>
                          <img alt={person.name}
                            src={`https://i.pravatar.cc/72?u=${encodeURIComponent(person.name)}`}
                            style={{ width:32, height:32, borderRadius:'50%', objectFit:'cover',
                              border:`1.5px solid ${T.border}` }} />
                          <div style={{ position:'absolute', bottom:0, right:0, width:9, height:9, borderRadius:'50%',
                            background:person.online ? T.green : T.amber,
                            border:`2px solid ${T.surface}` }} />
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:13, fontWeight:700, color:T.text, margin:0 }}>{person.name}</p>
                          <p style={{ fontSize:11, color:T.textSoft, margin:'2px 0 0' }}>{person.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Empty state — Today hero WhisperBar on a white surface
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
          padding:'24px', background:T.surface }}>
          <div style={{ width:'100%', maxWidth:620 }}>
            <WhisperBar hero persona={persona} coreState={coreState} setCoreState={setCoreState}
              onCommand={(v) => startNewChat(v)} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Continue bar — re-uses the visual language of the Today WhisperBar ─────
// Compact pill with Sparkles + mic + send. No persona, no prompt categories.
function ContinueBar({ value, onChange, onSubmit, placeholder = 'Continue the conversation…' }) {
  const T = window.__T
  const [focused, setFocused] = useState(false)
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${focused ? T.core : T.border}`,
      borderRadius: 999,
      boxShadow: focused ? `0 0 0 3px ${T.core}1f, ${T.shadowMd}` : T.shadowSm,
      transition: 'box-shadow .18s, border-color .18s',
      display:'flex', alignItems:'center', gap:10,
      padding:'8px 8px 8px 18px',
    }}>
      <Sparkles size={16} color={T.coreMid} />
      <input value={value} onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSubmit()}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{ flex:1, fontSize:14, background:'none', border:'none', outline:'none',
          color:T.text, fontFamily:T.font, fontWeight:400, lineHeight:1.4, padding:'4px 0' }} />
      <button type="button" aria-label="Voice input"
        style={{ width:30, height:30, borderRadius:99,
          background:'none', border:'none', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:T.textSoft, transition:'background .12s', flexShrink:0 }}
        onMouseEnter={e => { e.currentTarget.style.background = T.surfaceMid }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none' }}>
        <Mic size={14} />
      </button>
      <button type="button" onClick={onSubmit}
        style={{ width:30, height:30, borderRadius:99,
          background: value.trim() ? T.core : T.surfaceMid,
          border: 'none', cursor: value.trim() ? 'pointer' : 'default',
          display:'flex', alignItems:'center', justifyContent:'center',
          color: value.trim() ? '#fff' : T.textXsoft,
          transition:'all .15s', flexShrink:0 }}>
        <ArrowRight size={15} />
      </button>
    </div>
  )
}

// ─── Whisper Bar ──────────────────────────────────────────────────────────────
function WhisperBar({ persona, coreState, setCoreState, onCommand, hero }) {
  const T = window.__T
  const [val, setVal] = useState('')
  const [focused, setFocused] = useState(false)
  const [openCat, setOpenCat] = useState(null)
  const inputRef = useRef(null)
  // Close category dropdown on outside click
  useEffect(() => {
    if (!openCat) return
    const handler = (e) => {
      if (!e.target.closest?.('.prompt-cat')) setOpenCat(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openCat])
  const submit = () => {
    if (!val.trim()) return
    SFX.whisper(); HX.tap()
    const v = val; setVal('')
    setCoreState('thinking')
    setTimeout(() => { onCommand(v); setCoreState('idle') }, 900)
  }
  // Mic toggles a voice-listening session; only the mic puts Jarvis into "listening".
  const toggleMic = () => {
    SFX.tap(); HX.tap()
    if (coreState === 'listening') {
      setCoreState('idle')
    } else {
      setCoreState('listening')
      // Auto-timeout so the state doesn't get stuck if the user never submits.
      setTimeout(() => setCoreState(s => s === 'listening' ? 'idle' : s), 6000)
    }
  }
  const ph = persona==='manager' ? 'Ask anything — "Team readiness brief", "Who is at risk?"…'
    : 'Ask anything — "Prep my 10 AM", "Draft reply to Acme"…'

  if (hero) {
    const userName = persona === 'manager' ? 'Alex' : 'Alex'
    // Visual hierarchy: a warm, large, inviting greeting.
    // Listening is voice-only; typing is silent.
    const greetingLead = coreState === 'thinking' ? 'On it…'
                       : coreState === 'listening' ? 'Listening…'
                       : `Good morning, ${userName}.`
    const greetingQ    = coreState === 'thinking' ? 'Jarvis is working on that.'
                       : coreState === 'listening' ? 'Go ahead, I\'m here.'
                       : 'Where should we start?'

    // Category prompt buckets, persona-aware — restored from earlier spec,
    // now aligned with the employee-service JTBDs in the product draft.
    const PROMPT_CATEGORIES = [
      { id:'discover', label:'Discover', Icon:Compass, color:T.core,
        prompts: persona==='manager'
          ? ['What needs my attention this week?','Who on my team is at risk?','What changed overnight?','Which approvals are pending with me?']
          : ['What needs me today?','What did I miss overnight?','Summarize my upcoming meetings','Show me blockers across my work'] },
      { id:'find',     label:'Find',     Icon:Search,  color:T.blue,
        prompts: persona==='manager'
          ? ['Find my 1:1 notes with Liam','Find the Q2 planning thread','Find approvals older than 5 days','Find docs I reviewed last week']
          : ['Find my last PTO request','Find the benefits enrolment page','Find the QBR deck','Find my 1:1 notes with Sarah'] },
      { id:'create',   label:'Create',   Icon:PenSquare,color:T.teal,
        prompts: persona==='manager'
          ? ['Draft a Wellness Day note to Liam','Create a hiring panel debrief template','Draft a sprint retro agenda','Write a promotion justification']
          : ['Draft my parental-leave handoff','Request PTO for next month','Write a meeting follow-up','Raise an IT ticket for laptop refresh'] },
      { id:'brainstorm',label:'Brainstorm',Icon:Lightbulb,color:T.amber,
        prompts: persona==='manager'
          ? ['Ideas to reduce team burnout risk','How to speed up our hiring loop','Ways to close the React 19 skill gap','How to rebalance on-call']
          : ['How to plan my parental leave handoff','Ideas for my QBR opener','What benefits should I pick this year?','Questions to ask in my 1:1 today'] },
    ]

    return (
      <div className="enter" style={{ marginTop: 16, marginBottom: 64, position:'relative', zIndex: openCat ? 200 : 'auto' }}>
        {/* Warm, inviting greeting — strong visual hierarchy, two lines */}
        <div style={{ textAlign:'center', marginBottom:14 }}>
          <p style={{
            fontSize:30, fontWeight:700, margin:0, lineHeight:1.2,
            fontFamily:T.font, letterSpacing:'-0.02em',
            background:`linear-gradient(135deg, ${T.core} 0%, ${T.coreMid} 50%, ${T.blue} 100%)`,
            WebkitBackgroundClip:'text', backgroundClip:'text',
            WebkitTextFillColor:'transparent', color:'transparent',
          }}>
            {greetingQ}
          </p>
        </div>

        {/* Compact pill input — single row */}
        <div style={{
          background: T.surface,
          border: `1px solid ${focused ? T.core : T.border}`,
          borderRadius: 999,
          boxShadow: focused ? `0 0 0 3px ${T.core}1f, ${T.shadowMd}` : T.shadowSm,
          transition: 'box-shadow .18s, border-color .18s',
          display:'flex', alignItems:'center', gap:10,
          padding:'8px 8px 8px 18px',
        }}>
          <div style={{ color: T.textXsoft, flexShrink:0, display:'flex', alignItems:'center' }}>
            {coreState==='thinking'
              ? <Loader2 size={16} color={T.core} style={{ animation:'spin 1s linear infinite' }} />
              : <Sparkles size={16} color={T.coreMid} />}
          </div>
          <input ref={inputRef} value={val} onChange={e=>setVal(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&submit()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={ph}
            style={{ flex:1, fontSize:14, background:'none', border:'none', outline:'none',
              color:T.text, fontFamily:T.font, fontWeight:400, lineHeight:1.4, padding:'4px 0' }} />
          <button type="button"
            aria-label={coreState==='listening' ? 'Stop listening' : 'Start voice input'}
            onClick={toggleMic}
            style={{ width:30, height:30, borderRadius:99,
              background: coreState==='listening' ? T.redSoft : 'none',
              border:'none', cursor:'pointer', display:'flex',
              alignItems:'center', justifyContent:'center',
              color: coreState==='listening' ? T.red : T.textSoft,
              transition:'background .12s, color .12s', flexShrink:0 }}
            onMouseEnter={e=>{ if (coreState!=='listening') e.currentTarget.style.background=T.surfaceMid }}
            onMouseLeave={e=>{ if (coreState!=='listening') e.currentTarget.style.background='none' }}>
            <Mic size={14} />
          </button>
          <button type="button" onClick={submit}
            style={{ width:30, height:30, borderRadius:99,
              background: val.trim() ? T.core : T.surfaceMid,
              border: 'none', cursor: val.trim() ? 'pointer' : 'default',
              display:'flex', alignItems:'center', justifyContent:'center',
              color: val.trim() ? '#fff' : T.textXsoft,
              transition:'all .15s', flexShrink:0 }}>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Prompt categories — plain text links, each opens a dropdown of prompts */}
        <div style={{ display:'flex', gap:22, marginTop:12, flexWrap:'wrap',
          justifyContent:'center', alignItems:'center' }}>
          {PROMPT_CATEGORIES.map(cat => {
            const { Icon } = cat
            const isOpen = openCat === cat.id
            return (
              <div key={cat.id} className="prompt-cat" style={{ position:'relative', zIndex: isOpen ? 100 : 'auto' }}>
                <button type="button"
                  onClick={() => { SFX.tap(); setOpenCat(isOpen ? null : cat.id) }}
                  style={{ display:'inline-flex', alignItems:'center', gap:6,
                    padding:'4px 2px', background:'none', border:'none', cursor:'pointer',
                    color: isOpen ? cat.color : T.textSoft,
                    fontSize:13, fontWeight:600, fontFamily:T.font,
                    transition:'color .12s' }}
                  onMouseEnter={e => { if (!isOpen) e.currentTarget.style.color = cat.color }}
                  onMouseLeave={e => { if (!isOpen) e.currentTarget.style.color = T.textSoft }}>
                  <Icon size={13} strokeWidth={2} />
                  <span>{cat.label}</span>
                </button>
                {isOpen && (
                  <div className="expand-down" style={{ position:'absolute', top:'calc(100% + 8px)',
                    left:'50%', transform:'translateX(-50%)',
                    minWidth:280, background:T.surface, border:`1px solid ${T.border}`, borderRadius:8,
                    boxShadow:T.shadowMd, padding:4, zIndex:100, fontFamily:T.font }}>
                    {cat.prompts.map((p, i) => (
                      <button key={i} type="button"
                        onClick={() => { SFX.tap(); setVal(p); setOpenCat(null); inputRef.current?.focus() }}
                        style={{ display:'flex', alignItems:'center', gap:10, width:'100%',
                          padding:'8px 10px', borderRadius:4, background:'none', border:'none',
                          cursor:'pointer', textAlign:'left', color:T.textMid,
                          fontSize:13, fontFamily:T.font, transition:'background .1s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.surfaceMid; e.currentTarget.style.color = T.text }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = T.textMid }}>
                        <Icon size={12} color={cat.color} style={{ flexShrink:0 }} />
                        <span style={{ flex:1 }}>{p}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // compact bottom bar (non-today tabs, kept for fallback)
  return (
    <div style={{ padding:'10px 16px 14px', background:T.topBar, borderTop:`1px solid ${T.border}`, flexShrink:0 }}>
      <div style={{ borderRadius:4, transition:'box-shadow .15s',
        boxShadow:focused?`0 0 0 1px ${T.core}`:T.shadowSm }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 14px', borderRadius:4,
          background:T.surface, border:`1px solid ${focused?T.core:T.border}`, transition:'all .15s' }}>
          <div style={{ color:coreState==='thinking'?T.core:T.textXsoft, flexShrink:0 }}>
            {coreState==='thinking'
              ? <Loader2 size={16} style={{ animation:'spin 1s linear infinite' }} />
              : <Sparkles size={16} />}
          </div>
          <input value={val} onChange={e=>setVal(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&submit()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={ph}
            style={{ flex:1, fontSize:15, background:'none', border:'none', outline:'none', color:T.text, fontFamily:T.font }} />
          <button type="button"
            onClick={toggleMic}
            style={{ padding:5, background: coreState==='listening' ? T.redSoft : 'none',
              border:'none', cursor:'pointer',
              color: coreState==='listening' ? T.red : T.textSoft, borderRadius:4 }}>
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
      style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:4,
        background:T.surfaceMid, border:`1px solid ${T.border}`, cursor:'pointer', transition:'all .15s', color:T.textMid, fontSize:14, fontWeight:600 }}
      onMouseEnter={e => { e.currentTarget.style.borderColor=T.core; e.currentTarget.style.color=T.core }}
      onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.textMid }}>
      {mode==='light' ? <Moon size={13} /> : <Sun size={13} />}
      {mode==='light' ? 'Dark' : 'Light'}
    </button>
  )
}

// ─── Shared page layout ───────────────────────────────────────────────────
// Single source of truth for all in-app tab pages (Today, Feed, Routines,
// Setup). Conversations is intentionally excluded — it has its own three-pane
// chat layout that fills the viewport edge-to-edge.
function PageLayout({ children, maxWidth = 1280, background }) {
  return (
    <div style={{ flex:1, overflowY:'auto', padding:'24px 0 60px',
      ...(background ? { background } : {}) }}>
      <div style={{ maxWidth, margin:'0 auto', padding:'20px 24px 48px' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState('light')
  const T = THEMES[mode]
  // Expose T globally for child components that reference window.__T
  window.__T = T
  // Keep the global --focus-ring CSS var in sync with the theme's core color.
  useEffect(() => {
    try { document.documentElement.style.setProperty('--focus-ring', T.core) } catch {}
  }, [T.core])
  // Mirror the in-app theme onto the Teams chrome (title bar, app rail, and any
  // embedded Teams surfaces). Those use the --teams-* tokens in teams.css, which
  // are themed via [data-teams-theme]; without this, dark mode would only repaint
  // the Jarvis-branded pages and the Teams chrome would stay light.
  useEffect(() => {
    const teamsTheme = mode === 'dark' ? 'dark' : mode === 'contrast' ? 'contrast' : 'light'
    try { document.documentElement.setAttribute('data-teams-theme', teamsTheme) } catch {}
  }, [mode])

  const [scene, setScene] = useState('welcome') // welcome | setup | tuning | app
  const [tab, setTab] = useState('today')
  const [persona, setPersona] = useState('employee')
  // Load persisted Setup preferences (null = not set up yet)
  const [prefs, setPrefs] = useState(() => loadPrefs())
  // Expose prefs for deeply-nested components (ChatPanel tier logic, etc.)
  window.__PREFS = prefs
  const [personaOpen, setPersonaOpen] = useState(false)
  const PERSONAS = [
    { id:'employee', label:'Employee',   sub:'Individual contributor view' },
    { id:'manager',  label:'Manager',    sub:'People manager view' },
    // add more personas here as the demo grows
  ]
  const activePersona = PERSONAS.find(p => p.id === persona) || PERSONAS[0]
  // Close dropdown on outside click
  useEffect(() => {
    if (!personaOpen) return
    const handler = (e) => {
      if (!e.target.closest?.('.persona-dd')) setPersonaOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [personaOpen])
  // Demo-mode Docs dropdown
  const [docsOpen, setDocsOpen] = useState(false)
  const DOCS = [
    {
      label: '[Product Draft] Employee’s Personal AI Assistant (aka Jarvis)',
      url: 'https://docs.google.com/document/d/1lKEbUC-SdBnmUJA86j3lVgxz2fCzuWaxjCRqVYZdLNM/edit?tab=t.m0vigb9mrgxn#heading=h.jz7vz7a4sial',
    },
    // add more docs links here as the demo grows
  ]
  useEffect(() => {
    if (!docsOpen) return
    const handler = (e) => {
      if (!e.target.closest?.('.docs-dd')) setDocsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [docsOpen])
  const [coreState, setCoreState] = useState('idle')
  const [chatItem, setChatItem] = useState(null)
  const [chatScenario, setChatScenario] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [chatTab, setChatTab] = useState('chat')
  const [showNotif, setShowNotif] = useState(false)
  const [notifDone, setNotifDone] = useState(false)
  const [toast, setToast] = useState(null)
  const [doneIds, setDoneIds] = useState([])
  const [dismissIds, setDismissIds] = useState([])
  const [showWizard, setShowWizard] = useState(false)
  const [showAddMeeting, setShowAddMeeting] = useState(false)
  const [logging, setLogging] = useState(false)
  // Conversations tab — which conv to open (set when expanding from overlay)
  const [openConvId, setOpenConvId] = useState(null)
  // Today tab filter — null means "All" (default).
  const [todayFilter, setTodayFilter] = useState(null)
  // "What I can do" drawer visibility
  const [showCapabilities, setShowCapabilities] = useState(false)
  // "Last refreshed N min ago" ticker for the Neural Core microcopy
  const [lastRefreshedMin, setLastRefreshedMin] = useState(2)
  useEffect(() => {
    const id = setInterval(() => setLastRefreshedMin(m => m + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const allIntents = persona==='manager' ? MANAGER_INTENTS : INTENTS
  const notDismissed = allIntents.filter(i => !dismissIds.includes(i.id))
  // Filter predicates — parallel categories (type of work), not states
  const INTENT_FILTERS = {
    meetings:  (i) => i.prepReady === true || /\bQBR\b|meeting|prep|standup|1:1|deploy|sync/i.test(i.headline || ''),
    decision:  (i) => i.tier === 'L3' || i.tier === 'L4',
    followups: (i) => /follow|pending|waiting|awaiting|reply/i.test((i.headline || '') + ' ' + (i.cat || '') + ' ' + (i.action || '')),
  }
  const filteredIntents = todayFilter && INTENT_FILTERS[todayFilter]
    ? notDismissed.filter(INTENT_FILTERS[todayFilter])
    : notDismissed
  // If the user picked use cases in Setup, bias sort so matching intents come first.
  const useCaseSystemPrefix = (ucId) => {
    const uc = USE_CASES.find(u => u.id === ucId)
    if (!uc) return []
    return uc.chips.map(c => c.replace('Plugin','').toLowerCase())
  }
  const intentMatchesPickedUseCase = (intent) => {
    if (!prefs?.useCases?.length) return false
    const src = (intent.source || '').toLowerCase()
    for (const ucId of prefs.useCases) {
      const vendors = useCaseSystemPrefix(ucId)
      if (vendors.some(v => src.includes(v))) return true
    }
    return false
  }
  const visibleIntents = (prefs?.useCases?.length
    ? [...filteredIntents].sort((a, b) => (intentMatchesPickedUseCase(b) ? 1 : 0) - (intentMatchesPickedUseCase(a) ? 1 : 0))
    : filteredIntents)
  const heroIntent = visibleIntents.find(i => i.isHero)
  const restIntents = visibleIntents.filter(i => !i.isHero)
  const doneCount = doneIds.filter(id => allIntents.find(i => i.id===id)).length
  const overnightHandled = FEED_ITEMS.filter(f => f.status === 'done').length

  // Proactive notification — fired on demand from the demo bar bell, never auto.
  const triggerProactiveNotif = () => {
    SFX.alert(); HX.alert()
    setNotifDone(false)
    setShowNotif(true)
  }

  // Original "log in and show app" path — reused after Setup completes too.
  const runLoaderToApp = () => {
    SFX.tap(); setLogging(true)
    setTimeout(() => {
      setLogging(false); setScene('app'); setCoreState('thinking')
      setTimeout(() => setCoreState('idle'), 2200)
    }, 1400)
  }

  // Welcome CTA: branch based on whether prefs exist.
  const handleLogin = () => {
    if (prefs) {
      runLoaderToApp()
    } else {
      SFX.tap()
      setScene('setup')
    }
  }
  // Setup → complete (persist, show tuning loader, then loader → Today, then one-time toast).
  const [tuningPrefs, setTuningPrefs] = useState(null)
  const setupPendingToastRef = useRef(false)
  const handleSetupComplete = (newPrefs) => {
    savePrefs(newPrefs)
    setPrefs(newPrefs)
    setTuningPrefs(newPrefs)
    setScene('tuning')
    setupPendingToastRef.current = true
    setTimeout(() => {
      setScene('welcome') // ensure welcome loader path is clean
      runLoaderToApp()
    }, 1400)
  }
  const [chatPreselect, setChatPreselect] = useState(null)
  const openChat = (item, scenario=null, preselect=null) => { setChatItem(item); setChatScenario(scenario); setChatPreselect(preselect); setShowChat(true); setChatTab('chat'); setCoreState('confirming'); SFX.open() }
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

  // ─── Toasts with Undo ──────────────────────────────────────────────────
  // Toast shape: { msg, kind: 'done'|'dismissed'|'info', onUndo?: () => void }
  const toastTimerRef = useRef(null)
  const showToast = (t) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(t)
    toastTimerRef.current = setTimeout(() => setToast(null), t.onUndo ? 6000 : 3000)
  }
  // Fire the "You're set up" toast once after Today mounts post-Setup.
  useEffect(() => {
    if (scene === 'app' && setupPendingToastRef.current) {
      setupPendingToastRef.current = false
      showToast({ msg:"You're set up. I'll work within these rules.", kind:'done' })
    }
  }, [scene]) // eslint-disable-line react-hooks/exhaustive-deps

  // Undo helpers — pure state reverts, used by both toast and Handled panel.
  const undoDone = (id) => {
    setDoneIds(p => p.filter(x => x !== id))
    setDismissIds(p => p.filter(x => x !== id))
    setToast(null)
  }
  const undoDismiss = (id) => {
    setDismissIds(p => p.filter(x => x !== id))
    setToast(null)
  }

  const handleAct = (intent, preselect=null) => openChat(intent, intent.chatScenario||null, preselect)
  const handleDone = id => {
    SFX.done(); HX.done()
    setDoneIds(p=>[...p,id])
    setTimeout(() => setDismissIds(p=>[...p,id]), 400)
    showToast({ msg:'Marked done', kind:'done', onUndo: () => undoDone(id) })
  }
  const handleDismiss = id => {
    SFX.tap()
    setDismissIds(p=>[...p,id])
    showToast({ msg:'Removed from today', kind:'dismissed', onUndo: () => undoDismiss(id) })
  }
  const handleRemind = id => {
    SFX.tap(); HX.tap()
    showToast({ msg:'Reminder set · I\'ll bring this back in 1 hour', kind:'info' })
  }

  // ─── Day-cleared peak moment ──────────────────────────────────────────
  const dayClearedFiredRef = useRef(false)
  const isDayCleared = scene === 'app' && tab === 'today' && allIntents.length > 0 && doneCount === allIntents.length
  useEffect(() => {
    if (!isDayCleared) { dayClearedFiredRef.current = false; return }
    if (dayClearedFiredRef.current) return
    dayClearedFiredRef.current = true
    SFX.done()
  }, [isDayCleared])

  // ─── Handled items panel ──────────────────────────────────────────────
  const [handledOpen, setHandledOpen] = useState(false)
  // Derive the handled list from state. Done takes precedence over Dismissed
  // for items where the id appears in both (Done pushes the id into both).
  const handledList = dismissIds
    .map(id => {
      const intent = allIntents.find(i => i.id === id)
      if (!intent) return null
      return { intent, kind: doneIds.includes(id) ? 'done' : 'dismissed' }
    })
    .filter(Boolean)
    .reverse() // most recent first
  // Close the panel on outside click
  useEffect(() => {
    if (!handledOpen) return
    const handler = (e) => { if (!e.target.closest?.('.handled-pop')) setHandledOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [handledOpen])
  const handleNotifAct = () => { setShowNotif(false); setNotifDone(true); openChat(null,'reschedule') }
  const handleEventClick = ev => openChat({
    headline:ev.title, tier:'L2', source:ev.location,
    evidence:`${ev.time}–${ev.end} · ${ev.attendees.join(', ')}`,
    why:'Jarvis can pull prep notes, attendee context, and related docs for this meeting.',
  }, null)

  const navItems = [
    { id:'today',         label:'Today',         Icon:LayoutDashboard },
    { id:'conversations', label:'Conversations',  Icon:MessageCircle },
    { id:'feed',          label:'Feed',           Icon:History },
    { id:'agents',        label:'Skills',         Icon:Bot },
  ]

  // Tuning screen — bridge from Setup → Today
  if (scene === 'tuning') return <TuningLoader prefs={tuningPrefs} />

  // Loading screen
  if (logging) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:T.appBg, fontFamily:T.font, position:'relative', overflow:'hidden' }}>
      <style>{CSS}</style>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20, zIndex:1 }}>
        <div style={{ position:'relative', width:72, height:72 }}>
          <div className="ripple-ring" style={{ position:'absolute', inset:0, borderRadius:'50%', border:`1.5px solid ${T.core}50` }} />
          <JarvisMark size={72} radius={16} style={{ boxShadow:T.shadowPurple, animation:'breathe 2s ease-in-out infinite' }} />
        </div>
        <p style={{ color:T.text, fontWeight:700, fontSize:17 }}>Connecting to Salesforce…</p>
        <p style={{ fontSize:14, color:T.textSoft }}>Pulling your morning brief</p>
      </div>
    </div>
  )

  // (Setup is no longer rendered as a full-screen early return — it renders
  // inside the Teams chrome via the scene dispatcher below.)

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:T.appBg, fontFamily:T.font, position:'relative', transition:'background .3s' }}>
      <style>{CSS}</style>

      {/* ── Demo chrome (not part of Teams UI) ── */}
      <div style={{ height:36, flexShrink:0, display:'flex', alignItems:'center', gap:14,
        padding:'0 14px', background:'#0B0B0B', color:'#E5E5E5',
        borderBottom:'1px solid #1A1A1A', zIndex:30, fontFamily:T.font }}>
        <span style={{ fontSize:11, fontWeight:600, color:'#8A8A8A',
          textTransform:'uppercase', letterSpacing:'0.1em' }}>
          Demo mode
        </span>
        <span style={{ fontSize:11, color:'#555' }}>·</span>
        <span style={{ fontSize:11, color:'#A0A0A0' }}>Viewing as:</span>
        <div className="persona-dd" style={{ position:'relative' }}>
          <button type="button"
            onClick={() => { SFX.tap(); setPersonaOpen(o => !o) }}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 10px 4px 12px',
              borderRadius:4, border:'1px solid #2A2A2A', background:'#151515',
              color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:T.font,
              minWidth:140, transition:'background .12s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='#1E1E1E' }}
            onMouseLeave={e=>{ e.currentTarget.style.background='#151515' }}>
            <span>{activePersona.label}</span>
            <span style={{ flex:1 }} />
            <ChevronDown size={12} style={{ transform: personaOpen ? 'rotate(180deg)' : 'rotate(0)', transition:'transform .15s' }} />
          </button>
          {personaOpen && (
            <div className="expand-down" style={{ position:'absolute', top:'calc(100% + 4px)', left:0,
              minWidth:240, background:'#151515', border:'1px solid #2A2A2A', borderRadius:6,
              boxShadow:'0 8px 20px rgba(0,0,0,0.6)', padding:4, zIndex:40, fontFamily:T.font }}>
              {PERSONAS.map(p => {
                const isActive = p.id === persona
                return (
                  <button key={p.id} type="button"
                    onClick={() => { SFX.tap(); setPersona(p.id); setPersonaOpen(false) }}
                    style={{ display:'flex', alignItems:'center', gap:10, width:'100%',
                      padding:'8px 10px', borderRadius:4, background: isActive ? 'rgba(255,255,255,0.08)' : 'none',
                      border:'none', cursor:'pointer', textAlign:'left', color:'#fff',
                      transition:'background .1s' }}
                    onMouseEnter={e=>{ if (!isActive) e.currentTarget.style.background='rgba(255,255,255,0.05)' }}
                    onMouseLeave={e=>{ if (!isActive) e.currentTarget.style.background='none' }}>
                    <div style={{ width:16, display:'flex', justifyContent:'center', flexShrink:0 }}>
                      {isActive && <Check size={12} color="#fff" />}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:12, fontWeight:600, margin:0, color:'#fff', lineHeight:1.2 }}>{p.label}</p>
                      <p style={{ fontSize:11, color:'#8A8A8A', margin:'2px 0 0', lineHeight:1.2 }}>{p.sub}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <div style={{ flex:1 }} />
        {/* Docs — quick links to demo reference docs */}
        <div className="docs-dd" style={{ position:'relative' }}>
          <button type="button"
            aria-haspopup="menu" aria-expanded={docsOpen}
            onClick={() => { SFX.tap(); setDocsOpen(o => !o) }}
            style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px',
              borderRadius:4, border:'1px solid #2A2A2A', background:'#151515',
              color:'#E5E5E5', fontSize:11, fontWeight:600, cursor:'pointer',
              fontFamily:T.font, transition:'background .12s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='#1E1E1E' }}
            onMouseLeave={e=>{ e.currentTarget.style.background='#151515' }}>
            <FileText size={11} />
            Docs
            <ChevronDown size={11} style={{ transform: docsOpen ? 'rotate(180deg)' : 'rotate(0)', transition:'transform .15s' }} />
          </button>
          {docsOpen && (
            <div role="menu" className="expand-down" style={{ position:'absolute', top:'calc(100% + 4px)', right:0,
              minWidth:300, maxWidth:380, background:'#151515', border:'1px solid #2A2A2A', borderRadius:6,
              boxShadow:'0 8px 20px rgba(0,0,0,0.6)', padding:4, zIndex:40, fontFamily:T.font }}>
              {DOCS.map(d => (
                <a key={d.url} role="menuitem" href={d.url} target="_blank" rel="noopener noreferrer"
                  onClick={() => { SFX.tap(); setDocsOpen(false) }}
                  style={{ display:'flex', alignItems:'flex-start', gap:10, width:'100%',
                    padding:'8px 10px', borderRadius:4, background:'none', textDecoration:'none',
                    color:'#fff', transition:'background .1s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.05)' }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='none' }}>
                  <FileText size={13} style={{ flexShrink:0, marginTop:2, color:'#8A8A8A' }} />
                  <span style={{ flex:1, minWidth:0, fontSize:12, fontWeight:500, lineHeight:1.35, color:'#fff' }}>{d.label}</span>
                  <ExternalLink size={11} style={{ flexShrink:0, marginTop:2, color:'#6A6A6A' }} />
                </a>
              ))}
            </div>
          )}
        </div>
        {/* Bell — manually fire the proactive Teams notification (demo only) */}
        {scene === 'app' && (
          <button type="button" aria-label="Trigger proactive notification"
            onClick={triggerProactiveNotif}
            style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px',
              borderRadius:4, border:'1px solid #2A2A2A', background:'#151515',
              color:'#E5E5E5', fontSize:11, fontWeight:600, cursor:'pointer',
              fontFamily:T.font, transition:'background .12s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='#1E1E1E' }}
            onMouseLeave={e=>{ e.currentTarget.style.background='#151515' }}>
            <Bell size={11} />
            Notify
          </button>
        )}
        <TeamsComplianceReport />
        <label style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:11, fontWeight:600, color:'#A0A0A0', fontFamily:T.font }}>
          {mode==='dark' ? <Sun size={11} /> : <Moon size={11} />}
          <span>Theme</span>
          <select
            value={mode}
            onChange={e => { SFX.tap(); setMode(e.target.value) }}
            aria-label="Theme"
            style={{ background:'#151515', border:'1px solid #2A2A2A', borderRadius:4,
              color:'#E5E5E5', fontSize:11, fontWeight:600, padding:'4px 8px', cursor:'pointer',
              fontFamily:T.font }}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="contrast">High contrast</option>
          </select>
        </label>
        <span style={{ fontSize:11, color:'#6A6A6A', marginLeft:12 }}>
          Jarvis demo · not a Microsoft product surface
        </span>
      </div>

      {/* ── Teams titlebar — exact MS Teams shell (teams.css .teams-titlebar) ── */}
      <div className="teams-titlebar teams-scope" role="toolbar" aria-label="Teams window">
        <div className="teams-titlebar__left">
          <span className="teams-titlebar__logo" aria-hidden="true">
            <img src={asset('/assets/teams-logo.svg')} alt="" />
          </span>
        </div>
        <div className="teams-titlebar__center">
          <div className="teams-titlebar__nav-stack" aria-hidden="true">
            <button className="teams-titlebar__nav-btn" type="button" tabIndex={-1} aria-label="Back">
              <ChevronLeftRegular size={20} />
            </button>
            <button className="teams-titlebar__nav-btn" type="button" tabIndex={-1} aria-label="Forward">
              <ChevronRightRegular size={20} />
            </button>
          </div>
          <div className="teams-titlebar__search" aria-hidden="true">
            <SearchRegular size={20} />
            <span className="teams-titlebar__search-label">Search</span>
          </div>
        </div>
        <div className="teams-titlebar__right">
          <button className="teams-titlebar__icon-btn" type="button" tabIndex={-1} aria-label="More">
            <MoreHorizontalRegular size={20} />
          </button>
          <div className="teams-titlebar__avatar" aria-label="My account"><span>A</span></div>
          <div className="teams-titlebar__wincontrols" aria-hidden="true">
            <button className="teams-titlebar__wincontrol" type="button" tabIndex={-1} aria-label="Minimize">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
                <path d="M3 8h10" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
              </svg>
            </button>
            <button className="teams-titlebar__wincontrol" type="button" tabIndex={-1} aria-label="Maximize">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
                <rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1" fill="none" />
              </svg>
            </button>
            <button className="teams-titlebar__wincontrol teams-titlebar__wincontrol--close" type="button" tabIndex={-1} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
                <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main area: left rail + content column ── */}
      <div style={{ display:'flex', flex:1, minHeight:0, overflow:'hidden' }}>

      {/* Left rail — exact MS Teams shell (teams.css .teams-rail) */}
      <nav className="teams-rail teams-scope" aria-label="Teams app rail" style={{ width:68, flexShrink:0, zIndex:10 }}>
        {[
          { Icon: ChatRegular,             label:'Chat' },
          { Icon: PeopleTeamRegular,       label:'Communities' },
          { Icon: VideoCameraSmallRegular, label:'Call to meet' },
          { Icon: BookContactsRegular,     label:'People' },
          { Icon: CalendarRegular,         label:'Calendar' },
          { Brand: CopilotBrand,           label:'Copilot' },
          { Icon: AlertRegular,            label:'Activity' },
        ].map(({ Icon, Brand, label }, i) => (
          <button key={i} type="button" tabIndex={-1} className="teams-rail__item" aria-label={label}>
            <span className="teams-rail__icon">{Brand ? <Brand size={22} /> : <Icon size={22} />}</span>
            <span className="teams-rail__label">{label}</span>
          </button>
        ))}

        {/* Divider — Microsoft Teams' own functions sit above; installed apps
            (like Jarvis) sit below, matching the new Teams desktop rail. */}
        <div className="teams-rail__divider" role="separator" aria-hidden="true" />

        {/* Jarvis — the selected app */}
        <button type="button" className="teams-rail__item teams-rail__item--active" aria-current="page" aria-label="Jarvis">
          <span className="teams-rail__icon"><JarvisMark size={24} radius={6} /></span>
          <span className="teams-rail__label">Jarvis</span>
        </button>

        <div className="teams-rail__spacer" />

        <button type="button" tabIndex={-1} className="teams-rail__item" aria-label="More">
          <span className="teams-rail__icon"><MoreHorizontalRegular size={22} /></span>
        </button>
        <button type="button" tabIndex={-1} className="teams-rail__item" aria-label="Apps">
          <span className="teams-rail__icon"><AppsRegular size={22} /></span>
          <span className="teams-rail__label">Apps</span>
        </button>
      </nav>

      {/* Main column */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', position:'relative', zIndex:1 }}>

        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'0 16px', height:52, flexShrink:0, zIndex:10,
          background:T.surface, borderBottom:`1px solid ${T.border}`, transition:'background .3s' }}>
          <NeuralCore state={coreState} onClick={() => setCoreState('idle')} />
          <div style={{ width:1, height:24, background:T.border, flexShrink:0 }} />
          <nav style={{ display:'flex' }}>
            {navItems.map(({ id, label }) => (
              <button key={id} type="button" onClick={() => { SFX.tap(); setTab(id); if(scene!=='app') setScene('app') }}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'0 12px', height:52, fontSize:15, fontWeight:600,
                  background:'none', border:'none', cursor:'pointer', position:'relative',
                  color:tab===id&&scene==='app'?T.core:T.textSoft, transition:'color .15s' }}>
                {label}
              </button>
            ))}
          </nav>
          <div style={{ flex:1 }} />

          {scene==='app' && (
            <button type="button" aria-label="What I can do"
              onClick={() => { SFX.tap(); setShowCapabilities(true) }}
              style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:4,
                background:T.surfaceMid, border:`1px solid ${T.border}`, cursor:'pointer',
                transition:'all .15s', color:T.textMid, fontSize:13, fontWeight:600, fontFamily:T.font }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=T.core; e.currentTarget.style.color=T.core }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.textMid }}>
              <Compass size={13} />
              What I can do
            </button>
          )}

          {/* Org badge — static identity strip, not interactive */}
          {scene==='app' && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 4px' }}>
              <div style={{ width:18, height:18, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:T.core }}>
                <span style={{ fontSize:13, fontWeight:800, color:T.coreText }}>O</span>
              </div>
              <div style={{ lineHeight:1 }}>
                <p style={{ fontSize:13, fontWeight:700, color:T.text }}>OrgFarm EPIC</p>
                <p style={{ fontSize:12, color:T.textXsoft, marginTop:2 }}>salesforce.com</p>
              </div>
            </div>
          )}
        </div>

        {/* Teams-style notification toast — anchored inside the app column */}
        {showNotif && !notifDone && (
          <div className="enter" style={{ position:'absolute', bottom:20, right:20, zIndex:30, width:360,
            borderRadius:6, overflow:'hidden',
            background:'#292929', color:'#fff', fontFamily:T.font,
            boxShadow:'0 0 0 1px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.45)' }}>
            {/* Header — Teams app badge + dismiss */}
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px 8px',
              borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
              <JarvisMark size={28} radius={6} />
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:12, fontWeight:600, color:'#fff', margin:0, lineHeight:1.2 }}>Jarvis</p>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.55)', margin:'1px 0 0', lineHeight:1 }}>now</p>
              </div>
              <button type="button"
                onClick={() => { setShowNotif(false); setNotifDone(true) }}
                style={{ width:22, height:22, borderRadius:4, background:'none', border:'none',
                  cursor:'pointer', color:'rgba(255,255,255,0.7)',
                  display:'flex', alignItems:'center', justifyContent:'center', transition:'background .12s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.08)' }}
                onMouseLeave={e=>{ e.currentTarget.style.background='none' }}>
                <X size={13} />
              </button>
            </div>
            {/* Body */}
            <div style={{ padding:'10px 12px 12px' }}>
              <p style={{ fontSize:13, fontWeight:600, color:'#fff', margin:'0 0 3px', lineHeight:1.35 }}>
                Marc made the 2 PM product review mandatory
              </p>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.7)', margin:'0 0 12px', lineHeight:1.45 }}>
                It conflicts with 3 meetings on your calendar. I worked out a fix — want to review it?
              </p>
              <div style={{ display:'flex', gap:6 }}>
                <button type="button" onClick={handleNotifAct}
                  style={{ flex:1, padding:'7px 10px', borderRadius:4, fontSize:12, fontWeight:600,
                    background:T.core, border:'none', color:'#fff', cursor:'pointer',
                    fontFamily:T.font, transition:'background .12s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.background=T.coreMid }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=T.core }}>
                  Review plan
                </button>
                <button type="button"
                  onClick={() => { setShowNotif(false); setNotifDone(true) }}
                  style={{ padding:'7px 12px', borderRadius:4, fontSize:12, fontWeight:600,
                    background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)',
                    color:'#fff', cursor:'pointer', fontFamily:T.font, transition:'background .12s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.14)' }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.08)' }}>
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page content + (optional) inline chat panel — share height below top bar */}
        <div style={{ flex:1, display:'flex', minHeight:0, overflow:'hidden' }}>
        <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column', minWidth:0 }}>
          {scene==='welcome' && <WelcomeScreen onLogin={handleLogin} />}
          {scene==='setup' && (
            <SetupView
              initialPrefs={prefs}
              onBack={() => { SFX.tap(); setScene(prefs ? 'app' : 'welcome') }}
              onSkip={(p) => handleSetupComplete(p)}
              onComplete={(p) => handleSetupComplete(p)} />
          )}

          {scene==='app' && tab==='today' && (
            <PageLayout background={T.surface}>

                {/* ── Hero: Ask Jarvis — compact, single-row input; intent card below is the visual hero ── */}
                <div style={{ maxWidth:620, margin:'8px auto 10px', position:'relative', zIndex:50 }}>
                  <WhisperBar hero persona={persona} coreState={coreState} setCoreState={setCoreState}
                    onCommand={cmd => {
                      const l = cmd.toLowerCase()
                      if (l.includes('manager')||l.includes('team')) setPersona('manager')
                      else if (l.includes('employee')||l.includes('my day')) setPersona('employee')
                    }} />
                </div>

                {/* ── Brief banner — below prompt categories, above filters ── */}
                <div style={{ display:'flex', alignItems:'flex-start', gap:12,
                  padding:'14px 0', marginBottom:6 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'baseline', gap:10, flexWrap:'wrap' }}>
                      <p style={{ fontSize:20, fontWeight:700, color:T.text, lineHeight:1.2, margin:0,
                        letterSpacing:'-0.01em' }}>
                        {persona==='manager'
                          ? `Your team needs ${visibleIntents.length} ${visibleIntents.length===1?'thing':'things'}.`
                          : `I handled ${overnightHandled} things overnight.`}
                      </p>
                    </div>
                  </div>
                  {/* ── View handled (N) — popover showing done + dismissed items with per-item Undo ── */}
                  {handledList.length > 0 && (
                    <div className="handled-pop" style={{ position:'relative' }}>
                      <button type="button"
                        onClick={() => { SFX.tap(); setHandledOpen(o => !o) }}
                        style={{ display:'inline-flex', alignItems:'center', gap:6,
                          padding:'5px 10px', borderRadius:99, cursor:'pointer',
                          background:T.surface, border:`1px solid ${T.border}`,
                          color:T.textMid, fontSize:12, fontWeight:600, fontFamily:T.font,
                          transition:'all .12s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = T.core; e.currentTarget.style.color = T.core }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMid }}>
                        <History size={12} />
                        Handled ({handledList.length})
                      </button>
                      {handledOpen && (
                        <div className="expand-down" style={{ position:'absolute', top:'calc(100% + 6px)', right:0,
                          width:380, maxWidth:'90vw', maxHeight:360, overflowY:'auto',
                          background:T.surface, border:`1px solid ${T.border}`, borderRadius:8,
                          boxShadow:T.shadowMd, padding:6, zIndex:110, fontFamily:T.font }}>
                          <div style={{ padding:'8px 10px 6px', display:'flex', alignItems:'baseline',
                            justifyContent:'space-between', borderBottom:`1px solid ${T.border}`, marginBottom:4 }}>
                            <p style={{ fontSize:12, fontWeight:700, color:T.text, margin:0,
                              textTransform:'uppercase', letterSpacing:'0.08em' }}>Handled today</p>
                            <p style={{ fontSize:11, color:T.textXsoft, margin:0 }}>{handledList.length} item{handledList.length===1?'':'s'}</p>
                          </div>
                          {handledList.map(({ intent, kind }) => (
                            <div key={intent.id}
                              style={{ display:'flex', alignItems:'flex-start', gap:10,
                                padding:'8px 10px', borderRadius:6,
                                transition:'background .1s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = T.surfaceMid }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'none' }}>
                              <div style={{ flexShrink:0, width:20, height:20, borderRadius:99,
                                display:'flex', alignItems:'center', justifyContent:'center',
                                background: kind==='done' ? T.greenSoft : T.surfaceMid,
                                color: kind==='done' ? T.green : T.textSoft }}>
                                {kind==='done' ? <Check size={11} /> : <X size={11} />}
                              </div>
                              <div style={{ flex:1, minWidth:0 }}>
                                <p style={{ fontSize:12, fontWeight:600, color:T.text,
                                  lineHeight:1.35, margin:0,
                                  overflow:'hidden', textOverflow:'ellipsis',
                                  display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                                  {intent.headline}
                                </p>
                                <p style={{ fontSize:11, color:T.textSoft, margin:'2px 0 0' }}>
                                  {kind==='done' ? 'Marked done' : 'Removed from today'}
                                  {intent.cat ? ` · ${intent.cat}` : ''}
                                </p>
                              </div>
                              <button type="button"
                                onClick={() => {
                                  SFX.tap()
                                  kind==='done' ? undoDone(intent.id) : undoDismiss(intent.id)
                                }}
                                style={{ flexShrink:0, padding:'4px 10px', borderRadius:4,
                                  background:'none', border:`1px solid ${T.border}`,
                                  color:T.core, fontSize:11, fontWeight:700, fontFamily:T.font,
                                  cursor:'pointer', transition:'all .12s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = T.coreSoft; e.currentTarget.style.borderColor = T.core }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = T.border }}>
                                Undo
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Jarvis overnight insight — informational banner, NOT a card.
                       No card radius, no shadow, no hover. Sits under heading, above filters. ── */}
                <div role="note" aria-label="Jarvis overnight insight"
                  style={{ display:'flex', alignItems:'center', gap:10,
                    padding:'8px 12px 8px 10px', marginBottom:14,
                    borderLeft:`3px solid ${T.core}`,
                    background:`linear-gradient(90deg, ${T.coreSoft} 0%, transparent 85%)`,
                    cursor:'default', userSelect:'text' }}>
                  <span style={{ flexShrink:0, display:'inline-flex', alignItems:'center', gap:5,
                    fontSize:10, fontWeight:700, color:T.core,
                    textTransform:'uppercase', letterSpacing:'0.1em' }}>
                    <Sparkles size={11} color={T.core} />
                    Overnight insight
                  </span>
                  <span style={{ width:1, height:12, background:T.border, flexShrink:0 }} />
                  <p style={{ flex:1, fontSize:13, fontWeight:500, lineHeight:1.45, color:T.textMid, margin:0 }}>
                    {persona==='manager'
                      ? <>Your team's velocity is <strong style={{ color:T.text }}>12% above target</strong> — but Liam's hours are masking a dependency risk on the Auth refactor.</>
                      : <>Your last 3 PTO requests were approved in under 24h. If the current one stalls past tomorrow, I'll flag it.</>}
                  </p>
                </div>

                {/* ── Filter pills — click to filter intent cards ── */}
                <div role="tablist" aria-label="Filter intents"
                  style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap' }}>
                  {[
                    { key:null,         val: notDismissed.length,                                    label:'All',           color:T.text,  dot:T.textXsoft },
                    { key:'meetings',   val: notDismissed.filter(INTENT_FILTERS.meetings).length,   label:'Meetings',      color:T.blue,  dot:T.blue  },
                    { key:'decision',   val: notDismissed.filter(INTENT_FILTERS.decision).length,   label:'Need decision', color:T.amber, dot:T.amber },
                    { key:'followups',  val: notDismissed.filter(INTENT_FILTERS.followups).length,  label:'Follow-ups',    color:T.teal,  dot:T.teal  },
                  ].map((f, i) => {
                    const active = todayFilter === f.key
                    const activeBg = active ? f.color : T.surface
                    const activeIsLight = active && f.color === T.text
                    const activeFg = active ? (activeIsLight ? T.appBg : '#fff') : T.textMid
                    const activeCountBg = active ? (activeIsLight ? T.surfaceMid : 'rgba(255,255,255,0.22)') : T.surfaceMid
                    const activeCountFg = active ? (activeIsLight ? T.text : '#fff') : T.textSoft
                    return (
                      <button key={i} role="tab" aria-selected={active} type="button"
                        onClick={() => { SFX.tap(); HX.tap(); setTodayFilter(f.key) }}
                        style={{ display:'inline-flex', alignItems:'center', gap:8,
                          padding:'8px 14px', borderRadius:99, cursor:'pointer',
                          background: activeBg,
                          border: `1px solid ${active ? f.color : T.border}`,
                          color: activeFg,
                          fontSize:13, fontWeight:600, fontFamily:T.font,
                          boxShadow: active ? T.shadowSm : 'none',
                          transition:'all .12s' }}
                        onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = f.color; e.currentTarget.style.color = f.color } }}
                        onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMid } }}>
                        <span>{f.label}</span>
                        <span style={{
                          display:'inline-flex', alignItems:'center', justifyContent:'center',
                          minWidth:20, height:18, padding:'0 6px', borderRadius:99,
                          background: activeCountBg,
                          color: activeCountFg,
                          fontSize:11, fontWeight:700, lineHeight:1,
                        }}>{f.val}</span>
                      </button>
                    )
                  })}
                </div>

                {/* ── Two-column body — both scroll with the page ── */}
                <div style={{ display:'flex', alignItems:'flex-start', gap:24 }}>

                  {/* Left: intent cards — 60% */}
                  <div style={{ flex:3, minWidth:0 }}>

                    {isDayCleared ? (
                      <div className="pop" style={{ padding:'32px 28px', borderRadius:12,
                        background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadowMd,
                        backgroundImage:`radial-gradient(60% 90% at 50% -10%, ${T.coreSoft}, transparent 70%)` }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                          <JarvisMark size={36} radius={10} style={{ animation:'breathe 2s ease-in-out infinite' }} />
                          <p style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:T.core, margin:0 }}>
                            Day cleared
                          </p>
                        </div>
                        <h2 style={{ fontSize:28, fontWeight:700, color:T.text, margin:'0 0 6px', letterSpacing:'-0.01em' }}>
                          That's the lot.
                        </h2>
                        <p style={{ fontSize:15, color:T.textSoft, margin:'0 0 16px', lineHeight:1.6 }}>
                          I'll keep watching. Anything else you'd like me to look at?
                        </p>
                        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                          <button type="button"
                            onClick={() => { SFX.tap(); setTab('feed') }}
                            style={{ display:'inline-flex', alignItems:'center', gap:6,
                              padding:'10px 14px', borderRadius:4, cursor:'pointer',
                              background:T.core, border:'none', color:'#fff',
                              fontSize:13, fontWeight:700, fontFamily:T.font }}>
                            <History size={14} /> Show what I did today
                          </button>
                          <button type="button"
                            onClick={() => { SFX.tap(); openChat({ headline:'Plan tomorrow', tier:'L1', source:'Jarvis' }, null, 'Plan tomorrow') }}
                            style={{ display:'inline-flex', alignItems:'center', gap:6,
                              padding:'10px 14px', borderRadius:4, cursor:'pointer',
                              background:'none', border:`1px solid ${T.border}`, color:T.text,
                              fontSize:13, fontWeight:700, fontFamily:T.font }}>
                            <Sparkles size={14} /> Plan tomorrow
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {heroIntent && (
                          <HeroCard intent={heroIntent} onAct={handleAct} onDone={handleDone} onDismiss={handleDismiss} onRemind={handleRemind}
                            isDone={doneIds.includes(heroIntent.id)}
                            />
                        )}
                        {restIntents.map((intent, i) => (
                          <IntentCard key={intent.id} intent={intent} idx={i}
                            onAct={handleAct} onDone={handleDone} onDismiss={handleDismiss} onRemind={handleRemind}
                            isDone={doneIds.includes(intent.id)}
                            />
                        ))}
                        {prefs && (
                          <p style={{ fontSize:12, color:T.textSoft, margin:'16px 0 0', textAlign:'center' }}>
                            Personalised from your Set up ·{' '}
                            <button type="button"
                              onClick={() => { SFX.tap(); setScene('setup') }}
                              style={{ padding:0, background:'none', border:'none', cursor:'pointer',
                                color:T.core, fontSize:12, fontWeight:600, fontFamily:T.font,
                                textDecoration:'underline', textUnderlineOffset:2 }}>
                              Edit →
                            </button>
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Right: schedule — 40% */}
                  <div style={{ flex:2, minWidth:0 }}>
                    <RightPanel onEventClick={handleEventClick} onAddMeeting={() => setShowAddMeeting(true)} />
                  </div>

                </div>
            </PageLayout>
          )}

          {scene==='app' && tab==='conversations' && (
            <ConversationsView openConvId={openConvId} onConvOpen={id=>setOpenConvId(id)}
              persona={persona} coreState={coreState} setCoreState={setCoreState} />
          )}
          {scene==='app' && tab==='feed' && <FeedView />}
          {scene==='app' && tab==='agents' && <AgentsView onNew={() => setShowWizard(true)} />}
        </div>

        {/* Chat sidebar — sits side-by-side with the page content, inside the
            app column. Does not overlap the Teams top bar or the demo bar. */}
        {showChat && (
          <ChatPanel item={chatItem} scenario={chatScenario} preselect={chatPreselect} setCoreState={setCoreState}
            activeTab={chatTab} setActiveTab={setChatTab}
            onExpandFull={expandToConversations}
            onClose={() => { setShowChat(false); setChatItem(null); setChatScenario(null); setChatPreselect(null); setCoreState('idle') }} />
        )}

        </div>{/* /page-content + chat row */}
      </div>

      </div>{/* /main area (rail + column) */}

      {showWizard && <AgentWizard onClose={() => setShowWizard(false)} />}
      {showAddMeeting && <AddMeetingModal onClose={() => setShowAddMeeting(false)} />}
      {showCapabilities && (
        <CapabilitiesDrawer
          prefs={prefs}
          onClose={() => setShowCapabilities(false)}
          onGrantSystem={(sysId) => { setShowCapabilities(false); setScene('setup') }} />
      )}


      {/* Lightweight global toast with optional Undo affordance */}
      {toast && (
        <div className="enter" style={{ position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)',
          zIndex:220, padding:'8px 10px 8px 14px', borderRadius:8, fontSize:13, fontWeight:500,
          background:'#292929', color:'#fff', fontFamily:T.font,
          boxShadow:'0 8px 24px rgba(0,0,0,0.35)', display:'flex', alignItems:'center', gap:12 }}>
          {toast.kind === 'done'
            ? <Check size={13} color={T.green} />
            : toast.kind === 'dismissed'
              ? <X size={13} color={T.textSoft} />
              : <Bell size={13} color={T.blue} />}
          <span style={{ paddingRight: toast.onUndo ? 0 : 2 }}>{toast.msg}</span>
          {toast.onUndo && (
            <button type="button"
              onClick={() => { SFX.tap(); toast.onUndo() }}
              style={{ padding:'4px 10px', borderRadius:4, fontSize:12, fontWeight:700,
                background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)',
                color:'#fff', cursor:'pointer', fontFamily:T.font, letterSpacing:'0.02em',
                transition:'background .12s' }}
              onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.18)' }}
              onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.08)' }}>
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  )
}

