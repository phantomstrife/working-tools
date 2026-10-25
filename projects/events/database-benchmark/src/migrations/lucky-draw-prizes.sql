-- 1. Enums

-- 2. Table Definition
CREATE TABLE public.lucky_draw_prizes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    tier_order INT NOT NULL,
    total_quantity INT NOT NULL CHECK (total_quantity >= 1),
    remaining_quantity INT NOT NULL CHECK (remaining_quantity >= 0 AND remaining_quantity <= total_quantity),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    search_text TEXT GENERATED ALWAYS AS (
        COALESCE(name, '') || ' ' || 
        COALESCE(description, '')
    ) STORED
);

-- 3.1 Functions

-- 3.2 Triggers
CREATE TRIGGER set_timestamp_lucky_draw_prizes
BEFORE UPDATE ON public.lucky_draw_prizes
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- 4. Row Level Security
ALTER TABLE public.lucky_draw_prizes ENABLE ROW LEVEL SECURITY;

-- 4.1 SUPER_ADMIN Access: Can manage everything
CREATE POLICY "SUPER_ADMIN can manage all lucky_draw_prizes" ON public.lucky_draw_prizes
FOR ALL
USING (
    public.get_caller_role() = 'SUPER_ADMIN'
);

-- 4.2 ADMIN Access: Can manage prizes if they own the parent event of the game
CREATE POLICY "ADMINS can manage company lucky_draw_prizes" ON public.lucky_draw_prizes
FOR ALL
USING (
    public.get_caller_role() = 'ADMIN' 
    AND 
    (SELECT public.get_event_company_id(event_id) FROM public.games WHERE id = game_id) = public.get_caller_company_id()
);

-- 4.3 FIELD_STAFF Access: Staff need to view available prizes for games they run
CREATE POLICY "Staff can view assigned game prizes" ON public.lucky_draw_prizes
FOR SELECT
USING (
    game_id IN (SELECT game_id FROM public.game_accounts WHERE account_id = auth.uid())
);

-- 5. Indexes
CREATE INDEX idx_lucky_draw_prizes_search_trgm ON public.lucky_draw_prizes USING GIN (search_text gin_trgm_ops);
CREATE INDEX idx_lucky_draw_prizes_search_filters ON public.lucky_draw_prizes (game_id, tier_order, created_at DESC);