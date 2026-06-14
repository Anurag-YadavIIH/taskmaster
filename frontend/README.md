# TaskMaster Frontend

A React + TypeScript single-page app for the TaskMaster Spring Boot API: manage tasks, teams, comments, attachments, and real-time notifications.

## Stack

- [Vite](https://vitejs.dev/) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite`, no separate config file)
- [React Router](https://reactrouter.com/) for routing
- [TanStack Query](https://tanstack.com/query) for server state/data fetching
- [lucide-react](https://lucide.dev/) for icons
- [@microsoft/fetch-event-source](https://github.com/Azure/fetch-event-source) for the notifications SSE stream

## Prerequisites

- Node.js 20+
- The TaskMaster backend running and reachable (see the root [README](../README.md)). The backend must have CORS configured to allow this app's origin (`app.cors.allowed-origins`).

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and point it at your backend:

```bash
cp .env.example .env
```

```
VITE_API_BASE_URL=http://localhost:8080
```

If unset, the app defaults to `http://localhost:8080`. All requests are made directly to this URL (no dev proxy), so the backend's CORS configuration must allow the origin this app runs on (`http://localhost:5173` by default).

## Running

```bash
npm run dev
```

Open http://localhost:5173. Register a new account, or log in with existing credentials.

## Building

```bash
npm run build
```

Type-checks the project (`tsc -b`) and produces a production build in `dist/`.

```bash
npm run preview
```

Serves the production build locally for a final check.

## Features

- **Auth** — register/login with JWT stored in `localStorage`; automatically redirected to `/login` if the session expires.
- **Tasks** — paginated list with search, status/priority/team filters, sorting, a "My tasks" toggle, and a "New Task" modal (with an optional ✨ AI-generated description).
- **Task detail** — edit title/description/due date/priority, change status, assign to a team member or any user, comment, and upload/download attachments.
- **Teams** — create teams, view members, and (as the owner) add new members.
- **Profile** — update your display name and bio.
- **Notifications** — view notifications, mark as read, and receive live updates via Server-Sent Events with toast pop-ups and an unread badge in the top bar.

## Notes

- The AI description generator calls `/api/ai/generate-description`. If the backend has AI disabled, the app shows a friendly "AI is disabled" message instead of failing.
- Light mode only.
