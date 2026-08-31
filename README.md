# CareerPulse — Smart Job Application & Follow-up Tracker

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)]()
[![React](https://img.shields.io/badge/React-19-61dafb.svg)]()
[![MUI](https://img.shields.io/badge/Material--UI-v6-007fff.svg)]()
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth-3ecf8e.svg)]()
[![Netlify](https://img.shields.io/badge/Netlify-Functions%20%2B%20Scheduled-00ad9f.svg)]()

**CareerPulse** is a personal productivity web application designed to track job applications, automatically calculate and schedule follow-up outreach intervals (+3d, +4d, +7d), log recruiter response histories, and deliver automated daily email reminders to you.

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
Open CareerPulse & Click "Follow Up"
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
  - Supabase Auth (Email / Password with autoconfirm)
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

---

## 4. Setup & Deployment Guide

### Step 1: Environment Variables

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
SMTP_FROM="CareerPulse Reminders <reminders@careerpulse.app>"
```

### Step 2: Local Development

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Start Vite dev server
npm run dev
```

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

---

## 6. License

MIT License — Built for personal productivity.
