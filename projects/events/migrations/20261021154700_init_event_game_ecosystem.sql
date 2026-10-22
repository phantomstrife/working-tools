-- 1. Grant usage of the public schema to the Supabase API roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Grant all privileges on all existing tables in the public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Grant all privileges on any existing sequences or routines
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 4. Ensure any future tables we create automatically get these permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

--- 1. Enums ---
CREATE TYPE account_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'FIELD_STAFF', 'GUARD');
CREATE TYPE company_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE event_status AS ENUM ('DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');
CREATE TYPE game_type AS ENUM ('LUCKY_DRAW');
CREATE TYPE game_status AS ENUM ('PENDING', 'READY', 'LIVE', 'FINISHED');
CREATE TYPE log_action_type AS ENUM ('AUTH_LOGIN', 'ACCOUNT_CREATE', 'EMAIL_BATCH_SEND', 'CHECKIN_QR_SCAN', 'CHECKIN_MANUAL_SEARCH', 'PRIZE_DRAWN', 'REPORT_EXPORT');
CREATE TYPE email_status_type AS ENUM ('NOT_SENT', 'SENDING', 'SENT', 'FAILED');
CREATE TYPE check_in_method_type AS ENUM ('QR_SCAN', 'MANUAL_SEARCH');

--- 2. Tables ---
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tax_code TEXT,
    industry TEXT,
    contact_person TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    logo_url TEXT,
    status company_status DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role account_role NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL, 
    created_by UUID REFERENCES accounts(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    location_name TEXT,
    location_address TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    banner_url TEXT,
    theme_config JSONB DEFAULT '{}'::jsonb,
    status event_status DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    game_type game_type NOT NULL,
    config JSONB DEFAULT '{}'::jsonb,
    is_dev_only BOOLEAN DEFAULT false,
    status game_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE game_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    action_type log_action_type NOT NULL,
    target_entity TEXT NOT NULL,
    target_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lucky_draw_prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    tier_order INT NOT NULL,
    total_quantity INT NOT NULL CHECK (total_quantity >= 1),
    remaining_quantity INT NOT NULL CHECK (remaining_quantity >= 0 AND remaining_quantity <= total_quantity),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lucky_draw_attendants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    ticket_code TEXT NOT NULL,
    company_name TEXT,
    department TEXT,
    custom_metadata JSONB DEFAULT '{}'::jsonb,
    qr_code_payload TEXT UNIQUE NOT NULL,
    email_status email_status_type DEFAULT 'NOT_SENT',
    email_sent_at TIMESTAMPTZ,
    is_checked_in BOOLEAN DEFAULT false,
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID REFERENCES accounts(id) ON DELETE SET NULL,
    check_in_method check_in_method_type,
    has_won BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (game_id, ticket_code)
);

CREATE TABLE lucky_draw_winners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    prize_id UUID NOT NULL REFERENCES lucky_draw_prizes(id) ON DELETE CASCADE,
    attendant_id UUID NOT NULL REFERENCES lucky_draw_attendants(id) ON DELETE CASCADE,
    drawn_by UUID REFERENCES accounts(id) ON DELETE SET NULL,
    won_at TIMESTAMPTZ DEFAULT now()
);


--- 3. Functions ---
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER 
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER SET search_path = ''
STABLE
AS $$
  SELECT role::text FROM public.accounts WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER SET search_path = ''
