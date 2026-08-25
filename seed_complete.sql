-- ============================================================
-- SPPG MBG - SEED LENGKAP (4 MINGGU / 20 HARI KERJA)
-- Jalankan di Supabase SQL Editor
-- Password semua akun demo: admin123
-- ============================================================

-- ============= 0. DISABLE RLS =============
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
  END LOOP;
END $$;

-- ============= 1. DROP SEMUA TABEL =============
DROP TABLE IF EXISTS public.anggaran_periods CASCADE;
DROP TABLE IF EXISTS public.item_opening_balances CASCADE;
DROP TABLE IF EXISTS public.transaksis CASCADE;
DROP TABLE IF EXISTS public.biweekly_periods CASCADE;
DROP TABLE IF EXISTS public.item_hierarchies CASCADE;
DROP TABLE IF EXISTS public.global_config CASCADE;
DROP TABLE IF EXISTS public.daily_tasks CASCADE;
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
DROP TABLE IF EXISTS public.anggaran CASCADE;
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

-- ============= 3. SETTINGS =============
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 4. ITEMS =============
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  category TEXT NOT NULL DEFAULT 'Sayur',
  par_level NUMERIC DEFAULT 0,
  price_per_unit NUMERIC DEFAULT 0,
  zone TEXT DEFAULT 'DRY',
  allergens JSONB DEFAULT '[]'::jsonb,
  nutrition_per_100g JSONB DEFAULT '{"calories":0,"protein":0,"carbs":0,"fats":0,"fiber":0,"sodium":0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 5. ITEM HIERARCHIES =============
CREATE TABLE public.item_hierarchies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  parent_code TEXT,
  category TEXT DEFAULT 'BB',
  unit TEXT DEFAULT 'kg',
  zone TEXT DEFAULT 'DRY',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 6. STOCK LOTS =============
CREATE TABLE public.stock_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 0,
  actual_quantity NUMERIC NOT NULL DEFAULT 0,
  expiry_date DATE,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  note TEXT,
  zone TEXT DEFAULT 'DRY',
  taken_by UUID REFERENCES users(id),
  taken_at TIMESTAMPTZ,
  taken_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 7. OPNAMES =============
CREATE TABLE public.opnames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id),
  lot_id UUID REFERENCES stock_lots(id),
  counted_quantity NUMERIC NOT NULL,
  system_quantity NUMERIC,
  note TEXT,
  zone TEXT DEFAULT 'DRY',
  temperature_c NUMERIC,
  humidity_pct NUMERIC,
  reason TEXT DEFAULT 'Routine',
  counted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 8. RECIPES =============
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  servings INTEGER DEFAULT 100,
  menu_category TEXT,
  ingredients JSONB DEFAULT '[]'::jsonb,
  instructions TEXT,
  calories_kcal NUMERIC DEFAULT 0,
  protein_g NUMERIC DEFAULT 0,
  carbs_g NUMERIC DEFAULT 0,
  fats_g NUMERIC DEFAULT 0,
  fiber_g NUMERIC DEFAULT 0,
  sodium_mg NUMERIC DEFAULT 0,
  nutrition_auto BOOLEAN DEFAULT TRUE,
  allergens JSONB DEFAULT '[]'::jsonb,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 9. MENUS =============
CREATE TABLE public.menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  day TEXT NOT NULL,
  recipe_ids JSONB DEFAULT '[]'::jsonb,
  portions INTEGER DEFAULT 0,
  total_days INTEGER DEFAULT 5,
  active_days INTEGER DEFAULT 5,
  status TEXT DEFAULT 'DRAFT',
  approved_by UUID REFERENCES users(id),
  approved_by_name TEXT,
  approved_at TIMESTAMPTZ,
  signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 10. ANGGARAN =============
CREATE TABLE public.anggaran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_date DATE NOT NULL,
  total_portions INTEGER DEFAULT 0,
  price_per_portion NUMERIC DEFAULT 0,
  rab NUMERIC DEFAULT 0,
  actual NUMERIC DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 11. ANGGARAN PERIODS =============
CREATE TABLE public.anggaran_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id TEXT,
  plan_date DATE,
  bahan_balita NUMERIC DEFAULT 0,
  bahan_paud_tk_ra NUMERIC DEFAULT 0,
  bahan_sd_1_3 NUMERIC DEFAULT 0,
  bahan_sd_4_6 NUMERIC DEFAULT 0,
  bahan_smp_mts NUMERIC DEFAULT 0,
  bahan_sma_ma_smk NUMERIC DEFAULT 0,
  bahan_slb NUMERIC DEFAULT 0,
  bahan_santri NUMERIC DEFAULT 0,
  bahan_pend_tk NUMERIC DEFAULT 0,
  bahan_bumil NUMERIC DEFAULT 0,
  bahan_busui NUMERIC DEFAULT 0,
  harga_satuan1 NUMERIC DEFAULT 0,
  harga_satuan2 NUMERIC DEFAULT 0,
  bahan_rab NUMERIC DEFAULT 0,
  bahan_actual NUMERIC DEFAULT 0,
  ops_jumlah_paket INTEGER DEFAULT 0,
  ops_harga_satuan NUMERIC DEFAULT 0,
  ops_rab NUMERIC DEFAULT 0,
  ops_actual NUMERIC DEFAULT 0,
  ins_jumlah_paket INTEGER DEFAULT 0,
  ins_harga_satuan NUMERIC DEFAULT 0,
  ins_rab NUMERIC DEFAULT 0,
  ins_actual NUMERIC DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 12. PURCHASES =============
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT DEFAULT 'Bahan Baku',
  description TEXT,
  amount_idr NUMERIC DEFAULT 0,
  receipt_total_idr NUMERIC DEFAULT 0,
  receipt_photo TEXT,
  transport_amount_idr NUMERIC DEFAULT 0,
  supplier TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  created_by_name TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  verification_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 13. TRANSAKSIS =============
CREATE TABLE public.transaksis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id TEXT,
  transaction_date DATE NOT NULL,
  account_code TEXT NOT NULL,
  description TEXT,
  debit NUMERIC DEFAULT 0,
  credit NUMERIC DEFAULT 0,
  source_table TEXT,
  source_id UUID,
  buku_pembantu TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 14. DESTINATIONS =============
CREATE TABLE public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  contact_person TEXT,
  phone TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 15. DELIVERY PLANS =============
CREATE TABLE public.delivery_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_date DATE NOT NULL,
  created_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 16. DELIVERY PLAN ITEMS =============
CREATE TABLE public.delivery_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES delivery_plans(id) ON DELETE CASCADE,
  destination_id UUID REFERENCES destinations(id),
  category TEXT DEFAULT 'PORTION_LARGE',
  portions INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 17. DELIVERY ASSIGNMENTS =============
CREATE TABLE public.delivery_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES delivery_plans(id),
  driver_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'PENDING',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 18. DELIVERY LOGS =============
CREATE TABLE public.delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES delivery_assignments(id),
  destination_id UUID REFERENCES destinations(id),
  status TEXT DEFAULT 'DELIVERED',
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 19. DAILY TASKS =============
CREATE TABLE public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_date DATE NOT NULL,
  user_id UUID REFERENCES users(id),
  role TEXT,
  task_type TEXT NOT NULL,
  category TEXT,
  portions INTEGER DEFAULT 0,
  photo_url TEXT,
  description TEXT,
  status TEXT DEFAULT 'SELESAI',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 20. GLOBAL CONFIG =============
CREATE TABLE public.global_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 21. BIWEEKLY PERIODS =============
CREATE TABLE public.biweekly_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= 22. ITEM OPENING BALANCES =============
CREATE TABLE public.item_opening_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code TEXT NOT NULL,
  period_id TEXT NOT NULL,
  opening_quantity NUMERIC DEFAULT 0,
  opening_value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_code, period_id)
);

-- ============= 23. AUDIT TRAIL =============
CREATE TABLE public.audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id UUID,
  note TEXT,
  before_data JSONB,
  after_data JSONB,
  zone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============= INDEXES =============
DROP INDEX IF EXISTS idx_items_category;
CREATE INDEX idx_items_category ON items(category);
DROP INDEX IF EXISTS idx_items_zone;
CREATE INDEX idx_items_zone ON items(zone);
DROP INDEX IF EXISTS idx_stock_lots_item;
CREATE INDEX idx_stock_lots_item ON stock_lots(item_id);
DROP INDEX IF EXISTS idx_stock_lots_expiry;
CREATE INDEX idx_stock_lots_expiry ON stock_lots(expiry_date);
DROP INDEX IF EXISTS idx_stock_lots_taken;
CREATE INDEX idx_stock_lots_taken ON stock_lots(taken_by);
DROP INDEX IF EXISTS idx_recipes_menu_cat;
CREATE INDEX idx_recipes_menu_cat ON recipes(menu_category);
DROP INDEX IF EXISTS idx_menus_week;
CREATE INDEX idx_menus_week ON menus(week_start);
DROP INDEX IF EXISTS idx_menus_status;
CREATE INDEX idx_menus_status ON menus(status);
DROP INDEX IF EXISTS idx_purchases_verified;
CREATE INDEX idx_purchases_verified ON purchases(verified);
DROP INDEX IF EXISTS idx_transaksis_date;
CREATE INDEX idx_transaksis_date ON transaksis(transaction_date);
DROP INDEX IF EXISTS idx_transaksis_account;
CREATE INDEX idx_transaksis_account ON transaksis(account_code);
DROP INDEX IF EXISTS idx_delivery_plans_date;
CREATE INDEX idx_delivery_plans_date ON delivery_plans(plan_date);
DROP INDEX IF EXISTS idx_delivery_plan_items_plan;
CREATE INDEX idx_delivery_plan_items_plan ON delivery_plan_items(plan_id);
DROP INDEX IF EXISTS idx_delivery_assignments_plan;
CREATE INDEX idx_delivery_assignments_plan ON delivery_assignments(plan_id);
DROP INDEX IF EXISTS idx_delivery_assignments_driver;
CREATE INDEX idx_delivery_assignments_driver ON delivery_assignments(driver_id);
DROP INDEX IF EXISTS idx_daily_tasks_date;
CREATE INDEX idx_daily_tasks_date ON daily_tasks(task_date);
DROP INDEX IF EXISTS idx_daily_tasks_role;
CREATE INDEX idx_daily_tasks_role ON daily_tasks(role);
DROP INDEX IF EXISTS idx_audit_trail_entity;
CREATE INDEX idx_audit_trail_entity ON audit_trail(entity, entity_id);
DROP INDEX IF EXISTS idx_audit_trail_created;
CREATE INDEX idx_audit_trail_created ON audit_trail(created_at);
DROP INDEX IF EXISTS idx_destinations_active;
CREATE INDEX idx_destinations_active ON destinations(is_active);
DROP INDEX IF EXISTS idx_item_hierarchies_code;
CREATE INDEX idx_item_hierarchies_code ON item_hierarchies(code);
DROP INDEX IF EXISTS idx_anggaran_date;
CREATE INDEX idx_anggaran_date ON anggaran(plan_date);

-- ============= DISABLE RLS =============
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
  END LOOP;
END $$;

-- =============================================================
-- SEED DATA
-- =============================================================

-- ============= USERS =============
INSERT INTO public.users (id, email, name, role, password_hash) VALUES
('a0000001-0000-0000-0000-000000000001', 'admin@sppg.id', 'Admin Aplikasi', 'admin_apps', '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2'),
('a0000001-0000-0000-0000-000000000002', 'admin-sppg@sppg.id', 'Admin SPPG', 'admin_sppg', '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2'),
('a0000001-0000-0000-0000-000000000003', 'akuntan@sppg.id', 'Budi Akuntan', 'accountant', '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2'),
('a0000001-0000-0000-0000-000000000004', 'kepala@sppg.id', 'Pak Kepala Dapur', 'kitchen_head', '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2'),
('a0000001-0000-0000-0000-000000000005', 'chef@sppg.id', 'Chef Andi', 'head_chef', '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2'),
('a0000001-0000-0000-0000-000000000006', 'asisten@sppg.id', 'Sari Asisten', 'field_assistant', '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2'),
('a0000001-0000-0000-0000-000000000007', 'ahligizi@sppg.id', 'Dr. Gizi', 'nutritionist', '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2'),
('a0000001-0000-0000-0000-000000000008', 'driver@sppg.id', 'Pak Driver', 'driver', '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2'),
('a0000001-0000-0000-0000-000000000009', 'driver2@sppg.id', 'Pak Driver 2', 'driver', '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2'),
('a0000001-0000-0000-0000-000000000010', 'persiapan@sppg.id', 'Budi Persiapan', 'persiapan', '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2'),
('a0000001-0000-0000-0000-000000000011', 'masak@sppg.id', 'Siti Masak', 'tenaga_masak', '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2'),
('a0000001-0000-0000-0000-000000000012', 'pemorsian@sppg.id', 'Rina Pemorsian', 'pemorsian', '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2'),
('a0000001-0000-0000-0000-000000000013', 'kebersihan@sppg.id', 'Andi Kebersihan', 'kebersihan', '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2'),
('a0000001-0000-0000-0000-000000000014', 'pencuci@sppg.id', 'Dewi Pencuci', 'pencuci', '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2');

-- ============= SETTINGS =============
INSERT INTO public.settings (key, value) VALUES
('sppg_name', 'SPPG MBG Jakarta Selatan'),
('sppg_address', 'Jl. TB Simatupang No. 123, Jakarta Selatan'),
('sppg_phone', '(021) 555-0123'),
('sppg_id', 'SPPG-JKS-001'),
('yayasan_name', 'Yayasan Makan Bergizi Gratis'),
('foundation_name', 'Yayasan Makan Bergizi Gratis');

-- ============= GLOBAL CONFIG =============
INSERT INTO public.global_config (key, value, description, updated_by) VALUES
('sppg_name', 'SPPG MBG Jakarta Selatan', 'Nama SPPG', 'a0000001-0000-0000-0000-000000000001'),
('sppg_address', 'Jl. TB Simatupang No. 123', 'Alamat SPPG', 'a0000001-0000-0000-0000-000000000001'),
('sppg_phone', '(021) 555-0123', 'Telepon SPPG', 'a0000001-0000-0000-0000-000000000001'),
('target_portions_per_day', '250', 'Target porsi per hari', 'a0000001-0000-0000-0000-000000000001'),
('operational_hours', '06:00-14:00', 'Jam operasional', 'a0000001-0000-0000-0000-000000000001');

-- ============= ITEMS (20 bahan) =============
INSERT INTO public.items (id, name, unit, category, par_level, price_per_unit, zone, allergens, nutrition_per_100g) VALUES
('b0000001-0000-0000-0000-000000000001','Bayam','kg','Sayur',10,15000,'CHILL','[]','{"calories":23,"protein":2.9,"carbs":3.6,"fats":0.4,"fiber":2.2,"sodium":24}'),
('b0000001-0000-0000-0000-000000000002','Wortel','kg','Sayur',8,12000,'CHILL','[]','{"calories":41,"protein":0.9,"carbs":9.6,"fats":0.2,"fiber":2.8,"sodium":69}'),
('b0000001-0000-0000-0000-000000000003','Brokoli','kg','Sayur',5,25000,'CHILL','[]','{"calories":34,"protein":2.8,"carbs":7,"fats":0.4,"fiber":2.6,"sodium":33}'),
('b0000001-0000-0000-0000-000000000004','Kol','kg','Sayur',6,8000,'DRY','[]','{"calories":25,"protein":1.3,"carbs":5.8,"fats":0.1,"fiber":2.5,"sodium":18}'),
('b0000001-0000-0000-0000-000000000005','Kangkung','kg','Sayur',8,10000,'CHILL','[]','{"calories":19,"protein":2.6,"carbs":3.1,"fats":0.3,"fiber":2.1,"sodium":45}'),
('b0000001-0000-0000-0000-000000000006','Ayam Fillet','kg','Protein',15,85000,'FROZEN','["Ayam"]','{"calories":165,"protein":31,"carbs":0,"fats":3.6,"fiber":0,"sodium":74}'),
('b0000001-0000-0000-0000-000000000007','Ikan Tongkol','kg','Protein',10,65000,'FROZEN','["Ikan"]','{"calories":129,"protein":26,"carbs":0,"fats":2.5,"fiber":0,"sodium":50}'),
('b0000001-0000-0000-0000-000000000008','Telur','kg','Protein',20,28000,'DRY','["Telur"]','{"calories":155,"protein":13,"carbs":1.1,"fats":11,"fiber":0,"sodium":124}'),
('b0000001-0000-0000-0000-000000000009','Tahu','kg','Protein',8,18000,'CHILL','["Kedelai"]','{"calories":76,"protein":8,"carbs":1.9,"fats":4.8,"fiber":0.3,"sodium":7}'),
('b0000001-0000-0000-0000-000000000010','Tempe','kg','Protein',8,20000,'CHILL','["Kedelai"]','{"calories":192,"protein":20,"carbs":8,"fats":11,"fiber":0,"sodium":9}'),
('b0000001-0000-0000-0000-000000000011','Beras','kg','Karbo',50,14000,'DRY','[]','{"calories":365,"protein":7,"carbs":80,"fats":0.7,"fiber":1.3,"sodium":1}'),
('b0000001-0000-0000-0000-000000000012','Mie Instan','kg','Karbo',20,16000,'DRY','["Gluten"]','{"calories":385,"protein":10,"carbs":72,"fats":14,"fiber":2.5,"sodium":1500}'),
('b0000001-0000-0000-0000-000000000013','Kentang','kg','Karbo',10,22000,'DRY','[]','{"calories":77,"protein":2,"carbs":17,"fats":0.1,"fiber":2.2,"sodium":6}'),
('b0000001-0000-0000-0000-000000000014','Bawang Merah','kg','Bumbu',5,45000,'DRY','[]','{"calories":40,"protein":1.1,"carbs":9.3,"fats":0.1,"fiber":1.7,"sodium":4}'),
('b0000001-0000-0000-0000-000000000015','Bawang Putih','kg','Bumbu',3,55000,'DRY','[]','{"calories":149,"protein":6.4,"carbs":33,"fats":0.5,"fiber":2.1,"sodium":17}'),
('b0000001-0000-0000-0000-000000000016','Cabai Merah','kg','Bumbu',3,40000,'CHILL','[]','{"calories":40,"protein":1.9,"carbs":8.8,"fats":0.4,"fiber":1.5,"sodium":9}'),
('b0000001-0000-0000-0000-000000000017','Minyak Goreng','liter','Bumbu',10,18000,'DRY','[]','{"calories":884,"protein":0,"carbs":0,"fats":100,"fiber":0,"sodium":0}'),
('b0000001-0000-0000-0000-000000000018','Garam','kg','Bumbu',2,5000,'DRY','[]','{"calories":0,"protein":0,"carbs":0,"fats":0,"fiber":0,"sodium":38758}'),
('b0000001-0000-0000-0000-000000000019','Kecap Manis','liter','Bumbu',3,25000,'DRY','["Kedelai","Gluten"]','{"calories":338,"protein":4.5,"carbs":75,"fats":0,"fiber":0,"sodium":1000}'),
('b0000001-0000-0000-0000-000000000020','Gula Pasir','kg','Bumbu',5,15000,'DRY','[]','{"calories":387,"protein":0,"carbs":100,"fats":0,"fiber":0,"sodium":1}');

