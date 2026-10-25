-- 1. Enums

-- 2. Table Definition
CREATE TABLE public.game_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.1 Functions

-- 3.2 Triggers
CREATE TRIGGER set_timestamp_game_accounts
BEFORE UPDATE ON public.game_accounts
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- 4. Row Level Security
ALTER TABLE public.game_accounts ENABLE ROW LEVEL SECURITY;

-- 4.1 SUPER_ADMIN Access: Can view, update, create, and delete any assignment
CREATE POLICY "SUPER_ADMIN can manage all game_accounts" ON public.game_accounts
FOR ALL
USING (
    public.get_caller_role() = 'SUPER_ADMIN'
);

-- 4.2 ADMIN Access: Can only manage assignments for events belonging to their company
CREATE POLICY "ADMINS can manage company game_accounts" ON public.game_accounts
FOR ALL
USING (
    public.get_caller_role() = 'ADMIN' 
    AND 
    public.get_event_company_id(event_id) = public.get_caller_company_id()
);

-- 4.3 FIELD_STAFF & GUARD Access: Can read their own assignments
CREATE POLICY "Staff can view own assignments" ON public.game_accounts
FOR SELECT
USING (
    account_id = auth.uid()
);

-- 4.4 Granting FIELD_STAFF & GUARD access to assigned events
CREATE POLICY "Staff can view assigned events" ON public.events
FOR SELECT
USING (
    id IN (SELECT event_id FROM public.game_accounts WHERE account_id = auth.uid())
);

-- 4.5 Granting FIELD_STAFF & GUARD access to assigned games
CREATE POLICY "Staff can view assigned games" ON public.games
FOR SELECT
USING (
    id IN (SELECT game_id FROM public.game_accounts WHERE account_id = auth.uid())
);

-- 5. Indexes
CREATE INDEX idx_game_accounts_user_assignments ON public.game_accounts(account_id, game_id, event_id);
CREATE INDEX idx_game_accounts_game_id ON public.game_accounts(game_id);
CREATE INDEX idx_game_accounts_event_id ON public.game_accounts(event_id);
CREATE INDEX idx_game_accounts_account_id ON public.game_accounts(account_id);