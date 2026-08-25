-- ============================================================
-- SPPG MBG - MIGRATE (Satu file, satu kali jalan)
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- ============= 0. DISABLE RLS =============
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
  END LOOP;
END $$;

-- ============= 1. DROP SEMUA TABEL (urutan inverse foreign key) =============
DROP TABLE IF EXISTS public.anggaran_periods CASCADE;
DROP TABLE IF EXISTS public.volunteer_incentives CASCADE;
DROP TABLE IF EXISTS public.item_opening_balances CASCADE;
DROP TABLE IF EXISTS public.transaksis CASCADE;
DROP TABLE IF EXISTS public.chart_of_accounts CASCADE;
DROP TABLE IF EXISTS public.biweekly_periods CASCADE;
DROP TABLE IF EXISTS public.item_hierarchies CASCADE;
DROP TABLE IF EXISTS public.global_config CASCADE;
DROP TABLE IF EXISTS public.setup_sppg CASCADE;
DROP TABLE IF EXISTS public.daily_tasks CASCADE;
DROP TABLE IF EXISTS public.anggaran_beneficiaries CASCADE;
DROP TABLE IF EXISTS public.delivery_logs CASCADE;
DROP TABLE IF EXISTS public.delivery_assignments CASCADE;
DROP TABLE IF EXISTS public.delivery_plan_items CASCADE;
DROP TABLE IF EXISTS public.delivery_plans CASCADE;
DROP TABLE IF EXISTS public.destinations CASCADE;
DROP TABLE IF EXISTS public.audit_trail CASCADE;
DROP TABLE IF EXISTS public.opnames CASCADE;
DROP TABLE IF EXISTS public.stock_lots CASCADE;
DROP TABLE IF EXISTS public.purchases CASCADE;
DROP TABLE IF EXISTS public.menus CASCADE;
DROP TABLE IF EXISTS public.recipes CASCADE;
DROP TABLE IF EXISTS public.items CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ============= 2. USERS =============
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin_apps','admin_sppg','accountant','kitchen_head','head_chef','field_assistant','nutritionist','driver','persiapan','tenaga_masak','pemorsian','kebersihan','pencuci')),
  is_active BOOLEAN DEFAULT TRUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 3. ITEMS =============
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

-- ============= 4. STOCK_LOTS =============
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

-- ============= 5. OPNAMES =============
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

-- ============= 6. PURCHASES =============
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

-- ============= 7. RECIPES =============
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

-- ============= 8. MENUS =============
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

-- ============= 9. AUDIT_TRAIL =============
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

-- ============= 10. SETTINGS =============
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ============= 11. DESTINATIONS =============
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

-- ============= 12. DELIVERY_PLANS =============
CREATE TABLE public.delivery_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_date DATE NOT NULL,
  created_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============= 13. DELIVERY_PLAN_ITEMS =============
CREATE TABLE public.delivery_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES delivery_plans(id) ON DELETE CASCADE,
  destination_id UUID REFERENCES destinations(id),
  category TEXT NOT NULL CHECK (category IN ('BALITA','PORTION_SMALL','PORTION_LARGE','BUMIL_BUSUI')),
  portions INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============= 14. DELIVERY_ASSIGNMENTS =============
CREATE TABLE public.delivery_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES delivery_plans(id),
  driver_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING','IN_TRANSIT','COMPLETED')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============= 15. DELIVERY_LOGS =============
CREATE TABLE public.delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES delivery_assignments(id),
  destination_id UUID REFERENCES destinations(id),
  status TEXT NOT NULL CHECK (status IN ('NOT_DELIVERED','IN_TRANSIT','DELIVERED')),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============= 16. ANGGARAN_BENEFICIARIES =============
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

-- ============= 17. DAILY_TASKS =============
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