-- ============= ITEM HIERARCHIES =============
INSERT INTO public.item_hierarchies (id, code, name, level, parent_code, category, unit, zone) VALUES
('a1000001-0000-0000-0000-000000000001','BB','Bahan Baku',1,NULL,'BB','kg','DRY'),
('a1000001-0000-0000-0000-000000000002','BB-001','Sayuran',2,'BB','BB-SAY','kg','CHILL'),
('a1000001-0000-0000-0000-000000000003','BB-001-001','Bayam',3,'BB-001','BB-SAY','kg','CHILL'),
('a1000001-0000-0000-0000-000000000004','BB-001-002','Wortel',3,'BB-001','BB-SAY','kg','CHILL'),
('a1000001-0000-0000-0000-000000000005','BB-001-003','Brokoli',3,'BB-001','BB-SAY','kg','CHILL'),
('a1000001-0000-0000-0000-000000000006','BB-002','Protein',2,'BB','BB-PRO','kg','FROZEN'),
('a1000001-0000-0000-0000-000000000007','BB-002-001','Ayam Fillet',3,'BB-002','BB-PRO','kg','FROZEN'),
('a1000001-0000-0000-0000-000000000008','BB-002-002','Ikan Tongkol',3,'BB-002','BB-PRO','kg','FROZEN'),
('a1000001-0000-0000-0000-000000000009','BB-002-003','Telur',3,'BB-002','BB-PRO','kg','DRY'),
('a1000001-0000-0000-0000-000000000010','BB-003','Karbohidrat',2,'BB','BB-KAR','kg','DRY'),
('a1000001-0000-0000-0000-000000000011','BB-003-001','Beras',3,'BB-003','BB-KAR','kg','DRY'),
('a1000001-0000-0000-0000-000000000012','BB-003-002','Kentang',3,'BB-003','BB-KAR','kg','DRY'),
('a1000001-0000-0000-0000-000000000013','BM','Bumbu',1,NULL,'BM','kg','DRY'),
('a1000001-0000-0000-0000-000000000014','BM-001','Bawang',2,'BM','BM','kg','DRY'),
('a1000001-0000-0000-0000-000000000015','BM-001-001','Bawang Merah',3,'BM-001','BM','kg','DRY'),
('a1000001-0000-0000-0000-000000000016','BM-001-002','Bawang Putih',3,'BM-001','BM','kg','DRY'),
('a1000001-0000-0000-0000-000000000017','BM-002','Minyak & Garam',2,'BM','BM','kg','DRY'),
('a1000001-0000-0000-0000-000000000018','PP','Produk Pangan',1,NULL,'PP','kg','DRY'),
('a1000001-0000-0000-0000-000000000019','PP-001','Ompreng',2,'PP','PP','pcs','DRY'),
('a1000001-0000-0000-0000-000000000020','PP-002','Mangkuk',2,'PP','PP','pcs','DRY');

-- ============= STOCK LOTS =============
INSERT INTO public.stock_lots (id, item_id, quantity, actual_quantity, expiry_date, zone, taken_by, taken_at, taken_reason) VALUES
('c0000001-0000-0000-0000-000000000001','b0000001-0000-0000-0000-000000000011',100,100,'2026-12-31','DRY',NULL,NULL,NULL),
('c0000001-0000-0000-0000-000000000002','b0000001-0000-0000-0000-000000000006',30,28,'2026-09-15','FROZEN','a0000001-0000-0000-0000-000000000010','2026-08-25T07:00:00Z','Ambil untuk masak'),
('c0000001-0000-0000-0000-000000000003','b0000001-0000-0000-0000-000000000001',15,14,'2026-08-28','CHILL','a0000001-0000-0000-0000-000000000010','2026-08-25T07:05:00Z','Persiapan bayam'),
('c0000001-0000-0000-0000-000000000004','b0000001-0000-0000-0000-000000000008',50,48,'2026-09-10','DRY',NULL,NULL,NULL),
('c0000001-0000-0000-0000-000000000005','b0000001-0000-0000-0000-000000000007',20,19,'2026-09-20','FROZEN',NULL,NULL,NULL),
('c0000001-0000-0000-0000-000000000006','b0000001-0000-0000-0000-000000000002',12,11,'2026-09-05','CHILL','a0000001-0000-0000-0000-000000000010','2026-08-26T06:30:00Z','Ambil wortel'),
('c0000001-0000-0000-0000-000000000007','b0000001-0000-0000-0000-000000000009',10,9,'2026-08-30','CHILL',NULL,NULL,NULL),
('c0000001-0000-0000-0000-000000000008','b0000001-0000-0000-0000-000000000010',10,9,'2026-09-01','CHILL',NULL,NULL,NULL),
('c0000001-0000-0000-0000-000000000009','b0000001-0000-0000-0000-000000000014',5,4,'2026-10-15','DRY',NULL,NULL,NULL),
('c0000001-0000-0000-0000-000000000010','b0000001-0000-0000-0000-000000000017',10,9,'2027-01-01','DRY',NULL,NULL,NULL),
('c0000001-0000-0000-0000-000000000011','b0000001-0000-0000-0000-000000000003',8,8,'2026-09-02','CHILL',NULL,NULL,NULL),
('c0000001-0000-0000-0000-000000000012','b0000001-0000-0000-0000-000000000004',10,10,'2026-09-08','DRY',NULL,NULL,NULL),
('c0000001-0000-0000-0000-000000000013','b0000001-0000-0000-0000-000000000005',10,9,'2026-09-03','CHILL',NULL,NULL,NULL),
('c0000001-0000-0000-0000-000000000014','b0000001-0000-0000-0000-000000000012',25,24,'2026-12-01','DRY',NULL,NULL,NULL),
('c0000001-0000-0000-0000-000000000015','b0000001-0000-0000-0000-000000000013',12,11,'2026-09-12','DRY',NULL,NULL,NULL),
('c0000001-0000-0000-0000-000000000016','b0000001-0000-0000-0000-000000000015',4,4,'2026-11-01','DRY',NULL,NULL,NULL),
('c0000001-0000-0000-0000-000000000017','b0000001-0000-0000-0000-000000000016',4,3,'2026-09-06','CHILL',NULL,NULL,NULL),
('c0000001-0000-0000-0000-000000000018','b0000001-0000-0000-0000-000000000019',3,3,'2027-03-01','DRY',NULL,NULL,NULL),
('c0000001-0000-0000-0000-000000000019','b0000001-0000-0000-0000-000000000020',5,5,'2027-06-01','DRY',NULL,NULL,NULL),
('c0000001-0000-0000-0000-000000000020','b0000001-0000-0000-0000-000000000018',3,3,'2027-01-01','DRY',NULL,NULL,NULL);

-- ============= OPNAMES =============
INSERT INTO public.opnames (id, item_id, lot_id, counted_quantity, system_quantity, zone, counted_by, temperature_c, humidity_pct, reason) VALUES
('a3000001-0000-0000-0000-000000000001','b0000001-0000-0000-0000-000000000011','c0000001-0000-0000-0000-000000000001',95,100,'DRY','Pak Kepala Dapur',25,60,'Routine'),
('a3000001-0000-0000-0000-000000000002','b0000001-0000-0000-0000-000000000006','c0000001-0000-0000-0000-000000000002',28,30,'FROZEN','Chef Andi',-18,40,'Routine'),
('a3000001-0000-0000-0000-000000000003','b0000001-0000-0000-0000-000000000001','c0000001-0000-0000-0000-000000000003',14,15,'CHILL','Pak Kepala Dapur',4,85,'Routine'),
('a3000001-0000-0000-0000-000000000004','b0000001-0000-0000-0000-000000000008','c0000001-0000-0000-0000-000000000004',48,50,'DRY','Chef Andi',26,58,'Routine'),
('a3000001-0000-0000-0000-000000000005','b0000001-0000-0000-0000-000000000007','c0000001-0000-0000-0000-000000000005',19,20,'FROZEN','Pak Kepala Dapur',-17,42,'Routine'),
('a3000001-0000-0000-0000-000000000006','b0000001-0000-0000-0000-000000000002','c0000001-0000-0000-0000-000000000006',11,12,'CHILL','Chef Andi',5,82,'Routine'),
('a3000001-0000-0000-0000-000000000007','b0000001-0000-0000-0000-000000000011','c0000001-0000-0000-0000-000000000001',88,95,'DRY','Pak Kepala Dapur',25,61,'Mingguan'),
('a3000001-0000-0000-0000-000000000008','b0000001-0000-0000-0000-000000000006','c0000001-0000-0000-0000-000000000002',25,28,'FROZEN','Chef Andi',-18,41,'Mingguan'),
('a3000001-0000-0000-0000-000000000009','b0000001-0000-0000-0000-000000000008','c0000001-0000-0000-0000-000000000004',44,48,'DRY','Pak Kepala Dapur',26,59,'Mingguan'),
('a3000001-0000-0000-0000-000000000010','b0000001-0000-0000-0000-000000000011','c0000001-0000-0000-0000-000000000001',82,88,'DRY','Chef Andi',25,60,'Mingguan'),
('a3000001-0000-0000-0000-000000000011','b0000001-0000-0000-0000-000000000003','c0000001-0000-0000-0000-000000000011',7,8,'CHILL','Pak Kepala Dapur',4,84,'Mingguan'),
('a3000001-0000-0000-0000-000000000012','b0000001-0000-0000-0000-000000000005','c0000001-0000-0000-0000-000000000013',8,9,'CHILL','Chef Andi',5,83,'Mingguan'),
('a3000001-0000-0000-0000-000000000013','b0000001-0000-0000-0000-000000000011','c0000001-0000-0000-0000-000000000001',75,82,'DRY','Pak Kepala Dapur',25,62,'Mingguan'),
('a3000001-0000-0000-0000-000000000014','b0000001-0000-0000-0000-000000000006','c0000001-0000-0000-0000-000000000002',22,25,'FROZEN','Chef Andi',-18,40,'Mingguan'),
('a3000001-0000-0000-0000-000000000015','b0000001-0000-0000-0000-000000000011','c0000001-0000-0000-0000-000000000001',70,75,'DRY','Pak Kepala Dapur',25,61,'Mingguan'),
('a3000001-0000-0000-0000-000000000016','b0000001-0000-0000-0000-000000000008','c0000001-0000-0000-0000-000000000004',40,44,'DRY','Chef Andi',26,58,'Mingguan'),
('a3000001-0000-0000-0000-000000000017','b0000001-0000-0000-0000-000000000002','c0000001-0000-0000-0000-000000000006',9,11,'CHILL','Pak Kepala Dapur',4,85,'Mingguan'),
('a3000001-0000-0000-0000-000000000018','b0000001-0000-0000-0000-000000000011','c0000001-0000-0000-0000-000000000001',65,70,'DRY','Chef Andi',25,60,'Mingguan'),
('a3000001-0000-0000-0000-000000000019','b0000001-0000-0000-0000-000000000007','c0000001-0000-0000-0000-000000000005',17,19,'FROZEN','Pak Kepala Dapur',-17,43,'Mingguan'),
('a3000001-0000-0000-0000-000000000020','b0000001-0000-0000-0000-000000000011','c0000001-0000-0000-0000-000000000001',60,65,'DRY','Chef Andi',25,61,'Mingguan');

-- ============= RECIPES (25 resep 4 kategori) =============
INSERT INTO public.recipes (id, name, servings, menu_category, ingredients, instructions, calories_kcal, protein_g, carbs_g, fats_g, fiber_g, sodium_mg, nutrition_auto) VALUES
('d0000001-0000-0000-0000-000000000001','Nasi Ayam Bakar',100,'PORTION_LARGE','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":25,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000006","quantity":15,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000001","quantity":5,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","quantity":1,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000019","quantity":2,"unit":"liter"}]','Masak nasi. Marinasi ayam dengan bumbu bakar. Bakar ayam hingga matang. Sajikan dengan nasi dan sayuran.',9500,4700,18000,540,430,11100,true),
('d0000001-0000-0000-0000-000000000002','Nasi Ikan Tongkol Balado',100,'PORTION_LARGE','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":25,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000007","quantity":12,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000016","quantity":2,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","quantity":1,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000017","quantity":1,"unit":"liter"}]','Masak nasi. Goreng ikan tongkol. Tumis bumbu balado. Campur ikan dengan bumbu.',8200,3100,18000,400,380,9600,true),
('d0000001-0000-0000-0000-000000000003','Nasi Tahu Tempe Sayur',100,'PORTION_LARGE','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":25,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000009","quantity":8,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000010","quantity":8,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000005","quantity":5,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000017","quantity":2,"unit":"liter"}]','Masak nasi. Goreng tahu dan tempe. Tumis kangkung. Sajikan selagi hangat.',8800,3000,18500,720,340,4200,true),
('d0000001-0000-0000-0000-000000000004','Nasi Ayam Goreng Lalapan',100,'PORTION_LARGE','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":25,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000006","quantity":15,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000004","quantity":3,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","quantity":1,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000017","quantity":2,"unit":"liter"}]','Masak nasi. Marinasi ayam. Goreng ayam hingga renyah. Sajikan dengan lalapan dan sambal.',9200,4500,17500,520,380,10800,true),
('d0000001-0000-0000-0000-000000000005','Nasi Kentang Kari Ayam',100,'PORTION_LARGE','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":22,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000006","quantity":12,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000013","quantity":8,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000015","quantity":1,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000017","quantity":1,"unit":"liter"}]','Masak nasi. Rebus kentang. Masak kari ayam dengan bumbu. Campur dan sajikan.',8900,4100,17800,490,360,8900,true),
('d0000001-0000-0000-0000-000000000006','Nasi Ikan Goreng Sambal',100,'PORTION_LARGE','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":25,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000007","quantity":12,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000016","quantity":1.5,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","quantity":1,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000017","quantity":2,"unit":"liter"}]','Masak nasi. Lumuri ikan dengan tepung. Goreng ikan. Buat sambal. Sajikan.',8100,2900,18000,380,350,9200,true),
('d0000001-0000-0000-0000-000000000007','Nasi Telur Dadar Sayur',100,'PORTION_SMALL','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":18,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000008","quantity":10,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000005","quantity":5,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","quantity":0.5,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000017","quantity":1,"unit":"liter"}]','Masak nasi. Kocok telur dengan daun bawang. Dadar telur. Tumis kangkung. Sajikan.',6800,2600,13500,350,310,6200,true),
('d0000001-0000-0000-0000-000000000008','Nasi Tumis Tahu Wortel',100,'PORTION_SMALL','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":18,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000009","quantity":6,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000002","quantity":5,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","quantity":0.5,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000017","quantity":1,"unit":"liter"}]','Masak nasi. Potong tahu dadu. Tumis tahu dengan wortel iris. Sajikan.',6200,2200,13000,320,280,5800,true),
('d0000001-0000-0000-0000-000000000009','Nasi Tempe Goreng Kol',100,'PORTION_SMALL','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":18,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000010","quantity":6,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000004","quantity":5,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","quantity":0.5,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000017","quantity":1,"unit":"liter"}]','Masak nasi. Iris tempe tipis. Goreng tempe. Tumis kol. Sajikan.',7100,2400,13800,380,300,5500,true),
('d0000001-0000-0000-0000-000000000010','Nasi Capcay Telur',100,'PORTION_SMALL','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":18,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000008","quantity":8,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000003","quantity":3,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000002","quantity":3,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","quantity":0.5,"unit":"kg"}]','Masak nasi. Tumis sayuran capcay. Masak telur orak-arik. Campur. Sajikan.',6500,2500,13200,330,290,6000,true),
('d0000001-0000-0000-0000-000000000011','Nasi Sambal Tempe Kentang',100,'PORTION_SMALL','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":18,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000010","quantity":5,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000013","quantity":5,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000016","quantity":1,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","quantity":0.5,"unit":"kg"}]','Masak nasi. Goreng tempe. Rebus kentang. Ulek sambal. Sajikan.',7300,2500,14000,390,270,7100,true),
('d0000001-0000-0000-0000-000000000012','Nasi Telur Balado Bayam',100,'PORTION_SMALL','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":18,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000008","quantity":8,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000001","quantity":5,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000016","quantity":1,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","quantity":0.5,"unit":"kg"}]','Masak nasi. Rebus telur. Tumis balado. Rebus bayam. Sajikan.',6900,2700,13600,340,320,6500,true),
('d0000001-0000-0000-0000-000000000013','Bubur Ayam Wortel',100,'BALITA','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":10,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000006","quantity":5,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000002","quantity":3,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","quantity":0.5,"unit":"kg"}]','Masak bubur nasi hingga lembut. Rebus ayam dan suwir. Tambahkan wortel parut. Sajikan hangat.',3400,1300,6800,180,150,2800,true),
('d0000001-0000-0000-0000-000000000014','Bubur Telur Bayam',100,'BALITA','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":10,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000008","quantity":5,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000001","quantity":3,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","quantity":0.3,"unit":"kg"}]','Masak bubur nasi hingga lembut. Kocok telur. Masukkan telur ke bubur. Tambahkan bayam cincang. Sajikan.',3200,1400,6200,170,140,2600,true),
('d0000001-0000-0000-0000-000000000015','Bubur Ikan Tongkol',100,'BALITA','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":10,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000007","quantity":4,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000002","quantity":3,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","quantity":0.3,"unit":"kg"}]','Masak bubur nasi hingga lembut. Rebus ikan tongkol. Suwir ikan. Tambahkan wortel. Sajikan hangat.',3600,1500,6500,160,130,2900,true),
('d0000001-0000-0000-0000-000000000016','Bubur Tahu Tempe',100,'BALITA','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":10,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000009","quantity":3,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000010","quantity":3,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","quantity":0.3,"unit":"kg"}]','Masak bubur nasi hingga lembut. Hancurkan tahu dan tempe. Campur ke bubur. Sajikan.',3500,1350,6600,190,120,2400,true),
('d0000001-0000-0000-0000-000000000017','Bubur Kentang Ayam',100,'BALITA','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":10,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000006","quantity":4,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000013","quantity":4,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","quantity":0.3,"unit":"kg"}]','Masak bubur nasi hingga lembut. Rebus kentang dan ayam. Hancurkan. Campur. Sajikan hangat.',3800,1400,7000,170,140,2700,true),
('d0000001-0000-0000-0000-000000000018','Bubur Tim Wortel Telur',100,'BALITA','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":10,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000008","quantity":5,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000002","quantity":4,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","quantity":0.3,"unit":"kg"}]','Masak bubur nasi hingga lembut. Parut wortel. Kocok telur. Masukkan ke bubur. Aduk rata. Sajikan.',3300,1450,6300,175,150,2500,true),
('d0000001-0000-0000-0000-000000000019','Nasi Tahu Tempe Goreng Bergizi',100,'BUMIL_BUSUI','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":25,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000009","quantity":8,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000010","quantity":8,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000005","quantity":5,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000017","quantity":2,"unit":"liter"}]','Masak nasi. Goreng tahu dan tempe. Tumis sayuran. Sajikan untuk ibu hamil/busui.',9200,3200,18500,780,350,4500,true),
('d0000001-0000-0000-0000-000000000020','Nasi Ayam Brokoli',100,'BUMIL_BUSUI','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":25,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000006","quantity":12,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000003","quantity":6,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","quantity":1,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000017","quantity":1,"unit":"liter"}]','Masak nasi. Rebus ayam. Tumis brokoli. Sajikan dengan nasi untuk nutrisi ibu hamil.',8500,3800,17500,450,380,7200,true),
('d0000001-0000-0000-0000-000000000021','Nasi Telur Ikan Tongkol',100,'BUMIL_BUSUI','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":25,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000008","quantity":8,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000007","quantity":8,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000001","quantity":4,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","quantity":1,"unit":"kg"}]','Masak nasi. Rebus ikan tongkol. Dadar telur. Tumis bayam. Sajikan bergizi.',8800,3600,18000,520,360,8500,true),
('d0000001-0000-0000-0000-000000000022','Nasi Kentang Ayam Brokoli',100,'BUMIL_BUSUI','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":20,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000006","quantity":12,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000013","quantity":8,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000003","quantity":5,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","quantity":1,"unit":"kg"}]','Masak nasi. Rebus kentang. Tumis ayam brokoli. Sajikan bergizi tinggi.',8600,3500,17800,480,370,7000,true),
('d0000001-0000-0000-0000-000000000023','Nasi Ikan Tempe Sayur',100,'BUMIL_BUSUI','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":25,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000007","quantity":10,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000010","quantity":6,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000002","quantity":5,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000017","quantity":1,"unit":"liter"}]','Masak nasi. Goreng ikan. Goreng tempe. Tumis wortel. Sajikan untuk ibu.',8400,3300,18200,500,340,6800,true),
('d0000001-0000-0000-0000-000000000024','Bubur Ayam Bergizi Ibu',100,'BUMIL_BUSUI','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":12,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000006","quantity":6,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000002","quantity":4,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000001","quantity":3,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","quantity":0.5,"unit":"kg"}]','Masak bubur nasi. Rebus ayam suwir. Tambahkan wortel dan bayam. Sajikan hangat.',4200,1800,7500,220,180,3200,true),
('d0000001-0000-0000-0000-000000000025','Nasi Telur Kornet Kentang',100,'BUMIL_BUSUI','[{"item_id":"b0000001-0000-0000-0000-000000000011","quantity":25,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000008","quantity":10,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000013","quantity":8,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000004","quantity":4,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000014","quantity":1,"unit":"kg"}]','Masak nasi. Rebus kentang. Orak-arik telur. Tumis kol. Sajikan bergizi.',8700,3400,18300,510,330,5800,true);

