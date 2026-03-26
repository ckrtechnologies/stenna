-- Suppress table creation if they already exist
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (Public profiles linked to Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer', -- admin, customer, dealer
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Category Groups
CREATE TABLE IF NOT EXISTS public.category_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Wallpapers
CREATE TABLE IF NOT EXISTS public.wallpapers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  design_code TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  quantity INTEGER DEFAULT 0,
  price NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Wallpaper Images
CREATE TABLE IF NOT EXISTS public.wallpaper_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallpaper_id UUID REFERENCES public.wallpapers(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Wallpaper Videos
CREATE TABLE IF NOT EXISTS public.wallpaper_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallpaper_id UUID REFERENCES public.wallpapers(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Wallpaper-Category Relationship
CREATE TABLE IF NOT EXISTS public.wallpaper_categories (
  wallpaper_id UUID REFERENCES public.wallpapers(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (wallpaper_id, category_id)
);

-- 8. Wallpaper-Group Relationship
CREATE TABLE IF NOT EXISTS public.wallpaper_groups (
  wallpaper_id UUID REFERENCES public.wallpapers(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.category_groups(id) ON DELETE CASCADE,
  PRIMARY KEY (wallpaper_id, group_id)
);

-- 9. Leads (Enquiries, Samples, Appointments)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  wallpaper_id UUID REFERENCES public.wallpapers(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  type TEXT DEFAULT 'enquiry', -- enquiry, sample, appointment
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Wishlist
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  wallpaper_id UUID REFERENCES public.wallpapers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, wallpaper_id)
);

-- 11. Store Settings
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  logo_url TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Dealers (Some dealers might be managed separately or as profiles)
CREATE TABLE IF NOT EXISTS public.dealers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT, -- For custom dealer auth if used
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Books
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Dealer-Books Assignment
CREATE TABLE IF NOT EXISTS public.dealer_books (
  dealer_id UUID REFERENCES public.dealers(id) ON DELETE CASCADE,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  PRIMARY KEY (dealer_id, book_id)
);

-- 15. Book-Wallpapers Assignment
CREATE TABLE IF NOT EXISTS public.book_wallpapers (
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  wallpaper_id UUID REFERENCES public.wallpapers(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, wallpaper_id)
);

-- 16. Visualizations (AI generated history)
CREATE TABLE IF NOT EXISTS public.visualizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  wallpaper_id UUID REFERENCES public.wallpapers(id) ON DELETE SET NULL,
  room_image_url TEXT NOT NULL,
  generated_image_url TEXT NOT NULL,
  mask_data JSONB,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 17. Analytics
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallpaper_id UUID REFERENCES public.wallpapers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- view, share
  created_at TIMESTAMPTZ DEFAULT now()
);

-- triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_wallpapers_updated_at BEFORE UPDATE ON public.wallpapers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_store_settings_updated_at BEFORE UPDATE ON public.store_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
