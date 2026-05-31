# Applyd
### Product Requirements Document
**Author:** Harsh Golani  
**Version:** 1.0  
**Date:** May 2026  
**Status:** Active

---

## Executive Summary

Applyd is a job search tracker built specifically for tech job seekers running aggressive, high-volume searches. It tracks both formal applications and outreach conversations in one place, and tells you every morning exactly what needs your attention that day.

Most job trackers were built for passive searchers applying to a handful of roles. Applyd is built for the reality of a modern tech job search: 50 to 100 applications across multiple role types, LinkedIn outreach happening in parallel, multiple resume versions tailored per company, and relationships that go cold if you wait too long to follow up.

The product has one job. Make sure nothing falls through the cracks.

---

## The Problem

Job searching at scale is chaos.

When you are applying to 30 or more companies simultaneously, you are managing more moving pieces than any spreadsheet can hold together. Which companies have you applied to. What stage each one is at. Which resume version you sent where. Who you reached out to on LinkedIn and what they said back. When you last followed up. Whether that silence means they are not interested or just busy.

Existing job boards were built for discovery, not tracking. LinkedIn, Indeed, and Glassdoor are ad-driven platforms whose core business is connecting employers to candidates. Tracking your own pipeline is an afterthought to them. The tools that do focus on tracking, like Teal and Huntr, handle formal applications but miss outreach entirely. If you sent messages to five engineers at a company before applying, that context lives nowhere except your LinkedIn inbox and your memory.

The result is predictable. According to Indeed (2025), 60% of job seekers lose track of where they have applied within two weeks. The average tech job search involves 100 to 200 applications according to Zippia (2025). Warm leads go cold. Follow-ups get forgotten. You walk into a recruiter call not remembering what you said in your cover letter.

There is no tool built for the way a competitive tech job search actually works.

The highest-value moments in a job search are not the applications. They are the conversations. A referral from an engineer at a company you want. A recruiter who asked you to follow up in a month. A hiring manager who gave you feedback after a rejection and said stay in touch. These relationships are worth more than 50 cold applications, and right now there is nowhere to track them.

Applyd fixes that.

---

## Market Context

The job tracking space has several established players. None of them have cracked this specific problem.

**Teal** is the most feature-rich tracker available. It has a resume builder, a job board aggregator, and an application tracker. The tracker itself is table-based, closer to a styled spreadsheet than a Kanban board. Most AI features are paywalled at $29 per month. There is no outreach tracking. According to a 2026 review by ResumeHog, the primary user complaints are cost and the rigidity of the AI-generated content.

**Huntr** uses a Kanban board and has a Chrome extension for saving jobs. The free tier caps at 100 saved jobs. No outreach tracking. Resume scoring in testing was found to overstate alignment with job descriptions, according to a 2026 comparison by Careerflow.

**Kondo** handles LinkedIn message organization specifically. It is a separate tool entirely from application tracking, which means users need two products running in parallel and still have no unified view.

**Google Sheets** remains the most common solution. It wins on familiarity and flexibility. It loses on everything else: manual entry fatigue, no follow-up logic, no relationship tracking, breaks down after 40 rows.

The gap is consistent across all of them. Every tool treats the application as the primary object. None of them model the relationship between an application and the human conversations surrounding it. Nobody has built a tool that handles both sides of a modern tech job search in one place.

That is the gap Applyd fills.

---

## User Personas

### Persona 1: The High Volume Applicant

A recent computer science or engineering graduate, zero to two years out of school, running an aggressive search across 50 to 100 companies simultaneously. Often navigating visa sponsorship requirements which cut the pool of eligible companies by more than half. Applying across multiple role types at once: software engineering, AI engineer, data roles. Each track has its own resume version and its own pitch.

This person does not need help finding jobs. They know how to find them. What they need is a way to stay organized under volume. Which resume went where. Who they reached out to and when. Whether a week of silence from a company is normal or a signal to follow up.

**What they are looking for:** Chaos management. A single place that holds the entire search so nothing slips.

