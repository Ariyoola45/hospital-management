# CareCross Hospital — Hospital Management System

A full-stack Hospital Management System built with **React**, **Firebase**, **Docker**, **Jenkins**, and a **Prometheus + Grafana + Alertmanager** monitoring stack.

Built as an academic project for the Department of Computer Science, Faculty of Computing and Information Technology, Lagos State University (LASU).

---

## Features

| Module | Description |
|---|---|
| **Authentication** | Firebase Authentication with role-based access (Administrator / Receptionist) |
| **Patient Registration** | Register, search, edit and remove patient records (bio-data, blood group, next of kin, allergies) |
| **Ward & Bed Management** | Ward/bed inventory, daily rates, live status (available / occupied / reserved / housekeeping / maintenance) |
| **Admissions** | Book patient admissions against available wards/beds, with automatic bed-status locking |
| **Admit Patient** | Move a booked admission to admitted, marking the bed occupied |
| **Discharge Patient** | Auto-calculated bill (days × daily rate), payment capture, bed sent to housekeeping/sanitation |
| **Billing / Payments** | Payment history and revenue totals by method (cash, card, transfer, insurance/HMO) |
| **Housekeeping** | Assign and track ward-cleaning/sanitation tasks; completing a task frees the bed |
| **Reports** | Occupancy breakdown, revenue-by-method chart, key stats (admin + receptionist) |
| **Staff** | Admin-only: assign Firebase Auth accounts to Admin/Receptionist roles |

---

## Tech Stack

- **Frontend:** React 19 + Vite, React Router, Recharts, react-hot-toast
- **Backend:** Firebase (Authentication, Cloud Firestore, Security Rules)
- **Containerization:** Docker (multi-stage build → Nginx static serve)
- **CI/CD:** Jenkins declarative pipeline
- **Monitoring:** Prometheus, Alertmanager, Grafana, nginx-prometheus-exporter

---

## Project Structure

```
hospital-ims/
├── app/                          # React application
│   ├── src/
│   │   ├── firebase/             # Firebase config + Firestore data-access modules
│   │   ├── context/               # AuthContext (role-based auth)
│   │   ├── components/            # Shared UI (Modal, StatusBadge, ProtectedRoute…)
│   │   ├── layouts/                # DashboardLayout (sidebar + routing outlet)
│   │   ├── pages/                  # One file per feature (Patients, Wards, Admissions…)
│   │   └── styles/app.css          # Design system (tokens, components)
│   ├── firestore.rules            # Firestore security rules (role-based)
│   ├── Dockerfile                 # Multi-stage build: Node build → Nginx serve
│   ├── nginx.conf                 # SPA routing + gzip + /stub_status for metrics
│   └── .env.example               # Firebase config template
├── monitoring/
│   ├── prometheus/
│   │   ├── prometheus.yml         # Scrape config
│   │   └── alert.rules.yml        # Alert rules (availability, error rate, traffic)
│   ├── alertmanager/
│   │   └── alertmanager.yml       # Alert routing (email/Slack placeholders)
│   └── grafana/
│       ├── provisioning/          # Auto-configured datasource + dashboard loader
│       └── dashboards/            # Dashboard JSON (app health panel set)
├── docker-compose.yml             # Orchestrates app + full monitoring stack
├── Jenkinsfile                    # CI/CD pipeline
└── README.md
```

---

## Step-by-Step Setup

### 1. Firebase Project Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Authentication → Email/Password**.
3. Enable **Cloud Firestore** (start in production mode).
4. In Firebase Console → Project Settings → General → Your apps, register a **Web app** and copy the config values.
5. Copy `app/.env.example` to `app/.env` and fill in the values:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
6. Deploy the security rules: `firebase deploy --only firestore:rules` (requires the Firebase CLI and `firebase init` run once in `app/`).
7. Create your first Admin user:
   - Firebase Console → Authentication → Add user (email + password).
   - Copy the generated User UID.
   - In Firestore, manually create a document at `users/{that UID}` with fields: `fullName`, `email`, `role: "admin"`.
   - (Once you have one admin, further staff can be added from the in-app **Staff** page — see the note on that page about creating the Auth login first.)

### 2. Run Locally (without Docker)

```bash
cd app
npm install
npm run dev
```

Visit `http://localhost:5173`.

### 3. Run with Docker (app only)

```bash
cd app
docker build \
  --build-arg VITE_FIREBASE_API_KEY=xxx \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN=xxx \
  --build-arg VITE_FIREBASE_PROJECT_ID=xxx \
  --build-arg VITE_FIREBASE_STORAGE_BUCKET=xxx \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID=xxx \
  --build-arg VITE_FIREBASE_APP_ID=xxx \
  -t carecross-hospital-app .
docker run -p 8080:80 carecross-hospital-app
```

Visit `http://localhost:8080`.

### 4. Run the Full Stack (App + Monitoring) with Docker Compose

Create a `.env` file at the **repo root** (not inside `app/`) with the same six `VITE_FIREBASE_*` variables, then:

```bash
docker compose up -d --build
```

| Service | URL | Notes |
|---|---|---|
| App | http://localhost:8080 | The hospital management system |
| Prometheus | http://localhost:9090 | Metrics + alert rule status |
| Alertmanager | http://localhost:9093 | Active/silenced alerts |
| Grafana | http://localhost:3000 | Login `admin` / `admin` (change immediately) |

Grafana auto-provisions the Prometheus datasource and a **"CareCross Hospital — App Health"** dashboard on first boot — no manual setup needed.

### 5. Configure Alerting (optional but recommended)

Edit `monitoring/alertmanager/alertmanager.yml` and uncomment/fill in either the `email_configs` or `webhook_configs` (Slack) blocks under the `receivers` section, then restart:

```bash
docker compose restart alertmanager
```

### 6. Set Up the Jenkins Pipeline

1. Install Jenkins with the **Docker Pipeline** and **Credentials Binding** plugins.
2. Add credentials (Manage Jenkins → Credentials) for: `dockerhub-creds` and the six `firebase-*` secret text entries listed at the top of the `Jenkinsfile`.
3. Create a new Pipeline job pointing at this repository, using the included `Jenkinsfile`.
4. Push to your main branch (or trigger manually) — the pipeline installs dependencies, lints, builds, builds the Docker image, pushes it, and redeploys via `docker compose`.

---

## Firestore Data Model (summary)

| Collection | Purpose |
|---|---|
| `users/{uid}` | Staff profile + role (`admin` \| `receptionist`) |
| `patients/{id}` | Patient bio-data, contact info, blood group, next of kin, allergies |
| `wards/{id}` | Ward/bed number, type (General/Private/ICU/Maternity/Pediatric), daily rate, live status |
| `admissions/{id}` | Admission linking a patient + ward/bed + dates + status |
| `payments/{id}` | Payment/billing records linked to an admission |
| `housekeepingTasks/{id}` | Ward cleaning/sanitation tasks linked to a bed |

## License

Built for academic purposes as part of a final-year/diploma project at Lagos State University. Free to adapt for coursework with attribution.
# hospital-management