-- ============= MENUS (20 menu: 4 minggu x 5 hari) =============
INSERT INTO public.menus (id, week_start, day, recipe_ids, portions, total_days, active_days, status, approved_by, approved_by_name, approved_at) VALUES
('e0000001-0000-0000-0000-000000000001','2026-08-24','mon','["d0000001-0000-0000-0000-000000000001", "d0000001-0000-0000-0000-000000000007", "d0000001-0000-0000-0000-000000000013", "d0000001-0000-0000-0000-000000000019"]',2500,5,5,'APPROVED','a0000001-0000-0000-0000-000000000007','Dr. Gizi','2026-08-24T10:00:00Z'),
('e0000001-0000-0000-0000-000000000002','2026-08-24','tue','["d0000001-0000-0000-0000-000000000002", "d0000001-0000-0000-0000-000000000008", "d0000001-0000-0000-0000-000000000014", "d0000001-0000-0000-0000-000000000020"]',2500,5,5,'APPROVED','a0000001-0000-0000-0000-000000000007','Dr. Gizi','2026-08-24T10:00:00Z'),
('e0000001-0000-0000-0000-000000000003','2026-08-24','wed','["d0000001-0000-0000-0000-000000000003", "d0000001-0000-0000-0000-000000000009", "d0000001-0000-0000-0000-000000000015", "d0000001-0000-0000-0000-000000000021"]',2500,5,5,'APPROVED','a0000001-0000-0000-0000-000000000007','Dr. Gizi','2026-08-24T10:00:00Z'),
('e0000001-0000-0000-0000-000000000004','2026-08-24','thu','["d0000001-0000-0000-0000-000000000004", "d0000001-0000-0000-0000-000000000010", "d0000001-0000-0000-0000-000000000016", "d0000001-0000-0000-0000-000000000022"]',2500,5,5,'APPROVED','a0000001-0000-0000-0000-000000000007','Dr. Gizi','2026-08-24T10:00:00Z'),
('e0000001-0000-0000-0000-000000000005','2026-08-24','fri','["d0000001-0000-0000-0000-000000000005", "d0000001-0000-0000-0000-000000000011", "d0000001-0000-0000-0000-000000000017", "d0000001-0000-0000-0000-000000000023"]',2500,5,5,'APPROVED','a0000001-0000-0000-0000-000000000007','Dr. Gizi','2026-08-24T10:00:00Z'),
('e0000001-0000-0000-0000-000000000006','2026-08-31','mon','["d0000001-0000-0000-0000-000000000001", "d0000001-0000-0000-0000-000000000007", "d0000001-0000-0000-0000-000000000013", "d0000001-0000-0000-0000-000000000019"]',2500,5,5,'APPROVED','a0000001-0000-0000-0000-000000000007','Dr. Gizi','2026-08-31T10:00:00Z'),
('e0000001-0000-0000-0000-000000000007','2026-08-31','tue','["d0000001-0000-0000-0000-000000000002", "d0000001-0000-0000-0000-000000000008", "d0000001-0000-0000-0000-000000000014", "d0000001-0000-0000-0000-000000000020"]',2500,5,5,'APPROVED','a0000001-0000-0000-0000-000000000007','Dr. Gizi','2026-08-31T10:00:00Z'),
('e0000001-0000-0000-0000-000000000008','2026-08-31','wed','["d0000001-0000-0000-0000-000000000003", "d0000001-0000-0000-0000-000000000009", "d0000001-0000-0000-0000-000000000015", "d0000001-0000-0000-0000-000000000021"]',2500,5,5,'APPROVED','a0000001-0000-0000-0000-000000000007','Dr. Gizi','2026-08-31T10:00:00Z'),
('e0000001-0000-0000-0000-000000000009','2026-08-31','thu','["d0000001-0000-0000-0000-000000000004", "d0000001-0000-0000-0000-000000000010", "d0000001-0000-0000-0000-000000000016", "d0000001-0000-0000-0000-000000000022"]',2500,5,5,'PENDING_REVIEW',NULL,NULL,NULL),
('e0000001-0000-0000-0000-000000000010','2026-08-31','fri','["d0000001-0000-0000-0000-000000000005", "d0000001-0000-0000-0000-000000000011", "d0000001-0000-0000-0000-000000000017", "d0000001-0000-0000-0000-000000000023"]',2500,5,5,'PENDING_REVIEW',NULL,NULL,NULL),
('e0000001-0000-0000-0000-000000000011','2026-09-07','mon','["d0000001-0000-0000-0000-000000000001", "d0000001-0000-0000-0000-000000000007", "d0000001-0000-0000-0000-000000000013", "d0000001-0000-0000-0000-000000000019"]',2500,5,5,'PENDING_REVIEW',NULL,NULL,NULL),
('e0000001-0000-0000-0000-000000000012','2026-09-07','tue','["d0000001-0000-0000-0000-000000000002", "d0000001-0000-0000-0000-000000000008", "d0000001-0000-0000-0000-000000000014", "d0000001-0000-0000-0000-000000000020"]',2500,5,5,'PENDING_REVIEW',NULL,NULL,NULL),
('e0000001-0000-0000-0000-000000000013','2026-09-07','wed','["d0000001-0000-0000-0000-000000000003", "d0000001-0000-0000-0000-000000000009", "d0000001-0000-0000-0000-000000000015", "d0000001-0000-0000-0000-000000000021"]',2500,5,5,'PENDING_REVIEW',NULL,NULL,NULL),
('e0000001-0000-0000-0000-000000000014','2026-09-07','thu','["d0000001-0000-0000-0000-000000000004", "d0000001-0000-0000-0000-000000000010", "d0000001-0000-0000-0000-000000000016", "d0000001-0000-0000-0000-000000000022"]',2500,5,5,'PENDING_REVIEW',NULL,NULL,NULL),
('e0000001-0000-0000-0000-000000000015','2026-09-07','fri','["d0000001-0000-0000-0000-000000000005", "d0000001-0000-0000-0000-000000000011", "d0000001-0000-0000-0000-000000000017", "d0000001-0000-0000-0000-000000000023"]',2500,5,5,'PENDING_REVIEW',NULL,NULL,NULL),
('e0000001-0000-0000-0000-000000000016','2026-09-14','mon','["d0000001-0000-0000-0000-000000000001", "d0000001-0000-0000-0000-000000000007", "d0000001-0000-0000-0000-000000000013", "d0000001-0000-0000-0000-000000000019"]',2500,5,5,'DRAFT',NULL,NULL,NULL),
('e0000001-0000-0000-0000-000000000017','2026-09-14','tue','["d0000001-0000-0000-0000-000000000002", "d0000001-0000-0000-0000-000000000008", "d0000001-0000-0000-0000-000000000014", "d0000001-0000-0000-0000-000000000020"]',2500,5,5,'DRAFT',NULL,NULL,NULL),
('e0000001-0000-0000-0000-000000000018','2026-09-14','wed','["d0000001-0000-0000-0000-000000000003", "d0000001-0000-0000-0000-000000000009", "d0000001-0000-0000-0000-000000000015", "d0000001-0000-0000-0000-000000000021"]',2500,5,5,'DRAFT',NULL,NULL,NULL),
('e0000001-0000-0000-0000-000000000019','2026-09-14','thu','["d0000001-0000-0000-0000-000000000004", "d0000001-0000-0000-0000-000000000010", "d0000001-0000-0000-0000-000000000016", "d0000001-0000-0000-0000-000000000022"]',2500,5,5,'DRAFT',NULL,NULL,NULL),
('e0000001-0000-0000-0000-000000000020','2026-09-14','fri','["d0000001-0000-0000-0000-000000000005", "d0000001-0000-0000-0000-000000000011", "d0000001-0000-0000-0000-000000000017", "d0000001-0000-0000-0000-000000000023"]',2500,5,5,'DRAFT',NULL,NULL,NULL);

-- ============= DESTINATIONS (10 tujuan) =============
INSERT INTO public.destinations (id, name, address, contact_person, phone, notes) VALUES
('f0000001-0000-0000-0000-000000000001','SDN 01 Jagakarsa','Jl. Jagakarsa Raya No. 1','Pak Sumarno','0812-3456-7890','Sekolah Dasar Negeri'),
('f0000001-0000-0000-0000-000000000002','PAUD Melati','Jl. Mampang Prapatan No. 45','Bu Ratna','0813-4567-8901','Pendidikan Anak Usia Dini'),
('f0000001-0000-0000-0000-000000000003','Posyandu Mawar','Jl. Pejaten Timur No. 12','Bu Siti','0815-6789-0123','Pos Pelayanan Terpadu'),
('f0000001-0000-0000-0000-000000000004','Panti Asuhan Harapan','Jl. Ragunan No. 88','Pak Budi','0816-7890-1234','Panti Asuhan Yatim Piatu'),
('f0000001-0000-0000-0000-000000000005','SDN 02 Pasar Minggu','Jl. Pasar Minggu No. 10','Bu Ani','0817-8901-2345','Sekolah Dasar Negeri'),
('f0000001-0000-0000-0000-000000000006','TK Tunas Harapan','Jl. Cilandak No. 22','Pak Hendra','0818-9012-3456','Taman Kanak-Kanak'),
('f0000001-0000-0000-0000-000000000007','Posyandu Melati 3','Jl. Tebet No. 15','Bu Rina','0819-0123-4567','Posyandu'),
('f0000001-0000-0000-0000-000000000008','SDN 03 Cilandak','Jl. Cilandak Kopo No. 7','Pak Darto','0820-1234-5678','Sekolah Dasar Negeri'),
('f0000001-0000-0000-0000-000000000009','Panti Jompo Kasih','Jl. Ragunan No. 99','Bu Lina','0821-2345-6789','Panti Lansia'),
('f0000001-0000-0000-0000-000000000010','PAUD Ceria','Jl. Pejaten Raya No. 30','Pak Arif','0822-3456-7890','Pendidikan Anak Usia Dini');

-- ============= DELIVERY PLANS (20 rencana pengiriman) =============
INSERT INTO public.delivery_plans (id, plan_date, created_by, notes) VALUES
('aa000001-0000-0000-0000-000000000001','2026-08-24','a0000001-0000-0000-0000-000000000006','Pengiriman 2026-08-24'),
('aa000001-0000-0000-0000-000000000002','2026-08-25','a0000001-0000-0000-0000-000000000006','Pengiriman 2026-08-25'),
('aa000001-0000-0000-0000-000000000003','2026-08-26','a0000001-0000-0000-0000-000000000006','Pengiriman 2026-08-26'),
('aa000001-0000-0000-0000-000000000004','2026-08-27','a0000001-0000-0000-0000-000000000006','Pengiriman 2026-08-27'),
('aa000001-0000-0000-0000-000000000005','2026-08-28','a0000001-0000-0000-0000-000000000006','Pengiriman 2026-08-28'),
('aa000001-0000-0000-0000-000000000006','2026-08-31','a0000001-0000-0000-0000-000000000006','Pengiriman 2026-08-31'),
('aa000001-0000-0000-0000-000000000007','2026-09-01','a0000001-0000-0000-0000-000000000006','Pengiriman 2026-09-01'),
('aa000001-0000-0000-0000-000000000008','2026-09-02','a0000001-0000-0000-0000-000000000006','Pengiriman 2026-09-02'),
('aa000001-0000-0000-0000-000000000009','2026-09-03','a0000001-0000-0000-0000-000000000006','Pengiriman 2026-09-03'),
('aa000001-0000-0000-0000-000000000010','2026-09-04','a0000001-0000-0000-0000-000000000006','Pengiriman 2026-09-04'),
('aa000001-0000-0000-0000-000000000011','2026-09-07','a0000001-0000-0000-0000-000000000006','Pengiriman 2026-09-07'),
('aa000001-0000-0000-0000-000000000012','2026-09-08','a0000001-0000-0000-0000-000000000006','Pengiriman 2026-09-08'),
('aa000001-0000-0000-0000-000000000013','2026-09-09','a0000001-0000-0000-0000-000000000006','Pengiriman 2026-09-09'),
('aa000001-0000-0000-0000-000000000014','2026-09-10','a0000001-0000-0000-0000-000000000006','Pengiriman 2026-09-10'),
('aa000001-0000-0000-0000-000000000015','2026-09-11','a0000001-0000-0000-0000-000000000006','Pengiriman 2026-09-11'),
('aa000001-0000-0000-0000-000000000016','2026-09-14','a0000001-0000-0000-0000-000000000006','Pengiriman 2026-09-14'),
('aa000001-0000-0000-0000-000000000017','2026-09-15','a0000001-0000-0000-0000-000000000006','Pengiriman 2026-09-15'),
('aa000001-0000-0000-0000-000000000018','2026-09-16','a0000001-0000-0000-0000-000000000006','Pengiriman 2026-09-16'),
('aa000001-0000-0000-0000-000000000019','2026-09-17','a0000001-0000-0000-0000-000000000006','Pengiriman 2026-09-17'),
('aa000001-0000-0000-0000-000000000020','2026-09-18','a0000001-0000-0000-0000-000000000006','Pengiriman 2026-09-18');