**Biggest fear:** A warm lead going cold because they forgot to follow up. They spent an hour crafting the right message to a senior engineer at a company they want. The person replied. Life got busy. Two weeks passed. That opportunity is probably dead now.

**Current system:** A Google Sheet that made sense in week one and is now 60 rows of inconsistent data. LinkedIn tabs left open. A notes app with company names and no context. Memory, which fails under this volume.

---

### Persona 2: The Career Switcher

Someone one to three years out of a non-tech role, finance, operations, business, healthcare, who completed a bootcamp or self-taught their way into software. Now running their first tech job search. Applying across multiple tracks simultaneously because they are not sure which door will open first: SWE, data analyst, PM, AI tools roles. Each track requires a different resume and a different story about who they are.

This person's tracking problem is different from Persona 1. The volume may be similar, but the complexity is different. They are managing multiple versions of their professional identity at the same time.

**What they are looking for:** Narrative consistency. They need to know exactly which version of their story they told to which company, so they never contradict themselves in a follow-up or interview.

**Biggest fear:** Walking into an interview and contradicting what they wrote in their application. They applied as one version of themselves and are about to be interviewed as another. The inconsistency signals disorganization to a hiring manager who will interpret it as a signal about how they work.

**Current system:** Multiple resume versions named with variations of "final" scattered across their desktop. A spreadsheet that tracks company and date but not which resume. Relying on memory for cover letter content they cannot find anymore.

---

### Persona 3: The Experienced Engineer in Passive Search

Three to six years into their tech career, currently employed, not in a rush. Selectively exploring better opportunities: better compensation, more interesting problems, stronger team. Applying to five to fifteen carefully chosen companies. Their strategy is referrals and warm introductions, not cold applications. Every company on their list has a human connection attached to it.

This person needs relationship management, not chaos management. The volume is low, but the stakes per interaction are high. How they handle the process signals how they operate professionally.

**What they are looking for:** Timing and context. They need to know when to reach out, what was said last time, and what to bring up next. They are managing a search that fits around an existing job without leaking into it.

**Biggest fear:** Mismanaging a high-value relationship. A former colleague agreed to refer them. They never followed up properly. The role got filled. The relationship is now awkward. At this level, that kind of disorganization is disqualifying.

**Current system:** LinkedIn messages scattered across 20 threads. Email mixed with LinkedIn mixed with text from former colleagues. A mental map that works for five companies and breaks at ten.

---

## Product Philosophy

### Three Modes of a Job Seeker

At any given moment, a job seeker is in one of three modes.

**Mode 1: Doing.** Actively applying, sending messages, preparing for interviews. They need the product to be fast. Add this. Log that. Move this forward. Minimum friction.

**Mode 2: Reviewing.** Sitting down to assess where things stand. Zooming out. What is working, what is stagnant, what needs attention. They need a clear picture fast.

**Mode 3: Preparing.** About to reach out to someone or walk into an interview. They need context. What did I say last time. What resume did I send. What should I bring up. They need to pull up everything about one company in ten seconds.

Most existing job trackers serve Mode 2 adequately. They fail at Mode 1 (too much friction to log quickly) and are useless for Mode 3 (no conversation context, no notes structure).

Applyd is designed to serve all three.

### What Natural Feels Like

Natural means the product works the way a job seeker thinks, not the other way around.

The most common action should always be one tap away. Adding an application should take under 10 seconds. Logging an interaction should feel like sending a text message, not filling out a form. Pulling up context before a call should take one tap and five seconds of reading.

The product should also tell you what to do. Not just show you data but give you direction. "These three people need follow-ups today." "This application has been sitting in Phone Screen for 12 days." That clarity is the product's core promise.

### Design Principles

**Urgency over completeness.** The home screen shows what needs action today, not everything that exists. A job seeker opening Applyd at 9am needs to know what to do, not see a complete database.

**Context before contact.** Before every outreach or interview, a user should be able to read everything relevant about that person or company in under 30 seconds. The product stores that context so the user does not have to keep it in their head.

