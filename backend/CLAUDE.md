# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Applyd is a job search tracker for high-volume tech job seekers. The backend is a Node.js/Express REST API with PostgreSQL. The repo root (`../`) contains `PRD.md` with full product requirements.

## Commands

```bash
npm run dev      # Start with nodemon (hot reload) — use during development
npm start        # Start without hot reload
```

No test runner or linter is configured yet. The entry point is `index.js` in this directory.

## Environment

Copy `.env` and set real values before running:

```
DATABASE_URL=postgresql://localhost:5432/applyd
JWT_SECRET=<strong random secret>
PORT=3001
BASE_URL=http://localhost:3001
```

Run `psql applyd < schema.sql` to initialize the database.

## Database Schema

Four tables defined in `schema.sql`:

- **users** — email/password_hash/name, owns all data
- **applications** — job applications with stage (`applied` → `phone_screen` → `technical` → `offer` → `rejected`), resume version label, notes, next_steps, archived flag
- **contacts** — people linked optionally to one application; relationship_type: `recruiter`, `engineer`, `hiring_manager`, `referral`, `other`; follow_up_days threshold drives overdue flagging
- **interactions** — dated notes on a contact (the interaction log), cascades on contact delete

All contacts and applications FK to `users(id)` with `ON DELETE CASCADE`. Contacts link to applications via `application_id` (nullable, `ON DELETE SET NULL`).

## Architecture

Stack: **Express** + **pg** (raw SQL, no ORM) + **jsonwebtoken** + **bcrypt** + **ws** (WebSocket) + **cors** + **dotenv**.

The API is user-scoped: every query must filter by `user_id` from the JWT. There is no admin layer.

### Auth flow
JWT issued on login/signup. All protected routes extract `user_id` from the token via middleware. No refresh tokens in V1 (PRD F03 mentions them as a goal but V1 ships with single long-lived tokens).

### Key business logic to implement
- **Today's Focus** (home screen): aggregate query across contacts (overdue by `follow_up_days` since `last_contacted_at`) and applications (stuck in same stage > 7 days, or `next_steps` field untouched > 5 days).
- **Overdue flag**: contact is overdue when `NOW() - last_contacted_at > follow_up_days * interval '1 day'`.
- **`last_contacted_at`** on contacts updates automatically when a new interaction row is inserted.
- **Pipeline summary**: count applications by stage group — Active (`applied`+`phone_screen`+`technical`), Waiting, Closed (`offer`+`rejected`+archived).
- **Archive**: sets `archived = TRUE`; archived apps are excluded from the Kanban board but not deleted.

### V1 scope boundary
V1 excludes: drag-and-drop Kanban, per-contact follow-up thresholds (global default only), email reminders, file uploads, search, analytics. Do not add these unless explicitly requested.
