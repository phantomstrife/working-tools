-- 1. Enums
CREATE TYPE event_status AS ENUM (
    'DRAFT', 
    'UPCOMING', 
    'ONGOING', 
    'COMPLETED', 
    'CANCELLED'
);

-- 2. Table Definition
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    location_name TEXT,
    location_address TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    banner_url TEXT,
    theme_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    status event_status NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    search_text TEXT GENERATED ALWAYS AS (
        COALESCE(name, '') || ' ' ||
        COALESCE(slug, '') || ' ' ||
        COALESCE(location_name, '') || ' ' ||
        COALESCE(location_address, '')
    ) STORED
);

-- 3.1 Functions
CREATE OR REPLACE FUNCTION public.get_event_company_id(target_event_id UUID)
RETURNS UUID
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
    SELECT company_id FROM public.events WHERE id = target_event_id;
$$;

-- 3.2 Triggers
CREATE TRIGGER set_timestamp_events
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 4. Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 4.1 SUPER_ADMIN: Full ecosystem access
CREATE POLICY "SUPER_ADMIN full access to events"
    ON events
    FOR ALL
    USING (get_caller_role() = 'SUPER_ADMIN');

-- 4.2 ADMIN: Isolated to their own company's events
CREATE POLICY "ADMIN full access to own company events"
    ON events
    FOR ALL
    USING (
        get_caller_role() = 'ADMIN' 
        AND company_id = get_caller_company_id()
    );

-- 5. Indexes
CREATE INDEX idx_events_search_text ON events USING GIN (search_text gin_trgm_ops);

CREATE INDEX idx_events_company_id ON events(company_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_dates ON events(start_time, end_time);