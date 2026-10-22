--- Enums ---
CREATE TYPE account_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'FIELD_STAFF', 'GUARD');
CREATE TYPE company_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE event_status AS ENUM ('DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');
CREATE TYPE game_type AS ENUM ('LUCKY_DRAW');
CREATE TYPE game_status AS ENUM ('PENDING', 'READY', 'LIVE', 'FINISHED');
CREATE TYPE log_action_type AS ENUM ('AUTH_LOGIN', 'ACCOUNT_CREATE', 'EMAIL_BATCH_SEND', 'CHECKIN_QR_SCAN', 'CHECKIN_MANUAL_SEARCH', 'PRIZE_DRAWN', 'REPORT_EXPORT');
CREATE TYPE email_status_type AS ENUM ('NOT_SENT', 'SENDING', 'SENT', 'FAILED');
CREATE TYPE check_in_method_type AS ENUM ('QR_SCAN', 'MANUAL_SEARCH');



--- Functions ---
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

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.accounts (id, email, password_hash, full_name, role)
    VALUES (
        new.id, 
        new.email, 
        new.encrypted_password, 
        COALESCE(new.raw_user_meta_data->>'full_name', 'System Admin'),
        'SUPER_ADMIN'
    );
    RETURN new;
END;
$$;



--- Tables ---
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



--- Triggers ---
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TRIGGER set_timestamp_companies BEFORE UPDATE ON companies FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_accounts BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_events BEFORE UPDATE ON events FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_games BEFORE UPDATE ON games FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_ld_prizes BEFORE UPDATE ON lucky_draw_prizes FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_ld_attendants BEFORE UPDATE ON lucky_draw_attendants FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();



--- Row Level Security Policies ---
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all accounts" 
ON public.accounts 
FOR SELECT 
TO authenticated 
USING (
  public.get_my_role() IN ('SUPER_ADMIN', 'ADMIN')
);

CREATE POLICY "Authenticated users can view companies" 
ON public.companies 
FOR SELECT 
TO authenticated 
USING (true); 