-- ============= DELIVERY PLAN ITEMS (80 item pengiriman) =============
INSERT INTO public.delivery_plan_items (id, plan_id, destination_id, category, portions, notes) VALUES
('bb000001-0000-0000-0000-000000000001','aa000001-0000-0000-0000-000000000001','f0000001-0000-0000-0000-000000000001','PORTION_LARGE',1000,'Untuk SDN 01 Jagakarsa'),
('bb000001-0000-0000-0000-000000000002','aa000001-0000-0000-0000-000000000001','f0000001-0000-0000-0000-000000000002','PORTION_SMALL',500,'Untuk PAUD Melati'),
('bb000001-0000-0000-0000-000000000003','aa000001-0000-0000-0000-000000000001','f0000001-0000-0000-0000-000000000003','BALITA',300,'Untuk Posyandu Mawar'),
('bb000001-0000-0000-0000-000000000004','aa000001-0000-0000-0000-000000000001','f0000001-0000-0000-0000-000000000004','BUMIL_BUSUI',200,'Untuk Panti Asuhan Harapan'),
('bb000001-0000-0000-0000-000000000005','aa000001-0000-0000-0000-000000000002','f0000001-0000-0000-0000-000000000001','PORTION_LARGE',1010,'Untuk SDN 01 Jagakarsa'),
('bb000001-0000-0000-0000-000000000006','aa000001-0000-0000-0000-000000000002','f0000001-0000-0000-0000-000000000002','PORTION_SMALL',510,'Untuk PAUD Melati'),
('bb000001-0000-0000-0000-000000000007','aa000001-0000-0000-0000-000000000002','f0000001-0000-0000-0000-000000000003','BALITA',310,'Untuk Posyandu Mawar'),
('bb000001-0000-0000-0000-000000000008','aa000001-0000-0000-0000-000000000002','f0000001-0000-0000-0000-000000000004','BUMIL_BUSUI',210,'Untuk Panti Asuhan Harapan'),
('bb000001-0000-0000-0000-000000000009','aa000001-0000-0000-0000-000000000003','f0000001-0000-0000-0000-000000000001','PORTION_LARGE',1020,'Untuk SDN 01 Jagakarsa'),
('bb000001-0000-0000-0000-000000000010','aa000001-0000-0000-0000-000000000003','f0000001-0000-0000-0000-000000000002','PORTION_SMALL',520,'Untuk PAUD Melati'),
('bb000001-0000-0000-0000-000000000011','aa000001-0000-0000-0000-000000000003','f0000001-0000-0000-0000-000000000003','BALITA',320,'Untuk Posyandu Mawar'),
('bb000001-0000-0000-0000-000000000012','aa000001-0000-0000-0000-000000000003','f0000001-0000-0000-0000-000000000004','BUMIL_BUSUI',220,'Untuk Panti Asuhan Harapan'),
('bb000001-0000-0000-0000-000000000013','aa000001-0000-0000-0000-000000000004','f0000001-0000-0000-0000-000000000001','PORTION_LARGE',1000,'Untuk SDN 01 Jagakarsa'),
('bb000001-0000-0000-0000-000000000014','aa000001-0000-0000-0000-000000000004','f0000001-0000-0000-0000-000000000002','PORTION_SMALL',500,'Untuk PAUD Melati'),
('bb000001-0000-0000-0000-000000000015','aa000001-0000-0000-0000-000000000004','f0000001-0000-0000-0000-000000000003','BALITA',300,'Untuk Posyandu Mawar'),
('bb000001-0000-0000-0000-000000000016','aa000001-0000-0000-0000-000000000004','f0000001-0000-0000-0000-000000000004','BUMIL_BUSUI',200,'Untuk Panti Asuhan Harapan'),
('bb000001-0000-0000-0000-000000000017','aa000001-0000-0000-0000-000000000005','f0000001-0000-0000-0000-000000000001','PORTION_LARGE',1010,'Untuk SDN 01 Jagakarsa'),
('bb000001-0000-0000-0000-000000000018','aa000001-0000-0000-0000-000000000005','f0000001-0000-0000-0000-000000000002','PORTION_SMALL',510,'Untuk PAUD Melati'),
('bb000001-0000-0000-0000-000000000019','aa000001-0000-0000-0000-000000000005','f0000001-0000-0000-0000-000000000003','BALITA',310,'Untuk Posyandu Mawar'),
('bb000001-0000-0000-0000-000000000020','aa000001-0000-0000-0000-000000000005','f0000001-0000-0000-0000-000000000004','BUMIL_BUSUI',210,'Untuk Panti Asuhan Harapan'),
('bb000001-0000-0000-0000-000000000021','aa000001-0000-0000-0000-000000000006','f0000001-0000-0000-0000-000000000001','PORTION_LARGE',1020,'Untuk SDN 01 Jagakarsa'),
('bb000001-0000-0000-0000-000000000022','aa000001-0000-0000-0000-000000000006','f0000001-0000-0000-0000-000000000002','PORTION_SMALL',520,'Untuk PAUD Melati'),
('bb000001-0000-0000-0000-000000000023','aa000001-0000-0000-0000-000000000006','f0000001-0000-0000-0000-000000000003','BALITA',320,'Untuk Posyandu Mawar'),
('bb000001-0000-0000-0000-000000000024','aa000001-0000-0000-0000-000000000006','f0000001-0000-0000-0000-000000000004','BUMIL_BUSUI',220,'Untuk Panti Asuhan Harapan'),
('bb000001-0000-0000-0000-000000000025','aa000001-0000-0000-0000-000000000007','f0000001-0000-0000-0000-000000000001','PORTION_LARGE',1000,'Untuk SDN 01 Jagakarsa'),
('bb000001-0000-0000-0000-000000000026','aa000001-0000-0000-0000-000000000007','f0000001-0000-0000-0000-000000000002','PORTION_SMALL',500,'Untuk PAUD Melati'),
('bb000001-0000-0000-0000-000000000027','aa000001-0000-0000-0000-000000000007','f0000001-0000-0000-0000-000000000003','BALITA',300,'Untuk Posyandu Mawar'),
('bb000001-0000-0000-0000-000000000028','aa000001-0000-0000-0000-000000000007','f0000001-0000-0000-0000-000000000004','BUMIL_BUSUI',200,'Untuk Panti Asuhan Harapan'),
('bb000001-0000-0000-0000-000000000029','aa000001-0000-0000-0000-000000000008','f0000001-0000-0000-0000-000000000001','PORTION_LARGE',1010,'Untuk SDN 01 Jagakarsa'),
('bb000001-0000-0000-0000-000000000030','aa000001-0000-0000-0000-000000000008','f0000001-0000-0000-0000-000000000002','PORTION_SMALL',510,'Untuk PAUD Melati'),
('bb000001-0000-0000-0000-000000000031','aa000001-0000-0000-0000-000000000008','f0000001-0000-0000-0000-000000000003','BALITA',310,'Untuk Posyandu Mawar'),
('bb000001-0000-0000-0000-000000000032','aa000001-0000-0000-0000-000000000008','f0000001-0000-0000-0000-000000000004','BUMIL_BUSUI',210,'Untuk Panti Asuhan Harapan'),
('bb000001-0000-0000-0000-000000000033','aa000001-0000-0000-0000-000000000009','f0000001-0000-0000-0000-000000000001','PORTION_LARGE',1020,'Untuk SDN 01 Jagakarsa'),
('bb000001-0000-0000-0000-000000000034','aa000001-0000-0000-0000-000000000009','f0000001-0000-0000-0000-000000000002','PORTION_SMALL',520,'Untuk PAUD Melati'),
('bb000001-0000-0000-0000-000000000035','aa000001-0000-0000-0000-000000000009','f0000001-0000-0000-0000-000000000003','BALITA',320,'Untuk Posyandu Mawar'),
('bb000001-0000-0000-0000-000000000036','aa000001-0000-0000-0000-000000000009','f0000001-0000-0000-0000-000000000004','BUMIL_BUSUI',220,'Untuk Panti Asuhan Harapan'),
('bb000001-0000-0000-0000-000000000037','aa000001-0000-0000-0000-000000000010','f0000001-0000-0000-0000-000000000001','PORTION_LARGE',1000,'Untuk SDN 01 Jagakarsa'),
('bb000001-0000-0000-0000-000000000038','aa000001-0000-0000-0000-000000000010','f0000001-0000-0000-0000-000000000002','PORTION_SMALL',500,'Untuk PAUD Melati'),
('bb000001-0000-0000-0000-000000000039','aa000001-0000-0000-0000-000000000010','f0000001-0000-0000-0000-000000000003','BALITA',300,'Untuk Posyandu Mawar'),
('bb000001-0000-0000-0000-000000000040','aa000001-0000-0000-0000-000000000010','f0000001-0000-0000-0000-000000000004','BUMIL_BUSUI',200,'Untuk Panti Asuhan Harapan'),
('bb000001-0000-0000-0000-000000000041','aa000001-0000-0000-0000-000000000011','f0000001-0000-0000-0000-000000000001','PORTION_LARGE',1010,'Untuk SDN 01 Jagakarsa'),
('bb000001-0000-0000-0000-000000000042','aa000001-0000-0000-0000-000000000011','f0000001-0000-0000-0000-000000000002','PORTION_SMALL',510,'Untuk PAUD Melati'),
('bb000001-0000-0000-0000-000000000043','aa000001-0000-0000-0000-000000000011','f0000001-0000-0000-0000-000000000003','BALITA',310,'Untuk Posyandu Mawar'),
('bb000001-0000-0000-0000-000000000044','aa000001-0000-0000-0000-000000000011','f0000001-0000-0000-0000-000000000004','BUMIL_BUSUI',210,'Untuk Panti Asuhan Harapan'),
('bb000001-0000-0000-0000-000000000045','aa000001-0000-0000-0000-000000000012','f0000001-0000-0000-0000-000000000001','PORTION_LARGE',1020,'Untuk SDN 01 Jagakarsa'),
('bb000001-0000-0000-0000-000000000046','aa000001-0000-0000-0000-000000000012','f0000001-0000-0000-0000-000000000002','PORTION_SMALL',520,'Untuk PAUD Melati'),
('bb000001-0000-0000-0000-000000000047','aa000001-0000-0000-0000-000000000012','f0000001-0000-0000-0000-000000000003','BALITA',320,'Untuk Posyandu Mawar'),
('bb000001-0000-0000-0000-000000000048','aa000001-0000-0000-0000-000000000012','f0000001-0000-0000-0000-000000000004','BUMIL_BUSUI',220,'Untuk Panti Asuhan Harapan'),
('bb000001-0000-0000-0000-000000000049','aa000001-0000-0000-0000-000000000013','f0000001-0000-0000-0000-000000000001','PORTION_LARGE',1000,'Untuk SDN 01 Jagakarsa'),
('bb000001-0000-0000-0000-000000000050','aa000001-0000-0000-0000-000000000013','f0000001-0000-0000-0000-000000000002','PORTION_SMALL',500,'Untuk PAUD Melati'),
('bb000001-0000-0000-0000-000000000051','aa000001-0000-0000-0000-000000000013','f0000001-0000-0000-0000-000000000003','BALITA',300,'Untuk Posyandu Mawar'),
('bb000001-0000-0000-0000-000000000052','aa000001-0000-0000-0000-000000000013','f0000001-0000-0000-0000-000000000004','BUMIL_BUSUI',200,'Untuk Panti Asuhan Harapan'),
('bb000001-0000-0000-0000-000000000053','aa000001-0000-0000-0000-000000000014','f0000001-0000-0000-0000-000000000001','PORTION_LARGE',1010,'Untuk SDN 01 Jagakarsa'),
('bb000001-0000-0000-0000-000000000054','aa000001-0000-0000-0000-000000000014','f0000001-0000-0000-0000-000000000002','PORTION_SMALL',510,'Untuk PAUD Melati'),
('bb000001-0000-0000-0000-000000000055','aa000001-0000-0000-0000-000000000014','f0000001-0000-0000-0000-000000000003','BALITA',310,'Untuk Posyandu Mawar'),
('bb000001-0000-0000-0000-000000000056','aa000001-0000-0000-0000-000000000014','f0000001-0000-0000-0000-000000000004','BUMIL_BUSUI',210,'Untuk Panti Asuhan Harapan'),
('bb000001-0000-0000-0000-000000000057','aa000001-0000-0000-0000-000000000015','f0000001-0000-0000-0000-000000000001','PORTION_LARGE',1020,'Untuk SDN 01 Jagakarsa'),
('bb000001-0000-0000-0000-000000000058','aa000001-0000-0000-0000-000000000015','f0000001-0000-0000-0000-000000000002','PORTION_SMALL',520,'Untuk PAUD Melati'),
('bb000001-0000-0000-0000-000000000059','aa000001-0000-0000-0000-000000000015','f0000001-0000-0000-0000-000000000003','BALITA',320,'Untuk Posyandu Mawar'),
('bb000001-0000-0000-0000-000000000060','aa000001-0000-0000-0000-000000000015','f0000001-0000-0000-0000-000000000004','BUMIL_BUSUI',220,'Untuk Panti Asuhan Harapan'),
('bb000001-0000-0000-0000-000000000061','aa000001-0000-0000-0000-000000000016','f0000001-0000-0000-0000-000000000001','PORTION_LARGE',1000,'Untuk SDN 01 Jagakarsa'),
('bb000001-0000-0000-0000-000000000062','aa000001-0000-0000-0000-000000000016','f0000001-0000-0000-0000-000000000002','PORTION_SMALL',500,'Untuk PAUD Melati'),
('bb000001-0000-0000-0000-000000000063','aa000001-0000-0000-0000-000000000016','f0000001-0000-0000-0000-000000000003','BALITA',300,'Untuk Posyandu Mawar'),
('bb000001-0000-0000-0000-000000000064','aa000001-0000-0000-0000-000000000016','f0000001-0000-0000-0000-000000000004','BUMIL_BUSUI',200,'Untuk Panti Asuhan Harapan'),
('bb000001-0000-0000-0000-000000000065','aa000001-0000-0000-0000-000000000017','f0000001-0000-0000-0000-000000000001','PORTION_LARGE',1010,'Untuk SDN 01 Jagakarsa'),
('bb000001-0000-0000-0000-000000000066','aa000001-0000-0000-0000-000000000017','f0000001-0000-0000-0000-000000000002','PORTION_SMALL',510,'Untuk PAUD Melati'),
('bb000001-0000-0000-0000-000000000067','aa000001-0000-0000-0000-000000000017','f0000001-0000-0000-0000-000000000003','BALITA',310,'Untuk Posyandu Mawar'),
('bb000001-0000-0000-0000-000000000068','aa000001-0000-0000-0000-000000000017','f0000001-0000-0000-0000-000000000004','BUMIL_BUSUI',210,'Untuk Panti Asuhan Harapan'),
('bb000001-0000-0000-0000-000000000069','aa000001-0000-0000-0000-000000000018','f0000001-0000-0000-0000-000000000001','PORTION_LARGE',1020,'Untuk SDN 01 Jagakarsa'),
('bb000001-0000-0000-0000-000000000070','aa000001-0000-0000-0000-000000000018','f0000001-0000-0000-0000-000000000002','PORTION_SMALL',520,'Untuk PAUD Melati'),
('bb000001-0000-0000-0000-000000000071','aa000001-0000-0000-0000-000000000018','f0000001-0000-0000-0000-000000000003','BALITA',320,'Untuk Posyandu Mawar'),
('bb000001-0000-0000-0000-000000000072','aa000001-0000-0000-0000-000000000018','f0000001-0000-0000-0000-000000000004','BUMIL_BUSUI',220,'Untuk Panti Asuhan Harapan'),
('bb000001-0000-0000-0000-000000000073','aa000001-0000-0000-0000-000000000019','f0000001-0000-0000-0000-000000000001','PORTION_LARGE',1000,'Untuk SDN 01 Jagakarsa'),
('bb000001-0000-0000-0000-000000000074','aa000001-0000-0000-0000-000000000019','f0000001-0000-0000-0000-000000000002','PORTION_SMALL',500,'Untuk PAUD Melati'),
('bb000001-0000-0000-0000-000000000075','aa000001-0000-0000-0000-000000000019','f0000001-0000-0000-0000-000000000003','BALITA',300,'Untuk Posyandu Mawar'),
('bb000001-0000-0000-0000-000000000076','aa000001-0000-0000-0000-000000000019','f0000001-0000-0000-0000-000000000004','BUMIL_BUSUI',200,'Untuk Panti Asuhan Harapan'),
('bb000001-0000-0000-0000-000000000077','aa000001-0000-0000-0000-000000000020','f0000001-0000-0000-0000-000000000001','PORTION_LARGE',1010,'Untuk SDN 01 Jagakarsa'),
('bb000001-0000-0000-0000-000000000078','aa000001-0000-0000-0000-000000000020','f0000001-0000-0000-0000-000000000002','PORTION_SMALL',510,'Untuk PAUD Melati'),
('bb000001-0000-0000-0000-000000000079','aa000001-0000-0000-0000-000000000020','f0000001-0000-0000-0000-000000000003','BALITA',310,'Untuk Posyandu Mawar'),
('bb000001-0000-0000-0000-000000000080','aa000001-0000-0000-0000-000000000020','f0000001-0000-0000-0000-000000000004','BUMIL_BUSUI',210,'Untuk Panti Asuhan Harapan');

