-- ==============================================================================
-- Stenna: Sales Tracking & Field Management Module Migration
-- Modular & Additive Only (No alterations to existing tables or data)
-- ==============================================================================

-- 1. ZONES MASTER
CREATE TABLE IF NOT EXISTS public.sales_zones (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. SALES BOYS (Dedicated field team accounts)
CREATE TABLE IF NOT EXISTS public.sales_boys (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    phone         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. SALES BOY <-> ZONES (M:M, multi-zone territory assignments)
CREATE TABLE IF NOT EXISTS public.sales_boy_zones (
    sales_boy_id UUID NOT NULL REFERENCES public.sales_boys(id) ON DELETE CASCADE,
    zone_id      UUID NOT NULL REFERENCES public.sales_zones(id) ON DELETE CASCADE,
    PRIMARY KEY (sales_boy_id, zone_id)
);

-- 4. VENDORS / RETAIL SHOPS MASTER
CREATE TABLE IF NOT EXISTS public.sales_vendors (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id        UUID REFERENCES public.sales_zones(id) ON DELETE SET NULL,
    shop_name      TEXT NOT NULL,
    phone          TEXT NOT NULL,
    shop_address   TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    is_active      BOOLEAN NOT NULL DEFAULT true,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. FIELD VISIT RECORDS
CREATE TABLE IF NOT EXISTS public.sales_visits (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_boy_id UUID NOT NULL REFERENCES public.sales_boys(id) ON DELETE CASCADE,
    vendor_id    UUID NOT NULL REFERENCES public.sales_vendors(id) ON DELETE CASCADE,
    is_available BOOLEAN NOT NULL DEFAULT true,
    comments     TEXT,
    visited_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. VISIT <-> BOOKS (Tracks sample books shown vs bought per visit)
CREATE TABLE IF NOT EXISTS public.sales_visit_books (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id    UUID NOT NULL REFERENCES public.sales_visits(id) ON DELETE CASCADE,
    book_id     UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('shown', 'bought')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- High Performance Indexes
CREATE INDEX IF NOT EXISTS idx_sales_vendors_zone ON public.sales_vendors(zone_id);
CREATE INDEX IF NOT EXISTS idx_sales_visits_vendor ON public.sales_visits(vendor_id);
CREATE INDEX IF NOT EXISTS idx_sales_visits_sales_boy ON public.sales_visits(sales_boy_id);
CREATE INDEX IF NOT EXISTS idx_sales_visits_visited_at ON public.sales_visits(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_visit_books_visit ON public.sales_visit_books(visit_id);
CREATE INDEX IF NOT EXISTS idx_sales_visit_books_book ON public.sales_visit_books(book_id);
