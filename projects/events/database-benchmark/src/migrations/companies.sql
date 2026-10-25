-- 1. Enums
CREATE TYPE company_status AS ENUM (
    'ACTIVE', 
    'INACTIVE', 
    'SUSPENDED'
);

-- 2. Table Definition
CREATE TABLE public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    tax_code TEXT,
    industry TEXT,
    contact_person TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    logo_url TEXT,
    status company_status DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    search_text TEXT GENERATED ALWAYS AS (
        COALESCE(name, '') || ' ' || 
        COALESCE(tax_code, '') || ' ' || 
        COALESCE(contact_person, '') || ' ' || 
        COALESCE(contact_email, '') || ' ' ||
        COALESCE(contact_phone, '')
    ) STORED
);

ALTER TABLE public.accounts 
ADD CONSTRAINT fk_accounts_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

-- 3.1 Functions

-- 3.2 Triggers
CREATE TRIGGER set_timestamp_companies
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- 4. Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 4.1 SUPER_ADMIN can manage all companies
CREATE POLICY "SUPER_ADMIN can manage all companies" ON public.companies 
FOR ALL USING (
    public.get_caller_role() = 'SUPER_ADMIN'
);

-- 4.2 ADMIN can only view/manage their own assigned company
CREATE POLICY "ADMIN can manage their own company" ON public.companies 
FOR ALL USING (
    public.get_caller_role() = 'ADMIN' 
    AND 
    id = public.get_caller_company_id()
);

-- 5. Indexes
CREATE INDEX idx_companies_search_trgm ON public.companies USING GIN (search_text gin_trgm_ops);
CREATE INDEX idx_companies_filters ON public.companies (status, created_at DESC);