-- ============= DELIVERY ASSIGNMENTS (20 penugasan driver) =============
INSERT INTO public.delivery_assignments (id, plan_id, driver_id, status, started_at, completed_at) VALUES
('cc000001-0000-0000-0000-000000000001','aa000001-0000-0000-0000-000000000001','a0000001-0000-0000-0000-000000000008','COMPLETED','2026-08-24T06:00:00Z','2026-08-24T10:00:00Z'),
('cc000001-0000-0000-0000-000000000002','aa000001-0000-0000-0000-000000000002','a0000001-0000-0000-0000-000000000009','COMPLETED','2026-08-25T06:00:00Z','2026-08-25T10:00:00Z'),
('cc000001-0000-0000-0000-000000000003','aa000001-0000-0000-0000-000000000003','a0000001-0000-0000-0000-000000000008','COMPLETED','2026-08-26T06:00:00Z','2026-08-26T10:00:00Z'),
('cc000001-0000-0000-0000-000000000004','aa000001-0000-0000-0000-000000000004','a0000001-0000-0000-0000-000000000009','COMPLETED','2026-08-27T06:00:00Z','2026-08-27T10:00:00Z'),
('cc000001-0000-0000-0000-000000000005','aa000001-0000-0000-0000-000000000005','a0000001-0000-0000-0000-000000000008','COMPLETED','2026-08-28T06:00:00Z','2026-08-28T10:00:00Z'),
('cc000001-0000-0000-0000-000000000006','aa000001-0000-0000-0000-000000000006','a0000001-0000-0000-0000-000000000009','COMPLETED','2026-08-31T06:00:00Z','2026-08-31T10:00:00Z'),
('cc000001-0000-0000-0000-000000000007','aa000001-0000-0000-0000-000000000007','a0000001-0000-0000-0000-000000000008','COMPLETED','2026-09-01T06:00:00Z','2026-09-01T10:00:00Z'),
('cc000001-0000-0000-0000-000000000008','aa000001-0000-0000-0000-000000000008','a0000001-0000-0000-0000-000000000009','COMPLETED','2026-09-02T06:00:00Z','2026-09-02T10:00:00Z'),
('cc000001-0000-0000-0000-000000000009','aa000001-0000-0000-0000-000000000009','a0000001-0000-0000-0000-000000000008','COMPLETED','2026-09-03T06:00:00Z','2026-09-03T10:00:00Z'),
('cc000001-0000-0000-0000-000000000010','aa000001-0000-0000-0000-000000000010','a0000001-0000-0000-0000-000000000009','COMPLETED','2026-09-04T06:00:00Z','2026-09-04T10:00:00Z'),
('cc000001-0000-0000-0000-000000000011','aa000001-0000-0000-0000-000000000011','a0000001-0000-0000-0000-000000000008','COMPLETED','2026-09-07T06:00:00Z','2026-09-07T10:00:00Z'),
('cc000001-0000-0000-0000-000000000012','aa000001-0000-0000-0000-000000000012','a0000001-0000-0000-0000-000000000009','COMPLETED','2026-09-08T06:00:00Z','2026-09-08T10:00:00Z'),
('cc000001-0000-0000-0000-000000000013','aa000001-0000-0000-0000-000000000013','a0000001-0000-0000-0000-000000000008','COMPLETED','2026-09-09T06:00:00Z','2026-09-09T10:00:00Z'),
('cc000001-0000-0000-0000-000000000014','aa000001-0000-0000-0000-000000000014','a0000001-0000-0000-0000-000000000009','IN_TRANSIT','2026-09-10T06:00:00Z',NULL),
('cc000001-0000-0000-0000-000000000015','aa000001-0000-0000-0000-000000000015','a0000001-0000-0000-0000-000000000008','IN_TRANSIT','2026-09-11T06:00:00Z',NULL),
('cc000001-0000-0000-0000-000000000016','aa000001-0000-0000-0000-000000000016','a0000001-0000-0000-0000-000000000009','PENDING',NULL,NULL),
('cc000001-0000-0000-0000-000000000017','aa000001-0000-0000-0000-000000000017','a0000001-0000-0000-0000-000000000008','PENDING',NULL,NULL),
('cc000001-0000-0000-0000-000000000018','aa000001-0000-0000-0000-000000000018','a0000001-0000-0000-0000-000000000009','PENDING',NULL,NULL),
('cc000001-0000-0000-0000-000000000019','aa000001-0000-0000-0000-000000000019','a0000001-0000-0000-0000-000000000008','PENDING',NULL,NULL),
('cc000001-0000-0000-0000-000000000020','aa000001-0000-0000-0000-000000000020','a0000001-0000-0000-0000-000000000009','PENDING',NULL,NULL);

-- ============= DELIVERY LOGS (catatan pengiriman) =============
INSERT INTO public.delivery_logs (id, assignment_id, destination_id, status, notes) VALUES
('dd000001-0000-0000-0000-000000000001','cc000001-0000-0000-0000-000000000001','f0000001-0000-0000-0000-000000000001','DELIVERED','DELIVERED ke SDN 01 Jagakarsa'),
('dd000001-0000-0000-0000-000000000002','cc000001-0000-0000-0000-000000000001','f0000001-0000-0000-0000-000000000002','DELIVERED','DELIVERED ke PAUD Melati'),
('dd000001-0000-0000-0000-000000000003','cc000001-0000-0000-0000-000000000001','f0000001-0000-0000-0000-000000000003','DELIVERED','DELIVERED ke Posyandu Mawar'),
('dd000001-0000-0000-0000-000000000004','cc000001-0000-0000-0000-000000000001','f0000001-0000-0000-0000-000000000004','DELIVERED','DELIVERED ke Panti Asuhan Harapan'),
('dd000001-0000-0000-0000-000000000005','cc000001-0000-0000-0000-000000000002','f0000001-0000-0000-0000-000000000001','DELIVERED','DELIVERED ke SDN 01 Jagakarsa'),
('dd000001-0000-0000-0000-000000000006','cc000001-0000-0000-0000-000000000002','f0000001-0000-0000-0000-000000000002','DELIVERED','DELIVERED ke PAUD Melati'),
('dd000001-0000-0000-0000-000000000007','cc000001-0000-0000-0000-000000000002','f0000001-0000-0000-0000-000000000003','DELIVERED','DELIVERED ke Posyandu Mawar'),
('dd000001-0000-0000-0000-000000000008','cc000001-0000-0000-0000-000000000002','f0000001-0000-0000-0000-000000000004','DELIVERED','DELIVERED ke Panti Asuhan Harapan'),
('dd000001-0000-0000-0000-000000000009','cc000001-0000-0000-0000-000000000003','f0000001-0000-0000-0000-000000000001','DELIVERED','DELIVERED ke SDN 01 Jagakarsa'),
('dd000001-0000-0000-0000-000000000010','cc000001-0000-0000-0000-000000000003','f0000001-0000-0000-0000-000000000002','DELIVERED','DELIVERED ke PAUD Melati'),
('dd000001-0000-0000-0000-000000000011','cc000001-0000-0000-0000-000000000003','f0000001-0000-0000-0000-000000000003','DELIVERED','DELIVERED ke Posyandu Mawar'),
('dd000001-0000-0000-0000-000000000012','cc000001-0000-0000-0000-000000000003','f0000001-0000-0000-0000-000000000004','DELIVERED','DELIVERED ke Panti Asuhan Harapan'),
('dd000001-0000-0000-0000-000000000013','cc000001-0000-0000-0000-000000000004','f0000001-0000-0000-0000-000000000001','DELIVERED','DELIVERED ke SDN 01 Jagakarsa'),
('dd000001-0000-0000-0000-000000000014','cc000001-0000-0000-0000-000000000004','f0000001-0000-0000-0000-000000000002','DELIVERED','DELIVERED ke PAUD Melati'),
('dd000001-0000-0000-0000-000000000015','cc000001-0000-0000-0000-000000000004','f0000001-0000-0000-0000-000000000003','DELIVERED','DELIVERED ke Posyandu Mawar'),
('dd000001-0000-0000-0000-000000000016','cc000001-0000-0000-0000-000000000004','f0000001-0000-0000-0000-000000000004','DELIVERED','DELIVERED ke Panti Asuhan Harapan'),
('dd000001-0000-0000-0000-000000000017','cc000001-0000-0000-0000-000000000005','f0000001-0000-0000-0000-000000000001','DELIVERED','DELIVERED ke SDN 01 Jagakarsa'),
('dd000001-0000-0000-0000-000000000018','cc000001-0000-0000-0000-000000000005','f0000001-0000-0000-0000-000000000002','DELIVERED','DELIVERED ke PAUD Melati'),
('dd000001-0000-0000-0000-000000000019','cc000001-0000-0000-0000-000000000005','f0000001-0000-0000-0000-000000000003','DELIVERED','DELIVERED ke Posyandu Mawar'),
('dd000001-0000-0000-0000-000000000020','cc000001-0000-0000-0000-000000000005','f0000001-0000-0000-0000-000000000004','DELIVERED','DELIVERED ke Panti Asuhan Harapan'),
('dd000001-0000-0000-0000-000000000021','cc000001-0000-0000-0000-000000000006','f0000001-0000-0000-0000-000000000001','DELIVERED','DELIVERED ke SDN 01 Jagakarsa'),
('dd000001-0000-0000-0000-000000000022','cc000001-0000-0000-0000-000000000006','f0000001-0000-0000-0000-000000000002','DELIVERED','DELIVERED ke PAUD Melati'),
('dd000001-0000-0000-0000-000000000023','cc000001-0000-0000-0000-000000000006','f0000001-0000-0000-0000-000000000003','DELIVERED','DELIVERED ke Posyandu Mawar'),
('dd000001-0000-0000-0000-000000000024','cc000001-0000-0000-0000-000000000006','f0000001-0000-0000-0000-000000000004','DELIVERED','DELIVERED ke Panti Asuhan Harapan'),
('dd000001-0000-0000-0000-000000000025','cc000001-0000-0000-0000-000000000007','f0000001-0000-0000-0000-000000000001','DELIVERED','DELIVERED ke SDN 01 Jagakarsa'),
('dd000001-0000-0000-0000-000000000026','cc000001-0000-0000-0000-000000000007','f0000001-0000-0000-0000-000000000002','DELIVERED','DELIVERED ke PAUD Melati'),
('dd000001-0000-0000-0000-000000000027','cc000001-0000-0000-0000-000000000007','f0000001-0000-0000-0000-000000000003','DELIVERED','DELIVERED ke Posyandu Mawar'),
('dd000001-0000-0000-0000-000000000028','cc000001-0000-0000-0000-000000000007','f0000001-0000-0000-0000-000000000004','DELIVERED','DELIVERED ke Panti Asuhan Harapan'),
('dd000001-0000-0000-0000-000000000029','cc000001-0000-0000-0000-000000000008','f0000001-0000-0000-0000-000000000001','DELIVERED','DELIVERED ke SDN 01 Jagakarsa'),
('dd000001-0000-0000-0000-000000000030','cc000001-0000-0000-0000-000000000008','f0000001-0000-0000-0000-000000000002','DELIVERED','DELIVERED ke PAUD Melati'),
('dd000001-0000-0000-0000-000000000031','cc000001-0000-0000-0000-000000000008','f0000001-0000-0000-0000-000000000003','DELIVERED','DELIVERED ke Posyandu Mawar'),
('dd000001-0000-0000-0000-000000000032','cc000001-0000-0000-0000-000000000008','f0000001-0000-0000-0000-000000000004','DELIVERED','DELIVERED ke Panti Asuhan Harapan'),
('dd000001-0000-0000-0000-000000000033','cc000001-0000-0000-0000-000000000009','f0000001-0000-0000-0000-000000000001','DELIVERED','DELIVERED ke SDN 01 Jagakarsa'),
('dd000001-0000-0000-0000-000000000034','cc000001-0000-0000-0000-000000000009','f0000001-0000-0000-0000-000000000002','DELIVERED','DELIVERED ke PAUD Melati'),
('dd000001-0000-0000-0000-000000000035','cc000001-0000-0000-0000-000000000009','f0000001-0000-0000-0000-000000000003','DELIVERED','DELIVERED ke Posyandu Mawar'),
('dd000001-0000-0000-0000-000000000036','cc000001-0000-0000-0000-000000000009','f0000001-0000-0000-0000-000000000004','DELIVERED','DELIVERED ke Panti Asuhan Harapan'),
('dd000001-0000-0000-0000-000000000037','cc000001-0000-0000-0000-000000000010','f0000001-0000-0000-0000-000000000001','DELIVERED','DELIVERED ke SDN 01 Jagakarsa'),
('dd000001-0000-0000-0000-000000000038','cc000001-0000-0000-0000-000000000010','f0000001-0000-0000-0000-000000000002','DELIVERED','DELIVERED ke PAUD Melati'),
('dd000001-0000-0000-0000-000000000039','cc000001-0000-0000-0000-000000000010','f0000001-0000-0000-0000-000000000003','DELIVERED','DELIVERED ke Posyandu Mawar'),
('dd000001-0000-0000-0000-000000000040','cc000001-0000-0000-0000-000000000010','f0000001-0000-0000-0000-000000000004','DELIVERED','DELIVERED ke Panti Asuhan Harapan'),
('dd000001-0000-0000-0000-000000000041','cc000001-0000-0000-0000-000000000011','f0000001-0000-0000-0000-000000000001','DELIVERED','DELIVERED ke SDN 01 Jagakarsa'),
('dd000001-0000-0000-0000-000000000042','cc000001-0000-0000-0000-000000000011','f0000001-0000-0000-0000-000000000002','DELIVERED','DELIVERED ke PAUD Melati'),
('dd000001-0000-0000-0000-000000000043','cc000001-0000-0000-0000-000000000011','f0000001-0000-0000-0000-000000000003','DELIVERED','DELIVERED ke Posyandu Mawar'),
('dd000001-0000-0000-0000-000000000044','cc000001-0000-0000-0000-000000000011','f0000001-0000-0000-0000-000000000004','DELIVERED','DELIVERED ke Panti Asuhan Harapan'),
('dd000001-0000-0000-0000-000000000045','cc000001-0000-0000-0000-000000000012','f0000001-0000-0000-0000-000000000001','DELIVERED','DELIVERED ke SDN 01 Jagakarsa'),
('dd000001-0000-0000-0000-000000000046','cc000001-0000-0000-0000-000000000012','f0000001-0000-0000-0000-000000000002','DELIVERED','DELIVERED ke PAUD Melati'),
('dd000001-0000-0000-0000-000000000047','cc000001-0000-0000-0000-000000000012','f0000001-0000-0000-0000-000000000003','DELIVERED','DELIVERED ke Posyandu Mawar'),
('dd000001-0000-0000-0000-000000000048','cc000001-0000-0000-0000-000000000012','f0000001-0000-0000-0000-000000000004','DELIVERED','DELIVERED ke Panti Asuhan Harapan'),
('dd000001-0000-0000-0000-000000000049','cc000001-0000-0000-0000-000000000013','f0000001-0000-0000-0000-000000000001','DELIVERED','DELIVERED ke SDN 01 Jagakarsa'),
('dd000001-0000-0000-0000-000000000050','cc000001-0000-0000-0000-000000000013','f0000001-0000-0000-0000-000000000002','DELIVERED','DELIVERED ke PAUD Melati'),
('dd000001-0000-0000-0000-000000000051','cc000001-0000-0000-0000-000000000013','f0000001-0000-0000-0000-000000000003','DELIVERED','DELIVERED ke Posyandu Mawar'),
('dd000001-0000-0000-0000-000000000052','cc000001-0000-0000-0000-000000000013','f0000001-0000-0000-0000-000000000004','DELIVERED','DELIVERED ke Panti Asuhan Harapan'),
('dd000001-0000-0000-0000-000000000053','cc000001-0000-0000-0000-000000000014','f0000001-0000-0000-0000-000000000001','IN_TRANSIT','IN_TRANSIT ke SDN 01 Jagakarsa'),
('dd000001-0000-0000-0000-000000000054','cc000001-0000-0000-0000-000000000014','f0000001-0000-0000-0000-000000000002','IN_TRANSIT','IN_TRANSIT ke PAUD Melati'),
('dd000001-0000-0000-0000-000000000055','cc000001-0000-0000-0000-000000000014','f0000001-0000-0000-0000-000000000003','IN_TRANSIT','IN_TRANSIT ke Posyandu Mawar'),
('dd000001-0000-0000-0000-000000000056','cc000001-0000-0000-0000-000000000014','f0000001-0000-0000-0000-000000000004','IN_TRANSIT','IN_TRANSIT ke Panti Asuhan Harapan'),
('dd000001-0000-0000-0000-000000000057','cc000001-0000-0000-0000-000000000015','f0000001-0000-0000-0000-000000000001','IN_TRANSIT','IN_TRANSIT ke SDN 01 Jagakarsa'),
('dd000001-0000-0000-0000-000000000058','cc000001-0000-0000-0000-000000000015','f0000001-0000-0000-0000-000000000002','IN_TRANSIT','IN_TRANSIT ke PAUD Melati'),
('dd000001-0000-0000-0000-000000000059','cc000001-0000-0000-0000-000000000015','f0000001-0000-0000-0000-000000000003','IN_TRANSIT','IN_TRANSIT ke Posyandu Mawar'),
('dd000001-0000-0000-0000-000000000060','cc000001-0000-0000-0000-000000000015','f0000001-0000-0000-0000-000000000004','IN_TRANSIT','IN_TRANSIT ke Panti Asuhan Harapan');

-- ============= BIWEEKLY PERIODS (4 periode) =============
INSERT INTO public.biweekly_periods (id, period_name, start_date, end_date) VALUES
('a4000001-0000-0000-0000-000000000001','Periode 1 - Agustus 2026','2026-08-01','2026-08-15'),
('a4000001-0000-0000-0000-000000000002','Periode 2 - Agustus 2026','2026-08-16','2026-08-31'),
('a4000001-0000-0000-0000-000000000003','Periode 1 - September 2026','2026-09-01','2026-09-15'),
('a4000001-0000-0000-0000-000000000004','Periode 2 - September 2026','2026-09-16','2026-09-30');

-- ============= ITEM OPENING BALANCES =============
INSERT INTO public.item_opening_balances (item_code, period_id, opening_quantity, opening_value) VALUES
('a2000001-0000-0000-0000-000000000001','BB-001-001','a4000001-0000-0000-0000-000000000001',20,300000),
('a2000001-0000-0000-0000-000000000002','BB-001-002','a4000001-0000-0000-0000-000000000001',15,180000),
('a2000001-0000-0000-0000-000000000003','BB-002-001','a4000001-0000-0000-0000-000000000001',25,2125000),
('a2000001-0000-0000-0000-000000000004','BB-002-002','a4000001-0000-0000-0000-000000000001',15,975000),
('a2000001-0000-0000-0000-000000000005','BB-002-003','a4000001-0000-0000-0000-000000000001',40,1120000),
('a2000001-0000-0000-0000-000000000006','BB-003-001','a4000001-0000-0000-0000-000000000001',80,1120000),
('a2000001-0000-0000-0000-000000000007','BB-001-001','a4000001-0000-0000-0000-000000000002',20,300000),
('a2000001-0000-0000-0000-000000000008','BB-001-002','a4000001-0000-0000-0000-000000000002',15,180000),
('a2000001-0000-0000-0000-000000000009','BB-002-001','a4000001-0000-0000-0000-000000000002',25,2125000),
('a2000001-0000-0000-0000-000000000010','BB-002-002','a4000001-0000-0000-0000-000000000002',15,975000),
('a2000001-0000-0000-0000-000000000011','BB-002-003','a4000001-0000-0000-0000-000000000002',40,1120000),
('a2000001-0000-0000-0000-000000000012','BB-003-001','a4000001-0000-0000-0000-000000000002',80,1120000),
('a2000001-0000-0000-0000-000000000013','BB-001-001','a4000001-0000-0000-0000-000000000003',20,300000),
('a2000001-0000-0000-0000-000000000014','BB-001-002','a4000001-0000-0000-0000-000000000003',15,180000),
('a2000001-0000-0000-0000-000000000015','BB-002-001','a4000001-0000-0000-0000-000000000003',25,2125000),
('a2000001-0000-0000-0000-000000000016','BB-002-002','a4000001-0000-0000-0000-000000000003',15,975000),
('a2000001-0000-0000-0000-000000000017','BB-002-003','a4000001-0000-0000-0000-000000000003',40,1120000),
('a2000001-0000-0000-0000-000000000018','BB-003-001','a4000001-0000-0000-0000-000000000003',80,1120000),
('a2000001-0000-0000-0000-000000000019','BB-001-001','a4000001-0000-0000-0000-000000000004',20,300000),
('a2000001-0000-0000-0000-000000000020','BB-001-002','a4000001-0000-0000-0000-000000000004',15,180000),
('a2000001-0000-0000-0000-000000000021','BB-002-001','a4000001-0000-0000-0000-000000000004',25,2125000),
('a2000001-0000-0000-0000-000000000022','BB-002-002','a4000001-0000-0000-0000-000000000004',15,975000),
('a2000001-0000-0000-0000-000000000023','BB-002-003','a4000001-0000-0000-0000-000000000004',40,1120000),
('a2000001-0000-0000-0000-000000000024','BB-003-001','a4000001-0000-0000-0000-000000000004',80,1120000);

