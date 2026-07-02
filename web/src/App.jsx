import React, { useState, useEffect, useRef } from 'react'
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
  Wand2, PenSquare, Lightbulb,
  Cloud, Mail, Briefcase, Layers, LifeBuoy, GitBranch, Hash as HashIcon,
  Pin, PinOff,
} from '@/components/icons/fluent'
import { asset } from '@/utils/asset'
import { useTeamsEmbed, teamsThemeToMode } from '@/utils/teamsEmbed'
import { FluentProvider, Button as FluentButton, TabList as FluentTabList, Tab as FluentTab, Switch as FluentSwitch, Input as FluentInput, Textarea as FluentTextarea, Avatar as FluentAvatar, Dialog as FluentDialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, OverlayDrawer, DrawerHeader, DrawerHeaderTitle, DrawerBody, DrawerFooter } from '@fluentui/react-components'
import { fluentThemeForMode } from '@/utils/fluentTheme'
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
    appBgGrad:   'linear-gradient(160deg, #1B1A20 0%, #242029 55%, #1E1C23 100%)',  // overall canvas gradient (brand-tinted)
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
    appBgGrad:   '#000000',   // HC stays flat black — no gradient for accessibility
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
@keyframes riseMask   { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
@keyframes fadeUp     { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes glowPop    { 0%{opacity:0;transform:scale(.82)} 60%{transform:scale(1.03)} 100%{opacity:1;transform:scale(1)} }
.expand-down { animation: expandDown 150ms cubic-bezier(.33,0,.67,1) both; }
[data-clickable] * { cursor: pointer; }
.enter    { animation: slideUp  200ms cubic-bezier(.33,0,.67,1) both; }
.enter-r  { animation: slideRight 200ms cubic-bezier(.33,0,.67,1) both; }
.pop      { animation: softPop 150ms cubic-bezier(.33,0,.67,1) both; }
.done     { animation: doneSlide 200ms ease-out both; }
.fade     { animation: fadeIn 150ms ease both; }
.reveal-mask { display:inline-block; overflow:hidden; vertical-align:top; padding:0 .02em; }
.reveal-word { display:inline-block; animation: riseMask 720ms cubic-bezier(.22,1,.36,1) both; }
.reveal-up   { animation: fadeUp 720ms cubic-bezier(.22,1,.36,1) both; }
.glow-pop    { animation: glowPop 640ms cubic-bezier(.22,1,.36,1) both; }
.sr          { opacity: 0; }
.in .sr      { animation: fadeUp 720ms cubic-bezier(.22,1,.36,1) both; animation-delay: var(--sd, 0s); }
* { box-sizing: border-box; margin: 0; padding: 0; }
button { font-family: inherit; }
input, textarea, select { font-family: inherit; }
/* Auto-hiding overlay scrollbar — the thumb stays invisible until the user
   scrolls (html.is-scrolling, toggled in JS) or hovers the scrollable area,
   then fades back out. Reserves a fixed gutter so content never reflows. */
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background-color: transparent;
  border: 3px solid transparent;
  background-clip: padding-box;
  border-radius: 8px;
  transition: background-color .4s ease;
}
html.is-scrolling ::-webkit-scrollbar-thumb,
*:hover::-webkit-scrollbar-thumb { background-color: rgba(128,128,128,0.4); }
::-webkit-scrollbar-thumb:hover { background-color: rgba(128,128,128,0.6); }
/* Firefox — thin overlay; colour only while actively scrolling */
* { scrollbar-width: thin; scrollbar-color: transparent transparent; }
html.is-scrolling *, *:hover { scrollbar-color: rgba(128,128,128,0.4) transparent; }
::selection { background: rgba(92,46,145,0.15); }
.card-action-tip:hover .tip-label { opacity: 1; }
.conv-row:hover .conv-pin { opacity: 1; }
.j-msg .j-feedback { opacity: 0; transition: opacity .15s; }
.j-msg:hover .j-feedback,
.j-feedback:focus-within { opacity: 1; }
.skip-link { position: absolute; left: 8px; top: -48px; z-index: 1000;
  background: var(--focus-ring, #5C2E91); color: #fff; padding: 8px 14px;
  border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none;
  transition: top .15s ease; }
.skip-link:focus { top: 8px; outline: 2px solid #fff; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  *, .enter, .enter-r, .pop, .done, .fade, .expand-down {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
  .reveal-word, .reveal-up, .glow-pop { animation: none !important; }
  .sr { opacity: 1 !important; animation: none !important; }
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
  { id:'brief', tier:'L1', cat:'Your morning brief',
    headline:'Good morning, Alex — 6 things need you today',
    why:'I ranked your inbox, Teams, calendar, Salesforce and Workday by deadline × impact. Three I can mostly handle; three need a decision.',
    action:'Open the brief', source:'Jarvis · 9:00 AM',
    evidence:'6 items · 3 need a decision', chatScenario:'brief' },
  { id:'sfcase', tier:'L3', cat:'Overnight',
    headline:'High-priority Salesforce case created — may need a review bridge',
    why:'“Mandatory Product Review Preparation” came in overnight. I summarised it, found the stakeholders, and there\'s a 30-min slot at 1 PM. One tap sets up the bridge.',
    action:'Review the case', source:'Salesforce · 02:14 AM',
    evidence:'High priority · 3 stakeholders · 1 PM slot free', chatScenario:'sfcase' },
  { id:'hrcase', tier:'L3', cat:'Confidential · needs you',
    headline:'HR case assigned to you — acknowledge within 24h',
    why:'A workplace concern naming someone on your team came in via the HR desk. I read the case and the policy and lined up the first steps — anything touching the people involved waits for you.',
    action:'Open the HR case', source:'ServiceNow · HR desk',
    evidence:'Medium severity · SLA 24h · HRBP loop-in required', chatScenario:'hrcase' },
  { id:'resch', tier:'L3', cat:'Just landed · needs you now',
    headline:'Marc made the 2 PM product review mandatory — clears with 1 tap',
    why:'Marc (SVP) outranks everything on your afternoon. I worked out the reshuffle and drafted every message — 4 on Teams, 3 emails. One approval sends them all and clears your 2 PM.',
    action:'Review the reshuffle', source:'Teams + Outlook · 11:40 AM',
    evidence:'Sender outranks 3 conflicting meetings · 7 messages drafted',
    chatScenario:'reschedule' },
  { id:'task', tier:'L2', cat:'Follow-up needed',
    headline:'Priya asked you to follow up with Finance before EOD',
    why:'A Teams message from Priya reads like an action with a deadline. I can turn it into a task at 4:30 PM linked to the vendor thread.',
    action:'Create follow-up task', source:'Teams · Priya',
    evidence:'Deadline EOD · linked to #finance-ops', chatScenario:'followuptask' },
  { id:'invoice', tier:'L1', cat:'Follow-up needed',
    headline:'Uber invoice ready to file as an expense',
    why:'An email arrived with an Uber invoice for yesterday\'s customer visit. I extracted the merchant, amount, date and category — one tap creates the Salesforce expense draft.',
    action:'Review & file', source:'Outlook · receipts@uber.com',
    evidence:'$24.80 · under $75 · no receipt approval needed', chatScenario:'invoice' },
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
  // ── S1: Morning brief — the scripted "6 things" opener ──────────────────
  brief:[{
    role:'j',
    text:"Good morning, Alex. Here are the **6 things that need you today**:\n\n1. A high-priority **Salesforce case** was created overnight — it may need a review bridge.\n2. Your **2 PM product review** is currently blocked by three meetings.\n3. A **Teams message from Priya** needs a follow-up task.\n4. An **invoice email** is ready to become an expense submission.\n5. Your **PTO request** is still pending approval.\n6. You have an **upcoming holiday** — I can sketch a quick 2-day getaway plan.\n\nThree of these I can mostly handle; three need a decision. Want to start at the top?",
    trace:{
      summary:'Ranked 6 items across 5 systems by deadline × impact',
      steps:[
        { label:'Pulled overnight signals', plugin:'OutlookPlugin',
          bullets:['Salesforce: 1 new high-priority case','Outlook: 1 invoice email, 1 mandatory invite','Teams: 1 action request from Priya'] },
        { label:'Checked Workday + calendar', plugin:'WorkdayPlugin',
          bullets:['PTO pending past SLA','Company holiday next Friday','2 PM blocked by 3 meetings'] },
        { label:'Scored by deadline × impact', plugin:'WorkdayPlugin',
          bullets:['3 need a decision · 3 I can mostly handle','Nothing low-signal surfaced'] },
      ]
    },
  }],
  // ── S2: Salesforce case creation → proactive review bridge ──────────────
  sfcase:[{
    role:'j',
    text:"**New high-priority Salesforce case — “Mandatory Product Review Preparation.”**\nCreated overnight. I summarised it, found the required stakeholders, and there's a clean **30-minute bridge slot at 1:00 PM** today.\n\nWant me to set up the calendar bridge and draft the Teams update?",
    trace:{
      summary:'Read 1 case, found stakeholders and a bridge slot',
      steps:[
        { label:'Summarised Salesforce case 00043912', plugin:'SalesforcePlugin',
          bullets:['Priority: High','Product area: Platform','Asks for a cross-functional review before Friday'] },
        { label:'Identified required stakeholders', plugin:'SalesforcePlugin',
          bullets:['You (owner)','Priya — design','Raj — engineering','Marc (SVP) — optional'] },
        { label:'Found a 30-min bridge slot', plugin:'OutlookPlugin',
          bullets:['1:00–1:30 PM today free for all three','No conflicts'] },
      ]
    },
    actions:[
      { label:'Create the calendar bridge', key:'sf_bridge', tier:'L1' },
      { label:'Draft the Teams update', key:'sf_update', tier:'L2' },
      { label:'Add a note to the case', key:'sf_note', tier:'L1' },
    ],
  }],
  // ── HR / incident case handling (for the 18th review) ───────────────────
  hrcase:[{
    role:'j',
    text:"**HR case assigned to you — HR-2041 · “Workplace concern, Platform team.”**\n\nIt came in through the HR service desk and names someone on your team. I read the case, checked the policy, and lined up the first steps — but anything that touches the people involved waits for you.\n\nI read the case, not the gossip. Nothing was shared wider.",
    trace:{
      summary:'Read 1 HR case, checked policy, identified the required steps',
      steps:[
        { label:'Read HR case HR-2041 (confidential)', plugin:'ServiceNowPlugin',
          bullets:['Category: Workplace concern','Raised: 2 hours ago','Severity: Medium · SLA 24h'] },
        { label:'Checked the employee-relations policy', plugin:'WorkdayPlugin',
          bullets:['Manager acknowledges within 24h','HRBP loop-in required before any 1:1','No detail to the wider team'] },
        { label:'Identified who needs to be involved', plugin:'WorkdayPlugin',
          bullets:['HRBP: Dana Okafor','You (line manager) — acknowledge + a private check-in'] },
      ]
    },
    actions:[
      { label:'Acknowledge the case in the HR desk', key:'hr_ack', tier:'L1' },
      { label:'Draft a private check-in note', key:'hr_note', tier:'L2' },
      { label:'Loop in HRBP Dana', key:'hr_hrbp', tier:'L3' },
      { label:'Send a message to the employee', key:'hr_send', tier:'L4' },
    ],
  }],
  // ── S8: Teams message → follow-up task ──────────────────────────────────
  followuptask:[{
    role:'j',
    text:"Priya messaged: *“Can you follow up with Finance on the vendor approval before EOD?”*\n\nThis reads like a follow-up task. Want me to create it for **today at 4:30 PM** and link it to the vendor thread?",
    trace:{
      summary:'Read 1 Teams message, detected an action request',
      steps:[
        { label:'Read Priya\'s Teams message', plugin:'TeamsPlugin',
          bullets:['“follow up with Finance … before EOD”','Detected: action request + deadline'] },
        { label:'Matched it to an open thread', plugin:'TeamsPlugin',
          bullets:['Vendor approval thread · #finance-ops','Owner: you'] },
      ]
    },
    actions:[
      { label:'Create task · today 4:30 PM', key:'task_create', tier:'L1' },
      { label:'Draft the message to Finance', key:'task_draft', tier:'L2' },
    ],
  }],
  // ── S9: Email invoice → Salesforce expense submission ───────────────────
  invoice:[{
    role:'j',
    text:"I found an **invoice from Uber** attached to an email — yesterday's customer visit. I extracted the details. Want me to create a **Salesforce expense submission** draft?",
    trace:{
      summary:'Read 1 email + attachment, extracted 4 fields',
      steps:[
        { label:'Detected an invoice attachment', plugin:'OutlookPlugin',
          bullets:['From: receipts@uber.com','Subject: Your Tuesday trip'] },
        { label:'Extracted the expense fields', plugin:'OutlookPlugin',
          bullets:['Merchant: Uber','Amount: $24.80','Date: Jun 16','Category: Travel — client visit'] },
        { label:'Checked it against expense policy', plugin:'SalesforcePlugin',
          bullets:['Under $75 — no receipt approval needed','Cost centre: Platform PM'] },
      ]
    },
    table:{
      headers:['Field','Value'],
      rows:[['Merchant','Uber'],['Amount','$24.80'],['Date','Jun 16'],['Category','Travel — client visit']],
    },
    actions:[
      { label:'Create the expense draft in Salesforce', key:'exp_create', tier:'L1' },
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

// ── Intents ⇄ Recents are one model ──────────────────────────────────────────
// Each Today intent maps to a conversation (Recents) id, so opening an intent
// selects its Recents row and clicking that row reopens the same intent detail.
const ALL_INTENTS = [...INTENTS, ...MANAGER_INTENTS]
const INTENT_TO_CONV = { hero:'cv1', y1:'cv2', e1:'cv3', y2:'cv4', f1:'cv5', mh:'cv6' }
const CONV_TO_INTENT = Object.fromEntries(Object.entries(INTENT_TO_CONV).map(([k, v]) => [v, k]))
const findIntent = (id) => ALL_INTENTS.find(i => i.id === id) || null
const convIdForIntent = (intent) => INTENT_TO_CONV[intent.id] || `i_${intent.id}`

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

/**
 * Responsive breakpoints (Teams stage sizes). Returns the live window width and
 * convenience flags so inline-styled layouts can reflow:
 *   - isNarrow  (< 920px): stack two-column layouts, collapse the app rail
 *   - isMobile  (< 640px): mobile stage — full-width panels
 */
function useBreakpoint() {
  const [w, setW] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1280))
  useEffect(() => {
    const onResize = () => setW(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return { width: w, isNarrow: w < 920, isMobile: w < 640 }
}

function GlassCard({ children, style = {}, hover = true, onClick, className = '', ariaLabel }) {
  const T = window.__T
  const [hov, setHov] = useState(false)
  const interactive = !!onClick
  return (
    <div onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={ariaLabel}
      onKeyDown={interactive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e) }
      } : undefined}
      onMouseEnter={() => hover && setHov(true)} onMouseLeave={() => setHov(false)}
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

/**
 * Fluent UI v9 Button. We use the real Fluent `Button` (keyboard, focus ring,
 * pressed states, ARIA, theme integration come from the framework) but keep the
 * Jarvis brand colors via inline overrides — FluentProvider's brand ramp is
 * Teams purple, and the product brand is intentionally Jarvis purple. The
 * existing `variant`/`icon`/`style` API is preserved so call sites don't change.
 */
function Btn({ children, variant='primary', onClick, style={}, icon: Icon, disabled=false }) {
  const T = window.__T
  const [hov, setHov] = useState(false)
  const appearance =
    variant === 'secondary' ? 'outline' :
    variant === 'ghost' ? 'subtle' :
    'primary' // primary + danger render filled
  const colorStyle =
    variant === 'primary'   ? { backgroundColor: hov ? T.coreMid : T.core, color: T.coreText, border: 'none', boxShadow: hov ? T.shadowPurple : 'none' } :
    variant === 'danger'    ? { backgroundColor: hov ? '#A52020' : T.red, color: '#fff', border: 'none' } :
    variant === 'secondary' ? { backgroundColor: hov ? T.surfaceMid : 'transparent', color: T.text, borderColor: T.border } :
    variant === 'ghost'     ? { backgroundColor: hov ? T.surfaceMid : 'transparent', color: T.textMid, border: 'none' } :
    {}
  return (
    <FluentButton
      appearance={appearance}
      disabled={disabled}
      onClick={onClick}
      icon={Icon ? <Icon size={13} /> : undefined}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ minWidth: 0, height: 'auto', gap: 6, padding: '8px 16px', borderRadius: 4,
        fontSize: 14, fontWeight: 600, transition: 'all .15s', ...colorStyle, ...style }}
    >
      {children}
    </FluentButton>
  )
}

/**
 * Fluent UI v9 Switch (replaces the previous click-only div — now keyboard
 * operable with role=switch). Brand-tinted to the Jarvis core via a token
 * override; keeps the no-arg onChange contract its call sites rely on.
 */
function Toggle({ value, onChange, ariaLabel }) {
  const T = window.__T
  return (
    <FluentSwitch
      checked={!!value}
      onChange={() => onChange?.()}
      aria-label={ariaLabel || 'Toggle setting'}
      style={{
        flexShrink: 0,
        '--colorCompoundBrandBackground': T.core,
        '--colorCompoundBrandBackgroundHover': T.coreMid,
        '--colorCompoundBrandBackgroundPressed': T.core,
      }}
    />
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
  const [hovered, setHovered] = useState(false)
  const stop = (e) => e.stopPropagation()
  const open = () => { SFX.tap(); HX.tap(); onAct(intent) }
  const micro = [
    { Icon:Check, color:T.green,   label:'Mark done', on:() => { SFX.done(); HX.done(); onDone(intent.id) } },
    { Icon:Bell,  color:T.blue,    label:'Remind me', on:() => { SFX.tap(); HX.tap(); onRemind?.(intent.id) } },
    { Icon:X,     color:T.textSoft,label:'Dismiss',   on:() => { SFX.tap(); onDismiss(intent.id) } },
  ]
  return (
    <div className="enter" role="button" tabIndex={0} aria-label={intent.headline}
      onClick={open}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } }}
      style={{ marginBottom:12, position:'relative', cursor:'pointer', borderRadius:16, animationDelay:`${idx*.05}s`,
        background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadowSm, padding:'16px 18px',
        transition:'transform .16s, box-shadow .16s' }}
      onMouseEnter={e => { setHovered(true); e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=T.shadowMd }}
      onMouseLeave={e => { setHovered(false); e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=T.shadowSm }}
      onFocus={() => setHovered(true)}
      onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setHovered(false) }}>
      <span style={{ position:'absolute', top:15, right:15, color:T.textXsoft, display:'inline-flex' }}><ChevronRight size={16} /></span>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:9, flexWrap:'wrap' }}>
        {intent.cat && (
          <span style={{ display:'inline-block', fontSize:10, fontWeight:800, letterSpacing:'0.05em', textTransform:'uppercase',
            padding:'3px 9px', borderRadius:99, background:m.bg, color:m.color }}>{intent.cat}</span>
        )}
        {intent.prepReady && (
          <span style={{ fontSize:10.5, fontWeight:700, color:T.blue, background:T.blueSoft, padding:'3px 8px', borderRadius:99 }}>Prep ready</span>
        )}
      </div>
      <h3 style={{ fontSize:15.5, fontWeight:700, lineHeight:1.4, color:T.text, margin:'0 0 6px', paddingRight:22 }}>{intent.headline}</h3>
      <p style={{ fontSize:13, color:T.textSoft, lineHeight:1.5, margin:'0 0 14px' }}>{intent.why}</p>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button type="button" onClick={(e) => { stop(e); open() }}
            style={{ border:'none', background:T.core, color:'#fff', fontWeight:700, fontSize:12.5, padding:'8px 15px', borderRadius:8, cursor:'pointer', fontFamily:T.font }}>{intent.action || 'Open conversation'}</button>
          <button type="button" onClick={(e) => { stop(e); SFX.tap(); onRemind?.(intent.id) }}
            style={{ border:`1px solid ${T.border}`, background:T.surface, color:T.text, fontWeight:700, fontSize:12.5, padding:'8px 15px', borderRadius:8, cursor:'pointer', fontFamily:T.font }}>Snooze</button>
        </div>
        <div style={{ display:'flex', gap:6, opacity:hovered ? 1 : 0,
          pointerEvents:hovered ? 'auto' : 'none', transition:'opacity .14s' }}>
          {micro.map(({ Icon, color, label, on }, i) => (
            <button key={i} type="button" aria-label={label} title={label} onClick={(e) => { stop(e); on() }}
              style={{ width:30, height:30, borderRadius:8, border:'none', background:'transparent', color,
                display:'inline-flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'background .12s, color .12s' }}
              onMouseEnter={e => { e.currentTarget.style.background = T.coreSoft; e.currentTarget.style.color = T.core }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = color }}>
              <Icon size={14} />
            </button>
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
      {/* Hour grid container — flat (the Calendar panel provides the frame) */}
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
  )
}

// ─── Add Meeting Modal ────────────────────────────────────────────────────────
function AddMeetingModal({ onClose }) {
  const T = window.__T
  const [prep, setPrep] = useState(true)
  // Fluent v9 Input fields: full-width with the focus underline tinted to the
  // Jarvis brand (FluentProvider's brand is Teams purple).
  const fluentField = { width:'100%', '--colorCompoundBrandStroke': T.core }
  const lbl = { display:'block', fontSize:13, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:T.textSoft, marginBottom:5 }
  return (
    <FluentDialog open modalType="modal" onOpenChange={(_, data) => { if (!data.open) { SFX.close(); onClose() } }}>
      <DialogSurface aria-label="Add meeting" style={{ maxWidth:460 }}>
        <DialogBody>
          <DialogTitle
            action={<FluentButton appearance="subtle" aria-label="Close" icon={<X size={20} />} onClick={() => { SFX.close(); onClose() }} />}
          >Add meeting</DialogTitle>
          <DialogContent>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div><label style={lbl}>Title</label><FluentInput placeholder="Meeting title" style={fluentField} /></div>
              <div style={{ display:'flex', gap:10 }}>
                <div style={{ flex:1.2 }}><label style={lbl}>Date</label><FluentInput type="date" defaultValue="2026-05-01" style={fluentField} /></div>
                <div style={{ flex:1 }}><label style={lbl}>Start</label><FluentInput type="time" defaultValue="10:00" style={fluentField} /></div>
                <div style={{ flex:1 }}><label style={lbl}>End</label><FluentInput type="time" defaultValue="10:30" style={fluentField} /></div>
              </div>
              <div><label style={lbl}>Attendees</label><FluentInput placeholder="Names or emails" style={fluentField} /></div>
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
                <Toggle value={prep} onChange={() => { SFX.tap(); setPrep(v=>!v) }} ariaLabel="Let Jarvis prep this meeting" />
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Btn variant="secondary" onClick={() => { SFX.close(); onClose() }}>Cancel</Btn>
            <Btn variant="primary" icon={Calendar} onClick={() => { SFX.done(); HX.done(); onClose() }}>Add to Calendar</Btn>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </FluentDialog>
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
              fontSize:13, fontWeight:600, padding:'7px 15px', borderRadius:99, cursor:'pointer',
              background:T.coreSoft, color:T.core, border:`1px solid ${T.core}33`,
              transition:'all .15s', fontFamily:T.font }}
            onMouseEnter={e => { e.currentTarget.style.background=`linear-gradient(135deg, ${T.core}, ${T.coreBright})`; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background=T.coreSoft; e.currentTarget.style.borderColor=`${T.core}33`; e.currentTarget.style.color=T.core }}>
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
    <FluentDialog open modalType="modal" onOpenChange={(_, data) => { if (!data.open) onCancel() }}>
      <DialogSurface aria-label="Gated action" style={{ maxWidth:480 }}>
        <DialogBody>
          <DialogTitle>
            <span style={{ display:'inline-flex', alignItems:'center', gap:10 }}>
              <span style={{ width:30, height:30, borderRadius:8, background:T.amberSoft,
                display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <ShieldCheck size={15} color={T.amber} />
              </span>
              One last check
            </span>
          </DialogTitle>
          <DialogContent>
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
          </DialogContent>
          <DialogActions>
            <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
            <Btn variant="danger" disabled={!confirmed} onClick={() => confirmed && onRun()}>Run</Btn>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </FluentDialog>
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
  // Bubble-free reply: thinking trace → answer prose → table → sources → action chips.
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

function ChatPanel({ item, scenario, preselect, onClose, setCoreState, activeTab, setActiveTab, onExpandFull, docked = false, initialMessages = null }) {
  const T = window.__T
  const { isNarrow } = useBreakpoint()
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
    hr_send: 'This message goes to the employee named in a confidential HR case. Per the employee-relations policy, you must confirm before anything is sent in your name.',
  }
  // Custom "Done" copy for actions where the chip label isn't a good past-tense line.
  const DONE_LABELS = {
    reschedule_send: 'Done. Your 2 PM is clear for Marc — sent 4 Teams messages and 3 emails, updated your calendar, and added a note to the Salesforce case.',
    sf_bridge:  'Calendar bridge created · 1:00–1:30 PM today, invites sent to Priya and Raj. Salesforce case updated.',
    sf_note:    'Added a note to the Salesforce case: review bridge scheduled for 1 PM.',
    task_create:'Task created for 4:30 PM today, linked to the vendor approval thread.',
    exp_create: 'Expense draft created in Salesforce — Uber, $24.80. Ready for your submit.',
    hr_ack:     'Acknowledged in the HR desk — SLA clock noted, HRBP told you\'re handling it.',
    hr_hrbp:    'Looped in HRBP Dana Okafor with the case reference. No case detail sent wider.',
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
    // S2 — Salesforce case → Teams update draft
    sf_update: {
      subject: null,
      body: "Heads-up team — I've set up a 30-min review bridge at 1:00 PM today for the “Mandatory Product Review Preparation” case. Priya (design) and Raj (eng), please join. I'll share the case summary in the invite. Thanks!",
    },
    // S8 — follow-up task → message to Finance draft
    task_draft: {
      subject: null,
      body: "Hi Finance team — following up on the vendor approval Priya flagged. Could we get a status before EOD today? Happy to jump on a quick call if that's faster. Thanks!",
    },
    // HR case → private check-in note draft (to the employee, gentle, non-leading)
    hr_note: {
      subject: null,
      body: "Hi — do you have 15 minutes for a quick private chat today or tomorrow? Nothing urgent on deliverables; I just want to check in and make sure you've got what you need. Happy to find a time that works for you.",
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
    // A saved Recents thread (a conversation not tied to an intent) — render as-is.
    if (initialMessages && initialMessages.length) {
      setThinking(false); setCoreState('idle')
      setMessages(initialMessages)
      return
    }
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
  }, [scenario, item?.id, initialMessages])

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
      : scenario === 'brief' ? 'Your morning brief'
      : scenario === 'sfcase' ? 'Salesforce case — review bridge'
      : scenario === 'hrcase' ? 'HR case HR-2041'
      : scenario === 'followuptask' ? 'Follow-up with Finance'
      : scenario === 'invoice' ? 'Uber invoice — expense draft'
      : 'New chat')

  return (
    <div className="enter-r" style={isNarrow
      ? { position:'fixed', inset:0, zIndex:300, display:'flex', flexDirection:'column', background:T.surface, overflow:'hidden' }
      : docked
      ? { flex:1, minWidth:0, position:'relative', display:'flex', flexDirection:'column',
          background:T.surface, overflow:'hidden' }
      : { width:400, flexShrink:0, position:'relative', display:'flex', flexDirection:'column',
          background:T.surface, borderLeft:`1px solid ${T.border}`, overflow:'hidden',
          boxShadow:`-4px 0 12px rgba(0,0,0,0.06)` }}>
      {/* Ambient gradient wash (Gemini-style) behind the conversation */}
      <div aria-hidden="true" style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
        background:`radial-gradient(46% 26% at 10% 0%, ${T.coreGlow} 0%, transparent 60%), radial-gradient(40% 24% at 100% 5%, ${T.coreSoft} 0%, transparent 58%)` }} />
      {/* Chat view — sticky title (with Related + maximize + close) and a max-800 reading column.
          Mirrors the Conversations chat pane exactly. */}
      {activeTab === 'chat' && (
        <div style={{ flex:1, overflowY:'auto', position:'relative', zIndex:1 }}>
          {docked ? (
            /* Docked full view — centered onboarding-style greeting, no window controls
               (the left rail handles navigation, so close/expand aren't needed here). */
            <div style={{ maxWidth:800, margin:'0 auto', padding:'26px 16px 12px',
              display:'flex', alignItems:'flex-start', gap:16 }}>
              <h2 title={headerTitle}
                style={{ flex:1, minWidth:0, fontSize:22, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1.25, margin:0,
                  background:`linear-gradient(135deg, ${T.core}, ${T.coreBright})`,
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                {headerTitle}
              </h2>
              <button type="button" onClick={() => { SFX.tap(); setActiveTab('related') }}
                aria-label="Show related"
                style={{ flexShrink:0, marginTop:4, display:'inline-flex', alignItems:'center', gap:6,
                  padding:'7px 14px', borderRadius:99, cursor:'pointer',
                  background:T.surface, border:`1px solid ${T.border}`,
                  color:T.textMid, fontSize:13, fontWeight:600, fontFamily:T.font, transition:'all .12s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.core; e.currentTarget.style.color = T.core }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMid }}>
                <Layers size={13} />
                Related
              </button>
            </div>
          ) : (
            /* Side-panel — sticky title row: title on the extreme left, controls on the extreme right */
            <div style={{ position:'sticky', top:0, zIndex:5, background:T.surface,
              padding:'14px 16px 12px', borderBottom:`1px solid ${T.border}`,
              display:'flex', alignItems:'center', gap:8 }}>
              <h2 title={headerTitle}
                style={{ flex:1, fontSize:15, fontWeight:800, margin:0, letterSpacing:'-0.01em',
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.3,
                  background:`linear-gradient(135deg, ${T.core}, ${T.coreBright})`,
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
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
          )}

          {/* Centered reading column — max-width 800 */}
          <div style={{ maxWidth:800, margin:'0 auto', padding:'4px 16px 16px',
            display:'flex', flexDirection:'column', gap:18 }}
            role="log" aria-label="Conversation with Jarvis" aria-live="polite" aria-relevant="additions text">
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
                        fontSize:14, lineHeight:1.55, borderRadius:18, borderBottomRightRadius:5,
                        background:`linear-gradient(135deg, ${T.core}, ${T.coreMid})`, color:'#fff',
                        boxShadow:T.shadowSm }}>
                        {renderMsg(m.text)}
                      </div>
                    </div>
                  ) : (
                    <div className="j-msg" style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                      <JarvisMark size={24} radius={7} style={{ flexShrink:0, marginTop:1 }} />
                      <div style={{ flex:1, minWidth:0, fontSize:14, lineHeight:1.65, color:T.text }}>
                        {renderBubble(m, T, (label) => sendText(label), handleTieredClick)}
                        <MessageFeedback msgIndex={i} />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {thinking && (
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <JarvisMark size={24} radius={7} style={{ flexShrink:0 }} />
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:T.coreMid,
                      animation:'breathe .9s ease-in-out infinite', animationDelay:`${i*.2}s` }} />
                  ))}
                </div>
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
            {!docked && (
              <>
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
              </>
            )}
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
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <FluentAvatar
                      name={person.name}
                      image={{ src: `https://i.pravatar.cc/72?u=${encodeURIComponent(person.name)}` }}
                      badge={{ status: person.online ? 'available' : 'away' }}
                      size={36} />
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

      {/* Continue input — Gemini-style suggestion rail + gradient-bordered capsule */}
      {activeTab==='chat' && (
        <div style={{ padding:'10px 14px 14px', flexShrink:0, position:'relative', zIndex:1 }}>
          <div style={{ maxWidth: docked ? 800 : 'none', margin:'0 auto' }}>
            <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:10, scrollbarWidth:'none' }}>
              {['Summarize this', 'What are my options?', 'Draft a reply'].map((s, i) => (
                <button key={i} type="button" onClick={() => { SFX.tap(); HX.tap(); sendText(s) }}
                  style={{ flexShrink:0, fontSize:12.5, fontWeight:600, color:T.core,
                    background:T.surface, border:`1px solid ${T.core}40`, borderRadius:99,
                    padding:'7px 13px', cursor:'pointer', fontFamily:T.font, whiteSpace:'nowrap', transition:'all .12s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.core; e.currentTarget.style.background = T.coreSoft }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = `${T.core}40`; e.currentTarget.style.background = T.surface }}>
                  {s}
                </button>
              ))}
            </div>
            <ContinueBar value={input} onChange={setInput} onSubmit={send} placeholder="Ask Jarvis or reply…" />
          </div>
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
    <OverlayDrawer open position="end" modalType="modal" onOpenChange={(_, data) => { if (!data.open) onClose() }}
      style={{ width:440, maxWidth:'96vw' }}>
      <DrawerHeader>
        <DrawerHeaderTitle
          action={<FluentButton appearance="subtle" aria-label="Close" icon={<X size={18} />} onClick={onClose} />}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:12 }}>
            <JarvisMark size={32} radius={8} />
            <span>
              <span style={{ display:'block', fontSize:15, fontWeight:800, color:T.text }}>What I can do</span>
              <span style={{ display:'block', fontSize:12, fontWeight:400, color:T.textSoft, marginTop:2 }}>Here's where I'm helping — tell me to adjust.</span>
            </span>
          </span>
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody>
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
                  : { background:'rgba(136,23,152,0.08)', color:T.text, border:'none', borderBottomLeftRadius:2 }) }}>
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
      </DrawerBody>
      <DrawerFooter>
        <div style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:99,
          background:T.surface, border:`1px solid ${T.border}` }}>
          <Sparkles size={14} color={T.coreMid} />
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            aria-label="Ask Jarvis to add or remove something"
            placeholder="Ask me to add or remove something…"
            style={{ flex:1, fontSize:13, background:'none', border:'none', outline:'none',
              color:T.text, fontFamily:T.font }} />
          <button type="button" onClick={send} aria-label="Send"
            style={{ width:26, height:26, borderRadius:99, cursor:'pointer',
              background: input.trim() ? T.core : T.surfaceMid,
              border:'none', color: input.trim() ? '#fff' : T.textXsoft,
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <ArrowRight size={13} />
          </button>
        </div>
      </DrawerFooter>
    </OverlayDrawer>
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
                  ariaLabel="Keep weekends quiet"
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

// ─── Conversational setup — chat-style onboarding (replaces the 3-step wizard) ─
// Asks the same questions as SetupView (tools, help style, where to reach you,
// quiet hours) but as a friendly back-and-forth. Persists the identical prefs
// shape so the downstream tier logic keeps working unchanged.
function ConversationalSetup({ initialPrefs, onComplete, onSkip, onBack }) {
  const T = window.__T

  const SIMPLE_SYSTEMS = [
    { id:'outlook',    name:'Outlook',               desc:'email and calendar' },
    { id:'calendar',   name:'Calendar',              desc:'your meetings' },
    { id:'onedrive',   name:'OneDrive / SharePoint', desc:'docs you own' },
    { id:'workday',    name:'Workday',               desc:'HR, PTO, benefits' },
    { id:'salesforce', name:'Salesforce',            desc:'cases and approvals' },
    { id:'jira',       name:'Jira',                  desc:'tickets and sprints' },
  ]
  const TRUST_OPTIONS = [
    { id:'auto',   title:'Handle what you can',    sub:'Small things just get done — with a log and Undo.' },
    { id:'review', title:'Draft it, I\'ll decide', sub:'You see a draft before anything leaves the building.' },
    { id:'ask',    title:'Ask me every time',      sub:'Nothing happens without your OK.' },
  ]
  const CHANNELS = [
    { id:'teams', label:'Teams chat' },
    { id:'email', label:'Email' },
    { id:'both',  label:'Both' },
  ]

  const [draft, setDraft] = useState(() => ({
    systems: { ...DEFAULT_PREFS.systems, ...(initialPrefs?.systems || {}) },
    trust:   initialPrefs?.trust || 'review',
    channel: initialPrefs?.notify?.channel || 'teams',
    quiet:   { ...DEFAULT_PREFS.quiet, ...(initialPrefs?.quiet || {}) },
  }))
  const [phase, setPhase] = useState('systems') // systems | trust | channel | quiet | done
  const [log, setLog] = useState(() => ([
    { role:'jarvis', text:"Hi, I'm Jarvis. 👋 Let's set a few ground rules — just a quick chat, no forms." },
    { role:'jarvis', text:"First: which of your tools should I keep an eye on? Pick the ones you use — I only ever read what I need." },
  ]))

  const scrollRef = useRef(null)
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior:'smooth' })
  }, [log, phase])

  // Expand the simple trust dial back into the legacy prefs shape on save.
  const persist = (commitDraft) => {
    const l1 = Object.fromEntries(L1_ACTIONS.map(a => [a.id, commitDraft.trust !== 'ask']))
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

  const setSystem = (id, v) => { SFX.tap(); setDraft(d => ({ ...d, systems: { ...d.systems, [id]: v } })) }
  const say = (userText, nextPhase, jarvisText) =>
    setLog(l => [...l, { role:'you', text:userText }, { role:'jarvis', text:jarvisText }])

  const submitSystems = () => {
    SFX.tap()
    const chosen = SIMPLE_SYSTEMS.filter(s => draft.systems[s.id]).map(s => s.name)
    const txt = chosen.length ? chosen.join(' · ') : 'Nothing for now'
    say(txt, 'trust', "Got it. Now — how hands-on should I be with day-to-day work?")
    setPhase('trust')
  }
  const pickTrust = (opt) => {
    setDraft(d => ({ ...d, trust:opt.id }))
    say(opt.title, 'channel', "Noted. Where should I reach you when something needs you?")
    setPhase('channel')
  }
  const pickChannel = (ch) => {
    setDraft(d => ({ ...d, channel:ch.id }))
    say(ch.label, 'quiet', "Last thing — any quiet hours when I should hold non-urgent pings?")
    setPhase('quiet')
  }
  const finish = () => {
    const q = draft.quiet
    const summary = `Quiet ${q.start}–${q.end}${q.weekend ? ' · weekends off' : ''}`
    setLog(l => [...l, { role:'you', text:summary }, { role:'jarvis', text:"Perfect — you're all set. Tuning your first brief now…" }])
    setPhase('done')
    setTimeout(() => { SFX.done(); HX.done(); onComplete?.(persist(draft)) }, 950)
  }
  const skipDefaults = () => {
    SFX.tap()
    onSkip?.(persist({ systems: DEFAULT_PREFS.systems, trust:'review', channel:'teams', quiet: DEFAULT_PREFS.quiet }))
  }

  // ── Bubble renderers ────────────────────────────────────────────────────
  const Bubble = ({ role, text }) => {
    const isYou = role === 'you'
    return (
      <div className="enter" style={{ display:'flex', gap:10, alignItems:'flex-end',
        flexDirection: isYou ? 'row-reverse' : 'row', marginBottom:12 }}>
        {!isYou && <JarvisMark size={28} radius={8} style={{ flexShrink:0 }} />}
        <div style={{ maxWidth:'78%', padding:'10px 14px', borderRadius:14, fontSize:14, lineHeight:1.55,
          background: isYou ? T.core : T.surface,
          color: isYou ? '#fff' : T.text,
          border: isYou ? 'none' : `1px solid ${T.border}`,
          borderBottomRightRadius: isYou ? 4 : 14,
          borderBottomLeftRadius: isYou ? 14 : 4,
          boxShadow: isYou ? T.shadowPurple : T.shadowSm }}>
          {text}
        </div>
      </div>
    )
  }

  // ── The interactive composer for the current phase ──────────────────────
  const composer = (() => {
    if (phase === 'systems') {
      return (
        <div className="fade">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8, marginBottom:12 }}>
            {SIMPLE_SYSTEMS.map(s => {
              const active = !!draft.systems[s.id]
              const conn = CONNECTIONS.find(c => c.name.toLowerCase().includes(s.id.split('/')[0]))
              return (
                <button key={s.id} type="button" role="switch" aria-checked={active}
                  onClick={() => setSystem(s.id, !active)}
                  style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 12px',
                    borderRadius:10, cursor:'pointer', textAlign:'left',
                    background: active ? T.coreSoft : T.surface,
                    border:`1.5px solid ${active ? T.core : T.border}`, color:T.text, fontFamily:T.font, transition:'all .12s' }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = T.coreMid }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = T.border }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{conn?.logo || '🔌'}</span>
                  <span style={{ flex:1, minWidth:0 }}>
                    <span style={{ display:'block', fontSize:13, fontWeight:700, color:T.text }}>{s.name}</span>
                    <span style={{ display:'block', fontSize:11, color:T.textSoft }}>{s.desc}</span>
                  </span>
                  <span style={{ width:18, height:18, borderRadius:5, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                    background: active ? T.core : 'none', border:`1.5px solid ${active ? T.core : T.borderMid}` }}>
                    {active && <Check size={11} color="#fff" />}
                  </span>
                </button>
              )
            })}
          </div>
          <button type="button" onClick={submitSystems}
            style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'10px 18px', borderRadius:8,
              cursor:'pointer', background:T.core, border:'none', color:'#fff', fontSize:13.5, fontWeight:700,
              fontFamily:T.font, boxShadow:T.shadowPurple }}>
            Continue <ArrowRight size={14} />
          </button>
        </div>
      )
    }
    if (phase === 'trust') {
      return (
        <div className="fade" style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {TRUST_OPTIONS.map(opt => (
            <button key={opt.id} type="button" onClick={() => pickTrust(opt)}
              style={{ display:'flex', alignItems:'flex-start', gap:12, width:'100%', padding:'13px 14px',
                borderRadius:10, cursor:'pointer', textAlign:'left', background:T.surface,
                border:`1.5px solid ${T.border}`, color:T.text, fontFamily:T.font, transition:'all .14s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.core; e.currentTarget.style.background = T.coreSoft }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surface }}>
              <Sparkles size={16} color={T.core} style={{ marginTop:2, flexShrink:0 }} />
              <span>
                <span style={{ display:'block', fontSize:14, fontWeight:700, color:T.text }}>{opt.title}</span>
                <span style={{ display:'block', fontSize:12.5, color:T.textSoft, marginTop:2, lineHeight:1.5 }}>{opt.sub}</span>
              </span>
            </button>
          ))}
        </div>
      )
    }
    if (phase === 'channel') {
      return (
        <div className="fade" style={{ display:'flex', gap:8 }}>
          {CHANNELS.map(ch => (
            <button key={ch.id} type="button" onClick={() => pickChannel(ch)}
              style={{ flex:1, padding:'12px', borderRadius:10, cursor:'pointer', background:T.surface,
                border:`1.5px solid ${T.border}`, color:T.text, fontSize:13.5, fontWeight:700,
                fontFamily:T.font, transition:'all .14s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.core; e.currentTarget.style.background = T.coreSoft; e.currentTarget.style.color = T.core }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surface; e.currentTarget.style.color = T.text }}>
              {ch.label}
            </button>
          ))}
        </div>
      )
    }
    if (phase === 'quiet') {
      return (
        <div className="fade" style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap',
          padding:'14px', borderRadius:10, background:T.surface, border:`1px solid ${T.border}` }}>
          <label style={{ fontSize:12.5, color:T.textSoft }}>
            From
            <input type="time" value={draft.quiet.start}
              onChange={e => setDraft(d => ({ ...d, quiet:{ ...d.quiet, start:e.target.value } }))}
              style={{ display:'block', marginTop:4, padding:'7px 10px', fontSize:13, border:`1px solid ${T.border}`,
                borderRadius:6, background:T.surface, color:T.text, fontFamily:T.font }} />
          </label>
          <label style={{ fontSize:12.5, color:T.textSoft }}>
            To
            <input type="time" value={draft.quiet.end}
              onChange={e => setDraft(d => ({ ...d, quiet:{ ...d.quiet, end:e.target.value } }))}
              style={{ display:'block', marginTop:4, padding:'7px 10px', fontSize:13, border:`1px solid ${T.border}`,
                borderRadius:6, background:T.surface, color:T.text, fontFamily:T.font }} />
          </label>
          <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:T.text }}>
            <Toggle value={draft.quiet.weekend} ariaLabel="Keep weekends quiet"
              onChange={() => { SFX.tap(); setDraft(d => ({ ...d, quiet:{ ...d.quiet, weekend:!d.quiet.weekend } })) }} />
            Weekends off
          </label>
          <div style={{ flex:1 }} />
          <button type="button" onClick={finish}
            style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'10px 18px', borderRadius:8,
              cursor:'pointer', background:T.core, border:'none', color:'#fff', fontSize:13.5, fontWeight:700,
              fontFamily:T.font, boxShadow:T.shadowPurple }}>
            All set <Check size={14} />
          </button>
        </div>
      )
    }
    return null
  })()

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', height:'100%', minHeight:0,
      background:T.appBg, fontFamily:T.font }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 24px',
        borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
        <JarvisMark size={32} radius={9} />
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:14.5, fontWeight:800, color:T.text, margin:0 }}>Let's get you set up</p>
          <p style={{ fontSize:12.5, color:T.textSoft, margin:'1px 0 0' }}>A quick chat — about 30 seconds.</p>
        </div>
        <button type="button" onClick={skipDefaults}
          style={{ padding:'7px 12px', borderRadius:6, cursor:'pointer', background:'none', border:'none',
            color:T.textSoft, fontSize:12.5, fontWeight:600, fontFamily:T.font }}>
          Use defaults
        </button>
        {onBack && (
          <button type="button" onClick={() => { SFX.tap(); onBack() }}
            style={{ width:32, height:32, borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center',
              justifyContent:'center', background:'none', border:`1px solid ${T.border}`, color:T.textSoft }}
            aria-label="Close setup">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Transcript */}
      <div ref={scrollRef} style={{ flex:1, overflowY:'auto', padding:'22px 24px 8px' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          {log.map((m, i) => <Bubble key={i} role={m.role} text={m.text} />)}
        </div>
      </div>

      {/* Composer */}
      {phase !== 'done' && (
        <div style={{ flexShrink:0, borderTop:`1px solid ${T.border}`, padding:'16px 24px', background:T.surface }}>
          <div style={{ maxWidth:600, margin:'0 auto' }}>{composer}</div>
        </div>
      )}
    </div>
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

// ─── Brand marks for SSO buttons ─────────────────────────────────────────────
const MicrosoftMark = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 23 23" aria-hidden="true">
    <rect x="1"  y="1"  width="10" height="10" fill="#F25022" />
    <rect x="12" y="1"  width="10" height="10" fill="#7FBA00" />
    <rect x="1"  y="12" width="10" height="10" fill="#00A4EF" />
    <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
  </svg>
)
const GoogleMark = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5c-2 1.5-4.7 2.5-7.6 2.5-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.5 5.5c-.5.4 7.3-5.3 7.3-15 0-1.3-.1-2.3-.4-3.5z" />
  </svg>
)
const SalesforceMark = ({ size = 18 }) => (
  <svg width={size} height={size + 0} viewBox="0 0 256 180" aria-hidden="true">
    <path fill="#00A1E0" d="M106 20a45 45 0 0 1 77 13 55 55 0 0 1 22-5 56 56 0 0 1 11 111c-1 0-3 1-4 1H72a48 48 0 0 1-10-95 53 53 0 0 1 44-25z" />
  </svg>
)

// ─── Sign-in modal — email + SSO providers ───────────────────────────────────
function SignInModal({ onClose, onSignIn }) {
  const T = window.__T
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(null)
  const cardRef = useRef(null)

  // Close on Escape; autofocus the email field.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !pending) onClose?.() }
    window.addEventListener('keydown', onKey)
    const t = setTimeout(() => cardRef.current?.querySelector('input')?.focus(), 60)
    return () => { window.removeEventListener('keydown', onKey); clearTimeout(t) }
  }, [pending, onClose])

  // Simulate an SSO round-trip, then hand control back to the app.
  const go = (providerId) => {
    if (pending) return
    SFX.tap(); HX.tap()
    setPending(providerId)
    setTimeout(() => onSignIn?.(providerId), 900)
  }

  const providers = [
    { id:'microsoft',  label:'Continue with Microsoft', sub:'SSO · recommended for Teams', Mark:MicrosoftMark },
    { id:'salesforce', label:'Continue with Salesforce', sub:'SSO · Agentforce identity',   Mark:SalesforceMark },
    { id:'google',     label:'Continue with Google',     sub:'SSO · Workspace account',      Mark:GoogleMark },
  ]

  const emailValid = /\S+@\S+\.\S+/.test(email)

  return (
    <div role="presentation"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !pending) onClose?.() }}
      style={{ position:'fixed', inset:0, zIndex:120, display:'flex', alignItems:'center', justifyContent:'center',
        padding:20, background:'rgba(17,16,24,0.55)', backdropFilter:'blur(4px)', WebkitBackdropFilter:'blur(4px)',
        fontFamily:T.font, animation:'fadeIn 160ms ease both' }}>
      <div ref={cardRef} className="pop" role="dialog" aria-modal="true" aria-labelledby="signin-title"
        style={{ width:'100%', maxWidth:420, background:T.surface, borderRadius:14, border:`1px solid ${T.border}`,
          boxShadow:'0 24px 70px rgba(0,0,0,0.35)', padding:'28px 28px 24px', position:'relative' }}>

        {/* Close */}
        <button type="button" aria-label="Close sign in" onClick={() => { if (!pending) onClose?.() }}
          style={{ position:'absolute', top:14, right:14, width:32, height:32, borderRadius:8, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', color:T.textSoft }}
          onMouseEnter={e => { e.currentTarget.style.background = T.surfaceMid }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none' }}>
          <X size={16} />
        </button>

        {/* Brand */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', marginBottom:22 }}>
          <JarvisMark size={48} radius={14} style={{ boxShadow:T.shadowPurple, marginBottom:14 }} />
          <h2 id="signin-title" style={{ fontSize:20, fontWeight:800, color:T.text, letterSpacing:'-0.01em', margin:'0 0 4px' }}>
            Sign in to Jarvis
          </h2>
          <p style={{ fontSize:13.5, color:T.textSoft, margin:0, lineHeight:1.5 }}>
            Use your work account. We never store passwords.
          </p>
        </div>

        {/* SSO providers */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:18 }}>
          {providers.map(({ id, label, sub, Mark }) => {
            const isPending = pending === id
            const dim = pending && !isPending
            return (
              <button key={id} type="button" disabled={!!pending} onClick={() => go(id)}
                aria-label={label}
                style={{ display:'flex', alignItems:'center', gap:12, width:'100%', padding:'12px 14px',
                  borderRadius:10, cursor: pending ? 'default' : 'pointer', textAlign:'left',
                  background:T.surface, border:`1.5px solid ${isPending ? T.core : T.border}`,
                  opacity: dim ? 0.5 : 1, fontFamily:T.font, transition:'all .14s' }}
                onMouseEnter={e => { if (!pending) e.currentTarget.style.borderColor = T.coreMid }}
                onMouseLeave={e => { if (!pending) e.currentTarget.style.borderColor = T.border }}>
                <span style={{ width:24, display:'flex', justifyContent:'center', flexShrink:0 }}>
                  {isPending ? <Loader2 size={18} color={T.core} style={{ animation:'spin .9s linear infinite' }} /> : <Mark size={18} />}
                </span>
                <span style={{ flex:1, minWidth:0 }}>
                  <span style={{ display:'block', fontSize:14, fontWeight:700, color:T.text }}>
                    {isPending ? 'Connecting…' : label}
                  </span>
                  <span style={{ display:'block', fontSize:11.5, color:T.textSoft, marginTop:1 }}>{sub}</span>
                </span>
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div style={{ display:'flex', alignItems:'center', gap:12, margin:'4px 0 16px' }}>
          <div style={{ flex:1, height:1, background:T.border }} />
          <span style={{ fontSize:11.5, fontWeight:700, color:T.textXsoft, letterSpacing:'0.06em' }}>OR</span>
          <div style={{ flex:1, height:1, background:T.border }} />
        </div>

        {/* Email sign-in */}
        <form onSubmit={(e) => { e.preventDefault(); if (emailValid && !pending) go('email') }}>
          <label htmlFor="signin-email" style={{ display:'block', fontSize:12.5, fontWeight:700, color:T.textMid, marginBottom:6 }}>
            Work email
          </label>
          <div style={{ position:'relative', marginBottom:12 }}>
            <Mail size={15} color={T.textSoft} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }} />
            <input id="signin-email" type="email" value={email} disabled={!!pending}
              onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
              style={{ width:'100%', padding:'11px 12px 11px 36px', fontSize:14, color:T.text,
                background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:10, fontFamily:T.font, outline:'none' }}
              onFocus={e => { e.currentTarget.style.borderColor = T.core }}
              onBlur={e => { e.currentTarget.style.borderColor = T.border }} />
          </div>
          <button type="submit" disabled={!emailValid || !!pending}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%',
              padding:'12px', borderRadius:10, fontSize:14, fontWeight:700, fontFamily:T.font,
              background: emailValid && !pending ? T.core : T.surfaceMid,
              color: emailValid && !pending ? '#fff' : T.textXsoft,
              border:'none', cursor: emailValid && !pending ? 'pointer' : 'not-allowed',
              boxShadow: emailValid && !pending ? T.shadowPurple : 'none', transition:'all .14s' }}>
            {pending === 'email'
              ? <><Loader2 size={16} style={{ animation:'spin .9s linear infinite' }} /> Sending magic link…</>
              : <>Continue with email <ArrowRight size={15} /></>}
          </button>
        </form>

        {/* Trust footnote */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, marginTop:18 }}>
          <Lock size={12} color={T.green} />
          <p style={{ fontSize:11.5, color:T.textXsoft, margin:0 }}>
            OAuth 2.0 · SOC 2 aligned · zero passwords stored
          </p>
        </div>
      </div>
    </div>
  )
}

