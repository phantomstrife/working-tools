-- 1. Enums
CREATE TYPE email_status_type AS ENUM (
    'NOT_SENT', 
    'SENDING', 
    'SENT', 
    'FAILED'
);

CREATE TYPE check_in_method_type AS ENUM (
    'QR_SCAN', 
    'MANUAL_SEARCH'
);

-- 2. Table Definition
CREATE TABLE public.lucky_draw_attendants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
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
    checked_in_by UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    check_in_method check_in_method_type,
    has_won BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    search_text TEXT GENERATED ALWAYS AS (
        COALESCE(full_name, '') || ' ' || 
        COALESCE(email, '') || ' ' || 
        COALESCE(phone, '') || ' ' || 
        COALESCE(ticket_code, '') || ' ' || 
        COALESCE(company_name, '')
    ) STORED,

    UNIQUE (game_id, ticket_code)
);

-- 3.1 Functions

-- 3.2 Triggers
CREATE TRIGGER set_timestamp_lucky_draw_attendants
BEFORE UPDATE ON public.lucky_draw_attendants
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- 4. Row Level Security
ALTER TABLE public.lucky_draw_attendants ENABLE ROW LEVEL SECURITY;

-- 4.1 SUPER_ADMIN Access
CREATE POLICY "SUPER_ADMIN can manage all lucky_draw_attendants" ON public.lucky_draw_attendants
FOR ALL
USING (
    public.get_caller_role() = 'SUPER_ADMIN'
);

-- 4.2 ADMIN Access
CREATE POLICY "ADMINS can manage company lucky_draw_attendants" ON public.lucky_draw_attendants
FOR ALL
USING (
    public.get_caller_role() = 'ADMIN' 
    AND 
    (SELECT public.get_event_company_id(event_id) FROM public.games WHERE id = game_id) = public.get_caller_company_id()
);

-- 4.3 FIELD_STAFF & GUARD Access
CREATE POLICY "Staff can view assigned game attendants" ON public.lucky_draw_attendants
FOR SELECT
USING (
    game_id IN (SELECT game_id FROM public.game_accounts WHERE account_id = auth.uid())
);

CREATE POLICY "Staff can update assigned game attendants" ON public.lucky_draw_attendants
FOR UPDATE
USING (
    game_id IN (SELECT game_id FROM public.game_accounts WHERE account_id = auth.uid())
);

-- 5. Indexes
CREATE INDEX idx_lucky_draw_attendants_game_search ON public.lucky_draw_attendants USING GIN (game_id, search_text gin_trgm_ops);
CREATE INDEX idx_lucky_draw_attendants_live_game ON public.lucky_draw_attendants (game_id, is_checked_in, has_won);