BEGIN;

-- 1. Add the new columns (using IF NOT EXISTS in case columns already exist)
ALTER TABLE public.lucky_draw_attendants
    ADD COLUMN IF NOT EXISTS representative TEXT,
    ADD COLUMN IF NOT EXISTS representative_phone TEXT,
    ADD COLUMN IF NOT EXISTS citizen_id TEXT,
    ADD COLUMN IF NOT EXISTS accommodation BOOLEAN,
    ADD COLUMN IF NOT EXISTS sale_in_charge TEXT;

-- 2. Rebuild the generated search_text column and its GIN index to include the new fields
DROP INDEX IF EXISTS public.idx_lucky_draw_attendants_game_search;

ALTER TABLE public.lucky_draw_attendants
    DROP COLUMN IF EXISTS search_text;

ALTER TABLE public.lucky_draw_attendants
    ADD COLUMN search_text TEXT GENERATED ALWAYS AS (
        COALESCE(full_name, '') || ' ' || 
        COALESCE(email, '') || ' ' || 
        COALESCE(phone, '') || ' ' || 
        COALESCE(ticket_code, '') || ' ' || 
        COALESCE(company_name, '') || ' ' || 
        COALESCE(representative, '') || ' ' || 
        COALESCE(representative_phone, '') || ' ' || 
        COALESCE(citizen_id, '') || ' ' || 
        COALESCE(sale_in_charge, '')
    ) STORED;

CREATE INDEX idx_lucky_draw_attendants_game_search 
    ON public.lucky_draw_attendants 
    USING GIN (game_id, search_text gin_trgm_ops);

-- 3. Update the GUARD trigger function
CREATE OR REPLACE FUNCTION public.enforce_guard_attendant_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.role() = 'anon' OR auth.uid() IS NULL THEN
        RETURN NEW;
    END IF;

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
            NEW.citizen_id IS DISTINCT FROM OLD.citizen_id OR
            NEW.accommodation IS DISTINCT FROM OLD.accommodation OR
            NEW.sale_in_charge IS DISTINCT FROM OLD.sale_in_charge OR
            NEW.custom_metadata IS DISTINCT FROM OLD.custom_metadata OR
            NEW.qr_code_payload IS DISTINCT FROM OLD.qr_code_payload OR
            NEW.email_status IS DISTINCT FROM OLD.email_status OR
            NEW.email_sent_at IS DISTINCT FROM OLD.email_sent_at OR
            NEW.has_won IS DISTINCT FROM OLD.has_won OR
            NEW.created_at IS DISTINCT FROM OLD.created_at
        ) THEN
            RAISE EXCEPTION 'GUARD can only update representative, representative_phone, or check-in fields on lucky_draw_attendants';
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

-- 4. RLS Policies for Unauthenticated (anon) Attendant Self-Service
DROP POLICY IF EXISTS "Anon can view own attendant row by id" ON public.lucky_draw_attendants;
CREATE POLICY "Anon can view own attendant row by id"
ON public.lucky_draw_attendants
FOR SELECT
TO anon
USING (
    id = NULLIF(current_setting('request.headers', true)::json ->> 'x-attendant-id', '')::uuid
);

DROP POLICY IF EXISTS "Anon can update own personal info by id" ON public.lucky_draw_attendants;
CREATE POLICY "Anon can update own personal info by id"
ON public.lucky_draw_attendants
FOR UPDATE
TO anon
USING (
    id = NULLIF(current_setting('request.headers', true)::json ->> 'x-attendant-id', '')::uuid
)
WITH CHECK (
    id = NULLIF(current_setting('request.headers', true)::json ->> 'x-attendant-id', '')::uuid
);

-- 5. Trigger to restrict anon updates strictly to full_name, email, phone, citizen_id, custom_metadata
CREATE OR REPLACE FUNCTION public.enforce_anon_attendant_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.role() = 'anon' THEN
        IF (
            NEW.id IS DISTINCT FROM OLD.id OR
            NEW.game_id IS DISTINCT FROM OLD.game_id OR
            NEW.ticket_code IS DISTINCT FROM OLD.ticket_code OR
            NEW.company_name IS DISTINCT FROM OLD.company_name OR
            NEW.department IS DISTINCT FROM OLD.department OR
            NEW.representative IS DISTINCT FROM OLD.representative OR
            NEW.representative_phone IS DISTINCT FROM OLD.representative_phone OR
            NEW.accommodation IS DISTINCT FROM OLD.accommodation OR
            NEW.sale_in_charge IS DISTINCT FROM OLD.sale_in_charge OR
            NEW.qr_code_payload IS DISTINCT FROM OLD.qr_code_payload OR
            NEW.email_status IS DISTINCT FROM OLD.email_status OR
            NEW.email_sent_at IS DISTINCT FROM OLD.email_sent_at OR
            NEW.is_checked_in IS DISTINCT FROM OLD.is_checked_in OR
            NEW.checked_in_at IS DISTINCT FROM OLD.checked_in_at OR
            NEW.checked_in_by IS DISTINCT FROM OLD.checked_in_by OR
            NEW.check_in_method IS DISTINCT FROM OLD.check_in_method OR
            NEW.has_won IS DISTINCT FROM OLD.has_won OR
            NEW.created_at IS DISTINCT FROM OLD.created_at
        ) THEN
            RAISE EXCEPTION 'Anonymous users can only update full_name, email, phone, citizen_id, or custom_metadata on lucky_draw_attendants';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_anon_lucky_draw_attendant_update ON public.lucky_draw_attendants;
CREATE TRIGGER enforce_anon_lucky_draw_attendant_update
BEFORE UPDATE ON public.lucky_draw_attendants
FOR EACH ROW
EXECUTE FUNCTION public.enforce_anon_attendant_update();

COMMIT;
