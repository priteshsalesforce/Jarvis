import React, { useState, useEffect, useRef } from 'react'
import {
  Bell, ChevronDown, CheckCircle2, XCircle, MessageCircle,
  ExternalLink, Plus, Settings, Users, AlertTriangle,
  Calendar, Clock, ArrowRight, Send, Mic, X, Check,
  Loader2, LogOut, ChevronLeft, Sparkles, Activity,
  ShieldCheck, BrainCircuit, Zap, TrendingUp, FileText,
  MessageSquare, Lock, GitBranch, Database, LayoutDashboard,
  History, Sliders, Star, Eye, RefreshCw, ChevronRight,
  Link2, UserCircle2, Hash, Paperclip, Video, MapPin,
} from 'lucide-react'

const T = {
  appBg:'#0D0B1A', rail:'#080614', railActive:'rgba(117,38,227,0.15)', topBar:'#0D0B1A',
  core:'#7526E3', coreMid:'#9050E9', coreSoft:'rgba(117,38,227,0.12)', coreGlow:'rgba(117,38,227,0.35)',
  coreGrad:'linear-gradient(135deg,#7526E3 0%,#5A1BA9 100%)', coreBright:'#BA01FF',
  teal:'#01C3B3', tealSoft:'rgba(1,195,179,0.12)',
  blue:'#1B96FF', blueSoft:'rgba(27,150,255,0.12)',
  amber:'#FE9339', amberSoft:'rgba(254,147,57,0.12)',
  red:'#FF5D2D', redSoft:'rgba(255,93,45,0.12)',
  green:'#45C65A', greenSoft:'rgba(69,198,90,0.12)',
  surface:'rgba(255,255,255,0.03)', surfaceMid:'rgba(255,255,255,0.06)', surfaceHigh:'rgba(255,255,255,0.09)',
  border:'rgba(255,255,255,0.07)', borderMid:'rgba(255,255,255,0.12)',
  text:'rgba(255,255,255,0.92)', textMid:'rgba(255,255,255,0.6)',
  textSoft:'rgba(255,255,255,0.38)', textXsoft:'rgba(255,255,255,0.22)',
  shadowPurple:'0 4px 32px rgba(117,38,227,0.2)', shadowPurpleHover:'0 8px 48px rgba(117,38,227,0.35)',
  font:'"SF Pro", system-ui, -apple-system, sans-serif',
  r8:'8px', r12:'12px', r16:'16px', r24:'24px', r32:'32px',
}

const TIER_META = {
  L1:{color:'#01C3B3',bg:'rgba(1,195,179,0.12)',  label:'Low risk',     bar:'#01C3B3'},
  L2:{color:'#1B96FF',bg:'rgba(27,150,255,0.12)', label:'Review',       bar:'#1B96FF'},
  L3:{color:'#FE9339',bg:'rgba(254,147,57,0.12)', label:'Your decision',bar:'#FE9339'},
  L4:{color:'#FF5D2D',bg:'rgba(255,93,45,0.12)',  label:'Gate required',bar:'#FF5D2D'},
}

const INTENTS = [
  { id:'hero', tier:'L3', category:'Escalation needed', isHero:true,
    headline:'Legal approval is blocking your analytics pipeline',
    why:'DPA with CloudMetrics was filed 5 days ago. Amy Torres (reviewer) returns Wednesday — too late. Pipeline go-live is Friday.',
    action:'Draft escalation to General Counsel', source:'Salesforce · Case #DPA-8821',
    evidence:'Case status: In Review · SLA breached by 2 days · Amy Torres OOO until May 4', chatScenario:'p1' },
  { id:'y1', tier:'L2', category:'Yesterday',
    headline:'Q2 planning meeting left 3 unowned actions',
    why:'Email thread has 3 unread replies. Confluence page not updated in 4 days.',
    action:'Review & assign owners', source:'Outlook · Q2 Planning thread',
    evidence:'Thread: "Q2 Planning — Apr 28" · 3 unread replies', chatScenario:null },
  { id:'y2', tier:'L1', category:'Yesterday',
    headline:'Security certification expires in 3 days',
    why:'Annual compliance training incomplete. Deadline: Apr 30.',
    action:'Open LMS portal', source:'Workday · Compliance tracker',
    evidence:'Status: Not started · Est. 45 min', chatScenario:null },
  { id:'f1', tier:'L3', category:'Follow-up needed',
    headline:'Acme Corp SOW needs your revision by EOD Thursday',
    why:'Legal approved redlines at 09:14 today. Sections 3.2 and 4.1 need update then send to Maria Chen.',
    action:'Open SOW draft', source:'Outlook · Acme SOW v3',
    evidence:'Legal sign-off: received · Maria Chen deadline: May 1 EOD', chatScenario:null },
  { id:'f2', tier:'L1', category:'Follow-up needed',
    headline:'Jordan Parker interview scorecard due in 18 hours',
    why:'Debrief with hiring panel is Wednesday 11 AM. Scorecard needed before then.',
    action:'Submit scorecard', source:'Greenhouse · Jordan Parker',
    evidence:'Role: Staff Engineer · Panel debrief: Wed 11 AM', chatScenario:null },
  { id:'e1', tier:'L2', category:'In 90 minutes',
    headline:'QBR with SVP — prep bundle ready',
    why:'Deck found, 3 open actions from last meeting surfaced, SVP context pulled.',
    action:'Open prep bundle', source:'Outlook Calendar · 10:00 AM', prepReady:true,
    evidence:'QBR-H2-2026.pptx · 3 unresolved Apr 14 actions', chatScenario:'prep' },
  { id:'e2', tier:'L4', category:'Today 2:00 PM',
    headline:'Production deployment v3.8.2 — human gate required',
    why:'CR-4471 approved. Blue/Green shift needs your explicit confirmation before traffic moves.',
    action:'Review & arm deployment', source:'Jira · CR-4471',
    evidence:'Rollback snapshot ready · On-call: Raj Mehta available', chatScenario:null },
  { id:'p2', tier:'L2', category:'Pending with you',
    headline:'Datadog license stuck in IT security review — day 10',
    why:'Finance approved. IT security SLA is 5 days. Currently at day 10. Jarvis can draft a follow-up.',
    action:'Chase IT security', source:'ServiceNow · INC0038912',
    evidence:'Finance: Approved · IT Security: In review, SLA +5 days', chatScenario:null },
]

const MANAGER_INTENTS = [
  { id:'mh', tier:'L3', category:'Team risk', isHero:true,
    headline:'Liam Davis is showing burnout signals — act this week',
    why:'55+ hour weeks for 3 consecutive sprints. Sentiment markers up 20%. Friday gap available. Coverage identified.',
    action:'Review & authorise Wellness Day', source:'Jira + Slack (aggregated)',
    evidence:'Sprints 14-16: avg 57h · Team avg: 38h · Fatigue markers: +20% (aggregated, no raw DMs)', chatScenario:'burnout' },
  { id:'m1', tier:'L2', category:'Approval digest',
    headline:'3 routine approvals ready to batch-confirm',
    why:'Expense $340, PTO (no conflicts), laptop upgrade — all within policy. 1 exception flagged separately.',
    action:'Batch approve 3 items', source:'Workday · Approval queue',
    evidence:'All 3 auto-checked against policy · Exception: salary +11% (cap 8%) — separate', chatScenario:null },
  { id:'m2', tier:'L2', category:'Team readiness',
    headline:'React 19 skill gap causing 15% velocity drop on Transitions',
    why:'4 engineers identified. Masterclass available Friday 2–4 PM. No calendar conflicts.',
    action:'Enrol 4 engineers', source:'GitHub + Workday',
    evidence:'Transitions tasks: avg 3.2 days vs 1.8 expected · 3-sprint pattern', chatScenario:null },
  { id:'m3', tier:'L3', category:'Hiring decision',
    headline:'Senior DevOps — 3 finalists, budget confirmed, decision needed',
    why:'Candidate A scored 94/100. Panels aligned. Relocation budget approved. Offer draft ready.',
    action:'Select candidate & approve offer', source:'Lever ATS',
    evidence:'Candidate A: 94 · B: 81 · C: 79 · Budget: $12k relocation confirmed', chatScenario:null },
  { id:'m4', tier:'L1', category:'Team readiness',
    headline:'Sprint 24 planning — 14 stories groomed, team available',
    why:'No blockers detected. Backlog groomed Thursday. Lisa returns from PTO today.',
    action:'View sprint board', source:'Jira',
    evidence:'14 stories ready · Lisa Kim: returns today · No capacity conflicts', chatScenario:null },
]

const TODAY_EVENTS = [
  { id:'ev1', time:'09:00', end:'09:30', title:'Standup — Platform team', type:'meeting', attendees:['Alex','Priya','Raj','Liam'], location:'Teams', hasPrep:false },
  { id:'ev2', time:'10:00', end:'11:00', title:'QBR with SVP Sarah', type:'meeting', attendees:['Alex','Sarah Chen','Marcus T.'], location:'Teams', hasPrep:true },
  { id:'ev3', time:'11:30', end:'12:00', title:'Sprint Planning — Sprint 24', type:'meeting', attendees:['Alex','Dev team (8)'], location:'Teams', hasPrep:false },
  { id:'ev4', time:'13:00', end:'13:30', title:'1:1 with Sarah', type:'1on1', attendees:['Alex','Sarah Chen'], location:'Teams', hasPrep:false },
  { id:'ev5', time:'14:00', end:'14:30', title:'Prod Deploy — v3.8.2 gate', type:'gate', attendees:['Alex','Raj Mehta','DevOps'], location:'Jira', hasPrep:true },
  { id:'ev6', time:'15:30', end:'16:00', title:'Acme Corp check-in', type:'external', attendees:['Alex','Maria Chen (Acme)'], location:'Zoom', hasPrep:false },
]

const FEED_ITEMS = [
  { id:'fd1', time:'08:47 AM', status:'done', icon:'🧠', title:'Morning brief compiled', body:'Pulled from Workday (4), Outlook (6), Jira (3). Ranked by deadline × impact.', steps:['Fetch Outlook flagged emails → 12 found, 4 surfaced','Fetch Workday pending approvals → 3 items','Fetch Jira overdue tickets → 3 of 9 surfaced','Score and rank by criticality'] },
  { id:'fd2', time:'08:51 AM', status:'done', icon:'⚠️', title:'Proactive nudge — security certification', body:'Detected expiry in 3 days. Sent Teams notification with LMS deep link.', steps:['Workday compliance check','Training status: Not started, deadline Apr 30','Composed nudge','Delivered via Teams'] },
  { id:'fd3', time:'09:02 AM', status:'running', icon:'📋', title:'Meeting prep: QBR 10:00 AM', body:'Gathering deck, last meeting notes, and SVP context.', steps:['Located QBR-H2-2026.pptx in Drive ✓','Pulled Apr 14 meeting notes — 3 open actions ✓','Fetching SVP briefing history…','Draft prep bundle (pending)'] },
  { id:'fd4', time:'Yesterday', status:'done', icon:'✅', title:'PTO requests auto-verified', body:'Checked 3 requests against team calendar and policy. All clear.', steps:['Fetch Workday queue','Check team calendar conflicts','Validate policy rules','Surfaced in dashboard'] },
]