-- ============= PURCHASES (40 pembelian) =============
INSERT INTO public.purchases (id, category, description, amount_idr, receipt_total_idr, supplier, purchased_at, created_by, created_by_name, verified, verified_by, verified_at, verification_note) VALUES
('ae000001-0000-0000-0000-000000000001','Beras 100kg','Bahan Baku',2800000,2850000,'Toko Sembako Jaya','2026-08-24','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-08-24T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000002','Ayam Fillet 30kg','Bahan Baku',2550000,2600000,'Pasar Induk','2026-08-24','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-08-24T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000003','Sayuran Mix 20kg','Bahan Baku',850000,870000,'Supplier Sayur Segar','2026-08-25','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-08-25T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000004','Telur 50kg','Bahan Baku',1400000,1420000,'UD Beras Makmur','2026-08-25','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-08-25T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000005','Ikan Tongkol 20kg','Bahan Baku',1300000,1320000,'Toko蛋白源','2026-08-26','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-08-26T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000006','Tahu Tempe 15kg','Bahan Baku',450000,460000,'Grosir Bumbu Murah','2026-08-26','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-08-26T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000007','Bumbu Dapur','Bahan Baku',380000,390000,'Toko Sembako Jaya','2026-08-27','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-08-27T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000008','Minyak Goreng 10L','Bahan Baku',180000,185000,'Pasar Induk','2026-08-27','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-08-27T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000009','Gas LPG 3kg x5','Operasional',175000,180000,'Supplier Sayur Segar','2026-08-28','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-08-28T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000010','Air Mineral Galon','Operasional',120000,125000,'UD Beras Makmur','2026-08-28','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-08-28T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000011','Sabun Cuci Piring','Operasional',45000,48000,'Toko蛋白源','2026-08-31','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-08-31T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000012','Sarung Tangan','Operasional',35000,36000,'Grosir Bumbu Murah','2026-08-31','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-08-31T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000013','Beras 100kg','Bahan Baku',2800000,2850000,'Toko Sembako Jaya','2026-09-01','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-09-01T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000014','Ayam Fillet 30kg','Bahan Baku',2550000,2600000,'Pasar Induk','2026-09-01','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-09-01T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000015','Sayuran Mix 20kg','Bahan Baku',850000,870000,'Supplier Sayur Segar','2026-09-02','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-09-02T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000016','Telur 50kg','Bahan Baku',1400000,1420000,'UD Beras Makmur','2026-09-02','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-09-02T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000017','Ikan Tongkol 20kg','Bahan Baku',1300000,1320000,'Toko蛋白源','2026-09-03','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-09-03T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000018','Tahu Tempe 15kg','Bahan Baku',450000,460000,'Grosir Bumbu Murah','2026-09-03','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-09-03T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000019','Bumbu Dapur','Bahan Baku',380000,390000,'Toko Sembako Jaya','2026-09-04','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-09-04T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000020','Minyak Goreng 10L','Bahan Baku',180000,185000,'Pasar Induk','2026-09-04','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-09-04T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000021','Gas LPG 3kg x5','Operasional',175000,180000,'Supplier Sayur Segar','2026-09-07','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-09-07T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000022','Air Mineral Galon','Operasional',120000,125000,'UD Beras Makmur','2026-09-07','a0000001-0000-0000-0000-000000000006','Sari Asisten',false,NULL,NULL,NULL),
('ae000001-0000-0000-0000-000000000023','Sabun Cuci Piring','Operasional',45000,48000,'Toko蛋白源','2026-09-08','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-09-08T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000024','Sarung Tangan','Operasional',35000,36000,'Grosir Bumbu Murah','2026-09-08','a0000001-0000-0000-0000-000000000006','Sari Asisten',false,NULL,NULL,NULL),
('ae000001-0000-0000-0000-000000000025','Beras 100kg','Bahan Baku',2800000,2850000,'Toko Sembako Jaya','2026-09-09','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-09-09T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000026','Ayam Fillet 30kg','Bahan Baku',2550000,2600000,'Pasar Induk','2026-09-09','a0000001-0000-0000-0000-000000000006','Sari Asisten',false,NULL,NULL,NULL),
('ae000001-0000-0000-0000-000000000027','Sayuran Mix 20kg','Bahan Baku',850000,870000,'Supplier Sayur Segar','2026-09-10','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-09-10T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000028','Telur 50kg','Bahan Baku',1400000,1420000,'UD Beras Makmur','2026-09-10','a0000001-0000-0000-0000-000000000006','Sari Asisten',false,NULL,NULL,NULL),
('ae000001-0000-0000-0000-000000000029','Ikan Tongkol 20kg','Bahan Baku',1300000,1320000,'Toko蛋白源','2026-09-11','a0000001-0000-0000-0000-000000000006','Sari Asisten',true,'a0000001-0000-0000-0000-000000000003','2026-09-11T14:00:00Z','Sesuai'),
('ae000001-0000-0000-0000-000000000030','Tahu Tempe 15kg','Bahan Baku',450000,460000,'Grosir Bumbu Murah','2026-09-11','a0000001-0000-0000-0000-000000000006','Sari Asisten',false,NULL,NULL,NULL),
('ae000001-0000-0000-0000-000000000031','Bumbu Dapur','Bahan Baku',380000,390000,'Toko Sembako Jaya','2026-09-14','a0000001-0000-0000-0000-000000000006','Sari Asisten',false,NULL,NULL,NULL),
('ae000001-0000-0000-0000-000000000032','Minyak Goreng 10L','Bahan Baku',180000,185000,'Pasar Induk','2026-09-14','a0000001-0000-0000-0000-000000000006','Sari Asisten',false,NULL,NULL,NULL),
('ae000001-0000-0000-0000-000000000033','Gas LPG 3kg x5','Operasional',175000,180000,'Supplier Sayur Segar','2026-09-15','a0000001-0000-0000-0000-000000000006','Sari Asisten',false,NULL,NULL,NULL),
('ae000001-0000-0000-0000-000000000034','Air Mineral Galon','Operasional',120000,125000,'UD Beras Makmur','2026-09-15','a0000001-0000-0000-0000-000000000006','Sari Asisten',false,NULL,NULL,NULL),
('ae000001-0000-0000-0000-000000000035','Sabun Cuci Piring','Operasional',45000,48000,'Toko蛋白源','2026-09-16','a0000001-0000-0000-0000-000000000006','Sari Asisten',false,NULL,NULL,NULL),
('ae000001-0000-0000-0000-000000000036','Sarung Tangan','Operasional',35000,36000,'Grosir Bumbu Murah','2026-09-16','a0000001-0000-0000-0000-000000000006','Sari Asisten',false,NULL,NULL,NULL),
('ae000001-0000-0000-0000-000000000037','Beras 100kg','Bahan Baku',2800000,2850000,'Toko Sembako Jaya','2026-09-17','a0000001-0000-0000-0000-000000000006','Sari Asisten',false,NULL,NULL,NULL),
('ae000001-0000-0000-0000-000000000038','Ayam Fillet 30kg','Bahan Baku',2550000,2600000,'Pasar Induk','2026-09-17','a0000001-0000-0000-0000-000000000006','Sari Asisten',false,NULL,NULL,NULL),
('ae000001-0000-0000-0000-000000000039','Sayuran Mix 20kg','Bahan Baku',850000,870000,'Supplier Sayur Segar','2026-09-18','a0000001-0000-0000-0000-000000000006','Sari Asisten',false,NULL,NULL,NULL),
('ae000001-0000-0000-0000-000000000040','Telur 50kg','Bahan Baku',1400000,1420000,'UD Beras Makmur','2026-09-18','a0000001-0000-0000-0000-000000000006','Sari Asisten',false,NULL,NULL,NULL);

-- ============= ANGGARAN (20 anggaran harian) =============
INSERT INTO public.anggaran (id, plan_date, total_portions, price_per_portion, rab, actual, notes, created_by) VALUES
('af000001-0000-0000-0000-000000000001','2026-08-24',2500,22000,55000000,42899999,'Anggaran 2026-08-24','a0000001-0000-0000-0000-000000000003'),
('af000001-0000-0000-0000-000000000002','2026-08-25',2500,22000,55000000,47300000,'Anggaran 2026-08-25','a0000001-0000-0000-0000-000000000003'),
('af000001-0000-0000-0000-000000000003','2026-08-26',2500,22000,55000000,51700000,'Anggaran 2026-08-26','a0000001-0000-0000-0000-000000000003'),
('af000001-0000-0000-0000-000000000004','2026-08-27',2500,22000,55000000,38500000,'Anggaran 2026-08-27','a0000001-0000-0000-0000-000000000003'),
('af000001-0000-0000-0000-000000000005','2026-08-28',2500,22000,55000000,42899999,'Anggaran 2026-08-28','a0000001-0000-0000-0000-000000000003'),
('af000001-0000-0000-0000-000000000006','2026-08-31',2500,22000,55000000,47300000,'Anggaran 2026-08-31','a0000001-0000-0000-0000-000000000003'),
('af000001-0000-0000-0000-000000000007','2026-09-01',2500,22000,55000000,51700000,'Anggaran 2026-09-01','a0000001-0000-0000-0000-000000000003'),
('af000001-0000-0000-0000-000000000008','2026-09-02',2500,22000,55000000,38500000,'Anggaran 2026-09-02','a0000001-0000-0000-0000-000000000003'),
('af000001-0000-0000-0000-000000000009','2026-09-03',2500,22000,55000000,42899999,'Anggaran 2026-09-03','a0000001-0000-0000-0000-000000000003'),
('af000001-0000-0000-0000-000000000010','2026-09-04',2500,22000,55000000,47300000,'Anggaran 2026-09-04','a0000001-0000-0000-0000-000000000003'),
('af000001-0000-0000-0000-000000000011','2026-09-07',2500,22000,55000000,51700000,'Anggaran 2026-09-07','a0000001-0000-0000-0000-000000000003'),
('af000001-0000-0000-0000-000000000012','2026-09-08',2500,22000,55000000,38500000,'Anggaran 2026-09-08','a0000001-0000-0000-0000-000000000003'),
('af000001-0000-0000-0000-000000000013','2026-09-09',2500,22000,55000000,42899999,'Anggaran 2026-09-09','a0000001-0000-0000-0000-000000000003'),
('af000001-0000-0000-0000-000000000014','2026-09-10',2500,22000,55000000,47300000,'Anggaran 2026-09-10','a0000001-0000-0000-0000-000000000003'),
('af000001-0000-0000-0000-000000000015','2026-09-11',2500,22000,55000000,51700000,'Anggaran 2026-09-11','a0000001-0000-0000-0000-000000000003'),
('af000001-0000-0000-0000-000000000016','2026-09-14',2500,22000,55000000,38500000,'Anggaran 2026-09-14','a0000001-0000-0000-0000-000000000003'),
('af000001-0000-0000-0000-000000000017','2026-09-15',2500,22000,55000000,42899999,'Anggaran 2026-09-15','a0000001-0000-0000-0000-000000000003'),
('af000001-0000-0000-0000-000000000018','2026-09-16',2500,22000,55000000,47300000,'Anggaran 2026-09-16','a0000001-0000-0000-0000-000000000003'),
('af000001-0000-0000-0000-000000000019','2026-09-17',2500,22000,55000000,51700000,'Anggaran 2026-09-17','a0000001-0000-0000-0000-000000000003'),
('af000001-0000-0000-0000-000000000020','2026-09-18',2500,22000,55000000,38500000,'Anggaran 2026-09-18','a0000001-0000-0000-0000-000000000003');

-- ============= ANGGARAN PERIODS (20 detail anggaran) =============
INSERT INTO public.anggaran_periods (period_id, plan_date, bahan_balita, bahan_paud_tk_ra, bahan_sd_1_3, bahan_sd_4_6, bahan_smp_mts, bahan_sma_ma_smk, bahan_slb, bahan_santri, bahan_pend_tk, bahan_bumil, bahan_busui, harga_satuan1, harga_satuan2, bahan_rab, bahan_actual, ops_jumlah_paket, ops_harga_satuan, ops_rab, ops_actual, notes, created_by) VALUES
('Periode 2 - Agustus 2026','2026-08-24',30,50,80,40,30,20,10,10,10,15,15,8000,10000,55000000,42899999,2500,22000,55000000,42899999,'Detail anggaran 2026-08-24','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-08-25',30,50,80,40,30,20,10,10,10,15,15,8000,10000,55000000,47300000,2500,22000,55000000,47300000,'Detail anggaran 2026-08-25','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-08-26',30,50,80,40,30,20,10,10,10,15,15,8000,10000,55000000,51700000,2500,22000,55000000,51700000,'Detail anggaran 2026-08-26','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-08-27',30,50,80,40,30,20,10,10,10,15,15,8000,10000,55000000,38500000,2500,22000,55000000,38500000,'Detail anggaran 2026-08-27','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-08-28',30,50,80,40,30,20,10,10,10,15,15,8000,10000,55000000,42899999,2500,22000,55000000,42899999,'Detail anggaran 2026-08-28','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-08-31',30,50,80,40,30,20,10,10,10,15,15,8000,10000,55000000,47300000,2500,22000,55000000,47300000,'Detail anggaran 2026-08-31','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-09-01',30,50,80,40,30,20,10,10,10,15,15,8000,10000,55000000,51700000,2500,22000,55000000,51700000,'Detail anggaran 2026-09-01','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-09-02',30,50,80,40,30,20,10,10,10,15,15,8000,10000,55000000,38500000,2500,22000,55000000,38500000,'Detail anggaran 2026-09-02','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-09-03',30,50,80,40,30,20,10,10,10,15,15,8000,10000,55000000,42899999,2500,22000,55000000,42899999,'Detail anggaran 2026-09-03','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-09-04',30,50,80,40,30,20,10,10,10,15,15,8000,10000,55000000,47300000,2500,22000,55000000,47300000,'Detail anggaran 2026-09-04','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-07',30,50,80,40,30,20,10,10,10,15,15,8000,10000,55000000,51700000,2500,22000,55000000,51700000,'Detail anggaran 2026-09-07','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-08',30,50,80,40,30,20,10,10,10,15,15,8000,10000,55000000,38500000,2500,22000,55000000,38500000,'Detail anggaran 2026-09-08','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-09',30,50,80,40,30,20,10,10,10,15,15,8000,10000,55000000,42899999,2500,22000,55000000,42899999,'Detail anggaran 2026-09-09','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-10',30,50,80,40,30,20,10,10,10,15,15,8000,10000,55000000,47300000,2500,22000,55000000,47300000,'Detail anggaran 2026-09-10','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-11',30,50,80,40,30,20,10,10,10,15,15,8000,10000,55000000,51700000,2500,22000,55000000,51700000,'Detail anggaran 2026-09-11','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-14',30,50,80,40,30,20,10,10,10,15,15,8000,10000,55000000,38500000,2500,22000,55000000,38500000,'Detail anggaran 2026-09-14','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-15',30,50,80,40,30,20,10,10,10,15,15,8000,10000,55000000,42899999,2500,22000,55000000,42899999,'Detail anggaran 2026-09-15','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-16',30,50,80,40,30,20,10,10,10,15,15,8000,10000,55000000,47300000,2500,22000,55000000,47300000,'Detail anggaran 2026-09-16','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-17',30,50,80,40,30,20,10,10,10,15,15,8000,10000,55000000,51700000,2500,22000,55000000,51700000,'Detail anggaran 2026-09-17','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-18',30,50,80,40,30,20,10,10,10,15,15,8000,10000,55000000,38500000,2500,22000,55000000,38500000,'Detail anggaran 2026-09-18','a0000001-0000-0000-0000-000000000003');

