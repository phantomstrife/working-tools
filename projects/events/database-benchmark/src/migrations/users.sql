-- 3.1 Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.accounts (id, email, password_hash, full_name, role)
    VALUES (
        new.id,
        new.email,
        'managed_by_supabase_auth',
        'System Admin',
        'SUPER_ADMIN'
    );
    RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_user_updated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    UPDATE public.accounts
    SET email = new.email,
        password_hash = new.encrypted_password
    WHERE id = new.id;
    RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_role_to_auth_metadata()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    UPDATE auth.users
    SET raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', NEW.role)
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$;

-- 3.2 Triggers
CREATE TRIGGER on_auth_user_created 
   AFTER INSERT ON auth.users 
   FOR EACH ROW 
   EXECUTE PROCEDURE public.handle_new_user();

CREATE TRIGGER on_auth_user_updated 
   AFTER UPDATE OF email, encrypted_password 
   ON auth.users 
   FOR EACH ROW 
   WHEN (OLD.email IS DISTINCT FROM NEW.email OR OLD.encrypted_password IS DISTINCT FROM NEW.encrypted_password)
   EXECUTE PROCEDURE public.handle_user_updated();