# DSCMS Frontend — Version 1

React + Vite frontend for the Digital Student Counseling Management System.
Built to match the existing DSCMS backend exactly — every API call in
`src/api/` mirrors a real route in the backend's `src/routes/*.routes.js`.

## Tech Stack
- React 18 (functional components + hooks)
- Vite
- React Router v6
- Axios
- Tailwind CSS
- JWT stored in `localStorage`

## Prerequisites
- Node.js v18 or higher
- The DSCMS backend running locally (or reachable) — see the backend README
- At least one admin account seeded on the backend (`npm run seed:admin`)

## 1. Install

```bash
cd dscms-frontend
npm install
```

## 2. Configure the API URL

```bash
cp .env.example .env
```

Edit `.env` if your backend isn't on the default port:

```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## 3. Run

```bash
npm run dev
```

The app runs at `http://localhost:5173`. Make sure the backend's `CLIENT_ORIGIN`
env var matches this exact URL, or CORS will block requests.

## 4. Sign in

Use the email and password created when you seeded the backend's first
admin account, e.g.:

```
Email:    admin@svecw.edu.in
Password: ChangeMe@123   (you'll be forced to change this on first login)
```

Only `@svecw.edu.in` email addresses are accepted — this is enforced on
the backend, and the login form will reject other domains client-side too.

## How auth works in this app

- On login, the backend returns `{ user, token }`. Both are stored in
  `localStorage` (`dscms_token`, `dscms_user`).
- Every Axios request automatically attaches `Authorization: Bearer <token>`
  via an interceptor (`src/api/axiosInstance.js`).
- If any request comes back `401` (expired/invalid token), the interceptor
  clears storage and redirects to `/login` automatically.
- `ProtectedRoute` blocks all dashboard routes until a session is confirmed.
- `RoleRoute` keeps admins, mentors, and students inside their own route
  trees (`/admin/*`, `/mentor/*`, `/student/*`) — this is a UX convenience
  only; the backend's RBAC middleware is the real enforcement.
- `ForcePasswordResetGate` redirects any account with `mustResetPassword`
  still `true` (the default for every admin-created account) to
  `/reset-password` until they change it.
- Logging out calls `POST /auth/logout` (mostly symmetric — V1 has no
  server-side session store) and clears `localStorage`.

## Pages included

| Area | Pages |
|---|---|
| Auth | Login, Force password reset |
| Admin | Dashboard, Students, Mentors, Assignments, Counseling Records, Reports |
| Mentor | Dashboard, My Students, Student Profile, Sessions, Attendance, Messages, Concerns, Reports |
| Student | Dashboard, My Mentor, Counseling History, Attendance, Messages, My Concerns, Notifications |

## Project structure

```
src/
├── api/            # One file per backend route group, calls match 1:1
├── components/
│   ├── common/      # Button, Input, Select, Modal, Toast, Table, etc.
│   ├── forms/       # CreateMentorForm, CreateStudentForm, TempCredentialsCard
│   └── layout/      # Sidebar, Topbar, DashboardShell, PageHeader
├── context/         # AuthContext (session state)
├── hooks/           # useAuth, useFetch
├── pages/
│   ├── auth/
│   ├── admin/
│   ├── mentor/
│   └── student/
├── routes/          # AppRoutes, ProtectedRoute, RoleRoute, ForcePasswordResetGate
├── utils/           # navConfig.js (role-based sidebar nav)
├── App.jsx
└── main.jsx
```

## Notes on what's intentionally simple in V1
- No refresh tokens — a single JWT is issued at login (matches backend).
- No CSV bulk upload — students/mentors are created one at a time via forms.
- No real-time messaging — conversations refetch on send; no WebSocket.
- Temp passwords for newly created accounts are shown once in a modal
  (`TempCredentialsCard`) since there's no email service on the backend —
  the admin must communicate them manually.

## Build for production

```bash
npm run build
```

Output goes to `dist/`. Deploy as a static site (Vercel, Netlify, etc.)
and set `VITE_API_BASE_URL` to your deployed backend's `/api/v1` URL.
