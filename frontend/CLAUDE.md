# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Applyd is a job search tracker for high-volume tech job seekers. This directory is the React frontend. The full product requirements are in `../PRD.md`. The backend (Node.js/Express + PostgreSQL) lives in `../backend/` and has its own `CLAUDE.md`.

## Commands

```bash
npm run dev      # Start Vite dev server (http://localhost:5173) with HMR
npm run build    # Production build to dist/
npm run lint     # ESLint check
npm run preview  # Preview the production build locally
```

No test runner is configured yet.

## Architecture

The frontend is a **React 19 + Vite** SPA. Currently it contains only the Vite scaffold — the actual Applyd UI has not been built yet. All real product code will live under `src/`.

### Backend API

The backend runs on `http://localhost:3001` by default (see `../backend/.env`). The CORS allowlist includes `http://localhost:5173`, so the dev server connects without proxying. Production deploys to `https://applyd.netlify.app`.

Backend routes (all under `/api`):
- `POST /auth/signup`, `POST /auth/login` — JWT-based auth (no refresh tokens in V1)
- `GET|POST|PATCH|DELETE /applications` — Kanban cards with stage, resume version label, notes, next_steps, archived flag
- `GET|POST|PATCH|DELETE /contacts` — contacts linked optionally to one application; relationship types: `recruiter`, `engineer`, `hiring_manager`, `referral`, `other`
- `GET|POST|PATCH|DELETE /contacts/:id/interactions` — dated interaction log entries per contact
- `GET /dashboard` — Today's Focus and pipeline summary aggregates
- WebSocket at `ws://localhost:3001` — real-time updates

### Data model

- **Applications** move through stages: `applied` → `phone_screen` → `technical` → `offer` → `rejected`. Archived apps (`archived=true`) are hidden from the board but not deleted.
- **Contacts** have a `follow_up_days` threshold (global default: 5 days for active convos, 7 for cold outreach). A contact is overdue when `NOW() - last_contacted_at > follow_up_days * interval '1 day'`. `last_contacted_at` auto-updates when a new interaction is logged.
- **Today's Focus** surfaces: overdue contacts, applications stuck in the same stage > 7 days, applications with `next_steps` untouched > 5 days.

### V1 scope

Do not implement: drag-and-drop Kanban, per-contact follow-up thresholds, email reminders, file uploads for resumes, search, or analytics dashboard. These are explicitly V2 per the PRD.
