-- 1. Enums
CREATE TYPE account_role AS ENUM (
    'SUPER_ADMIN', 
    'ADMIN', 
    'FIELD_STAFF', 
    'GUARD', 
    'NOT_ASSIGNED'
);

-- 2. Table Definition
CREATE TABLE public.accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    password_hash TEXT,
    full_name TEXT,
    phone TEXT,
    role account_role NOT NULL DEFAULT 'NOT_ASSIGNED',
    company_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    search_text TEXT GENERATED ALWAYS AS (
        COALESCE(full_name, '') || ' ' || 
        COALESCE(email, '') || ' ' || 
        COALESCE(username, '') || ' ' || 
        COALESCE(phone, '')
    ) STORED
);

-- 3.1 Functions
CREATE OR REPLACE FUNCTION public.get_caller_role()
RETURNS public.account_role
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
    SELECT role FROM public.accounts WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_caller_company_id()
RETURNS uuid
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
    SELECT company_id FROM public.accounts WHERE id = auth.uid();
$$;

-- 3.2 Triggers
CREATE TRIGGER set_timestamp_accounts
BEFORE UPDATE ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER on_account_role_change
AFTER INSERT OR UPDATE OF role 
ON public.accounts
FOR EACH ROW
EXECUTE PROCEDURE public.sync_role_to_auth_metadata();

-- 4. Row Level Security
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- 4.1 USERS can read/update their own profile
CREATE POLICY "Users can view own account" ON public.accounts
FOR SELECT
USING (
    auth.uid() = id
);

CREATE POLICY "Users can update own account" ON public.accounts
FOR UPDATE
USING (
    auth.uid() = id
);

-- 4.2 SUPER_ADMIN Access: Can view, update, create, and delete any account
CREATE POLICY "SUPER_ADMIN can manage all accounts" ON public.accounts
FOR ALL
USING (
    public.get_caller_role() = 'SUPER_ADMIN'
);

-- 4.3 ADMIN Access: Can only manage accounts belonging to their assigned company
CREATE POLICY "ADMINS can manage company accounts" ON public.accounts
FOR ALL
USING (
    public.get_caller_role() = 'ADMIN' 
    AND 
    company_id = public.get_caller_company_id()
);

-- 5. Indexes
CREATE INDEX idx_accounts_search_trgm ON public.accounts USING GIN (search_text gin_trgm_ops);
CREATE INDEX idx_accounts_search_filters ON public.accounts (company_id, role, is_active, created_at DESC);