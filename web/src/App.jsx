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
  ThumbsUp, ThumbsDown, Info, Flag,
  Coffee, Brain, Leaf, Dumbbell, BookOpen,
  Phone, ArrowLeft, MoreHorizontal, Minus, Square,
  Compass, Wand2, PenSquare, Lightbulb,
  Cloud, Mail, Briefcase, Layers, LifeBuoy, GitBranch, Hash as HashIcon,
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
    // Backgrounds — Fluent colorNeutralBackground scale
    appBg:       '#F5F5F5',   // colorNeutralBackground3
    surface:     '#FFFFFF',   // colorNeutralBackground1
    surfaceMid:  '#FAFAFA',   // colorNeutralBackground2
    surfaceBlur: '#FFFFFF',   // flat — no blur surfaces
    rail:        '#E5EDF3',   // Teams chrome neutral blue-gray
    topBar:      '#E5EDF3',   // Teams chrome neutral blue-gray
    // Brand — Fluent brand purple
    core:        '#5C2E91',
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
    shadowSm:    '0 0 2px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.14)',   // shadow2
    shadowMd:    '0 0 2px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.14)',   // shadow8
    shadowPurple:'0 0 2px rgba(92,46,145,0.14), 0 4px 12px rgba(92,46,145,0.18)',
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
    // Borders — Fluent dark colorNeutralStroke (solid)
    border:      '#666666',   // colorNeutralStroke1 dark
    borderMid:   '#525252',   // colorNeutralStroke2 dark
    // Shadows — darker two-layer
    shadowSm:    '0 0 2px rgba(0,0,0,0.28), 0 1px 2px rgba(0,0,0,0.32)',
    shadowMd:    '0 0 2px rgba(0,0,0,0.28), 0 4px 8px rgba(0,0,0,0.32)',
    shadowPurple:'0 0 2px rgba(155,110,200,0.2), 0 4px 12px rgba(155,110,200,0.28)',
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
`


// ─── Static data ──────────────────────────────────────────────────────────────
const INTENTS = [
  { id:'hero', tier:'L3', cat:'Most important right now', isHero:true,
    headline:'Legal approval is blocking your analytics pipeline',
    why:'DPA with CloudMetrics was filed 5 days ago. Amy Torres (reviewer) returns Wednesday — but pipeline go-live is Friday. SLA already breached.',
    action:'Draft escalation to General Counsel',
    source:'Salesforce · Case #DPA-8821',
    evidence:'SLA breached +2 days · Amy Torres OOO until May 4',
    chatScenario:'p1' },
  { id:'y1', tier:'L2', cat:'Yesterday',
    headline:'Q2 planning left 3 unowned actions',
    why:'Email thread has 3 unread replies. Confluence page not updated in 4 days.',
    action:'Review & assign owners', source:'Outlook · Q2 Planning',
    evidence:'3 unread replies · Confluence page stale 4 days', chatScenario:null },
  { id:'y2', tier:'L1', cat:'Yesterday',
    headline:'Security cert expires in 3 days',
    why:'Annual compliance training incomplete. Deadline: Apr 30.',
    action:'Open LMS portal', source:'Workday · Compliance',
    evidence:'Deadline Apr 30 · ~45 min to complete', chatScenario:null },
  { id:'f1', tier:'L3', cat:'Follow-up needed',
    headline:'Acme SOW needs your revision by EOD Thursday',
    why:'Legal approved redlines at 09:14. Sections 3.2 and 4.1 need update before sending to Maria Chen.',
    action:'Open SOW draft', source:'Outlook · Acme SOW v3',
    evidence:'Due May 1 to Maria Chen · Legal redlines approved 09:14', chatScenario:null },
  { id:'f2', tier:'L1', cat:'Follow-up needed',
    headline:'Jordan Parker scorecard due in 18 hours',
    why:'Hiring panel debrief Wednesday 11 AM. Scorecard needed before then.',
    action:'Submit scorecard', source:'Greenhouse · Jordan Parker',
    evidence:'Debrief Wed 11 AM · Staff Engineer role', chatScenario:null },
  { id:'e1', tier:'L2', cat:'In 90 minutes',
    headline:'QBR with SVP — prep bundle ready',
    why:'Deck found, 3 open actions surfaced, SVP context compiled.',
    action:'Open prep bundle', source:'Outlook · 10:00 AM', prepReady:true,
    evidence:'SVP meeting at 10 AM · 3 open actions from Apr 14', chatScenario:'prep' },
  { id:'e2', tier:'L4', cat:'Today 2:00 PM',
    headline:'Prod deploy v3.8.2 — gate required',
    why:'CR-4471 approved. Blue/Green traffic shift needs your explicit confirmation.',
    action:'Review & arm', source:'Jira · CR-4471',
    evidence:'Gate at 2 PM · Raj Mehta on-call, rollback ready', chatScenario:null },
  { id:'p2', tier:'L2', cat:'Pending with you',
    headline:'Datadog license stuck in IT security — day 10',
    why:'Finance approved. IT security SLA is 5 days; currently at 10. Jarvis can draft a follow-up.',
    action:'Chase IT security', source:'ServiceNow · INC0038912',
    evidence:'IT Security SLA +5 days · Finance already approved', chatScenario:'diskspace' },
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
  p1:[{
    role:'j',
    text:"I've pulled the full picture on Case #DPA-8821.\n\n**What's happening:** Amy Torres is OOO until Wednesday but your pipeline go-live is Friday. SLA already breached by 2 days.\n\nWhat would you like to do?",
    trace:{
      summary:'Compiled 3 sources and surfaced 2 actions',
      steps:[
        { label:'Loaded Case #DPA-8821 from Salesforce', plugin:'SalesforcePlugin',
          bullets:['Status: In Review','SLA breached +2 days','Assigned reviewer: Amy Torres'] },
        { label:'Checked Amy Torres availability', plugin:'WorkdayPlugin',
          bullets:['OOO until May 4','No backup reviewer assigned'] },
        { label:'Retrieved General Counsel contact', plugin:'SalesforcePlugin',
          bullets:['gc@orgfarm.com · Direct line confirmed'] },
      ]
    },
    actions:[
      { label:'Draft escalation to General Counsel', key:'A' },
      { label:'Set Thursday morning reminder', key:'B' },
      { label:'Show full case timeline', key:'C' },
    ],
    sources:[
      { name:'Case #DPA-8821', updated:'5 days ago', icon:Database, color:'#8C4B02' },
      { name:'Acme SOW v3 - Redlines.docx', updated:'Today 09:14 · Legal', icon:FileText, color:'#7526E3' },
    ]
  }],
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
    sources:[
      { name:'QBR-H2-2026.pptx', updated:'Yesterday · Priya', icon:FileText, color:'#0B5CAB' },
      { name:'Apr 14 Meeting Notes.docx', updated:'18 days ago · Alex', icon:FileText, color:'#2E844A' },
    ]
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
      { label:'Approve all 3', key:'approve_all' },
      { label:'Review individually', key:'review' },
      { label:'Reject all', key:'reject' },
    ]
  }],
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
    flowSteps:[
      { label:'Loaded Case #DPA-8821 from Salesforce', plugin:'SalesforcePlugin' },
      { label:'Checked Amy Torres OOO status', plugin:'WorkdayPlugin' },
      { label:'Retrieved General Counsel contact', plugin:'SalesforcePlugin' },
    ],
    messages:[
      {role:'j',
        text:"I've pulled the full picture on Case #DPA-8821.\n\n**Situation:** Amy Torres is OOO until Wednesday but your pipeline go-live is Friday. SLA already breached by 2 days.\n\nWhat would you like to do?",
        trace:{
          summary:'Compiled 3 sources and surfaced 2 actions',
          steps:[
            { label:'Loaded Case #DPA-8821 from Salesforce', plugin:'SalesforcePlugin', bullets:['Status: In Review','SLA breached +2 days'] },
            { label:'Checked Amy Torres availability', plugin:'WorkdayPlugin', bullets:['OOO until May 4','No backup assigned'] },
            { label:'Retrieved General Counsel contact', plugin:'SalesforcePlugin' },
          ]
        },
        actions:[
          { label:'Draft escalation to General Counsel', key:'A' },
          { label:'Set Thursday morning reminder', key:'B' },
          { label:'Show full case timeline', key:'C' },
        ],
        sources:[
          { name:'Case #DPA-8821', updated:'5 days ago', icon:Database, color:'#8C4B02' },
          { name:'Acme SOW v3 - Redlines.docx', updated:'Today 09:14 · Legal', icon:FileText, color:'#7526E3' },
        ]
      },
    ]},
  { id:'cv2', title:'QBR prep — SVP meeting 10:00 AM',
    preview:'Deck found, 3 open actions surfaced, SVP context compiled.',
    time:'09:02', date:'Today', category:'Meetings', unread:0,
    flowSteps:[
      { label:'Located QBR deck in SharePoint', plugin:'SharePointPlugin' },
      { label:'Surfaced Apr 14 meeting notes', plugin:'OutlookPlugin' },
      { label:'Fetched SVP briefing history', plugin:'SalesforcePlugin' },
      { label:'Drafted 3-point opener', plugin:'ClaudePlugin' },
    ],
    messages:[
      {role:'j',
        text:"**QBR prep bundle — ready for 10:00 AM**\n\n📄 **Deck:** QBR-H2-2026.pptx (Priya edited yesterday)\n📋 **3 open actions** from Apr 14 — none closed\n💬 **SVP context:** Last discussion was budget; she flagged the 18% incident improvement\n\nShall I draft a 3-point opener?",
        trace:{
          summary:'Compiled 4 sources and surfaced 3 open actions',
          steps:[
            { label:'Located QBR deck in SharePoint', plugin:'SharePointPlugin', bullets:['Last edited yesterday by Priya Nair'] },
            { label:'Surfaced Apr 14 meeting notes', plugin:'OutlookPlugin', bullets:['3 open actions — none closed'] },
            { label:'Retrieved SVP briefing history', plugin:'SalesforcePlugin', bullets:['Budget flagged · 18% incident improvement noted'] },
          ]
        },
        sources:[
          { name:'QBR-H2-2026.pptx', updated:'Yesterday · Priya', icon:FileText, color:'#0B5CAB' },
          { name:'Apr 14 Meeting Notes.docx', updated:'18 days ago · Alex', icon:FileText, color:'#2E844A' },
        ]
      },
      {role:'u', text:"Yes, draft the opener please"},
      {role:'j', text:"Here's a 3-point opener:\n\n1. **Progress on reliability** — We hit 99.95% uptime, a direct result of the incident process changes you asked about last quarter.\n2. **Revenue pipeline** — 3 deals at final stage, total ARR $2.1M. Acme is the largest, and we're on track.\n3. **Ask** — Approval to accelerate the CloudMetrics data pipeline (blocked by Legal right now — separate thread)."},
    ]},
  { id:'cv3', title:'P1 Incident — Auth Service Down',
    preview:'Raj Mehta assigned as incident owner. War room open.',
    time:'08:47', date:'Today', category:'Incidents', unread:0,
    flowSteps:[
      { label:'Detected 503 spike via Datadog', plugin:'DatadogPlugin' },
      { label:'Identified 3 impacted enterprise accounts', plugin:'SalesforcePlugin' },
      { label:'Assigned incident owner: Raj Mehta', plugin:'SalesforcePlugin' },
      { label:'Sent Teams notification to Raj', plugin:'TeamsPlugin' },
    ],
    messages:[
      {role:'j',
        text:"🔴 **P1: Auth Service Down — INC-9942**\n\nEU-West-1 returning 503s on /v1/auth. 3 enterprise customers impacted. Incident owner: unassigned.\n\n**On-call identified:** Raj Mehta — available now.",
        trace:{
          summary:'Detected anomaly across 2 services and identified on-call',
          steps:[
            { label:'Detected 503 spike on /v1/auth', plugin:'DatadogPlugin', bullets:['Error rate: 94%','4 min ago'] },
            { label:'Identified 3 impacted accounts', plugin:'SalesforcePlugin', bullets:['Acme Corp · CloudMetrics · TechBridge'] },
            { label:'Located on-call: Raj Mehta', plugin:'WorkdayPlugin', bullets:['Status: Available'] },
          ]
        },
        actions:[
          { label:'Assign Raj as owner', key:'A' },
          { label:'Send Raj a Teams message', key:'B' },
          { label:'Open a war room channel', key:'C' },
        ]
      },
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
      style={{ borderRadius:8, background:T.surface, border:`1px solid ${hov ? T.borderMid : T.border}`,
        boxShadow: hov ? T.shadowMd : T.shadowSm,
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
    primary:  { background:hov?T.coreMid:T.core,       color:'white',  border:'none',                    shadow: hov ? T.shadowPurple : 'none' },
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
        <div style={{ width:32, height:32, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
          background:T.coreGrad, animation:c.anim }}>
          <Sparkles size={15} color="white" />
        </div>
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
    <div className="done" style={{ marginBottom:12, padding:'14px 18px', borderRadius:16,
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
    <div className="enter" data-clickable onClick={() => { SFX.tap(); HX.tap(); onAct(intent) }}
      onMouseEnter={e => { setHover(true); e.currentTarget.style.boxShadow=T.shadowMd }}
      onMouseLeave={e => { setHover(false); e.currentTarget.style.boxShadow=T.shadowSm }}
      style={{ marginBottom:12, borderRadius:8, overflow:'hidden', position:'relative', cursor:'pointer',
        background:T.surface, border:`1px solid ${T.border}`,
        boxShadow:T.shadowSm, transition:'box-shadow .15s' }}>
      <CardActionRow size={26} visible={hover}
        onDone={() => { SFX.done(); HX.done(); onDone(intent.id) }}
        onRemind={() => { SFX.tap(); HX.tap(); onRemind?.(intent.id) }}
        onRemove={() => { SFX.tap(); onDismiss(intent.id) }} />
      <div style={{ padding:'16px 18px' }}>
        {/* Source — identifies where this came from */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          {(() => {
            const { vendors } = parseSource(intent.source)
            return (
              <>
                <span style={{ display:'inline-flex', alignItems:'center' }}>
                  {vendors.map((v, i) => (
                    <span key={i} style={{ marginLeft: i === 0 ? 0 : -4 }}>
                      <SourceIcon src={v} size={14} />
                    </span>
                  ))}
                </span>
                <span style={{ fontSize:12, fontWeight:600, color:T.textSoft }}>
                  {vendors.map(v => v.name).join(' · ')}
                </span>
              </>
            )
          })()}
        </div>
        <h2 style={{ fontSize:15, fontWeight:700, lineHeight:1.35, color:T.text, marginBottom:7, paddingRight:68 }}>{intent.headline}</h2>
        <p style={{ fontSize:14, lineHeight:1.6, color:T.textMid, marginBottom:14 }}>{intent.why}</p>
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
    <div className="done" style={{ marginBottom:8, padding:'10px 14px', borderRadius:12,
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
    <div className="enter" data-clickable onClick={() => { SFX.tap(); HX.tap(); onAct(intent) }}
      onMouseEnter={e => { setHover(true); e.currentTarget.style.boxShadow=T.shadowMd }}
      onMouseLeave={e => { setHover(false); e.currentTarget.style.boxShadow=T.shadowSm }}
      style={{ marginBottom:8, borderRadius:8, overflow:'hidden', animationDelay:`${idx*.05}s`, cursor:'pointer',
        background:T.surface, border:`1px solid ${T.border}`,
        boxShadow:T.shadowSm, transition:'box-shadow .15s' }}>
      <div style={{ padding:'11px 13px 12px', position:'relative' }}>
        <CardActionRow size={24} visible={hover}
          onDone={() => { SFX.done(); HX.done(); onDone(intent.id) }}
          onRemind={() => { SFX.tap(); HX.tap(); onRemind?.(intent.id) }}
          onRemove={() => { SFX.tap(); onDismiss(intent.id) }} />
        {/* Source — identifies where this came from (+ optional prep flag) */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
          {(() => {
            const { vendors } = parseSource(intent.source)
            return (
              <>
                <span style={{ display:'inline-flex', alignItems:'center' }}>
                  {vendors.map((v, i) => (
                    <span key={i} style={{ marginLeft: i === 0 ? 0 : -4 }}>
                      <SourceIcon src={v} size={14} />
                    </span>
                  ))}
                </span>
                <span style={{ fontSize:12, fontWeight:600, color:T.textSoft }}>
                  {vendors.map(v => v.name).join(' · ')}
                </span>
              </>
            )
          })()}
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
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', zIndex:300,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(6px)' }}>
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
function ActionChips({ actions, onChipClick }) {
  const T = window.__T
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:10 }}>
      {actions.map(a => (
        <button key={a.key} type="button"
          onClick={() => { SFX.tap(); HX.tap(); onChipClick(a.label) }}
          style={{ fontSize:13, fontWeight:600, padding:'5px 12px', borderRadius:4, cursor:'pointer',
            background:T.surface, color:T.text, border:`1px solid ${T.border}`,
            transition:'all .15s', fontFamily:T.font }}
          onMouseEnter={e => { e.currentTarget.style.background=T.coreSoft; e.currentTarget.style.borderColor=T.core; e.currentTarget.style.color=T.core }}
          onMouseLeave={e => { e.currentTarget.style.background=T.surface; e.currentTarget.style.borderColor=T.borderMid; e.currentTarget.style.color=T.text }}>
          {a.label}
        </button>
      ))}
    </div>
  )
}

// ─── AgentTrace ──────────────────────────────────────────────────────────────
function AgentTrace({ trace }) {
  const T = window.__T
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderRadius:4, background:T.coreSoft, border:`1px solid ${T.borderMid}`, marginTop:8, overflow:'hidden' }}>
      {/* Header row */}
      <button type="button" onClick={() => { SFX.tap(); setOpen(o=>!o) }}
        style={{ width:'100%', display:'flex', alignItems:'center', gap:7, padding:'8px 10px',
          background:'none', border:'none', cursor:'pointer', textAlign:'left', fontFamily:T.font }}>
        <Sparkles size={10} color={T.core} style={{ flexShrink:0 }} />
        <span style={{ flex:1, fontSize:13, fontWeight:600, color:T.core, lineHeight:1.4 }}>{trace.summary}</span>
        <ChevronDown size={12} color={T.core} style={{ flexShrink:0, transition:'transform .2s', transform:open?'rotate(180deg)':'rotate(0deg)' }} />
      </button>
      {/* Expanded steps */}
      {open && (
        <div className="expand-down" style={{ padding:'4px 10px 10px', borderTop:`1px solid ${T.core}15` }}>
          {trace.steps.map((step, si) => (
            <div key={si} style={{ marginTop:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:step.bullets?.length?4:0 }}>
                <div style={{ width:16, height:16, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                  background:T.greenSoft }}>
                  <Check size={8} color={T.green} />
                </div>
                <span style={{ fontSize:13, fontWeight:600, color:T.text, flex:1 }}>{step.label}</span>
                {step.plugin && (
                  <span style={{ fontSize:12, fontWeight:600, padding:'2px 7px', borderRadius:4,
                    background:`${T.core}15`, color:T.core, border:`1px solid ${T.border}`,
                    whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:3 }}>
                    <Database size={8} />{step.plugin}
                  </span>
                )}
              </div>
              {step.bullets?.map((b,bi) => (
                <div key={bi} style={{ display:'flex', alignItems:'flex-start', gap:5, paddingLeft:22, marginTop:2 }}>
                  <span style={{ color:T.textXsoft, fontSize:14, marginTop:1 }}>·</span>
                  <span style={{ fontSize:14, color:T.textSoft, lineHeight:1.5 }}>{b}</span>
                </div>
              ))}
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
    <div style={{ display:'flex', alignItems:'center', gap:1, marginTop:4, paddingLeft:34 }}>
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

// ─── MessageTable ─────────────────────────────────────────────────────────────
function MessageTable({ table }) {
  const T = window.__T
  return (
    <div style={{ overflowX:'auto', marginTop:10, borderRadius:4, border:`1px solid ${T.border}` }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
        <thead>
          <tr>
            {table.headers.map((h,i) => (
              <th key={i} style={{ padding:'7px 10px', textAlign:'left', fontWeight:700,
                background:T.surfaceMid, color:T.textMid, fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em',
                borderBottom:`1px solid ${T.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri%2===0 ? T.surface : T.surfaceMid }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding:'7px 10px', color:T.text, borderBottom: ri<table.rows.length-1?`1px solid ${T.border}`:'none' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── renderBubble ─────────────────────────────────────────────────────────────