STABLE
AS $$
  SELECT company_id FROM public.accounts WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_assigned_to_event(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.game_accounts
    WHERE event_id = p_event_id AND account_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_assigned_to_game(p_game_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.game_accounts
    WHERE game_id = p_game_id AND account_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_my_company_event(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events
    WHERE id = p_event_id AND company_id = public.get_my_company_id()
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.accounts (id, email, password_hash, full_name, username, phone, role, company_id, created_by, is_active)
    VALUES (
        new.id,
        new.email,
        new.encrypted_password,
        COALESCE(NULLIF(new.raw_user_meta_data->>'full_name', ''), 'System Admin'),
        NULLIF(new.raw_user_meta_data->>'username', ''),
        NULLIF(new.raw_user_meta_data->>'phone', ''),
        COALESCE(NULLIF(new.raw_app_meta_data->>'role', '')::public.account_role, 'SUPER_ADMIN'),
        NULLIF(new.raw_app_meta_data->>'company_id', '')::uuid,
        NULLIF(new.raw_app_meta_data->>'created_by', '')::uuid,
        COALESCE(NULLIF(new.raw_app_meta_data->>'is_active', '')::boolean, true)
    );
    RETURN new;
END;
$$;

-- Keep email / password hash in public.accounts in sync when they change in auth.users
CREATE OR REPLACE FUNCTION public.handle_user_updated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    UPDATE public.accounts
    SET email = new.email,
        password_hash = new.encrypted_password
    WHERE id = new.id;
    RETURN new;
END;
$$;

--- 4. Triggers ---
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
CREATE TRIGGER on_auth_user_updated AFTER UPDATE OF email, encrypted_password ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_user_updated();

CREATE TRIGGER set_timestamp_companies BEFORE UPDATE ON companies FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_accounts BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_events BEFORE UPDATE ON events FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_games BEFORE UPDATE ON games FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_ld_prizes BEFORE UPDATE ON lucky_draw_prizes FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_ld_attendants BEFORE UPDATE ON lucky_draw_attendants FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

--- 5. Row Level Security Policies ---
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lucky_draw_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lucky_draw_attendants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lucky_draw_winners ENABLE ROW LEVEL SECURITY;

-- ACCOUNTS POLICIES
CREATE POLICY "Accounts: View Own Profile" ON public.accounts FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Accounts: Admin View" ON public.accounts FOR SELECT TO authenticated 
USING (
  public.get_my_role() = 'SUPER_ADMIN' OR 
  (public.get_my_role() = 'ADMIN' AND company_id = public.get_my_company_id())
);

-- Allow Super Admins to insert any account, and Admins to insert FIELD_STAFF / GUARD accounts in their own company
CREATE POLICY "Accounts: Admin Insert" 
ON public.accounts 
FOR INSERT 
TO authenticated 
WITH CHECK (
  public.get_my_role() = 'SUPER_ADMIN' OR 
  (
    public.get_my_role() = 'ADMIN' AND 
    company_id = public.get_my_company_id() AND 
    role IN ('FIELD_STAFF', 'GUARD')
  )
);

-- Allow Super Admins to update all accounts, and Admins to update accounts within their own company
CREATE POLICY "Accounts: Admin Update" 
ON public.accounts 
FOR UPDATE 
TO authenticated 
USING (
  public.get_my_role() = 'SUPER_ADMIN' OR 
  (public.get_my_role() = 'ADMIN' AND company_id = public.get_my_company_id())
)
WITH CHECK (
  public.get_my_role() = 'SUPER_ADMIN' OR 
  (
    public.get_my_role() = 'ADMIN' AND 
    company_id = public.get_my_company_id() AND 
    role IN ('ADMIN', 'FIELD_STAFF', 'GUARD')
  )
);

-- Allow Super Admins to delete any account, and Admins to delete accounts within their own company
CREATE POLICY "Accounts: Admin Delete" 
ON public.accounts 
FOR DELETE 
TO authenticated 
USING (
  public.get_my_role() = 'SUPER_ADMIN' OR 
  (public.get_my_role() = 'ADMIN' AND company_id = public.get_my_company_id())
);

-- COMPANIES POLICIES
-- Allow Super Admins to view all companies, and Admins to view their linked company (for joins/context)
CREATE POLICY "Companies: Admin View" ON public.companies FOR SELECT TO authenticated 
USING (
  public.get_my_role() = 'SUPER_ADMIN' OR 
  (public.get_my_role() = 'ADMIN' AND id = public.get_my_company_id())
);

-- Only Super Admins can insert new companies
CREATE POLICY "Companies: Super Admin Insert" 
ON public.companies 
FOR INSERT 
TO authenticated 
WITH CHECK (
  public.get_my_role() = 'SUPER_ADMIN'
);

-- Only Super Admins can update companies
CREATE POLICY "Companies: Super Admin Update" 
ON public.companies 
FOR UPDATE 
TO authenticated 
USING (
  public.get_my_role() = 'SUPER_ADMIN'
)
WITH CHECK (
  public.get_my_role() = 'SUPER_ADMIN'
);

-- Only Super Admins can delete companies
CREATE POLICY "Companies: Super Admin Delete" 
ON public.companies 
FOR DELETE 
TO authenticated 
USING (
  public.get_my_role() = 'SUPER_ADMIN'
);

-- EVENTS POLICIES
CREATE POLICY "Events: Admin Select" 
ON public.events 
FOR SELECT 
TO authenticated 
USING (
  public.get_my_role() = 'SUPER_ADMIN' OR 
  (public.get_my_role() = 'ADMIN' AND company_id = public.get_my_company_id())
);

CREATE POLICY "Events: Staff View" 
ON public.events 
FOR SELECT 
TO authenticated 
USING (
  public.is_assigned_to_event(id)
);

CREATE POLICY "Events: Admin Insert" 
ON public.events 
FOR INSERT 
TO authenticated 
WITH CHECK (
  public.get_my_role() = 'SUPER_ADMIN' OR 
  (public.get_my_role() = 'ADMIN' AND company_id = public.get_my_company_id())
);

CREATE POLICY "Events: Admin Update" 
ON public.events 
FOR UPDATE 
TO authenticated 
USING (
  public.get_my_role() = 'SUPER_ADMIN' OR 
  (public.get_my_role() = 'ADMIN' AND company_id = public.get_my_company_id())
)
WITH CHECK (
  public.get_my_role() = 'SUPER_ADMIN' OR 
  (public.get_my_role() = 'ADMIN' AND company_id = public.get_my_company_id())
);

CREATE POLICY "Events: Admin Delete" 
ON public.events 
FOR DELETE 
TO authenticated 
USING (
  public.get_my_role() = 'SUPER_ADMIN' OR 
  (public.get_my_role() = 'ADMIN' AND company_id = public.get_my_company_id())
);

-- GAMES POLICIES
CREATE POLICY "Games: Admin Access" ON public.games FOR ALL TO authenticated 
USING (
  (public.get_my_role() = 'SUPER_ADMIN') OR 
  (public.get_my_role() = 'ADMIN' AND is_dev_only = false AND public.is_my_company_event(event_id))
);
CREATE POLICY "Games: Staff View" ON public.games FOR SELECT TO authenticated 
USING (
  public.is_assigned_to_game(id)
);

-- GAME_ACCOUNTS (Assignments) POLICIES
CREATE POLICY "Game_Accounts: Admin Access" ON public.game_accounts FOR ALL TO authenticated 
USING (
  public.get_my_role() = 'SUPER_ADMIN' OR 
  (public.get_my_role() = 'ADMIN' AND public.is_my_company_event(event_id))
);

-- LUCKY DRAW POLICIES
CREATE POLICY "LuckyDraw: Admin Manage Prizes" ON public.lucky_draw_prizes FOR ALL TO authenticated 
USING (public.get_my_role() IN ('SUPER_ADMIN', 'ADMIN'))
WITH CHECK (public.get_my_role() IN ('SUPER_ADMIN', 'ADMIN'));

CREATE POLICY "LuckyDraw: Staff View Prizes" ON public.lucky_draw_prizes FOR SELECT TO authenticated USING (true);

CREATE POLICY "LuckyDraw: Staff Update Prizes" ON public.lucky_draw_prizes FOR UPDATE TO authenticated 
USING (public.get_my_role() = 'FIELD_STAFF')
WITH CHECK (public.get_my_role() = 'FIELD_STAFF');

CREATE POLICY "LuckyDraw: Manage Attendants" ON public.lucky_draw_attendants FOR ALL TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "LuckyDraw: Manage Winners" ON public.lucky_draw_winners FOR ALL TO authenticated 
USING (true)
WITH CHECK (true);

-- LOGS (Audit Trail) POLICIES
CREATE POLICY "Logs: Insert Only" ON public.logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = account_id);
CREATE POLICY "Logs: Admin View" ON public.logs FOR SELECT TO authenticated 
USING (
  public.get_my_role() = 'SUPER_ADMIN' OR 
  (public.get_my_role() = 'ADMIN' AND EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = logs.account_id AND accounts.company_id = public.get_my_company_id()
  ))
);