-- ============= 18. GLOBAL CONFIG =============
CREATE TABLE public.global_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 19. SETUP SPPG =============
CREATE TABLE public.setup_sppg (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_sppg TEXT NOT NULL,
  id_sppg TEXT,
  alamat TEXT,
  nama_kepala TEXT,
  nama_akuntan TEXT,
  nama_yayasan TEXT,
  rekening_va TEXT,
  tahun_anggaran INT DEFAULT EXTRACT(YEAR FROM NOW()),
  periode_start DATE,
  periode_end DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 20. CHART OF ACCOUNTS =============
CREATE TABLE public.chart_of_accounts (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ASET','KEWAJIBAN','MODAL','PENDAPATAN','BELANJA')),
  parent_code TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 21. BIWEEKLY PERIODS =============
CREATE TABLE public.biweekly_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 22. TRANSAKSIS =============
CREATE TABLE public.transaksis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID REFERENCES biweekly_periods(id),
  transaction_date DATE NOT NULL,
  account_code TEXT NOT NULL REFERENCES chart_of_accounts(code),
  description TEXT NOT NULL,
  debit FLOAT DEFAULT 0,
  credit FLOAT DEFAULT 0,
  source_table TEXT,
  source_id UUID,
  buku_pembantu TEXT CHECK (buku_pembantu IN ('BANK','PETTY_CASH','BAHAN_BAKU','OPERASIONAL','FASILITAS','PAJAK')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 23. ITEM HIERARCHIES =============
CREATE TABLE public.item_hierarchies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  level INT NOT NULL CHECK (level IN (1, 2, 3)),
  parent_code TEXT,
  category TEXT,
  unit TEXT,
  zone TEXT CHECK (zone IN ('DRY','WET','FREEZER')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 24. ITEM OPENING BALANCES =============
CREATE TABLE public.item_opening_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code TEXT NOT NULL REFERENCES item_hierarchies(code),
  period_id UUID REFERENCES biweekly_periods(id),
  opening_quantity FLOAT DEFAULT 0,
  opening_value FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_code, period_id)
);

-- ============= 25. VOLUNTEER INCENTIVES =============
CREATE TABLE public.volunteer_incentives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID REFERENCES biweekly_periods(id),
  user_id UUID REFERENCES users(id),
  jabatan TEXT NOT NULL,
  jumlah_hari INT DEFAULT 0,
  insentif_per_hari FLOAT DEFAULT 0,
  total_insentif FLOAT DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 26. ANGGARAN PERIODS =============
CREATE TABLE public.anggaran_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID REFERENCES biweekly_periods(id),
  plan_date DATE NOT NULL,
  bahan_balita INT DEFAULT 0, bahan_paud_tk_ra INT DEFAULT 0,
  bahan_sd_1_3 INT DEFAULT 0, bahan_sd_4_6 INT DEFAULT 0,
  bahan_smp_mts INT DEFAULT 0, bahan_sma_ma_smk INT DEFAULT 0,
  bahan_slb INT DEFAULT 0, bahan_santri INT DEFAULT 0,
  bahan_pend_tk INT DEFAULT 0, bahan_bumil INT DEFAULT 0,
  bahan_busui INT DEFAULT 0,
  harga_satuan1 FLOAT DEFAULT 8000, harga_satuan2 FLOAT DEFAULT 10000,
  bahan_rab FLOAT DEFAULT 0, bahan_actual FLOAT DEFAULT 0,
  ops_jumlah_paket INT DEFAULT 0, ops_harga_satuan FLOAT DEFAULT 0,
  ops_rab FLOAT DEFAULT 0, ops_actual FLOAT DEFAULT 0,
  ins_jumlah_paket INT DEFAULT 0, ins_harga_satuan FLOAT DEFAULT 0,
  ins_rab FLOAT DEFAULT 0, ins_actual FLOAT DEFAULT 0,
  notes TEXT, created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============= INDEXES =============
CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_stock_lots_item ON stock_lots(item_id);
CREATE INDEX idx_stock_lots_expiry ON stock_lots(expiry_date);
CREATE INDEX idx_purchases_date ON purchases(purchased_at DESC);
CREATE INDEX idx_menus_week ON menus(week_start);
CREATE INDEX idx_audit_timestamp ON audit_trail(timestamp DESC);
CREATE INDEX idx_audit_actor ON audit_trail(actor);
CREATE INDEX idx_destinations_active ON destinations(is_active);
CREATE INDEX idx_delivery_plans_date ON delivery_plans(plan_date);
CREATE INDEX idx_delivery_plan_items_plan ON delivery_plan_items(plan_id);
CREATE INDEX idx_delivery_assignments_plan ON delivery_assignments(plan_id);
CREATE INDEX idx_delivery_assignments_driver ON delivery_assignments(driver_id);
CREATE INDEX idx_delivery_logs_assignment ON delivery_logs(assignment_id);
CREATE INDEX idx_anggaran_date ON anggaran_beneficiaries(plan_date);
CREATE INDEX idx_daily_tasks_date ON daily_tasks(task_date);
CREATE INDEX idx_daily_tasks_user ON daily_tasks(user_id);
CREATE INDEX idx_daily_tasks_role ON daily_tasks(role);
CREATE INDEX idx_transaksis_period ON transaksis(period_id);
CREATE INDEX idx_transaksis_date ON transaksis(transaction_date);
CREATE INDEX idx_transaksis_account ON transaksis(account_code);
CREATE INDEX idx_item_hierarchies_parent ON item_hierarchies(parent_code);
CREATE INDEX idx_item_hierarchies_level ON item_hierarchies(level);
CREATE INDEX idx_volunteer_incentives_period ON volunteer_incentives(period_id);
CREATE INDEX idx_anggaran_periods_date ON anggaran_periods(plan_date);
CREATE INDEX idx_anggaran_periods_period ON anggaran_periods(period_id);

-- ============================================================
-- SEED DATA
-- ============================================================

-- ============= USERS =============
INSERT INTO public.users (id, email, name, role, is_active, password_hash, created_at) VALUES
  ('a0000001-0000-0000-0000-000000000001'::uuid, 'admin@sppg.id', 'Administrator Aplikasi', 'admin_apps', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000002'::uuid, 'admin-sppg@sppg.id', 'Admin Dapur SPPG', 'admin_sppg', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000003'::uuid, 'akuntan@sppg.id', 'Sri Akuntansi', 'accountant', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000004'::uuid, 'kepala@sppg.id', 'Pak Kepala Dapur', 'kitchen_head', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000005'::uuid, 'chef@sppg.id', 'Chef Wulan', 'head_chef', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000006'::uuid, 'asisten@sppg.id', 'Asisten Lapangan', 'field_assistant', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000007'::uuid, 'ahligizi@sppg.id', 'Ahli Gizi Maya', 'nutritionist', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000008'::uuid, 'driver@sppg.id', 'Driver Budi', 'driver', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000009'::uuid, 'driver2@sppg.id', 'Driver Sari', 'driver', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000010'::uuid, 'persiapan@sppg.id', 'Rina Persiapan', 'persiapan', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000011'::uuid, 'masak@sppg.id', 'Sari Masak', 'tenaga_masak', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000012'::uuid, 'pemorsian@sppg.id', 'Dewi Pemorsian', 'pemorsian', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000013'::uuid, 'kebersihan@sppg.id', 'Siti Kebersihan', 'kebersihan', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000014'::uuid, 'pencuci@sppg.id', 'Budi Pencuci', 'pencuci', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now());

-- ============= ITEMS (30 bahan, 6 kategori) =============
INSERT INTO public.items (id, name, unit, category, par_level, price_per_unit, zone, allergens, created_at, updated_at) VALUES
  ('b0000001-0000-0000-0000-000000000001'::uuid, 'Beras Premium',     'kg',     'KH',   50,  15000, 'DRY',     '{}'::text[],         now(), now()),
  ('b0000001-0000-0000-0000-000000000002'::uuid, 'Beras Merah',       'kg',     'KH',   10,  22000, 'DRY',     '{}'::text[],         now(), now()),
  ('b0000001-0000-0000-0000-000000000003'::uuid, 'Kentang',           'kg',     'KH',   25,  10000, 'DRY',     '{}'::text[],         now(), now()),
  ('b0000001-0000-0000-0000-000000000004'::uuid, 'Mie Telur',         'kg',     'KH',   15,  12000, 'DRY',     '{telur,gluten}'::text[], now(), now()),
  ('b0000001-0000-0000-0000-000000000005'::uuid, 'Jagung Manis',      'kg',     'KH',   12,  15000, 'DRY',     '{}'::text[],         now(), now()),
  ('b0000001-0000-0000-0000-000000000006'::uuid, 'Telur Ayam',        'kg',     'PH',   20,  28000, 'WET',     '{telur}'::text[],    now(), now()),
  ('b0000001-0000-0000-0000-000000000007'::uuid, 'Tempe',             'papan',  'PN',   25,   7000, 'WET',     '{kedelai}'::text[],  now(), now()),
  ('b0000001-0000-0000-0000-000000000008'::uuid, 'Tahu',              'papan',  'PN',   20,   5000, 'WET',     '{kedelai}'::text[],  now(), now()),
  ('b0000001-0000-0000-0000-000000000009'::uuid, 'Ayam Beku',         'kg',     'PH',   15,  38000, 'FREEZER', '{}'::text[],         now(), now()),
  ('b0000001-0000-0000-0000-000000000010'::uuid, 'Ikan Kembung',      'kg',     'PH',    8,  35000, 'FREEZER', '{ikan}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000011'::uuid, 'Daging Sapi Giling','kg',     'PH',    8,  55000, 'FREEZER', '{}'::text[],         now(), now()),
  ('b0000001-0000-0000-0000-000000000012'::uuid, 'Ikan Asin',         'kg',     'PH',    8,  20000, 'DRY',     '{ikan}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000013'::uuid, 'Susu UHT',          'liter',  'PH',   20,  18000, 'WET',     '{susu}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000014'::uuid, 'Telur Puyuh',       'kg',     'PH',    6,  35000, 'WET',     '{telur}'::text[],    now(), now()),
  ('b0000001-0000-0000-0000-000000000015'::uuid, 'Bayam',             'ikat',   'SY',   30,   4000, 'WET',     '{}'::text[],         now(), now()),
  ('b0000001-0000-0000-0000-000000000016'::uuid, 'Wortel',            'kg',     'SY',   15,  12000, 'WET',     '{}'::text[],         now(), now()),
  ('b0000001-0000-0000-0000-000000000017'::uuid, 'Kangkung',          'ikat',   'SY',   25,   3000, 'WET',     '{}'::text[],         now(), now()),
  ('b0000001-0000-0000-0000-000000000018'::uuid, 'Buncis',            'kg',     'SY',   12,  10000, 'WET',     '{}'::text[],         now(), now()),
  ('b0000001-0000-0000-0000-000000000019'::uuid, 'Tomat',             'kg',     'SY',   15,   8000, 'WET',     '{}'::text[],         now(), now()),
  ('b0000001-0000-0000-0000-000000000020'::uuid, 'Labu Kuning',       'kg',     'SY',   10,   8000, 'DRY',     '{}'::text[],         now(), now()),
  ('b0000001-0000-0000-0000-000000000021'::uuid, 'Kol',               'kg',     'SY',   12,   7000, 'WET',     '{}'::text[],         now(), now()),
  ('b0000001-0000-0000-0000-000000000022'::uuid, 'Bawang Merah',      'kg',     'BB',   10,  25000, 'DRY',     '{}'::text[],         now(), now()),
  ('b0000001-0000-0000-0000-000000000023'::uuid, 'Bawang Putih',      'kg',     'BB',    8,  20000, 'DRY',     '{}'::text[],         now(), now()),
  ('b0000001-0000-0000-0000-000000000024'::uuid, 'Cabe Merah',        'kg',     'BB',    5,  35000, 'WET',     '{}'::text[],         now(), now()),
  ('b0000001-0000-0000-0000-000000000025'::uuid, 'Cabe Rawit',        'kg',     'BB',    3,  45000, 'WET',     '{}'::text[],         now(), now()),
  ('b0000001-0000-0000-0000-000000000026'::uuid, 'Gula Pasir',        'kg',     'BB',   15,  15000, 'DRY',     '{}'::text[],         now(), now()),
  ('b0000001-0000-0000-0000-000000000027'::uuid, 'Garam',             'kg',     'BB',    5,   5000, 'DRY',     '{}'::text[],         now(), now()),
  ('b0000001-0000-0000-0000-000000000028'::uuid, 'Kecap Manis',       'botol',  'BB',   10,  12000, 'DRY',     '{kedelai}'::text[],  now(), now()),
  ('b0000001-0000-0000-0000-000000000029'::uuid, 'Minyak Goreng',     'liter',  'BB',   12,  18000, 'DRY',     '{}'::text[],         now(), now()),
  ('b0000001-0000-0000-0000-000000000030'::uuid, 'Santan Instan',     'liter',  'BB',    8,  15000, 'DRY',     '{}'::text[],         now(), now());

-- ============= STOCK LOTS =============
INSERT INTO public.stock_lots (id, item_id, quantity, actual_quantity, expiry_date, received_at, note, zone) VALUES
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000001'::uuid, 100, 95,  now() + interval '6 months', now() - interval '30 days', 'Lot A - Gudang Pusat',       'DRY'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000001'::uuid, 50,  48,  now() + interval '8 months', now() - interval '14 days', 'Lot B - Supplier Baru',       'DRY'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000001'::uuid, 30,  30,  now() + interval '10 months',now() - interval '7 days',  'Lot C - Cadangan',            'DRY'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000002'::uuid, 20,  18,  now() + interval '4 months', now() - interval '10 days', 'Organik',                     'DRY'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000003'::uuid, 40,  35,  now() + interval '14 days',  now() - interval '5 days',  'Supplier Sayur',              'DRY'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000003'::uuid, 25,  22,  now() + interval '20 days',  now() - interval '2 days',  'Lot baru',                    'DRY'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000004'::uuid, 30,  28,  now() + interval '5 months', now() - interval '15 days', 'Indofood',                    'DRY'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000005'::uuid, 15,  12,  now() + interval '7 days',   now() - interval '3 days',  'Panen lokal',                 'DRY'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000006'::uuid, 10,  8,   now() - interval '2 days',   now() - interval '20 days', 'SUDAH EXPIRED - sisihkan',    'WET'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000006'::uuid, 30,  28,  now() + interval '14 days',  now() - interval '7 days',  'Fresh dari peternakan',       'WET'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000007'::uuid, 20,  15,  now() + interval '3 days',   now() - interval '3 days',  'Produksi kemarin',            'WET'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000007'::uuid, 15,  15,  now() + interval '5 days',   now() - interval '1 day',   'Baru datang',                 'WET'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000008'::uuid, 25,  20,  now() + interval '4 days',   now() - interval '2 days',  'Pabrik Tahu Sari',            'WET'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000009'::uuid, 30,  25,  now() + interval '60 days',  now() - interval '20 days', 'Batch Maret',                 'FREEZER'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000009'::uuid, 20,  20,  now() + interval '90 days',  now() - interval '10 days', 'Batch April',                 'FREEZER'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000010'::uuid, 15,  12,  now() + interval '45 days',  now() - interval '5 days',  'Supplier Ikan Laut',          'FREEZER'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000011'::uuid, 5,   4,   now() + interval '30 days',  now() - interval '3 days',  'Sisa stok - perlu restock',   'FREEZER'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000013'::uuid, 15,  14,  now() + interval '90 days',  now() - interval '5 days',  'Ultramilk',                   'WET'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000022'::uuid, 3,   3,   now() + interval '30 days',  now() - interval '10 days', 'Stok hampir habis',           'DRY'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000029'::uuid, 20,  18,  '2027-06-01'::date,         now() - interval '14 days', 'Bimoli 2lt x 10',            'DRY'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000024'::uuid, 8,   7,   now() + interval '10 days',  now() - interval '2 days',  'Segar',                       'WET'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000017'::uuid, 30,  25,  now() + interval '2 days',   now() - interval '1 day',   'Prioritaskan',                'WET');

-- ============= RECIPES (20 resep MBG Standar Permenkes 28/2019) =============
-- BALITA: porsi kecil, lembut
-- PORTION_SMALL: PAUD/SD 1-3
-- PORTION_LARGE: SD 4-SMA
-- BUMIL_BUSUI: Ibu hamil & menyusui
INSERT INTO public.recipes (id, name, servings, menu_category, ingredients, instructions, calories_kcal, protein_g, carbs_g, fats_g, sodium_mg, allergens, created_at) VALUES
  -- BALITA (3 resep)
  ('c0000001-0000-0000-0000-000000000001'::uuid, 'Bubur Ayam Wortel', 1, 'BALITA',
   '[{"item_id":"b0000001-0000-0000-0000-000000000001","name":"Beras Premium","qty":0.08,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000009","name":"Ayam Beku","qty":0.04,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000016","name":"Wortel","qty":0.04,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000022","name":"Bawang Merah","qty":0.005,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","qty":0.003,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000027","name":"Garam","qty":0.001,"unit":"kg"}]'::jsonb,
   'Rebus beras dengan kaldu ayam hingga lembut. Masukkan wortel parut. Suwir ayam halus. Sajikan hangat.',
   180, 10, 24, 5, 200, '{}'::text[], now() - interval '90 days'),
  ('c0000001-0000-0000-0000-000000000002'::uuid, 'Nasi Tim Telur Bayam', 1, 'BALITA',
   '[{"item_id":"b0000001-0000-0000-0000-000000000001","name":"Beras Premium","qty":0.06,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000006","name":"Telur Ayam","qty":0.03,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000015","name":"Bayam","qty":0.02,"unit":"ikat"},{"item_id":"b0000001-0000-0000-0000-000000000013","name":"Susu UHT","qty":0.02,"unit":"liter"},{"item_id":"b0000001-0000-0000-0000-000000000027","name":"Garam","qty":0.001,"unit":"kg"}]'::jsonb,
   'Kukus nasi dengan air susu hingga lembut. Rebus bayam, cincang halus. Orak-arik telur. Sajikan tim nasi dengan bayam & telur.',
   170, 8, 20, 6, 180, '{telur,susu}'::text[], now() - interval '88 days'),
  ('c0000001-0000-0000-0000-000000000003'::uuid, 'Bubur Merah Labu Kuning', 1, 'BALITA',
   '[{"item_id":"b0000001-0000-0000-0000-000000000002","name":"Beras Merah","qty":0.06,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000020","name":"Labu Kuning","qty":0.06,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000027","name":"Garam","qty":0.001,"unit":"kg"}]'::jsonb,
   'Rebus beras merah hingga pecah. Masukkan labu kuning parut. Masak hingga lembut. Sajikan hangat.',
   160, 4, 30, 2, 80, '{}'::text[], now() - interval '85 days'),
  -- PORTION_SMALL (4 resep)
  ('c0000001-0000-0000-0000-000000000004'::uuid, 'Nasi Ayam Buncis Wortel', 1, 'PORTION_SMALL',
   '[{"item_id":"b0000001-0000-0000-0000-000000000001","name":"Beras Premium","qty":0.12,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000009","name":"Ayam Beku","qty":0.06,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000018","name":"Buncis","qty":0.04,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000016","name":"Wortel","qty":0.03,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000022","name":"Bawang Merah","qty":0.01,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","qty":0.005,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000028","name":"Kecap Manis","qty":0.01,"unit":"botol"},{"item_id":"b0000001-0000-0000-0000-000000000029","name":"Minyak Goreng","qty":0.015,"unit":"liter"}]'::jsonb,
   'Ungkep ayam dengan bumbu. Tumis buncis & wortel. Sajikan nasi dengan ayam ungkep dan tumis sayur.',
   340, 18, 40, 10, 400, '{}'::text[], now() - interval '82 days'),
  ('c0000001-0000-0000-0000-000000000005'::uuid, 'Nasi Ikan Kembung Kol', 1, 'PORTION_SMALL',
   '[{"item_id":"b0000001-0000-0000-0000-000000000001","name":"Beras Premium","qty":0.12,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000010","name":"Ikan Kembung","qty":0.06,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000021","name":"Kol","qty":0.04,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000016","name":"Wortel","qty":0.02,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","qty":0.005,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000029","name":"Minyak Goreng","qty":0.015,"unit":"liter"}]'::jsonb,
   'Bakar ikan dengan bumbu kunyit. Tumis kol & wortel. Sajikan nasi dengan ikan bakar dan tumis.',
   320, 20, 38, 10, 350, '{ikan}'::text[], now() - interval '80 days'),
  ('c0000001-0000-0000-0000-000000000006'::uuid, 'Mie Telur Bayam Wortel', 1, 'PORTION_SMALL',
   '[{"item_id":"b0000001-0000-0000-0000-000000000004","name":"Mie Telur","qty":0.08,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000006","name":"Telur Ayam","qty":0.03,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000015","name":"Bayam","qty":0.02,"unit":"ikat"},{"item_id":"b0000001-0000-0000-0000-000000000016","name":"Wortel","qty":0.02,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","qty":0.005,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000029","name":"Minyak Goreng","qty":0.01,"unit":"liter"}]'::jsonb,
   'Rebus mie hingga matang. Tumis bawang, orak-arik telur. Masukkan bayam & wortel. Campur dengan mie.',
   300, 14, 38, 10, 300, '{telur,gluten}'::text[], now() - interval '78 days'),
  ('c0000001-0000-0000-0000-000000000007'::uuid, 'Nasi Cap Cay Tempe', 1, 'PORTION_SMALL',
   '[{"item_id":"b0000001-0000-0000-0000-000000000001","name":"Beras Premium","qty":0.12,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000007","name":"Tempe","qty":0.06,"unit":"papan"},{"item_id":"b0000001-0000-0000-0000-000000000016","name":"Wortel","qty":0.03,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000018","name":"Buncis","qty":0.03,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000021","name":"Kol","qty":0.02,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000008","name":"Tahu","qty":0.04,"unit":"papan"},{"item_id":"b0000001-0000-0000-0000-000000000029","name":"Minyak Goreng","qty":0.02,"unit":"liter"}]'::jsonb,
   'Goreng tempe & tahu. Tumis sayuran cap cabay. Sajikan nasi dengan tempe, tahu, dan cap cay.',
   330, 15, 42, 12, 350, '{kedelai}'::text[], now() - interval '75 days'),
  -- PORTION_LARGE (6 resep)
  ('c0000001-0000-0000-0000-000000000008'::uuid, 'Nasi Ayam Bakar Tempe Kangkung', 1, 'PORTION_LARGE',
   '[{"item_id":"b0000001-0000-0000-0000-000000000001","name":"Beras Premium","qty":0.18,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000009","name":"Ayam Beku","qty":0.1,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000007","name":"Tempe","qty":0.08,"unit":"papan"},{"item_id":"b0000001-0000-0000-0000-000000000017","name":"Kangkung","qty":0.15,"unit":"ikat"},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","qty":0.008,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000024","name":"Cabe Merah","qty":0.008,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000028","name":"Kecap Manis","qty":0.015,"unit":"botol"},{"item_id":"b0000001-0000-0000-0000-000000000029","name":"Minyak Goreng","qty":0.025,"unit":"liter"}]'::jsonb,
   'Ungkep ayam, bakar dengan kecap. Goreng tempe. Tumis kangkung bawang putih. Sajikan dengan nasi.',
   520, 30, 55, 18, 500, '{kedelai}'::text[], now() - interval '72 days'),
  ('c0000001-0000-0000-0000-000000000009'::uuid, 'Nasi Ikan Goreng Cap Cay', 1, 'PORTION_LARGE',
   '[{"item_id":"b0000001-0000-0000-0000-000000000001","name":"Beras Premium","qty":0.18,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000010","name":"Ikan Kembung","qty":0.1,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000016","name":"Wortel","qty":0.04,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000018","name":"Buncis","qty":0.04,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000021","name":"Kol","qty":0.03,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","qty":0.008,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000029","name":"Minyak Goreng","qty":0.03,"unit":"liter"}]'::jsonb,
   'Goreng ikan hingga kecoklatan. Tumis sayuran cap cay. Sajikan nasi dengan ikan goreng dan sayur.',
   480, 28, 52, 16, 450, '{ikan}'::text[], now() - interval '70 days'),
  ('c0000001-0000-0000-0000-000000000010'::uuid, 'Nasi Daging Sapi Buncis Wortel', 1, 'PORTION_LARGE',
   '[{"item_id":"b0000001-0000-0000-0000-000000000001","name":"Beras Premium","qty":0.18,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000011","name":"Daging Sapi Giling","qty":0.08,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000018","name":"Buncis","qty":0.05,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000016","name":"Wortel","qty":0.04,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000022","name":"Bawang Merah","qty":0.01,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","qty":0.008,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000028","name":"Kecap Manis","qty":0.01,"unit":"botol"},{"item_id":"b0000001-0000-0000-0000-000000000029","name":"Minyak Goreng","qty":0.02,"unit":"liter"}]'::jsonb,
   'Tumis daging sapi giling dengan kecap. Tumis buncis & wortel terpisah. Sajikan nasi dengan daging sapi dan tumis sayur.',
   530, 28, 58, 18, 550, '{}'::text[], now() - interval '68 days'),
  ('c0000001-0000-0000-0000-000000000011'::uuid, 'Nasi Telur Balado Tumis Kol', 1, 'PORTION_LARGE',
   '[{"item_id":"b0000001-0000-0000-0000-000000000001","name":"Beras Premium","qty":0.18,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000006","name":"Telur Ayam","qty":0.08,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000021","name":"Kol","qty":0.05,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000024","name":"Cabe Merah","qty":0.02,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000022","name":"Bawang Merah","qty":0.015,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000019","name":"Tomat","qty":0.02,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000029","name":"Minyak Goreng","qty":0.025,"unit":"liter"}]'::jsonb,
   'Rebus & goreng telur. Haluskan cabe, bawang, tomat untuk sambal balado. Tumis kol. Sajikan nasi dengan telur balado dan tumis kol.',
   450, 18, 50, 18, 400, '{telur}'::text[], now() - interval '65 days'),
  ('c0000001-0000-0000-0000-000000000012'::uuid, 'Nasi Tempe Tahu Bacem Tumis Bayam', 1, 'PORTION_LARGE',
   '[{"item_id":"b0000001-0000-0000-0000-000000000001","name":"Beras Premium","qty":0.18,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000007","name":"Tempe","qty":0.1,"unit":"papan"},{"item_id":"b0000001-0000-0000-0000-000000000008","name":"Tahu","qty":0.08,"unit":"papan"},{"item_id":"b0000001-0000-0000-0000-000000000015","name":"Bayam","qty":0.12,"unit":"ikat"},{"item_id":"b0000001-0000-0000-0000-000000000022","name":"Bawang Merah","qty":0.01,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","qty":0.005,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000028","name":"Kecap Manis","qty":0.015,"unit":"botol"},{"item_id":"b0000001-0000-0000-0000-000000000029","name":"Minyak Goreng","qty":0.02,"unit":"liter"}]'::jsonb,
   'Rebus tempe & tahu dengan kecap, gula, bawang hingga meresap (bacem). Goreng sebentar. Tumis bayam. Sajikan nasi.',
   440, 20, 55, 16, 400, '{kedelai}'::text[], now() - interval '62 days'),
  ('c0000001-0000-0000-0000-000000000013'::uuid, 'Nasi Sup Jagung Telur Puyuh', 1, 'PORTION_LARGE',
   '[{"item_id":"b0000001-0000-0000-0000-000000000001","name":"Beras Premium","qty":0.18,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000005","name":"Jagung Manis","qty":0.08,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","name":"Telur Puyuh","qty":0.04,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000016","name":"Wortel","qty":0.03,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","qty":0.005,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000027","name":"Garam","qty":0.002,"unit":"kg"}]'::jsonb,
   'Rebus jagung & wortel. Masukkan kocokan telur. Rebus telur puyuh, kupas. Sajikan nasi dengan sup jagung dan telur puyuh.',
   420, 18, 58, 12, 380, '{telur}'::text[], now() - interval '60 days'),
  -- BUMIL_BUSUI (7 resep)
  ('c0000001-0000-0000-0000-000000000014'::uuid, 'Nasi Pepes Ayam Bayam', 1, 'BUMIL_BUSUI',
   '[{"item_id":"b0000001-0000-0000-0000-000000000001","name":"Beras Premium","qty":0.15,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000009","name":"Ayam Beku","qty":0.08,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000015","name":"Bayam","qty":0.06,"unit":"ikat"},{"item_id":"b0000001-0000-0000-0000-000000000019","name":"Tomat","qty":0.02,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000022","name":"Bawang Merah","qty":0.01,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","qty":0.005,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000025","name":"Cabe Rawit","qty":0.003,"unit":"kg"}]'::jsonb,
   'Haluskan bumbu. Campur ayam suwir, bayam, tomat. Bungkus daun pisang, kukus hingga matang. Sajikan dengan nasi.',
   400, 25, 45, 12, 350, '{}'::text[], now() - interval '58 days'),
  ('c0000001-0000-0000-0000-000000000015'::uuid, 'Nasi Ikan Bakar Wortel Kol', 1, 'BUMIL_BUSUI',
   '[{"item_id":"b0000001-0000-0000-0000-000000000001","name":"Beras Premium","qty":0.15,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000010","name":"Ikan Kembung","qty":0.08,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000016","name":"Wortel","qty":0.04,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000021","name":"Kol","qty":0.04,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","qty":0.005,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000029","name":"Minyak Goreng","qty":0.015,"unit":"liter"}]'::jsonb,
   'Lumuri ikan dengan bumbu kunyit & bawang. Bakar hingga matang. Tumis wortel & kol. Sajikan nasi dengan ikan bakar.',
   410, 24, 48, 12, 380, '{ikan}'::text[], now() - interval '55 days'),
  ('c0000001-0000-0000-0000-000000000016'::uuid, 'Bubur Merah Telur Puyuh', 1, 'BUMIL_BUSUI',
   '[{"item_id":"b0000001-0000-0000-0000-000000000002","name":"Beras Merah","qty":0.1,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","name":"Telur Puyuh","qty":0.06,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000016","name":"Wortel","qty":0.03,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000027","name":"Garam","qty":0.001,"unit":"kg"}]'::jsonb,
   'Rebus beras merah hingga pecah. Masukkan wortel parut. Rebus & kupas telur puyuh. Sajikan bubur dengan telur puyuh.',
   350, 18, 42, 10, 300, '{telur}'::text[], now() - interval '52 days'),
  ('c0000001-0000-0000-0000-000000000017'::uuid, 'Nasi Ayam Ungkep Labu Kuning', 1, 'BUMIL_BUSUI',
   '[{"item_id":"b0000001-0000-0000-0000-000000000001","name":"Beras Premium","qty":0.15,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000009","name":"Ayam Beku","qty":0.08,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000020","name":"Labu Kuning","qty":0.08,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000022","name":"Bawang Merah","qty":0.01,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","qty":0.005,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000027","name":"Garam","qty":0.002,"unit":"kg"}]'::jsonb,
   'Ungkep ayam dengan kunyit, bawang, garam hingga empuk. Kukus labu kuning hingga lembut. Sajikan nasi dengan ayam ungkep dan labu.',
   420, 22, 50, 14, 380, '{}'::text[], now() - interval '50 days'),
  ('c0000001-0000-0000-0000-000000000018'::uuid, 'Nasi Telur Puyuh Balado Tumis Buncis', 1, 'BUMIL_BUSUI',
   '[{"item_id":"b0000001-0000-0000-0000-000000000001","name":"Beras Premium","qty":0.15,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","name":"Telur Puyuh","qty":0.06,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000018","name":"Buncis","qty":0.06,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000024","name":"Cabe Merah","qty":0.015,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000022","name":"Bawang Merah","qty":0.01,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000029","name":"Minyak Goreng","qty":0.02,"unit":"liter"}]'::jsonb,
   'Rebus & kupas telur puyuh. Tumis sambal balado, masukkan telur. Tumis buncis terpisah. Sajikan nasi.',
   380, 20, 45, 14, 350, '{telur}'::text[], now() - interval '48 days'),
  ('c0000001-0000-0000-0000-000000000019'::uuid, 'Nasi Ikan Asin Kol Kentang', 1, 'BUMIL_BUSUI',
   '[{"item_id":"b0000001-0000-0000-0000-000000000001","name":"Beras Premium","qty":0.15,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000012","name":"Ikan Asin","qty":0.05,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000021","name":"Kol","qty":0.05,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000003","name":"Kentang","qty":0.06,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000024","name":"Cabe Merah","qty":0.01,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000022","name":"Bawang Merah","qty":0.01,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000029","name":"Minyak Goreng","qty":0.02,"unit":"liter"}]'::jsonb,
   'Goreng ikan asin hingga renyah. Tumis kol dengan bumbu. Goreng kentang dadu. Sajikan nasi dengan lauk lengkap.',
   390, 18, 48, 14, 420, '{ikan}'::text[], now() - interval '45 days'),
  ('c0000001-0000-0000-0000-000000000020'::uuid, 'Nasi Sop Ayam Santan Labu', 1, 'BUMIL_BUSUI',
   '[{"item_id":"b0000001-0000-0000-0000-000000000001","name":"Beras Premium","qty":0.15,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000009","name":"Ayam Beku","qty":0.06,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000020","name":"Labu Kuning","qty":0.06,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000030","name":"Santan Instan","qty":0.04,"unit":"liter"},{"item_id":"b0000001-0000-0000-0000-000000000022","name":"Bawang Merah","qty":0.01,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","qty":0.005,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000027","name":"Garam","qty":0.002,"unit":"kg"}]'::jsonb,
   'Rebus ayam hingga empuk. Masukkan labu kuning potong. Tambah santan, masak hingga labu empuk. Sajikan nasi dengan sop.',
   410, 20, 50, 14, 360, '{}'::text[], now() - interval '42 days');

-- ============= MENUS =============
INSERT INTO public.menus (id, week_start, day, recipe_ids, portions, status, approved_by, approved_by_name, approved_at, signature, created_at) VALUES
  ('d0000001-0000-0000-0000-000000000001'::uuid, to_char(date_trunc('week', now()), 'YYYY-MM-DD'), 'mon',
   ARRAY['c0000001-0000-0000-0000-000000000001'::text, 'c0000001-0000-0000-0000-000000000005'::text, 'c0000001-0000-0000-0000-000000000008'::text],
   100, 'APPROVED', 'a0000001-0000-0000-0000-000000000007'::text, 'Ahli Gizi Maya', now() - interval '2 days',
   'Ahli Gizi Maya (nutritionist) - Menu seimbang', now() - interval '7 days'),
  ('d0000001-0000-0000-0000-000000000002'::uuid, to_char(date_trunc('week', now()), 'YYYY-MM-DD'), 'tue',
   ARRAY['c0000001-0000-0000-0000-000000000002'::text, 'c0000001-0000-0000-0000-000000000007'::text, 'c0000001-0000-0000-0000-000000000009'::text],
   100, 'APPROVED', 'a0000001-0000-0000-0000-000000000007'::text, 'Ahli Gizi Maya', now() - interval '1 day',
   'Ahli Gizi Maya (nutritionist) - Adjusted protein', now() - interval '6 days'),
  ('d0000001-0000-0000-0000-000000000003'::uuid, to_char(date_trunc('week', now()), 'YYYY-MM-DD'), 'wed',
   ARRAY['c0000001-0000-0000-0000-000000000011'::text, 'c0000001-0000-0000-0000-000000000013'::text, 'c0000001-0000-0000-0000-000000000015'::text],
   100, 'PENDING_REVIEW', NULL, NULL, NULL, NULL, now() - interval '5 days'),
  ('d0000001-0000-0000-0000-000000000004'::uuid, to_char(date_trunc('week', now()), 'YYYY-MM-DD'), 'thu',
   ARRAY['c0000001-0000-0000-0000-000000000006'::text, 'c0000001-0000-0000-0000-000000000010'::text],
   100, 'DRAFT', NULL, NULL, NULL, NULL, now() - interval '4 days'),
  ('d0000001-0000-0000-0000-000000000005'::uuid, to_char(date_trunc('week', now()), 'YYYY-MM-DD'), 'fri',
   ARRAY['c0000001-0000-0000-0000-000000000004'::text, 'c0000001-0000-0000-0000-000000000012'::text, 'c0000001-0000-0000-0000-000000000014'::text],
   100, 'DRAFT', NULL, NULL, NULL, NULL, now() - interval '3 days');

-- ============= MENUS - MINGGU LALU (semua APPROVED) =============
INSERT INTO public.menus (id, week_start, day, recipe_ids, portions, status, approved_by, approved_by_name, approved_at, signature, created_at) VALUES
  ('d0000001-0000-0000-0000-000000000011'::uuid, to_char(date_trunc('week', now() - interval '7 days'), 'YYYY-MM-DD'), 'mon',
   ARRAY['c0000001-0000-0000-0000-000000000008'::text, 'c0000001-0000-0000-0000-000000000005'::text, 'c0000001-0000-0000-0000-000000000014'::text],
   120, 'APPROVED', 'a0000001-0000-0000-0000-000000000007'::text, 'Ahli Gizi Maya', now() - interval '9 days',
   'Ahli Gizi Maya (nutritionist) - Menu minggu lalu senin', now() - interval '14 days'),
  ('d0000001-0000-0000-0000-000000000012'::uuid, to_char(date_trunc('week', now() - interval '7 days'), 'YYYY-MM-DD'), 'tue',
   ARRAY['c0000001-0000-0000-0000-000000000009'::text, 'c0000001-0000-0000-0000-000000000015'::text, 'c0000001-0000-0000-0000-000000000017'::text],
   120, 'APPROVED', 'a0000001-0000-0000-0000-000000000007'::text, 'Ahli Gizi Maya', now() - interval '8 days',
   'Ahli Gizi Maya (nutritionist) - Menu minggu lalu selasa', now() - interval '13 days'),
  ('d0000001-0000-0000-0000-000000000013'::uuid, to_char(date_trunc('week', now() - interval '7 days'), 'YYYY-MM-DD'), 'wed',
   ARRAY['c0000001-0000-0000-0000-000000000010'::text, 'c0000001-0000-0000-0000-000000000016'::text, 'c0000001-0000-0000-0000-000000000018'::text],
   120, 'APPROVED', 'a0000001-0000-0000-0000-000000000007'::text, 'Ahli Gizi Maya', now() - interval '7 days',
   'Ahli Gizi Maya (nutritionist) - Menu minggu lalu rabu', now() - interval '12 days'),
  ('d0000001-0000-0000-0000-000000000014'::uuid, to_char(date_trunc('week', now() - interval '7 days'), 'YYYY-MM-DD'), 'thu',
   ARRAY['c0000001-0000-0000-0000-000000000011'::text, 'c0000001-0000-0000-0000-000000000019'::text, 'c0000001-0000-0000-0000-000000000020'::text],
   120, 'APPROVED', 'a0000001-0000-0000-0000-000000000007'::text, 'Ahli Gizi Maya', now() - interval '6 days',
   'Ahli Gizi Maya (nutritionist) - Menu minggu lalu kamis', now() - interval '11 days'),
  ('d0000001-0000-0000-0000-000000000015'::uuid, to_char(date_trunc('week', now() - interval '7 days'), 'YYYY-MM-DD'), 'fri',
   ARRAY['c0000001-0000-0000-0000-000000000012'::text, 'c0000001-0000-0000-0000-000000000006'::text, 'c0000001-0000-0000-0000-000000000013'::text],
   120, 'APPROVED', 'a0000001-0000-0000-0000-000000000007'::text, 'Ahli Gizi Maya', now() - interval '5 days',
   'Ahli Gizi Maya (nutritionist) - Menu minggu lalu jumat', now() - interval '10 days');

-- ============= SETTINGS =============
INSERT INTO public.settings (key, value) VALUES
  ('dapur_name', 'SPPG MBG Kadudampit'),
  ('logo', '');

-- ============= GLOBAL CONFIG =============
INSERT INTO public.global_config (key, value, description, updated_at) VALUES
  ('tax_rate_percent', '11', 'Persentase PPN/PPH', NOW()),
  ('incentive_per_portion', '2000', 'Insentif fasilitas per porsi', NOW()),
  ('price_group1', '8000', 'Harga satuan Kelompok 1', NOW()),
  ('price_group2', '10000', 'Harga satuan Kelompok 2', NOW()),
  ('daily_portion_capacity', '3000', 'Kapasitas maksimal porsi/hari', NOW()),
  ('max_beneficiaries', '2500', 'Maksimal penerima manfaat/hari', NOW()),
  ('cooking_start_hour', '1', 'Jam mulai masak', NOW()),
  ('distribution_start_hour', '9', 'Jam mulai distribusi', NOW()),
  ('operational_percentage', '20', 'Persentase operasional', NOW()),
  ('incentive_percentage', '13', 'Persentase insentif fasilitas', NOW()),
  ('bahan_baku_percentage', '67', 'Persentase bahan baku', NOW());

-- ============= CHART OF ACCOUNTS =============
INSERT INTO public.chart_of_accounts (code, name, type, parent_code, is_active) VALUES
  ('1000', 'BUKU KAS UMUM', 'ASET', NULL, true),
  ('1100', 'Petty Cash', 'ASET', '1000', true),
  ('1200', 'Kas di Bank', 'ASET', '1000', true),
  ('1300', 'Dana Bantuan Pemerintah', 'ASET', '1000', true),
  ('2000', 'BELANJA', 'BELANJA', NULL, true),
  ('2100', 'Biaya Bahan Baku', 'BELANJA', '2000', true),
  ('2200', 'Biaya Operasional', 'BELANJA', '2000', true),
  ('2300', 'Biaya Insentif Fasilitas', 'BELANJA', '2000', true),
  ('3100', 'PPN', 'BELANJA', '2000', true);

-- ============= BIWEEKLY PERIODS =============
INSERT INTO public.biweekly_periods (id, period_name, start_date, end_date, is_active) VALUES
  (gen_random_uuid(), 'Periode 05-17 Januari 2026', '2026-01-05', '2026-01-17', true),
  (gen_random_uuid(), 'Periode 19-31 Januari 2026', '2026-01-19', '2026-01-31', true),
  (gen_random_uuid(), 'Periode 02-14 Februari 2026', '2026-02-02', '2026-02-14', true);

-- ============= SETUP SPPG =============
INSERT INTO public.setup_sppg (nama_sppg, id_sppg, alamat, nama_kepala, nama_akuntan, nama_yayasan, rekening_va, tahun_anggaran, periode_start, periode_end)
VALUES ('SPPG MBG Kadudampit', 'SPPG-KDD-001', 'Jl. Raya Kadudampit No. 1, Kab. Sukabumi', 'Pak Kepala Dapur', 'Sri Akuntansi', 'Yayasan Bakti Sosial', 'VA-1234567890', 2026, '2026-01-05', '2026-12-31');

-- ============= ITEM HIERARCHIES =============
INSERT INTO public.item_hierarchies (code, name, level, parent_code, category, unit, zone) VALUES
  ('KH', 'Karbohidrat', 1, NULL, 'KH', NULL, NULL),
  ('PH', 'Protein Hewani', 1, NULL, 'PH', NULL, NULL),
  ('PN', 'Protein Nabati', 1, NULL, 'PN', NULL, NULL),
  ('SY', 'Sayuran', 1, NULL, 'SY', NULL, NULL),
  ('BU', 'Buah-buahan', 1, NULL, 'BU', NULL, NULL),
  ('BB', 'Bahan Baku Lain', 1, NULL, 'BB', NULL, NULL),
  ('KH-01', 'Beras & Serealia', 2, 'KH', 'KH', NULL, NULL),
  ('KH-02', 'Umbi-umbian', 2, 'KH', 'KH', NULL, NULL),
  ('PH-01', 'Daging & Unggas', 2, 'PH', 'PH', NULL, NULL),
  ('PH-02', 'Ikan & Seafood', 2, 'PH', 'PH', NULL, NULL),
  ('PH-03', 'Telur & Susu', 2, 'PH', 'PH', NULL, NULL),
  ('PN-01', 'Kedelai & Olahan', 2, 'PN', 'PN', NULL, NULL),
  ('SY-01', 'Sayuran Daun', 2, 'SY', 'SY', NULL, NULL),
  ('SY-02', 'Sayuran Akar', 2, 'SY', 'SY', NULL, NULL),
  ('SY-03', 'Sayuran Buah', 2, 'SY', 'SY', NULL, NULL),
  ('BB-01', 'Bumbu Dapur', 2, 'BB', 'BB', NULL, NULL),
  ('BB-02', 'Minyak & Lemak', 2, 'BB', 'BB', NULL, NULL),
  ('KH-01-001', 'Beras Premium', 3, 'KH-01', 'KH', 'kg', 'DRY'),
  ('KH-01-002', 'Beras Merah', 3, 'KH-01', 'KH', 'kg', 'DRY'),
  ('KH-02-001', 'Kentang', 3, 'KH-02', 'KH', 'kg', 'DRY'),
  ('PH-01-001', 'Ayam Beku', 3, 'PH-01', 'PH', 'kg', 'FREEZER'),
  ('PH-02-001', 'Ikan Kembung', 3, 'PH-02', 'PH', 'kg', 'FREEZER'),
  ('PH-03-001', 'Telur Ayam', 3, 'PH-03', 'PH', 'kg', 'WET'),
  ('PN-01-001', 'Tempe', 3, 'PN-01', 'PN', 'papan', 'WET'),
  ('PN-01-002', 'Tahu', 3, 'PN-01', 'PN', 'papan', 'WET'),
  ('SY-01-001', 'Bayam', 3, 'SY-01', 'SY', 'ikat', 'WET'),
  ('SY-01-002', 'Kangkung', 3, 'SY-01', 'SY', 'ikat', 'WET'),
  ('SY-02-001', 'Wortel', 3, 'SY-02', 'SY', 'kg', 'WET'),
  ('BB-01-001', 'Bawang Merah', 3, 'BB-01', 'BB', 'kg', 'DRY'),
  ('BB-01-002', 'Bawang Putih', 3, 'BB-01', 'BB', 'kg', 'DRY'),
  ('BB-01-003', 'Cabe Merah', 3, 'BB-01', 'BB', 'kg', 'WET'),
  ('BB-02-001', 'Minyak Goreng', 3, 'BB-02', 'BB', 'liter', 'DRY');

-- ============= OPNAMES =============
INSERT INTO public.opnames (id, item_id, lot_id, counted_quantity, note, zone, temperature_c, humidity_pct, reason, counted_by, created_at) VALUES
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000001'::uuid, (SELECT id FROM stock_lots WHERE item_id = 'b0000001-0000-0000-0000-000000000001'::uuid ORDER BY created_at LIMIT 1), 95, 'Opname rutin', 'DRY', null, 55, 'Routine', 'Staf Gudang', now() - interval '7 days'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000006'::uuid, (SELECT id FROM stock_lots WHERE item_id = 'b0000001-0000-0000-0000-000000000006'::uuid ORDER BY created_at DESC LIMIT 1), 28, 'Cocok dengan catatan', 'WET', 3.5, null, 'Routine', 'Staf Gudang', now() - interval '5 days'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000009'::uuid, (SELECT id FROM stock_lots WHERE item_id = 'b0000001-0000-0000-0000-000000000009'::uuid ORDER BY created_at LIMIT 1), 23, 'Selisih 2 kg - penyusutan', 'FREEZER', -22, null, 'Adjustment', 'Staf Gudang', now() - interval '3 days'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000007'::uuid, (SELECT id FROM stock_lots WHERE item_id = 'b0000001-0000-0000-0000-000000000007'::uuid ORDER BY created_at LIMIT 1), 15, 'Tempe rusak 5 papan - spoilage', 'WET', 2, null, 'Spoilage', 'Staf Gudang', now() - interval '2 days'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000017'::uuid, (SELECT id FROM stock_lots WHERE item_id = 'b0000001-0000-0000-0000-000000000017'::uuid ORDER BY created_at LIMIT 1), 25, 'Kangkung layu 5 ikat', 'WET', 4, null, 'Spoilage', 'Staf Gudang', now() - interval '1 day'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000024'::uuid, (SELECT id FROM stock_lots WHERE item_id = 'b0000001-0000-0000-0000-000000000024'::uuid ORDER BY created_at LIMIT 1), 7, 'Masih segar, ok', 'WET', 3, null, 'Routine', 'Staf Gudang', now());

-- ============= PURCHASES =============
INSERT INTO public.purchases (id, category, description, amount_idr, receipt_total_idr, receipt_photo, transport_amount_idr, supplier, items, purchased_at, created_by, created_by_name, created_at, verified, verified_by, verified_at) VALUES
  (gen_random_uuid(), 'STOCK', 'Pembelian Beras Premium 150kg', 2250000, NULL, NULL, 75000, 'UD. Beras Jaya',
   '[{"item_id":"b0000001-0000-0000-0000-000000000001","name":"Beras Premium","quantity":150,"unit_price":15000}]'::jsonb,
   now() - interval '30 days', 'asisten@sppg.id', 'Asisten Belanja', now() - interval '30 days', true, 'akuntan@sppg.id', now() - interval '28 days'),
  (gen_random_uuid(), 'STOCK', 'Telur Ayam 30kg + Telur Puyuh 5kg', 1015000, 1015000, NULL, 0, 'Bina Mandiri Farm',
   '[{"item_id":"b0000001-0000-0000-0000-000000000006","name":"Telur Ayam","quantity":30,"unit_price":28000},{"item_id":"b0000001-0000-0000-0000-000000000014","name":"Telur Puyuh","quantity":5,"unit_price":35000}]'::jsonb,
   now() - interval '20 days', 'asisten@sppg.id', 'Asisten Belanja', now() - interval '20 days', true, 'akuntan@sppg.id', now() - interval '18 days'),
  (gen_random_uuid(), 'STOCK', 'Sayur mayur mingguan', 435000, 435000, NULL, 25000, 'Pasar Induk',
   '[{"item_id":"b0000001-0000-0000-0000-000000000015","name":"Bayam","quantity":40,"unit_price":4000},{"item_id":"b0000001-0000-0000-0000-000000000016","name":"Wortel","quantity":15,"unit_price":12000},{"item_id":"b0000001-0000-0000-0000-000000000017","name":"Kangkung","quantity":30,"unit_price":3000}]'::jsonb,
   now() - interval '7 days', 'staf@sppg.id', 'Staf Gudang', now() - interval '7 days', true, 'akuntan@sppg.id', now() - interval '6 days'),
  (gen_random_uuid(), 'STOCK', 'Protein: Ayam Beku 30kg + Ikan 15kg', 1665000, 1665000, NULL, 50000, 'Supplier Protein Sejahtera',
   '[{"item_id":"b0000001-0000-0000-0000-000000000009","name":"Ayam Beku","quantity":30,"unit_price":38000},{"item_id":"b0000001-0000-0000-0000-000000000010","name":"Ikan Kembung","quantity":15,"unit_price":35000}]'::jsonb,
   now() - interval '10 days', 'asisten@sppg.id', 'Asisten Belanja', now() - interval '10 days', true, 'akuntan@sppg.id', now() - interval '8 days'),
  (gen_random_uuid(), 'STOCK', 'Bumbu dapur & minyak goreng', 680000, 680000, NULL, 0, 'Toko Sembako Makmur',
   '[{"item_id":"b0000001-0000-0000-0000-000000000029","name":"Minyak Goreng","quantity":20,"unit_price":18000},{"item_id":"b0000001-0000-0000-0000-000000000022","name":"Bawang Merah","quantity":10,"unit_price":25000},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","quantity":6,"unit_price":20000}]'::jsonb,
   now() - interval '6 days', 'asisten@sppg.id', 'Asisten Belanja', now() - interval '6 days', false, NULL, NULL),
  (gen_random_uuid(), 'STOCK', 'Daging Sapi Giling 10kg', 550000, 550000, NULL, 0, 'Rumah Potong Hewan',
   '[{"item_id":"b0000001-0000-0000-0000-000000000011","name":"Daging Sapi Giling","quantity":10,"unit_price":55000}]'::jsonb,
   now() - interval '4 days', 'asisten@sppg.id', 'Asisten Belanja', now() - interval '4 days', false, NULL, NULL),
  (gen_random_uuid(), 'STOCK', 'Tempe & Tahu', 275000, 275000, NULL, 15000, 'Pabrik Tahu Sari',
   '[{"item_id":"b0000001-0000-0000-0000-000000000007","name":"Tempe","quantity":25,"unit_price":7000},{"item_id":"b0000001-0000-0000-0000-000000000008","name":"Tahu","quantity":20,"unit_price":5000}]'::jsonb,
   now() - interval '3 days', 'staf@sppg.id', 'Staf Gudang', now() - interval '3 days', false, NULL, NULL),
  (gen_random_uuid(), 'STOCK', 'Susu UHT & Santan', 270000, NULL, NULL, 0, 'Supermarket',
   '[{"item_id":"b0000001-0000-0000-0000-000000000013","name":"Susu UHT","quantity":10,"unit_price":18000},{"item_id":"b0000001-0000-0000-0000-000000000030","name":"Santan Instan","quantity":6,"unit_price":15000}]'::jsonb,
   now() - interval '2 days', 'asisten@sppg.id', 'Asisten Belanja', now() - interval '2 days', false, NULL, NULL),
  (gen_random_uuid(), 'STOCK', 'Mie Telur & Jagung', 165000, NULL, NULL, 0, 'Pasar',
   '[{"item_id":"b0000001-0000-0000-0000-000000000004","name":"Mie Telur","quantity":10,"unit_price":12000},{"item_id":"b0000001-0000-0000-0000-000000000005","name":"Jagung Manis","quantity":3,"unit_price":15000}]'::jsonb,
   now() - interval '1 day', 'staf@sppg.id', 'Staf Gudang', now() - interval '1 day', false, NULL, NULL),
  (gen_random_uuid(), 'OPERATIONAL', 'Gas LPG 3kg (15 tabung)', 300000, 300000, NULL, 0, 'Agen Gas',
   '[]'::jsonb, now() - interval '12 days', 'staf@sppg.id', 'Staf Gudang', now() - interval '12 days', true, 'akuntan@sppg.id', now() - interval '11 days'),
  (gen_random_uuid(), 'OPERATIONAL', 'Alat kebersihan dapur', 185000, 185000, NULL, 0, 'Toko Alat Rumah Tangga',
   '[]'::jsonb, now() - interval '8 days', 'staf@sppg.id', 'Staf Gudang', now() - interval '8 days', true, 'akuntan@sppg.id', now() - interval '7 days'),
  (gen_random_uuid(), 'OPERATIONAL', 'Transport belanja harian', 100000, NULL, NULL, 100000, NULL,
   '[]'::jsonb, now() - interval '1 day', 'asisten@sppg.id', 'Asisten Belanja', now() - interval '1 day', false, NULL, NULL);

-- ============= AUDIT TRAIL =============
INSERT INTO public.audit_trail (id, timestamp, actor, actor_id, actor_role, action, entity, entity_id, changes, note) VALUES
  (gen_random_uuid(), now() - interval '30 days', 'Asisten Belanja (field_assistant)', 'a0000001-0000-0000-0000-000000000005'::text, 'field_assistant', 'CREATE_PURCHASE', 'purchases', NULL, NULL, 'Pembelian Beras Premium 150kg'),
  (gen_random_uuid(), now() - interval '28 days', 'Sri Akuntansi (accountant)', 'a0000001-0000-0000-0000-000000000002'::text, 'accountant', 'VERIFY_PURCHASE', 'purchases', NULL, '{"verified":{"old":false,"new":true}}'::jsonb, 'Verifikasi pembelian beras'),
  (gen_random_uuid(), now() - interval '20 days', 'Asisten Belanja (field_assistant)', 'a0000001-0000-0000-0000-000000000005'::text, 'field_assistant', 'CREATE_PURCHASE', 'purchases', NULL, NULL, 'Telur Ayam 30kg + Telur Puyuh 5kg'),
  (gen_random_uuid(), now() - interval '14 days', 'Chef Wulan (head_chef)', 'a0000001-0000-0000-0000-000000000004'::text, 'head_chef', 'CREATE_RECIPE', 'recipes', 'c0000001-0000-0000-0000-000000000001'::text, NULL, 'Resep baru: Nasi Goreng Sayur'),
  (gen_random_uuid(), now() - interval '14 days', 'Chef Wulan (head_chef)', 'a0000001-0000-0000-0000-000000000004'::text, 'head_chef', 'CREATE_RECIPE', 'recipes', 'c0000001-0000-0000-0000-000000000002'::text, NULL, 'Resep baru: Sayur Sop Ayam'),
  (gen_random_uuid(), now() - interval '12 days', 'Chef Wulan (head_chef)', 'a0000001-0000-0000-0000-000000000004'::text, 'head_chef', 'CREATE_RECIPE', 'recipes', 'c0000001-0000-0000-0000-000000000006'::text, NULL, 'Resep baru: Cap Cay'),
  (gen_random_uuid(), now() - interval '10 days', 'Ahli Gizi Maya (nutritionist)', 'a0000001-0000-0000-0000-000000000007'::text, 'nutritionist', 'UPDATE_RECIPE', 'recipes', 'c0000001-0000-0000-0000-000000000001'::text, '{"calories_kcal":{"old":320,"new":350},"protein_g":{"old":10,"new":12}}'::jsonb, 'Update profil gizi Nasi Goreng'),
  (gen_random_uuid(), now() - interval '8 days', 'Ahli Gizi Maya (nutritionist)', 'a0000001-0000-0000-0000-000000000007'::text, 'nutritionist', 'MENU_APPROVED', 'menus', 'd0000001-0000-0000-0000-000000000001'::text, '{"status":{"old":"PENDING_REVIEW","new":"APPROVED"}}'::jsonb, 'Menu Senin disetujui'),
  (gen_random_uuid(), now() - interval '7 days', 'Chef Wulan (head_chef)', 'a0000001-0000-0000-0000-000000000004'::text, 'head_chef', 'CREATE_MENU', 'menus', 'd0000001-0000-0000-0000-000000000005'::text, NULL, 'Menu Jumat dibuat'),
  (gen_random_uuid(), now() - interval '6 days', 'Administrator (admin)', 'a0000001-0000-0000-0000-000000000001'::text, 'admin', 'UPDATE_ITEM', 'items', 'b0000001-0000-0000-0000-000000000001'::text, '{"par_level":{"old":40,"new":50}}'::jsonb, 'Update par-level beras'),
  (gen_random_uuid(), now() - interval '5 days', 'Staf Gudang (field_staff)', 'a0000001-0000-0000-0000-000000000006'::text, 'field_staff', 'OPNAME', 'opnames', NULL, NULL, 'Opname rutin gudang kering'),
  (gen_random_uuid(), now() - interval '3 days', 'Staf Gudang (field_staff)', 'a0000001-0000-0000-0000-000000000006'::text, 'field_staff', 'OPNAME', 'opnames', NULL, NULL, 'Spoilage tempe 5 papan'),
  (gen_random_uuid(), now() - interval '2 days', 'Sri Akuntansi (accountant)', 'a0000001-0000-0000-0000-000000000002'::text, 'accountant', 'VERIFY_PURCHASE', 'purchases', NULL, '{"verified":{"old":false,"new":true}}'::jsonb, 'Verifikasi sayur mingguan'),
  (gen_random_uuid(), now() - interval '1 day', 'Asisten Belanja (field_assistant)', 'a0000001-0000-0000-0000-000000000005'::text, 'field_assistant', 'CREATE_PURCHASE', 'purchases', NULL, NULL, 'Transport belanja harian'),
  (gen_random_uuid(), now(), 'Staf Gudang (field_staff)', 'a0000001-0000-0000-0000-000000000006'::text, 'field_staff', 'OPNAME', 'opnames', NULL, NULL, 'Opname cabe merah - ok 7kg');

-- ============= ANGGARAN BENEFICIARIES =============
INSERT INTO public.anggaran_beneficiaries (id, plan_date, total_portions, price_per_portion, rab, actual, notes, created_by) VALUES
  (gen_random_uuid(), CURRENT_DATE - 6, 425, 15000, 6375000, 6200000, 'Senin', 'a0000001-0000-0000-0000-000000000006'),
  (gen_random_uuid(), CURRENT_DATE - 5, 425, 15000, 6375000, 6300000, 'Selasa', 'a0000001-0000-0000-0000-000000000006'),
  (gen_random_uuid(), CURRENT_DATE - 4, 425, 15000, 6375000, 6350000, 'Rabu', 'a0000001-0000-0000-0000-000000000006'),
  (gen_random_uuid(), CURRENT_DATE - 3, 425, 15000, 6375000, 6280000, 'Kamis', 'a0000001-0000-0000-0000-000000000006'),
  (gen_random_uuid(), CURRENT_DATE - 2, 425, 15000, 6375000, 6320000, 'Jumat', 'a0000001-0000-0000-0000-000000000006');

-- ============= DESTINATIONS =============
INSERT INTO public.destinations (id, name, address, contact_person, phone, notes, is_active) VALUES
  ('e0000001-0000-0000-0000-000000000001'::uuid, 'PAUD Ceria Kadudampit', 'Jl. Raya Kadudampit No. 12', 'Ibu Rina', '081234567890', 'PAUD, 45 anak', true),
  ('e0000001-0000-0000-0000-000000000002'::uuid, 'SDN 1 Kadudampit', 'Jl. Pendidikan No. 5', 'Pak Hendra', '081234567891', 'SD, 120 siswa', true),
  ('e0000001-0000-0000-0000-000000000003'::uuid, 'SDN 2 Sukabirus', 'Jl. Sukabirus No. 8', 'Bu Siti', '081234567892', 'SD, 85 siswa', true),
  ('e0000001-0000-0000-0000-000000000004'::uuid, 'SMPN 1 Kadudampit', 'Jl. Ahmad Yani No. 3', 'Pak Deden', '081234567893', 'SMP, 200 siswa', true),
  ('e0000001-0000-0000-0000-000000000005'::uuid, 'TK Islam Al-Ikhlas', 'Jl. Masjid No. 7', 'Umi Zahra', '081234567894', 'TK, 30 anak', true),
  ('e0000001-0000-0000-0000-000000000006'::uuid, 'Posyandu Mekar Sari', 'Jl. Mekar No. 15', 'Bu Yanti', '081234567895', 'Ibu hamil & balita, 25 orang', true),
  ('e0000001-0000-0000-0000-000000000007'::uuid, 'SLB Negeri Sukabumi', 'Jl. Pendidikan Khusus No. 1', 'Pak Arief', '081234567896', 'SLB, 40 siswa', true),
  ('e0000001-0000-0000-0000-000000000008'::uuid, 'Pondok Pesantren Darul Falah', 'Jl. Pesantren No. 22', 'Ustadz Malik', '081234567897', 'Santri, 150 orang', true),
  ('e0000001-0000-0000-0000-000000000009'::uuid, 'Griya Lansia Harapan', 'Jl. Sejahtera No. 10', 'Pak Agus', '081234567898', 'Lansia & Pendamping, 35 orang', true),
  ('e0000001-0000-0000-0000-000000000010'::uuid, 'SDN 3 Cibodas', 'Jl. Cibodas No. 18', 'Bu Melati', '081234567899', 'SD, 95 siswa', true),
  ('e0000001-0000-0000-0000-000000000011'::uuid, 'SMA Negeri 1 Kadudampit', 'Jl. Pendidikan No. 1', 'Pak Budi', '081234567800', 'SMA, 180 siswa', true),
  ('e0000001-0000-0000-0000-000000000012'::uuid, 'Gugus Tim PKK Kadudampit', 'Jl. PKK No. 3', 'Ibu Wati', '081234567801', 'Bumil & Busui, 40 orang', true);

-- ============= DELIVERY PLANS =============
INSERT INTO public.delivery_plans (id, plan_date, created_by, notes, created_at) VALUES
  ('f0000001-0000-0000-0000-000000000001'::uuid, CURRENT_DATE, 'a0000001-0000-0000-0000-000000000006'::uuid, 'Distribusi hari ini - semua tujuan', now()),
  ('f0000001-0000-0000-0000-000000000002'::uuid, CURRENT_DATE - 1, 'a0000001-0000-0000-0000-000000000006'::uuid, 'Distribusi kemarin', now() - interval '1 day'),
  ('f0000001-0000-0000-0000-000000000003'::uuid, CURRENT_DATE - 2, 'a0000001-0000-0000-0000-000000000006'::uuid, 'Distribusi 2 hari lalu', now() - interval '2 days');

-- ============= DELIVERY PLAN ITEMS =============
INSERT INTO public.delivery_plan_items (id, plan_id, destination_id, category, portions, notes) VALUES
  -- Plan hari ini
  (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000001'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'BALITA', 30, 'PAUD - porsi balita'),
  (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000001'::uuid, 'e0000001-0000-0000-0000-000000000002'::uuid, 'PORTION_SMALL', 80, 'SD - porsi kecil'),
  (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000001'::uuid, 'e0000001-0000-0000-0000-000000000003'::uuid, 'PORTION_SMALL', 55, 'SD - porsi kecil'),
  (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000001'::uuid, 'e0000001-0000-0000-0000-000000000004'::uuid, 'PORTION_LARGE', 130, 'SMP - porsi besar'),
  (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000001'::uuid, 'e0000001-0000-0000-0000-000000000005'::uuid, 'BALITA', 20, 'TK - porsi balita'),
  (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000001'::uuid, 'e0000001-0000-0000-0000-000000000006'::uuid, 'BUMIL_BUSUI', 25, 'Posyandu - ibu hamil & balita'),
  (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000001'::uuid, 'e0000001-0000-0000-0000-000000000007'::uuid, 'PORTION_LARGE', 40, 'SLB - porsi besar'),
  (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000001'::uuid, 'e0000001-0000-0000-0000-000000000008'::uuid, 'PORTION_LARGE', 100, 'Pesantren - porsi besar'),
  (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000001'::uuid, 'e0000001-0000-0000-0000-000000000009'::uuid, 'PORTION_SMALL', 25, 'Griya Lansia - porsi kecil'),
  (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000001'::uuid, 'e0000001-0000-0000-0000-000000000010'::uuid, 'PORTION_SMALL', 60, 'SD - porsi kecil'),
  (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000001'::uuid, 'e0000001-0000-0000-0000-000000000011'::uuid, 'PORTION_LARGE', 120, 'SMA - porsi besar'),
  (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000001'::uuid, 'e0000001-0000-0000-0000-000000000012'::uuid, 'BUMIL_BUSUI', 35, 'PKK - bumil & busui'),
  -- Plan kemarin
  (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000002'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'BALITA', 30, 'PAUD - porsi balita'),
  (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000002'::uuid, 'e0000001-0000-0000-0000-000000000002'::uuid, 'PORTION_SMALL', 80, 'SD - porsi kecil'),
  (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000002'::uuid, 'e0000001-0000-0000-0000-000000000004'::uuid, 'PORTION_LARGE', 130, 'SMP - porsi besar'),
  (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000002'::uuid, 'e0000001-0000-0000-0000-000000000008'::uuid, 'PORTION_LARGE', 100, 'Pesantren - porsi besar'),
  (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000002'::uuid, 'e0000001-0000-0000-0000-000000000012'::uuid, 'BUMIL_BUSUI', 35, 'PKK - bumil & busui'),
  -- Plan 2 hari lalu
  (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000003'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'BALITA', 30, 'PAUD - porsi balita'),
  (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000003'::uuid, 'e0000001-0000-0000-0000-000000000002'::uuid, 'PORTION_SMALL', 80, 'SD - porsi kecil'),
  (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000003'::uuid, 'e0000001-0000-0000-0000-000000000004'::uuid, 'PORTION_LARGE', 130, 'SMP - porsi besar'),
  (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000003'::uuid, 'e0000001-0000-0000-0000-000000000011'::uuid, 'PORTION_LARGE', 120, 'SMA - porsi besar'),
  (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000003'::uuid, 'e0000001-0000-0000-0000-000000000012'::uuid, 'BUMIL_BUSUI', 35, 'PKK - bumil & busui');

-- ============= DELIVERY ASSIGNMENTS =============
INSERT INTO public.delivery_assignments (id, plan_id, driver_id, status, started_at, completed_at, created_at) VALUES
  -- Hari ini - driver 1 selesai, driver 2 masih transit
  ('aa000001-0000-0000-0000-000000000001'::uuid, 'f0000001-0000-0000-0000-000000000001'::uuid, 'a0000001-0000-0000-0000-000000000008'::uuid, 'COMPLETED', now() - interval '3 hours', now() - interval '1 hour', now() - interval '4 hours'),
  ('aa000001-0000-0000-0000-000000000002'::uuid, 'f0000001-0000-0000-0000-000000000001'::uuid, 'a0000001-0000-0000-0000-000000000009'::uuid, 'IN_TRANSIT', now() - interval '2 hours', NULL, now() - interval '4 hours'),
  -- Kemarin - semua selesai
  ('aa000001-0000-0000-0000-000000000003'::uuid, 'f0000001-0000-0000-0000-000000000002'::uuid, 'a0000001-0000-0000-0000-000000000008'::uuid, 'COMPLETED', now() - interval '1 day 3 hours', now() - interval '1 day 1 hour', now() - interval '1 day 4 hours'),
  ('aa000001-0000-0000-0000-000000000004'::uuid, 'f0000001-0000-0000-0000-000000000002'::uuid, 'a0000001-0000-0000-0000-000000000009'::uuid, 'COMPLETED', now() - interval '1 day 3 hours', now() - interval '1 day 2 hours', now() - interval '1 day 4 hours'),
  -- 2 hari lalu - semua selesai
  ('aa000001-0000-0000-0000-000000000005'::uuid, 'f0000001-0000-0000-0000-000000000003'::uuid, 'a0000001-0000-0000-0000-000000000008'::uuid, 'COMPLETED', now() - interval '2 days 3 hours', now() - interval '2 days 1 hour', now() - interval '2 days 4 hours'),
  ('aa000001-0000-0000-0000-000000000006'::uuid, 'f0000001-0000-0000-0000-000000000003'::uuid, 'a0000001-0000-0000-0000-000000000009'::uuid, 'COMPLETED', now() - interval '2 days 3 hours', now() - interval '2 days 1 hour', now() - interval '2 days 4 hours');

-- ============= DELIVERY LOGS =============
INSERT INTO public.delivery_logs (id, assignment_id, destination_id, status, notes, created_at) VALUES
  -- Driver 1 hari ini - selesai semua
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000001'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'DELIVERED', 'PAUD - 30 porsi diterima', now() - interval '3 hours'),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000001'::uuid, 'e0000001-0000-0000-0000-000000000002'::uuid, 'DELIVERED', 'SD 1 - 80 porsi diterima', now() - interval '2 hours 45 min'),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000001'::uuid, 'e0000001-0000-0000-0000-000000000003'::uuid, 'DELIVERED', 'SD 2 - 55 porsi diterima', now() - interval '2 hours 30 min'),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000001'::uuid, 'e0000001-0000-0000-0000-000000000005'::uuid, 'DELIVERED', 'TK - 20 porsi diterima', now() - interval '2 hours 15 min'),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000001'::uuid, 'e0000001-0000-0000-0000-000000000009'::uuid, 'DELIVERED', 'Griya Lansia - 25 porsi diterima', now() - interval '2 hours'),
  -- Driver 2 hari ini - masih transit
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000002'::uuid, 'e0000001-0000-0000-0000-000000000004'::uuid, 'DELIVERED', 'SMP - 130 porsi diterima', now() - interval '2 hours'),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000002'::uuid, 'e0000001-0000-0000-0000-000000000006'::uuid, 'IN_TRANSIT', 'Posyandu - dalam perjalanan', now() - interval '1 hour'),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000002'::uuid, 'e0000001-0000-0000-0000-000000000007'::uuid, 'NOT_DELIVERED', 'SLB - menunggu giliran', now() - interval '1 hour'),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000002'::uuid, 'e0000001-0000-0000-0000-000000000008'::uuid, 'NOT_DELIVERED', 'Pesantren - menunggu giliran', now() - interval '1 hour'),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000002'::uuid, 'e0000001-0000-0000-0000-000000000010'::uuid, 'NOT_DELIVERED', 'SD 3 - menunggu giliran', now() - interval '1 hour'),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000002'::uuid, 'e0000001-0000-0000-0000-000000000011'::uuid, 'NOT_DELIVERED', 'SMA - menunggu giliran', now() - interval '1 hour'),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000002'::uuid, 'e0000001-0000-0000-0000-000000000012'::uuid, 'NOT_DELIVERED', 'PKK - menunggu giliran', now() - interval '1 hour'),
  -- Kemarin - semua delivered
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000003'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'DELIVERED', 'PAUD - 30 porsi diterima', now() - interval '1 day 3 hours'),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000003'::uuid, 'e0000001-0000-0000-0000-000000000002'::uuid, 'DELIVERED', 'SD 1 - 80 porsi diterima', now() - interval '1 day 2 hours 45 min'),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000003'::uuid, 'e0000001-0000-0000-0000-000000000004'::uuid, 'DELIVERED', 'SMP - 130 porsi diterima', now() - interval '1 day 2 hours 30 min'),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000004'::uuid, 'e0000001-0000-0000-0000-000000000008'::uuid, 'DELIVERED', 'Pesantren - 100 porsi diterima', now() - interval '1 day 3 hours'),
  (gen_random_uuid(), 'aa000001-0000-0000-0000-000000000004'::uuid, 'e0000001-0000-0000-0000-000000000012'::uuid, 'DELIVERED', 'PKK - 35 porsi diterima', now() - interval '1 day 2 hours');

-- ============= ANGGARAN PERIODS =============
DO $$
DECLARE
  pid UUID;
BEGIN
  SELECT id INTO pid FROM biweekly_periods ORDER BY start_date DESC LIMIT 1;
  IF pid IS NULL THEN RETURN; END IF;

  INSERT INTO anggaran_periods (period_id, plan_date, bahan_balita, bahan_paud_tk_ra, bahan_sd_1_3, bahan_sd_4_6, bahan_smp_mts, bahan_sma_ma_smk, bahan_slb, bahan_santri, bahan_pend_tk, bahan_bumil, bahan_busui, harga_satuan1, harga_satuan2, bahan_rab, bahan_actual, ops_jumlah_paket, ops_harga_satuan, ops_rab, ops_actual, ins_jumlah_paket, ins_harga_satuan, ins_rab, ins_actual, notes, created_by) VALUES
    (pid, CURRENT_DATE - 13, 45, 30, 120, 85, 0, 0, 0, 0, 0, 15, 10, 8000, 10000, 2440000, 2350000, 285, 2000, 570000, 560000, 285, 2000, 570000, 555000, 'Hari pertama', 'a0000001-0000-0000-0000-000000000006'::uuid),
    (pid, CURRENT_DATE - 12, 45, 30, 120, 95, 0, 0, 0, 0, 0, 15, 10, 8000, 10000, 2520000, 2480000, 295, 2000, 590000, 585000, 295, 2000, 590000, 590000, 'Hari kedua', 'a0000001-0000-0000-0000-000000000006'::uuid),
    (pid, CURRENT_DATE - 11, 45, 30, 120, 85, 0, 0, 40, 0, 0, 15, 10, 8000, 10000, 2600000, 2580000, 305, 2000, 610000, 600000, 305, 2000, 610000, 605000, 'Tambah SLB', 'a0000001-0000-0000-0000-000000000006'::uuid),
    (pid, CURRENT_DATE - 10, 45, 30, 120, 85, 0, 0, 0, 0, 0, 15, 10, 8000, 10000, 2440000, 2400000, 285, 2000, 570000, 565000, 285, 2000, 570000, 560000, 'Normal', 'a0000001-0000-0000-0000-000000000006'::uuid),
    (pid, CURRENT_DATE - 9, 45, 30, 120, 95, 0, 150, 0, 0, 35, 15, 10, 8000, 10000, 3160000, 3100000, 495, 2000, 990000, 980000, 495, 2000, 990000, 985000, 'Tambah SMA + Pesantren', 'a0000001-0000-0000-0000-000000000006'::uuid),
    (pid, CURRENT_DATE - 8, 45, 30, 120, 85, 0, 0, 0, 0, 0, 15, 10, 8000, 10000, 2440000, 2420000, 285, 2000, 570000, 565000, 285, 2000, 570000, 570000, 'Sabtu ringan', 'a0000001-0000-0000-0000-000000000006'::uuid),
    (pid, CURRENT_DATE - 6, 45, 30, 120, 95, 0, 150, 40, 150, 35, 15, 10, 8000, 10000, 3560000, 3500000, 685, 2000, 1370000, 1350000, 685, 2000, 1370000, 1360000, 'Full house - semua tujuan', 'a0000001-0000-0000-0000-000000000006'::uuid),
    (pid, CURRENT_DATE - 5, 45, 30, 120, 85, 0, 0, 40, 0, 35, 15, 10, 8000, 10000, 2600000, 2550000, 305, 2000, 610000, 600000, 305, 2000, 610000, 595000, 'Normal + SLB', 'a0000001-0000-0000-0000-000000000006'::uuid),
    (pid, CURRENT_DATE - 4, 45, 30, 120, 95, 0, 150, 0, 0, 35, 15, 10, 8000, 10000, 3160000, 3120000, 495, 2000, 990000, 985000, 495, 2000, 990000, 990000, 'Rabu normal', 'a0000001-0000-0000-0000-000000000006'::uuid),
    (pid, CURRENT_DATE - 3, 45, 30, 120, 85, 0, 0, 0, 0, 0, 15, 10, 8000, 10000, 2440000, 2400000, 285, 2000, 570000, 560000, 285, 2000, 570000, 560000, 'Kamis', 'a0000001-0000-0000-0000-000000000006'::uuid),
    (pid, CURRENT_DATE - 2, 45, 30, 120, 95, 0, 150, 40, 150, 35, 15, 10, 8000, 10000, 3560000, 3480000, 685, 2000, 1370000, 1350000, 685, 2000, 1370000, 1360000, 'Jumat penuh', 'a0000001-0000-0000-0000-000000000006'::uuid),
    (pid, CURRENT_DATE - 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8000, 10000, 0, 0, 0, 2000, 0, 0, 0, 2000, 0, 0, 'Sabtu - libur', 'a0000001-0000-0000-0000-000000000006'::uuid);
END $$;

-- ============= VOLUNTEER INCENTIVES =============
DO $$
DECLARE
  pid UUID;
BEGIN
  SELECT id INTO pid FROM biweekly_periods ORDER BY start_date DESC LIMIT 1;
  IF pid IS NULL THEN RETURN; END IF;

  INSERT INTO volunteer_incentives (period_id, user_id, jabatan, jumlah_hari, insentif_per_hari, total_insentif, is_paid, notes) VALUES
    (pid, 'a0000001-0000-0000-0000-000000000012'::uuid, 'Pemorsian', 11, 20000, 220000, true, 'Lengkap 11 hari kerja'),
    (pid, 'a0000001-0000-0000-0000-000000000013'::uuid, 'Kebersihan', 11, 20000, 220000, true, 'Lengkap 11 hari kerja'),
    (pid, 'a0000001-0000-0000-0000-000000000014'::uuid, 'Pencuci', 11, 20000, 220000, true, 'Lengkap 11 hari kerja'),
    (pid, 'a0000001-0000-0000-0000-000000000010'::uuid, 'Persiapan', 11, 20000, 220000, false, 'Belum dibayar'),
    (pid, 'a0000001-0000-0000-0000-000000000011'::uuid, 'Tenaga Masak', 11, 20000, 220000, false, 'Belum dibayar'),
    (pid, 'a0000001-0000-0000-0000-000000000008'::uuid, 'Driver', 11, 25000, 275000, true, 'Termasuk transport'),
    (pid, 'a0000001-0000-0000-0000-000000000009'::uuid, 'Driver', 11, 25000, 275000, true, 'Termasuk transport');
END $$;

-- ============= ITEM OPENING BALANCES =============
DO $$
DECLARE
  pid UUID;
BEGIN
  SELECT id INTO pid FROM biweekly_periods ORDER BY start_date DESC LIMIT 1;
  IF pid IS NULL THEN RETURN; END IF;

  INSERT INTO item_opening_balances (item_code, period_id, opening_quantity, opening_value) VALUES
    ('KH-01-001', pid, 50, 750000),
    ('KH-01-002', pid, 20, 440000),
    ('KH-02-001', pid, 15, 150000),
    ('PH-01-001', pid, 10, 380000),
    ('PH-02-001', pid, 8, 280000),
    ('PH-03-001', pid, 15, 420000),
    ('PN-01-001', pid, 25, 175000),
    ('PN-01-002', pid, 20, 100000),
    ('SY-01-001', pid, 30, 120000),
    ('SY-01-002', pid, 25, 75000),
    ('SY-02-001', pid, 15, 180000),
    ('BB-01-001', pid, 10, 250000),
    ('BB-01-002', pid, 8, 160000),
    ('BB-01-003', pid, 5, 175000),
    ('BB-02-001', pid, 12, 216000);
END $$;

-- ============= TRANSAKSIS =============
DO $$
DECLARE
  pid UUID;
  mon_date DATE := date_trunc('week', CURRENT_DATE)::date;
BEGIN
  SELECT id INTO pid FROM biweekly_periods ORDER BY start_date DESC LIMIT 1;
  IF pid IS NULL THEN RETURN; END IF;

  INSERT INTO transaksis (period_id, transaction_date, account_code, description, debit, credit, buku_pembantu, notes) VALUES
    (pid, mon_date, '1300', 'Dana bantuan pemerintah periode ini', 0, 50000000, 'BANK', 'Setoran awal'),
    (pid, mon_date, '2100', 'Pembelian bahan baku minggu ke-1', 6800000, 0, 'BAHAN_BAKU', NULL),
    (pid, mon_date, '2200', 'Biaya operasional gas & listrik', 800000, 0, 'OPERASIONAL', NULL),
    (pid, mon_date, '2300', 'Insentif relawan minggu ke-1', 1650000, 0, 'FASILITAS', NULL),
    (pid, mon_date + 1, '2100', 'Pembelian bahan baku minggu ke-1', 4500000, 0, 'BAHAN_BAKU', NULL),
    (pid, mon_date + 2, '3100', 'PPN pembelian bahan', 1100000, 0, 'PAJAK', NULL),
    (pid, mon_date + 3, '2100', 'Pembelian bahan baku minggu ke-2', 5200000, 0, 'BAHAN_BAKU', NULL),
    (pid, mon_date + 3, '2200', 'Biaya kebersihan & sabun', 180000, 0, 'OPERASIONAL', NULL),
    (pid, mon_date + 3, '2300', 'Insentif relawan minggu ke-2', 1650000, 0, 'FASILITAS', NULL),
    (pid, mon_date + 4, '2100', 'Pembelian bahan baku minggu ke-2', 3900000, 0, 'BAHAN_BAKU', NULL);
END $$;

-- ============= DAILY TASKS (10 hari terakhir) =============
DO $$
DECLARE
  d DATE;
  pemorsian_id UUID := 'a0000001-0000-0000-0000-000000000012'::uuid;
  kebersihan_id UUID := 'a0000001-0000-0000-0000-000000000013'::uuid;
  pencuci_id UUID := 'a0000001-0000-0000-0000-000000000014'::uuid;
  persiapan_id UUID := 'a0000001-0000-0000-0000-000000000010'::uuid;
  masak_id UUID := 'a0000001-0000-0000-0000-000000000011'::uuid;
  driver1_id UUID := 'a0000001-0000-0000-0000-000000000008'::uuid;
  driver2_id UUID := 'a0000001-0000-0000-0000-000000000009'::uuid;
  chef_id UUID := 'a0000001-0000-0000-0000-000000000005'::uuid;
BEGIN
  FOR i IN 0..9 LOOP
    d := CURRENT_DATE - (9 - i);
    IF EXTRACT(DOW FROM d) IN (0, 6) THEN CONTINUE; END IF;

    INSERT INTO daily_tasks (task_date, user_id, role, task_type, category, portions, description, status) VALUES
      -- Pemorsian
      (d, pemorsian_id, 'pemorsian', 'pemorsian', 'BALITA', 30, 'Ompreng balita siap distribusi', 'SELESAI'),
      (d, pemorsian_id, 'pemorsian', 'pemorsian', 'PORTION_SMALL', 200, 'Ompreng porsi kecil SD/TK', 'SELESAI'),
      (d, pemorsian_id, 'pemorsian', 'pemorsian', 'PORTION_LARGE', 200, 'Ompreng porsi besar SMP/SMA', 'SELESAI'),
      (d, pemorsian_id, 'pemorsian', 'pemorsian', 'BUMIL_BUSUI', 25, 'Ompreng bumil & busui', 'SELESAI'),
      -- Kebersihan
      (d, kebersihan_id, 'kebersihan', 'kebersihan', NULL, 0, 'Area Memasak: Kompor dan meja bersih', 'SELESAI'),
      (d, kebersihan_id, 'kebersihan', 'kebersihan', NULL, 0, 'Area Cuci: Wastafel bersih', 'SELESAI'),
      (d, kebersihan_id, 'kebersihan', 'kebersihan', NULL, 0, 'Area Penyimpanan: Rak rapi dan bersih', 'SELESAI'),
      (d, kebersihan_id, 'kebersihan', 'kebersihan', NULL, 0, 'Lantai & Drainase: Bersih dan lancar', 'SELESAI'),
      -- Pencuci
      (d, pencuci_id, 'pencuci', 'pencuci', NULL, 0, 'Ompreng Bersih: 200 ompreng dicuci bersih', 'SELESAI'),
      (d, pencuci_id, 'pencuci', 'pencuci', NULL, 0, 'Penanggulangan Limbah: Limbah dibuang ke tempat sampah', 'SELESAI'),
      (d, pencuci_id, 'pencuci', 'pencuci', NULL, 0, 'Kebersihan Area: Area cuci dibersihkan', 'SELESAI'),
      -- Persiapan
      (d, persiapan_id, 'persiapan', 'persiapan', NULL, 0, 'Persiapan bahan: Sayuran dicuci dan dipotong', 'SELESAI'),
      (d, persiapan_id, 'persiapan', 'persiapan', NULL, 0, 'Persiapan bahan: Daging diungkep', 'SELESAI'),
      (d, persiapan_id, 'persiapan', 'persiapan', NULL, 0, 'Persiapan bahan: Bumbu dihaluskan', 'SELESAI'),
      -- Masak
      (d, masak_id, 'tenaga_masak', 'masak', NULL, 0, 'Masak nasi dan lauk pauk untuk 455 porsi', 'SELESAI'),
      (d, masak_id, 'tenaga_masak', 'masak', NULL, 0, 'Masak sayur dan gorengan', 'SELESAI'),
      -- Chef (supervisi)
      (d, chef_id, 'head_chef', 'masak', NULL, 0, 'Supervisi proses memasak dan quality control', 'SELESAI'),
      -- Driver (distribusi)
      (d, driver1_id, 'driver', 'masak', NULL, 0, 'Distribusi ke PAUD, SD 1, SD 2, TK, Griya Lansia', 'SELESAI'),
      (d, driver2_id, 'driver', 'masak', NULL, 0, 'Distribusi ke SMP, Pesantren, SLB, SMA, PKK', 'SELESAI');
  END LOOP;
END $$;

-- ============= DONE =============
