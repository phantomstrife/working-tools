-- Move attendant edit history from lucky_draw_attendants.custom_metadata to public.logs

-- 1. Extend log_action_type enum with attendant audit actions
ALTER TYPE public.log_action_type ADD VALUE IF NOT EXISTS 'ATTENDANT_GUARD_EDIT';
ALTER TYPE public.log_action_type ADD VALUE IF NOT EXISTS 'ATTENDANT_SELF_SERVICE_CONFIRM';
ALTER TYPE public.log_action_type ADD VALUE IF NOT EXISTS 'ATTENDANT_SELF_SERVICE_UPDATE';

-- 2. Allow anonymous guest self-service actions to write logs with account_id = NULL
ALTER TABLE public.logs
    ALTER COLUMN account_id DROP NOT NULL;

-- 3. Speed up history queries by target_entity and target_id
CREATE INDEX IF NOT EXISTS idx_logs_target_entity_id_created
    ON public.logs (target_entity, target_id, created_at DESC);
