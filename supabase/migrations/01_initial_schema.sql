-- ==============================================================================
-- JobFlow: Supabase Database Schema Migration
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    first_followup_days INTEGER NOT NULL DEFAULT 3,
    second_followup_days INTEGER NOT NULL DEFAULT 4,
    third_followup_days INTEGER NOT NULL DEFAULT 7,
    max_followups INTEGER NOT NULL DEFAULT 3,
    reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    reminder_time TIME NOT NULL DEFAULT '09:00',
    reminder_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    job_role TEXT NOT NULL,
    job_url TEXT,
    location TEXT,
    work_mode TEXT CHECK (work_mode IN ('Remote', 'Hybrid', 'On-site')),
    source TEXT CHECK (source IN ('LinkedIn', 'Naukri', 'Company Website', 'Referral', 'Recruiter', 'Email', 'Other')),
    applied_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Applied' CHECK (status IN ('Applied', 'HR Contact', 'Interview', 'Selected', 'Rejected', 'Withdrawn')),
    recruiter_name TEXT,
    recruiter_email TEXT,
    expected_ctc NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Followups Table
CREATE TABLE IF NOT EXISTS public.followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL CHECK (sequence_number >= 1),
    due_date DATE NOT NULL,
    method TEXT CHECK (method IS NULL OR method IN ('LinkedIn', 'Email', 'Phone', 'Other')),
    result TEXT CHECK (result IS NULL OR result IN ('No Response', 'Response Received', 'Not Interested', 'Recruiter Asked to Wait', 'Other')),
    notes TEXT,
    completed_at TIMESTAMPTZ,
    reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
    reminder_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_applied_date ON public.applications(applied_date);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_company_name ON public.applications(company_name);

CREATE INDEX IF NOT EXISTS idx_followups_user_id ON public.followups(user_id);
CREATE INDEX IF NOT EXISTS idx_followups_application_id ON public.followups(application_id);
CREATE INDEX IF NOT EXISTS idx_followups_due_date ON public.followups(due_date);
CREATE INDEX IF NOT EXISTS idx_followups_reminder_sent ON public.followups(reminder_sent) WHERE reminder_sent = FALSE;
CREATE INDEX IF NOT EXISTS idx_followups_completed_at ON public.followups(completed_at);

CREATE INDEX IF NOT EXISTS idx_settings_user_id ON public.settings(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followups ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Settings Policies
CREATE POLICY "Users can view own settings"
    ON public.settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
    ON public.settings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
    ON public.settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Applications Policies
CREATE POLICY "Users can view own applications"
    ON public.applications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
    ON public.applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
    ON public.applications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
    ON public.applications FOR DELETE
    USING (auth.uid() = user_id);

-- Followups Policies
CREATE POLICY "Users can view own followups"
    ON public.followups FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own followups"
    ON public.followups FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own followups"
    ON public.followups FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own followups"
    ON public.followups FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================================================
-- TRIGGERS & FUNCTIONS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_followups_updated_at
    BEFORE UPDATE ON public.followups
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile and settings on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, timezone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC')
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.settings (user_id, reminder_email)
    VALUES (
        NEW.id,
        NEW.email
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