const CHAT_SCENARIOS = {
  p1:[{role:'jarvis', text:'I\'ve got the full picture on Case #DPA-8821.\n\n**Situation:** Amy Torres is the assigned Legal reviewer. She\'s OOO until Wednesday — but your pipeline go-live is Friday. The SLA was already breached 2 days ago.\n\n**I can do one of these right now:**\n**A** · Draft an escalation email to CC General Counsel\n**B** · Set a Thursday morning reminder with a follow-up prompt\n**C** · Show the full case timeline\n\nWhich would you like?'}],
  incident:[{role:'jarvis', text:'🚨 **P1: INC-9942 — Auth Service Down**\n\nEU-West-1 is returning 503s on /v1/auth. Detected 4 minutes ago. 3 enterprise customers impacted. Incident owner: unassigned.\n\n**I\'ve identified the on-call:** Raj Mehta (Infra) — available now.\n\n**What should I do?**\n**A** · Assign Raj as owner in Salesforce\n**B** · Send Raj a Teams message with full incident context\n**C** · Open a war room channel in Teams\n\nPick one and I\'ll execute.'}],
  prep:[{role:'jarvis', text:'**QBR prep bundle — ready for 10:00 AM**\n\n📄 Deck: QBR-H2-2026.pptx (Priya edited yesterday)\n📋 3 open actions from Apr 14 — none closed\n💬 SVP context: Last discussion was budget; she flagged the 18% incident response improvement\n\n**Suggested talking point:** Lead with the incident improvement metric — it\'s her priority.\n\nWant me to draft a 3-point opening you can use?'}],
  burnout:[{role:'jarvis', text:'**Capacity warning: Liam Davis**\n\nSprint data shows 55–61 hour weeks for 3 consecutive sprints (team avg: 38h). Slack sentiment analysis shows +20% fatigue markers — this is aggregated data only, no raw DMs were read.\n\n**I\'ve already prepared:**\n· Sloane as Friday coverage backup\n· A draft wellness check-in message for Liam\n\n**Your call:**\n**A** · Authorise Wellness Day + confirm Sloane coverage\n**B** · Review the draft message to Liam first\n**C** · Flag for 1:1 agenda instead\n\nI need your confirmation before any action is taken.'}],
}

const BEHAVIOURS = [
  {id:'b1', name:'Daily Morning Brief', desc:'Brief at 9 AM — emails, calendar, tasks.', schedule:'Weekdays · 9:00 AM', enabled:true},
  {id:'b2', name:'Meeting Prep', desc:'Prep notes 30 min before each meeting.', schedule:'Every day · 30 min before', enabled:true},
  {id:'b3', name:'Document Intelligence', desc:'Find and summarise docs on demand.', schedule:'On demand', enabled:true},
  {id:'b4', name:'Email Management', desc:'Triage inbox and draft replies.', schedule:'Weekdays · 5:00 PM', enabled:false},
]

const CONNECTIONS = [
  {id:'c1', name:'Microsoft Teams', logo:'🟣', connected:true},
  {id:'c2', name:'Outlook Calendar', logo:'🔵', connected:true},
  {id:'c3', name:'OneDrive / SharePoint', logo:'🔷', connected:true},
  {id:'c4', name:'Workday', logo:'🟠', connected:true},
  {id:'c5', name:'Salesforce', logo:'☁️', connected:false},
  {id:'c6', name:'Jira', logo:'🔹', connected:false},
  {id:'c7', name:'Google Drive', logo:'🟡', connected:false},
  {id:'c8', name:'GitHub', logo:'⚫', connected:false},
]

const TEMPLATES = [
  {id:'sf', icon:'☁️', name:'Salesforce Headless', desc:'Act on CRM signals — cases, opportunities, approvals.'},
  {id:'email', icon:'📧', name:'Email Management', desc:'Triage inbox and draft replies automatically.'},
  {id:'calendar', icon:'📅', name:'Calendar Management', desc:'Meeting briefings and prep notes.'},
  {id:'workday', icon:'⚙️', name:'Automate Your Workday', desc:'Morning briefing combining email, calendar, and tasks.'},
  {id:'incident', icon:'🚨', name:'Incident Response', desc:'React to Salesforce incidents and alert the right people.'},
  {id:'standup', icon:'👥', name:'Team Stand-up', desc:'Collect and summarise team activity.'},
  {id:'docs', icon:'📄', name:'Document Intelligence', desc:'Search, summarise, and answer questions across docs.'},
  {id:'scratch', icon:'✏️', name:'Create from scratch', desc:'Start blank and define everything yourself.'},
]

const CSS = `
@keyframes breathe    { 0%,100%{opacity:.45;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
@keyframes think      { 0%,100%{opacity:.5;transform:scale(.92)} 50%{opacity:1;transform:scale(1.12)} }
@keyframes heartbeat  { 0%,100%{transform:scale(1)} 14%{transform:scale(1.22)} 28%{transform:scale(1)} 42%{transform:scale(1.12)} 56%{transform:scale(1)} }
@keyframes ripple     { 0%{transform:scale(.7);opacity:.9} 100%{transform:scale(2.8);opacity:0} }
@keyframes orbit      { from{transform:rotate(0deg) translateX(var(--r,28px)) rotate(0deg)} to{transform:rotate(360deg) translateX(var(--r,28px)) rotate(-360deg)} }
@keyframes aurora     { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
@keyframes slideUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideRight { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
@keyframes fadeIn     { from{opacity:0} to{opacity:1} }
@keyframes shimmer    { 0%{background-position:-500px 0} 100%{background-position:500px 0} }
@keyframes pop        { 0%{transform:scale(.5);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
@keyframes doneSlide  { 0%{transform:translateX(0);opacity:1} 100%{transform:translateX(-48px);opacity:0} }
@keyframes float      { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
@keyframes glowPulse  { 0%,100%{box-shadow:0 0 20px rgba(117,38,227,0.4)} 50%{box-shadow:0 0 50px rgba(117,38,227,0.8),0 0 80px rgba(186,1,255,0.3)} }
.intent-enter { animation: slideUp .4s cubic-bezier(.16,1,.3,1) both; }
.intent-done  { animation: doneSlide .3s ease-out both; }
.chat-enter   { animation: slideRight .35s cubic-bezier(.16,1,.3,1) both; }
.ripple-ring  { animation: ripple 2.4s ease-out infinite; }
.float-anim   { animation: float 4s ease-in-out infinite; }
* { box-sizing: border-box; }
body { margin:0; padding:0; }
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
`

// ─── Micro components ──────────────────────────────────────────────────────────
function TierPill({ tier }) {
  const m = TIER_META[tier]; if (!m) return null
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'2px 8px', borderRadius:99,
      fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em',
      background:m.bg, color:m.color }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:m.color, flexShrink:0 }} />
      {m.label}
    </span>
  )
}

function SourceChip({ text }) {
  return (
    <span style={{ fontSize:10, fontWeight:500, padding:'2px 8px', borderRadius:99,
      background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.45)' }}>{text}</span>
  )
}

function DayArc({ done, total }) {
  const pct = total > 0 ? done / total : 0
  const r = 26, circ = 2 * Math.PI * r, dash = circ * (1 - pct)
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
      <div style={{ position:'relative', width:60, height:60 }}>
        <svg width="60" height="60" viewBox="0 0 60 60" style={{ transform:'rotate(-90deg)' }}>
          <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
          <circle cx="30" cy="30" r={r} fill="none" stroke={T.core} strokeWidth="4"
            strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
            style={{ transition:'stroke-dashoffset .6s cubic-bezier(.4,0,.2,1)', filter:`drop-shadow(0 0 6px ${T.core})` }} />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:15, fontWeight:900, lineHeight:1, color:T.text }}>{done}</span>
          <span style={{ fontSize:9, fontWeight:600, color:T.textSoft }}>/{total}</span>
        </div>
      </div>
      <div>
        <p style={{ fontSize:13, fontWeight:700, color:T.text, lineHeight:1.2 }}>
          {done === total && total > 0 ? '🎉 Day cleared!' : `${total - done} left today`}
        </p>
        <p style={{ fontSize:11, marginTop:3, color:T.textSoft }}>
          {pct === 0 ? 'Brief ready.' : pct < .5 ? 'Good momentum.' : pct < 1 ? 'Almost there.' : 'Outstanding.'}
        </p>
      </div>
    </div>
  )
}

