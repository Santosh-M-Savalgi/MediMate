## MediMate Frontend

Rich React UI for appointments, posts, chat, ratings, and comments. Built with Vite + React Router, animated with Framer Motion, charts via Recharts, and a thin Axios client that attaches the JWT from `localStorage`.

### Tech stack
- Vite + React 19 + React Router 7
- Axios (API client with bearer token interceptor)
- Framer Motion (page/component transitions)
- Recharts (dashboard area chart)
- date-fns (friendly timestamps)
- Vanilla CSS modules/util styles (see `src/styles/*.css`, `Navbar.module.css`)

### How it’s wired
- Entry: `src/main.jsx` mounts `<App/>` under `BrowserRouter` and loads premium styles.
- Routing: `src/App.jsx` defines routes and guards private screens with `ProtectedRoute` (redirects to `/login` when no token).
- Auth: `/auth/login` and `/auth/register` are posted via `Login.jsx` and `Register.jsx`; the returned token is stored in `localStorage`. Navbar fetches `/auth/me` to show role-aware links.
- API layer: `src/api.js` creates an Axios instance with `baseURL=http://localhost:5000/api` and injects `Authorization: Bearer <token>` when present.
- Toasts: `ToastProvider` wraps the app and renders stacked toasts bottom-left. Use `useToast()` to push messages.

### Routes & screens
- `/` – Landing choices for auth vs. SQL tools (`pages/LandingPage.jsx`).
- `/login`, `/register` – Auth flows.
- `/dashboard` – Personalized analytics cards, upcoming appointments, quick actions (`components/Dashboard.jsx`).
- `/posts` – Community posts CRUD (create + filter) with animated cards (`components/Posts.jsx`).
- `/comments` – Comments per post with search, likes, and read-more (`components/Comments.jsx`).
- `/appointments` – List, book, and update appointment status (`components/Appointments.jsx`).
- `/chat` – 1:1 chat with user lookup and message history (`components/Chat.jsx`).
- `/ratings` – Doctor ratings with animated star input and feedback list (`components/Ratings.jsx`).
- `/sql-queries` – Static SQL helper reference (`pages/SQLQueries.jsx`).

### Feature behavior (implementation notes)
- Dashboard
	- Fetches user profile `/auth/me` and appointments `/appointments`; for doctors also `/ratings?doctor_id=<id>`.
	- Derives upcoming appointments, renders stat cards, recent activity feed, and a Recharts area chart for synthetic analytics.
- Posts
	- Loads `/posts`, supports category filters, and creates posts via `/posts` with modal form; uses Framer Motion for list animations.
- Comments
	- Requires a post selection (fetched from `/posts`), then loads `/comments?post_id=<id>`.
	- Optimistic like toggles stored locally; comment creation via `/comments`.
- Appointments
	- Lists `/appointments`; booking posts doctor/date/time/notes to `/appointments`.
	- Status transitions via `PUT /appointments/:id` (confirm/cancel).
- Chat
	- User search/list via `/users` and `/users/lookup?username=` then message history `/chats?with_user=<id>`.
	- Sending posts to `/chats` and reloads thread; scroll kept to bottom.
- Ratings
	- Loads doctor ratings from `/ratings?doctor_id=<id>`; submits to `/ratings` with doctor, appointment, stars, and feedback.
- SQL Queries
	- Static code samples surfaced from backend schema for developer reference.

### Styling system
- Global app styles: `src/App.css`, `src/styles/components.css`, `src/styles/layout.css`, `src/styles/premium.css` (glassmorphism accents).
- Component-specific styles: `Navbar.module.css`; utility classes in `styles/*.css` for cards, buttons, modals, grids.

### Running locally
1) Install: `npm install`
2) Dev server: `npm run dev` (Vite on port 5173 by default)
3) Lint: `npm run lint`

Ensure backend is available at `http://localhost:5000/api` (or update `src/api.js`). JWT must be stored in `localStorage` under `token`.

### Integration contract (expected backend endpoints)
- `POST /auth/login`, `POST /auth/register`, `GET /auth/me`
- `GET/POST /posts`
- `GET/POST /comments` (with `post_id` query)
- `GET/POST /appointments`, `PUT /appointments/:id`
- `GET /users`, `GET /users/lookup?username=`, `GET /chats?with_user=`, `POST /chats`
- `GET /ratings?doctor_id=`, `POST /ratings`

### Notes & assumptions
- Auth is token-only; no refresh flow. All protected screens rely on `localStorage` token presence.
- Role-based UI: Navbar shows Appointments only for patients; Dashboard loads ratings only for doctors.
- Most lists re-fetch after mutations instead of local cache reconciliation; backend should return latest state.