**Friction is the enemy.** Every extra tap is a reason not to log something. Every unmaintained field is dead weight. The product only asks for information it actually uses.

**Applications and contacts are linked, not separate.** The outreach conversation and the formal application belong together. Separating them into two tools creates exactly the problem Applyd is trying to solve.

---

## V1 Feature Set

V1 solves one problem completely: a tech job seeker running an active search knows exactly what needs their attention each day and has full context on every company and contact they are managing.

Everything else is V2.

### Authentication

**F01: Signup and login**
Email and password. JWT-based authentication. Standard registration and login flow.

**F02: Per-user data isolation**
Every application, contact, and note belongs to the authenticated user. No shared data between accounts.

**F03: Persistent sessions**
Users stay logged in across browser sessions. JWT refresh token. Nobody should have to log in every time they open the product.

### Applications

**F04: Add application**
A user can add a job application with five fields: company name, role title, date applied, current stage, and resume version used. All fields except company name are optional to reduce friction. An application can be enriched over time.

**F05: Kanban board**
Applications are displayed as cards across five columns: Applied, Phone Screen, Technical, Offer, and Rejected. The board is the default view. Cards show company name, role, days since last update, and a follow-up flag if overdue.

**F06: Application detail page**
Tapping a card opens a full detail view with all application fields, linked contacts, notes, and next steps. This is the preparation screen. Everything about one company in one place.

**F07: Resume version label**
A plain text field on each application. "Which resume did you send?" No file upload in V1. Just a label: "backend-focused-v3" or "ai-engineer-short." Enough to know which version went where.

**F08: Archive**
A one-tap action to move closed applications out of the active board. Rejected and withdrawn applications can be archived. They are not deleted, just removed from the main view. The board stays clean.

### Contacts

**F09: Add contact**
A user can add a contact with four fields: name, company, role, and relationship type. Relationship types are: Recruiter, Engineer, Hiring Manager, Referral, Other.

**F10: Link contact to application**
A contact can be linked to one or more applications. When viewing an application detail page, all linked contacts are shown. When viewing a contact detail page, all linked applications are shown.

**F11: Last contacted date**
Each contact has a last contacted date. This updates automatically when a new interaction is logged. It is the field that powers follow-up flagging.

**F12: Follow-up threshold and overdue flag**
Global setting with smart defaults: active conversation flags after 5 days of silence, cold outreach flags after 7 days. When a contact exceeds their threshold, they receive a visual overdue flag on their card and appear in Today's Focus on the home screen.

**F13: Contact detail page**
Full view of one contact. Name, company, role, relationship type, last contacted date, follow-up status, linked applications, interaction log, and notes. This is the equivalent of the application detail page but for people.

### Home Screen

**F14: Today's Focus**
The top section of the home screen. Shows three things: contacts with overdue follow-ups, applications that have been in the same stage for more than 7 days with no activity, and any applications with a next steps field that has not been acted on. Each item is tappable and opens directly to the relevant detail page.

**F15: Pipeline summary**
Three numbers across the top of the Kanban section: Active (Applied plus Phone Screen plus Technical), Waiting (no action required from user right now), Closed (Offer plus Rejected plus Archived). A quick read on the state of the search.

### Notes and Context

**F16: Notes per application**
A freeform text area on each application detail page. Running log of anything relevant: what was said in a phone screen, what the recruiter mentioned about timeline, what to bring up in the next conversation. No structure imposed. Just a place to write.

**F17: Notes per contact**
Same as application notes but on the contact detail page. A running log of everything relevant to this specific person and the relationship.

**F18: Interaction log**
A lightweight chronological log on each contact. Each entry has a date (auto-filled to today) and a text field. "May 16: Connected on LinkedIn, seems warm." "May 18: Phone call, mentioned team is scaling." This is not a structured CRM field. It is a dated note. Simple to add, valuable to read before a follow-up.

**F19: Next steps field**
A single text field on each application: "What is the next action on this?" This field feeds directly into Today's Focus. If a next steps field exists and has not been updated in 5 days, the application appears in Today's Focus as needing attention.