-- ============= TRANSAKSIS (60 transaksi BKU) =============
INSERT INTO public.transaksis (period_id, transaction_date, account_code, description, debit, credit, source_table, source_id, buku_pembantu, created_by) VALUES
('Periode 2 - Agustus 2026','2026-08-24','1100','Kas Masuk Operasional',0,5500000,NULL,NULL,'Modal Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-08-24','5100','Pembelian Bahan Baku',2800000,0,'purchases','ae000001-0000-0000-0000-000000000001','Belanja Bahan Baku','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-08-24','5200','Belanja Operasional',175000,0,'purchases','ae000001-0000-0000-0000-000000000002','Belanja Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-08-25','1100','Kas Masuk Operasional',0,5500000,NULL,NULL,'Modal Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-08-25','5100','Pembelian Bahan Baku',2900000,0,'purchases','ae000001-0000-0000-0000-000000000003','Belanja Bahan Baku','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-08-25','5200','Belanja Operasional',190000,0,'purchases','ae000001-0000-0000-0000-000000000004','Belanja Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-08-26','1100','Kas Masuk Operasional',0,5500000,NULL,NULL,'Modal Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-08-26','5100','Pembelian Bahan Baku',3000000,0,'purchases','ae000001-0000-0000-0000-000000000005','Belanja Bahan Baku','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-08-26','5200','Belanja Operasional',205000,0,'purchases','ae000001-0000-0000-0000-000000000006','Belanja Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-08-27','1100','Kas Masuk Operasional',0,5500000,NULL,NULL,'Modal Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-08-27','5100','Pembelian Bahan Baku',3100000,0,'purchases','ae000001-0000-0000-0000-000000000007','Belanja Bahan Baku','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-08-27','5200','Belanja Operasional',220000,0,'purchases','ae000001-0000-0000-0000-000000000008','Belanja Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-08-28','1100','Kas Masuk Operasional',0,5500000,NULL,NULL,'Modal Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-08-28','5100','Pembelian Bahan Baku',3200000,0,'purchases','ae000001-0000-0000-0000-000000000009','Belanja Bahan Baku','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-08-28','5200','Belanja Operasional',235000,0,'purchases','ae000001-0000-0000-0000-000000000010','Belanja Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-08-31','1100','Kas Masuk Operasional',0,5500000,NULL,NULL,'Modal Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-08-31','5100','Pembelian Bahan Baku',2800000,0,'purchases','ae000001-0000-0000-0000-000000000011','Belanja Bahan Baku','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-08-31','5200','Belanja Operasional',175000,0,'purchases','ae000001-0000-0000-0000-000000000012','Belanja Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-09-01','1100','Kas Masuk Operasional',0,5500000,NULL,NULL,'Modal Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-09-01','5100','Pembelian Bahan Baku',2900000,0,'purchases','ae000001-0000-0000-0000-000000000013','Belanja Bahan Baku','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-09-01','5200','Belanja Operasional',190000,0,'purchases','ae000001-0000-0000-0000-000000000014','Belanja Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-09-02','1100','Kas Masuk Operasional',0,5500000,NULL,NULL,'Modal Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-09-02','5100','Pembelian Bahan Baku',3000000,0,'purchases','ae000001-0000-0000-0000-000000000015','Belanja Bahan Baku','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-09-02','5200','Belanja Operasional',205000,0,'purchases','ae000001-0000-0000-0000-000000000016','Belanja Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-09-03','1100','Kas Masuk Operasional',0,5500000,NULL,NULL,'Modal Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-09-03','5100','Pembelian Bahan Baku',3100000,0,'purchases','ae000001-0000-0000-0000-000000000017','Belanja Bahan Baku','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-09-03','5200','Belanja Operasional',220000,0,'purchases','ae000001-0000-0000-0000-000000000018','Belanja Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-09-04','1100','Kas Masuk Operasional',0,5500000,NULL,NULL,'Modal Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-09-04','5100','Pembelian Bahan Baku',3200000,0,'purchases','ae000001-0000-0000-0000-000000000019','Belanja Bahan Baku','a0000001-0000-0000-0000-000000000003'),
('Periode 2 - Agustus 2026','2026-09-04','5200','Belanja Operasional',235000,0,'purchases','ae000001-0000-0000-0000-000000000020','Belanja Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-07','1100','Kas Masuk Operasional',0,5500000,NULL,NULL,'Modal Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-07','5100','Pembelian Bahan Baku',2800000,0,'purchases','ae000001-0000-0000-0000-000000000021','Belanja Bahan Baku','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-07','5200','Belanja Operasional',175000,0,'purchases','ae000001-0000-0000-0000-000000000022','Belanja Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-08','1100','Kas Masuk Operasional',0,5500000,NULL,NULL,'Modal Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-08','5100','Pembelian Bahan Baku',2900000,0,'purchases','ae000001-0000-0000-0000-000000000023','Belanja Bahan Baku','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-08','5200','Belanja Operasional',190000,0,'purchases','ae000001-0000-0000-0000-000000000024','Belanja Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-09','1100','Kas Masuk Operasional',0,5500000,NULL,NULL,'Modal Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-09','5100','Pembelian Bahan Baku',3000000,0,'purchases','ae000001-0000-0000-0000-000000000025','Belanja Bahan Baku','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-09','5200','Belanja Operasional',205000,0,'purchases','ae000001-0000-0000-0000-000000000026','Belanja Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-10','1100','Kas Masuk Operasional',0,5500000,NULL,NULL,'Modal Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-10','5100','Pembelian Bahan Baku',3100000,0,'purchases','ae000001-0000-0000-0000-000000000027','Belanja Bahan Baku','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-10','5200','Belanja Operasional',220000,0,'purchases','ae000001-0000-0000-0000-000000000028','Belanja Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-11','1100','Kas Masuk Operasional',0,5500000,NULL,NULL,'Modal Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-11','5100','Pembelian Bahan Baku',3200000,0,'purchases','ae000001-0000-0000-0000-000000000029','Belanja Bahan Baku','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-11','5200','Belanja Operasional',235000,0,'purchases','ae000001-0000-0000-0000-000000000030','Belanja Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-14','1100','Kas Masuk Operasional',0,5500000,NULL,NULL,'Modal Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-14','5100','Pembelian Bahan Baku',2800000,0,'purchases','ae000001-0000-0000-0000-000000000031','Belanja Bahan Baku','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-14','5200','Belanja Operasional',175000,0,'purchases','ae000001-0000-0000-0000-000000000032','Belanja Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-15','1100','Kas Masuk Operasional',0,5500000,NULL,NULL,'Modal Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-15','5100','Pembelian Bahan Baku',2900000,0,'purchases','ae000001-0000-0000-0000-000000000033','Belanja Bahan Baku','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-15','5200','Belanja Operasional',190000,0,'purchases','ae000001-0000-0000-0000-000000000034','Belanja Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-16','1100','Kas Masuk Operasional',0,5500000,NULL,NULL,'Modal Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-16','5100','Pembelian Bahan Baku',3000000,0,'purchases','ae000001-0000-0000-0000-000000000035','Belanja Bahan Baku','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-16','5200','Belanja Operasional',205000,0,'purchases','ae000001-0000-0000-0000-000000000036','Belanja Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-17','1100','Kas Masuk Operasional',0,5500000,NULL,NULL,'Modal Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-17','5100','Pembelian Bahan Baku',3100000,0,'purchases','ae000001-0000-0000-0000-000000000037','Belanja Bahan Baku','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-17','5200','Belanja Operasional',220000,0,'purchases','ae000001-0000-0000-0000-000000000038','Belanja Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-18','1100','Kas Masuk Operasional',0,5500000,NULL,NULL,'Modal Operasional','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-18','5100','Pembelian Bahan Baku',3200000,0,'purchases','ae000001-0000-0000-0000-000000000039','Belanja Bahan Baku','a0000001-0000-0000-0000-000000000003'),
('Periode 1 - September 2026','2026-09-18','5200','Belanja Operasional',235000,0,'purchases','ae000001-0000-0000-0000-000000000040','Belanja Operasional','a0000001-0000-0000-0000-000000000003');

-- ============= DAILY TASKS (120 tugas: 6 role x 20 hari) =============
INSERT INTO public.daily_tasks (task_date, user_id, role, task_type, category, portions, description, status) VALUES
('2026-08-24','a0000001-0000-0000-0000-000000000010','persiapan','persiapan',NULL,0,'Persiapan bahan sayuran dan protein','SELESAI'),
('2026-08-24','a0000001-0000-0000-0000-000000000011','tenaga_masak','masak',NULL,0,'Masak Nasi Ayam Bakar dan Bubur Ayam','SELESAI'),
('2026-08-24','a0000001-0000-0000-0000-000000000012','pemorsian','pemorsian','BALITA',300,'Pemorsian Balita: Bubur Ayam','SELESAI'),
('2026-08-24','a0000001-0000-0000-0000-000000000013','kebersihan','kebersihan',NULL,0,'Bersih-bersih area dapur dan peralatan','SELESAI'),
('2026-08-24','a0000001-0000-0000-0000-000000000014','pencuci','cuci',NULL,0,'Cuci 200 ompreng dan peralatan masak','SELESAI'),
('2026-08-24','a0000001-0000-0000-0000-000000000008','driver','pengiriman',NULL,0,'Pengiriman ke 4 tujuan','SELESAI'),
('2026-08-25','a0000001-0000-0000-0000-000000000010','persiapan','persiapan',NULL,0,'Persiapan bahan untuk menu ayam bakar','SELESAI'),
('2026-08-25','a0000001-0000-0000-0000-000000000011','tenaga_masak','masak',NULL,0,'Masak Nasi Ikan Tongkol Balado dan Telur Dadar','SELESAI'),
('2026-08-25','a0000001-0000-0000-0000-000000000012','pemorsian','pemorsian','PORTION_LARGE',1005,'Pemorsian SD: Nasi Ayam Bakar','SELESAI'),
('2026-08-25','a0000001-0000-0000-0000-000000000013','kebersihan','kebersihan',NULL,0,'Bersih-bersih area dapur dan peralatan','SELESAI'),
('2026-08-25','a0000001-0000-0000-0000-000000000014','pencuci','cuci',NULL,0,'Cuci 210 ompreng dan peralatan masak','SELESAI'),
('2026-08-25','a0000001-0000-0000-0000-000000000008','driver','pengiriman',NULL,0,'Pengiriman ke 5 tujuan','SELESAI'),
('2026-08-26','a0000001-0000-0000-0000-000000000010','persiapan','persiapan',NULL,0,'Persiapan bumbu dan sayuran segar','SELESAI'),
('2026-08-26','a0000001-0000-0000-0000-000000000011','tenaga_masak','masak',NULL,0,'Masak Nasi Tahu Tempe Sayur dan Bubur Telur','SELESAI'),
('2026-08-26','a0000001-0000-0000-0000-000000000012','pemorsian','pemorsian','PORTION_SMALL',510,'Pemorsian PAUD: Nasi Telur Dadar','SELESAI'),
('2026-08-26','a0000001-0000-0000-0000-000000000013','kebersihan','kebersihan',NULL,0,'Bersih-bersih area dapur dan peralatan','SELESAI'),
('2026-08-26','a0000001-0000-0000-0000-000000000014','pencuci','cuci',NULL,0,'Cuci 220 ompreng dan peralatan masak','SELESAI'),
('2026-08-26','a0000001-0000-0000-0000-000000000008','driver','pengiriman',NULL,0,'Pengiriman ke 6 tujuan','SELESAI'),
('2026-08-27','a0000001-0000-0000-0000-000000000010','persiapan','persiapan',NULL,0,'Persiapan bahan ikan dan sayuran','SELESAI'),
('2026-08-27','a0000001-0000-0000-0000-000000000011','tenaga_masak','masak',NULL,0,'Masak Nasi Ayam Goreng dan Capcay','SELESAI'),
('2026-08-27','a0000001-0000-0000-0000-000000000012','pemorsian','pemorsian','BUMIL_BUSUI',215,'Pemorsian Ibu: Nasi Tahu Tempe','SELESAI'),
('2026-08-27','a0000001-0000-0000-0000-000000000013','kebersihan','kebersihan',NULL,0,'Bersih-bersih area dapur dan peralatan','SELESAI'),
('2026-08-27','a0000001-0000-0000-0000-000000000014','pencuci','cuci',NULL,0,'Cuci 230 ompreng dan peralatan masak','SELESAI'),
('2026-08-27','a0000001-0000-0000-0000-000000000008','driver','pengiriman',NULL,0,'Pengiriman ke 4 tujuan','SELESAI'),
('2026-08-28','a0000001-0000-0000-0000-000000000010','persiapan','persiapan',NULL,0,'Persiapan telur dan sayuran','SELESAI'),
('2026-08-28','a0000001-0000-0000-0000-000000000011','tenaga_masak','masak',NULL,0,'Masak Nasi Kentang Kari dan Bubur Ikan','SELESAI'),
('2026-08-28','a0000001-0000-0000-0000-000000000012','pemorsian','pemorsian','BALITA',320,'Pemorsian Balita: Bubur Ayam','SELESAI'),
('2026-08-28','a0000001-0000-0000-0000-000000000013','kebersihan','kebersihan',NULL,0,'Bersih-bersih area dapur dan peralatan','SELESAI'),
('2026-08-28','a0000001-0000-0000-0000-000000000014','pencuci','cuci',NULL,0,'Cuci 240 ompreng dan peralatan masak','SELESAI'),
('2026-08-28','a0000001-0000-0000-0000-000000000008','driver','pengiriman',NULL,0,'Pengiriman ke 5 tujuan','SELESAI'),
('2026-08-31','a0000001-0000-0000-0000-000000000010','persiapan','persiapan',NULL,0,'Persiapan bahan sayuran dan protein','SELESAI'),
('2026-08-31','a0000001-0000-0000-0000-000000000011','tenaga_masak','masak',NULL,0,'Masak Nasi Ayam Bakar dan Bubur Ayam','SELESAI'),
('2026-08-31','a0000001-0000-0000-0000-000000000012','pemorsian','pemorsian','PORTION_LARGE',1000,'Pemorsian SD: Nasi Ayam Bakar','SELESAI'),
('2026-08-31','a0000001-0000-0000-0000-000000000013','kebersihan','kebersihan',NULL,0,'Bersih-bersih area dapur dan peralatan','SELESAI'),
('2026-08-31','a0000001-0000-0000-0000-000000000014','pencuci','cuci',NULL,0,'Cuci 200 ompreng dan peralatan masak','SELESAI'),
('2026-08-31','a0000001-0000-0000-0000-000000000008','driver','pengiriman',NULL,0,'Pengiriman ke 4 tujuan','SELESAI'),
('2026-09-01','a0000001-0000-0000-0000-000000000010','persiapan','persiapan',NULL,0,'Persiapan bahan untuk menu ayam bakar','SELESAI'),
('2026-09-01','a0000001-0000-0000-0000-000000000011','tenaga_masak','masak',NULL,0,'Masak Nasi Ikan Tongkol Balado dan Telur Dadar','SELESAI'),
('2026-09-01','a0000001-0000-0000-0000-000000000012','pemorsian','pemorsian','PORTION_SMALL',505,'Pemorsian PAUD: Nasi Telur Dadar','SELESAI'),
('2026-09-01','a0000001-0000-0000-0000-000000000013','kebersihan','kebersihan',NULL,0,'Bersih-bersih area dapur dan peralatan','SELESAI'),
('2026-09-01','a0000001-0000-0000-0000-000000000014','pencuci','cuci',NULL,0,'Cuci 210 ompreng dan peralatan masak','SELESAI'),
('2026-09-01','a0000001-0000-0000-0000-000000000008','driver','pengiriman',NULL,0,'Pengiriman ke 5 tujuan','SELESAI'),
('2026-09-02','a0000001-0000-0000-0000-000000000010','persiapan','persiapan',NULL,0,'Persiapan bumbu dan sayuran segar','SELESAI'),
('2026-09-02','a0000001-0000-0000-0000-000000000011','tenaga_masak','masak',NULL,0,'Masak Nasi Tahu Tempe Sayur dan Bubur Telur','SELESAI'),
('2026-09-02','a0000001-0000-0000-0000-000000000012','pemorsian','pemorsian','BUMIL_BUSUI',210,'Pemorsian Ibu: Nasi Tahu Tempe','SELESAI'),
('2026-09-02','a0000001-0000-0000-0000-000000000013','kebersihan','kebersihan',NULL,0,'Bersih-bersih area dapur dan peralatan','SELESAI'),
('2026-09-02','a0000001-0000-0000-0000-000000000014','pencuci','cuci',NULL,0,'Cuci 220 ompreng dan peralatan masak','SELESAI'),
('2026-09-02','a0000001-0000-0000-0000-000000000008','driver','pengiriman',NULL,0,'Pengiriman ke 6 tujuan','SELESAI'),
('2026-09-03','a0000001-0000-0000-0000-000000000010','persiapan','persiapan',NULL,0,'Persiapan bahan ikan dan sayuran','SELESAI'),
('2026-09-03','a0000001-0000-0000-0000-000000000011','tenaga_masak','masak',NULL,0,'Masak Nasi Ayam Goreng dan Capcay','SELESAI'),
('2026-09-03','a0000001-0000-0000-0000-000000000012','pemorsian','pemorsian','BALITA',315,'Pemorsian Balita: Bubur Ayam','SELESAI'),
('2026-09-03','a0000001-0000-0000-0000-000000000013','kebersihan','kebersihan',NULL,0,'Bersih-bersih area dapur dan peralatan','SELESAI'),
('2026-09-03','a0000001-0000-0000-0000-000000000014','pencuci','cuci',NULL,0,'Cuci 230 ompreng dan peralatan masak','SELESAI'),
('2026-09-03','a0000001-0000-0000-0000-000000000008','driver','pengiriman',NULL,0,'Pengiriman ke 4 tujuan','SELESAI'),
('2026-09-04','a0000001-0000-0000-0000-000000000010','persiapan','persiapan',NULL,0,'Persiapan telur dan sayuran','SELESAI'),
('2026-09-04','a0000001-0000-0000-0000-000000000011','tenaga_masak','masak',NULL,0,'Masak Nasi Kentang Kari dan Bubur Ikan','SELESAI'),
('2026-09-04','a0000001-0000-0000-0000-000000000012','pemorsian','pemorsian','PORTION_LARGE',1020,'Pemorsian SD: Nasi Ayam Bakar','SELESAI'),
('2026-09-04','a0000001-0000-0000-0000-000000000013','kebersihan','kebersihan',NULL,0,'Bersih-bersih area dapur dan peralatan','SELESAI'),
('2026-09-04','a0000001-0000-0000-0000-000000000014','pencuci','cuci',NULL,0,'Cuci 240 ompreng dan peralatan masak','SELESAI'),
('2026-09-04','a0000001-0000-0000-0000-000000000008','driver','pengiriman',NULL,0,'Pengiriman ke 5 tujuan','SELESAI'),
('2026-09-07','a0000001-0000-0000-0000-000000000010','persiapan','persiapan',NULL,0,'Persiapan bahan sayuran dan protein','SELESAI'),
('2026-09-07','a0000001-0000-0000-0000-000000000011','tenaga_masak','masak',NULL,0,'Masak Nasi Ayam Bakar dan Bubur Ayam','SELESAI'),
('2026-09-07','a0000001-0000-0000-0000-000000000012','pemorsian','pemorsian','PORTION_SMALL',500,'Pemorsian PAUD: Nasi Telur Dadar','SELESAI'),
('2026-09-07','a0000001-0000-0000-0000-000000000013','kebersihan','kebersihan',NULL,0,'Bersih-bersih area dapur dan peralatan','SELESAI'),
('2026-09-07','a0000001-0000-0000-0000-000000000014','pencuci','cuci',NULL,0,'Cuci 200 ompreng dan peralatan masak','SELESAI'),
('2026-09-07','a0000001-0000-0000-0000-000000000008','driver','pengiriman',NULL,0,'Pengiriman ke 4 tujuan','SELESAI'),
('2026-09-08','a0000001-0000-0000-0000-000000000010','persiapan','persiapan',NULL,0,'Persiapan bahan untuk menu ayam bakar','SELESAI'),
('2026-09-08','a0000001-0000-0000-0000-000000000011','tenaga_masak','masak',NULL,0,'Masak Nasi Ikan Tongkol Balado dan Telur Dadar','SELESAI'),
('2026-09-08','a0000001-0000-0000-0000-000000000012','pemorsian','pemorsian','BUMIL_BUSUI',205,'Pemorsian Ibu: Nasi Tahu Tempe','SELESAI'),
('2026-09-08','a0000001-0000-0000-0000-000000000013','kebersihan','kebersihan',NULL,0,'Bersih-bersih area dapur dan peralatan','SELESAI'),
('2026-09-08','a0000001-0000-0000-0000-000000000014','pencuci','cuci',NULL,0,'Cuci 210 ompreng dan peralatan masak','SELESAI'),
('2026-09-08','a0000001-0000-0000-0000-000000000008','driver','pengiriman',NULL,0,'Pengiriman ke 5 tujuan','SELESAI'),
('2026-09-09','a0000001-0000-0000-0000-000000000010','persiapan','persiapan',NULL,0,'Persiapan bumbu dan sayuran segar','SELESAI'),
('2026-09-09','a0000001-0000-0000-0000-000000000011','tenaga_masak','masak',NULL,0,'Masak Nasi Tahu Tempe Sayur dan Bubur Telur','SELESAI'),
('2026-09-09','a0000001-0000-0000-0000-000000000012','pemorsian','pemorsian','BALITA',310,'Pemorsian Balita: Bubur Ayam','SELESAI'),
('2026-09-09','a0000001-0000-0000-0000-000000000013','kebersihan','kebersihan',NULL,0,'Bersih-bersih area dapur dan peralatan','SELESAI'),
('2026-09-09','a0000001-0000-0000-0000-000000000014','pencuci','cuci',NULL,0,'Cuci 220 ompreng dan peralatan masak','SELESAI'),
('2026-09-09','a0000001-0000-0000-0000-000000000008','driver','pengiriman',NULL,0,'Pengiriman ke 6 tujuan','SELESAI'),
('2026-09-10','a0000001-0000-0000-0000-000000000010','persiapan','persiapan',NULL,0,'Persiapan bahan ikan dan sayuran','SELESAI'),
('2026-09-10','a0000001-0000-0000-0000-000000000011','tenaga_masak','masak',NULL,0,'Masak Nasi Ayam Goreng dan Capcay','SELESAI'),
('2026-09-10','a0000001-0000-0000-0000-000000000012','pemorsian','pemorsian','PORTION_LARGE',1015,'Pemorsian SD: Nasi Ayam Bakar','SELESAI'),
('2026-09-10','a0000001-0000-0000-0000-000000000013','kebersihan','kebersihan',NULL,0,'Bersih-bersih area dapur dan peralatan','SELESAI'),
('2026-09-10','a0000001-0000-0000-0000-000000000014','pencuci','cuci',NULL,0,'Cuci 230 ompreng dan peralatan masak','SELESAI'),
('2026-09-10','a0000001-0000-0000-0000-000000000008','driver','pengiriman',NULL,0,'Pengiriman ke 4 tujuan','SELESAI'),
('2026-09-11','a0000001-0000-0000-0000-000000000010','persiapan','persiapan',NULL,0,'Persiapan telur dan sayuran','SELESAI'),
('2026-09-11','a0000001-0000-0000-0000-000000000011','tenaga_masak','masak',NULL,0,'Masak Nasi Kentang Kari dan Bubur Ikan','SELESAI'),
('2026-09-11','a0000001-0000-0000-0000-000000000012','pemorsian','pemorsian','PORTION_SMALL',520,'Pemorsian PAUD: Nasi Telur Dadar','SELESAI'),
('2026-09-11','a0000001-0000-0000-0000-000000000013','kebersihan','kebersihan',NULL,0,'Bersih-bersih area dapur dan peralatan','SELESAI'),
('2026-09-11','a0000001-0000-0000-0000-000000000014','pencuci','cuci',NULL,0,'Cuci 240 ompreng dan peralatan masak','SELESAI'),
('2026-09-11','a0000001-0000-0000-0000-000000000008','driver','pengiriman',NULL,0,'Pengiriman ke 5 tujuan','SELESAI'),
('2026-09-14','a0000001-0000-0000-0000-000000000010','persiapan','persiapan',NULL,0,'Persiapan bahan sayuran dan protein','SELESAI'),
('2026-09-14','a0000001-0000-0000-0000-000000000011','tenaga_masak','masak',NULL,0,'Masak Nasi Ayam Bakar dan Bubur Ayam','SELESAI'),
('2026-09-14','a0000001-0000-0000-0000-000000000012','pemorsian','pemorsian','BUMIL_BUSUI',200,'Pemorsian Ibu: Nasi Tahu Tempe','SELESAI'),
('2026-09-14','a0000001-0000-0000-0000-000000000013','kebersihan','kebersihan',NULL,0,'Bersih-bersih area dapur dan peralatan','SELESAI'),
('2026-09-14','a0000001-0000-0000-0000-000000000014','pencuci','cuci',NULL,0,'Cuci 200 ompreng dan peralatan masak','SELESAI'),
('2026-09-14','a0000001-0000-0000-0000-000000000008','driver','pengiriman',NULL,0,'Pengiriman ke 4 tujuan','SELESAI'),
('2026-09-15','a0000001-0000-0000-0000-000000000010','persiapan','persiapan',NULL,0,'Persiapan bahan untuk menu ayam bakar','SELESAI'),
('2026-09-15','a0000001-0000-0000-0000-000000000011','tenaga_masak','masak',NULL,0,'Masak Nasi Ikan Tongkol Balado dan Telur Dadar','SELESAI'),
('2026-09-15','a0000001-0000-0000-0000-000000000012','pemorsian','pemorsian','BALITA',305,'Pemorsian Balita: Bubur Ayam','SELESAI'),
('2026-09-15','a0000001-0000-0000-0000-000000000013','kebersihan','kebersihan',NULL,0,'Bersih-bersih area dapur dan peralatan','SELESAI'),
('2026-09-15','a0000001-0000-0000-0000-000000000014','pencuci','cuci',NULL,0,'Cuci 210 ompreng dan peralatan masak','SELESAI'),
('2026-09-15','a0000001-0000-0000-0000-000000000008','driver','pengiriman',NULL,0,'Pengiriman ke 5 tujuan','SELESAI'),
('2026-09-16','a0000001-0000-0000-0000-000000000010','persiapan','persiapan',NULL,0,'Persiapan bumbu dan sayuran segar','SELESAI'),
('2026-09-16','a0000001-0000-0000-0000-000000000011','tenaga_masak','masak',NULL,0,'Masak Nasi Tahu Tempe Sayur dan Bubur Telur','SELESAI'),
('2026-09-16','a0000001-0000-0000-0000-000000000012','pemorsian','pemorsian','PORTION_LARGE',1010,'Pemorsian SD: Nasi Ayam Bakar','SELESAI'),
('2026-09-16','a0000001-0000-0000-0000-000000000013','kebersihan','kebersihan',NULL,0,'Bersih-bersih area dapur dan peralatan','SELESAI'),
('2026-09-16','a0000001-0000-0000-0000-000000000014','pencuci','cuci',NULL,0,'Cuci 220 ompreng dan peralatan masak','SELESAI'),
('2026-09-16','a0000001-0000-0000-0000-000000000008','driver','pengiriman',NULL,0,'Pengiriman ke 6 tujuan','SELESAI'),
('2026-09-17','a0000001-0000-0000-0000-000000000010','persiapan','persiapan',NULL,0,'Persiapan bahan ikan dan sayuran','SELESAI'),
('2026-09-17','a0000001-0000-0000-0000-000000000011','tenaga_masak','masak',NULL,0,'Masak Nasi Ayam Goreng dan Capcay','SELESAI'),
('2026-09-17','a0000001-0000-0000-0000-000000000012','pemorsian','pemorsian','PORTION_SMALL',515,'Pemorsian PAUD: Nasi Telur Dadar','SELESAI'),
('2026-09-17','a0000001-0000-0000-0000-000000000013','kebersihan','kebersihan',NULL,0,'Bersih-bersih area dapur dan peralatan','SELESAI'),
('2026-09-17','a0000001-0000-0000-0000-000000000014','pencuci','cuci',NULL,0,'Cuci 230 ompreng dan peralatan masak','SELESAI'),
('2026-09-17','a0000001-0000-0000-0000-000000000008','driver','pengiriman',NULL,0,'Pengiriman ke 4 tujuan','SELESAI'),
('2026-09-18','a0000001-0000-0000-0000-000000000010','persiapan','persiapan',NULL,0,'Persiapan telur dan sayuran','SELESAI'),
('2026-09-18','a0000001-0000-0000-0000-000000000011','tenaga_masak','masak',NULL,0,'Masak Nasi Kentang Kari dan Bubur Ikan','SELESAI'),
('2026-09-18','a0000001-0000-0000-0000-000000000012','pemorsian','pemorsian','BUMIL_BUSUI',220,'Pemorsian Ibu: Nasi Tahu Tempe','SELESAI'),
('2026-09-18','a0000001-0000-0000-0000-000000000013','kebersihan','kebersihan',NULL,0,'Bersih-bersih area dapur dan peralatan','SELESAI'),
('2026-09-18','a0000001-0000-0000-0000-000000000014','pencuci','cuci',NULL,0,'Cuci 240 ompreng dan peralatan masak','SELESAI'),
('2026-09-18','a0000001-0000-0000-0000-000000000008','driver','pengiriman',NULL,0,'Pengiriman ke 5 tujuan','SELESAI');

