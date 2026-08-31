-- ==============================================================================
-- JobFlow: Optional Seed / Demo Data Script
-- Note: Replace 'USER_UUID_HERE' with an actual auth.users ID if executing directly in SQL Editor
-- ==============================================================================

DO $$
DECLARE
    demo_user_id UUID;
    app_tcs_id UUID := gen_random_uuid();
    app_infosys_id UUID := gen_random_uuid();
    app_razorpay_id UUID := gen_random_uuid();
    app_accenture_id UUID := gen_random_uuid();
    app_techm_id UUID := gen_random_uuid();
BEGIN
    -- Select the first existing user in auth.users, or exit if none exists
    SELECT id INTO demo_user_id FROM auth.users LIMIT 1;

    IF demo_user_id IS NOT NULL THEN
        -- Ensure profile & settings exist
        INSERT INTO public.profiles (id, full_name, email, timezone)
        VALUES (demo_user_id, 'Demo User', 'demo@jobflow.local', 'Asia/Kolkata')
        ON CONFLICT (id) DO UPDATE SET timezone = 'Asia/Kolkata';

        INSERT INTO public.settings (user_id, first_followup_days, second_followup_days, third_followup_days, max_followups, reminder_enabled, reminder_time)
        VALUES (demo_user_id, 3, 4, 7, 3, TRUE, '09:00')
        ON CONFLICT (user_id) DO NOTHING;

        -- 1. TCS - Applied with pending Follow-up #1 (Due Today or Upcoming)
        INSERT INTO public.applications (id, user_id, company_name, job_role, job_url, location, work_mode, source, applied_date, status, recruiter_name, recruiter_email, expected_ctc, notes)
        VALUES (
            app_tcs_id,
            demo_user_id,
            'TCS',
            'Senior React Developer',
            'https://careers.tcs.com/jobs/react-dev',
            'Ahmedabad, India',
            'Hybrid',
            'LinkedIn',
            CURRENT_DATE - INTERVAL '3 days',
            'Applied',
            'Priya Sharma',
            'priya.recruiter@example.com',
            1800000,
            'Applied through LinkedIn Easy Apply. Hiring manager looks active.'
        ) ON CONFLICT (id) DO NOTHING;

        INSERT INTO public.followups (application_id, user_id, sequence_number, due_date, reminder_sent)
        VALUES (
            app_tcs_id,
            demo_user_id,
            1,
            CURRENT_DATE,
            FALSE
        ) ON CONFLICT (id) DO NOTHING;

        -- 2. Infosys - HR Contact with Follow-up #1 completed (No Response) and Follow-up #2 pending
        INSERT INTO public.applications (id, user_id, company_name, job_role, job_url, location, work_mode, source, applied_date, status, recruiter_name, recruiter_email, expected_ctc, notes)
        VALUES (
            app_infosys_id,
            demo_user_id,
            'Infosys',
            'Full Stack Engineer (React/Node)',
            'https://infosys.com/careers/fs-eng',
            'Bangalore, India',
            'Remote',
            'Naukri',
            CURRENT_DATE - INTERVAL '8 days',
            'HR Contact',
            'Rajesh Kumar',
            'rajesh.talent@example.com',
            2200000,
            'Recruiter reached out on Naukri. Sent portfolio.'
        ) ON CONFLICT (id) DO NOTHING;

        INSERT INTO public.followups (application_id, user_id, sequence_number, due_date, method, result, notes, completed_at)
        VALUES (
            app_infosys_id,
            demo_user_id,
            1,
            CURRENT_DATE - INTERVAL '5 days',
            'LinkedIn',
            'No Response',
            'Sent polite inquiry on LinkedIn message.',
            NOW() - INTERVAL '5 days'
        ) ON CONFLICT (id) DO NOTHING;

        INSERT INTO public.followups (application_id, user_id, sequence_number, due_date, reminder_sent)
        VALUES (
            app_infosys_id,
            demo_user_id,
            2,
            CURRENT_DATE - INTERVAL '1 day',
            FALSE
        ) ON CONFLICT (id) DO NOTHING;

        -- 3. Razorpay - Interview Stage with Response Received
        INSERT INTO public.applications (id, user_id, company_name, job_role, job_url, location, work_mode, source, applied_date, status, recruiter_name, recruiter_email, expected_ctc, notes)
        VALUES (
            app_razorpay_id,
            demo_user_id,
            'Razorpay',
            'Frontend Platform Engineer',
            'https://razorpay.com/jobs/platform-frontend',
            'Bangalore, India',
            'Remote',
            'Company Website',
            CURRENT_DATE - INTERVAL '14 days',
            'Interview',
            'Ananya Roy',
            'ananya.talent@example.com',
            3200000,
            'Technical round scheduled for next Tuesday at 3 PM.'
        ) ON CONFLICT (id) DO NOTHING;

        INSERT INTO public.followups (application_id, user_id, sequence_number, due_date, method, result, notes, completed_at)
        VALUES (
            app_razorpay_id,
            demo_user_id,
            1,
            CURRENT_DATE - INTERVAL '11 days',
            'Email',
            'Response Received',
            'Recruiter replied and scheduled initial screening call.',
            NOW() - INTERVAL '11 days'
        ) ON CONFLICT (id) DO NOTHING;

        -- 4. Accenture - Selected
        INSERT INTO public.applications (id, user_id, company_name, job_role, job_url, location, work_mode, source, applied_date, status, recruiter_name, recruiter_email, expected_ctc, notes)
        VALUES (
            app_accenture_id,
            demo_user_id,
            'Accenture',
            'Lead React Architect',
            'https://accenture.com/careers/react-lead',
            'Pune, India',
            'Hybrid',
            'Referral',
            CURRENT_DATE - INTERVAL '25 days',
            'Selected',
            'Vikas Mehta',
            'vikas.leadrecruiter@example.com',
            2800000,
            'Received offer letter. Reviewing CTC breakup.'
        ) ON CONFLICT (id) DO NOTHING;

        -- 5. Tech Mahindra - Rejected after follow-ups
        INSERT INTO public.applications (id, user_id, company_name, job_role, job_url, location, work_mode, source, applied_date, status, recruiter_name, recruiter_email, expected_ctc, notes)
        VALUES (
            app_techm_id,
            demo_user_id,
            'Tech Mahindra',
            'UI Developer',
            'https://careers.techmahindra.com/ui-dev',
            'Hyderabad, India',
            'On-site',
            'Other',
            CURRENT_DATE - INTERVAL '30 days',
            'Rejected',
            'Sunil Joshi',
            'sunil.hiring@example.com',
            1400000,
            'Position put on hold for internal reallocation.'
        ) ON CONFLICT (id) DO NOTHING;

    END IF;
END $$;
