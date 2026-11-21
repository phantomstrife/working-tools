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
    salutation TEXT DEFAULT NULL CHECK (salutation IS NULL OR salutation IN ('Anh', 'Chị', 'Ông', 'Bà')),
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    ticket_code TEXT NOT NULL,
    company_name TEXT,
    department TEXT,
    representative_salutation TEXT DEFAULT NULL CHECK (representative_salutation IS NULL OR representative_salutation IN ('Anh', 'Chị', 'Ông', 'Bà')),
    representative TEXT,
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
        COALESCE(company_name, '') || ' ' || 
        COALESCE(representative, '')
    ) STORED,

    UNIQUE (game_id, ticket_code)
);

-- 3.1 Functions
CREATE OR REPLACE FUNCTION public.enforce_guard_attendant_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF public.get_caller_role() = 'GUARD' THEN
        IF (
            NEW.id IS DISTINCT FROM OLD.id OR
            NEW.game_id IS DISTINCT FROM OLD.game_id OR
            NEW.full_name IS DISTINCT FROM OLD.full_name OR
            NEW.email IS DISTINCT FROM OLD.email OR
            NEW.phone IS DISTINCT FROM OLD.phone OR
            NEW.ticket_code IS DISTINCT FROM OLD.ticket_code OR
            NEW.company_name IS DISTINCT FROM OLD.company_name OR
            NEW.department IS DISTINCT FROM OLD.department OR
            NEW.custom_metadata IS DISTINCT FROM OLD.custom_metadata OR
            NEW.qr_code_payload IS DISTINCT FROM OLD.qr_code_payload OR
            NEW.email_status IS DISTINCT FROM OLD.email_status OR
            NEW.email_sent_at IS DISTINCT FROM OLD.email_sent_at OR
            NEW.has_won IS DISTINCT FROM OLD.has_won OR
            NEW.created_at IS DISTINCT FROM OLD.created_at
        ) THEN
            RAISE EXCEPTION 'GUARD can only update representative or check-in fields on lucky_draw_attendants';
        END IF;

        IF (
            NEW.is_checked_in IS DISTINCT FROM OLD.is_checked_in OR
            NEW.checked_in_at IS DISTINCT FROM OLD.checked_in_at OR
            NEW.checked_in_by IS DISTINCT FROM OLD.checked_in_by OR
            NEW.check_in_method IS DISTINCT FROM OLD.check_in_method
        ) THEN
            IF NEW.checked_in_by IS DISTINCT FROM auth.uid() THEN
                RAISE EXCEPTION 'GUARD can only attribute check-in updates to themselves';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- 3.2 Triggers
CREATE TRIGGER enforce_guard_lucky_draw_attendant_update
BEFORE UPDATE ON public.lucky_draw_attendants
FOR EACH ROW
EXECUTE FUNCTION public.enforce_guard_attendant_update();

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

CREATE POLICY "FIELD_STAFF can update assigned game attendants" ON public.lucky_draw_attendants
FOR UPDATE
USING (
    public.get_caller_role() = 'FIELD_STAFF'
    AND
    game_id IN (SELECT game_id FROM public.game_accounts WHERE account_id = auth.uid())
)
WITH CHECK (
    public.get_caller_role() = 'FIELD_STAFF'
    AND
    game_id IN (SELECT game_id FROM public.game_accounts WHERE account_id = auth.uid())
);

CREATE POLICY "GUARD can update assigned game attendants representative" ON public.lucky_draw_attendants
FOR UPDATE
USING (
    public.get_caller_role() = 'GUARD'
    AND
    game_id IN (SELECT game_id FROM public.game_accounts WHERE account_id = auth.uid())
)
WITH CHECK (
    public.get_caller_role() = 'GUARD'
    AND
    game_id IN (SELECT game_id FROM public.game_accounts WHERE account_id = auth.uid())
);

-- 5. Indexes
CREATE INDEX idx_lucky_draw_attendants_game_search ON public.lucky_draw_attendants USING GIN (game_id, search_text gin_trgm_ops);
CREATE INDEX idx_lucky_draw_attendants_live_game ON public.lucky_draw_attendants (game_id, is_checked_in, has_won);