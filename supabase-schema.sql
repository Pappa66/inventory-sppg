-- SPPG MBG - Supabase PostgreSQL Schema
-- Jalankan SQL ini di Supabase SQL Editor

-- 1. USERS (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','accountant','kitchen_head','head_chef','field_assistant','field_staff','nutritionist')),
  is_active BOOLEAN DEFAULT TRUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ITEMS (Master Data)
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  category TEXT NOT NULL,
  par_level FLOAT DEFAULT 0,
  price_per_unit FLOAT DEFAULT 0,
  zone TEXT NOT NULL DEFAULT 'DRY' CHECK (zone IN ('DRY','WET','FREEZER')),
  allergens TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STOCK_LOTS
CREATE TABLE public.stock_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity FLOAT NOT NULL,
  actual_quantity FLOAT,
  expiry_date DATE,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  note TEXT,
  zone TEXT CHECK (zone IN ('DRY','WET','FREEZER')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. OPNAMES (Stock counts)
CREATE TABLE public.opnames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id),
  lot_id UUID REFERENCES stock_lots(id),
  counted_quantity FLOAT NOT NULL,
  note TEXT,
  zone TEXT NOT NULL CHECK (zone IN ('DRY','WET','FREEZER')),
  temperature_c FLOAT,
  humidity_pct FLOAT,
  reason TEXT DEFAULT '',
  counted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PURCHASES
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('STOCK','OPERATIONAL')),
  description TEXT NOT NULL,
  amount_idr FLOAT NOT NULL,
  receipt_total_idr FLOAT,
  receipt_photo TEXT,
  transport_amount_idr FLOAT DEFAULT 0,
  supplier TEXT,
  items JSONB DEFAULT '[]',
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  verification_note TEXT
);

-- 6. RECIPES
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  servings INT DEFAULT 1,
  ingredients JSONB DEFAULT '[]',
  instructions TEXT DEFAULT '',
  calories_kcal FLOAT DEFAULT 0,
  protein_g FLOAT DEFAULT 0,
  carbs_g FLOAT DEFAULT 0,
  fats_g FLOAT DEFAULT 0,
  sodium_mg FLOAT DEFAULT 0,
  allergens TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MENUS
CREATE TABLE public.menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start TEXT NOT NULL,
  day TEXT NOT NULL CHECK (day IN ('mon','tue','wed','thu','fri')),
  recipe_ids TEXT[] DEFAULT '{}',
  portions INT DEFAULT 1,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PENDING_REVIEW','APPROVED','REJECTED')),
  approved_by TEXT,
  approved_by_name TEXT,
  approved_at TIMESTAMPTZ,
  signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AUDIT_TRAIL
CREATE TABLE public.audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  actor TEXT NOT NULL,
  actor_id TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  zone TEXT,
  changes JSONB,
  note TEXT DEFAULT ''
);

-- 9. SETTINGS (key-value store, e.g. logo)
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Indexes
CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_stock_lots_item ON stock_lots(item_id);
CREATE INDEX idx_stock_lots_expiry ON stock_lots(expiry_date);
CREATE INDEX idx_purchases_date ON purchases(purchased_at DESC);
CREATE INDEX idx_menus_week ON menus(week_start);
CREATE INDEX idx_audit_timestamp ON audit_trail(timestamp DESC);
CREATE INDEX idx_audit_actor ON audit_trail(actor);
