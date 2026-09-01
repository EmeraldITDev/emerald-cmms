# Emerald CMMS

# Emerald Industrial Co. — CMMS/EAM Frontend MVP Build Prompt

## 1. Context & Goal

Build the **frontend MVP** of a Computerized Maintenance Management System (CMMS) for **Emerald Industrial Co.**, an industrial organization managing plant assets, maintenance work, technicians, and spare parts inventory.

This is a **frontend-only build** using mock/demo data (no real backend yet). The goal is a clickable, realistic, good-looking product that demonstrates the core maintenance workflow end-to-end — not a kitchen-sink feature list. Scope is deliberately trimmed to what a small industrial team actually needs to run maintenance day-to-day.

Brand name throughout the UI: **Emerald Industrial Co.** Use "Emerald CMMS" as the product name inside the app (e.g. sidebar logo, browser tab title, login screen).

---

## 2. Tech Stack

- **React + TypeScript**

- **Tailwind CSS** for styling

- **React Router** for navigation

- **Recharts** (or similar) for charts

- **Lucide** icons

- Mock data layer (local JSON/TS objects or in-memory state) simulating a real API — structure it so a real backend can be swapped in later without rewriting components

- Fully responsive (desktop primary, tablet secondary, mobile for the technician view specifically)

---

## 3. Roles In Scope (MVP)

Only build for these three roles — skip the rest for now:

1. **Maintenance Manager** — oversees everything, sees dashboard, assigns/approves work

2. **Technician** — mobile-friendly, works assigned jobs

3. **Storekeeper** — manages spare parts inventory

A simple role switcher (dropdown in the header) can simulate logging in as each role, since there's no real auth backend yet.

---

## 4. Design Direction

Premium industrial tone, not a generic admin template.

