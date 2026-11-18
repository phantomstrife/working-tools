BEGIN;

-- Fix enforce_anon_attendant_update() so service_role (auth.uid() IS NULL, auth.role() = 'service_role')
-- is not treated as an anonymous user during admin/guard/winner server updates.
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

COMMIT;