// Reveals children (.sr) once the element scrolls into view — one-shot.
function useInView(threshold = 0.18) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setInView(true); return }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); io.disconnect() }
    }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, inView]
}

// ─── Ambient activity ticker — Jarvis scans the systems, then settles ───────────
// Phase 1 (working): a live spinner cycles through what Jarvis is actively
// checking, in the present tense. Phase 2 (done): the spinner resolves to a calm
// green dot + a one-line summary of what it found. This narrates "working →
// finished" instead of looping forever.
const SCAN_STEPS = [
  'Scanning Outlook for anything urgent',
  'Checking Jira for new blockers',
  'Reviewing your Workday requests',
  'Syncing your calendar',
  'Catching up on Teams',
  'Checking Salesforce cases',
]
const SCAN_SUMMARY = 'Checked 6 systems · flagged 1 email, PTO still pending'
function ActivityTicker({ onOpenFeed }) {
  const T = window.__T
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (done) return
    // On the last step, hold briefly then settle into the "caught up" summary.
    if (step >= SCAN_STEPS.length - 1) {
      const id = setTimeout(() => setDone(true), 1500)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => setStep(n => n + 1), 1300)
    return () => clearTimeout(id)
  }, [step, done])
  return (
    <div style={{ display:'flex', alignItems:'center', gap:9, minWidth:0, flex:1 }} aria-label="Jarvis background activity" aria-live="polite">
      {/* Status — spins while working, resolves to a calm dot once caught up */}
      {done ? (
        <span style={{ position:'relative', width:7, height:7, display:'inline-block', flexShrink:0 }}>
          <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:T.green }} />
        </span>
      ) : (
        <Loader2 size={13} color={T.core} style={{ flexShrink:0, animation:'spin 1s linear infinite' }} />
      )}
      <span key={done ? 'done' : step} className="enter" style={{ flex:1, fontSize:13, color:T.textMid, whiteSpace:'nowrap',
        overflow:'hidden', textOverflow:'ellipsis', minWidth:0 }}>
        {done ? (
          <>
            <span style={{ color:T.green, fontWeight:700, marginRight:8, display:'inline-flex', alignItems:'center', gap:4, verticalAlign:'middle' }}>
              <Check size={12} />Caught up
            </span>
            {SCAN_SUMMARY}
          </>
        ) : (
          <><span style={{ color:T.core, fontWeight:600, marginRight:8 }}>Working…</span>{SCAN_STEPS[step]}</>
        )}
      </span>
      {/* CTA — routes to the Feed, framed as Jarvis's own work (not the user's) */}
      <button type="button" onClick={() => { SFX?.tap?.(); onOpenFeed?.() }}
        title="Open the activity feed — every action Jarvis has taken in the background"
        style={{ flexShrink:0, display:'inline-flex', alignItems:'center', gap:7, padding:'4px 8px',
          borderRadius:8, border:'none', background:'transparent', cursor:'pointer', fontFamily:T.font,
          fontSize:13, fontWeight:700, color:T.core, transition:'background .12s' }}
        onMouseEnter={e => { e.currentTarget.style.background = T.coreSoft }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
        Activity
        <ChevronRight size={14} />
      </button>
    </div>
  )
}

