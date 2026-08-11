-- ====================================================================
-- SILAH-E-KHAIR FOUNDATION - SECURE SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Reconciled for full real-time database support and admin/member operations
-- ====================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id VARCHAR(50) UNIQUE NOT NULL, -- Format: SKF-XXXX or SKM-XXXX
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    city VARCHAR(100) DEFAULT 'Karachi',
    monthly_pledge VARCHAR(100) DEFAULT 'PKR 300 / month',
    membership_status VARCHAR(50) DEFAULT 'active',
    join_date VARCHAR(50),
    level VARCHAR(100) DEFAULT 'ACTIVE MEMBER',
    points INT DEFAULT 0,
    achievements TEXT[] DEFAULT ARRAY['New Member'],
    password TEXT DEFAULT 'member123',
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generate permanent sequential member IDs without browser-side randomness.
-- The advisory lock prevents two simultaneous approvals from receiving the
-- same number. Existing random IDs do not consume the SKF sequence.
CREATE SEQUENCE IF NOT EXISTS public.member_id_seq START WITH 1;

-- Continue after any SKF IDs already present in the database.
DO $$
DECLARE
    highest_existing BIGINT;
    current_sequence BIGINT;
BEGIN
    SELECT COALESCE(MAX((substring(member_id FROM '^SKF-([0-9]+)$'))::BIGINT), 0)
    INTO highest_existing
    FROM public.members
    WHERE member_id ~ '^SKF-[0-9]+$';

    SELECT last_value INTO current_sequence
    FROM public.member_id_seq;

    IF highest_existing > 0 OR current_sequence > 1 THEN
        PERFORM setval(
            'public.member_id_seq',
            GREATEST(highest_existing, current_sequence),
            true
        );
    ELSE
        PERFORM setval('public.member_id_seq', 1, false);
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.next_member_id()
RETURNS VARCHAR(50)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    next_number BIGINT;
    candidate VARCHAR(50);
BEGIN
    IF (auth.jwt() -> 'app_metadata' ->> 'role') <> 'admin' THEN
        RAISE EXCEPTION 'Only admin users can generate member IDs';
    END IF;

    PERFORM pg_advisory_xact_lock(hashtext('silah_member_id_sequence'));

    LOOP
        next_number := nextval('public.member_id_seq');
        candidate := 'SKF-' || lpad(next_number::TEXT, 4, '0');

        EXIT WHEN NOT EXISTS (
            SELECT 1
            FROM public.members
            WHERE member_id = candidate
        );
    END LOOP;

    RETURN candidate;
END;
$$;

REVOKE ALL ON FUNCTION public.next_member_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.next_member_id() TO authenticated;

-- 2. MEMBERSHIP APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.membership_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_code VARCHAR(50) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    city VARCHAR(100) DEFAULT 'Karachi',
    monthly_pledge VARCHAR(100) NOT NULL,
    occupation VARCHAR(255),
    reference_name VARCHAR(255),
    motivation TEXT,
    password TEXT DEFAULT 'member123',
    status VARCHAR(50) DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public applicants receive a real sequential SKF ID immediately. This
