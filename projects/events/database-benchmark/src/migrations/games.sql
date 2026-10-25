-- 1. Enums
CREATE TYPE game_type AS ENUM (
    'LUCKY_DRAW'
);

CREATE TYPE game_status AS ENUM (
    'PENDING', 
    'READY', 
    'LIVE', 
    'FINISHED'
);

-- 2. Table Definition
CREATE TABLE public.games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    game_type game_type NOT NULL,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_dev_only BOOLEAN NOT NULL DEFAULT false,
    status game_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    search_text TEXT GENERATED ALWAYS AS (
        COALESCE(name, '') || ' ' || 
        COALESCE(description, '')
    ) STORED
);

-- 3.1 Functions

-- 3.2 Triggers
CREATE TRIGGER set_timestamp_games
BEFORE UPDATE ON public.games
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- 4. Row Level Security
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- 4.1 SUPER_ADMIN Access: Can view, update, create, and delete any game
CREATE POLICY "SUPER_ADMIN can manage all games" ON public.games
FOR ALL
USING (
    public.get_caller_role() = 'SUPER_ADMIN'
);

-- 4.2 ADMIN Access: Can only manage games belonging to their assigned company's events
CREATE POLICY "ADMINS can manage company games" ON public.games
FOR ALL
USING (
    public.get_caller_role() = 'ADMIN' 
    AND 
    public.get_event_company_id(event_id) = public.get_caller_company_id()
);

-- 5. Indexes
CREATE INDEX idx_games_search_trgm ON public.games USING GIN (search_text gin_trgm_ops);
CREATE INDEX idx_games_search_filters ON public.games (event_id, game_type, status, created_at DESC);