function renderBubble(m, T, onChipClick) {
  return (
    <div>
      {renderMsgText(m.text, T)}
      {m.trace && <AgentTrace trace={m.trace} />}
      {m.sources && <SourceChips sources={m.sources} />}
      {m.table && <MessageTable table={m.table} />}
      {m.actions && <ActionChips actions={m.actions} onChipClick={onChipClick} />}
    </div>
  )
}

// ─── Chat Panel (4 tabs) ──────────────────────────────────────────────────────
// Build a conversational opening message + proposed action chips for any intent id.
// Keeps tone natural (rephrase the situation) rather than restating the card verbatim.
function buildIntentOpening(item) {
  // Per-intent scripted openings — conversational tone, 3 proposed next actions.
  const byId = {
    y1: {
      text: "The Q2 planning thread has 3 replies with no owner, and the Confluence page hasn't been touched in 4 days.\n\nWant me to pick owners from the thread and draft assignments, or pull the full thread so you can decide?",
      actions: [
        { label:'Propose owners & draft assignments', key:'A' },
        { label:'Show me the full thread', key:'B' },
        { label:'Post in the team channel for owners', key:'C' },
      ],
    },
    y2: {
      text: "Your annual compliance training is due Apr 30 — it's about 45 minutes and you haven't started yet.\n\nI can open it now, block time on your calendar, or remind you tomorrow.",
      actions: [
        { label:'Open training now', key:'A' },
        { label:'Block 45 min tomorrow morning', key:'B' },
        { label:'Remind me tomorrow at 9 AM', key:'C' },
      ],
    },
    f1: {
      text: "Legal approved the Acme SOW redlines at 09:14 today. Sections 3.2 and 4.1 still need your updates before it goes to Maria Chen tomorrow.\n\nWant me to draft those two sections from Legal's notes, or open the doc so you can handle it?",
      actions: [
        { label:'Draft sections 3.2 & 4.1 from redlines', key:'A' },
        { label:'Open the SOW draft', key:'B' },
        { label:'Share status with Maria', key:'C' },
      ],
    },
    f2: {
      text: "Jordan Parker's hiring debrief is Wednesday at 11 AM. The scorecard is the one thing holding up the debrief.\n\nI can pre-fill it from your interview notes, or just open a blank form.",
      actions: [
        { label:'Pre-fill from my interview notes', key:'A' },
        { label:'Open a blank scorecard', key:'B' },
        { label:'Remind me tonight', key:'C' },
      ],
    },
    e2: {
      text: "CR-4471 is approved and the deploy gate for v3.8.2 opens at 2 PM. Raj Mehta is on-call and rollback is staged.\n\nHow would you like to handle the arming?",
      actions: [
        { label:'Arm Blue/Green shift now', key:'A' },
        { label:'Walk me through the rollback plan', key:'B' },
        { label:'Ping Raj before we arm', key:'C' },
      ],
    },
    m2: {
      text: "Four engineers are slow on React 19 work — averaging 3.2 days per ticket vs 1.8 expected. There's a Masterclass Friday 2–4 PM with no calendar conflicts.\n\nWant me to enrol all four, or share the invite so they can opt in?",
      actions: [
        { label:'Enrol all 4 engineers', key:'A' },
        { label:'Share invite, let them opt in', key:'B' },
        { label:'Show me the per-engineer breakdown', key:'C' },
      ],
    },
    m3: {
      text: "Candidate A scored 94/100 — well clear of B (81) and C (79). Panels are aligned, budget is confirmed, and the offer draft (with $12k relocation) is ready.\n\nShall I send the offer, or do you want to review the candidate files first?",
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
    { id:'docs', label:'Docs', Icon:FileText },
    { id:'people', label:'People', Icon:Users },
    { id:'channels', label:'Channels', Icon:Hash },
  ]

  const T2 = window.__T
  const renderMsg = (text) => renderMsgText(text, T2)

  return (
    <div className="enter-r" style={{ position:'fixed', right:0, top:0, bottom:0, width:400, display:'flex', flexDirection:'column',
      zIndex:50, background:T.surface,
      borderLeft:`1px solid ${T.border}`, boxShadow:`-4px 0 12px rgba(0,0,0,0.08)` }}>
      {/* Header */}
      <div style={{ padding:'14px 16px', borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
              background:T.coreGrad }}>
              <Sparkles size={15} color="white" />
            </div>
            <div>
              <p style={{ fontSize:15, fontWeight:700, color:T.text }}>Jarvis</p>
              <p style={{ fontSize:14, color:T.textSoft }}>
                {scenario==='incident'?'🔴 P1 Active':'Negotiation workspace'}
              </p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <button type="button" title="Open full screen" onClick={() => { SFX.tap(); onExpandFull?.() }}
              style={{ width:28, height:28, borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center',
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
              fontSize:13, fontWeight:600, border:'none', borderRadius:0, background:'none', cursor:'pointer', position:'relative',
              color: activeTab===id ? T.core : T.textSoft, transition:'color .15s' }}>
            <Icon size={12} />{label}
            {activeTab===id && <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2,
              background:T.core }} />}
          </button>
        ))}
      </div>

      {/* Context card — Chat tab only */}
      {activeTab==='chat' && item && !scenario && (
        <div style={{ margin:'12px 14px 0', padding:'11px 13px', borderRadius:4,
          background:T.surfaceMid, border:`1px solid ${T.border}` }}>
          <p style={{ fontSize:14, fontWeight:700, color:T.text, lineHeight:1.4, marginBottom:7 }}>{item.headline}</p>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            <TierDot tier={item.tier} />
            <Chip text={item.source} />
          </div>
          {item.evidence && (
            <p style={{ fontFamily:'monospace', fontSize:13, marginTop:8, color:T.textSoft, lineHeight:1.5 }}>
              <span style={{ display:'block', fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', color:T.textXsoft, marginBottom:3 }}>Evidence</span>
              {item.evidence}
            </p>
          )}
        </div>
      )}

      {/* Chat messages */}
      {activeTab==='chat' && (
        <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
          {messages.map((m,i) => (
            <div key={i} className="enter" style={{ animationDelay:`${i*.04}s` }}>
              <div style={{ display:'flex', justifyContent:m.role==='u'?'flex-end':'flex-start' }}>
                {m.role==='j' && (
                  <div style={{ width:26, height:26, borderRadius:6, flexShrink:0, marginRight:8, marginTop:2,
                    display:'flex', alignItems:'center', justifyContent:'center', background:T.coreGrad }}>
                    <Sparkles size={12} color="white" />
                  </div>
                )}
                <div style={{ maxWidth:'84%', padding:'10px 13px', fontSize:14, lineHeight:1.6,
                  borderRadius:8,
                  ...(m.role==='u'
                    ? { background:T.core, color:'white', borderBottomRightRadius:2 }
                    : { background:T.surfaceMid, color:T.text, border:`1px solid ${T.border}`, borderBottomLeftRadius:2 }) }}>
                  {m.role==='j' ? renderBubble(m, T, (label) => sendText(label)) : renderMsg(m.text)}
                </div>
              </div>
              {m.role==='j' && <MessageFeedback msgIndex={i} />}
            </div>
          ))}
          {thinking && (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:26, height:26, borderRadius:6, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:T.coreGrad }}>
                <Sparkles size={12} color="white" />
              </div>
              <div style={{ padding:'10px 14px', borderRadius:8, borderBottomLeftRadius:2, display:'flex', alignItems:'center', gap:5,
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
          <p style={{ fontSize:14, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:T.textXsoft, marginBottom:4 }}>Related documents</p>
          {CHAT_DOCS.map((doc, i) => (
            <div key={i} className="enter" style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 13px', borderRadius:4,
              background:T.surfaceMid, border:`1px solid ${T.border}`, cursor:'pointer', transition:'all .15s', animationDelay:`${i*.06}s` }}
              onMouseEnter={e => { e.currentTarget.style.background=T.surface; e.currentTarget.style.borderColor=T.borderMid }}
              onMouseLeave={e => { e.currentTarget.style.background=T.surfaceMid; e.currentTarget.style.borderColor=T.border }}>
              <div style={{ width:34, height:34, borderRadius:4, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                background:`${doc.color}12` }}>
                <doc.Icon size={15} color={doc.color} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:14, fontWeight:600, color:T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.name}</p>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3 }}>
                  <Chip text={doc.type} color={doc.color} />
                  <span style={{ fontSize:14, color:T.textXsoft }}>{doc.edited}</span>
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
          <p style={{ fontSize:14, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:T.textXsoft, marginBottom:4 }}>Related people</p>
          {CHAT_PEOPLE.map((person, i) => (
            <div key={i} className="enter" style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 13px', borderRadius:4,
              background:T.surfaceMid, border:`1px solid ${T.border}`, animationDelay:`${i*.06}s` }}>
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{ width:38, height:38, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  background:`${person.color}18`, border:`1.5px solid ${person.color}40` }}>
                  <span style={{ fontSize:14, fontWeight:800, color:person.color }}>{person.avatar}</span>
                </div>
                <div style={{ position:'absolute', bottom:1, right:1, width:9, height:9, borderRadius:'50%',
                  background:person.online ? T.green : T.amber, border:`2px solid ${T.surface}` }} />
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:15, fontWeight:700, color:T.text }}>{person.name}</p>
                <p style={{ fontSize:13, color:T.textSoft }}>{person.role}</p>
                <p style={{ fontSize:14, color:person.online?T.green:T.amber, marginTop:2 }}>{person.status}</p>
              </div>
              <Btn variant="secondary" style={{ padding:'5px 11px', fontSize:13 }}>Message</Btn>
            </div>
          ))}
        </div>
      )}

      {/* Channels tab */}
      {activeTab==='channels' && (
        <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
          <p style={{ fontSize:14, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:T.textXsoft, marginBottom:4 }}>Related channels</p>
          {CHAT_CHANNELS.map((ch, i) => (
            <div key={i} className="enter" style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 13px', borderRadius:4,
              background:T.surfaceMid, border:`1px solid ${T.border}`, cursor:'pointer', transition:'all .15s', animationDelay:`${i*.06}s` }}
              onMouseEnter={e => e.currentTarget.style.borderColor=T.borderMid}
              onMouseLeave={e => e.currentTarget.style.borderColor=T.border}>
              <div style={{ width:34, height:34, borderRadius:4, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                background:T.coreSoft }}>
                <Hash size={14} color={T.core} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:T.text }}>{ch.name}</p>
                  {ch.unread > 0 && (
                    <span style={{ minWidth:18, height:18, padding:'0 5px', borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center',
                      background:T.core, color:'white', fontSize:13, fontWeight:800 }}>{ch.unread}</span>
                  )}
                </div>
                <p style={{ fontSize:13, color:T.textSoft, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ch.last}</p>
              </div>
              <ChevronRight size={13} color={T.textXsoft} />
            </div>
          ))}
        </div>
      )}

      {/* Whisper input — Chat tab */}
      {activeTab==='chat' && (
        <div style={{ padding:'12px 14px', borderTop:`1px solid ${T.border}`, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:4,
            background:T.surface, border:`1px solid ${T.border}`,
            transition:'box-shadow .15s, border-color .15s' }}>
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&send()}
              onFocus={e=>{ e.currentTarget.parentElement.style.borderColor=T.core; e.currentTarget.parentElement.style.boxShadow=`0 0 0 1px ${T.core}` }}
              onBlur={e=>{ e.currentTarget.parentElement.style.borderColor=T.border; e.currentTarget.parentElement.style.boxShadow='none' }}
              placeholder='Try "A", "remind me", "show details"…'
              style={{ flex:1, fontSize:15, background:'none', border:'none', outline:'none', color:T.text, fontFamily:T.font }} />
            <Btn variant="primary" icon={Send} onClick={send} style={{ padding:'6px 10px' }} />
          </div>
          <p style={{ fontSize:14, textAlign:'center', marginTop:7, color:T.textXsoft }}>All actions logged in Feed</p>
        </div>
      )}
    </div>
  )
}