-- SECURITY DEFINER function performs the insert without granting anon access
-- to read or modify existing applications.
CREATE OR REPLACE FUNCTION public.submit_membership_application(
    p_full_name VARCHAR(255),
    p_phone VARCHAR(50),
    p_email VARCHAR(255),
    p_city VARCHAR(100),
    p_monthly_pledge VARCHAR(100),
    p_occupation VARCHAR(255),
    p_reference_name VARCHAR(255),
    p_motivation TEXT,
    p_password TEXT
)
RETURNS TABLE (
    app_code VARCHAR(50),
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    next_number BIGINT;
    assigned_id VARCHAR(50);
BEGIN
    IF NULLIF(trim(p_full_name), '') IS NULL OR NULLIF(trim(p_phone), '') IS NULL THEN
        RAISE EXCEPTION 'Name and phone are required';
    END IF;

    PERFORM pg_advisory_xact_lock(hashtext('silah_member_id_sequence'));

    LOOP
        next_number := nextval('public.member_id_seq');
        assigned_id := 'SKF-' || lpad(next_number::TEXT, 4, '0');

        EXIT WHEN NOT EXISTS (
            SELECT 1 FROM public.members WHERE member_id = assigned_id
        )
        AND NOT EXISTS (
            SELECT 1 FROM public.membership_applications WHERE app_code = assigned_id
        );
    END LOOP;

    RETURN QUERY
    INSERT INTO public.membership_applications (
        app_code,
        full_name,
        phone,
        email,
        city,
        monthly_pledge,
        occupation,
        reference_name,
        motivation,
        status,
        password
    )
    VALUES (
        assigned_id,
        trim(p_full_name),
        trim(p_phone),
        NULLIF(trim(p_email), ''),
        COALESCE(NULLIF(trim(p_city), ''), 'Karachi'),
        p_monthly_pledge,
        NULLIF(trim(p_occupation), ''),
        NULLIF(trim(p_reference_name), ''),
        NULLIF(trim(p_motivation), ''),
        'pending',
        COALESCE(p_password, 'member123')
    )
    RETURNING membership_applications.app_code, membership_applications.created_at;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_membership_application(
    VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, TEXT, TEXT
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.submit_membership_application(
    VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, TEXT, TEXT
) TO anon, authenticated;

-- 3. CONTRIBUTIONS TABLE
CREATE TABLE IF NOT EXISTS public.contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contribution_code VARCHAR(50) UNIQUE,
    member_id VARCHAR(50) NOT NULL,
    member_name VARCHAR(255) NOT NULL,
    month VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    payment_method VARCHAR(50) NOT NULL,
    payment_date VARCHAR(50) NOT NULL,
    receipt_reference VARCHAR(100),
    sender_account_name VARCHAR(255),
    sender_account_number VARCHAR(100),
    receipt_image TEXT,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    submission_type VARCHAR(50) DEFAULT 'member_contribution',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schema migrations for existing database tables
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS submission_type VARCHAR(50) DEFAULT 'member_contribution';
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS sender_account_name VARCHAR(255);
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS sender_account_number VARCHAR(100);
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS area VARCHAR(255);
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255);

-- 4. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_code VARCHAR(50) UNIQUE,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    expense_date VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    event_id VARCHAR(50),
    event_name VARCHAR(255),
    items JSONB,
    receipt_available BOOLEAN DEFAULT false,
    receipt_image TEXT,
    status VARCHAR(50) DEFAULT 'Confirmed',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PROGRAMS TABLE
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_code VARCHAR(50) UNIQUE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    impact TEXT,
    impact_metric VARCHAR(100),
    image_url TEXT,
    raised VARCHAR(50) DEFAULT '0',
    target VARCHAR(50) DEFAULT '0',
    status VARCHAR(50) DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Program CMS fields used by the admin form and public program pages.
-- These migrations are safe to run against an existing programs table.
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS purpose TEXT;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS delivery_method TEXT;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS icon_name VARCHAR(100) DEFAULT 'PackageCheck';

-- 6. GALLERY TABLE
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gallery_code VARCHAR(50) UNIQUE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    location VARCHAR(255) DEFAULT 'Karachi, Pakistan',
    date VARCHAR(50),
    event_date VARCHAR(50),
    status VARCHAR(50) DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. UPDATES TABLE
CREATE TABLE IF NOT EXISTS public.updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_code VARCHAR(50) UNIQUE,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT,
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    date VARCHAR(50),
    publish_date VARCHAR(50),
    read_time VARCHAR(50) DEFAULT '3 min read',
    tag VARCHAR(50) DEFAULT 'COMMUNITY',
    status VARCHAR(50) DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_code VARCHAR(50) UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    event_date VARCHAR(50) NOT NULL,
    event_time VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    registration_enabled BOOLEAN DEFAULT true,
    max_participants INT DEFAULT 50,
    points_for_attendance INT DEFAULT 100,
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. EVENT REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(50) NOT NULL,
    member_id VARCHAR(50) NOT NULL,
    member_name VARCHAR(255) NOT NULL,
    registered_at VARCHAR(50) NOT NULL,
    attended BOOLEAN DEFAULT false,
    points_awarded BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, member_id)
);

-- 10. EVENT ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.event_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(50) NOT NULL,
    member_id VARCHAR(50) NOT NULL,
    attendance_status VARCHAR(50) DEFAULT 'verified',
    verified_by VARCHAR(255) NOT NULL,
    verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. POINT ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.point_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_code VARCHAR(50) UNIQUE,
    activity VARCHAR(255),
    activity_name VARCHAR(255),
    default_points INT NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. POINT TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.point_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tx_code VARCHAR(50) UNIQUE,
    member_id VARCHAR(50) NOT NULL,
    member_name VARCHAR(255) NOT NULL,
    date VARCHAR(50),
    transaction_date VARCHAR(50),
    activity VARCHAR(255),
    activity_name VARCHAR(255),
    event_id VARCHAR(50),
    points INT,
    points_change INT,
    running_total INT DEFAULT 0,
    reason TEXT NOT NULL,
    admin_name VARCHAR(255) DEFAULT 'Admin Coordinator',
    created_by VARCHAR(255) DEFAULT 'System',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. MEMBER LEVELS TABLE
