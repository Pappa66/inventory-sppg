-- SPPG MBG - Supabase PostgreSQL Schema
-- Jalankan SQL ini di Supabase SQL Editor

-- 1. USERS (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','accountant','kitchen_head','head_chef','field_assistant','nutritionist','driver','persiapan','tenaga_masak','pemorsian','kebersihan','pencuci')),
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
  taken_by UUID REFERENCES users(id),
  taken_at TIMESTAMPTZ,
  taken_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. OPNAMES (Stock counts)
CREATE TABLE public.opnames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id),
  lot_id UUID REFERENCES stock_lots(id),
  counted_quantity FLOAT NOT NULL,
  system_quantity FLOAT,
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
  menu_category TEXT CHECK (menu_category IN ('BALITA','PORTION_SMALL','PORTION_LARGE','BUMIL_BUSUI')),
  ingredients JSONB DEFAULT '[]',
  instructions TEXT DEFAULT '',
  calories_kcal FLOAT DEFAULT 0,
  protein_g FLOAT DEFAULT 0,
  carbs_g FLOAT DEFAULT 0,
  fats_g FLOAT DEFAULT 0,
  sodium_mg FLOAT DEFAULT 0,
  allergens TEXT[] DEFAULT '{}',
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MENUS
CREATE TABLE public.menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start TEXT NOT NULL,
  day TEXT NOT NULL CHECK (day IN ('mon','tue','wed','thu','fri','sat','sun')),
  recipe_ids TEXT[] DEFAULT '{}',
  portions INT DEFAULT 1,
  total_days INT DEFAULT 5,
  active_days INT[] DEFAULT '{1,2,3,4,5}',
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

-- ============= NEW TABLES FOR DELIVERY SYSTEM =============

-- 10. DESTINATIONS (Master data tujuan antar)
CREATE TABLE public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  contact_person TEXT,
  phone TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. DELIVERY_PLANS (Rencana antar per hari)
CREATE TABLE public.delivery_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_date DATE NOT NULL,
  created_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. DELIVERY_PLAN_ITEMS (Porsi per tujuan per kategori)
CREATE TABLE public.delivery_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES delivery_plans(id) ON DELETE CASCADE,
  destination_id UUID REFERENCES destinations(id),
  category TEXT NOT NULL CHECK (category IN ('BALITA','PORTION_SMALL','PORTION_LARGE','BUMIL_BUSUI')),
  portions INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. DELIVERY_ASSIGNMENTS (Driver ditugaskan ke plan)
CREATE TABLE public.delivery_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES delivery_plans(id),
  driver_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING','IN_TRANSIT','COMPLETED')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. DELIVERY_LOGS (Status per tujuan + foto bukti)
CREATE TABLE public.delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES delivery_assignments(id),
  destination_id UUID REFERENCES destinations(id),
  status TEXT NOT NULL CHECK (status IN ('NOT_DELIVERED','IN_TRANSIT','DELIVERED')),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for new tables
CREATE INDEX idx_destinations_active ON destinations(is_active);
CREATE INDEX idx_delivery_plans_date ON delivery_plans(plan_date);
CREATE INDEX idx_delivery_plan_items_plan ON delivery_plan_items(plan_id);
CREATE INDEX idx_delivery_assignments_plan ON delivery_assignments(plan_id);
CREATE INDEX idx_delivery_assignments_driver ON delivery_assignments(driver_id);
CREATE INDEX idx_delivery_logs_assignment ON delivery_logs(assignment_id);

-- ============= ACCOUNTING TABLES =============

-- 15. ANGGARAN_BENEFICIARIES (total porsi per hari)
CREATE TABLE public.anggaran_beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_date DATE NOT NULL,
  total_portions INT DEFAULT 0,
  price_per_portion FLOAT DEFAULT 15000,
  rab FLOAT DEFAULT 0,
  actual FLOAT DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_anggaran_date ON anggaran_beneficiaries(plan_date);

-- ============= DAILY TASKS (Tugas Harian Relawan) =============

-- 16. DAILY_TASKS (Input tugas harian semua relawan)
CREATE TABLE public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_date DATE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  role TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('pemorsian','persiapan','masak','kebersihan','pencuci')),
  category TEXT CHECK (category IN ('BALITA','PORTION_SMALL','PORTION_LARGE','BUMIL_BUSUI')),
  portions INT DEFAULT 0,
  photo_url TEXT,
  description TEXT,
  status TEXT DEFAULT 'SELESAI' CHECK (status IN ('SELESAI','BELUM_SELESAI')),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_daily_tasks_date ON daily_tasks(task_date);
CREATE INDEX idx_daily_tasks_user ON daily_tasks(user_id);
CREATE INDEX idx_daily_tasks_role ON daily_tasks(role);
