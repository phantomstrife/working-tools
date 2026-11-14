BEGIN;

-- 1. Allow anon self-service updates on full_name, email, phone, citizen_id, and custom_metadata
-- for all attendants regardless of accommodation status.
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

-- 2. Update anon trigger to allow all attendants (regardless of accommodation) to update
-- full_name, email, phone, citizen_id, and custom_metadata.
CREATE OR REPLACE FUNCTION public.enforce_anon_attendant_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.role() = 'anon' OR auth.uid() IS NULL THEN
        IF (
            NEW.id IS DISTINCT FROM OLD.id OR
            NEW.game_id IS DISTINCT FROM OLD.game_id OR
            NEW.ticket_code IS DISTINCT FROM OLD.ticket_code OR
            NEW.company_name IS DISTINCT FROM OLD.company_name OR
            NEW.department IS DISTINCT FROM OLD.department OR
            NEW.representative IS DISTINCT FROM OLD.representative OR
            NEW.accommodation IS DISTINCT FROM OLD.accommodation OR
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

-- 3. Ensure anon SELECT and UPDATE RLS policies check only x-attendant-id without accommodation restriction.
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

COMMIT;
