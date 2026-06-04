# FriskyTrails CRM

A customer relationship management application for travel agencies to manage client leads, assign them to agents, and track communication logs.

## Tech Stack

| Layer    | Technology                                    |
| -------- | --------------------------------------------- |
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 7 |
| Backend  | Node.js (placeholder — ready for expansion)   |
| Tooling  | ESLint 10                                     |

## Features

- **Lead Management** — Add client leads with name, phone, age, origin, and destination details.
- **Agent Management** — Create and manage travel agents.
- **Assignment System** — Assign/unassign leads to agents with a single click.
- **Communication Logs** — Post and view notes/updates per lead, authored by the assigned agent.
- **Search & Filter** — Search leads by name, phone, origin, destination, or agent name; filter by agent or unassigned status.
- **Sorting** — Sort leads by newest, oldest, name (A–Z/Z–A), or age.
- **Dashboard Metrics** — Quick-view cards for total leads, assigned/unassigned counts, and top destination.
- **Dual View Modes** — Toggle between card grid and clean list layout.

## Project Structure

```
FriskyTrails CRM/
├── backend/                          # Node.js backend (placeholder)
│   └── package.json
├── crm_website_frontend/             # React + Vite frontend
│   ├── dist/                         # Production build output
│   │   └── assets/
│   │       ├── index-BiuoHaOp.js
│   │       └── index-CZN4X-4t.css
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx            # Sticky navigation bar with route links
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx         # Main dashboard: metrics, search, filters, lead cards
│   │   │   ├── AddLead.jsx           # Form to add new client leads
│   │   │   └── AddAgent.jsx          # Form to add new agents
│   │   ├── App.jsx                   # Root component: state management & routing
│   │   ├── index.css                 # Tailwind import & global styles
│   │   └── main.jsx                  # App entry point
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── README.md
│   └── vite.config.js                # Vite config with Tailwind & React plugins
├── .gitignore
└── README.md                         # This file
```

## Getting Started

### Prerequisites

- Node.js >= 18

### Frontend

```bash
cd crm_website_frontend
npm install
npm run dev          # Start dev server (default: http://localhost:5173)
```

### Backend

```bash
cd backend
npm install
npm start
```

### Production Build

```bash
cd crm_website_frontend
npm run build        # Output in crm_website_frontend/dist/
npm run preview      # Preview the production build locally
```

## Usage

1. **Add Agents** — Navigate to *Add Agent* and create team members (5 sample agents are pre-loaded).
2. **Add Leads** — Navigate to *Add Lead* and fill in the client's travel details.
3. **Assign Leads** — On the Dashboard, select an agent from the dropdown on any lead card and click **Confirm**.
4. **Chat Logs** — Click *Chat Log* on a lead card to view or post notes/updates.
5. **Filter & Sort** — Use the search bar, agent filter, and sort dropdown to narrow down leads.

## Planned Enhancements

- [ ] Persistent backend with database (e.g., PostgreSQL / MongoDB)
- [ ] Authentication & role-based access
- [ ] Email notifications for new lead assignments
- [ ] Lead status pipeline (new → contacted → booked)
- [ ] RESTful API for frontend-backend integration

## License

ISC
