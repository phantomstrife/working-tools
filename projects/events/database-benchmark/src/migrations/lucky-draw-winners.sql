-- 1. Enums (None needed)

-- 2. Table Definition
CREATE TABLE public.lucky_draw_winners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    prize_id UUID NOT NULL REFERENCES public.lucky_draw_prizes(id) ON DELETE CASCADE,
    attendant_id UUID NOT NULL REFERENCES public.lucky_draw_attendants(id) ON DELETE CASCADE,
    drawn_by UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    won_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE (game_id, attendant_id)
);

-- 3.1 Functions (Relying on existing RBAC)

-- 3.2 Triggers (None needed, immutable ledger)

-- 4. Row Level Security
ALTER TABLE public.lucky_draw_winners ENABLE ROW LEVEL SECURITY;

-- 4.1 SUPER_ADMIN: Full access
CREATE POLICY "SUPER_ADMIN can manage all lucky_draw_winners" ON public.lucky_draw_winners
FOR ALL
USING (public.get_caller_role() = 'SUPER_ADMIN');

-- 4.2 ADMIN: Read-only access for their company's events (for Excel Exports)
CREATE POLICY "ADMINS can view company lucky_draw_winners" ON public.lucky_draw_winners
FOR SELECT
USING (
    public.get_caller_role() = 'ADMIN' 
    AND 
    public.get_event_company_id((SELECT event_id FROM public.games WHERE id = game_id)) = public.get_caller_company_id()
);

-- 4.3 FIELD_STAFF: Can view winners for games they are assigned to
CREATE POLICY "Staff can view assigned game winners" ON public.lucky_draw_winners
FOR SELECT
USING (game_id IN (SELECT game_id FROM public.game_accounts WHERE account_id = auth.uid()));

-- 4.4 FIELD_STAFF: Can insert winners for games they are assigned to
CREATE POLICY "Staff can insert winners for assigned games" ON public.lucky_draw_winners
FOR INSERT
WITH CHECK (game_id IN (SELECT game_id FROM public.game_accounts WHERE account_id = auth.uid()));

-- 5. Indexes
CREATE INDEX idx_lucky_draw_winners_game_id ON public.lucky_draw_winners (game_id, won_at DESC);