-- ============= AUDIT TRAIL (40 catatan audit) =============
INSERT INTO public.audit_trail (actor, actor_email, action, entity, entity_id, note) VALUES
('Admin Aplikasi (admin_apps)','admin@sppg.id','CREATE_ITEM','items','b0000001-0000-0000-0000-000000000001','Item baru: Bayam'),
('Admin Aplikasi (admin_apps)','admin@sppg.id','CREATE_ITEM','items','b0000001-0000-0000-0000-000000000006','Item baru: Ayam Fillet'),
('Admin Aplikasi (admin_apps)','admin@sppg.id','CREATE_RECIPE','recipes','d0000001-0000-0000-0000-000000000001','Resep baru: Nasi Ayam Bakar'),
('Admin Aplikasi (admin_apps)','admin@sppg.id','CREATE_RECIPE','recipes','d0000001-0000-0000-0000-000000000013','Resep baru: Bubur Ayam Wortel'),
('Admin Aplikasi (admin_apps)','admin@sppg.id','CREATE_DESTINATION','destinations','f0000001-0000-0000-0000-000000000001','Tujuan baru: SDN 01 Jagakarsa'),
('Chef Andi (head_chef)','chef@sppg.id','CREATE_MENU','menus','e0000001-0000-0000-0000-000000000001','Menu Senin dibuat'),
('Chef Andi (head_chef)','chef@sppg.id','UPDATE_MENU','menus','e0000001-0000-0000-0000-000000000001','Menu Senin disetujui'),
('Chef Andi (head_chef)','chef@sppg.id','SUBMIT_MENU','menus','e0000001-0000-0000-0000-000000000003','Menu Rabu dikirim untuk review'),
('Sari Asisten (field_assistant)','asisten@sppg.id','CREATE_PURCHASE','purchases','ae000001-0000-0000-0000-000000000001','Pembelian bahan baku'),
('Sari Asisten (field_assistant)','asisten@sppg.id','CREATE_PURCHASE','purchases','ae000001-0000-0000-0000-000000000002','Pembelian sayuran'),
('Sari Asisten (field_assistant)','asisten@sppg.id','CREATE_DELIVERY','delivery_plans','aa000001-0000-0000-0000-000000000001','Rencana pengiriman Senin'),
('Sari Asisten (field_assistant)','asisten@sppg.id','CREATE_DELIVERY','delivery_plans','aa000001-0000-0000-0000-000000000002','Rencana pengiriman Selasa'),
('Sari Asisten (field_assistant)','asisten@sppg.id','ASSIGN_DRIVER','delivery_assignments','cc000001-0000-0000-0000-000000000001','Pak Driver ditugaskan'),
('Budi Akuntan (accountant)','akuntan@sppg.id','VERIFY_PURCHASE','purchases','ae000001-0000-0000-0000-000000000001','Pembelian diverifikasi'),
('Budi Akuntan (accountant)','akuntan@sppg.id','VERIFY_PURCHASE','purchases','ae000001-0000-0000-0000-000000000002','Pembelian diverifikasi'),
('Budi Akuntan (accountant)','akuntan@sppg.id','CREATE_ANGGARAN','anggaran','af000001-0000-0000-0000-000000000001','Anggaran harian dibuat'),
('Dr. Gizi (nutritionist)','ahligizi@sppg.id','APPROVE_MENU','menus','e0000001-0000-0000-0000-000000000001','Menu Senin disetujui gizi'),
('Dr. Gizi (nutritionist)','ahligizi@sppg.id','APPROVE_MENU','menus','e0000001-0000-0000-0000-000000000002','Menu Selasa disetujui gizi'),
('Pak Driver (driver)','driver@sppg.id','UPDATE_DELIVERY','delivery_assignments','cc000001-0000-0000-0000-000000000001','Pengiriman dimulai'),
('Pak Driver (driver)','driver@sppg.id','LOG_DELIVERY','delivery_logs','dd000001-0000-0000-0000-000000000001','Terkirim ke SDN 01 Jagakarsa'),
('Pak Driver (driver)','driver@sppg.id','LOG_DELIVERY','delivery_logs','dd000001-0000-0000-0000-000000000002','Terkirim ke PAUD Melati'),
('Budi Persiapan (persiapan)','persiapan@sppg.id','STOCK_TAKEN','stock_lots','c0000001-0000-0000-0000-000000000002','Ambil ayam fillet untuk masak'),
('Budi Persiapan (persiapan)','persiapan@sppg.id','STOCK_TAKEN','stock_lots','c0000001-0000-0000-0000-000000000003','Ambil bayam untuk masak'),
('Budi Persiapan (persiapan)','persiapan@sppg.id','SUBMIT_DAILY_TASK','daily_tasks','a5000001-0000-0000-0000-000000000001','Laporan persiapan harian'),
('Siti Masak (tenaga_masak)','masak@sppg.id','SUBMIT_DAILY_TASK','daily_tasks','a5000001-0000-0000-0000-000000000002','Laporan masak harian'),
('Rina Pemorsian (pemorsian)','pemorsian@sppg.id','SUBMIT_DAILY_TASK','daily_tasks','a5000001-0000-0000-0000-000000000003','Laporan pemorsian harian'),
('Andi Kebersihan (kebersihan)','kebersihan@sppg.id','SUBMIT_DAILY_TASK','daily_tasks','a5000001-0000-0000-0000-000000000004','Laporan kebersihan harian'),
('Dewi Pencuci (pencuci)','pencuci@sppg.id','SUBMIT_DAILY_TASK','daily_tasks','a5000001-0000-0000-0000-000000000005','Laporan pencucian harian'),
('Pak Kepala Dapur (kitchen_head)','kepala@sppg.id','OPNAME','opnames','a3000001-0000-0000-0000-000000000001','Opname beras mingguan'),
('Pak Kepala Dapur (kitchen_head)','kepala@sppg.id','OPNAME','opnames','a3000001-0000-0000-0000-000000000002','Opname ayam mingguan'),
('Chef Andi (head_chef)','chef@sppg.id','OPNAME','opnames','a3000001-0000-0000-0000-000000000003','Opname bayam mingguan'),
('Admin SPPG (admin_sppg)','admin-sppg@sppg.id','CREATE_USER','users','a0000001-0000-0000-0000-000000000010','User baru: Budi Persiapan'),
('Admin SPPG (admin_sppg)','admin-sppg@sppg.id','CREATE_USER','users','a0000001-0000-0000-0000-000000000011','User baru: Siti Masak'),
('Admin SPPG (admin_sppg)','admin-sppg@sppg.id','UPDATE_SETTINGS','settings',NULL,'Update logo SPPG'),
('Admin Aplikasi (admin_apps)','admin@sppg.id','CREATE_ITEM','items','b0000001-0000-0000-0000-000000000011','Item baru: Beras'),
('Admin Aplikasi (admin_apps)','admin@sppg.id','CREATE_ITEM','items','b0000001-0000-0000-0000-000000000016','Item baru: Cabai Merah'),
('Chef Andi (head_chef)','chef@sppg.id','UPDATE_RECIPE','recipes','d0000001-0000-0000-0000-000000000001','Update resep Nasi Ayam Bakar'),
('Sari Asisten (field_assistant)','asisten@sppg.id','CREATE_DESTINATION','destinations','f0000001-0000-0000-0000-000000000005','Tujuan baru: SDN 02 Pasar Minggu'),
('Dr. Gizi (nutritionist)','ahligizi@sppg.id','REJECT_MENU','menus','e0000001-0000-0000-0000-000000000003','Menu Rabu ditolak: kurang serat'),
('Admin Aplikasi (admin_apps)','admin@sppg.id','CREATE_GLOBAL_CONFIG','global_config',NULL,'Update konfigurasi global'),
('Pak Kepala Dapur (kitchen_head)','kepala@sppg.id','UPDATE_STOCK','stock_lots','c0000001-0000-0000-0000-000000000001','Update stok beras');

-- ============= DONE =============
-- Seed selesai! Semua tabel terisi dengan data 4 minggu.
-- Login dengan email apapun, password: admin123
