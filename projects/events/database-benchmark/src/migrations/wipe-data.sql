-- 1. Drop the entire public schema, wiping all tables, types, and functions.
DROP SCHEMA public CASCADE;

-- 2. Recreate a clean public schema
CREATE SCHEMA public;

-- 3. Grant schema access to standard roles
GRANT ALL ON SCHEMA public TO postgres, public, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 4. Automate permissions for new objects created in the public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON ROUTINES TO anon, authenticated, service_role;

-- 5. Enable pg_trgm and btree_gin extension to speed up partial string matching and indexing
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- 6 Create a trigger function to automatically update the updated_at timestamp on row updates
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7 Run after benchmarking is done to empty database
TRUNCATE TABLE 
    public.companies,
    public.accounts,
    public.events,
    public.games,
    public.game_accounts,
    public.logs,
    public.lucky_draw_prizes,
    public.lucky_draw_attendants,
    public.lucky_draw_winners
CASCADE;