### Mobile Responsive

**F20: Responsive design**
The full product works on mobile browsers. Not a native app. Responsive CSS. A user who just finished a phone screen should be able to open Applyd on their phone, tap the company, and log a note in under 20 seconds.

---

## V2 Roadmap

These features were deliberately excluded from V1. Not because they lack value but because they are not essential for the core daily habit loop. They will be prioritized based on user feedback after V1 ships.

**Drag and drop Kanban**
Stage changes via dropdown work in V1. Drag and drop is more satisfying but adds build complexity. V2.

**Per-contact follow-up threshold**
V1 uses global defaults. Some contacts need tighter or looser thresholds. Configurable per contact in V2.

**Structured interaction timeline**
V1 has a simple dated notes field. V2 adds interaction types (message sent, call, interview, email), duration, and a proper timeline view.

**Talking points field**
A dedicated field per contact for "things to bring up next time." Distinct from general notes. V2.

**Stage change history**
A log of every stage change with timestamp. "Moved to Technical on May 18." Useful for analytics but not essential for daily use. V2.

**Analytics dashboard**
Application funnel, response rate by source, average time in each stage, weekly activity summary. Impressive but rarely the reason someone opens a job tracker daily. Build it when users ask for it. V2.

**Email reminders**
In-app Today's Focus handles reminders in V1. Email requires infrastructure, unsubscribe flows, and deliverability setup. V2.

**Search**
At V1 scale, 20 to 50 applications, users can scan the board. Search becomes necessary at 100 plus applications. V2.

**Resume file upload and storage**
V1 stores a text label. V2 stores the actual file. Requires file storage infrastructure. V2.

**Keyboard shortcuts**
Power user feature. Nobody needs this on day one. V2.

---

## Success Metrics

These are the signals that tell us Applyd is actually solving the problem, not just accumulating signups.

**Daily active usage rate**
A job seeker should open Applyd every morning to check Today's Focus. If they are not opening it daily, the product has not become a habit. Target: 60% of active users open Applyd at least 4 days per week.

**Applications logged per user in first 2 weeks**
Signups who log fewer than 10 applications never really used the product. They signed up, looked around, and left. Signups who log 10 or more are genuinely tracking their search. Target: 70% of signups log at least 10 applications within 14 days.

**Follow-up action rate**
Today's Focus shows overdue contacts. Do users actually act on them? If someone is flagged as overdue and logs an interaction within 24 hours, the product worked. Target: 50% of overdue flags result in a logged interaction within 24 hours.

**Day 14 retention**
Job searches last weeks to months. If someone uses Applyd for 3 days and stops, the product failed to become essential. Day 14 is the real retention signal, not day 1. Target: 40% of users still active at day 14.

**Notes written per active application**
Notes are the deepest form of engagement. A user writing notes is using Applyd for preparation, the hardest mode to serve and the most valuable. Target: average of 3 or more notes per active application across the user base.

---

## What Applyd Is Not

These boundaries are intentional. Scope creep starts with "while we are at it." This section exists to prevent that.

**Not a job board.** Applyd has no job listings, no discovery feed, no recommendations. Users find jobs on LinkedIn, company career pages, and job boards. They track them in Applyd.

**Not an auto-apply tool.** Applyd does not submit applications on behalf of users. The value of a job search is the intentionality behind it. Automated applications produce automated rejections.

**Not a resume builder.** No resume creation, no ATS keyword optimization, no resume scoring. Teal and Rezi do that. Applyd tracks which resume went where.

**Not an AI writing assistant.** No outreach message generation, no cover letter drafting, no interview answer suggestions. Users write their own messages. Applyd tracks the conversations that follow.

**Not a career coach.** No advice on how to interview, no salary negotiation guidance, no career path suggestions.

**Not a social network.** No public profiles, no sharing your search with others, no community features, no leaderboards.

Applyd is a tracking and relationship management tool. It assumes the user already knows how to run a job search. It makes sure nothing falls through the cracks while they do.

---

*Applyd PRD v1.0 | Harsh Golani | May 2026*
