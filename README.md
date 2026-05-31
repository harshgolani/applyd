# Applyd

Job search tracker for tech job seekers. Tracks both formal applications and outreach contacts in one place, with a daily home screen that tells you exactly what needs attention.

**Live:** https://applyd-app.netlify.app
**Backend:** https://applyd-backend.up.railway.app
**PRD:** https://grandiose-package-4db.notion.site/Applyd-PRD-371ff64b23ab805981c9e7da9367799e

---

## What it does

- Track job applications across a Kanban board — Applied, Phone Screen, Interviewing, Offer
- Track outreach contacts with follow-up thresholds and interaction logs
- Home page shows a daily action list — overdue follow-ups, stale applications, pending next steps
- Snooze contacts you do not want to follow up on right now
- Real-time updates via WebSockets — changes sync across all open tabs instantly
- Per-user authentication — every user sees only their own data

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Real-time | WebSockets (ws) |
| Auth | JWT + bcrypt |
| Frontend hosting | Netlify |
| Backend hosting | Railway |

---

## Run locally

**Prerequisites:** PostgreSQL running locally, Node.js 18+

**Database setup:**
```bash
createdb applyd
psql applyd < backend/schema.sql
```

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
# Runs on http://localhost:3001
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5174
```

---

## Environment variables

**Backend `.env`:**
DATABASE_URL=postgresql://localhost:5432/applyd
JWT_SECRET=your_secret_key_here
PORT=3001
BASE_URL=http://localhost:3001

**Frontend `.env`:**
VITE_API_URL=http://localhost:3001

---

## API

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Create account |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/applications | Create application |
| GET | /api/applications | List active applications |
| GET | /api/applications/archived | List archived applications |
| GET | /api/applications/:id | Get application with contacts |
| PUT | /api/applications/:id | Update application |
| PATCH | /api/applications/:id/archive | Archive application |
| PATCH | /api/applications/:id/unarchive | Unarchive application |
| DELETE | /api/applications/:id | Delete application |

### Contacts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/contacts | Create contact |
| GET | /api/contacts | List contacts with overdue and snoozed flags |
| GET | /api/contacts/:id | Get contact with interactions |
| PUT | /api/contacts/:id | Update contact |
| PATCH | /api/contacts/:id/snooze | Snooze contact (3d, 7d, or forever) |
| PATCH | /api/contacts/:id/unsnooze | Remove snooze |
| DELETE | /api/contacts/:id | Delete contact |

### Interactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/contacts/:id/interactions | Log interaction |
| GET | /api/contacts/:id/interactions | List interactions |
| DELETE | /api/contacts/:id/interactions/:iid | Delete interaction |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard | Today's Focus data |

---

## WebSockets

Connect: `ws://localhost:3001?token=YOUR_JWT`

Events:
- `application:created`
- `application:updated`
- `application:archived`
- `application:unarchived`
- `application:deleted`
