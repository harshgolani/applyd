# Design Decisions

## Why Applyd exists

Every job tracker on the market treats the application as the primary object. You applied somewhere, here is a row in a table. That is half the picture at best.

A modern tech job search runs on two parallel tracks simultaneously: formal applications submitted through portals, and outreach conversations happening on LinkedIn, email, and referral chains. The highest-value opportunities almost always come from the second track. Nobody has built a tool that handles both in one place.

Applyd is that tool.

## Contacts as first-class objects

The most important architectural decision in Applyd is that contacts are not a sub-feature of applications. They are a separate top-level object that can exist independently.

A contact can be linked to an application or not. An application can have multiple contacts or none. The relationship is optional in both directions because that is how a real job search works — you might reach out to someone at a company before you apply, after you apply, or without ever applying at all.

Making contacts first-class means the follow-up tracking, interaction log, and snooze logic all live on the contact, not the application. The person is the unit of relationship management, not the job posting.

## Follow-up thresholds and the overdue flag

The core promise of the Today page is: "you will never let a warm lead go cold because you forgot." The mechanism behind this is the follow-up threshold per contact — a configurable number of days after which silence triggers an overdue flag.

Defaults are set globally at 7 days for cold outreach and 5 days for active conversations. These numbers are based on research: after 7 days of silence the probability of a response drops significantly, but a follow-up sent at day 7-10 still has a meaningful response rate.

The overdue flag feeds directly into Today's Focus — the home screen section that tells you exactly what needs attention. The product does not just show you data. It tells you what to do.

## Snooze instead of dismiss

When a contact is flagged as overdue, dismissing it permanently would be wrong. The person is still relevant — you just do not want to be reminded right now.

Snooze solves this. Three options: 3 days, 7 days, or forever. Forever is implemented as `snoozed_until = 9999-12-31` — a date far enough in the future that it effectively never reappears. The contact still exists and can be unsnoozed at any time from the Contacts page.

This pattern comes from email clients like Gmail and Hey. The insight is that "not now" and "never" are different intentions, and the UI should respect that distinction.

## Today page as the daily habit loop

The home screen is not a dashboard. It is a daily briefing.

The design decision was to lead with a unified action list — one list of things that need attention, sorted by urgency, with clear action verbs. "Follow up with Alex" not "Alex is overdue." The verb changes the psychology from passive observation to active task.

Stat pills at the top give the big picture in three numbers: active applications, follow-ups due, currently interviewing. These are clickable and navigate to the relevant section. The whole screen answers one question: "what do I do today?"

## WebSockets for real-time sync

Applyd uses WebSocket connections authenticated via JWT query parameter. Every write operation broadcasts an event to all active sessions for that user.

The practical value: if you have Applyd open in two tabs — phone and laptop — and you update an application on one, the other updates instantly. No refresh needed.

The implementation keeps a Map of userId to Set of WebSocket connections. Broadcasting iterates the set and sends only to open connections. Ping/pong every 30 seconds keeps connections alive and removes dead ones.

## COALESCE vs explicit field handling in PUT routes

The initial PUT routes used PostgreSQL COALESCE to handle partial updates. COALESCE keeps the existing value when null is passed — which means you cannot clear a field by sending an empty value.

This was a real bug: removing a resume version from an application and saving would keep the old value because the frontend sent an empty string which became null which COALESCE ignored.

The fix was to fetch the current row first, then use `'key' in body` to distinguish between "field omitted from request" (keep current) and "field sent as empty to clear it" (set null). This pattern handles both partial updates and explicit clearing correctly.

## Stage naming

The five stages are: Applied, Phone Screen, Interviewing, Offer, Rejected.

"Interviewing" replaces the generic "Technical" label. "Technical" is ambiguous — it could mean a technical phone screen, a take-home assessment, or full interview loops. "Interviewing" is clear: you are actively in the interview process with this company.

Rejected applications are removed from the Kanban board entirely and placed in a collapsible section below. An active Kanban board cluttered with rejections is demoralizing and unhelpful. The board should show live opportunities only.

## Archive vs Delete

Archive sets `archived = true` — the application disappears from the active board but is not deleted. Archived applications are accessible in a collapsible section and can be unarchived.

Delete is permanent and cascades to linked contacts and interactions.

The intended use: archive when a process concludes naturally (offer accepted elsewhere, role filled, decided to pass). Delete only for accidental entries.

## JWT authentication

Standard JWT with 7-day expiry. Token stored in localStorage under `applyd_token`. Every authenticated request sends it as a Bearer token in the Authorization header.

WebSocket connections authenticate via `?token=` query parameter — WebSocket connections cannot set custom headers at connection time, so the token goes in the URL.

No refresh tokens in V1. Seven days is long enough for active job search use without requiring re-authentication every session.

## Railway for backend and database hosting

Railway hosts the Node.js backend, PostgreSQL database, and Redis (if needed later) in one project. Services communicate over Railway's internal network. Environment variables are injected via Railway's reference syntax — `${{Postgres.DATABASE_URL}}` — so credentials never need to be manually copied between services.

Chose Railway over Render for this project because Railway offers managed PostgreSQL and the internal networking makes multi-service projects significantly simpler to configure.
