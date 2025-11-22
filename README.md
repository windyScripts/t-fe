# National Park Ticketing Frontend

Next.js app for booking national park safaris with end-to-end flow: view availability, pick tickets, create bookings, pay, and review history. Includes admin tools for managing users and shows.

## Features
- Homepage with park overview, ticket types (regular/priority), and paginated safari timings pulled from the backend.
- Booking flow: select ticket/timing, quantity auto-totals, summary with user details + auth, payment (UPI/Netbanking/Card) calling backend APIs, then receipt/history.
- Auth: register/login, token persistence, role-aware nav; history is login-gated.
- Admin: create/update users, create shows with ticket capacities, lookup bookings by email.
- UI: light/dark toggle, responsive layout, inline validation, loading overlays, error messaging.

## Tech
- Next.js (App Router), TypeScript, Tailwind (inline utility-first styles), custom API client.

## Running locally
```bash
npm install
npm run dev
```
Set `NEXT_PUBLIC_API_BASE` if your backend isn’t on `http://localhost:3001`.