function NeuralCore({ state, onClick }) {
  const cfg = {
    idle:       { anim:'breathe 4s ease-in-out infinite',    glow:T.coreGlow,                     label:'Ready',       color:T.core },
    listening:  { anim:'breathe 1.2s ease-in-out infinite',  glow:'rgba(27,150,255,0.4)',          label:'Listening…',  color:T.blue },
    thinking:   { anim:'think .8s ease-in-out infinite',     glow:'rgba(117,38,227,0.6)',          label:'Thinking…',   color:T.coreBright },
    executing:  { anim:'heartbeat 1s ease-in-out infinite',  glow:'rgba(69,198,90,0.4)',           label:'Acting…',     color:T.green },
    confirming: { anim:'breathe 2s ease-in-out infinite',    glow:'rgba(254,147,57,0.4)',          label:'Your turn',   color:T.amber },
    degraded:   { anim:'breathe 6s ease-in-out infinite',    glow:'rgba(255,93,45,0.3)',           label:'Limited data',color:T.red },
  }
  const c = cfg[state] || cfg.idle
  return (
    <button type="button" onClick={onClick} style={{ position:'relative', display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer', padding:0 }} title="Jarvis Neural Core">
      {(state === 'thinking' || state === 'executing') && (<>
        <div className="ripple-ring" style={{ position:'absolute', left:0, top:0, width:32, height:32, borderRadius:'50%', border:`1.5px solid ${c.color}` }} />
        <div className="ripple-ring" style={{ position:'absolute', left:0, top:0, width:32, height:32, borderRadius:'50%', border:`1.5px solid ${c.color}`, animationDelay:'.9s' }} />
      </>)}
      <div style={{ position:'relative', width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
        background:T.coreGrad, boxShadow:`0 0 16px ${c.glow}`, animation:c.anim, flexShrink:0 }}>
        <BrainCircuit size={15} color="white" />
      </div>
      <div style={{ display:'flex', flexDirection:'column', lineHeight:1 }}>
        <span style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.25em', color:T.textXsoft }}>JARVIS</span>
        <span style={{ fontSize:11, fontWeight:600, color:c.color }}>{c.label}</span>
      </div>
    </button>
  )
}

// ─── Hero Card ─────────────────────────────────────────────────────────────────
function HeroCard({ intent, onAct, onDone, isDone }) {
  if (isDone) return (
    <div className="intent-done" style={{ borderRadius:20, padding:'16px 20px', marginBottom:16,
      display:'flex', alignItems:'center', gap:14, background:T.greenSoft, border:`1px solid rgba(69,198,90,0.3)` }}>
      <div style={{ width:40, height:40, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:T.green }}>
        <Check size={18} color="white" />
      </div>
      <div>
        <p style={{ fontWeight:700, fontSize:14, color:T.green }}>Handled.</p>
        <p style={{ fontSize:12, color:T.textSoft, marginTop:2 }}>{intent.headline}</p>
      </div>
    </div>
  )
  const m = TIER_META[intent.tier]
  return (
    <div className="intent-enter" style={{ borderRadius:20, overflow:'hidden', marginBottom:16,
      background:'linear-gradient(135deg,#100D20 0%,#1E1640 60%,#251A50 100%)',
      border:`1px solid rgba(117,38,227,0.3)`, boxShadow:'0 8px 40px rgba(117,38,227,0.25)' }}>
      <div style={{ height:2, background:`linear-gradient(90deg,${m.bar},${T.coreBright},${m.bar})`,
        backgroundSize:'200% 100%', animation:'shimmer 3s linear infinite' }} />
      <div style={{ padding:'20px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <span style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', color:'rgba(255,255,255,0.35)' }}>Most important right now</span>
          <TierPill tier={intent.tier} />
        </div>
        <h2 style={{ fontSize:20, fontWeight:800, lineHeight:1.3, color:T.text, marginBottom:8 }}>{intent.headline}</h2>
        <p style={{ fontSize:13, lineHeight:1.6, color:'rgba(255,255,255,0.6)', marginBottom:14 }}>{intent.why}</p>
        <div style={{ padding:'8px 12px', borderRadius:10, marginBottom:16,
          background:'rgba(255,255,255,0.05)', fontFamily:'monospace', fontSize:11, color:'rgba(255,255,255,0.4)' }}>
          {intent.evidence}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button type="button" onClick={() => onAct(intent)} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px',
            borderRadius:12, fontSize:13, fontWeight:700, color:'white', border:'none', cursor:'pointer',
            background:m.bar, boxShadow:`0 4px 16px ${m.bar}55`, transition:'all .15s' }}>
            <Sparkles size={14} />{intent.action}
          </button>
          <button type="button" onClick={() => onDone(intent.id)} style={{ padding:'10px 16px', borderRadius:12,
            fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.5)', background:'rgba(255,255,255,0.07)',
            border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer' }}>
            Mark resolved
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Intent Card ──────────────────────────────────────────────────────────────
function IntentCard({ intent, idx, onAct, onDone, onDismiss, isDone }) {
  const m = TIER_META[intent.tier]
  const [expanded, setExpanded] = useState(false)
  if (isDone) return (
    <div className="intent-done" style={{ borderRadius:14, overflow:'hidden', marginBottom:10,
      display:'flex', alignItems:'center', gap:10, padding:'10px 16px',
      background:T.greenSoft, border:`1px solid rgba(69,198,90,0.2)` }}>
      <Check size={13} color={T.green} />
      <span style={{ fontSize:12, fontWeight:600, color:T.green }}>Done — {intent.headline}</span>
    </div>
  )
  return (
    <div className="intent-enter" style={{ borderRadius:14, overflow:'hidden', marginBottom:10,
      background:T.surface, border:`1px solid ${T.border}`, borderLeft:`3px solid ${m.bar}`,
      transition:'box-shadow .2s', animationDelay:`${idx * 0.06}s` }}
      onMouseEnter={e => e.currentTarget.style.boxShadow=T.shadowPurple}
      onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
      {intent.tier === 'L4' && (
        <div style={{ height:2, overflow:'hidden', background:'rgba(255,255,255,0.04)' }}>
          <div style={{ height:'100%', background:`linear-gradient(90deg,transparent,${m.bar}88,transparent)`,
            backgroundSize:'500px 100%', animation:'shimmer 1.8s infinite linear' }} />
        </div>
      )}
      <div style={{ padding:'14px 16px 12px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:T.textXsoft }}>{intent.category}</span>
            {intent.prepReady && <span style={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em',
              padding:'2px 6px', borderRadius:99, background:T.blueSoft, color:T.blue }}>Prep ready</span>}
          </div>
          <TierPill tier={intent.tier} />
        </div>
        <h3 style={{ fontSize:14, fontWeight:700, lineHeight:1.4, marginBottom:6, color:T.text, cursor:'pointer' }}
          onClick={() => setExpanded(e => !e)}>{intent.headline}</h3>
        <p style={{ fontSize:12, lineHeight:1.6, marginBottom:10, color:T.textMid,
          display:'-webkit-box', WebkitLineClamp: expanded ? 99 : 1, WebkitBoxOrient:'vertical', overflow: expanded ? 'visible' : 'hidden' }}>
          {intent.why}
        </p>
        {expanded && (
          <div style={{ marginBottom:10, padding:'8px 12px', borderRadius:10, fontFamily:'monospace', fontSize:11,
            background:'rgba(255,255,255,0.04)', color:T.textSoft }}>
            <span style={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', color:T.textXsoft, display:'block', marginBottom:4 }}>What I read</span>
            {intent.evidence}
          </div>
        )}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:10, borderTop:`1px solid rgba(255,255,255,0.05)` }}>
          <SourceChip text={intent.source} />
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <button type="button" onClick={() => setExpanded(e => !e)}
              style={{ padding:6, borderRadius:8, background:'none', border:'none', cursor:'pointer', color:T.textSoft }}>
              <ChevronDown size={13} style={{ transform: expanded ? 'rotate(180deg)' : '', transition:'transform .2s' }} />
            </button>
            <button type="button" onClick={() => onDone(intent.id)}
              style={{ padding:6, borderRadius:8, background:'none', border:'none', cursor:'pointer' }}>
              <Check size={13} color={T.green} />
            </button>
            <button type="button" onClick={() => onDismiss(intent.id)}
              style={{ padding:6, borderRadius:8, background:'none', border:'none', cursor:'pointer' }}>
              <X size={13} color={T.textXsoft} />
            </button>
            <button type="button" onClick={() => onAct(intent)}
              style={{ display:'flex', alignItems:'center', gap:6, marginLeft:4, padding:'6px 12px', borderRadius:10,
                fontSize:11, fontWeight:700, color:'white', background:T.coreGrad, border:'none', cursor:'pointer', transition:'opacity .15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity='.85'}
              onMouseLeave={e => e.currentTarget.style.opacity='1'}>
              {intent.chatScenario ? <MessageCircle size={11} /> : <Zap size={11} />}{intent.action}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Timeline Panel ────────────────────────────────────────────────────────────
function TimelinePanel({ onEventClick, onAddMeeting }) {
  const typeColor = { meeting:T.blue, '1on1':T.coreBright, gate:T.red, external:T.teal }
  const nowH = 9, nowM = 45 // simulated "now" = 9:45 AM
  return (
    <div style={{ width:300, borderLeft:`1px solid ${T.border}`, overflowY:'auto', padding:'20px 16px', background:T.appBg, flexShrink:0 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:T.textXsoft }}>Today</p>
          <p style={{ fontSize:14, fontWeight:800, color:T.text }}>Thursday, May 1</p>
        </div>
        <button type="button" onClick={onAddMeeting}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:10,
            fontSize:11, fontWeight:700, color:T.core, background:T.coreSoft, border:`1px solid rgba(117,38,227,0.2)`, cursor:'pointer' }}>
          <Plus size={12} /> Add
        </button>
      </div>

      <div style={{ position:'relative' }}>
        {/* Timeline line */}
        <div style={{ position:'absolute', left:36, top:0, bottom:0, width:1, background:`rgba(255,255,255,0.07)` }} />

        {TODAY_EVENTS.map((ev, i) => {
          const [h] = ev.time.split(':').map(Number)
          const isPast = h < nowH || (h === nowH && 0 < nowM)
          const isNow = h === nowH
          const color = typeColor[ev.type] || T.blue
          const firstTwo = ev.attendees.slice(0,2)
          const extra = ev.attendees.length - 2
          return (
            <div key={ev.id}>
              {/* "Now" indicator between past and future */}
              {i > 0 && (() => {
                const [ph] = TODAY_EVENTS[i-1].time.split(':').map(Number)
                const [ch] = ev.time.split(':').map(Number)
                if (ph <= nowH && ch > nowH) return (
                  <div style={{ display:'flex', alignItems:'center', gap:8, margin:'8px 0', paddingLeft:28 }}>
                    <div style={{ width:18, height:18, borderRadius:'50%', background:T.red, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 0 8px ${T.red}`, zIndex:1, position:'relative' }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:'white' }} />
                    </div>
                    <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${T.red},transparent)` }} />
                    <span style={{ fontSize:10, fontWeight:700, color:T.red }}>NOW · 9:45</span>
                  </div>
                )
                return null
              })()}

              <div onClick={() => onEventClick(ev)}
                style={{ display:'flex', gap:10, marginBottom:10, cursor:'pointer', paddingLeft:4 }}>
                {/* Time + dot */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:44, flexShrink:0 }}>
                  <span style={{ fontSize:11, fontWeight:600, color: isPast ? T.textXsoft : T.textSoft, marginBottom:4 }}>{ev.time}</span>
                  <div style={{ width:10, height:10, borderRadius:'50%', background: isPast ? 'rgba(255,255,255,0.15)' : color,
                    boxShadow: isPast ? 'none' : `0 0 8px ${color}`, zIndex:1, position:'relative' }} />
                </div>
                {/* Card */}
                <div style={{ flex:1, padding:'10px 12px', borderRadius:12,
                  background: isNow ? `rgba(117,38,227,0.08)` : T.surface,
                  border: isNow ? `1px solid rgba(117,38,227,0.25)` : `1px solid ${T.border}`,
                  opacity: isPast ? 0.5 : 1, transition:'all .15s',
                  boxShadow: isNow ? '0 0 16px rgba(117,38,227,0.12)' : 'none' }}
                  onMouseEnter={e => { if(!isPast) e.currentTarget.style.borderColor='rgba(117,38,227,0.3)' }}
                  onMouseLeave={e => { if(!isPast) e.currentTarget.style.borderColor = isNow ? 'rgba(117,38,227,0.25)' : T.border }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:5 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:T.text, lineHeight:1.3, flex:1 }}>{ev.title}</p>
                    {ev.hasPrep && (
                      <span style={{ fontSize:9, fontWeight:800, padding:'2px 6px', borderRadius:99, marginLeft:8,
                        background:T.blueSoft, color:T.blue, whiteSpace:'nowrap', flexShrink:0 }}>Prep ✓</span>
                    )}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:color, flexShrink:0 }} />
                      <span style={{ fontSize:10, color:T.textSoft }}>{ev.location}</span>
                    </div>
                    <span style={{ fontSize:10, color:T.textXsoft }}>
                      {firstTwo.slice(0,1).join('')}{extra > 0 ? ` +${extra+1}` : firstTwo.length > 1 ? ` & ${firstTwo[1]}` : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Add Meeting Modal ─────────────────────────────────────────────────────────
function AddMeetingModal({ onClose }) {
  const [prepToggle, setPrepToggle] = useState(true)
  const labelStyle = { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:T.textSoft, display:'block', marginBottom:6 }
  const inputStyle = { width:'100%', padding:'10px 14px', borderRadius:12, fontSize:13, outline:'none',
    background:T.surfaceMid, border:`1px solid ${T.borderMid}`, color:T.text, fontFamily:T.font }
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(8px)' }}>
      <div style={{ width:'100%', maxWidth:460, borderRadius:24, overflow:'hidden', background:'#0F0D1E', border:`1px solid ${T.borderMid}`, boxShadow:'0 16px 64px rgba(0,0,0,0.6)' }}>
        <div style={{ padding:'20px 24px 16px', borderBottom:`1px solid ${T.border}` }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <p style={{ fontSize:16, fontWeight:800, color:T.text }}>Add meeting</p>
            <button type="button" onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:T.textSoft, padding:4 }}><X size={16} /></button>
          </div>
        </div>
        <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input style={inputStyle} placeholder="Meeting title" />
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ flex:1 }}>
              <label style={labelStyle}>Date</label>
              <input type="date" defaultValue="2026-05-01" style={inputStyle} />
            </div>
            <div style={{ flex:1 }}>
              <label style={labelStyle}>Start</label>
              <input type="time" defaultValue="10:00" style={inputStyle} />
            </div>
            <div style={{ flex:1 }}>
              <label style={labelStyle}>End</label>
              <input type="time" defaultValue="10:30" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Attendees</label>
            <input style={inputStyle} placeholder="Names or emails, comma-separated" />
          </div>
          <div>
            <label style={labelStyle}>Location</label>
            <div style={{ display:'flex', gap:8 }}>
              {['Teams','Zoom','In person'].map(loc => (
                <label key={loc} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10,
                  background:T.surface, border:`1px solid ${T.border}`, cursor:'pointer', fontSize:13, color:T.textMid }}>
                  <input type="radio" name="loc" defaultChecked={loc==='Teams'} style={{ accentColor:T.core }} /> {loc}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:12, background:T.surface, border:`1px solid ${T.border}` }}>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:T.text }}>Let Jarvis prep for this meeting</p>
              <p style={{ fontSize:11, color:T.textSoft, marginTop:2 }}>Auto-fetch deck, notes, and attendee context 30 min before</p>
            </div>
            <div onClick={() => setPrepToggle(v => !v)} style={{ width:44, height:24, borderRadius:99, position:'relative', cursor:'pointer', flexShrink:0,
              background: prepToggle ? T.core : 'rgba(255,255,255,0.15)', transition:'background .2s' }}>
              <div style={{ position:'absolute', top:3, width:18, height:18, borderRadius:'50%', background:'white', transition:'transform .2s',
                transform: prepToggle ? 'translateX(23px)' : 'translateX(3px)' }} />
            </div>
          </div>
        </div>
        <div style={{ padding:'16px 24px', borderTop:`1px solid ${T.border}`, display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button type="button" onClick={onClose} style={{ padding:'10px 20px', borderRadius:12, fontSize:13, fontWeight:600,
            color:T.textSoft, background:T.surface, border:`1px solid ${T.border}`, cursor:'pointer' }}>Cancel</button>
          <button type="button" onClick={onClose} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:12,
            fontSize:13, fontWeight:700, color:'white', background:T.coreGrad, border:'none', cursor:'pointer' }}>
            <Calendar size={14} /> Add to Calendar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Chat Panel ────────────────────────────────────────────────────────────────
const CHAT_DOCS = [
  { name:'QBR-H2-2026.pptx', type:'Presentation', edited:'Yesterday · Priya', Icon:FileText, color:'#1B96FF' },
  { name:'Apr 14 Meeting Notes.docx', type:'Document', edited:'18 days ago · Alex', Icon:FileText, color:'#45C65A' },
  { name:'CloudMetrics DPA - Case #DPA-8821', type:'Salesforce Case', edited:'5 days ago', Icon:Database, color:'#FE9339' },
  { name:'Acme SOW v3 - Redlines.docx', type:'Contract', edited:'Today 09:14 · Legal', Icon:Lock, color:'#BA01FF' },
]
const CHAT_PEOPLE = [
  { name:'Amy Torres', role:'Legal Reviewer', status:'OOO until May 4', avatar:'AT', color:'#FE9339', statusColor:'#FF5D2D' },
  { name:'Maria Chen', role:'Acme Corp — PM', status:'Online', avatar:'MC', color:'#1B96FF', statusColor:'#45C65A' },
  { name:'Raj Mehta', role:'Infra On-call', status:'Available', avatar:'RM', color:'#01C3B3', statusColor:'#45C65A' },
  { name:'Priya Nair', role:'Product Designer', status:'In meeting', avatar:'PN', color:'#BA01FF', statusColor:'#FE9339' },
]
const CHAT_CHANNELS = [
  { name:'#incident-response', unread:14, last:'Raj: Snapshot ready, initiating rollback…' },
  { name:'#acme-deal-room', unread:3, last:'Maria: Redlines approved ✓' },
  { name:'#platform-eng', unread:0, last:'Deploy window confirmed for 2 PM' },
  { name:'#legal-ops', unread:2, last:'DPA filed — awaiting Amy sign-off' },
]

function ChatPanel({ item, scenario, onClose, setCoreState, activeTab, setActiveTab }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    if (scenario && CHAT_SCENARIOS[scenario]) {
      setThinking(true)
      const t = setTimeout(() => { setThinking(false); setMessages(CHAT_SCENARIOS[scenario]); setCoreState('confirming') }, 1200)
      return () => clearTimeout(t)
    } else if (item) {
      setMessages([{ role:'jarvis', text:`I can help with **"${item.headline}"**. What would you like to do?` }])
    }
  }, [scenario, item])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages, thinking])

  const send = () => {
    if (!input.trim()) return
    const txt = input; setInput('')
    setMessages(p => [...p, { role:'user', text:txt }])
    setThinking(true); setCoreState('thinking')
    setTimeout(() => {
      setThinking(false)
      const low = txt.toLowerCase()
      let reply = ''
      if (/\ba\b|assign|draft|escalat|authoris/.test(low)) {
        reply = 'Done ✓  Action executed and logged in the Feed. I\'ll update you if there\'s a response.\n\nAnything else I can handle for you?'
        setCoreState('executing'); setTimeout(() => setCoreState('idle'), 2000)
      } else if (/\bb\b|remind|set|schedule/.test(low)) {
        reply = 'Reminder set for Thursday 9 AM ✓  I\'ll come back with a follow-up prompt.'; setCoreState('idle')
      } else if (/\bc\b|show|details|open|more/.test(low)) {
        reply = 'Opening the full record… Here are the key details:\n\n· Status: In Review\n· SLA: Breached by 2 days\n· Escalation path: CC General Counsel\n· Reviewer ETA: Wednesday\n\nShall I draft the escalation email?'; setCoreState('confirming')
      } else {
        reply = 'Got it — I\'ve noted that. I can draft, remind, or dig deeper. What would help most?'; setCoreState('idle')
      }
      setMessages(p => [...p, { role:'jarvis', text:reply }])
    }, 900)
  }

  const tabs = [
    { id:'chat', label:'Chat', Icon:MessageCircle },
    { id:'docs', label:'Docs', Icon:FileText },
    { id:'people', label:'People', Icon:Users },
    { id:'channels', label:'Channels', Icon:Hash },
  ]

  return (
    <div className="chat-enter" style={{ position:'fixed', right:0, top:0, bottom:0, width:400, display:'flex', flexDirection:'column', zIndex:50,
      background:'#0D0B1E', borderLeft:`1px solid ${T.borderMid}`, boxShadow:'-8px 0 48px rgba(0,0,0,0.5)' }}>
      {/* Header */}
      <div style={{ padding:'14px 16px', borderBottom:`1px solid ${T.border}`, flexShrink:0,
        background:'linear-gradient(135deg,#100D20,#1E1640)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
              background:T.coreGrad, boxShadow:`0 0 12px ${T.coreGlow}` }}>
              <BrainCircuit size={15} color="white" />
            </div>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:T.text, lineHeight:1 }}>Jarvis</p>
              <p style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.35)', marginTop:2 }}>
                {scenario === 'incident' ? '🚨 P1 Active' : 'Negotiation workspace'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', padding:6, borderRadius:8, color:'rgba(255,255,255,0.5)' }}>
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', borderBottom:`1px solid ${T.border}`, flexShrink:0, background:'rgba(255,255,255,0.02)' }}>
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} type="button" onClick={() => setActiveTab(id)}
            style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'10px 4px',
              fontSize:11, fontWeight:700, border:'none', background:'none', cursor:'pointer', position:'relative',
              color: activeTab === id ? T.core : T.textSoft, transition:'color .15s' }}>
            <Icon size={12} />{label}
            {activeTab === id && <div style={{ position:'absolute', bottom:0, left:'15%', right:'15%', height:2, borderRadius:'2px 2px 0 0', background:T.core }} />}
          </button>
        ))}
      </div>

      {/* Context card — only on Chat tab */}
      {activeTab === 'chat' && item && !scenario && (
        <div style={{ margin:'12px 14px 0', padding:'12px 14px', borderRadius:12, flexShrink:0,
          background:'rgba(255,255,255,0.04)', border:`1px solid ${T.borderMid}` }}>
          <p style={{ fontSize:12, fontWeight:700, lineHeight:1.4, color:T.text, marginBottom:8 }}>{item.headline}</p>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <TierPill tier={item.tier} />
            <SourceChip text={item.source} />
          </div>
          {item.evidence && (
            <p style={{ fontFamily:'monospace', fontSize:11, marginTop:8, color:T.textSoft, lineHeight:1.5 }}>
              <span style={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', color:T.textXsoft, display:'block', marginBottom:3 }}>Evidence</span>
              {item.evidence}
            </p>
          )}
        </div>
      )}

      {/* Chat messages */}
      {activeTab === 'chat' && (
        <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
          {messages.map((m, i) => (
            <div key={i} className="chat-enter" style={{ display:'flex', justifyContent: m.role==='user' ? 'flex-end' : 'flex-start', animationDelay:`${i*.05}s` }}>
              {m.role === 'jarvis' && (
                <div style={{ width:24, height:24, borderRadius:'50%', flexShrink:0, marginRight:8, marginTop:2,
                  display:'flex', alignItems:'center', justifyContent:'center', background:T.coreGrad }}>
                  <BrainCircuit size={11} color="white" />
                </div>
              )}
              <div style={{ maxWidth:'86%', padding:'10px 14px', borderRadius:16, fontSize:12.5, lineHeight:1.6,
                ...(m.role==='user'
                  ? { background:T.coreGrad, color:'white' }
                  : { background:'rgba(255,255,255,0.06)', color:T.text, border:`1px solid ${T.border}` }) }}>
                {m.text.split('\n').map((line, li) => {
                  if (!line) return <br key={li} />
                  const parts = line.split(/\*\*(.*?)\*\*/)
                  return <p key={li} style={{ marginTop: li > 0 ? 4 : 0 }}>{parts.map((p, pi) => pi % 2 === 1 ? <strong key={pi}>{p}</strong> : p)}</p>
                })}
              </div>
            </div>
          ))}
          {thinking && (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:24, height:24, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:T.coreGrad }}>
                <BrainCircuit size={11} color="white" />
              </div>
              <div style={{ padding:'10px 14px', borderRadius:16, display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.06)' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:T.core,
                    animation:'breathe .9s ease-in-out infinite', animationDelay:`${i*.18}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      {/* Docs tab */}
      {activeTab === 'docs' && (
        <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
          <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:T.textXsoft, marginBottom:4 }}>Related documents</p>
          {CHAT_DOCS.map((doc, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:12,
              background:T.surface, border:`1px solid ${T.border}`, cursor:'pointer', transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background=T.surfaceMid; e.currentTarget.style.borderColor=T.borderMid }}
              onMouseLeave={e => { e.currentTarget.style.background=T.surface; e.currentTarget.style.borderColor=T.border }}>
              <div style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                background:`${doc.color}18` }}>
                <doc.Icon size={16} color={doc.color} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:12, fontWeight:600, color:T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.name}</p>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:3 }}>
                  <span style={{ fontSize:10, fontWeight:500, padding:'1px 7px', borderRadius:99, background:`${doc.color}18`, color:doc.color }}>{doc.type}</span>
                  <span style={{ fontSize:10, color:T.textXsoft }}>{doc.edited}</span>
                </div>
              </div>
              <ExternalLink size={13} color={T.textXsoft} />
            </div>
          ))}
        </div>
      )}

      {/* People tab */}
      {activeTab === 'people' && (
        <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
          <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:T.textXsoft, marginBottom:4 }}>Related people</p>
          {CHAT_PEOPLE.map((person, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:12,
              background:T.surface, border:`1px solid ${T.border}` }}>
              <div style={{ width:40, height:40, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                background:`${person.color}22`, border:`1.5px solid ${person.color}55` }}>
                <span style={{ fontSize:13, fontWeight:800, color:person.color }}>{person.avatar}</span>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:700, color:T.text }}>{person.name}</p>
                <p style={{ fontSize:11, color:T.textSoft, marginTop:1 }}>{person.role}</p>
                <span style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:4, fontSize:10, fontWeight:600,
                  padding:'2px 8px', borderRadius:99, background:`${person.statusColor}15`, color:person.statusColor }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:person.statusColor }} />
                  {person.status}
                </span>
              </div>
              <button type="button" style={{ padding:'6px 12px', borderRadius:10, fontSize:11, fontWeight:700,
                color:T.core, background:T.coreSoft, border:`1px solid rgba(117,38,227,0.2)`, cursor:'pointer' }}>
                Message
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Channels tab */}
      {activeTab === 'channels' && (
        <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
          <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:T.textXsoft, marginBottom:4 }}>Related channels</p>
          {CHAT_CHANNELS.map((ch, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:12,
              background:T.surface, border:`1px solid ${T.border}`, cursor:'pointer', transition:'all .15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor=T.borderMid}
              onMouseLeave={e => e.currentTarget.style.borderColor=T.border}>
              <div style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:T.coreSoft }}>
                <Hash size={15} color={T.core} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:T.text }}>{ch.name}</p>
                  {ch.unread > 0 && (
                    <span style={{ minWidth:18, height:18, borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center',
                      background:T.core, color:'white', fontSize:10, fontWeight:800, padding:'0 5px' }}>{ch.unread}</span>
                  )}
                </div>
                <p style={{ fontSize:11, color:T.textSoft, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ch.last}</p>
              </div>
              <ChevronRight size={14} color={T.textXsoft} />
            </div>
          ))}
        </div>
      )}

      {/* Whisper input — only on Chat tab */}
      {activeTab === 'chat' && (
        <div style={{ padding:'12px 14px', borderTop:`1px solid ${T.border}`, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:16,
            background:'rgba(255,255,255,0.05)', border:`1px solid ${T.borderMid}` }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder='Try "A", "remind me", "show details"…'
              style={{ flex:1, fontSize:12.5, background:'none', outline:'none', border:'none', color:T.text, fontFamily:T.font }} />
            <button type="button" onClick={send} style={{ background:'none', border:'none', cursor:'pointer', color:T.core, padding:4 }}>
              <Send size={14} />
            </button>
          </div>
          <p style={{ fontSize:10, textAlign:'center', marginTop:6, color:T.textXsoft }}>All actions logged in Feed for traceability</p>
        </div>
      )}
    </div>
  )
}

// ─── Welcome Screen ────────────────────────────────────────────────────────────
function WelcomeScreen({ onLogin }) {
  return (
    <div style={{ height:'100%', overflowY:'auto', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      background:T.appBg, position:'relative', padding:'40px 24px' }}>
      {/* Aurora background blob */}
      <div style={{ position:'absolute', top:'10%', left:'50%', transform:'translateX(-50%)', width:600, height:600,
        borderRadius:'50%', background:'linear-gradient(135deg,#7526E3,#BA01FF,#3A49DA,#056764)',
        backgroundSize:'400% 400%', animation:'aurora 8s ease infinite', filter:'blur(80px)', opacity:.18, pointerEvents:'none' }} />

      {/* Central orb + orbital rings */}
      <div style={{ position:'relative', width:160, height:160, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:32 }} className="float-anim">
        {/* Orbital rings */}
        {[{ r:60, dur:8, delay:0 }, { r:75, dur:12, delay:'-4s' }, { r:90, dur:16, delay:'-8s' }].map((ring, i) => (
          <div key={i} style={{ position:'absolute', width:ring.r*2, height:ring.r*2, borderRadius:'50%',
            border:`1px solid rgba(117,38,227,${0.35 - i*0.08})`, top:'50%', left:'50%', transform:'translate(-50%,-50%)' }}>
            <div style={{ position:'absolute', width:7, height:7, borderRadius:'50%', background:i===0?T.coreBright:i===1?T.blue:T.teal,
              boxShadow:`0 0 10px ${i===0?T.coreBright:i===1?T.blue:T.teal}`,
              top:'50%', left:'50%', marginTop:-3.5, marginLeft:-3.5,
              animation:`orbit ${ring.dur}s linear ${ring.delay} infinite`,
              '--r': `${ring.r}px` }} />
          </div>
        ))}
        {/* Glow backdrop */}
        <div style={{ position:'absolute', width:80, height:80, borderRadius:'50%',
          background:T.coreGrad, filter:'blur(20px)', opacity:.5 }} />
        {/* Core orb */}
        <div style={{ position:'relative', width:80, height:80, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
          background:T.coreGrad, animation:'glowPulse 3s ease-in-out infinite', zIndex:1 }}>
          <BrainCircuit size={36} color="white" />
        </div>
        {/* Ripple rings */}
        <div className="ripple-ring" style={{ position:'absolute', width:80, height:80, borderRadius:'50%', border:`2px solid ${T.core}` }} />
        <div className="ripple-ring" style={{ position:'absolute', width:80, height:80, borderRadius:'50%', border:`2px solid ${T.core}`, animationDelay:'1.2s' }} />
      </div>

      {/* Heading */}
      <h1 style={{ fontSize:40, fontWeight:800, color:T.text, textAlign:'center', lineHeight:1.1, marginBottom:10, letterSpacing:'-0.02em' }}>
        Good morning, Alex.
      </h1>
      <p style={{ fontSize:16, color:T.textMid, textAlign:'center', marginBottom:28, maxWidth:380, lineHeight:1.5 }}>
        Your Jarvis has been watching overnight. Everything's ready.
      </p>

      {/* Stat pills */}
      <div style={{ display:'flex', gap:10, marginBottom:36, flexWrap:'wrap', justifyContent:'center' }}>
        {[
          { label:'8 items compiled', color:T.core, bg:T.coreSoft },
          { label:'3 decisions needed', color:T.amber, bg:T.amberSoft },
          { label:'2 auto-handled', color:T.green, bg:T.greenSoft },
        ].map(({ label, color, bg }) => (
          <div key={label} style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:99,
            background:bg, border:`1px solid ${color}30`, animation:'fadeIn .6s ease both' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:color, boxShadow:`0 0 8px ${color}` }} />
            <span style={{ fontSize:13, fontWeight:600, color }}>{label}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button type="button" onClick={onLogin}
        style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 28px', borderRadius:16, fontSize:15, fontWeight:700,
          color:'white', background:T.coreGrad, border:'none', cursor:'pointer',
          boxShadow:'0 0 32px rgba(117,38,227,0.5)', transition:'all .2s', marginBottom:10 }}
        onMouseEnter={e => e.currentTarget.style.boxShadow='0 0 48px rgba(117,38,227,0.7)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow='0 0 32px rgba(117,38,227,0.5)'}>
        <span style={{ fontSize:18 }}>☁️</span> Connect Salesforce to begin <ArrowRight size={16} />
      </button>
      <p style={{ fontSize:11, color:T.textXsoft, marginBottom:40 }}>OAuth 2.0 secured · No password stored</p>

      {/* Three pillars */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, width:'100%', maxWidth:560, marginBottom:32 }}>
        {[
          { Icon:Eye, color:T.core, title:'Know', desc:'Prioritised brief of what matters — before you ask.' },
          { Icon:Zap, color:T.green, title:'Do', desc:'Completes low-risk tasks so you only handle decisions.' },
          { Icon:Bell, color:T.amber, title:'Anticipate', desc:'Detects what\'s missing, expiring, or about to matter.' },
        ].map(({ Icon, color, title, desc }) => (
          <div key={title} style={{ padding:'16px', borderRadius:16, background:T.surface, border:`1px solid ${T.border}`, textAlign:'center' }}>
            <div style={{ width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px',
              background:`${color}18`, boxShadow:`0 0 12px ${color}22` }}>
              <Icon size={18} color={color} />
            </div>
            <p style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:4 }}>{title}</p>
            <p style={{ fontSize:11, color:T.textSoft, lineHeight:1.5 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Connections grid */}
      <div style={{ width:'100%', maxWidth:560 }}>
        <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:T.textXsoft, marginBottom:10 }}>Connects to your work</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
          {[['Teams · Outlook · OneDrive','Communication & files',T.blue],['Salesforce · Workday','HR, cases & incidents',T.core],['Jira · GitHub','Engineering workflow',T.teal]].map(([name,desc,color]) => (
            <div key={name} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:12, background:T.surface, border:`1px solid ${T.border}` }}>
              <div style={{ width:3, height:32, borderRadius:99, background:color, flexShrink:0 }} />
              <div>
                <p style={{ fontSize:12, fontWeight:600, color:T.text }}>{name}</p>
                <p style={{ fontSize:10, color:T.textSoft, marginTop:2 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Feed View ────────────────────────────────────────────────────────────────
function FeedView() {
  const [expanded, setExpanded] = useState(null)
  return (
    <div style={{ padding:'24px 28px', maxWidth:640, overflowY:'auto', height:'100%' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h2 style={{ fontSize:18, fontWeight:800, color:T.text }}>Jarvis activity log</h2>
          <p style={{ fontSize:12, marginTop:3, color:T.textSoft }}>Every action Jarvis took — fully traceable.</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {['Today','Yesterday'].map(l => (
            <button key={l} type="button" style={{ padding:'6px 14px', fontSize:11, fontWeight:700, borderRadius:10, border:'none', cursor:'pointer',
              background: l==='Today' ? T.coreGrad : T.surfaceMid, color: l==='Today' ? 'white' : T.textSoft }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ position:'relative', paddingLeft:20 }}>
        <div style={{ position:'absolute', left:8, top:8, bottom:8, width:1, borderRadius:99, background:T.border }} />
        {FEED_ITEMS.map((item, i) => (
          <div key={item.id} className="intent-enter" style={{ position:'relative', marginBottom:14, animationDelay:`${i*.08}s` }}>
            <div style={{ position:'absolute', left:-26, top:16, width:12, height:12, borderRadius:'50%', border:'2px solid transparent', zIndex:1,
              background: item.status==='running' ? T.core : T.green,
              boxShadow: item.status==='running' ? `0 0 10px ${T.core}` : 'none' }} />
            <div onClick={() => setExpanded(expanded===item.id ? null : item.id)}
              style={{ borderRadius:14, overflow:'hidden', cursor:'pointer', background:T.surface, border:`1px solid ${T.border}`, transition:'border-color .15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor=T.borderMid}
              onMouseLeave={e => e.currentTarget.style.borderColor=T.border}>
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px' }}>
                <span style={{ fontSize:20, flexShrink:0 }}>{item.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                    <span style={{ fontWeight:700, fontSize:13, color:T.text }}>{item.title}</span>
                    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99,
                      background: item.status==='running' ? T.coreSoft : T.greenSoft,
                      color: item.status==='running' ? T.core : T.green }}>
                      {item.status==='running' ? '● In progress' : '✓ Done'}
                    </span>
                  </div>
                  <p style={{ fontSize:11, color:T.textSoft }}>{item.body}</p>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                  <span style={{ fontSize:10, color:T.textXsoft }}>{item.time}</span>
                  <ChevronDown size={13} color={T.textXsoft} style={{ transform: expanded===item.id ? 'rotate(180deg)' : '', transition:'transform .2s' }} />
                </div>
              </div>
              {expanded===item.id && (
                <div style={{ padding:'0 16px 16px', borderTop:`1px solid ${T.border}` }}>
                  <p style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em', color:T.textXsoft, marginTop:12, marginBottom:10 }}>Steps taken</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {item.steps.map((step, si) => {
                      const done = item.status==='done' || si < item.steps.length-1
                      return (
                        <div key={si} style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:20, height:20, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                            background: done ? T.greenSoft : T.coreSoft }}>
                            {done ? <Check size={10} color={T.green} /> : <Loader2 size={10} color={T.core} style={{ animation:'think .8s ease-in-out infinite' }} />}
                          </div>
                          <p style={{ fontSize:12, color: done ? T.textMid : T.core }}>{step}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Personalise View ─────────────────────────────────────────────────────────
function PersonaliseView({ onNew }) {
  const [conns, setConns] = useState(CONNECTIONS)
  const toggle = id => setConns(p => p.map(c => c.id===id ? {...c, connected:!c.connected} : c))
  return (
    <div style={{ padding:'24px 28px', overflowY:'auto', height:'100%' }}>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontSize:18, fontWeight:800, color:T.text }}>Make Jarvis yours</h2>
        <p style={{ fontSize:12, marginTop:3, color:T.textSoft }}>Set what Jarvis watches, when it acts, and which systems it can touch.</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <p style={{ fontSize:13, fontWeight:700, color:T.text }}>Behaviours <span style={{ fontWeight:400, fontSize:11, color:T.textSoft }}>({BEHAVIOURS.filter(b=>b.enabled).length}/{BEHAVIOURS.length} on)</span></p>
            <button type="button" onClick={onNew} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:10,
              fontSize:11, fontWeight:700, color:'white', background:T.coreGrad, border:'none', cursor:'pointer' }}>
              <Plus size={11} /> New
            </button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {BEHAVIOURS.map(b => (
              <div key={b.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:12,
                background:T.surface, border:`1px solid ${T.border}`, opacity: b.enabled ? 1 : 0.5 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:12, fontWeight:600, color:T.text }}>{b.name}</p>
                  <p style={{ fontSize:10, marginTop:2, color:T.textSoft }}>{b.schedule}</p>
                </div>
                <div style={{ width:40, height:22, borderRadius:99, position:'relative', cursor:'pointer', flexShrink:0,
                  background: b.enabled ? T.core : 'rgba(255,255,255,0.15)', transition:'background .2s' }}>
                  <div style={{ position:'absolute', top:3, width:16, height:16, borderRadius:'50%', background:'white',
                    transition:'transform .2s', transform: b.enabled ? 'translateX(21px)' : 'translateX(3px)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:12 }}>
            Connections <span style={{ fontWeight:400, fontSize:11, color:T.textSoft }}>({conns.filter(c=>c.connected).length}/{conns.length})</span>
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {conns.map(c => (
              <div key={c.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:12,
                background:T.surface, border:`1px solid ${T.border}` }}>
                <span style={{ fontSize:18, flexShrink:0 }}>{c.logo}</span>
                <p style={{ flex:1, fontSize:12, fontWeight:600, color:T.text }}>{c.name}</p>
                <button type="button" onClick={() => toggle(c.id)}
                  style={{ padding:'5px 12px', borderRadius:10, fontSize:11, fontWeight:700, border:'none', cursor:'pointer',
                    ...(c.connected ? { background:T.greenSoft, color:T.green } : { background:T.coreSoft, color:T.core }) }}>
                  {c.connected ? '✓ Connected' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Behaviour Wizard ─────────────────────────────────────────────────────────
function BehaviourWizard({ onClose }) {
  const [step, setStep] = useState(1)
  const [sel, setSel] = useState(null)
  const [ran, setRan] = useState(false)
  const [running, setRunning] = useState(false)
  const run = () => { setRunning(true); setTimeout(() => { setRunning(false); setRan(true) }, 1600) }
  const tName = sel ? TEMPLATES.find(t => t.id===sel)?.name : ''
  const labelS = { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:T.textSoft, display:'block', marginBottom:6 }
  const inputS = { width:'100%', padding:'10px 14px', borderRadius:12, fontSize:13, outline:'none', fontFamily:T.font,
    background:T.surfaceMid, border:`1px solid ${T.borderMid}`, color:T.text }
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(8px)' }}>
      <div style={{ width:'100%', maxWidth:640, maxHeight:'90vh', borderRadius:24, overflow:'hidden', display:'flex', flexDirection:'column',
        background:'#0F0D1E', border:`1px solid ${T.borderMid}`, boxShadow:'0 16px 64px rgba(0,0,0,0.7)' }}>
        <div style={{ padding:'18px 24px', borderBottom:`1px solid ${T.border}`, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:15, fontWeight:800, color:T.core }}>
              {['Choose a template','Behaviour details','Schedule','Test & activate'][step-1]}
            </p>
            <p style={{ fontSize:11, color:T.textSoft, marginTop:2 }}>Step {step} of 4{tName ? ` · ${tName}` : ''}</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ display:'flex', gap:5 }}>
              {[1,2,3,4].map(s => (
                <div key={s} style={{ height:5, borderRadius:99, transition:'all .2s',
                  width: s===step ? 22 : 6,
                  background: s<=step ? T.core : 'rgba(255,255,255,0.15)' }} />
              ))}
            </div>
            <button type="button" onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:T.textSoft, padding:4 }}><X size={15} /></button>
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
          {step===1 && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {TEMPLATES.map(t => (
                <button key={t.id} type="button" onClick={() => setSel(t.id)}
                  style={{ textAlign:'left', padding:'16px', borderRadius:14, border:`1px solid`,
                    borderColor: sel===t.id ? T.core : T.border,
                    background: sel===t.id ? T.coreSoft : T.surface,
                    cursor:'pointer', transition:'all .15s',
                    boxShadow: sel===t.id ? `0 0 0 1px ${T.core}` : 'none' }}>
                  <div style={{ fontSize:22, marginBottom:8 }}>{t.icon}</div>
                  <p style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:4 }}>{t.name}</p>
                  <p style={{ fontSize:11, color:T.textSoft, lineHeight:1.4 }}>{t.desc}</p>
                </button>
              ))}
            </div>
          )}

          {step===2 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[['Name', tName], ['Description', TEMPLATES.find(t=>t.id===sel)?.desc||'']].map(([label, val]) => (
                <div key={label}>
                  <label style={labelS}>{label} *</label>
                  <input defaultValue={val} style={inputS} />
                </div>
              ))}
              <div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                  <label style={labelS}>System prompt *</label>
                  <button type="button" style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700, color:T.core, background:'none', border:'none', cursor:'pointer' }}>
                    <Sparkles size={11} /> Generate with AI
                  </button>
                </div>
                <textarea style={{ ...inputS, height:140, resize:'none', fontFamily:'monospace', fontSize:12 }}
                  defaultValue={`## Trigger\n- User requests a summary or document.\n- User provides keywords or document names.\n\n## Rules\n1. Only access data with explicit permission.\n2. Prioritise by relevance to user's keywords.\n3. Never store or share data externally.`} />
              </div>
              <div>
                <label style={{ ...labelS, marginBottom:8 }}>Required toolkits</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {['outlook','teams','onedrive','workday','salesforce','jira'].map(k => (
                    <label key={k} style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 14px', borderRadius:10, cursor:'pointer',
                      border:`1px solid ${T.border}`, background:T.surface, fontSize:12, color:T.textMid }}>
                      <input type="checkbox" defaultChecked={k==='outlook'||k==='onedrive'} style={{ accentColor:T.core }} />
                      {k}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step===3 && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <p style={{ fontSize:13, color:T.textSoft, marginBottom:6 }}>Choose when Jarvis runs this automatically.</p>
              {[
                { id:'auto', label:'Run automatically', desc:'Jarvis decides when this behaviour is most relevant.' },
                { id:'scheduled', label:'Scheduled', desc:'A specific time — e.g. weekdays at 9 AM.', hasTime:true },
                { id:'ondemand', label:'On demand only', desc:'Only when you explicitly ask.' },
              ].map(opt => (
                <label key={opt.id} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'14px 16px', borderRadius:12, cursor:'pointer',
                  border:`1px solid ${T.border}`, background:T.surface }}>
                  <input type="radio" name="sched" defaultChecked={opt.id==='scheduled'} style={{ marginTop:2, accentColor:T.core }} />
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:T.text }}>{opt.label}</p>
                    <p style={{ fontSize:11, marginTop:3, color:T.textSoft }}>{opt.desc}</p>
                    {opt.hasTime && (
                      <div style={{ display:'flex', gap:8, marginTop:10 }}>
                        <select style={{ border:`1px solid ${T.borderMid}`, borderRadius:10, padding:'7px 12px', fontSize:12, outline:'none', background:T.surfaceMid, color:T.text, fontFamily:T.font }}>
                          <option>Every weekday</option><option>Daily</option><option>Weekly</option>
                        </select>
                        <input type="time" defaultValue="09:00" style={{ border:`1px solid ${T.borderMid}`, borderRadius:10, padding:'7px 12px', fontSize:12, outline:'none', background:T.surfaceMid, color:T.text, fontFamily:T.font }} />
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}

          {step===4 && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div>
                <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:T.textSoft, marginBottom:8 }}>Simulation input</p>
                <textarea style={{ ...inputS, height:110, resize:'none', marginBottom:12 }}
                  defaultValue="My calendar has 3 back-to-back meetings starting in 30 minutes — prepare me." />
                <button type="button" onClick={run}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:12,
                    fontSize:12, fontWeight:700, color:'white', background:T.coreGrad, border:'none', cursor:'pointer' }}>
                  {running ? <Loader2 size={13} style={{ animation:'think .8s ease-in-out infinite' }} /> : <Zap size={13} />}
                  {running ? 'Running…' : 'Run simulation'}
                </button>
              </div>
              <div style={{ borderRadius:14, overflow:'hidden', border:`1px solid ${T.border}` }}>
                <div style={{ padding:'10px 14px', background:T.surfaceMid, borderBottom:`1px solid ${T.border}` }}>
                  <p style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em', color:T.textXsoft }}>Preview conversation</p>
                </div>
                <div style={{ padding:12, height:200, overflowY:'auto', display:'flex', flexDirection:'column', gap:8 }}>
                  {ran ? (<>
                    <div style={{ fontSize:12, padding:'10px 12px', borderRadius:12, background:'rgba(255,255,255,0.05)', color:T.text }}>Hi — I'm your AI work assistant. How can I help?</div>
                    <div style={{ fontSize:12, padding:'10px 12px', borderRadius:12, background:T.coreGrad, color:'white', alignSelf:'flex-end' }}>My calendar has 3 back-to-back meetings starting in 30 minutes — prepare me.</div>
                    <div style={{ fontSize:12, padding:'10px 12px', borderRadius:12, background:'rgba(255,255,255,0.05)', color:T.text }}>Found your 3 meetings: QBR (10:00), Sprint Planning (11:30), and 1:1 with Sarah (13:00). Prep notes and relevant docs pulled for each. Want me to share?</div>
                  </>) : (
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%' }}>
                      <p style={{ fontSize:12, color:T.textXsoft, textAlign:'center' }}>Run simulation to preview.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding:'16px 24px', borderTop:`1px solid ${T.border}`, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          {step > 1
            ? <button type="button" onClick={() => setStep(s=>s-1)} style={{ display:'flex', alignItems:'center', gap:4, fontSize:13, fontWeight:600, color:T.textSoft, background:'none', border:'none', cursor:'pointer' }}>
                <ChevronLeft size={14} /> Back
              </button>
            : <div />}
          <div style={{ display:'flex', gap:8 }}>
            {step===4 && <button type="button" onClick={onClose} style={{ padding:'9px 18px', borderRadius:12, fontSize:12, fontWeight:600,
              color:T.textSoft, background:T.surface, border:`1px solid ${T.border}`, cursor:'pointer' }}>Save draft</button>}
            <button type="button" onClick={() => step===4 ? onClose() : setStep(s=>s+1)}
              disabled={step===1 && !sel}
              style={{ padding:'9px 20px', borderRadius:12, fontSize:13, fontWeight:700, color:'white',
                background: (step===1 && !sel) ? 'rgba(117,38,227,0.3)' : T.coreGrad,
                border:'none', cursor: (step===1 && !sel) ? 'default' : 'pointer', opacity: (step===1 && !sel) ? 0.5 : 1 }}>
              {step===4 ? 'Activate behaviour' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Whisper Bar ──────────────────────────────────────────────────────────────
function WhisperBar({ persona, coreState, setCoreState, onCommand }) {
  const [val, setVal] = useState('')
  const [focused, setFocused] = useState(false)
  const placeholders = {
    employee: '"Prep my 10 AM" · "Draft reply to Acme" · "What needs me today?"',
    manager:  '"Team readiness brief" · "Batch approvals" · "Who is at risk?"',
  }
  const submit = () => {
    if (!val.trim()) return
    setCoreState('thinking')
    setTimeout(() => { onCommand(val); setCoreState('idle'); setVal('') }, 1000)
  }
  return (
    <div style={{ padding:'12px 16px', background:T.appBg, borderTop:`1px solid ${T.border}`, flexShrink:0 }}>
      <div style={{ borderRadius:20, transition:'all .2s',
        boxShadow: focused ? `0 0 0 2px ${T.core}55, 0 0 24px rgba(117,38,227,0.2)` : 'none' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderRadius:20,
          background: focused ? T.surfaceHigh : T.surfaceMid,
          border: `1px solid ${focused ? T.core : T.borderMid}`, transition:'all .2s' }}>
          <div style={{ flexShrink:0, color: coreState==='thinking' ? T.core : T.textXsoft }}>
            {coreState==='thinking' ? <Loader2 size={16} style={{ animation:'think .8s ease-in-out infinite' }} /> : <Sparkles size={16} />}
          </div>
          <input value={val} onChange={e => setVal(e.target.value)}
            onKeyDown={e => e.key==='Enter' && submit()}
            onFocus={() => { setFocused(true); setCoreState('listening') }}
            onBlur={() => { setFocused(false); if(coreState==='listening') setCoreState('idle') }}
            placeholder={placeholders[persona] || placeholders.employee}
            style={{ flex:1, fontSize:13, background:'none', border:'none', outline:'none', color:T.text, fontFamily:T.font }} />
          <button type="button" style={{ padding:6, borderRadius:10, background:'none', border:'none', cursor:'pointer', color:T.textSoft }}>
            <Mic size={15} />
          </button>
          <button type="button" onClick={submit}
            style={{ width:32, height:32, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center',
              color:'white', background:T.coreGrad, border:'none', cursor:'pointer', flexShrink:0, transition:'all .15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity='.85'}
            onMouseLeave={e => e.currentTarget.style.opacity='1'}>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [scene, setScene] = useState('welcome')
  const [tab, setTab] = useState('dashboard')
  const [persona, setPersona] = useState('employee')
  const [coreState, setCoreState] = useState('idle')
  const [chatItem, setChatItem] = useState(null)
  const [chatScenario, setChatScenario] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [notifDismissed, setNotifDismissed] = useState(false)
  const [doneIds, setDoneIds] = useState([])
  const [dismissIds, setDismissIds] = useState([])
  const [showWizard, setShowWizard] = useState(false)
  const [showAddMeeting, setShowAddMeeting] = useState(false)
  const [logging, setLogging] = useState(false)
  const [chatTab, setChatTab] = useState('chat')

  const allIntents = persona === 'manager' ? MANAGER_INTENTS : INTENTS
  const intents = allIntents.filter(i => !dismissIds.includes(i.id))
  const heroIntent = intents.find(i => i.isHero)
  const restIntents = intents.filter(i => !i.isHero)
  const totalActionable = allIntents.length
  const doneCount = doneIds.filter(id => allIntents.find(i => i.id===id)).length

  useEffect(() => {
    if (scene !== 'app' || notifDismissed) return
    const t = setTimeout(() => setShowNotif(true), 4000)
    return () => clearTimeout(t)
  }, [scene, notifDismissed])

  const handleLogin = () => {
    setLogging(true)
    setTimeout(() => { setLogging(false); setScene('app'); setCoreState('thinking'); setTimeout(() => setCoreState('idle'), 2500) }, 1600)
  }

  const openChat = (item, scenario = null) => {
    setChatItem(item); setChatScenario(scenario); setShowChat(true); setChatTab('chat'); setCoreState('confirming')
  }

  const handleAct = (intent) => openChat(intent, intent.chatScenario || null)
  const handleDone = (id) => { setDoneIds(p => [...p, id]); setTimeout(() => setDismissIds(p => [...p, id]), 400) }
  const handleDismiss = (id) => setDismissIds(p => [...p, id])
  const handleNotifAct = () => { setShowNotif(false); setNotifDismissed(true); openChat(null, 'incident') }
  const handleEventClick = (ev) => {
    openChat({
      headline: ev.title, tier:'L2', source: ev.location,
      evidence:`${ev.time}–${ev.end} · ${ev.attendees.join(', ')}`,
      why:'Jarvis can pull prep notes, attendee context, and related docs for this meeting.',
    }, null)
  }

  const navItems = [
    { id:'dashboard', label:'Dashboard', Icon:LayoutDashboard },
    { id:'feed', label:'Feed', Icon:History },
    { id:'personalise', label:'Personalise', Icon:Sliders },
  ]
  const railIcons = [Activity, MessageSquare, Users, Calendar, LayoutDashboard]

  if (logging) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg,#0D0B1A,#1C1640)', fontFamily:T.font }}>
      <style>{CSS}</style>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20 }}>
        <div style={{ position:'relative', width:72, height:72 }}>
          <div style={{ width:72, height:72, borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center',
            background:T.coreGrad, animation:'glowPulse 2s ease-in-out infinite' }}>
            <BrainCircuit size={32} color="white" style={{ animation:'think .8s ease-in-out infinite' }} />
          </div>
          <div className="ripple-ring" style={{ position:'absolute', inset:0, borderRadius:20, border:`2px solid ${T.core}` }} />
        </div>
        <p style={{ color:T.text, fontWeight:600, fontSize:15 }}>Connecting to Salesforce…</p>
        <p style={{ fontSize:12, color:T.textXsoft }}>Pulling your brief</p>
      </div>
    </div>
  )

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:T.appBg, fontFamily:T.font }}>
      <style>{CSS}</style>

      {/* Left rail */}
      <div style={{ width:56, display:'flex', flexDirection:'column', alignItems:'center', padding:'12px 0', gap:4, flexShrink:0, background:T.rail }}>
        {railIcons.map((Icon, i) => (
          <button key={i} type="button" style={{ width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center',
            background:'none', border:'none', cursor:'pointer', transition:'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background='none'}>
            <Icon size={19} color="rgba(255,255,255,0.4)" />
          </button>
        ))}
        <div style={{ flex:1 }} />
        {/* Active Jarvis rail icon */}
        <div style={{ position:'relative' }}>
          <div style={{ width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center',
            background:T.coreGrad, boxShadow:`0 0 16px ${T.coreGlow}` }}>
            <BrainCircuit size={18} color="white" />
          </div>
          <div style={{ position:'absolute', left:-1, top:'25%', width:3, height:'50%', borderRadius:'0 3px 3px 0', background:T.core }} />
        </div>
        <div style={{ height:8 }} />
        <button type="button" style={{ width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center',
          background:'none', border:'none', cursor:'pointer' }}>
          <Settings size={17} color="rgba(255,255,255,0.4)" />
        </button>
        <div style={{ width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
          background:'#FF7043', marginBottom:4 }}>
          <span style={{ fontSize:13, fontWeight:800, color:'white' }}>A</span>
        </div>
      </div>

      {/* Main panel */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>

        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'center', gap:16, padding:'0 16px', height:52, flexShrink:0,
          background:T.topBar, borderBottom:`1px solid ${T.border}` }}>
          <NeuralCore state={coreState} onClick={() => setCoreState('idle')} />
          <div style={{ width:1, height:24, background:T.border, flexShrink:0 }} />
          <nav style={{ display:'flex' }}>
            {navItems.map(({ id, label, Icon }) => (
              <button key={id} type="button" onClick={() => { setTab(id); if(scene!=='app') setScene('app') }}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'0 12px', height:52, fontSize:13, fontWeight:600,
                  background:'none', border:'none', cursor:'pointer', position:'relative',
                  color: tab===id && scene==='app' ? T.core : T.textSoft, transition:'color .15s' }}>
                <Icon size={14} />{label}
                {tab===id && scene==='app' && (
                  <div style={{ position:'absolute', bottom:0, left:8, right:8, height:2, borderRadius:'2px 2px 0 0', background:T.core }} />
                )}
              </button>
            ))}
          </nav>
          <div style={{ flex:1 }} />

          {scene==='app' && (
            <div style={{ display:'flex', alignItems:'center', borderRadius:12, overflow:'hidden', border:`1px solid ${T.borderMid}` }}>
              {[['employee','Employee'],['manager','Manager']].map(([id, label]) => (
                <button key={id} type="button" onClick={() => setPersona(id)}
                  style={{ padding:'6px 14px', fontSize:11, fontWeight:700, border:'none', cursor:'pointer', transition:'all .15s',
                    background: persona===id ? T.core : 'transparent', color: persona===id ? 'white' : T.textSoft }}>
                  {label}
                </button>
              ))}
            </div>
          )}

          <button type="button" onClick={() => setShowNotif(v=>!v)}
            style={{ position:'relative', padding:8, borderRadius:10, background:'none', border:'none', cursor:'pointer', transition:'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background=T.surfaceMid}
            onMouseLeave={e => e.currentTarget.style.background='none'}>
            <Bell size={16} color={T.textSoft} />
            {!notifDismissed && showNotif && (
              <span style={{ position:'absolute', top:6, right:6, width:7, height:7, borderRadius:'50%', background:T.red, boxShadow:`0 0 6px ${T.red}` }} />
            )}
          </button>

          {scene==='app' && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', borderRadius:10,
              background:T.surfaceMid, border:`1px solid ${T.border}` }}>
              <div style={{ width:20, height:20, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                background:T.core, flexShrink:0 }}>
                <span style={{ fontSize:9, fontWeight:800, color:'white' }}>O</span>
              </div>
              <div style={{ lineHeight:1 }}>
                <p style={{ fontSize:11, fontWeight:700, color:T.text }}>OrgFarm EPIC</p>
                <p style={{ fontSize:9, color:T.textXsoft }}>salesforce.com</p>
              </div>
            </div>
          )}
        </div>

        {/* Proactive alert */}
        {showNotif && !notifDismissed && (
          <div style={{ position:'absolute', top:60, right:16, zIndex:100, width:320, borderRadius:20, overflow:'hidden',
            background:'#180C0C', border:`1px solid rgba(255,93,45,0.35)`, boxShadow:'0 8px 32px rgba(255,93,45,0.2)', animation:'slideUp .25s ease-out' }}>
            <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between',
              background:'rgba(255,93,45,0.1)', borderBottom:`1px solid rgba(255,93,45,0.2)` }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <AlertTriangle size={14} color={T.red} />
                <span style={{ fontWeight:800, fontSize:12, textTransform:'uppercase', letterSpacing:'0.08em', color:T.red }}>Proactive Alert</span>
              </div>
              <button type="button" onClick={() => { setShowNotif(false); setNotifDismissed(true) }}
                style={{ background:'none', border:'none', cursor:'pointer', color:T.red }}><X size={13} /></button>
            </div>
            <div style={{ padding:'14px 16px' }}>
              <p style={{ fontWeight:700, fontSize:13, color:T.text, marginBottom:6 }}>🚨 P1 Incident: Auth Service Down</p>
              <p style={{ fontSize:12, lineHeight:1.6, color:T.textSoft, marginBottom:12 }}>INC-9942 · EU-West-1 · 503s on /v1/auth · Incident owner unassigned · 3 customers impacted</p>
              <div style={{ display:'flex', gap:8 }}>
                <button type="button" onClick={handleNotifAct}
                  style={{ flex:1, padding:'9px 0', borderRadius:12, fontSize:12, fontWeight:700, color:'white',
                    background:T.red, border:'none', cursor:'pointer' }}>View & Act →</button>
                <button type="button" onClick={() => { setShowNotif(false); setNotifDismissed(true) }}
                  style={{ padding:'9px 14px', borderRadius:12, fontSize:12, fontWeight:600, color:T.textSoft,
                    background:T.surfaceMid, border:`1px solid ${T.border}`, cursor:'pointer' }}>Dismiss</button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          {scene==='welcome' && <WelcomeScreen onLogin={handleLogin} />}

          {scene==='app' && tab==='dashboard' && (
            <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
              {/* Left: intent list */}
              <div style={{ flex:1, overflowY:'auto', padding:'20px 20px 120px' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, marginBottom:3, color:T.textXsoft }}>Thursday · May 1</p>
                    <h1 style={{ fontSize:22, fontWeight:800, lineHeight:1.2, color:T.text }}>
                      {persona==='manager' ? 'Your team needs 3 things.' : 'Jarvis has your brief ready.'}
                    </h1>
                    <p style={{ fontSize:13, marginTop:5, color:T.textSoft }}>
                      {persona==='manager'
                        ? "I watched overnight — here's what I flagged for you."
                        : `I compiled ${intents.length} items from Salesforce, Outlook & Workday.`}
                    </p>
                  </div>
                  <DayArc done={doneCount} total={totalActionable} />
                </div>

                {heroIntent && (
                  <HeroCard intent={heroIntent} onAct={handleAct} onDone={handleDone} isDone={doneIds.includes(heroIntent.id)} />
                )}

                {restIntents.map((intent, i) => (
                  <IntentCard key={intent.id} intent={intent} idx={i}
                    onAct={handleAct} onDone={handleDone} onDismiss={handleDismiss}
                    isDone={doneIds.includes(intent.id)} />
                ))}

                {/* Overnight insight */}
                <div style={{ marginTop:16, padding:'16px 18px', borderRadius:18,
                  background:'linear-gradient(135deg,rgba(117,38,227,0.1),rgba(27,150,255,0.08))',
                  border:`1px solid rgba(117,38,227,0.2)` }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                    <div style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                      background:T.coreGrad, boxShadow:`0 0 12px ${T.coreGlow}` }}>
                      <Sparkles size={15} color="white" />
                    </div>
                    <div>
                      <p style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', color:T.core, marginBottom:5 }}>Jarvis overnight insight</p>
                      <p style={{ fontSize:13, fontWeight:600, lineHeight:1.5, color:T.text, marginBottom:4 }}>
                        {persona==='manager'
                          ? "Your team's sprint velocity is 12% above target — but Liam's hours are masking a dependency risk on the Auth refactor."
                          : "Your Acme SOW response time is 40% faster than your last 3 deals — you're closing faster when Legal is pre-briefed."}
                      </p>
                      <p style={{ fontSize:11, color:T.textSoft }}>
                        {persona==='manager' ? 'Sprint 16 · Jira velocity data · Liam Davis hours' : 'Outlook thread history · 4 recent SOW cycles'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Timeline */}
              <TimelinePanel onEventClick={handleEventClick} onAddMeeting={() => setShowAddMeeting(true)} />
            </div>
          )}

          {scene==='app' && tab==='feed' && <FeedView />}
          {scene==='app' && tab==='personalise' && <PersonaliseView onNew={() => setShowWizard(true)} />}
        </div>

        {/* Whisper bar */}
        {scene==='app' && tab==='dashboard' && (
          <WhisperBar persona={persona} coreState={coreState} setCoreState={setCoreState}
            onCommand={(cmd) => {
              const l = cmd.toLowerCase()
              if (l.includes('manager')||l.includes('team')) setPersona('manager')
              else if (l.includes('employee')||l.includes('my day')) setPersona('employee')
            }} />
        )}
      </div>

      {/* Sidebar chat */}
      {showChat && (
        <ChatPanel item={chatItem} scenario={chatScenario} setCoreState={setCoreState}
          activeTab={chatTab} setActiveTab={setChatTab}
          onClose={() => { setShowChat(false); setChatItem(null); setChatScenario(null); setCoreState('idle') }} />
      )}

      {/* Modals */}
      {showWizard && <BehaviourWizard onClose={() => setShowWizard(false)} />}
      {showAddMeeting && <AddMeetingModal onClose={() => setShowAddMeeting(false)} />}
    </div>
  )
}