- **Palette:** deep navy (#0B1E33-ish) and charcoal for primary surfaces, white/off-white for light mode, electric blue as the primary accent, energy green for "healthy/online" states, amber for warnings, red for critical/overdue. Use color + icon/text together, never color alone.

- **Typography:** one clean sans-serif (e.g. Inter), strong hierarchy — don't let every label be the same weight/size.

- **Components:** clean cards with thin borders, subtle shadows, rounded-but-professional corners (not bubbly). Light use of a technical grid/blueprint texture in hero/empty areas only — never behind data.

- **Support both light and dark mode**, but dark mode is the "control room" flagship look.

- Status colors used consistently everywhere: 🟢 operating/healthy, 🟡 warning/due soon, 🟠 degraded, 🔴 critical/overdue, 🔵 informational/planned.

---

## 5. Core Navigation (Sidebar)

- Dashboard

- Assets

- Work Orders

- Preventive Maintenance

- Inventory

- Technicians

- Reports (basic)

- Settings (minimal — profile + role switcher)

That's it for MVP. No procurement, no HSE module, no digital twin, no IoT — those are explicitly **out of scope** for this build (documented in section 9).

---

## 6. Screens To Build

### 6.1 Login Screen

Simple branded login (email/password fields, "Emerald CMMS" logo/wordmark, industrial background visual). No real auth logic needed — a "Sign In" button routes into the app. Include a role selector for demo purposes.

### 6.2 Dashboard (Manager view)

KPI cards: Total Assets, Open Work Orders, Overdue Work Orders, PM Compliance %, Assets Critical/Down, Maintenance Cost (this month).

Charts: Work orders by status (bar/donut), Work orders by priority, Maintenance cost trend (line, last 6 months), PM compliance trend.

A short "Critical Assets" list and a "Recent Activity" feed.

### 6.3 Assets

- **Asset list/table**: searchable, filterable (by location, criticality, status), sortable, paginated.

- **Asset detail page**: header with name/ID/status/criticality/health score, tabs for Overview, Work Order History, PM Schedule, Parts Used, Documents (mock file list).

- Simple **parent/child hierarchy** (e.g. Plant → Unit → Equipment) shown as an expandable tree or breadcrumb — not unlimited enterprise nesting, just 2–3 levels deep for the demo.

### 6.4 Work Orders

- **List view** with filters (status, priority, technician, asset) and a **Kanban view** (Backlog → Scheduled → In Progress → Completed → Closed) with drag-and-drop.

- **Create/Edit Work Order** form: title, description, asset, priority, work type (corrective/preventive/emergency), assigned technician, due date, checklist items, parts needed.

- **Work Order detail page**: full info, status timeline, activity log, attached photos (mock), completion notes.

### 6.5 Preventive Maintenance

- List of PM schedules (asset, frequency — time-based e.g. every 30 days, or meter-based e.g. every 500 hours, next due date, status).

- Simple calendar view showing upcoming PM tasks.

- Auto-generates a Work Order (mock) when a PM comes due — show this relationship clearly in the UI.

### 6.6 Inventory (Storekeeper view)

- Spare parts table: part name, part number, quantity on hand, min/reorder level, location/bin, linked assets.

- Low-stock indicator when quantity < reorder level.

- Simple "Issue Part" / "Receive Stock" action (updates mock quantity, logs a transaction).

- Stock transaction history list.

### 6.7 Technicians

- Technician list: name, skills, current workload (# assigned jobs), availability status.

- Technician detail: profile, assigned work orders, job history, completion stats.

### 6.8 Technician Mobile View

- A dedicated, mobile-optimized flow: "My Jobs" list → job detail → checklist → mark complete (with mock photo upload, notes, and a signature pad placeholder).

- Large touch targets, minimal navigation depth.

### 6.9 Reports (basic)

- A simple reports page with 3–4 canned reports (Work Order Summary, PM Compliance, Inventory Status, Maintenance Cost) rendered as tables/charts with a mock "Export" button (PDF/CSV — button can be non-functional or trigger a toast for MVP).

### 6.10 Empty States

Every list/table needs a proper empty state (icon + message + primary action), not a blank screen.

---

## 7. Demo Data

Seed the app with a coherent, realistic dataset so it looks alive on first load:

- **Site:** Emerald Industrial Co. — Lagos Processing Plant (or similar single site for MVP)

- **~15–20 assets** across 2–3 categories (e.g. pumps, compressors, generators, electrical) with realistic names/IDs (e.g. `PMP-001 Feed Water Pump`, `GEN-002 Standby Generator`)

- **~30–40 work orders** spread across all statuses and priorities, with realistic dates (some overdue, some upcoming)

- **6–8 technicians** with varied skills and workloads

- **~20 spare parts**, a few intentionally below reorder level to demonstrate the low-stock state

- **8–10 PM schedules**, some due soon, some overdue

---

## 8. Interaction & Polish Details

- Global search (Cmd/Ctrl+K) across assets, work orders, and parts — basic fuzzy match on mock data is fine.

- Toast notifications for actions (work order created, stock issued, etc.).

- Loading skeletons for table/chart areas.

- Subtle micro-interactions on status changes and card hovers — don't overdo it.

- Fully keyboard/screen-reader reasonable (proper labels, focus states) even though this is a demo.

---

## 9. Explicitly Out of Scope for MVP

To keep this feasible, do **not** build (but structure code so these could be added later):

- Procurement/Purchase Orders, Suppliers

- HSE/Permits/LOTO workflows

- Root cause analysis / failure mode library

- AI assistant

- IoT/SCADA/sensor integration, digital twin, turbine health gauges

- Multi-tenant/multi-org architecture

- Real authentication, SSO, RBAC enforcement (mock role switcher is enough)

- Offline sync

---

## 10. Suggested Build Order

1. Design system basics (colors, typography, buttons, cards, table, badge/status components)

2. App shell — sidebar nav, header, role switcher, routing

3. Mock data layer (assets, work orders, PM, parts, technicians)

4. Dashboard

5. Asset list + detail

6. Work Orders (list, kanban, create/edit, detail)

7. Preventive Maintenance (list + calendar)

8. Inventory

9. Technicians + mobile technician flow

10. Reports + empty states + polish pass

---

**Deliverable:** a working React app matching the above, branded for Emerald Industrial Co., that can be demoed end-to-end (create a work order → assign a technician → complete it on the mobile view → see it reflected on the dashboard) using only mock data.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/598832c0-2565-437e-bf97-414e881c34be).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
