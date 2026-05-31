# Applyd Frontend

React + Vite frontend for Applyd.

**Live:** https://applyd-app.netlify.app

---

## Stack

- React 19
- Vite
- React Router v7
- Pure CSS with CSS variables (no component library)

---

## Run locally

```bash
npm install
npm run dev
# Runs on http://localhost:5174
```

Requires backend running at `http://localhost:3001`. Set `VITE_API_URL` in `.env` to switch between local and production backend.

---

## Structure

src/
├── App.jsx                  — routing, auth protection, WebSocket init
├── context/
│   └── AuthContext.jsx      — auth state, login, signup, logout
├── hooks/
│   └── useWebSocket.js      — WebSocket connection with JWT auth
├── lib/
│   ├── api.js               — fetch wrapper with auth headers
│   └── utils.js             — timeAgo, daysSince, STAGE_LABELS, STAGE_COLORS
├── pages/
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── TodayPage.jsx        — Home screen, action list, stat pills, snooze
│   ├── ApplicationsPage.jsx — Kanban board, rejected and archived sections
│   ├── ContactsPage.jsx     — contacts list, needs follow-up, snoozed sections
│   └── ContactDetailPage.jsx — interaction log, notes, link application, delete
└── components/
├── Layout.jsx            — sidebar + main content wrapper
├── Sidebar.jsx           — nav links, user info, logout
├── ApplicationCard.jsx   — Kanban card
├── ApplicationSlideOver.jsx — edit panel, archive/unarchive/delete
├── AddApplicationModal.jsx
├── ContactCard.jsx
└── AddContactModal.jsx

---

## Key features

- JWT auth with persistent sessions via localStorage
- Real-time Kanban updates via WebSocket — changes sync across tabs
- Today page with unified action list — overdue follow-ups, stale applications, pending next steps
- Snooze contacts for 3 days, 7 days, or forever from the home screen
- Application slide-over panel — edit all fields, archive/unarchive, delete
- Contact detail page — interaction log, notes auto-save on blur, link to application
- Collapsible rejected and archived sections on the Kanban board
- Mobile responsive with hamburger menu sidebar