CREATE TABLE IF NOT EXISTS public.member_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level_code VARCHAR(50) UNIQUE,
    level_name VARCHAR(255) NOT NULL,
    min_points INT NOT NULL,
    max_points INT NOT NULL,
    description TEXT,
    benefits TEXT[] DEFAULT ARRAY[]::TEXT[],
    status VARCHAR(50) DEFAULT 'active',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. MEMBER BENEFITS TABLE
CREATE TABLE IF NOT EXISTS public.member_benefits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level_code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient VARCHAR(255) DEFAULT 'admin',
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_name VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    module VARCHAR(100) NOT NULL,
    record_id VARCHAR(100),
    reason TEXT,
    status VARCHAR(50) DEFAULT 'info',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. FOUNDATION SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.foundation_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & SET PERMISSIVE POLICIES FOR ALL ROLES
-- ====================================================================

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foundation_settings ENABLE ROW LEVEL SECURITY;

-- Drop old conflicting policies if re-applying
DROP POLICY IF EXISTS "Public Access Members" ON public.members;
DROP POLICY IF EXISTS "Public Access Membership Applications" ON public.membership_applications;
DROP POLICY IF EXISTS "Public Submit Membership Applications" ON public.membership_applications;
DROP POLICY IF EXISTS "Admin Read Membership Applications" ON public.membership_applications;
DROP POLICY IF EXISTS "Admin Update Membership Applications" ON public.membership_applications;
DROP POLICY IF EXISTS "Admin Delete Membership Applications" ON public.membership_applications;
DROP POLICY IF EXISTS "Public Access Contributions" ON public.contributions;
DROP POLICY IF EXISTS "Public Access Expenses" ON public.expenses;
DROP POLICY IF EXISTS "Public Access Programs" ON public.programs;
DROP POLICY IF EXISTS "Public Access Gallery" ON public.gallery;
DROP POLICY IF EXISTS "Public Access Updates" ON public.updates;
DROP POLICY IF EXISTS "Public Access Events" ON public.events;
DROP POLICY IF EXISTS "Public Access Event Registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Public Access Event Attendance" ON public.event_attendance;
DROP POLICY IF EXISTS "Public Access Point Activities" ON public.point_activities;
DROP POLICY IF EXISTS "Public Access Point Transactions" ON public.point_transactions;
DROP POLICY IF EXISTS "Public Access Member Levels" ON public.member_levels;
DROP POLICY IF EXISTS "Public Access Member Benefits" ON public.member_benefits;
DROP POLICY IF EXISTS "Public Access Notifications" ON public.notifications;
DROP POLICY IF EXISTS "Public Access Audit Logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Public Access Foundation Settings" ON public.foundation_settings;

-- Allow anon & authenticated roles full read/write access for application functionality
CREATE POLICY "Public Access Members" ON public.members FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
-- Public visitors may submit applications, but only an admin user may read,
-- approve, reject, or delete them. Mark the Supabase Auth user with:
-- raw_app_meta_data = {"role": "admin"} before using the admin portal.
CREATE POLICY "Public Submit Membership Applications"
ON public.membership_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admin Read Membership Applications"
ON public.membership_applications
FOR SELECT
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin Update Membership Applications"
ON public.membership_applications
FOR UPDATE
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin Delete Membership Applications"
ON public.membership_applications
FOR DELETE
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Public Access Contributions" ON public.contributions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Expenses" ON public.expenses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Programs" ON public.programs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Gallery" ON public.gallery FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Updates" ON public.updates FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Events" ON public.events FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Event Registrations" ON public.event_registrations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Event Attendance" ON public.event_attendance FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Point Activities" ON public.point_activities FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Point Transactions" ON public.point_transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Member Levels" ON public.member_levels FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Member Benefits" ON public.member_benefits FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Notifications" ON public.notifications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Audit Logs" ON public.audit_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Foundation Settings" ON public.foundation_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