// ─── App left rail · primary nav (Today/Feed/Skills) + conversation history ────
function ConversationRail({ collapsed, onToggle, activeTab, activeConvId, onNav, onNew, onSelect, conversations = CONVERSATIONS }) {
  const T = window.__T
  const iconBtn = { width:28, height:28, borderRadius:7, border:`1px solid ${T.border}`,
    background:T.surface, display:'inline-flex', alignItems:'center', justifyContent:'center',
    cursor:'pointer', color:T.textSoft, flexShrink:0 }
  const plainIconBtn = { width:32, height:32, borderRadius:8, border:'none',
    background:'none', display:'inline-flex', alignItems:'center', justifyContent:'center',
    cursor:'pointer', color:T.textSoft, flexShrink:0, transition:'color .12s' }
  const NAV = [
    { id:'today',  label:'Today',  Icon:LayoutDashboard },
    { id:'agents', label:'Skills', Icon:Bot },
  ]
  const today = conversations.filter(c => c.date === 'Today')
  const earlier = conversations.filter(c => c.date !== 'Today')

  if (collapsed) {
    return (
      <div style={{ width:56, flexShrink:0, background:T.surface,
        display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'12px 0', overflowY:'auto' }}>
        <button type="button" aria-label="Expand sidebar" onClick={onToggle} style={iconBtn}><ChevronRight size={16} /></button>
        <div style={{ height:4 }} />
        {NAV.map(({ id, label, Icon }) => {
          const on = activeTab===id
          return (
            <button key={id} type="button" title={label} onClick={() => onNav(id)}
              style={{ ...plainIconBtn, color: on?T.core:T.textSoft }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.color = T.text }}
              onMouseLeave={e => { if (!on) e.currentTarget.style.color = T.textSoft }}>
              <Icon size={18} />
            </button>
          )
        })}
        <div style={{ width:24, height:1, background:T.border, margin:'4px 0' }} />
        <button type="button" title="New conversation" onClick={onNew}
          style={{ ...plainIconBtn, color:T.core }}
          onMouseEnter={e => { e.currentTarget.style.color = T.coreMid || T.core }}
          onMouseLeave={e => { e.currentTarget.style.color = T.core }}><PenSquare size={18} /></button>
      </div>
    )
  }

  const navBtn = ({ id, label, Icon }) => {
    const on = activeTab===id
    return (
      <button key={id} type="button" onClick={() => onNav(id)}
        style={{ display:'flex', alignItems:'center', gap:10, width:'100%', height:38, padding:'9px 11px', borderRadius:9,
          cursor:'pointer', fontFamily:T.font, marginBottom:2, textAlign:'left', border:'none',
          background: on?T.coreSoft:'transparent', color: on?T.core:T.text, fontWeight: on?700:600, fontSize:14 }}
        onMouseEnter={e => { if (!on) e.currentTarget.style.background = T.surfaceMid }}
        onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent' }}>
        <Icon size={16} /> {label}
      </button>
    )
  }
  const convBtn = (c) => (
    <button key={c.id} type="button" onClick={() => onSelect(c)}
      style={{ width:'100%', textAlign:'left', display:'block', padding:'8px 10px', borderRadius:8,
        cursor:'pointer', fontFamily:T.font, border:'none',
        background: activeConvId===c.id?T.coreSoft:'transparent', color: activeConvId===c.id?T.core:T.textMid,
        fontSize:13, fontWeight: activeConvId===c.id?700:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}
      onMouseEnter={e => { if (activeConvId!==c.id) e.currentTarget.style.background = T.surfaceMid }}
      onMouseLeave={e => { if (activeConvId!==c.id) e.currentTarget.style.background = 'transparent' }}>
      {c.title}
    </button>
  )

  return (
    <div style={{ width:240, flexShrink:0, borderRight:'none', background:T.surface, overflowY:'auto', padding:12, marginLeft:0, marginRight:0, marginBottom:0, borderRadius:16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', marginBottom:6 }}>
        <button type="button" aria-label="Collapse sidebar" onClick={onToggle} style={iconBtn}><ChevronLeft size={16} /></button>
      </div>
      {NAV.map(navBtn)}
      <div style={{ height:1, background:T.border, margin:'12px 2px 8px' }} />
      <button type="button" onClick={onNew}
        style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'9px 11px', borderRadius:9,
          cursor:'pointer', fontFamily:T.font, marginBottom:10, textAlign:'left', border:'none',
          background:'transparent', color:T.text, fontWeight:600, fontSize:14 }}
        onMouseEnter={e => { e.currentTarget.style.background = T.surfaceMid }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
        <PenSquare size={16} /> New conversation
      </button>
      <p style={{ fontSize:10, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', color:T.textXsoft, margin:'0 6px 4px' }}>Recents</p>
      {today.length > 0 && <p style={{ fontSize:10, fontWeight:700, color:T.textXsoft, margin:'8px 6px 4px' }}>Today</p>}
      {today.map(convBtn)}
      {earlier.length > 0 && <p style={{ fontSize:10, fontWeight:700, color:T.textXsoft, margin:'8px 6px 4px' }}>Earlier</p>}
      {earlier.map(convBtn)}
    </div>
  )
}

// ─── Today hub · right Meetings panel (collapsible icon rail) ──────────────────
function MeetingsPanel({ collapsed, onToggle, onEventClick, onAddMeeting }) {
  const T = window.__T
  const now = 9 * 60 + 45
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
  const evs = TODAY_EVENTS.map(e => ({ ...e, s: toMin(e.time), e2: toMin(e.end) }))
  const next = evs.find(e => e.e2 > now)
  const mins = next ? Math.max(0, next.s - now) : 0
  const ringPct = Math.max(8, Math.min(100, Math.round((1 - mins / 90) * 100)))
  const iconBtn = { width:28, height:28, borderRadius:7, border:`1px solid ${T.border}`,
    background:T.surface, display:'inline-flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:T.textSoft, flexShrink:0 }
  const Ring = ({ size = 48 }) => (
    <div style={{ width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:`conic-gradient(${T.core} 0 ${ringPct}%, ${T.border} ${ringPct}% 100%)`,
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:size-10, height:size-10, borderRadius:'50%', background:T.surface,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', lineHeight:1 }}>
        <span style={{ fontSize:12, fontWeight:800, color:T.core }}>{mins}</span>
        <span style={{ fontSize:8, fontWeight:700, color:T.textXsoft }}>MIN</span>
      </div>
    </div>
  )

  if (collapsed) {
    return (
      <div style={{ width:60, flexShrink:0, background:T.surface,
        display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'12px 0' }}>
        <button type="button" aria-label="Expand meetings" onClick={onToggle} style={iconBtn}><ChevronLeft size={16} /></button>
        <Ring size={40} />
        <button type="button" aria-label="Join next meeting" onClick={() => { SFX.tap(); next && onEventClick?.(next) }}
          style={{ ...iconBtn, color:'#fff', background:T.core, border:'none', width:32, height:32 }}><Video size={15} /></button>
        <div style={{ fontSize:11, fontWeight:800, color:T.textSoft }}>{evs.length}</div>
      </div>
    )
  }

  return (
    <div style={{ width:340, flexShrink:0, marginLeft:8, marginRight:0, borderLeft:'none', background:T.surface, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Header — title, add, collapse */}
      <div style={{ flexShrink:0, borderBottom:`1px solid ${T.border}`, padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <p style={{ fontSize:13, fontWeight:800, color:T.text, margin:0, display:'flex', alignItems:'center', gap:7 }}><Calendar size={15} color={T.core} /> Calendar</p>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button type="button" onClick={() => { SFX.tap(); onAddMeeting?.() }}
            style={{ border:`1px solid ${T.border}`, background:T.surface, color:T.core, fontWeight:700, fontSize:12, padding:'5px 10px', borderRadius:7, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:5, fontFamily:T.font }}><Plus size={12} /> Add</button>
          <button type="button" aria-label="Collapse calendar" onClick={onToggle} style={iconBtn}><ChevronRight size={16} /></button>
        </div>
      </div>
      {/* Full day calendar grid (flat — the panel is the frame) */}
      <div style={{ flex:1, overflowY:'auto', padding:'6px 6px 16px' }}>
        <RightPanel onEventClick={onEventClick} onAddMeeting={onAddMeeting} />
      </div>
    </div>
  )
}

function WelcomeScreen({ onLogin }) {
  const T = window.__T

  const ctaStyle = {
    display:'inline-flex', alignItems:'center', gap:10, padding:'13px 28px',
    borderRadius:4, fontSize:15, fontWeight:700, color:T.coreText,
    background:T.core, border:'none', cursor:'pointer',
    boxShadow:T.shadowPurple, transition:'all .15s',
  }

  const sectionBase = { maxWidth:1080, margin:'0 auto', padding:'0 32px' }

  const [howRef, howIn] = useInView()
  const [trustRef, trustIn] = useInView()

  return (
    <div style={{ flex:1, overflowY:'auto', background:T.appBg, fontFamily:T.font, position:'relative' }}>

      {/* ── HERO — centered introduction ─────────────────────────────────────── */}
      <div style={{ position:'relative', overflow:'hidden', minHeight:'92vh', display:'flex',
        alignItems:'center', justifyContent:'center', backgroundColor:T.surface }}>
        {/* soft radial glow behind the title */}
        <div aria-hidden="true" style={{ position:'absolute', inset:0, pointerEvents:'none',
          background:`radial-gradient(58% 52% at 50% 30%, ${T.coreGlow} 0%, transparent 70%)` }} />

        <div style={{ ...sectionBase, width:'100%', zIndex:1, paddingTop:64, paddingBottom:96,
          display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>

          <div className="glow-pop" style={{ position:'relative', marginBottom:28 }}>
            <div aria-hidden="true" style={{ position:'absolute', inset:-18, borderRadius:'50%',
              background:`radial-gradient(circle, ${T.coreGlow} 0%, transparent 70%)`, filter:'blur(14px)', pointerEvents:'none' }} />
            <JarvisMark size={76} radius={22} style={{ position:'relative', boxShadow:T.shadowPurple }} />
          </div>

          <h1 style={{ lineHeight:1.18, letterSpacing:'-0.02em', margin:'0 0 18px' }}>
            {"Hi, I'm Jarvis".split(' ').map((w, i) => (
              <span key={`hl-a-${i}`} className="reveal-mask">
                <span className="reveal-word" style={{ animationDelay:`${.12 + i*.06}s`, fontSize:56, fontWeight:800,
                  background:`linear-gradient(135deg, ${T.core}, ${T.coreBright})`,
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                  {w}{'\u00A0'}
                </span>
              </span>
            ))}
            <br />
            {'your personal assistant at work'.split(' ').map((w, i) => (
              <span key={`hl-b-${i}`} className="reveal-mask">
                <span className="reveal-word" style={{ animationDelay:`${.36 + i*.05}s`, fontSize:48, fontWeight:700, color:T.text }}>
                  {w}{'\u00A0'}
                </span>
              </span>
            ))}
          </h1>

          <p className="reveal-up" style={{ fontSize:18, lineHeight:1.7, color:T.textMid, maxWidth:560,
            margin:'0 0 32px', animationDelay:'.72s' }}>
            I'm your always-on assistant, here to save you time and help your day run smoothly. Whatever you need, just ask — I'll take care of the rest.
          </p>

          <button type="button" className="reveal-up" onClick={() => { SFX.tap(); HX.tap(); onLogin() }}
            style={{ ...ctaStyle, padding:'14px 30px', fontSize:16, animationDelay:'.86s' }}
            onMouseEnter={e => { e.currentTarget.style.background=T.coreMid }}
            onMouseLeave={e => { e.currentTarget.style.background=T.core }}>
            Sign in to get started
          </button>
        </div>

        <div style={{ position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)',
          display:'flex', flexDirection:'column', alignItems:'center', gap:6, opacity:.4 }}>
          <span style={{ fontSize:12, color:T.textSoft, letterSpacing:'0.08em' }}>SCROLL</span>
          <div style={{ width:1, height:32, background:`linear-gradient(${T.textSoft}, transparent)` }} />
        </div>
      </div>

      {/* ── HOW I WORK — editorial rows ──────────────────────────────────────── */}
      <div ref={howRef} className={howIn ? 'in' : undefined} style={{ position:'relative', padding:'96px 0', backgroundColor:'var(--color-white)' }}>
        <div style={{ ...sectionBase, position:'relative' }}>
          <div className="sr" style={{ textAlign:'center', maxWidth:560, margin:'0 auto 56px' }}>
            <p style={{ fontSize:13, fontWeight:700, color:T.core, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:10 }}>How I help</p>
            <h2 style={{ fontSize:34, fontWeight:800, color:T.text, letterSpacing:'-0.02em', lineHeight:1.15, marginBottom:14 }}>
              Three things.{' '}
              <span style={{ background:`linear-gradient(135deg, ${T.core}, ${T.coreBright})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                Done before you ask.
              </span>
            </h2>
            <p style={{ fontSize:17, color:T.textMid, lineHeight:1.7 }}>
              I'm not a chatbot — I'm a proactive teammate that connects your tools and acts for you.
            </p>
          </div>

          <div style={{ maxWidth:880, margin:'0 auto' }}>
            {[
              { Icon:Activity, color:T.core, bg:T.coreSoft, num:'01',
                title:'I watch what matters',
                desc:'I keep an eye on your inbox, calendar, HR system and team tools — nothing more than I need — and pull together one short brief of what needs you today.',
                example:'Your benefits enrolment closes Thursday.' },
              { Icon:Zap, color:T.green, bg:T.greenSoft, num:'02',
                title:'I handle the small stuff',
                desc:'Routine work — reminders, meeting prep, filing PTO, training nudges — I just do. You\'ll see every one in your feed, always with one-click Undo.',
                example:'Prepped your 10 AM. Sent the training nudge.' },
              { Icon:ShieldCheck, color:T.amber, bg:T.amberSoft, num:'03',
                title:'I ask before anything bigger',
                desc:'Anything that affects other people — replies you send, requests you submit, anything over a limit — I prepare it and wait for your OK.',
                example:'Drafted your reply to Priya. Send when you\'re ready.' },
            ].map((c, i) => (
              <div key={i} className="sr" style={{ '--sd':`${i*.12}s`, display:'flex', alignItems:'center', gap:56,
                flexDirection: i % 2 ? 'row-reverse' : 'row', marginTop: i === 0 ? 0 : 44 }}>
                {/* Copy */}
                <div style={{ flex:1, minWidth:0 }}>
                  <h3 style={{ fontSize:22, fontWeight:800, color:T.text, letterSpacing:'-0.01em', marginBottom:12 }}>{c.title}</h3>
                  <p style={{ fontSize:15, color:T.textMid, lineHeight:1.7 }}>{c.desc}</p>
                </div>
                {/* Live message preview */}
                <div style={{ flex:1, minWidth:0, background:T.surface, border:`1px solid ${T.border}`, borderRadius:16,
                  padding:18, boxShadow:T.shadowMd }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                    <JarvisMark size={24} radius={7} />
                    <span style={{ fontSize:12, fontWeight:700, color:T.text }}>Jarvis</span>
                  </div>
                  <div style={{ background:T.surfaceMid, border:`1px solid ${T.border}`, borderRadius:12, borderTopLeftRadius:3,
                    padding:'11px 14px', fontSize:14, color:T.text, lineHeight:1.55 }}>
                    {c.example}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BUILT ON TRUST — soft gradient band ──────────────────────────────── */}
      <div ref={trustRef} className={trustIn ? 'in' : undefined} style={{ padding:'96px 0', backgroundColor:'var(--color-white)' }}>
        <div style={{ ...sectionBase }}>
          <div className="sr" style={{ position:'relative', overflow:'hidden', maxWidth:920, margin:'0 auto',
            borderRadius:20, padding:'48px 40px', textAlign:'center',
            background:`linear-gradient(135deg, ${T.coreSoft}, rgba(155,110,200,0.05))`, border:`1px solid ${T.core}24` }}>
            <p style={{ fontSize:13, fontWeight:700, color:T.core, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:10 }}>Built on trust</p>
            <h2 style={{ fontSize:30, fontWeight:800, color:T.text, letterSpacing:'-0.02em', lineHeight:1.15, marginBottom:14 }}>
              I see a lot.{' '}
              <span style={{ background:`linear-gradient(135deg, ${T.core}, ${T.coreBright})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                I never overstep.
              </span>
            </h2>
            <p style={{ fontSize:16, color:T.textMid, lineHeight:1.7, maxWidth:620, margin:'0 auto 28px' }}>
              Every action I take is logged with one-click Undo, and anything that touches other people waits for your OK. I read signals, not secrets.
            </p>
            <div style={{ display:'flex', justifyContent:'center', gap:28, flexWrap:'wrap' }}>
              {[
                { Icon:ShieldCheck, label:'No raw DMs or emails read' },
                { Icon:History, label:'Every action is reversible' },
                { Icon:Lock, label:'Zero passwords stored' },
              ].map(({ Icon, label }, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:9, fontSize:14, fontWeight:600, color:T.text }}>
                  <span style={{ width:26, height:26, borderRadius:8, flexShrink:0, display:'inline-flex', alignItems:'center', justifyContent:'center',
                    background:T.coreSoft, color:T.core }}>
                    <Icon size={15} />
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="sr" style={{ '--sd':'.15s', textAlign:'center', marginTop:48 }}>
            <button type="button" onClick={() => { SFX.tap(); HX.tap(); onLogin() }}
              style={{ ...ctaStyle, padding:'14px 32px', fontSize:16 }}
              onMouseEnter={e => { e.currentTarget.style.background=T.coreMid }}
              onMouseLeave={e => { e.currentTarget.style.background=T.core }}>
              Sign in to get started
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
                  <Toggle value={agent.enabled} ariaLabel="Enable skill" onChange={() => { SFX.tap(); toggleAgent(agent.id) }} />
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
    <FluentDialog open modalType="modal" onOpenChange={(_, data) => { if (!data.open) { SFX.close(); onClose() } }}>
      <DialogSurface aria-label="New skill" style={{ maxWidth:620 }}>
        <DialogBody>
          <DialogTitle action={
            <span style={{ display:'inline-flex', alignItems:'center', gap:14 }}>
              <span style={{ display:'flex', gap:5 }}>
                {[1,2,3,4].map(s => (
                  <span key={s} style={{ height:4, borderRadius:99, transition:'all .2s', width:s===step?20:5,
                    background:s<=step?T.core:T.border }} />
                ))}
              </span>
              <FluentButton appearance="subtle" aria-label="Close" icon={<X size={20} />} onClick={() => { SFX.close(); onClose() }} />
            </span>
          }>
            <span style={{ display:'block', fontSize:16, fontWeight:700, color:T.core }}>
              {['Choose a template','Agent details','Schedule','Test & activate'][step-1]}
            </span>
            <span style={{ display:'block', fontSize:13, fontWeight:400, color:T.textSoft, marginTop:2 }}>Step {step} of 4</span>
          </DialogTitle>
          <DialogContent style={{ maxHeight:'62vh' }}>
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
              <div><label style={lbl}>Name *</label><FluentInput defaultValue={TEMPLATES.find(t=>t.id===sel)?.name||''} style={{ width:'100%', '--colorCompoundBrandStroke': T.core }} /></div>
              <div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                  <label style={lbl}>System prompt *</label>
                  <Btn variant="ghost" icon={Sparkles} style={{ fontSize:13, padding:'3px 8px', color:T.core }}>Generate with AI</Btn>
                </div>
                <FluentTextarea resize="none"
                  style={{ width:'100%', '--colorCompoundBrandStroke': T.core }}
                  textarea={{ style:{ height:120, fontFamily:'monospace', fontSize:13 } }}
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
          </DialogContent>
          <DialogActions style={{ justifyContent:'space-between' }}>
            {step>1 ? <Btn variant="ghost" icon={ChevronLeft} onClick={() => { SFX.tap(); setStep(s=>s-1) }}>Back</Btn> : <span/>}
            <Btn variant="primary" disabled={step===1&&!sel} onClick={() => { SFX.tap(); step===4?onClose():setStep(s=>s+1) }}>
              {step===4?'Activate →':'Next →'}
            </Btn>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </FluentDialog>
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
      <div style={{ width:280, flexShrink:0, display:'flex', flexDirection:'column', background:T.surface, margin:16, borderRadius:16, overflow:'hidden' }}>
        {/* Search at the top of the rail */}
        <div style={{ padding:'14px 12px 6px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:99,
            background:T.surfaceMid, border:`1px solid ${T.border}` }}>
            <Search size={13} color={T.textSoft} />
            <input placeholder="Search conversations…" aria-label="Search conversations" style={{ flex:1, fontSize:13, background:'none', border:'none', outline:'none', color:T.text, fontFamily:T.font }} />
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

            {/* Ambient gradient wash (Gemini-style) behind the conversation */}
            <div aria-hidden="true" style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
              background:`radial-gradient(40% 22% at 8% 0%, ${T.coreGlow} 0%, transparent 60%), radial-gradient(36% 20% at 100% 4%, ${T.coreSoft} 0%, transparent 58%)` }} />

            {/* Scrollable area: sticky full-width title + max-800 reading column */}
            <div style={{ flex:1, overflowY:'auto', position:'relative', zIndex:1 }}>
              {/* Sticky title — full pane width: H2 on the extreme left, Related CTA on the extreme right */}
              <div style={{ position:'sticky', top:0, zIndex:5, background:T.surface,
                padding:'18px 24px 14px',
                display:'flex', alignItems:'center', gap:12 }}>
                <h2 title={currentConv.title}
                  style={{ flex:1, fontSize:16, fontWeight:800, margin:0, letterSpacing:'-0.01em',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.3,
                    background:`linear-gradient(135deg, ${T.core}, ${T.coreBright})`,
                    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
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
                      // User bubble — right-aligned, gradient
                      <div style={{ display:'flex', justifyContent:'flex-end' }}>
                        <div style={{ maxWidth:'84%', padding:'10px 16px',
                          fontSize:14, lineHeight:1.55, borderRadius:18, borderBottomRightRadius:5,
                          background:`linear-gradient(135deg, ${T.core}, ${T.coreMid})`, color:'#fff',
                          boxShadow:T.shadowSm }}>
                          {renderMsg(m.text)}
                        </div>
                      </div>
                    ) : (
                      // Jarvis prose — bubble-free with a small avatar, hover-only feedback
                      <div className="j-msg" style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                        <JarvisMark size={24} radius={7} style={{ flexShrink:0, marginTop:1 }} />
                        <div style={{ flex:1, minWidth:0, fontSize:14, lineHeight:1.65, color:T.text }}>
                          {renderBubble(m, T, (label) => sendText(label))}
                          <MessageFeedback msgIndex={i} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {thinking && (
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <JarvisMark size={24} radius={7} style={{ flexShrink:0 }} />
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:T.coreMid,
                          animation:'breathe .9s ease-in-out infinite', animationDelay:`${i*.2}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </div>

            {/* Continue input — Gemini-style suggestion rail + gradient-bordered capsule */}
            <div style={{ padding:'10px 24px 18px', flexShrink:0, position:'relative', zIndex:1 }}>
              <div style={{ maxWidth:720, margin:'0 auto' }}>
                <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:10, scrollbarWidth:'none' }}>
                  {['Summarize this', 'What are my options?', 'Draft a reply'].map((s, i) => (
                    <button key={i} type="button" onClick={() => { SFX.tap(); HX.tap(); sendText(s) }}
                      style={{ flexShrink:0, fontSize:12.5, fontWeight:600, color:T.core,
                        background:T.surface, border:`1px solid ${T.core}40`, borderRadius:99,
                        padding:'7px 13px', cursor:'pointer', fontFamily:T.font, whiteSpace:'nowrap', transition:'all .12s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = T.core; e.currentTarget.style.background = T.coreSoft }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = `${T.core}40`; e.currentTarget.style.background = T.surface }}>
                      {s}
                    </button>
                  ))}
                </div>
                <div style={{ padding:2, borderRadius:999, background:`linear-gradient(135deg, ${T.core}, ${T.coreBright})`, boxShadow:T.shadowPurple }}>
                  <ContinueBar value={input} onChange={setInput} onSubmit={send} />
                </div>
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
                        <div style={{ position:'relative', flexShrink:0 }}>
                          <FluentAvatar
                            name={person.name}
                            image={{ src: `https://i.pravatar.cc/72?u=${encodeURIComponent(person.name)}` }}
                            badge={{ status: person.online ? 'available' : 'away' }}
                            size={32} />
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
        aria-label="Message Jarvis"
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
function WhisperBar({ persona, coreState, setCoreState, onCommand, hero, hideGreeting }) {
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
                       : 'Good morning, Alex'

    return (
      <div className="enter" style={{ margin: '12px 0', position:'relative', zIndex: openCat ? 200 : 'auto',
        display:'flex', flexDirection:'column', justifyContent:'flex-start', alignItems:'center' }}>
        {/* Warm, inviting greeting — hidden when the page already shows one */}
        {!hideGreeting && (
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
        )}

        {/* Rectangular input — text on top, controls in a bottom row */}
        <div style={{
          background: T.surface,
          border: `1px solid ${focused ? T.core : T.border}`,
          borderRadius: 16,
          boxShadow: focused ? `0 0 0 3px ${T.core}1f, ${T.shadowMd}` : T.shadowSm,
          transition: 'box-shadow .18s, border-color .18s',
          display:'flex', flexDirection:'column', justifyContent:'flex-start', gap:8,
          padding:'14px 14px 10px',
          width:480, maxWidth:'100%',
        }}>
          {/* Row 1 — the message field */}
          <input ref={inputRef} value={val} onChange={e=>setVal(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&submit()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label="Ask Jarvis anything"
            placeholder={ph}
            style={{ width:'100%', fontSize:14, background:'none', border:'none', outline:'none',
              color:T.text, fontFamily:T.font, fontWeight:400, lineHeight:1.4, padding:'2px 0' }} />

          {/* Row 2 — controls: add on the left, voice + send on the right */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button type="button"
              aria-label="Add attachment or context"
              onClick={() => { SFX.tap(); HX.tap(); inputRef.current?.focus() }}
              style={{ width:30, height:30, borderRadius:8,
                background:'none', border:'none', cursor:'pointer', display:'flex',
                alignItems:'center', justifyContent:'center',
                color: T.textSoft, transition:'background .12s, color .12s', flexShrink:0 }}
              onMouseEnter={e=>{ e.currentTarget.style.background=T.surfaceMid }}
              onMouseLeave={e=>{ e.currentTarget.style.background='none' }}>
              <Plus size={18} />
            </button>

            <div style={{ flex:1, display:'flex', alignItems:'center' }}>
              {coreState==='thinking' && (
                <Loader2 size={15} color={T.core} style={{ animation:'spin 1s linear infinite' }} />
              )}
            </div>

            <button type="button"
              aria-label={coreState==='listening' ? 'Stop listening' : 'Start voice input'}
              onClick={toggleMic}
              style={{ width:30, height:30, borderRadius:8,
                background: coreState==='listening' ? T.redSoft : 'none',
                border:'none', cursor:'pointer', display:'flex',
                alignItems:'center', justifyContent:'center',
                color: coreState==='listening' ? T.red : T.textSoft,
                transition:'background .12s, color .12s', flexShrink:0 }}
              onMouseEnter={e=>{ if (coreState!=='listening') e.currentTarget.style.background=T.surfaceMid }}
              onMouseLeave={e=>{ if (coreState!=='listening') e.currentTarget.style.background='none' }}>
              <Mic size={16} />
            </button>
            <button type="button" onClick={submit}
              style={{ width:30, height:30, borderRadius:8,
                background: val.trim() ? T.core : T.surfaceMid,
                border: 'none', cursor: val.trim() ? 'pointer' : 'default',
                display:'flex', alignItems:'center', justifyContent:'center',
                color: val.trim() ? '#fff' : T.textXsoft,
                transition:'all .15s', flexShrink:0 }}>
              <ArrowRight size={15} />
            </button>
          </div>
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
            aria-label="Ask Jarvis anything"
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
  // Initial theme can be deep-linked via ?theme=light|dark|contrast (handy for
  // sharing a themed view and for verifying the High-Contrast theme).
  const [mode, setMode] = useState(() => {
    try {
      const t = new URLSearchParams(window.location.search).get('theme')
      if (t === 'light' || t === 'dark' || t === 'contrast') return t
    } catch { /* ignore */ }
    return 'light'
  })
  const T = THEMES[mode]
  // Expose T globally for child components that reference window.__T
  window.__T = T
  // Keep the global --focus-ring CSS var in sync with the theme's core color.
  useEffect(() => {
    try { document.documentElement.style.setProperty('--focus-ring', T.core) } catch {}
  }, [T.core])
  // Auto-hiding scrollbars: reveal the thumb while the user is actively
  // scrolling (any container — scroll events are caught in the capture phase
  // since they don't bubble), then fade it back out after a short idle pause.
  useEffect(() => {
    const root = document.documentElement
    let timer
    const onScroll = () => {
      root.classList.add('is-scrolling')
      clearTimeout(timer)
      timer = setTimeout(() => root.classList.remove('is-scrolling'), 900)
    }
    window.addEventListener('scroll', onScroll, true)
    return () => { window.removeEventListener('scroll', onScroll, true); clearTimeout(timer) }
  }, [])
  // Mirror the in-app theme onto the Teams chrome (title bar, app rail, and any
  // embedded Teams surfaces). Those use the --teams-* tokens in teams.css, which
  // are themed via [data-teams-theme]; without this, dark mode would only repaint
  // the Jarvis-branded pages and the Teams chrome would stay light.
  useEffect(() => {
    const teamsTheme = mode === 'dark' ? 'dark' : mode === 'contrast' ? 'contrast' : 'light'
    try { document.documentElement.setAttribute('data-teams-theme', teamsTheme) } catch {}
  }, [mode])

  // This build is packaged to run inside the real Microsoft Teams client, which
  // provides its own title bar, app rail, and theme. We therefore always hide
  // the *simulated* Teams shell (the fake title bar + app rail). `teamsTheme` is
  // still read from the Teams host (when present) so the app follows the host's
  // light / dark / contrast theme automatically.
  const { teamsTheme } = useTeamsEmbed()
  const embedded = true
  const { isNarrow } = useBreakpoint()
  useEffect(() => {
    if (teamsTheme) setMode(teamsThemeToMode(teamsTheme))
  }, [teamsTheme])

  // The app keeps its own in-app navigation (Today / Conversations / Feed /
  // Skills) even inside Teams — it runs as a single personal tab and handles its
  // own view switching.
  const showInAppNav = true

  // Hidden developer / demo bar (persona · theme · docs · notify · compliance).
  // Off by default in this packaged build. Toggle with a deliberately
  // conflict-free shortcut — Ctrl/Cmd + Shift + Alt + D — and remember the choice.
  const [showDemoBar, setShowDemoBar] = useState(() => {
    try { return localStorage.getItem('jarvis_demo_bar') === '1' } catch { return false }
  })
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.altKey && e.code === 'KeyD') {
        e.preventDefault()
        setShowDemoBar(v => {
          const next = !v
          try { localStorage.setItem('jarvis_demo_bar', next ? '1' : '0') } catch { /* ignore */ }
          return next
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const [scene, setScene] = useState(() => {
    // Deep-link / Teams embed: open straight into the app. Teams static tabs
    // load the tab with ?tab=<id>, and ?embed=1 forces embedded mode.
    try {
      const p = new URLSearchParams(window.location.search)
      if (p.get('tab') || p.get('embed') === '1' || p.get('embed') === 'teams') return 'app'
    } catch { /* ignore */ }
    return 'welcome'
  }) // welcome | setup | tuning | app
  const [tab, setTab] = useState(() => {
    try {
      const t = new URLSearchParams(window.location.search).get('tab')
      if (['today', 'feed', 'agents'].includes(t)) return t
    } catch { /* ignore */ }
    return 'today'
  })
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
  // Today hub: collapsible side panels (persisted) + the in-center conversation.
  const [leftOpen, setLeftOpen] = useState(() => { try { return JSON.parse(localStorage.getItem('jarvis.leftOpen') ?? 'true') } catch { return true } })
  const [rightOpen, setRightOpen] = useState(() => { try { return JSON.parse(localStorage.getItem('jarvis.rightOpen') ?? 'true') } catch { return true } })
  useEffect(() => { try { localStorage.setItem('jarvis.leftOpen', JSON.stringify(leftOpen)) } catch {} }, [leftOpen])
  useEffect(() => { try { localStorage.setItem('jarvis.rightOpen', JSON.stringify(rightOpen)) } catch {} }, [rightOpen])
  // null = Today home; otherwise { item, scenario, preselect, convId, initialMessages } shown in the center.
  const [todayConv, setTodayConv] = useState(null)
  const openTodayConv = (item, scenario = null, preselect = null, convId = null, initialMessages = null) => {
    setTodayConv({ item, scenario, preselect, convId, initialMessages }); setChatTab('chat'); setCoreState('confirming'); SFX.open()
  }
  // Recents (left rail) — seeded from CONVERSATIONS, each linked to its intent.
  const [recents, setRecents] = useState(() => CONVERSATIONS.map(c => ({ ...c, intentId: CONV_TO_INTENT[c.id] || null })))
  // Open an intent — from a Today card OR a Recents row — so both show the same
  // detail and the matching Recents row is created (if new) and selected.
  const openIntent = (intent) => {
    const convId = convIdForIntent(intent)
    setRecents(prev => prev.some(r => r.id === convId)
      ? prev
      : [{ id:convId, title:intent.headline, preview:(intent.why || '').slice(0, 90), time:'now',
           date:'Today', category:intent.cat || 'Decisions', unread:0, intentId:intent.id }, ...prev])
    openTodayConv(intent, intent.chatScenario || null, null, convId)
  }
  // Open a Recents row — intent-backed rows reuse the intent detail; plain rows show their saved thread.
  const openRecent = (c) => {
    const intent = c.intentId ? findIntent(c.intentId) : null
    if (intent) { openIntent(intent); return }
    if (c.messages && c.messages.length) { openTodayConv({ headline:c.title, source:'Jarvis' }, null, null, c.id, c.messages); return }
    openTodayConv({ headline:c.title, tier:'L1', source:'Jarvis' }, null, null, c.id)
  }
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

  // Sign-in modal visibility — opened from the Welcome CTA.
  const [showSignIn, setShowSignIn] = useState(false)
  // Welcome CTA → open the sign-in popup (SSO + email).
  const handleLogin = () => { SFX.tap(); setShowSignIn(true) }
  // After the modal authenticates: branch based on whether prefs exist.
  const handleSignedIn = () => {
    setShowSignIn(false)
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
    <FluentProvider theme={fluentThemeForMode(mode)} style={{ display:'contents', backgroundColor:'var(--color-white)' }}>
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:T.appBgGrad, fontFamily:T.font, position:'relative', transition:'background .3s' }}>
      <style>{CSS}</style>

      {/* Keyboard skip link — first focusable element, jumps past the chrome. */}
      <a href="#jarvis-main" className="skip-link">Skip to main content</a>

      {/* ── Demo / developer bar (not part of Teams UI) — hidden by default;
          toggle with Ctrl/Cmd + Shift + Alt + D ── */}
      {showDemoBar && (
      <div style={{ height:36, flexShrink:0, display:'flex', alignItems:'center', gap:14,
        padding:'0 14px', background:'#0B0B0B', color:'#E5E5E5',
        borderBottom:'1px solid #1A1A1A', zIndex:30, fontFamily:T.font }}>
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
      </div>
      )}

      {/* ── Teams titlebar — exact MS Teams shell (teams.css .teams-titlebar).
          Hidden when embedded: the Teams host renders the real title bar. ── */}
      {!embedded && (
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
      )}

      {/* ── Main area: left rail + content column ── */}
      <div style={{ display:'flex', flex:1, minHeight:0, overflow:'hidden' }}>

      {/* Left rail — exact MS Teams shell (teams.css .teams-rail).
          Hidden when embedded (Teams host provides it) or on narrow stages
          (Teams collapses the rail on mobile/web narrow widths). */}
      {!embedded && !isNarrow && (
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
      )}

      {/* Main column */}
      <div id="jarvis-main" tabIndex={-1} style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', position:'relative', zIndex:1, outline:'none' }}>

        {/* In-app navigation — kept even inside Teams: Jarvis runs as a single
            personal tab and handles its own Today / Conversations / Feed / Skills
            switching. */}
        {showInAppNav && (
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'0 4px', height:52, flexShrink:0, zIndex:10,
          background:'none', border:'none', transition:'background .3s' }}>
          <NeuralCore state={coreState} onClick={() => setCoreState('idle')} />
          <div style={{ flex:1 }} />

        </div>
        )}

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
        {scene==='app' && (
          <ConversationRail
            collapsed={!leftOpen}
            onToggle={() => { SFX.tap(); setLeftOpen(o => !o) }}
            conversations={recents}
            activeTab={todayConv ? null : tab}
            activeConvId={todayConv?.convId || null}
            onNav={(id) => { SFX.tap(); setTodayConv(null); setTab(id); setCoreState('idle') }}
            onNew={() => { SFX.tap(); setTab('today'); openTodayConv({ headline:'New conversation', tier:'L1', source:'Jarvis' }) }}
            onSelect={(c) => { SFX.tap(); setTab('today'); openRecent(c) }} />
        )}
        <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column', minWidth:0 }}>
          {scene==='welcome' && <WelcomeScreen onLogin={handleLogin} />}
          {scene==='setup' && (
            <ConversationalSetup
              initialPrefs={prefs}
              onBack={() => { SFX.tap(); setScene(prefs ? 'app' : 'welcome') }}
              onSkip={(p) => handleSetupComplete(p)}
              onComplete={(p) => handleSetupComplete(p)} />
          )}

          {scene==='app' && tab==='today' && (
            <div style={{ flex:1, display:'flex', minHeight:0, height:'100%', overflow:'hidden' }}>

              {/* ── Center: Today home OR the open conversation ── */}
              <div style={{ flex:1, minWidth:0, display:'flex', overflow:'hidden' }}>
                {todayConv ? (
                  <ChatPanel item={todayConv.item} scenario={todayConv.scenario} preselect={todayConv.preselect}
                    initialMessages={todayConv.initialMessages}
                    setCoreState={setCoreState} activeTab={chatTab} setActiveTab={setChatTab} docked
                    onExpandFull={() => {}}
                    onClose={() => { SFX.tap(); setTodayConv(null); setCoreState('idle') }} />
                ) : (
                  <div style={{ flex:1, overflowY:'auto' }}>
                    <div style={{ maxWidth:760, margin:'0 auto', padding:'20px 28px 48px' }}>

                      {/* Greeting + overnight brief — above the ask bar */}
                      <div style={{ marginBottom:16, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:0, textAlign:'center' }}>
                        <p style={{ fontSize:24, fontWeight:800, color:T.text, letterSpacing:'-0.02em', lineHeight:1.2, margin:0 }}>Good morning, Alex.</p>
                        <p style={{ fontSize:24, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1.2, margin:'2px 0 0',
                          background:`linear-gradient(135deg, ${T.core}, ${T.coreBright})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                          {persona==='manager'
                            ? `Your team needs ${visibleIntents.length} ${visibleIntents.length===1?'thing':'things'}.`
                            : `I handled ${overnightHandled} things overnight.`}
                        </p>
                      </div>

                      {/* Ask Jarvis */}
                      <div style={{ marginBottom:16, position:'relative', zIndex:50 }}>
                        <WhisperBar hero hideGreeting persona={persona} coreState={coreState} setCoreState={setCoreState}
                          onCommand={cmd => {
                            const l = cmd.toLowerCase()
                            if (l.includes('manager')||l.includes('team')) { setPersona('manager'); return }
                            if (l.includes('employee')||l.includes('my day')) { setPersona('employee'); return }
                            openTodayConv({ headline:cmd, tier:'L1', source:'Jarvis' }, null, cmd)
                          }} />
                      </div>

                      {/* Live activity — Jarvis is always watching the systems */}
                      <div style={{ display:'flex', alignItems:'center', padding:'10px 16px', marginBottom:14,
                        borderRadius:9, background:'rgba(92,47,145,0.04)', border:'1px solid rgba(92,47,145,0.08)' }}>
                        <ActivityTicker onOpenFeed={() => { SFX.tap(); setTodayConv(null); setTab('feed'); setCoreState('idle') }} />
                      </div>

                      {/* Filter tabs (with Handled) */}
                      <div role="tablist" aria-label="Filter intents" style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
                        {[
                          { key:null,        label:'All',           color:T.text  },
                          { key:'meetings',  label:'Meetings',      color:T.blue  },
                          { key:'decision',  label:'Need decision', color:T.amber },
                          { key:'followups', label:'Follow-ups',    color:T.teal  },
                        ].map((f, i) => {
                          const active = todayFilter === f.key
                          const cnt = f.key ? notDismissed.filter(INTENT_FILTERS[f.key]).length : notDismissed.length
                          const isLight = active && f.color === T.text
                          return (
                            <button key={i} role="tab" aria-selected={active} type="button"
                              onClick={() => { SFX.tap(); HX.tap(); setTodayFilter(f.key) }}
                              style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'8px 14px', borderRadius:99, cursor:'pointer',
                                background: active ? (isLight ? 'rgba(92,46,145,0.08)' : f.color) : T.surface,
                                border:`1px solid ${active ? (isLight ? 'rgba(67,0,43,0.3)' : f.color) : T.border}`,
                                color: active ? (isLight ? 'rgba(0,0,0,0.7)' : '#fff') : T.textMid, fontSize:13, fontWeight:600, fontFamily:T.font,
                                boxShadow: active ? (isLight ? 'none' : T.shadowSm) : 'none', transition:'all .12s' }}
                              onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = f.color; e.currentTarget.style.color = f.color } }}
                              onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMid } }}>
                              <span>{f.label}</span>
                              <span style={{ fontSize:11, fontWeight:700, opacity:.7 }}>{cnt}</span>
                            </button>
                          )
                        })}
                        {/* Handled tab + popover */}
                        <div className="handled-pop" style={{ position:'relative', marginLeft:'auto' }}>
                          <button type="button" onClick={() => { SFX.tap(); setHandledOpen(o => !o) }}
                            style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:99, cursor:'pointer',
                              background:T.surface, border:`1px solid ${T.border}`, color:T.textMid, fontSize:13, fontWeight:600, fontFamily:T.font, transition:'all .12s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = T.core; e.currentTarget.style.color = T.core }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMid }}>
                            <History size={13} /> Done <span style={{ fontSize:11, fontWeight:700, opacity:.7 }}>{handledList.length}</span>
                          </button>
                          {handledOpen && handledList.length > 0 && (
                            <div className="expand-down" style={{ position:'absolute', top:'calc(100% + 6px)', right:0,
                              width:360, maxWidth:'90vw', maxHeight:340, overflowY:'auto',
                              background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, boxShadow:T.shadowMd, padding:6, zIndex:110, fontFamily:T.font }}>
                              {handledList.map(({ intent, kind }) => (
                                <div key={intent.id} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'8px 10px', borderRadius:6 }}>
                                  <div style={{ flexShrink:0, width:20, height:20, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center',
                                    background: kind==='done' ? T.greenSoft : T.surfaceMid, color: kind==='done' ? T.green : T.textSoft }}>
                                    {kind==='done' ? <Check size={11} /> : <X size={11} />}
                                  </div>
                                  <div style={{ flex:1, minWidth:0 }}>
                                    <p style={{ fontSize:12, fontWeight:600, color:T.text, lineHeight:1.35, margin:0 }}>{intent.headline}</p>
                                    <p style={{ fontSize:11, color:T.textSoft, margin:'2px 0 0' }}>{kind==='done' ? 'Marked done' : 'Removed from today'}</p>
                                  </div>
                                  <button type="button" onClick={() => { SFX.tap(); kind==='done' ? undoDone(intent.id) : undoDismiss(intent.id) }}
                                    style={{ flexShrink:0, padding:'4px 10px', borderRadius:4, background:'none', border:`1px solid ${T.border}`, color:T.core, fontSize:11, fontWeight:700, fontFamily:T.font, cursor:'pointer' }}>
                                    Undo
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Intents */}
                      {isDayCleared ? (
                        <div className="pop" style={{ padding:'32px 28px', borderRadius:12, background:T.surface, border:`1px solid ${T.border}`, boxShadow:T.shadowMd,
                          backgroundImage:`radial-gradient(60% 90% at 50% -10%, ${T.coreSoft}, transparent 70%)` }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                            <JarvisMark size={36} radius={10} style={{ animation:'breathe 2s ease-in-out infinite' }} />
                            <p style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:T.core, margin:0 }}>Day cleared</p>
                          </div>
                          <h2 style={{ fontSize:28, fontWeight:700, color:T.text, margin:'0 0 6px', letterSpacing:'-0.01em' }}>That's the lot.</h2>
                          <p style={{ fontSize:15, color:T.textSoft, margin:'0 0 16px', lineHeight:1.6 }}>I'll keep watching. Anything else you'd like me to look at?</p>
                          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                            <button type="button" onClick={() => { SFX.tap(); setTab('feed') }}
                              style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'10px 14px', borderRadius:8, cursor:'pointer', background:T.core, border:'none', color:'#fff', fontSize:13, fontWeight:700, fontFamily:T.font }}>
                              <History size={14} /> Show what I did today
                            </button>
                            <button type="button" onClick={() => { SFX.tap(); openTodayConv({ headline:'Plan tomorrow', tier:'L1', source:'Jarvis' }, null, 'Plan tomorrow') }}
                              style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'10px 14px', borderRadius:8, cursor:'pointer', background:'none', border:`1px solid ${T.border}`, color:T.text, fontSize:13, fontWeight:700, fontFamily:T.font }}>
                              <Sparkles size={14} /> Plan tomorrow
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {visibleIntents.map((intent, i) => (
                            <IntentCard key={intent.id} intent={intent} idx={i}
                              onAct={openIntent} onDone={handleDone} onDismiss={handleDismiss} onRemind={handleRemind}
                              isDone={doneIds.includes(intent.id)} />
                          ))}
                          {prefs && (
                            <p style={{ fontSize:12, color:T.textSoft, margin:'16px 0 0', textAlign:'center' }}>
                              Personalised from your Set up ·{' '}
                              <button type="button" onClick={() => { SFX.tap(); setScene('setup') }}
                                style={{ padding:0, background:'none', border:'none', cursor:'pointer', color:T.core, fontSize:12, fontWeight:600, fontFamily:T.font, textDecoration:'underline', textUnderlineOffset:2 }}>
                                Edit →
                              </button>
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right: collapsible Meetings panel ── */}
              <MeetingsPanel collapsed={!rightOpen} onToggle={() => { SFX.tap(); setRightOpen(o => !o) }}
                onEventClick={(ev) => openTodayConv({ headline:ev.title, tier:'L2', source:ev.location || 'Calendar' }, null, null)}
                onAddMeeting={() => setShowAddMeeting(true)} />
            </div>
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

      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} onSignIn={handleSignedIn} />}
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
    </FluentProvider>
  )
}

