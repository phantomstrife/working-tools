-- 1. Enums
CREATE TYPE log_action_type AS ENUM (
    'EMAIL_BATCH_SEND', 
    'CHECKIN_QR_SCAN', 
    'CHECKIN_MANUAL_SEARCH', 
    'PRIZE_DRAWN'
);

-- 2. Table Definition
CREATE TABLE public.logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    action_type log_action_type NOT NULL,
    target_entity TEXT,
    target_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),

    search_text TEXT GENERATED ALWAYS AS (
        COALESCE(target_entity, '') || ' ' || 
        COALESCE(target_id, '')
    ) STORED
);

-- 3.1 Functions
CREATE OR REPLACE FUNCTION public.get_log_account_company_id(target_account_id UUID)
RETURNS UUID
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
    SELECT company_id FROM public.accounts WHERE id = target_account_id;
$$;

-- 3.2 Triggers

-- 4. Row Level Security
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- 4.1 SUPER_ADMIN Access: Can view all logs
CREATE POLICY "SUPER_ADMIN can view all logs" ON public.logs
FOR SELECT
USING (
    public.get_caller_role() = 'SUPER_ADMIN'
);

-- 4.2 ADMIN Access: Can view logs related to their company's events OR their company's staff
CREATE POLICY "ADMINS can view company logs" ON public.logs
FOR SELECT
USING (
    public.get_caller_role() = 'ADMIN' 
    AND (
        public.get_event_company_id(event_id) = public.get_caller_company_id()
        OR 
        public.get_log_account_company_id(account_id) = public.get_caller_company_id()
    )
);

-- 4.3 Log Insertion: Users can only write logs attributed to their own account_id
CREATE POLICY "Users can insert own logs" ON public.logs
FOR INSERT
WITH CHECK (
    account_id = auth.uid()
);

-- 5. Indexes
CREATE INDEX idx_logs_search_trgm ON public.logs USING GIN (search_text gin_trgm_ops);
CREATE INDEX idx_logs_metadata_gin ON public.logs USING GIN (metadata);
CREATE INDEX idx_logs_search_filters ON public.logs (account_id, event_id, action_type, created_at DESC);