# Index

# \[Product Draft\] Employee’s Personal AI Assistant (aka Jarvis)

| Author | Deval |
| :---- | :---- |
| Reviewer(s) | Bikram, Sherin, Alex, Eshwar, Ramalingam |
| Last updated | 22nd April, 2026 |

**Navigation & Order of reading**  
Use Document Tabs on the left pane to navigate

**Sequence of reading \- sections:**

1. [Product Strategy](#product-strategy:-salesforce-employee’s-personal-ai-assistant-\(aka-jarvis\))  
2. [MVP Requirements]()  
3. [Market Intelligence & Competition benchmarking report]() \- Optional read

Important Jarvis resources

* [POC demo](https://drive.google.com/file/d/1ueWbqtyMgMHw6jTcJwiP8fJERMaeUoWL/view?usp=drivesdk)  
* [Architecture overview](https://docs.google.com/presentation/d/1v2Ftatcn3ZVHDZRZSJvXjf1zQJfHlbkjocnUM6VrU_o/edit?slide=id.p#slide=id.p)  
* [Eng Epics and stories sheet](https://docs.google.com/spreadsheets/d/18c41A7KvOb4-p_TDyRMuOwW7ldiumqlOPsyBwa_9E_I/edit?gid=0#gid=0)  
* [HLD](https://docs.google.com/document/d/1bqBHEGxuJEBHrS9ffMpjs5ERQ8lxWY75wQIYSUx17d0/edit?tab=t.0#heading=h.tnnwx9qumjus)  
* [Lucid link](https://lucid.app/lucidchart/5be83393-ca2c-457d-8686-4b8dd36c9aa7/edit?invitationId=inv_c4a5fdc7-d353-4430-9d68-8e998a14a014&page=0_0#)

Imp other resources

- Slackbot capabilities: [https://salesforce.vidyard.com/watch/zmnPDVUJjNDyar956rM7st](https://salesforce.vidyard.com/watch/zmnPDVUJjNDyar956rM7st) 

Imp Discussions

- Inputs from Alex:  
  - [Jarvis 264 MVP scope alignment - 2026/04/28 21:30 IST - Notes by Gemini](https://docs.google.com/document/d/1f64b7xYToMDrjcKqu2Pz9CzHVeVxW-Y-q6Y3OSFLoYE/edit?tab=t.jcsdvt4r3g9a)  
  - Julian Hoenig meeting notes re: **Personalized AI Agent**:  
    - \- Build a personalized agent to meet user needs  
    - \- User can configure their personalized Agent: read, write, or what guardrails..  
    - \- top 10 questions and then configure the bot  
    - \- Synthesize user behavior by leveraging personalized agent interactions  
    - \- List the actions and approvals the personalized Agent should perform.  
    - \- Have the agent tell users everything it can do.. Give a wide range of actions and tasks.. for example, agent should tell users what it can do explicitly  
- [Jarvis MVP 264 Scope - 2026/04/23 10:33 IST - Notes by Gemini](https://docs.google.com/document/d/1iibAKP2Cx4nRdDM8an_GSSZertCPq3mjtU6gqUAjbXI/edit?tab=t.1gf48wxqkk3f)  
- [Jarvis MVP Scope part 2 discussion - 2026/04/24 11:00 IST - Notes by Gemini](https://docs.google.com/document/d/1jfDw-121_K2WEpeOui1gf3W9Jq3Osb78RO5pFcWp4A0/edit?tab=t.n5inffmzddc5)

# Product Strategy

## **Product Strategy: Salesforce Employee’s Personal AI Assistant (aka Jarvis)** {#product-strategy:-salesforce-employee’s-personal-ai-assistant-(aka-jarvis)}

## **1\. Product opportunity**

While the employee work is fragmented across collaboration tools, HR systems, IT systems, calendars, documents, approvals, and enterprise apps; with the Rise of Agentic AI, the "helpful chatbot" is getting replaced by **"Superagents"** and **"Employee Digital Twins."** These systems no longer just answer questions; they  orchestrate complex workflows, simulate organizational changes, and act as autonomous digital co-workers. Leading enterprises will be merging HR and digital labor budgets into a single "Office of the Workforce."

The opportunity is strongest where Salesforce can combine:

* employee service workflows,  
* omnichannel engagement,  
* enterprise context,  
* and action-taking AI.

## **2\. Problem to solve**

Employees navigate disconnected systems for simple and recurring needs.

The core problems are:

* work is spread across too many surfaces and systems  
* employees must manually navigate HR and service workflows for simple tasks  
* current assistants are mostly reactive and answer-focused  
* notifications create more work instead of reducing it  
* managers spend too much time on repetitive approvals and coordination  
* employee moments such as onboarding, leave, profile changes, and transitions span too many disconnected teams and tools

The highest-priority JTBDs ([link for detailed JTBDs](#list-of-all-jtbds))  already make this clear: employees need help to **start the day with clarity, complete routine admin without portal-hopping, get proactive help, and let the system handle low-risk repetitive work**.

The Jarvis proof of concept ([demo link](https://drive.google.com/file/d/1ueWbqtyMgMHw6jTcJwiP8fJERMaeUoWL/view)) also validates the intended product direction: summaries, follow-up items, action-taking, automated incident alerts, calendar and email actions, and skill-based automation

## **3\. Business value**

Reduce friction, lower service cost, improve employee and manager effectiveness, and establish Salesforce as the operating layer for employee work**.**

### **A. Productivity gain**

A personal assistant reduces context switching and helps employees and managers spend less time searching, navigating, and coordinating. Jarvis is already envisioned to summarize, prioritize, and act across systems.

### **B. Employee service cost reduction**

By completing common HR and employee-service tasks conversationally, the assistant can reduce repetitive demand on HR and service teams and improve the quality of requests that do require human handling. The internal use cases emphasize exactly this: routine admin completion, proactive help, and low-risk autonomy.

### **C. Better employee experience**

A proactive assistant in Slack, Teams, portal, mobile, and voice is materially better than another static portal. The internal “best in class” view explicitly prioritizes in-the-flow-of-work surfaces over standalone portals.

### **D. Better manager effectiveness**

Managers can focus on exceptions and team readiness instead of manual follow-up and repetitive approvals. This is one of the clearest high-value manager JTBDs in the internal use-case stack.

### **E. Strategic platform value**

If Salesforce owns the employee action layer, it can expand from HR Service into broader Employee Service and cross-functional employee workflows over time. This aligns with the Jarvis architecture vision of deep integration across multiple enterprise domains.

## **4\. User value**

**One assistant that brings clarity, completes work, and proactively keeps employees on track. Jarvis helps me know what matters, do what matters, and avoid missing what matters.**

That user value breaks into three parts:

### **A. Know**

Give me a prioritized view of my day, pending approvals, unresolved items, deadlines, and follow-up actions. This is already present in the Jarvis proof of concept dashboard.

### **B. Do**

Let me complete routine HR and employee-service tasks in natural language without navigating multiple tools.

### **C. Anticipate**

Tell me what is missing, blocked, expiring, overdue, or likely to matter next, and either suggest the action or take it within guardrails.

Sample use cases:

* start my day with clarity  
* complete routine admin without portal-hopping  
* get help before I ask  
* let the system do low-risk work  
* take action directly from notifications

## **5\. Adoption strategy**

Drive weekly habits through a daily brief, repeated utility, in-channel delivery, and trusted action-taking.

| Strategy | Description |
| ----- | ----- |
| Utility first | Focus on solving repeated, visible, high-frequency problems (e.g., daily prioritization, approvals, PTO/payroll help). |
| In the flow of work | Ensure the assistant is accessible where employees already work (e.g., Slack, Teams, mobile, etc). |
| Trust and control | Be explicit about the assistant's capabilities and make it configurable regarding what it can read, write, approve, and automate. |
| Daily entry point | Use a **daily brief** as the strongest adoption hook to create repeat behavior. |
| Action, not just answers | Ensure the assistant can complete tasks, as assistants that only answer questions will see an adoption plateau. |

##  6\. Product strategic positioning to win

We should **NOT** position this product primarily as:

* a generic copilot  
* a chatbot  
* or a digital twin platform

The stronger position is: **The personal employee action layer for the enterprise**

For enterprises that want to reduce employee friction and modernize employee service, Salesforce provides a trusted personal AI assistant for every employee that proactively surfaces what matters and completes work across HR, collaboration, and enterprise systems wherever employees already work**.**

## Strategic differentiation

Salesforce can win by combining:

* employee service workflows  
* omnichannel employee engagement  
* governed action-taking  
* personalization and guardrails  
* and enterprise context across systems

## **7\. Jobs To Be Done & use cases to focus on**

| Persona | JTBD | Pain Points Today | User Story | Systems Involved | Proactive / Autonomous Behavior | Human Involvement |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Employee | Start my day with clarity | Tasks, approvals, meetings, docs, and service items are scattered across tools | As an employee, I want my assistant to generate a daily prioritized brief of what I need to do, what is blocked, and what it can do for me, so I can start work with clarity and less context switching | Mail, Calendar, Drive, Slack/Teams, Salesforce HR/IT, external HRISEmails, slack/teams messages..  | Summarizes today’s meetings, pending approvals, expiring tasks, unresolved HR/IT items, needed docs | Human only reviews or changes priority |
| Employee | Complete routine admin without portal-hopping | Employees must manually navigate disconnected HR/IT systems for simple tasks | As an employee, I want to ask for PTO, payroll info, policy help, profile updates, or device help in natural language, so my assistant completes the work without making me visit multiple tools | Salesforce HR, Salesforce ITSM, Workday/HRIS, knowledge, email | Auto-fills forms, checks entitlements, submits requests, updates status | Human confirms only when needed |
| Employee | Get help before I ask | Existing assistants are reactive and only respond after the employee notices the issue | As an employee, I want my assistant to detect upcoming deadlines, risks, and missing steps and proactively tell me what to do or do it for me, so I don’t miss critical actions | Calendar, Mail, Salesforce cases/requests, learning systems, HRIS | Detects expiring certifications, missing docs, overdue approvals, unresolved service tasks; nudges or acts | Human needed for exceptions or approvals |
| Employee | Let the system do low-risk work for me | Repetitive actions consume time even when the desired outcome is obvious | As an employee, I want to define my assistant’s preferences and action boundaries, so it can autonomously handle low-risk work like scheduling, reminders, follow-ups, and common HR/IT requests | Calendar, Mail, Drive, Salesforce HR/IT, Slack/Teams | Negotiates meeting slots, sends follow-ups, gathers docs, opens/updates requests, tracks completion | Human defines guardrails once; intervenes only if confidence/risk is low |
| Employee | Handle a life event or status change end to end | Leave, relocation, role change, benefits, payroll, and access changes span too many teams and systems | As an employee, I want my assistant to coordinate a multi-step life event workflow across HR and IT, so I only provide inputs where truly required | Salesforce HR, Salesforce IT, HRIS, payroll, identity, drive, email | Builds plan, sequences actions, collects documents, routes approvals, updates stakeholders | Human provides missing information / approvals |
| Manager | Know my team’s readiness and risks | Managers lack one view of skill gaps, deadlines, leave, cases, onboarding gaps, and approvals | As a manager, I want a proactive team-readiness brief, so I can see who is blocked, at risk, or behind and take action early | Salesforce HR, learning systems, Salesforce IT, HRIS, Slack/Teams | Identifies at-risk employees, missing skills, pending approvals, readiness gaps; drafts nudges and assignments | Human approves manager actions |
| Manager | Approve only what matters | Managers waste time on repetitive low-value approvals and status checking | As a manager, I want my assistant to batch low-risk approvals and surface only exceptions with context, so I can make faster, better decisions | Salesforce HR, Salesforce ITSM, learning platforms, budget/policy systems | Auto-routes routine items, summarizes risk, suggests recommended action | Human approves exceptions and policy-sensitive items |
| Employee | Let my assistant coordinate my schedule and obligations | Employees manually reconcile meetings, deadlines, service work, and documents | As an employee, I want my assistant to coordinate meetings, prepare me with documents, and reschedule low-priority conflicts automatically, so I can focus on high-value work | Calendar, Mail, Drive, Slack, Salesforce requests/tasks | Finds documents, drafts agenda, negotiates meeting slots, reschedules within preferences | Human only for sensitive or VIP changes |
| Employee | Personalize what my assistant does automatically | “Autonomy” fails if the system doesn’t understand user preferences or action boundaries | As an employee, I want to configure my assistant’s skills, priorities, and limits, so it knows what it can do automatically on my behalf | Preference profile, calendar, mail, Salesforce HR/IT, external systems | Learns patterns, applies user-configured skills/preferences, auto-executes repeatable tasks | Human sets rules and override options |

Pointers to consider:

How can we make the setup easy and configurable for a) code friendly and b)non-code friendly admin?

How does this tie into the Salesforce Headless announcement?

## Appendix

### List of all JTBDs  {#list-of-all-jtbds}

## 

| Persona | JTBD | Pain Points Today | User Story | Systems Involved | Proactive / Autonomous Behavior | Human Involvement |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Employee | Start my day with clarity | Tasks, approvals, meetings, docs, and service items are scattered across tools | As an employee, I want my assistant to generate a daily prioritized brief of what I need to do, what is blocked, and what it can do for me, so I can start work with clarity and less context switching | Mail, Calendar, Drive, Slack/Teams, Salesforce HR/IT, external HRISEmails, slack/teams messages..  | Summarizes today’s meetings, pending approvals, expiring tasks, unresolved HR/IT items, needed docs | Human only reviews or changes priority |
| Employee | Complete routine admin without portal-hopping | Employees must manually navigate disconnected HR/IT systems for simple tasks | As an employee, I want to ask for PTO, payroll info, policy help, profile updates, or device help in natural language, so my assistant completes the work without making me visit multiple tools | Salesforce HR, Salesforce ITSM, Workday/HRIS, knowledge, email | Auto-fills forms, checks entitlements, submits requests, updates status | Human confirms only when needed |
| Employee | Get help before I ask | Existing assistants are reactive and only respond after the employee notices the issue | As an employee, I want my assistant to detect upcoming deadlines, risks, and missing steps and proactively tell me what to do or do it for me, so I don’t miss critical actions | Calendar, Mail, Salesforce cases/requests, learning systems, HRIS | Detects expiring certifications, missing docs, overdue approvals, unresolved service tasks; nudges or acts | Human needed for exceptions or approvals |
| Employee | Let the system do low-risk work for me | Repetitive actions consume time even when the desired outcome is obvious | As an employee, I want to define my assistant’s preferences and action boundaries, so it can autonomously handle low-risk work like scheduling, reminders, follow-ups, and common HR/IT requests | Calendar, Mail, Drive, Salesforce HR/IT, Slack/Teams | Negotiates meeting slots, sends follow-ups, gathers docs, opens/updates requests, tracks completion | Human defines guardrails once; intervenes only if confidence/risk is low |
| Employee | Handle a life event or status change end to end | Leave, relocation, role change, benefits, payroll, and access changes span too many teams and systems | As an employee, I want my assistant to coordinate a multi-step life event workflow across HR and IT, so I only provide inputs where truly required | Salesforce HR, Salesforce IT, HRIS, payroll, identity, drive, email | Builds plan, sequences actions, collects documents, routes approvals, updates stakeholders | Human provides missing information / approvals |
| Employee | Use one conversation for both HR and IT | HR and IT issues often happen together, but employees must open separate workflows | As an employee, I want one assistant that can handle both HR and IT service needs together, so onboarding, leave, transfer, and offboarding feel like one joined-up experience | Salesforce HR, Salesforce ITSM, identity, device mgmt, external HR/IT tools | Creates combined workflow for access, device, payroll, learning, manager tasks | Human only for decisions or exceptions |
| New Hire / Employee | Get onboarded without chasing people | Onboarding requires repeated follow-up across managers, HR, IT, and documents | As a new hire, I want my assistant to guide and track my onboarding end to end, so it drives the process and I always know the next step | Email, Calendar, Drive, Salesforce HR, Salesforce ITSM, HRIS, identity | Books orientation, checks equipment status, gathers forms, reminds manager, tracks blockers | Human provides required documents and chooses among options |
| Departing Employee | Exit cleanly with minimal confusion | Offboarding spans access, assets, payroll, documents, and active work handoff | As an employee leaving the company, I want my assistant to orchestrate HR \+ IT offboarding tasks, so I know what I need to do and the system handles the rest | Salesforce HR, Salesforce ITSM, identity access, asset systems, payroll, drive, email | Generates checklist, schedules return tasks, initiates deprovisioning, drafts transition reminders | Human approves final steps and completes mandated tasks |
| Manager | Know my team’s readiness and risks | Managers lack one view of skill gaps, deadlines, leave, cases, onboarding gaps, and approvals | As a manager, I want a proactive team-readiness brief, so I can see who is blocked, at risk, or behind and take action early | Salesforce HR, learning systems, Salesforce IT, HRIS, Slack/Teams | Identifies at-risk employees, missing skills, pending approvals, readiness gaps; drafts nudges and assignments | Human approves manager actions |
| Manager | Approve only what matters | Managers waste time on repetitive low-value approvals and status checking | As a manager, I want my assistant to batch low-risk approvals and surface only exceptions with context, so I can make faster, better decisions | Salesforce HR, Salesforce ITSM, learning platforms, budget/policy systems | Auto-routes routine items, summarizes risk, suggests recommended action | Human approves exceptions and policy-sensitive items |
| Manager | Coordinate onboarding/offboarding for my team | Managers manually chase HR, IT, and the employee during transitions | As a manager, I want the assistant to manage my team member’s onboarding or offboarding plan and tell me only where my action is required, so transitions happen on time | Mail, Calendar, Drive, Salesforce HR/IT, identity, external systems | Sends reminders, tracks dependencies, drafts welcome/transition messages, flags blockers | Human handles final approvals and judgment calls |
| IT Persona / IT Agent / Service Desk | Resolve employee issues with full context | IT agents often lack HR context, calendar urgency, or employee priority data | As an IT support agent, I want the employee assistant to gather relevant context before a case reaches me, so I can resolve issues faster and avoid back-and-forth | Salesforce ITSM, device/identity tools, email, calendar, HR employee context | Collects logs/details, infers urgency from calendar, checks employee status/location/role, pre-populates request | Human resolves technical exceptions |
| IT Persona / Identity Admin | Automate identity and access changes safely | Access changes are repetitive, policy-heavy, and frequently linked to HR events | As an IT admin, I want the assistant to automatically trigger access changes when HR events happen, so provisioning and deprovisioning are faster and safer | Salesforce HR, Salesforce ITSM, identity systems, HRIS | Detects hire/transfer/exit event, launches access workflows, chases approvals, confirms completion | Human approves privileged access or exceptions |
| Employee \+ IT \+ HR | Fix a broken workday across functions | Employees often have compound problems: payroll issue, access issue, missing device, and manager dependency all at once | As an employee, I want one assistant to diagnose and orchestrate multi-domain issues, so I don’t need to understand which team owns what | Mail, Calendar, Drive, Salesforce HR, Salesforce ITSM, HRIS, identity, external vendors | Creates a multi-step plan, routes subtasks to HR/IT, keeps one status thread for employee | Human only when missing input or approval needed |
| Employee | Manage learning and growth in the flow of work | Learning systems are disconnected from manager context, calendar, and team goals | As an employee, I want my assistant to recommend learning actions, enroll me, schedule time, and update my manager, so growth happens inside my flow of work | Learning platform, Salesforce HR, Calendar, Slack/Teams, manager context | Proactively suggests courses, books focus time, shares completion updates, asks for approval if budget or entitlement is needed | Human approves optional/high-cost learning |
| Manager | Develop my team, not just monitor them | Managers know there are skill gaps but lack time to diagnose and act | As a manager, I want my assistant to identify skill gaps, recommend development actions, and launch those actions for my team, so team readiness improves with less admin overhead | Learning platform, Salesforce HR, team graph, Slack/Teams | Suggests assignments, requests budget approval, schedules check-ins, nudges employees | Human approves developmental choices and spend |
| Employee | Let my assistant coordinate my schedule and obligations | Employees manually reconcile meetings, deadlines, service work, and documents | As an employee, I want my assistant to coordinate meetings, prepare me with documents, and reschedule low-priority conflicts automatically, so I can focus on high-value work | Calendar, Mail, Drive, Slack, Salesforce requests/tasks | Finds documents, drafts agenda, negotiates meeting slots, reschedules within preferences | Human only for sensitive or VIP changes |
| Employee | Keep all my work artifacts in sync | Docs, cases, approvals, and discussions get disconnected across channels | As an employee, I want my assistant to pull together the right docs, emails, requests, and prior conversations when a task starts, so I don’t lose time reconstructing context | Drive, Mail, Slack/Teams, Salesforce HR/IT, external systems | Automatically assembles context bundle and suggested next steps | Human reviews and acts if needed |
| Manager / Employee | Take action directly from notifications | Notifications are passive and create more work instead of reducing it | As a user, I want proactive notifications that include context and buttons to approve, decline, acknowledge, or launch the next step, so I can act instantly where I already work | Slack/Teams, Salesforce flows, HR/IT cases/requests | Pushes actionable notifications for deadlines, approvals, escalations, readiness alerts | Human chooses action from notification |
| Employee | Personalize what my assistant does automatically | “Autonomy” fails if the system doesn’t understand user preferences or action boundaries | As an employee, I want to configure my assistant’s skills, priorities, and limits, so it knows what it can do automatically on my behalf | Preference profile, calendar, mail, Salesforce HR/IT, external systems | Learns patterns, applies user-configured skills/preferences, auto-executes repeatable tasks | Human sets rules and override options |

# MVP requirements

## **A. Product Requirements for MVP Scope Proposal**

| Requirement / Capability | Core User Journey or Flow | Priority | Notes / Constraints |
| ----- | ----- | ----- | ----- |
| **1\. Daily Brief / Start My Day with Clarity** | User opens Jarvis in Teams app or chat → receives prioritized brief including meetings, pending items, follow-ups, unresolved service items, and relevant documents → user drills into an item conversationally → takes a next action | Must | Chat?Consider: **Speech-to-text for prompt** |
| **2\. Conversational context retrieval across Microsoft \+ Salesforce employee-service context** | User asks a question in Teams chat about an item, meeting, task, or service issue → Jarvis retrieves context from Teams/Outlook/O365 and relevant Salesforce data → responds with context-aware summary and recommended actions | **Must.**  | Needs grounded permission-aware retrieval |
| **3\. Action-taking on low-risk tasks from chat or brief** | User sees an item in daily brief or asks in chat → Jarvis proposes action (send follow-up, create/update calendar event, share summary, open/update request, acknowledge item) → user confirms if needed → Jarvis executes and reports status | **Must.**. | Human confirmation should remain the default for anything policy-sensitive |
| **4\. Basic routine admin completion without portal-hopping** | User asks for common admin help in natural language → Jarvis identifies intent → pre-fills / launches the right flow or request path → completes or initiates the task → returns status | **Should.**  | Can be backed by available connectors\* agents |
| **5\. Proactive notifications and nudges** | Poller or scheduled behavior detects deadline, pending approval, unresolved item, missing doc, or upcoming meeting need → Jarvis pushes a Teams notification with context and action options | **Must.**  | Use poller/event-driven scheduled flows(?) |
| **6\. Personalization \+ guardrails setup** | User is onboarded to Jarvis → answers a lightweight configuration flow or “top 10 questions” → selects what Jarvis can read, write, notify about, and automate → preferences shape future behavior | **Must** | What is the extent of self learning autonomy? |
| **7\. “Tell me what you can do” capability discoverability** | User asks what Jarvis can do, or sees a capabilities panel in Teams app → Jarvis enumerates supported actions, approvals, connected systems, and boundaries | **Must.**. | reflect only enabled integrations/actions, not futuristic stuff |
| **8\. Skills / behaviors framework with OOTB \+ user-configurable behaviors** | User or admin enables built-in behaviors; user optionally creates simple personal behaviors; background or scheduled behaviors run under guardrails | **Should.** |  |
| **9\. Teams app dashboard \+ chat dual surface** | User interacts through Teams chat for conversation and proactive messages; user opens Teams app dashboard for structured brief, widgets, and actionable items | **Must.**  |  |
| **10\. Voice interactions / outbound calls** | System detects critical event or user requests voice action → Jarvis initiates or handles a voice flow | **Could/Maybe.**  | Architecture TBD |
| **11\. Slack-first or Slack-parity surface** | User interacts through Slack app/bot | **Could/Maybe** | Pro: Slack is good for dreamforce demoCon: Slackbot threat/perception and delivery complexity |
| **12\. Cross-platform, multi-vendor workflows (Google, Workday, SAP, Jira, etc.)** | User starts in Teams and executes end-to-end across heterogeneous systems | **Could / defer.**  |  |
| 13\. Proactive Team Readiness Brief for Managers | Manager opens Jarvis in Teams app or receives a proactive brief in Teams chat → sees a consolidated team-readiness view covering blocked employees, pending approvals, onboarding gaps, unresolved service items, deadlines, and selected readiness/risk signals → drills into an employee or issue → Jarvis drafts a recommended nudge, follow-up, or assignment for manager review | Should. | For MVP, scope should be narrowed to the signals most readily available  |
| 14\. Risk Detection and Contextual Team Summarization | Jarvis periodically checks for team-level risk indicators such as missing skills, pending approvals, onboarding delays, or unresolved cases → compiles a concise summary with priority ordering and rationale → surfaces exceptions requiring manager attention rather than a raw data dump | Should.  |  |
| 15\. Approval Digest / Batch Approval View | Manager receives a batched approval summary in Teams app/chat → Jarvis groups routine approvals, highlights policy-sensitive or exceptional items, and presents context, rationale, and recommended action → manager approves/declines/escalates from the summary | Must.  | MVP should focus on a narrow class of approvals with stable policy/context sources.  |
| 16\. Schedule and Obligation Coordination for Employees | Employee asks Jarvis to help manage the day or resolve conflicts → Jarvis reviews meetings, deadlines, service tasks, and relevant documents → identifies conflicts or prep gaps → suggests or executes changes such as finding documents, drafting agenda notes, or proposing alternate meeting times | Must.. |  |
| 17\. Meeting Prep with Document and Context Bundling | Before a meeting, Jarvis identifies the meeting, gathers relevant documents/emails/context, and presents a prep bundle or summary to the employee → employee can ask follow-up questions or share the summary | Must.. | Use documents and context the employee already has permission to access. |
|  18\. Setup i.e. Easy and configurable for a) code friendly and b)non-code friendly admin?  |  |  |  How does this tie into the Salesforce Headless announcement? |
| 19\. Whatsapp as a channel? |  |  | Whatsapp currently doesn't support AEA. UACP Is working on it  |

### 

### 

### **Core MVP journeys recommended for release \+ demo**

#### **Journey 1: Daily brief with actionable follow-up**

Open Teams app → see daily brief with meetings, pending approvals/items, unresolved service work, and relevant documents → click into one item → get a grounded summary → send follow-up email or reschedule a meeting. This is a strong habit-forming use case

#### **Journey 2: Ask Jarvis to complete a routine low-risk task**

In Teams chat, ask Jarvis to do a simple admin task or coordination task → Jarvis fetches context, asks for missing info only if necessary, then executes through approved integrations/flows → confirms completion and next steps. This maps to “complete routine admin without portal-hopping” while staying within realistic low-risk boundaries.

#### **Journey 3: Proactive nudge with one-click action**

Jarvis detects an upcoming issue or unresolved item through scheduled/poller-based behavior → pushes a proactive Teams notification → user takes action directly from notification or opens the chat thread for more context.

#### **Journey 4: Configure my assistant**

User sets preferences and guardrails: what Jarvis may read, what it may write, what it may automate, and which categories matter most → Jarvis confirms what it can do. This is essential for trust and future autonomy.

#### **Journey 5: Manager Team Readiness Brief**

Manager opens Jarvis in the Teams app dashboard at the start of the day and receives a proactive team-readiness brief. The brief surfaces a prioritized summary of team risks such as pending approvals, onboarding gaps, unresolved service issues, missed deadlines, or readiness flags. The manager selects one flagged item, views a concise explanation and supporting context, and then chooses a recommended next step such as nudging an employee, assigning follow-up, or opening the underlying workflow. Jarvis drafts the action, but the manager confirms before anything is sent or executed.

#### **Journey 6: Employee Schedule \+ Obligation Coordination**

Employee asks Jarvis in Teams chat to help manage the day or resolve a scheduling conflict. Jarvis reviews the employee’s meetings, deadlines, relevant documents, and service obligations, then returns a coordinated plan: what meeting needs prep, what document should be reviewed, which low-priority item can move, and what follow-up can be drafted. The employee chooses a proposed action such as rescheduling a low-priority meeting, opening the prep bundle, or sending a follow-up. Jarvis executes only within the employee’s preferences and guardrails; sensitive or VIP changes require explicit confirmation. 

---

### **Acceptance Signals for MVP**

#### **Product signals**

* Users can reliably access Jarvis through **Microsoft Teams app \+ chat**  
* Jarvis produces a **useful daily brief** with prioritized items and relevant context rather than generic summaries.  
* Users can complete at least a **small set of real actions** from the brief/chat, not just receive answers.  
* Users can configure **basic guardrails and preferences**, and Jarvis can clearly state its supported capabilities.  
* Proactive notifications occur for at least a bounded set of triggers and drive action.

#### **Operational / architecture signals**

* End-to-end Teams → UACP → AIS → Jarvis Actor → Orchestrator → execution path works for live user flows.  
* Poller/scheduler-based proactive flows operate reliably for the supported triggers. The current architecture explicitly prefers pollers over a global webhook model.  
* Named Credentials / external service integrations are stable enough for the chosen read/write use cases.  
* Core auditability, permissions, and user-context authorization are working for supported actions.

---

### **Assumptions and Open Questions**

| Topic | Assumptions/qsns | Why It Matters | Owner / Function | Recommended Next Step |
| ----- | ----- | ----- | ----- | ----- |
| Primary MVP surface | Teams app \+ Teams chat are the primary Release 264 surface |  |  | Confirm as explicit MVP decision and communicate that Slack/mobile/voice are not parity targets for MVP |
| Slack inclusion | Slack may matter for Dreamforce optics but is not required for MVP parity |  |  | Decide whether Slack is demo-only, teaser-only, or omitted |
| Voice scope | Voice call is not in core MVP scope**Speech to text in scope? (if employee does not want to type)** |  |  | Remove from MVP critical path; decide separately whether there is a safe demo cameo |
| Mobile app | Mobile is not required for MVP launch; iOS \> android when we do mobile app |  |  | Treat mobile as follow-on unless required for customer zero |
| Breadth of routine admin use cases | How should we limit the supported use cases? |  |  | Possible to leverage existing actions? |
| External ecosystems | Release 264 remains Microsoft-first; but what about Google/Workday and broader ecosystems?? |  |  | Google suite is important for SF customer zero |
| Personalization depth | MVP supports explicit user-configured preferences/guardrails, not deep self-learning autonomy |  |  | Define the exact preference model and what is stored |
| Skills authoring | Scope? |  |  |  |

---

## **B. Key Product \+ Architectural Decisions**

### **Architectural Considerations for MVP**

**Integration boundaries.** Read/write transactions appear to rely on Named Credentials, external services, Flow connectors, and potentially MCP/A2A maturation. That suggests MVP actions should be chosen based on connector maturity and user-context authorization, not only on customer desirability.

**Proactive architecture.** Since webhook standardization is explicitly rejected in the HLD, proactive notifications and background automations should be designed around pollers, schedules, and controlled triggers. That affects freshness expectations and latency promises.

**Security, privacy, and trust.** The HLD states zero data retention, permission-based access, OAuth/JWT, Named Credentials, user-context authorization, and alignment with Einstein Trust Layer

**Memory and personalization.** The architecture allows vector-based semantic memory without duplicating system-of-record data. For MVP, this should likely be used conservatively: preferences and limited contextual memory rather than deep autonomous behavioral learning.

### **Decision Log Gaps**

The project context is still insufficient or inconsistent in several areas that need explicit decisions before build/demo/release alignment:

1. **Exact MVP use cases beyond the daily brief** are not yet narrowed to concrete, integrated flows.  
2. **Slack posture** is strategically desired for demo optics but conflicts with scope discipline.  
3. **Voice posture** is architecturally unresolved and should not remain ambiguous.  
4. **Mobile/iOS posture** is noted in architect discussion but not reflected in the HLD release scope.  
5. **Routine admin backend choices** are not locked to specific systems and connector maturity.  
6. **Manager persona inclusion** is still a scope decision, not a settled plan.  
7. **Security threat model and signoff path** remain incomplete in the HLD.  
8. **Data model and some sequence diagrams are still TBD**, which may hide delivery risk if they affect supported MVP journeys.

## **C. Critical Dependencies**

| Dependency | Why It Matters | Impact if Delayed |
| ----- | ----- | ----- |
| Teams app \+ chat surface readiness | Release 264 is anchored on Teams UI app \+ chat | MVP and demo lose their primary surface |
| UACP → AIS → Jarvis Actor → execution path stability | Core conversational and action flow depends on it | Core product may appear as disconnected demos |
| Microsoft integrations: Outlook, Teams, OneDrive/SharePoint, O365 | Needed for daily brief, context aggregation, docs, scheduling | Daily brief becomes shallow or fake |
| Salesforce Core Connect APIs for dashboard \+ service context | Dashboard and structured insights depend on direct Core API path | Teams app experience weakens; less deterministic demo |
| Named Credentials / external services maturity for supported actions | Required for reliable read/write execution | “Action layer” degrades into read-only assistant |
| Preference / guardrails model and UX | Leadership explicitly expects configurable read/write/autonomy boundaries | Trust story weak; personalization promise vague |
| Poller / scheduler / worker runtime readiness | Needed for proactive brief generation and nudges | Product loses proactive differentiation |
| Security and user-context authorization signoff | Sensitive because Jarvis reads and acts across employee systems | Launch/demo may be blocked or heavily constrained |
| Customer Zero environment, credentials, and enabled systems | Determines what is actually demoable and releasable | Demo flows break due to environment mismatch |
| Design of dashboard, notification, and chat roles | Prevents fragmented UX across brief, chat, and actions | Product feels incoherent |
| Finance approval / program funding | Mentioned in architect notes; may affect resourcing and external dependencies | Work stalls or gets reduced late |
| AXL support for Teams / external team support | Mentioned as dependency in architect notes | Can block Teams integration or enterprise readiness |
| Jarvis Falcon service / DevOps readiness | Called out as dependency for runtime operations | Reliability risk for proactive and background behaviors |
| iOS/mobile app decisions | Mentioned in architect discussion as possible priority | Could distract from Teams-first delivery |
| Voice platform choice (SC Voice vs Thunderbird vs other) | Still unresolved | Can create hidden critical path if left ambiguous |

# Market Intelligence research

# **The Rise of Agentic Employee Service & Personal AI Assistants**

Market Intelligence & Competition benchmarking report  
---

## **1\. Executive Summary**

The year 2026 marks the definitive shift from **Generative AI** (text generation) to **Agentic AI** (autonomous action). In the HR Service Delivery (HRSD) and Employee Service space, the "helpful chatbot" of 2024 has been replaced by **"Superagents"** and **"Employee Digital Twins."** These systems no longer just answer questions; they orchestrate complex workflows, simulate organizational changes, and act as autonomous digital co-workers. Leading enterprises are now merging HR and digital labor budgets into a single "Office of the Workforce."

---

## **2\. Latest Trends: The "Agentic" Shift**

Key trends include multimodal AI assistants with speech recognition, emotion detection, and natural language understanding enabling more human-like interactions; autonomous decision-making and proactive support that shifts AI from reactive tools to strategic partners; and the rise of Employee Digital Twins for real-time workforce simulation, predictive analytics for turnover and engagement, and risk-free scenario testing.intellias

The market has moved beyond retrieval-augmented generation (RAG) toward **Large Action Models** and multi-agent orchestration.

* **From "Ask Me" to "Do It For Me":** AI agents now possess "Agency." They can conceptualize a goal (e.g., "I'm going on maternity leave"), break it into steps (benefits update, payroll adjustment, backfill requisition), and execute across disparate systems without human micro-management.  
* **The Skills-First Revolution:** The traditional job description is dying. AI now maps the organization as a "Fluid Skills Graph."  
* **Federated AI for Compliance:** To navigate the 2026 Global AI Acts, products have moved to "federated" models where data stays in-region (EU, US, Asia) while the intelligence is shared, ensuring 100% local labor law compliance.  
* **Hyper-Personalization (EX as OS):** The Employee Experience (EX) is now the operating system. AI agents use "Work IQ" (long-term memory of meetings, chats, and preferences) to provide proactive service.

---

## 

## 

## **3\. Product Spotlight: Capabilities & Positioning**

Established HRIS leaders ServiceNow, Workday, SAP, and ADP dominate through deep platform integration and extensive customer bases, while emerging AI-first companies like Leena AI and Born Digital differentiate with niche agentic capabilities and digital twin simulations; Gartner research highlights AI avatar vendors including Born Digital alongside NVIDIA, signaling enterprise adoption momentum

The competitive landscape is dominated by the "Big Three," but niche "Digital Twin" startups are disrupting the status quo.

| Product / Vendor | 2026 Key Capabilities | Market Positioning |
| :---- | :---- | :---- |
| **ServiceNow (Xanadu/Yokohama)** | **AI Agent Fabric:** Orchestrates interaction between ServiceNow agents and 3rd-party bots (e.g., Claude, GPT). Includes **AI Agent Studio** for low-code autonomous workflow creation. | The "Agent of Agents." Positioning as the enterprise orchestration layer that connects IT, HR, and Finance. |
| **Workday Illuminate** | **Business Process Copilots:** Specialized agents for performance, sentiment, and job architecture. Introduced **Flex Credits**, a consumption-based pricing model for AI outcomes. | The "Authoritative Data Source." Focusing on high-fidelity HR data to drive autonomous talent management. |
| **Microsoft Copilot (Pro/Ent)** | **People Agent:** Uses Microsoft Graph to find experts, prepare meeting briefs, and summarize "Work IQ." Powered by **GPT-5.2** with native **Claude 3.5** integration options. | The "Everyday Co-worker." Embedded in the flow of work (Teams/Outlook) to reduce "digital debt." |
| **Niche Players** (e.g., ValueMatrix, SkyHive, Viven) | **Digital Twin of an Employee (DToE):** Simulations that predict burnout, retention risk, and "what-if" scenarios for salary increases or restructuring. | The "Strategic Simulator." Positioning as the high-level decision support tool for CHROs. |

There are players like Viven.ai positioned as “employee digital twin”; it is explicitly about building AI versions of key experts and employees, trained on their decisions, communications, and domain knowledge, so teammates can access expertise even when those people are unavailable. It also extends that twin into a personal assistant / chief-of-staff model for the employee themselves. ([Viven](https://viven.ai/))

---

## **4\. Business Opportunities & Disruption Levers**

### **A. Outcome-Based Monetization (The "Agent Tax")**

Move away from "Per Seat" pricing. Disruption lies in **charging for outcomes** (e.g., "Cost per successfully resolved autonomous onboarding"). "Flex Credits" is the first major move in this direction.

### **B. Cross-Platform Orchestration (The "Agentic Glue")**

The biggest pain point in 2026 is "Agent Sprawl." A product that can sit *above* Microsoft, ServiceNow, and Workday to orchestrate a single, unified "Personal Agent" for the employee will be in a position to win the interface war.

### **C. Sovereign & Private "Small Language Models" (SLMs)**

As trust becomes the primary currency, the ability to run high-performance, private SLMs on-premises or in a private cloud—trained *only* on company-specific culture and policies—is a massive lever for adoption in regulated industries (Finance, Healthcare, Defense).

### **D. The "Human-in-the-Loop" Governance**

Disruption will come from tools that don't just "automate" but provide a **Transparency Dashboard**. Managers need to see *why* an agent made a decision and have "Kill Switch" or "Approval Gate" capabilities that are seamless, not friction-heavy.

### **E. Position to Win**

Highest chances for disruption and adoption come from seamless integration with existing HRIS/ERP ecosystems, focus on employee experience as a north star for productivity, predictive analytics that enable proactive interventions, scenario testing for workforce planning without real-world risks, ethical and transparent AI to address data sensitivity concerns, and the evolution of AI assistants into autonomous agents capable of executing complex HR workflows across integrated systems

## **5\. More Details on products/platform, pricing, positioning**

### A. Pricing patterns 

1\. HRSD platforms \+ AI add‑ons

* ServiceNow HRSD \+ Now Assist  
  * Core HRSD is licensed as a separate module, usually per HR fulfiller/agent, with estimated ranges around 60–120 USD per HR agent per month, depending on lifecycle apps and region, with enterprise contracts significantly higher when you include portals and messaging.[hiverhq](https://hiverhq.com/blog/servicenow-pricing)  
  * Generative AI / Now Assist is typically an add‑on on top of Pro/Enterprise tiers; customers need Pro Plus or Enterprise Plus and purchase "Assist" capacity packs; internal commentary suggests Now Assist pricing is tied to number of enabled users and usage limits, with overages requiring additional Assist packs (consumption‑like).[plat4mation](https://plat4mation.com/blog/servicenow-pricing-and-everything-you-need-to-know-in-2026/)  
  * Many 2026 analysts estimate ITSM Pro (with AI) around 160+ USD per fulfiller/month; HRSD with Now Assist will be in a similar “premium add‑on for Pro+/Enterprise” bucket, with custom quotes per customer.nowtribe+1  
* Workday Assistant, SAP SuccessFactors, Oracle ME, UKG, ADP  
  * These are generally bundled into higher HCM/EX tiers rather than sold as separate SKUs for employees.  
  * Pricing tends to be per employee per month (PEPM) across HCM \+ EX, with AI/assistant features enabled only on specific SKUs (e.g., “Enterprise”, “Professional”, or “AI add‑on”) – but exact assistant‑specific pricing is not typically public.

2\. AI‑first assistant platforms

* Sana AI / Sana Agents  
  * Public page shows Team plan at 30 USD/user/month for up to 50 members, with free “Sana Agent” tiers that support up to 5 members and limited meetings.cybernews+1  
  * Enterprise pricing is custom, adding governance, SSO, and larger document limits.[sanalabs](https://sanalabs.com/products/sana/pricing)  
* Leena AI  
  * Uses employee‑based, headcount‑driven licensing; pricing is customized – no standard public tiers.[workativ](https://workativ.com/ai-agent/blog/leena-ai-pricing)  
  * Third‑party reviews and marketplaces note “starting at around 1 USD per user” but actual 2026 TCO analyses emphasize quote‑only enterprise pricing with implementation fees, bundled services, and engagement modules.capterra+2  
* Workativ / similar HR virtual agents  
  * Published pricing for competing HR/IT virtual agents often shows session‑based or seat‑based pricing (e.g., Business plan $349/month for higher session limits in some comparisons) – the key pattern is mid‑market‑friendly SaaS tiers plus “Enterprise” with volume discounts and more integrations.[workativ](https://workativ.com/ai-agent/blog/leena-ai-pricing)  
* Moveworks, Espressive, Born Digital  
  * Primarily enterprise deals, with quote‑only per employee or per domain pricing; they often pitch “global employee support” and digital employees/digital humans, with design/implementation services bundled.[borndigital](https://borndigital.ai/employee-digital-twin-ai-avatars-ai-workforce/)

3 Spotify AiKA / background agents

* Spotify’s AiKA and background coding agents are internal platforms; there is no pricing, but they are a great pattern for “digital employees” that autonomously resolve tech debt and infrastructure tasks, with 60–90% time savings for development tasks and 1,500+ automated code merges – useful as an internal benchmark for autonomous agent ROI.backstage.spotify+1.

---

### B Qualitative feature positioning by product (2026 view)

1 Autonomous task resolution

* Strong “agentic” / autonomous workflows  
  * ServiceNow Now Assist: automates case and chat summarisation, resolution notes generation, and supports AI‑assisted workflows; with Flow Designer and Virtual Agent you can reach semi‑autonomous resolution for standard HR requests (e.g., payroll updates, address changes) once integrated with back‑end systems.servicenow+2  
  * Leena AI: positioned explicitly as an autonomous HR agent, handling routine HR queries, automating leave requests, reimbursements, ticket creation, and escalation; many HR tickets can be resolved end‑to‑end with no HR intervention.aiixx+1  
  * Moveworks/Espressive: known for high auto‑resolution rates for IT/HR requests (password resets, access, FAQs) through deep NLP and integration with ITSM/HRSD tools.[hracuity](https://www.hracuity.com/blog/best-ai-tools-for-hr-in-2026/)  
  * Workativ / similar: runs flows to automate HR and IT tasks from chats, so can achieve full closed‑loop flows for certain requests.[workativ](https://workativ.com/ai-agent/blog/hr-virtual-assistant)  
* Moderate autonomy (assistant to human, not full “doer”)  
  * Workday Assistant, SAP Joule, Oracle ME, UKG Pro assistant, ADP Assist: mainly conversational front‑ends for existing workflows; they launch transactions (update address, request time off) but the underlying system does the “work” in pre‑defined flows.  
  * Sana, Microsoft Copilot, Google Gemini: strong content/knowledge automation and orchestration in productivity tools, but HR transactions depend on connectors/integrations.

2 Predictive turnover analytics

* Core HCM suites (Workday, SAP, Oracle, UKG) are strongest here, as they already provide predictive attrition, engagement scoring, and people analytics; assistants surface and explain these insights but do not always “own” the models themselves.harmonyhr+1  
* Digital‑twin / engagement vendors like inFeedo and some “HR Digital Twin” offerings emphasise predictive retention, wellbeing, and scenario modelling; you may want to include one of them in your 15 if turnover prediction is core.infeedo+1  
* Leena AI, Moveworks, Sana lean more towards operational intelligence (what people ask, service bottlenecks) than explicit attrition models, but their data can feed an analytics layer.

3 Scenario simulation / Employee Digital Twin

* Direct “Employee Digital Twin” platforms:  
  * Born Digital: explicitly markets employee digital twins and digital humans that mirror employee roles and behaviour; used both for experience (avatars) and simulation (how digital workers handle tasks).[borndigital](https://borndigital.ai/employee-digital-twin-ai-avatars-ai-workforce/)  
  * HR digital twin write‑ups (e.g., HR digital twin tech and workforce simulation articles) show vendors simulating workforce scenarios (headcount, demand, skills) and “what‑if” planning; some HCM platforms are beginning to brand advanced workforce planning as digital twin‑like capability.mokahr+2  
* HCM analytics modules:  
  * Workday Adaptive Planning, SAP Analytics Cloud, Oracle Analytics for HCM, UKG People Analytics: support scenario planning for workforce cost, hiring, restructures; this is your best near‑term route to “employee digital twin” for HRSD, even if they don’t market it with that term.hrone+1  
* Spotify AiKA & background agents:  
  * Not a workforce simulator, but a strong example of autonomous agents that act like “digital engineers”, carrying out tasks continuously in the background.departmentofproduct.substack+1

---

### C. Integrations: Teams, Slack, Google Workspace

Across the space, there is a clear pattern:

* Slack & Teams  
  * ServiceNow Virtual Agent, Moveworks, Leena AI, Workativ, Espressive, and Sana all emphasize deep Slack and Microsoft Teams integrations as primary channels for employee support.aitoolsexplained+2  
  * HCM vendors increasingly embed in Teams (e.g., Workday bot for Teams, SuccessFactors cards), but depth varies.  
* Google Workspace  
  * Sana explicitly lists Gmail, Docs, and meeting integrations; it summarizes calls and documents.cybernews+1  
  * Microsoft‑first players may treat Google as secondary; Moveworks and some newer EX platforms now support both Gmail and Outlook.  
  * For a few, Workspace integration is via federated search only (e.g., indexing Drive for knowledge).