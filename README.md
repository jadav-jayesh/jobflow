# JobFlow — Simple Job Application Tracker

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)]()
[![React](https://img.shields.io/badge/React-19-61dafb.svg)]()
[![MUI](https://img.shields.io/badge/Material--UI-v6-007fff.svg)]()
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth-3ecf8e.svg)]()
[![Netlify](https://img.shields.io/badge/Netlify-Functions%20%2B%20Scheduled-00ad9f.svg)]()

**JobFlow** is a personal productivity web application designed to track job applications, automatically calculate and schedule follow-up outreach intervals, log recruiter response histories, and deliver automated daily email reminders to you.

---

## 1. Product Overview & Workflow

The user should never have to manually calculate or guess follow-up dates:

```text
       Apply for Job
             ↓
      Add Application
             ↓
System automatically calculates Follow-up #1 (e.g. +3 days)
             ↓
Follow-up becomes due (Today / Overdue)
             ↓
Netlify Scheduled Function sends reminder email to YOU
             ↓
Open JobFlow & Click "Follow Up"
             ↓
Record Outreach Method & Result
             ↓
[If 'No Response']       → Automatically schedules Follow-up #2 (+4 days) & #3 (+7 days)
[If 'Response Received'] → Stops automatic follow-ups; Update status (Interview, Offer, etc.)
```

---

## 2. Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **UI Library**: Material UI (MUI v6)
- **Routing**: React Router v6
- **Server State**: TanStack Query (React Query v5)
- **Forms & Validation**: React Hook Form + Zod
- **Client State**: Zustand (persisted theme and sidebar toggles)
- **Charts & Analytics**: Recharts
- **Date Handling**: date-fns + timezone-aware Intl APIs

### Backend & Serverless
- **Netlify Functions**:
  - `send-reminders.ts` — Scheduled function for daily follow-up email checks
  - `test-email.ts` — Verification function for testing SMTP connectivity from settings
- **Database & Auth**:
  - Supabase PostgreSQL
  - Supabase Auth (Email / Password)
  - Supabase Row Level Security (RLS) policies

---

## 3. Database Architecture & Row Level Security

The application database is structured across 4 normalized PostgreSQL tables:

```text
User (auth.users)
 │
 ├── profiles (id, full_name, email, timezone)
 ├── settings (user_id, first_followup_days, second_followup_days, third_followup_days, max_followups, reminder_enabled, reminder_time, reminder_email)
 └── applications (id, user_id, company_name, job_role, job_url, location, work_mode, source, applied_date, status, recruiter_name, recruiter_email, expected_ctc, notes)
       │
       └── followups (id, application_id, user_id, sequence_number, due_date, method, result, notes, completed_at, reminder_sent, reminder_sent_at)
```

### Row Level Security (RLS)
Every table is locked down with strict RLS policies ensuring users can only read, insert, update, and delete their own records via `auth.uid() = user_id`.

---

## 4. Setup & Deployment Guide

### Step 1: Supabase Setup
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in the Supabase Dashboard.
3. Open [`supabase/migrations/01_initial_schema.sql`](file:///home/groovy/jobflow/supabase/migrations/01_initial_schema.sql) and paste the entire script into the SQL Editor, then click **Run**.
   - This creates all tables, foreign keys with cascading deletes, indexes, triggers, and RLS policies.
4. Go to **Project Settings -> API** and copy:
   - **Project URL**
   - **anon public API key**
   - **service_role secret API key**

---

### Step 2: Configure Environment Variables

Create your local `.env` file from the provided `.env.example`:

```bash
cp .env.example .env
```

Set the values in `.env`:

```ini
# Frontend Variables (Exposed to browser)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Serverless Secrets (Configured in Netlify Dashboard for Production)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# SMTP / Email Provider Configuration (e.g. Gmail, SendGrid, Brevo, SES)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM="JobFlow Reminders <reminders@jobflow.app>"
```

---

### Step 3: Local Development

Install dependencies and start the Vite dev server:

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Start Vite dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

### Step 4: Netlify Deployment

1. Push your repository to GitHub / GitLab.
2. Log in to [Netlify](https://netlify.com) and click **"Add new site" -> "Import an existing project"**.
3. Select your repository.
4. Build configuration is auto-detected via [`netlify.toml`](file:///home/groovy/jobflow/netlify.toml):
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
5. Go to **Site settings -> Environment variables** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASSWORD`
   - `SMTP_FROM`
6. Click **Deploy Site**.

---

## 5. Follow-up Automation Logic & Rules

| Sequence | Default Days | Calculation Base |
| :--- | :--- | :--- |
| **Follow-up #1** | +3 days | `applied_date` |
| **Follow-up #2** | +4 days | Follow-up #1 `due_date` |
| **Follow-up #3** | +7 days | Follow-up #2 `due_date` |
| **Follow-up #4+** | Configurable limit | Default max is 3 |

### Business Rules
- **Active Statuses** (`Applied`, `HR Contact`, `Interview`): Follow-up scheduling proceeds normally.
- **Inactive Statuses** (`Selected`, `Rejected`, `Withdrawn`): Automatic follow-up creation immediately ceases.
- **Outreach Results**:
  - `No Response`: Marks current follow-up completed and automatically schedules the next sequence item if sequence < max.
  - `Response Received`: Completes follow-up and stops automatic follow-ups.
- **Dynamic States**:
  - 🟢 **Upcoming**: Due date is in the future.
  - 🟡 **Today**: Due date is today in user's timezone.
  - 🔴 **Overdue**: Due date is in the past and uncompleted.
  - ✓ **Completed**: Outreach logged.
  - — **Not Required**: Application is in an inactive stage.

---

## 6. Email Reminder System

- Netlify Scheduled Functions check daily at `09:00 UTC` for due reminders.
- Reminders are sent **only to the user** (never to recruiters).
- Emails contain recruiter contact information and a ready-to-use outreach message template.
- Idempotent: `reminder_sent = true` is updated only upon verified SMTP dispatch. Failed emails are safely retried on the next run.

---

## 7. Testing & Verification

Run the test suite with Vitest:

```bash
npx vitest run
```

Tests verify:
- Sequence 1 (+3 days), Sequence 2 (+4 days), Sequence 3 (+7 days) calculations.
- Maximum follow-up limits.
- Stopping automation on `Response Received`.
- Halting automation when application status is inactive (`Rejected`, `Selected`, `Withdrawn`).
- Timezone and dynamic state calculations.

---

## 8. License

MIT License — Built for personal productivity.