// ─── Welcome Screen — Full landing page ────────────────────────────────────────
function WelcomeScreen({ onLogin }) {
  const T = window.__T
  const isDark = T.appBg === '#1F1F1F'

  // Animated counter hook
  const useCount = (target, dur=1400) => {
    const [val, setVal] = useState(0)
    const [started, setStarted] = useState(false)
    const ref = useRef(null)
    useEffect(() => {
      const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting && !started) setStarted(true) }, { threshold:.3 })
      if(ref.current) obs.observe(ref.current)
      return () => obs.disconnect()
    }, [])
    useEffect(() => {
      if(!started) return
      let start = null
      const step = ts => {
        if(!start) start = ts
        const p = Math.min((ts-start)/dur, 1)
        setVal(Math.floor(p * target))
        if(p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, [started, target])
    return [val, ref]
  }

  const BgParticle = ({ style }) => (
    <div style={{ position:'absolute', borderRadius:'50%', pointerEvents:'none', ...style }} />
  )

  const ctaStyle = {
    display:'inline-flex', alignItems:'center', gap:10, padding:'13px 28px',
    borderRadius:4, fontSize:15, fontWeight:700, color:'white',
    background:T.core, border:'none', cursor:'pointer',
    boxShadow:T.shadowPurple, transition:'all .15s',
  }

  const sectionBase = { maxWidth:1080, margin:'0 auto', padding:'0 32px' }

  // Stats with animated counters
  const [c1, r1] = useCount(94)
  const [c2, r2] = useCount(3)
  const [c3, r3] = useCount(41)
  const [c4, r4] = useCount(87)

  return (
    <div style={{ flex:1, overflowY:'auto', background:T.appBg, fontFamily:T.font, position:'relative' }}>

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <div style={{ position:'relative', overflow:'hidden', minHeight:'92vh', display:'flex', alignItems:'center' }}>
        {/* Subtle brand gradient band — Fluent hero style */}
        <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${T.core}, ${T.coreMid}, transparent)` }} />
        </div>

        <div style={{ ...sectionBase, width:'100%', zIndex:1, paddingTop:80, paddingBottom:80 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:48 }}>
            {/* Left: copy */}
            <div style={{ flex:1, maxWidth:580 }}>
              {/* Eyebrow */}
              <div className="enter" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:99,
                background:T.coreSoft, border:`1px solid ${T.core}30`, marginBottom:24 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:T.core, animation:'breathe 2s ease-in-out infinite' }} />
                <span style={{ fontSize:13, fontWeight:700, color:T.core, letterSpacing:'0.04em' }}>Now available on Microsoft Teams</span>
              </div>

              <h1 className="enter" style={{ fontSize:48, fontWeight:700, lineHeight:1.1, color:T.text,
                letterSpacing:'-0.01em', marginBottom:20, animationDelay:'.05s' }}>
                Your AI chief of staff,<br />
                <span style={{ background:`linear-gradient(135deg, ${T.core}, ${T.coreBright})`,
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                  always one step ahead.
                </span>
              </h1>

              <p className="enter" style={{ fontSize:18, lineHeight:1.7, color:T.textMid, marginBottom:36,
                maxWidth:480, animationDelay:'.1s' }}>
                Jarvis watches your Salesforce, Outlook, Jira, and Workday — then surfaces the right action before you even know you need it.
              </p>

              <div className="enter" style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', animationDelay:'.15s' }}>
                <button type="button" onClick={() => { SFX.tap(); HX.tap(); onLogin() }}
                  style={ctaStyle}
                  onMouseEnter={e => { e.currentTarget.style.background=T.coreMid }}
                  onMouseLeave={e => { e.currentTarget.style.background=T.core }}>
                  <Sparkles size={17} />Get my morning brief <ArrowRight size={16} />
                </button>
                <button type="button"
                  style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'13px 24px', borderRadius:4, fontSize:15, fontWeight:600,
                    background:'none', border:`1px solid ${T.border}`, color:T.text, cursor:'pointer', transition:'all .15s', fontFamily:T.font }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=T.core; e.currentTarget.style.color=T.core }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=T.borderMid; e.currentTarget.style.color=T.text }}>
                  Watch 2-min demo <ExternalLink size={14} />
                </button>
              </div>

              <p className="enter" style={{ fontSize:13, color:T.textXsoft, marginTop:14, animationDelay:'.2s' }}>
                OAuth 2.0 · No passwords stored · IT-approved
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
                {/* Mock top bar */}
                <div style={{ padding:'12px 16px', borderBottom:`1px solid ${T.border}`,
                  display:'flex', alignItems:'center', gap:10, background:T.topBar }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:T.coreGrad,
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Sparkles size={13} color="white" />
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:700, color:T.text }}>Jarvis</p>
                    <p style={{ fontSize:12, color:T.green }}>● Active · 9:04 AM</p>
                  </div>
                </div>
                {/* Messages */}
                <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:10 }}>
                  {[
                    { role:'j', text:'Good morning, Alex. Your DPA case is SLA+2 days and Amy Torres is OOO. I\'ve drafted an escalation to Legal.', delay:'0s' },
                    { role:'u', text:'Send it.', delay:'.6s' },
                    { role:'j', text:'Done ✓ Escalation sent. I\'ll update you when Amy\'s backup responds.', delay:'1.2s' },
                  ].map((m,i) => (
                    <div key={i} className="enter" style={{ display:'flex', justifyContent:m.role==='u'?'flex-end':'flex-start', animationDelay:m.delay }}>
                      {m.role==='j' && (
                        <div style={{ width:22, height:22, borderRadius:6, background:T.coreGrad,
                          display:'flex', alignItems:'center', justifyContent:'center', marginRight:8, flexShrink:0, marginTop:2 }}>
                          <Sparkles size={10} color="white" />
                        </div>
                      )}
                      <div style={{ maxWidth:'85%', padding:'9px 13px', borderRadius:8, fontSize:13, lineHeight:1.6,
                        ...(m.role==='u'
                          ? { background:T.core, color:'white', borderBottomRightRadius:2 }
                          : { background:T.surfaceMid, color:T.text, border:`1px solid ${T.border}`, borderBottomLeftRadius:2 }) }}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {/* Typing indicator */}
                  <div className="enter" style={{ display:'flex', alignItems:'center', gap:8, animationDelay:'1.8s' }}>
                    <div style={{ width:22, height:22, borderRadius:6, background:T.coreGrad,
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Sparkles size={10} color="white" />
                    </div>
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

        {/* Scroll cue */}
        <div style={{ position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)',
          display:'flex', flexDirection:'column', alignItems:'center', gap:6, opacity:.4 }}>
          <span style={{ fontSize:12, color:T.textSoft, letterSpacing:'0.08em' }}>SCROLL</span>
          <div style={{ width:1, height:32, background:`linear-gradient(${T.textSoft}, transparent)`,
            animation:'float 2s ease-in-out infinite' }} />
        </div>
      </div>

      {/* ── SOCIAL PROOF BAR ──────────────────────────────────────────────────── */}
      <div style={{ borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}`,
        padding:'18px 0', background:isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)' }}>
        <div style={{ ...sectionBase, display:'flex', alignItems:'center', justifyContent:'center', gap:48, flexWrap:'wrap' }}>
          {['Microsoft Teams','Salesforce','Outlook','Workday','Jira','Slack'].map(app => (
            <span key={app} style={{ fontSize:13, fontWeight:700, color:T.textXsoft, letterSpacing:'0.04em', whiteSpace:'nowrap' }}>{app}</span>
          ))}
        </div>
      </div>

      {/* ── STATS ─────────────────────────────────────────────────────────────── */}
      <div style={{ padding:'80px 0', background:isDark?'rgba(255,255,255,0.01)':T.surface }}>
        <div style={{ ...sectionBase }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <p style={{ fontSize:13, fontWeight:700, color:T.core, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:10 }}>By the numbers</p>
            <h2 style={{ fontSize:36, fontWeight:700, color:T.text, lineHeight:1.1 }}>
              Real results, measurable impact.
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24 }}>
            {[
              { ref:r1, val:c1, suffix:'%', label:'less time on admin tasks', sub:'Per employee, per week', color:T.core },
              { ref:r2, val:c2, suffix:'hrs', label:'saved per employee weekly', sub:'Avg across all users', color:T.green },
              { ref:r3, val:c3, suffix:'%', label:'faster decision-making', sub:'vs. no-AI baseline', color:T.teal },
              { ref:r4, val:c4, suffix:'%', label:'of users recommend Jarvis', sub:'Internal NPS survey', color:T.amber },
            ].map((s,i) => (
              <div ref={s.ref} key={i} className="enter" style={{ padding:'28px 24px', borderRadius:8, textAlign:'center',
                background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadowSm,
                animationDelay:`${i*.08}s` }}>
                <p style={{ fontSize:48, fontWeight:700, color:s.color, lineHeight:1, marginBottom:6 }}>
                  {s.val}{s.suffix}
                </p>
                <p style={{ fontSize:15, fontWeight:700, color:T.text, marginBottom:4, lineHeight:1.4 }}>{s.label}</p>
                <p style={{ fontSize:13, color:T.textSoft }}>{s.sub}</p>
              </div>
            ))}
          </div>
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
                title:'Watch & Rank',
                desc:'Every morning, Jarvis reads your Salesforce cases, Outlook threads, Jira tickets, and Workday queue. It ranks by urgency × impact × deadline — and builds your brief.',
                example:'Flagged: DPA case is SLA+2 and go-live is Friday.',
              },
              {
                num:'02', Icon:Zap, color:T.green, bg:T.greenSoft,
                title:'Act Autonomously',
                desc:'Low-risk tasks — compliance reminders, meeting prep, PTO verifications — Jarvis completes without asking. Every action is logged, auditable, and reversible.',
                example:'Sent: Security training nudge with LMS deep link.',
              },
              {
                num:'03', Icon:ShieldCheck, color:T.amber, bg:T.amberSoft,
                title:'Gate High-Stakes',
                desc:'Anything that matters — deploys, legal escalations, hiring decisions — Jarvis surfaces with full context and waits for your explicit approval. No surprises.',
                example:'Waiting: Prod deploy CR-4471 — needs your arm.',
              },
            ].map((c,i) => (
              <div key={i} className="enter" style={{ padding:'24px', borderRadius:8, position:'relative', overflow:'hidden',
                background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadowSm,
                animationDelay:`${i*.1}s` }}>
                {/* Large number watermark */}
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

      {/* ── USE CASES ─────────────────────────────────────────────────────────── */}
      <div style={{ padding:'96px 0', background:isDark?'rgba(255,255,255,0.015)':T.rail }}>
        <div style={{ ...sectionBase }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <p style={{ fontSize:13, fontWeight:700, color:T.core, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:10 }}>Built for your real day</p>
            <h2 style={{ fontSize:36, fontWeight:700, color:T.text, lineHeight:1.15 }}>
              Every role. Every tool. One AI.
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:20 }}>
            {[
              {
                emoji:'⚖️', tag:'Legal & Compliance', color:T.amber,
                title:'DPA stuck? SLA breached?',
                body:'Jarvis detects when a review is overdue, identifies who\'s OOO, finds the backup, and drafts the escalation — so you\'re never the bottleneck.',
                chips:['SalesforcePlugin','WorkdayPlugin','OutlookPlugin'],
              },
              {
                emoji:'📊', tag:'Meetings & Prep', color:T.blue,
                title:'Walk into every meeting ready.',
                body:'30 minutes before each meeting, Jarvis assembles the deck, surfaces open actions from last time, and writes you a 3-point opener based on what the SVP cares about.',
                chips:['OutlookPlugin','SharePointPlugin','SalesforcePlugin'],
              },
              {
                emoji:'🚨', tag:'Incidents & Ops', color:T.red,
                title:'P1 fires while you\'re in a meeting?',
                body:'Jarvis detects it in Datadog, identifies the on-call engineer, assigns ownership in Salesforce, and sends the Teams message — all in under 90 seconds.',
                chips:['DatadogPlugin','SalesforcePlugin','TeamsPlugin'],
              },
              {
                emoji:'👥', tag:'People & Teams', color:T.green,
                title:'Burnout before it becomes a problem.',
                body:'Jarvis spots overwork patterns in Jira before sentiment shifts. It finds coverage, drafts the welfare check-in, and only asks you to confirm.',
                chips:['JiraPlugin','SlackPlugin','WorkdayPlugin'],
              },
            ].map((u,i) => (
              <div key={i} className="enter" style={{ padding:'24px', borderRadius:8,
                background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadowSm,
                animationDelay:`${i*.08}s` }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:14 }}>
                  <span style={{ fontSize:28, flexShrink:0 }}>{u.emoji}</span>
                  <div>
                    <span style={{ fontSize:12, fontWeight:700, color:u.color, textTransform:'uppercase', letterSpacing:'0.1em' }}>{u.tag}</span>
                    <h3 style={{ fontSize:18, fontWeight:800, color:T.text, lineHeight:1.3, marginTop:4 }}>{u.title}</h3>
                  </div>
                </div>
                <p style={{ fontSize:15, color:T.textMid, lineHeight:1.7, marginBottom:16 }}>{u.body}</p>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {u.chips.map(ch => (
                    <span key={ch} style={{ fontSize:12, fontWeight:600, padding:'3px 9px', borderRadius:4,
                      background:`${u.color}12`, color:u.color, border:`1px solid ${T.border}`,
                      display:'inline-flex', alignItems:'center', gap:4 }}>
                      <Database size={10} />{ch}
                    </span>
                  ))}
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
                Every action Jarvis takes is logged in an auditable feed. Sensitive decisions — deploys, legal filings, salary changes — always require your explicit confirmation. We read signals, not secrets.
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
            {/* Tier legend */}
            <div style={{ width:340, flexShrink:0 }}>
              <div style={{ padding:'24px', borderRadius:8, background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadowMd }}>
                <p style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em', color:T.textXsoft, marginBottom:20 }}>Decision tiers</p>
                {[
                  { tier:'L1', label:'Auto-handled', desc:'Completes without asking. Logged in Feed.', color:T.teal },
                  { tier:'L2', label:'Review surfaced', desc:'Shows you the action. One click to confirm.', color:T.blue },
                  { tier:'L3', label:'Your decision', desc:'Jarvis prepares everything. You decide.', color:T.amber },
                  { tier:'L4', label:'Gate required', desc:'Explicit approval before any action is taken.', color:T.red },
                ].map(d => (
                  <div key={d.tier} style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:16, paddingBottom:16,
                    borderBottom:`1px solid ${T.border}` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:99,
                      background:`${d.color}15`, flexShrink:0 }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:d.color }} />
                      <span style={{ fontSize:12, fontWeight:800, color:d.color }}>{d.tier}</span>
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
        </div>
      </div>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────────── */}
      <div style={{ padding:'80px 0', background:isDark?'rgba(255,255,255,0.015)':T.rail }}>
        <div style={{ ...sectionBase }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <p style={{ fontSize:13, fontWeight:700, color:T.core, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:10 }}>What your colleagues say</p>
            <h2 style={{ fontSize:32, fontWeight:700, color:T.text }}>From the people using it every day.</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {[
              { quote:"I used to spend 40 minutes every morning just figuring out what to do first. Jarvis does that in seconds and it's almost always right.", name:'Priya N.', role:'Sr. Product Manager', avatar:'PN', color:T.core },
              { quote:"The burnout detection alone is worth it. Jarvis flagged Liam's hours before I even noticed. I authorised the wellness day in one click.", name:'Marcus T.', role:'Engineering Manager', avatar:'MT', color:T.green },
              { quote:"When our P1 hit I was in a QBR. Jarvis assigned Raj, opened the war room, and told me about it after. I didn't miss a beat.", name:'Sarah C.', role:'VP Engineering', avatar:'SC', color:T.teal },
            ].map((t,i) => (
              <div key={i} className="enter" style={{ padding:'24px', borderRadius:8,
                background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadowSm,
                animationDelay:`${i*.08}s` }}>
                <div style={{ display:'flex', gap:2, marginBottom:14 }}>
                  {[0,1,2,3,4].map(s => <Star key={s} size={15} fill={T.amber} color={T.amber} />)}
                </div>
                <p style={{ fontSize:15, color:T.text, lineHeight:1.75, marginBottom:20, fontStyle:'italic' }}>"{t.quote}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                    background:`${t.color}20`, flexShrink:0 }}>
                    <span style={{ fontSize:13, fontWeight:800, color:t.color }}>{t.avatar}</span>
                  </div>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:T.text }}>{t.name}</p>
                    <p style={{ fontSize:13, color:T.textSoft }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <div style={{ padding:'96px 0' }}>
        <div style={{ ...sectionBase, maxWidth:720 }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <p style={{ fontSize:13, fontWeight:700, color:T.core, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:10 }}>Common questions</p>
            <h2 style={{ fontSize:32, fontWeight:700, color:T.text }}>Everything you need to know.</h2>
          </div>
          {[
            { q:"Does Jarvis read my emails?", a:"No. Jarvis reads metadata — subjects, senders, dates, flags — to surface the right actions. It never reads the body of emails or private messages." },
            { q:"Can Jarvis act without my permission?", a:"Only for low-risk tasks you've explicitly enabled: meeting prep, compliance nudges, PTO verifications. All medium-to-high-stakes actions require your confirmation." },
            { q:"What tools does it connect to?", a:"Out of the box: Salesforce, Outlook, Microsoft Teams, OneDrive/SharePoint, Workday. Jira, Datadog, Slack, Greenhouse, and ServiceNow available as add-ons." },
            { q:"How do I undo something Jarvis did?", a:"Every action is logged in the Activity Feed with a one-click reverse option. Nothing is permanent without your knowledge." },
            { q:"Is my data shared or used to train AI?", a:"No. Your data stays within your organisation's tenant. It is not used to train any external model." },
          ].map((faq,i) => {
            const [open, setOpen] = useState(false)
            return (
              <div key={i} style={{ borderBottom:`1px solid ${T.border}` }}>
                <button type="button" onClick={() => { SFX.tap(); setOpen(o=>!o) }}
                  style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 0',
                    background:'none', border:'none', cursor:'pointer', textAlign:'left', fontFamily:T.font }}>
                  <span style={{ fontSize:16, fontWeight:700, color:T.text }}>{faq.q}</span>
                  <ChevronDown size={18} color={T.textSoft} style={{ flexShrink:0, marginLeft:16, transition:'transform .2s', transform:open?'rotate(180deg)':'none' }} />
                </button>
                {open && (
                  <div className="expand-down" style={{ paddingBottom:20 }}>
                    <p style={{ fontSize:15, color:T.textMid, lineHeight:1.75 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────────── */}
      <div style={{ padding:'96px 0 112px', background:T.coreSoft, borderTop:`1px solid ${T.border}` }}>
        <div style={{ ...sectionBase, textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'8px 18px', borderRadius:99,
            background:T.coreSoft, border:`1px solid ${T.core}30`, marginBottom:28 }}>
            <Sparkles size={14} color={T.core} />
            <span style={{ fontSize:14, fontWeight:700, color:T.core }}>Takes 30 seconds to connect</span>
          </div>
          <h2 style={{ fontSize:40, fontWeight:700, color:T.text, lineHeight:1.1, marginBottom:20 }}>
            Your morning brief<br />
            <span style={{ background:`linear-gradient(135deg, ${T.core}, ${T.coreBright})`,
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              is already waiting.
            </span>
          </h2>
          <p style={{ fontSize:18, color:T.textMid, marginBottom:40, maxWidth:460, margin:'0 auto 40px', lineHeight:1.7 }}>
            Stop starting your day with a blank inbox and hoping nothing slipped. Let Jarvis watch, rank, and act — so you can lead.
          </p>
          <button type="button" onClick={() => { SFX.tap(); HX.tap(); onLogin() }}
            style={{ ...ctaStyle, padding:'14px 32px', fontSize:16 }}
            onMouseEnter={e => e.currentTarget.style.background=T.coreMid}
            onMouseLeave={e => e.currentTarget.style.background=T.core}>
            <Sparkles size={18} /> Get my morning brief <ArrowRight size={17} />
          </button>
          <p style={{ fontSize:13, color:T.textXsoft, marginTop:14 }}>OAuth 2.0 · IT-approved · SOC 2 aligned</p>
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────────────────────── */}
      <div style={{ borderTop:`1px solid ${T.border}`, padding:'24px 32px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:24, height:24, borderRadius:7, background:T.coreGrad, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Sparkles size={12} color="white" />
          </div>
          <span style={{ fontSize:14, fontWeight:800, color:T.text }}>Jarvis</span>
          <span style={{ fontSize:13, color:T.textXsoft }}>· Your AI chief of staff</span>
        </div>
        <p style={{ fontSize:13, color:T.textXsoft }}>Built on Salesforce Agentforce · Powered by Claude · © 2026 OrgFarm EPIC</p>
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
          <p style={{ fontSize:14, marginTop:3, color:T.textSoft }}>Every action Jarvis took — fully traceable.</p>
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
                    <span style={{ fontWeight:700, fontSize:15, color:T.text }}>{item.title}</span>
                    <span style={{ fontSize:14, fontWeight:700, padding:'2px 8px', borderRadius:99,
                      background:item.status==='running'?T.coreSoft:T.greenSoft,
                      color:item.status==='running'?T.core:T.green }}>
                      {item.status==='running'?'● Running':'✓ Done'}
                    </span>
                  </div>
                  <p style={{ fontSize:13, color:T.textSoft }}>{item.body}</p>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                  <span style={{ fontSize:14, color:T.textXsoft }}>{item.time}</span>
                  <ChevronDown size={13} color={T.textXsoft} style={{ transform:expanded===item.id?'rotate(180deg)':'', transition:'transform .2s' }} />
                </div>
              </div>
              {expanded===item.id && (
                <div style={{ padding:'0 15px 14px', borderTop:`1px solid ${T.border}` }}>
                  <p style={{ fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em', color:T.textXsoft, marginTop:12, marginBottom:10 }}>Steps taken</p>
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
                          <p style={{ fontSize:14, color:done?T.textMid:T.core }}>{step}</p>
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
      style={{ padding:'6px 16px', borderRadius:4, fontSize:13, fontWeight:600, border:'none', cursor:'pointer', transition:'all .15s',
        background: activeSection===id ? T.core : 'none',
        color: activeSection===id ? 'white' : T.textSoft }}>
      {label}
    </button>
  )
  return (
    <div style={{ padding:'24px 28px 48px', overflowY:'auto', height:'100%', maxWidth:900 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:T.core, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:6 }}>Your AI workforce</p>
          <h1 style={{ fontSize:26, fontWeight:900, color:T.text, letterSpacing:'-0.02em', lineHeight:1.15 }}>
            Agents that{' '}
            <span style={{ background:`linear-gradient(135deg,${T.core},${T.coreBright})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              work while you focus.
            </span>
          </h1>
          <p style={{ fontSize:15, color:T.textSoft, marginTop:6 }}>
            Build, configure, and connect agents to your tools.
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, marginLeft:10, padding:'2px 9px', borderRadius:99,
              background:T.greenSoft, color:T.green, fontSize:13, fontWeight:700 }}>
              {agents.filter(a=>a.enabled).length} running · {agents.length} total
            </span>
          </p>
        </div>
        <Btn variant="primary" icon={Plus} onClick={() => { SFX.tap(); onNew() }} style={{ fontSize:15, padding:'9px 18px' }}>New Agent</Btn>
      </div>

      {/* Section tabs */}
      <div style={{ display:'inline-flex', gap:2, padding:'3px', borderRadius:4, background:T.surfaceMid, border:`1px solid ${T.border}`, marginBottom:24 }}>
        {sectionTab('agents', 'My Agents')}
        {sectionTab('connections', 'Connections')}
      </div>

      {/* ── My Agents ── */}
      {activeSection==='agents' && (
        <div>
          {/* Active agents */}
          <div style={{ marginBottom:32 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <p style={{ fontSize:15, fontWeight:800, color:T.text }}>Active</p>
              <span style={{ fontSize:13, fontWeight:700, padding:'2px 8px', borderRadius:99, background:T.greenSoft, color:T.green }}>
                {agents.filter(a=>a.enabled).length} running
              </span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:12 }}>
              {agents.filter(a=>a.enabled).map(agent => (
                <div key={agent.id} style={{ borderRadius:8, padding:'16px 16px 12px', background:T.surface,
                  border:`1px solid ${T.border}`, borderLeft:`4px solid ${agent.color}`,
                  boxShadow:T.shadowSm, transition:'box-shadow .15s', position:'relative', overflow:'hidden' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow=T.shadowMd}
                  onMouseLeave={e => e.currentTarget.style.boxShadow=T.shadowSm}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      {/* Gradient orb icon */}
                      <div style={{ width:40, height:40, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
                        background:`${agent.color}15`, border:`1px solid ${T.border}`, flexShrink:0 }}>{agent.icon}</div>
                      <div>
                        <p style={{ fontSize:15, fontWeight:800, color:T.text }}>{agent.name}</p>
                        <p style={{ fontSize:13, color:T.textSoft, marginTop:1 }}>{agent.schedule}</p>
                      </div>
                    </div>
                    <Toggle value={agent.enabled} onChange={() => { SFX.tap(); toggleAgent(agent.id) }} />
                  </div>
                  <p style={{ fontSize:14, color:T.textMid, lineHeight:1.5, marginBottom:12 }}>{agent.desc}</p>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:10, borderTop:`1px solid ${T.border}` }}>
                    <div style={{ display:'flex', gap:16 }}>
                      <div>
                        <p style={{ fontSize:22, fontWeight:900, color:agent.color, lineHeight:1 }}>{agent.runs}</p>
                        <p style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:T.textXsoft, marginTop:2 }}>Runs</p>
                      </div>
                      <div>
                        <p style={{ fontSize:14, fontWeight:700, color:T.textMid, lineHeight:1 }}>{agent.lastRun}</p>
                        <p style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:T.textXsoft, marginTop:2 }}>Last run</p>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:4 }}>
                      <button type="button" style={{ width:28, height:28, borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', background:T.surfaceMid, border:`1px solid ${T.border}`, cursor:'pointer', color:T.textSoft }}><Edit2 size={11}/></button>
                      <button type="button" style={{ width:28, height:28, borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', background:T.surfaceMid, border:`1px solid ${T.border}`, cursor:'pointer', color:T.textSoft }}><Copy size={11}/></button>
                    </div>
                  </div>
                </div>
              ))}
              {/* New agent CTA */}
              <div onClick={() => { SFX.tap(); onNew() }}
                style={{ borderRadius:8, padding:'18px', background:'none', border:`1px dashed ${T.border}`,
                  cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8,
                  minHeight:160, transition:'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=T.core; e.currentTarget.style.background=T.coreSoft }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.background='none' }}>
                <div style={{ width:40, height:40, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', background:T.coreSoft }}>
                  <Plus size={18} color={T.core} />
                </div>
                <p style={{ fontSize:15, fontWeight:700, color:T.core }}>New Agent</p>
                <p style={{ fontSize:13, color:T.textSoft, textAlign:'center' }}>Build from a template or start from scratch</p>
              </div>
            </div>
          </div>

          {/* Inactive agents */}
          {agents.filter(a=>!a.enabled).length > 0 && (
            <div>
              <p style={{ fontSize:15, fontWeight:800, color:T.textSoft, marginBottom:12 }}>Inactive</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {agents.filter(a=>!a.enabled).map(agent => (
                  <div key={agent.id} style={{ borderRadius:4, padding:'11px 14px', background:T.surface,
                    border:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:14, opacity:.6 }}>
                    <div style={{ width:32, height:32, borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, background:T.surfaceMid }}>{agent.icon}</div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:15, fontWeight:700, color:T.text }}>{agent.name}</p>
                      <p style={{ fontSize:13, color:T.textSoft }}>{agent.desc}</p>
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
              <div key={c.id} style={{ borderRadius:8, padding:'16px', background:T.surface,
                border:`1px solid ${c.connected?T.borderMid:T.border}`, boxShadow:T.shadowSm, transition:'all .15s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow=T.shadowMd}
                onMouseLeave={e => e.currentTarget.style.boxShadow=T.shadowSm}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <span style={{ fontSize:28 }}>{c.logo}</span>
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
    </div>
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
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.25)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(8px)' }}>
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
                    <div style={{ fontSize:13, padding:'9px 11px', borderRadius:8, background:T.core, color:'white', alignSelf:'flex-end' }}>3 back-to-back meetings in 30 min — prepare me.</div>
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
        <div style={{ width:32, height:32, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
          background:T.coreGrad }}>
          <Sparkles size={13} color="white" />
        </div>
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

  const sendText = (txt) => {
    if (!txt.trim()) return
    SFX.whisper(); HX.tap()
    setInput('')
    setMessages(p => [...p, { role:'u', text:txt }])
    setThinking(true); setCoreState('thinking')
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
      {/* Left: conversation list */}
      <div style={{ width:280, flexShrink:0, borderRight:`1px solid ${T.border}`, display:'flex', flexDirection:'column', background:T.rail }}>
        {/* Search */}
        <div style={{ padding:'14px 12px 10px', borderBottom:`1px solid ${T.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:12,
            background:T.surfaceMid, border:`1px solid ${T.border}` }}>
            <Search size={13} color={T.textXsoft} />
            <input placeholder="Search conversations…" style={{ flex:1, fontSize:14, background:'none', border:'none', outline:'none', color:T.text, fontFamily:T.font }} />
          </div>
        </div>
        {/* Categories */}
        <div style={{ padding:'8px 12px', borderBottom:`1px solid ${T.border}`, display:'flex', gap:5, flexWrap:'wrap' }}>
          {CONVERSATION_CATEGORIES.map(cat => (
            <button key={cat} type="button" onClick={() => { SFX.tap(); setActiveCat(cat) }}
              style={{ padding:'4px 11px', borderRadius:99, fontSize:13, fontWeight:700, cursor:'pointer', transition:'all .15s',
                border: activeCat===cat ? 'none' : `1px solid ${T.border}`,
                background: activeCat===cat ? T.core : T.surfaceMid,
                color: activeCat===cat ? 'white' : T.textSoft,
                boxShadow: activeCat===cat ? T.shadowPurple : 'none' }}>
              {cat}
            </button>
          ))}
        </div>
        {/* List */}
        <div style={{ flex:1, overflowY:'auto', padding:'8px 8px' }}>
          {filtered.map(conv => (
            <div key={conv.id} onClick={() => { SFX.tap(); setActiveConv(conv.id) }}
              style={{ padding:'11px 12px', borderRadius:4, marginBottom:4, cursor:'pointer', transition:'all .15s', position:'relative',
                background: activeConv===conv.id ? T.coreSoft : T.surface,
                border: `1px solid ${T.border}`,
                borderLeft: activeConv===conv.id ? `3px solid ${T.core}` : `1px solid ${T.border}`,
                boxShadow: activeConv===conv.id ? T.shadowSm : 'none' }}
              onMouseEnter={e => { if(activeConv!==conv.id) { e.currentTarget.style.background=T.surfaceMid }}}
              onMouseLeave={e => { if(activeConv!==conv.id) { e.currentTarget.style.background=T.surface }}}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:3 }}>
                <p style={{ fontSize:14, fontWeight:700, color: activeConv===conv.id ? T.core : T.text, lineHeight:1.3, flex:1, marginRight:8 }}>{conv.title}</p>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4, flexShrink:0 }}>
                  <span style={{ fontSize:13, color:T.textXsoft }}>{conv.time}</span>
                  {conv.unread > 0 && (
                    <span style={{ width:18, height:18, borderRadius:'50%', background:T.core, color:'white', fontSize:13, fontWeight:800,
                      display:'flex', alignItems:'center', justifyContent:'center' }}>{conv.unread}</span>
                  )}
                </div>
              </div>
              <p style={{ fontSize:13, color:T.textSoft, lineHeight:1.4,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{conv.preview}</p>
              <div style={{ marginTop:5 }}>
                <span style={{ fontSize:11, fontWeight:600, padding:'2px 7px', borderRadius:99,
                  border:`1px solid ${T.border}`,
                  background:`${T.core}10`, color:T.core }}>{conv.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: open conversation */}
      {currentConv ? (
        <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
          {/* Messages column */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Conv header */}
            <div style={{ padding:'14px 20px', borderBottom:`1px solid ${T.border}`, flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'space-between', background:T.topBar }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
                  background:T.coreGrad }}>
                  <Sparkles size={15} color="white" />
                </div>
                <div>
                  <p style={{ fontSize:15, fontWeight:800, color:T.text }}>{currentConv.title}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:2 }}>
                    <span style={{ fontSize:12, fontWeight:600, padding:'1px 7px', borderRadius:99, background:`${T.core}10`, border:`1px solid ${T.border}`, color:T.core }}>{currentConv.category}</span>
                    <span style={{ fontSize:14, color:T.textXsoft }}>{currentConv.date} · {currentConv.time}</span>
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <Btn variant="secondary" icon={Tag} style={{ padding:'5px 10px', fontSize:13 }}>Categorise</Btn>
                <Btn variant="secondary" icon={Folder} style={{ padding:'5px 10px', fontSize:13 }}>Archive</Btn>
              </div>
            </div>
            {/* Messages */}
            <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:12 }}>
              {messages.map((m, i) => (
                <div key={i} className="enter" style={{ animationDelay:`${i*.04}s` }}>
                  <div style={{ display:'flex', justifyContent:m.role==='u'?'flex-end':'flex-start' }}>
                    {m.role==='j' && (
                      <div style={{ width:28, height:28, borderRadius:7, flexShrink:0, marginRight:10, marginTop:2,
                        display:'flex', alignItems:'center', justifyContent:'center', background:T.coreGrad }}>
                        <Sparkles size={13} color="white" />
                      </div>
                    )}
                    <div style={{ maxWidth:'72%', padding:'10px 14px', borderRadius:8, fontSize:14, lineHeight:1.6,
                      ...(m.role==='u'
                        ? { background:T.core, color:'white', borderBottomRightRadius:2 }
                        : { background:T.surface, color:T.text, border:`1px solid ${T.border}`, borderBottomLeftRadius:2 }) }}>
                      {m.role==='j' ? renderBubble(m, T, (label) => sendText(label)) : renderMsg(m.text)}
                    </div>
                  </div>
                  {m.role==='j' && <MessageFeedback msgIndex={i} />}
                </div>
              ))}
              {thinking && (
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:28, height:28, borderRadius:7, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:T.coreGrad }}>
                    <Sparkles size={13} color="white" />
                  </div>
                  <div style={{ padding:'10px 15px', borderRadius:8, borderBottomLeftRadius:2, display:'flex', alignItems:'center', gap:5,
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
              <div style={{ borderRadius:4, transition:'box-shadow .15s' }}
                ref={el => { if(el) el._el = el }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 14px', borderRadius:4,
                  background:T.surface, border:`1px solid ${T.border}`, transition:'all .15s' }}>
                  <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
                    onFocus={e => {
                      e.currentTarget.parentElement.style.borderColor=T.core
                      e.currentTarget.parentElement.style.boxShadow=`0 0 0 1px ${T.core}`
                    }}
                    onBlur={e => {
                      e.currentTarget.parentElement.style.borderColor=T.border
                      e.currentTarget.parentElement.style.boxShadow='none'
                    }}
                    placeholder="Continue the conversation…"
                    style={{ flex:1, fontSize:15, background:'none', border:'none', outline:'none', color:T.text, fontFamily:T.font }} />
                  <Btn variant="primary" icon={Send} onClick={send} style={{ padding:'6px 12px' }} />
                </div>
              </div>
            </div>
          </div>
          {/* Agent flow panel */}
          <AgentFlowPanel conv={currentConv} />
        </div>
      ) : (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
          {/* Animated Sparkles orb */}
          <div style={{ position:'relative', width:72, height:72 }}>
            <div style={{ position:'absolute', inset:-8, borderRadius:'50%',
              background:`radial-gradient(ellipse, ${T.coreGlow} 0%, transparent 70%)`,
              animation:'breathe 3s ease-in-out infinite', pointerEvents:'none' }} />
            <div style={{ width:72, height:72, borderRadius:22, display:'flex', alignItems:'center', justifyContent:'center',
              background:T.coreGrad, boxShadow:`0 8px 32px ${T.coreGlow}`, animation:'float 4s ease-in-out infinite' }}>
              <Sparkles size={30} color="white" />
            </div>
          </div>
          <div style={{ textAlign:'center' }}>
            <p style={{ fontSize:17, fontWeight:800, color:T.text, marginBottom:4 }}>Select a conversation</p>
            <p style={{ fontSize:14, color:T.textSoft }}>Choose from the list to read and continue</p>
          </div>
        </div>
      )}
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
  // Filter chips — act as filters for the intent cards below
  const managerChips = ['Team readiness brief', 'Batch approvals', 'Who is at risk?']
  const employeeChips = ['Prep my 10 AM', 'Draft reply to Acme', 'What needs me today?']
  const chips = persona === 'manager' ? managerChips : employeeChips
  const ph = persona==='manager' ? 'Ask anything — "Team readiness brief", "Who is at risk?"…'
    : 'Ask anything — "Prep my 10 AM", "Draft reply to Acme"…'

  if (hero) {
    const userName = persona === 'manager' ? 'Alex' : 'Pritesh'
    const greeting = coreState === 'thinking' ? 'On it…' : coreState === 'listening' ? 'Listening…' : `Hi ${userName}`
    const subGreeting = coreState === 'thinking' ? 'Jarvis is working on that.' : coreState === 'listening' ? 'Go ahead, I\'m here.' : 'Where should we start?'

    // Category prompt buckets, persona-aware
    const PROMPT_CATEGORIES = [
      { id:'discover', label:'Discover', Icon:Compass, color:T.core,
        prompts: persona==='manager'
          ? ['What needs my attention this week?','Who on my team is at risk?','What changed overnight?','Which approvals are pending with me?']
          : ['What needs me today?','What did I miss overnight?','Summarize my upcoming meetings','Show me blockers across my work'] },
      { id:'find',     label:'Find',     Icon:Search,  color:T.blue,
        prompts: persona==='manager'
          ? ['Find my 1:1 notes with Liam','Find the Q2 planning thread','Find approvals older than 5 days','Find docs I reviewed last week']
          : ['Find my last email to Maria Chen','Find the Acme SOW draft','Find the QBR deck','Find my 1:1 notes with Sarah'] },
      { id:'create',   label:'Create',   Icon:PenSquare,color:T.teal,
        prompts: persona==='manager'
          ? ['Draft a Wellness Day note to Liam','Create a hiring panel debrief template','Draft a sprint retro agenda','Write a promotion justification']
          : ['Draft a reply to Acme','Write a meeting follow-up','Create a status update for my team','Draft a decision doc for the deploy'] },
      { id:'brainstorm',label:'Brainstorm',Icon:Lightbulb,color:T.amber,
        prompts: persona==='manager'
          ? ['Ideas to reduce team burnout risk','How to speed up our hiring loop','Ways to close the React 19 skill gap','How to rebalance on-call']
          : ['How should I frame the Acme renewal?','Ideas for tomorrow\'s QBR opener','How do I unblock the DPA?','Questions to ask in my 1:1 today'] },
    ]

    return (
      <div className="enter" style={{ marginBottom: 20, position:'relative', zIndex: openCat ? 200 : 'auto' }}>
        {/* Gemini-style greeting */}
        <div style={{ marginBottom: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 400, color: T.textSoft, margin: '0 0 2px', fontFamily: T.font }}>
            {greeting}
          </p>
          <p style={{ fontSize: 34, fontWeight: 700, color: T.text, margin: 0, lineHeight: 1.2, fontFamily: T.font }}>
            {subGreeting}
          </p>
        </div>

        {/* Large pill input box */}
        <div style={{
          background: T.surface,
          border: `1px solid ${focused ? T.core : T.border}`,
          borderRadius: 20,
          boxShadow: focused ? `0 0 0 2px ${T.core}22, ${T.shadowMd}` : T.shadowMd,
          transition: 'box-shadow .15s, border-color .15s',
          overflow: 'hidden',
        }}>
          {/* Text input area */}
          <div style={{ padding: '18px 22px 10px' }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
              <div style={{ color: T.textXsoft, flexShrink:0, paddingTop:2 }}>
                {coreState==='thinking'
                  ? <Loader2 size={18} color={T.core} style={{ animation:'spin 1s linear infinite' }} />
                  : <Sparkles size={18} color={T.coreMid} />}
              </div>
              <input ref={inputRef} value={val} onChange={e=>setVal(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&submit()}
                onFocus={() => { setFocused(true); setCoreState('listening') }}
                onBlur={() => { setFocused(false); if(coreState==='listening') setCoreState('idle') }}
                placeholder={ph}
                style={{ flex:1, fontSize:16, background:'none', border:'none', outline:'none',
                  color:T.text, fontFamily:T.font, fontWeight:400, lineHeight:1.5 }} />
            </div>
          </div>
          {/* Bottom toolbar row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'8px 16px 14px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <button type="button"
                style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:99,
                  background:'none', border:`1px solid ${T.border}`, cursor:'pointer',
                  color:T.textSoft, fontSize:13, fontWeight:500, fontFamily:T.font,
                  transition:'all .12s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background=T.surfaceMid; e.currentTarget.style.borderColor=T.borderMid }}
                onMouseLeave={e=>{ e.currentTarget.style.background='none'; e.currentTarget.style.borderColor=T.border }}>
                <Sliders size={14} />
                Tools
              </button>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <button type="button"
                style={{ width:34, height:34, borderRadius:99, background:'none',
                  border:`1px solid ${T.border}`, cursor:'pointer', display:'flex',
                  alignItems:'center', justifyContent:'center', color:T.textSoft,
                  transition:'all .12s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background=T.surfaceMid }}
                onMouseLeave={e=>{ e.currentTarget.style.background='none' }}>
                <Mic size={15} />
              </button>
              <button type="button" onClick={submit}
                style={{ width:34, height:34, borderRadius:99,
                  background: val.trim() ? T.core : T.surfaceMid,
                  border: 'none', cursor: val.trim() ? 'pointer' : 'default',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color: val.trim() ? '#fff' : T.textXsoft,
                  transition:'all .15s' }}>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Prompt categories — plain text links, each opens a dropdown of prompts */}
        <div style={{ display:'flex', gap:24, marginTop:16, flexWrap:'wrap', justifyContent:'center', alignItems:'center' }}>
          {PROMPT_CATEGORIES.map(cat => {
            const { Icon } = cat
            const isOpen = openCat === cat.id
            return (
              <div key={cat.id} className="prompt-cat" style={{ position:'relative', zIndex: isOpen ? 100 : 'auto' }}>
                <button type="button"
                  onClick={() => { SFX.tap(); setOpenCat(isOpen ? null : cat.id) }}
                  style={{ display:'inline-flex', alignItems:'center', gap:6,
                    padding:0, background:'none', border:'none', cursor:'pointer',
                    color: isOpen ? cat.color : T.textSoft,
                    fontSize:13, fontWeight:500, fontFamily:T.font,
                    transition:'color .12s' }}
                  onMouseEnter={e => { if (!isOpen) e.currentTarget.style.color = cat.color }}
                  onMouseLeave={e => { if (!isOpen) e.currentTarget.style.color = T.textSoft }}>
                  <Icon size={13} strokeWidth={2} />
                  <span>{cat.label}</span>
                </button>
                {isOpen && (
                  <div className="expand-down" style={{ position:'absolute', top:'calc(100% + 8px)', left:'50%', transform:'translateX(-50%)',
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
            onFocus={() => { setFocused(true); setCoreState('listening') }}
            onBlur={() => { setFocused(false); if(coreState==='listening') setCoreState('idle') }}
            placeholder={ph}
            style={{ flex:1, fontSize:15, background:'none', border:'none', outline:'none', color:T.text, fontFamily:T.font }} />
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
      style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:4,
        background:T.surfaceMid, border:`1px solid ${T.border}`, cursor:'pointer', transition:'all .15s', color:T.textMid, fontSize:14, fontWeight:600 }}
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
  // Today tab filter — null means "All", else one of 'tasks'|'meetings'|'decision'|'followups'
  const [todayFilter, setTodayFilter] = useState(null)

  const allIntents = persona==='manager' ? MANAGER_INTENTS : INTENTS
  const notDismissed = allIntents.filter(i => !dismissIds.includes(i.id))
  // Filter predicates — parallel categories (type of work), not states
  const INTENT_FILTERS = {
    meetings:  (i) => i.prepReady === true || /\bQBR\b|meeting|prep|standup|1:1|deploy|sync/i.test(i.headline || ''),
    decision:  (i) => i.tier === 'L3' || i.tier === 'L4',
    followups: (i) => /follow|pending|waiting|awaiting|reply/i.test((i.headline || '') + ' ' + (i.cat || '') + ' ' + (i.action || '')),
  }
  const visibleIntents = todayFilter && INTENT_FILTERS[todayFilter]
    ? notDismissed.filter(INTENT_FILTERS[todayFilter])
    : notDismissed
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
  const handleAct = (intent, preselect=null) => openChat(intent, intent.chatScenario||null, preselect)
  const handleDone = id => { SFX.done(); HX.done(); setDoneIds(p=>[...p,id]); setTimeout(() => setDismissIds(p=>[...p,id]), 400) }
  const handleDismiss = id => { SFX.tap(); setDismissIds(p=>[...p,id]) }
  const handleRemind = id => {
    SFX.tap(); HX.tap()
    setToast({ msg:'Reminder set · I\'ll bring this back in 1 hour', tone:'info' })
    setTimeout(() => setToast(null), 3000)
  }
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
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20, zIndex:1 }}>
        <div style={{ position:'relative', width:72, height:72 }}>
          <div className="ripple-ring" style={{ position:'absolute', inset:0, borderRadius:'50%', border:`1.5px solid ${T.core}50` }} />
          <div style={{ width:72, height:72, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center',
            background:T.coreGrad, boxShadow:T.shadowPurple, animation:'breathe 2s ease-in-out infinite' }}>
            <Sparkles size={30} color="white" />
          </div>
        </div>
        <p style={{ color:T.text, fontWeight:700, fontSize:17 }}>Connecting to Salesforce…</p>
        <p style={{ fontSize:14, color:T.textSoft }}>Pulling your morning brief</p>
      </div>
    </div>
  )

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
        <span style={{ fontSize:11, color:'#6A6A6A' }}>
          Jarvis demo · not a Microsoft product surface
        </span>
      </div>

      {/* ── Teams-style chrome: top search bar ── */}
      <div style={{ height:48, flexShrink:0, display:'flex', alignItems:'center', gap:8,
        padding:'0 12px', background:T.rail, borderBottom:`1px solid ${T.border}`, zIndex:20 }}>
        {/* Teams logo */}
        <img src="/teams-logo.svg" alt="Microsoft Teams"
          style={{ width:32, height:32, flexShrink:0, display:'block' }} />
        {/* Back / forward */}
        <div style={{ display:'flex', alignItems:'center', gap:2, marginLeft:'auto', marginRight:'auto' }}>
          <button type="button" style={{ width:28, height:28, borderRadius:4,
            background:'none', border:'none', cursor:'pointer', color:T.textSoft,
            display:'flex', alignItems:'center', justifyContent:'center', transition:'background .12s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background=T.surfaceMid }}
            onMouseLeave={e=>{ e.currentTarget.style.background='none' }}>
            <ChevronLeft size={16} />
          </button>
          <button type="button" style={{ width:28, height:28, borderRadius:4,
            background:'none', border:'none', cursor:'pointer', color:T.textSoft,
            display:'flex', alignItems:'center', justifyContent:'center', transition:'background .12s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background=T.surfaceMid }}
            onMouseLeave={e=>{ e.currentTarget.style.background='none' }}>
            <ChevronRight size={16} />
          </button>
          {/* Search field */}
          <div style={{ marginLeft:16, display:'flex', alignItems:'center', gap:8,
            width:560, maxWidth:'40vw', padding:'6px 14px', borderRadius:6,
            background:T.surface, border:`1px solid ${T.border}` }}>
            <Search size={14} color={T.textSoft} />
            <input type="text" placeholder="Search"
              style={{ flex:1, fontSize:13, background:'none', border:'none', outline:'none',
                color:T.text, fontFamily:T.font }} />
          </div>
        </div>
        {/* Right chrome: more, avatar, window controls */}
        <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:'auto' }}>
          <button type="button" style={{ width:28, height:28, borderRadius:4,
            background:'none', border:'none', cursor:'pointer', color:T.textSoft,
            display:'flex', alignItems:'center', justifyContent:'center', transition:'background .12s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background=T.surfaceMid }}
            onMouseLeave={e=>{ e.currentTarget.style.background='none' }}>
            <MoreHorizontal size={16} />
          </button>
          {/* Avatar with presence dot */}
          <div style={{ position:'relative', width:28, height:28, borderRadius:'50%',
            background:'#F4A79D', display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', marginLeft:6 }}>
            A
            <span style={{ position:'absolute', right:-1, bottom:-1, width:10, height:10, borderRadius:'50%',
              background:T.green, border:`2px solid ${T.rail}` }} />
          </div>
          {/* Window controls */}
          <div style={{ display:'flex', alignItems:'center', gap:2, marginLeft:6 }}>
            {[Minus, Square, X].map((Ico, i) => (
              <button key={i} type="button" style={{ width:28, height:28, borderRadius:4,
                background:'none', border:'none', cursor:'pointer', color:T.textSoft,
                display:'flex', alignItems:'center', justifyContent:'center', transition:'background .12s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background=i===2?T.red:T.surfaceMid; e.currentTarget.style.color=i===2?'#fff':T.textSoft }}
                onMouseLeave={e=>{ e.currentTarget.style.background='none'; e.currentTarget.style.color=T.textSoft }}>
                <Ico size={i===1?11:14} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main area: left rail + content column ── */}
      <div style={{ display:'flex', flex:1, minHeight:0, overflow:'hidden' }}>

      {/* Left rail — Teams-style 68px wide with icon + label */}
      <div style={{ width:68, display:'flex', flexDirection:'column', alignItems:'stretch', padding:'6px 0',
        flexShrink:0, background:T.rail, borderRight:`1px solid ${T.border}`, zIndex:10, transition:'background .3s' }}>
        {[
          { Icon:Activity,      label:'Activity'  },
          { Icon:MessageSquare, label:'Chat', badge:1 },
          { Icon:Users,         label:'Teams'     },
          { Icon:Calendar,      label:'Calendar'  },
          { Icon:Phone,         label:'Calls'     },
          { Icon:FileText,      label:'Files'     },
        ].map(({ Icon, label, badge }, i) => (
          <button key={i} type="button"
            style={{ width:'100%', padding:'8px 4px', display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              background:'none', border:'none', cursor:'pointer', transition:'color .15s',
              color:T.textSoft, position:'relative' }}
            onMouseEnter={e => { e.currentTarget.style.color=T.core; e.currentTarget.querySelector('.rail-iconwrap').style.background=T.coreSoft }}
            onMouseLeave={e => { e.currentTarget.style.color=T.textSoft; e.currentTarget.querySelector('.rail-iconwrap').style.background='none' }}>
            <div className="rail-iconwrap" style={{ position:'relative', width:28, height:28, borderRadius:4,
              display:'flex', alignItems:'center', justifyContent:'center', transition:'background .15s' }}>
              <Icon size={18} strokeWidth={1.75} />
              {badge && (
                <span style={{ position:'absolute', top:-3, right:-5, minWidth:14, height:14, padding:'0 4px',
                  borderRadius:99, background:T.red, color:'#fff', fontSize:9, fontWeight:700,
                  display:'inline-flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>{badge}</span>
              )}
            </div>
            <span style={{ fontSize:11, fontWeight:500, lineHeight:1 }}>{label}</span>
          </button>
        ))}

        {/* JARVIS (selected app) */}
        <button type="button"
          style={{ width:'100%', padding:'8px 4px', display:'flex', flexDirection:'column', alignItems:'center', gap:3,
            background:'none', border:'none', cursor:'pointer', color:T.core, position:'relative' }}>
          {/* Selected accent bar */}
          <div style={{ position:'absolute', left:0, top:6, bottom:6, width:3, borderRadius:'0 2px 2px 0', background:T.core }} />
          <div style={{ width:28, height:28, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center',
            background:T.coreGrad }}>
            <Sparkles size={15} color="#fff" />
          </div>
          <span style={{ fontSize:11, fontWeight:700, lineHeight:1, color:T.core }}>Jarvis</span>
        </button>

        <div style={{ flex:1 }} />

        {/* Apps (+) at bottom */}
        <button type="button"
          style={{ width:'100%', padding:'8px 4px', display:'flex', flexDirection:'column', alignItems:'center', gap:3,
            background:'none', border:'none', cursor:'pointer', transition:'color .15s', color:T.textSoft }}
          onMouseEnter={e => { e.currentTarget.style.color=T.core }}
          onMouseLeave={e => { e.currentTarget.style.color=T.textSoft }}>
          <div style={{ width:28, height:28, borderRadius:4, border:`1px solid ${T.border}`,
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Plus size={14} strokeWidth={2} />
          </div>
          <span style={{ fontSize:11, fontWeight:500, lineHeight:1 }}>Apps</span>
        </button>
      </div>

      {/* Main column */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', position:'relative', zIndex:1 }}>

        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'0 16px', height:52, flexShrink:0, zIndex:10,
          background:T.surface, borderBottom:`1px solid ${T.border}`, transition:'background .3s' }}>
          <NeuralCore state={coreState} onClick={() => setCoreState('idle')} />
          <div style={{ width:1, height:24, background:T.border, flexShrink:0 }} />
          <nav style={{ display:'flex' }}>
            {navItems.map(({ id, label, Icon }) => (
              <button key={id} type="button" onClick={() => { SFX.tap(); setTab(id); if(scene!=='app') setScene('app') }}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'0 12px', height:52, fontSize:15, fontWeight:600,
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

          <ThemeToggle mode={mode} onToggle={() => setMode(m=>m==='light'?'dark':'light')} />

          {/* Org badge — static identity strip, not interactive */}
          {scene==='app' && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 4px' }}>
              <div style={{ width:18, height:18, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:T.core }}>
                <span style={{ fontSize:13, fontWeight:800, color:'white' }}>O</span>
              </div>
              <div style={{ lineHeight:1 }}>
                <p style={{ fontSize:13, fontWeight:700, color:T.text }}>OrgFarm EPIC</p>
                <p style={{ fontSize:12, color:T.textXsoft, marginTop:2 }}>salesforce.com</p>
              </div>
            </div>
          )}
        </div>

        {/* Teams-style notification toast (bottom-right, outside app UI) */}
        {showNotif && !notifDone && (
          <div className="enter" style={{ position:'fixed', bottom:20, right:20, zIndex:200, width:360,
            borderRadius:6, overflow:'hidden',
            background:'#292929', color:'#fff', fontFamily:T.font,
            boxShadow:'0 0 0 1px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.45)' }}>
            {/* Header — Teams app badge + dismiss */}
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px 8px',
              borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ width:28, height:28, borderRadius:6, flexShrink:0,
                background:'linear-gradient(135deg,#5C2E91,#7C4EAE)',
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Sparkles size={14} color="#fff" />
              </div>
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
                P1 incident — Auth Service down
              </p>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.7)', margin:'0 0 12px', lineHeight:1.45 }}>
                EU-West-1 returning 503s on /v1/auth. 3 enterprise customers impacted · owner unassigned
              </p>
              <div style={{ display:'flex', gap:6 }}>
                <button type="button" onClick={handleNotifAct}
                  style={{ flex:1, padding:'7px 10px', borderRadius:4, fontSize:12, fontWeight:600,
                    background:T.core, border:'none', color:'#fff', cursor:'pointer',
                    fontFamily:T.font, transition:'background .12s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.background=T.coreMid }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=T.core }}>
                  Open in Jarvis
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

        {/* Page content */}
        <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          {scene==='welcome' && <WelcomeScreen onLogin={handleLogin} />}

          {scene==='app' && tab==='today' && (
            <div style={{ flex:1, overflowY:'auto', padding:'24px 0 60px' }}>
              <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>

                {/* ── Hero: Ask Jarvis — primary action, top of page ── */}
                <div style={{ width:'50%', margin:'50px auto', position:'relative', zIndex:50 }}>
                  <WhisperBar hero persona={persona} coreState={coreState} setCoreState={setCoreState}
                    onCommand={cmd => {
                      const l = cmd.toLowerCase()
                      if (l.includes('manager')||l.includes('team')) setPersona('manager')
                      else if (l.includes('employee')||l.includes('my day')) setPersona('employee')
                    }} />
                </div>

                {/* ── Brief heading ── */}
                <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:14, flexWrap:'wrap' }}>
                  <h2 style={{ fontSize:18, fontWeight:700, lineHeight:1.2, color:T.text, margin:0 }}>
                    {persona==='manager' ? 'Your team needs 3 things.' : 'Your brief'}
                  </h2>
                  <span style={{ fontSize:13, fontWeight:600, color:T.textSoft }}>
                    {doneCount} of {allIntents.length} complete
                  </span>
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
                    return (
                      <button key={i} role="tab" aria-selected={active} type="button"
                        onClick={() => { SFX.tap(); HX.tap(); setTodayFilter(f.key) }}
                        style={{ display:'inline-flex', alignItems:'center', gap:8,
                          padding:'8px 14px', borderRadius:99, cursor:'pointer',
                          background: active ? f.color : T.surface,
                          border: `1px solid ${active ? f.color : T.border}`,
                          color: active ? '#fff' : T.textMid,
                          fontSize:13, fontWeight:600, fontFamily:T.font,
                          boxShadow: active ? T.shadowSm : 'none',
                          transition:'all .12s' }}
                        onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = f.color; e.currentTarget.style.color = f.color } }}
                        onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMid } }}>
                        <span>{f.label}</span>
                        <span style={{
                          display:'inline-flex', alignItems:'center', justifyContent:'center',
                          minWidth:20, height:18, padding:'0 6px', borderRadius:99,
                          background: active ? 'rgba(255,255,255,0.22)' : T.surfaceMid,
                          color: active ? '#fff' : T.textSoft,
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
                    <div className="enter" style={{ marginTop:14, padding:'15px 17px', borderRadius:16,
                      background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadowSm,
                      backdropFilter:'blur(12px)', animationDelay:'.3s' }}>
                      <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                        <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:T.coreSoft }}>
                          <Sparkles size={15} color={T.core} />
                        </div>
                        <div>
                          <p style={{ fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', color:T.core, marginBottom:5 }}>Jarvis overnight insight</p>
                          <p style={{ fontSize:15, fontWeight:600, lineHeight:1.55, color:T.text, marginBottom:4 }}>
                            {persona==='manager'
                              ? "Your team's velocity is 12% above target — but Liam's hours are masking a dependency risk on the Auth refactor."
                              : "Your Acme SOW response time is 40% faster than your last 3 deals. Pre-briefing Legal appears to be the variable."}
                          </p>
                          <p style={{ fontSize:13, color:T.textSoft }}>
                            {persona==='manager' ? 'Sprint 16 · Jira velocity · Liam Davis hours' : 'Outlook thread history · 4 recent SOW cycles'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: schedule — 40% */}
                  <div style={{ flex:2, minWidth:0 }}>
                    <RightPanel onEventClick={handleEventClick} onAddMeeting={() => setShowAddMeeting(true)} />
                  </div>

                </div>
              </div>
            </div>
          )}

          {scene==='app' && tab==='conversations' && (
            <ConversationsView openConvId={openConvId} onConvOpen={id=>setOpenConvId(id)} setCoreState={setCoreState} />
          )}
          {scene==='app' && tab==='feed' && <FeedView />}
          {scene==='app' && tab==='agents' && <AgentsView onNew={() => setShowWizard(true)} />}
        </div>

      </div>

      </div>{/* /main area (rail + column) */}

      {/* Chat sidebar */}
      {showChat && (
        <ChatPanel item={chatItem} scenario={chatScenario} preselect={chatPreselect} setCoreState={setCoreState}
          activeTab={chatTab} setActiveTab={setChatTab}
          onExpandFull={expandToConversations}
          onClose={() => { setShowChat(false); setChatItem(null); setChatScenario(null); setChatPreselect(null); setCoreState('idle') }} />
      )}

      {showWizard && <AgentWizard onClose={() => setShowWizard(false)} />}
      {showAddMeeting && <AddMeetingModal onClose={() => setShowAddMeeting(false)} />}

      {/* Lightweight global toast (reminder confirmations, etc.) */}
      {toast && (
        <div className="enter" style={{ position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)',
          zIndex:220, padding:'10px 16px', borderRadius:6, fontSize:13, fontWeight:500,
          background:'#292929', color:'#fff', fontFamily:T.font,
          boxShadow:'0 8px 24px rgba(0,0,0,0.35)', display:'flex', alignItems:'center', gap:10 }}>
          <Bell size={13} color={T.blue} />
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  )
}

