-- SPPG MBG — Reset & Seed
-- Jalankan di Supabase SQL Editor (buka https://supabase.com/dashboard > SQL Editor)

-- ============= 0. DISABLE RLS (biar anon key bisa baca/tulis) =============
ALTER TABLE public.users  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_lots DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.opnames DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_trail DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- ============= 1. HAPUS SEMUA DATA =============
TRUNCATE TABLE audit_trail CASCADE;
TRUNCATE TABLE opnames CASCADE;
TRUNCATE TABLE stock_lots CASCADE;
TRUNCATE TABLE purchases CASCADE;
TRUNCATE TABLE menus CASCADE;
TRUNCATE TABLE recipes CASCADE;
TRUNCATE TABLE items CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE settings CASCADE;

-- ============= 2. SEED USERS =============
INSERT INTO public.users (id, email, name, role, is_active, password_hash, created_at)
VALUES
  ('a0000001-0000-0000-0000-000000000001'::uuid, 'admin@sppg.id',     'Administrator',    'admin',           true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000002'::uuid, 'akuntan@sppg.id',   'Sri Akuntansi',    'accountant',      true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000003'::uuid, 'kepala@sppg.id',    'Pak Kepala Dapur', 'kitchen_head',    true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000004'::uuid, 'chef@sppg.id',      'Chef Wulan',       'head_chef',       true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000005'::uuid, 'asisten@sppg.id',   'Asisten Belanja',  'field_assistant', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000006'::uuid, 'staf@sppg.id',      'Staf Gudang',      'field_staff',     true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000007'::uuid, 'ahligizi@sppg.id',  'Ahli Gizi Maya',   'nutritionist',    true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now())
ON CONFLICT (email) DO NOTHING;

-- ============= 3. SEED ITEMS =============
INSERT INTO public.items (id, name, unit, category, par_level, price_per_unit, zone, allergens, created_at, updated_at)
VALUES
  ('b0000001-0000-0000-0000-000000000001'::uuid, 'Beras Premium',    'kg',     'Karbo',   50,  15000, 'DRY',     '{}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000002'::uuid, 'Telur Ayam',       'kg',     'Protein', 20,  28000, 'WET',     '{telur}',        now(), now()),
  ('b0000001-0000-0000-0000-000000000003'::uuid, 'Bayam',            'ikat',   'Sayur',   30,   4000, 'WET',     '{}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000004'::uuid, 'Wortel',           'kg',     'Sayur',   15,  12000, 'WET',     '{}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000005'::uuid, 'Minyak Goreng',    'liter',  'Bumbu',   10,  18000, 'DRY',     '{}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000006'::uuid, 'Tempe',            'papan',  'Protein', 25,   7000, 'WET',     '{kedelai}',      now(), now()),
  ('b0000001-0000-0000-0000-000000000007'::uuid, 'Ayam Beku',        'kg',     'Protein', 10,  38000, 'FREEZER', '{}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000008'::uuid, 'Tahu',             'papan',  'Protein', 20,   5000, 'WET',     '{kedelai}',      now(), now()),
  ('b0000001-0000-0000-0000-000000000009'::uuid, 'Ikan Kembung',     'kg',     'Protein',  8,  35000, 'FREEZER', '{ikan}',         now(), now()),
  ('b0000001-0000-0000-0000-000000000010'::uuid, 'Kentang',          'kg',     'Karbo',   25,  10000, 'DRY',     '{}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000011'::uuid, 'Gula Pasir',       'kg',     'Bumbu',   10,  15000, 'DRY',     '{}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000012'::uuid, 'Garam',            'kg',     'Bumbu',    5,   5000, 'DRY',     '{}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000013'::uuid, 'Kecap Manis',      'botol',  'Bumbu',   10,  12000, 'DRY',     '{kedelai}',      now(), now()),
  ('b0000001-0000-0000-0000-000000000014'::uuid, 'Bawang Merah',     'kg',     'Bumbu',   10,  25000, 'DRY',     '{}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000015'::uuid, 'Bawang Putih',     'kg',     'Bumbu',    8,  20000, 'DRY',     '{}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000016'::uuid, 'Cabe Merah',       'kg',     'Bumbu',    5,  35000, 'WET',     '{}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000017'::uuid, 'Tomat',            'kg',     'Sayur',   15,   8000, 'WET',     '{}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000018'::uuid, 'Susu UHT',         'liter',  'Protein', 20,  18000, 'DRY',     '{susu}',         now(), now()),
  ('b0000001-0000-0000-0000-000000000019'::uuid, 'Minyak Kelapa',    'liter',  'Bumbu',    5,  22000, 'DRY',     '{}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000020'::uuid, 'Ikan Asin',        'kg',     'Protein', 10,  20000, 'DRY',     '{ikan}',         now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============= 4. SEED STOCK (example lots) =============
INSERT INTO public.stock_lots (item_id, quantity, actual_quantity, expiry_date, note, zone, created_at)
VALUES
  ('b0000001-0000-0000-0000-000000000001'::uuid, 100, 95,  now() + interval '6 months', 'Lot A',   'DRY',     now()),
  ('b0000001-0000-0000-0000-000000000002'::uuid, 30,  28,  now() + interval '14 days',  'Lot B',   'WET',     now()),
  ('b0000001-0000-0000-0000-000000000005'::uuid, 20,  20,  now() + interval '1 year',   'Lot C',   'DRY',     now()),
  ('b0000001-0000-0000-0000-000000000007'::uuid, 15,  12,  now() + interval '90 days',  'Batch 1', 'FREEZER', now())
ON CONFLICT DO NOTHING;

-- ============= 5. SEED RECIPES =============
INSERT INTO public.recipes (id, name, servings, ingredients, instructions, calories_kcal, protein_g, carbs_g, fats_g, sodium_mg, allergens, created_at)
VALUES
  ('c0000001-0000-0000-0000-000000000001'::uuid, 'Nasi Goreng Sehat', 1,
    '[{"item_id":"b0000001-0000-0000-0000-000000000001","name":"Beras Premium","qty":0.15,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000002","name":"Telur Ayam","qty":0.05,"unit":"kg"}]',
    '1. Masak nasi. 2. Tumis bumbu. 3. Masukkan telur. 4. Campur nasi.', 350, 12, 50, 10, 800, '{}'::text[], now()),
  ('c0000001-0000-0000-0000-000000000002'::uuid, 'Sayur Sop', 1,
    '[{"item_id":"b0000001-0000-0000-0000-000000000003","name":"Bayam","qty":0.5,"unit":"ikat"},{"item_id":"b0000001-0000-0000-0000-000000000004","name":"Wortel","qty":0.15,"unit":"kg"}]',
    '1. Rebus air. 2. Masukkan wortel. 3. Masukkan bayam. 4. Sajikan.', 120, 4, 20, 2, 300, '{}'::text[], now())
ON CONFLICT DO NOTHING;

-- ============= 6. SEED MENUS (current week) =============
INSERT INTO public.menus (week_start, day, recipe_ids, portions, status, created_at)
SELECT
  to_char(date_trunc('week', now()), 'YYYY-MM-DD'),
  day,
  ARRAY(SELECT id::text FROM recipes ORDER BY random() LIMIT 2),
  100,
  'DRAFT',
  now()
FROM (VALUES ('mon'), ('tue'), ('wed'), ('thu'), ('fri')) AS days(day)
ON CONFLICT DO NOTHING;

-- ============= 7. SEED PURCHASES =============
INSERT INTO public.purchases (category, description, amount_idr, supplier, purchased_at, created_at)
VALUES
  ('STOCK',        'Pembelian Beras 50kg',       750000,  'UD. Sari Rasa', now() - interval '3 days', now()),
  ('STOCK',        'Pembelian Telur 10kg',       280000,  'Peternakan Ayam', now() - interval '2 days', now()),
  ('OPERATIONAL',  'Gas LPG 3kg',                20000,   'Agen Gas', now() - interval '1 day', now()),
  ('OPERATIONAL',  'Kebersihan dapur',           50000,   'Suplier', now(), now())
ON CONFLICT DO NOTHING;

-- ============= 8. SEED SETTINGS =============
INSERT INTO public.settings (key, value)
VALUES ('dapur_name', 'SPPG MBG Dapur Contoh')
ON CONFLICT (key) DO NOTHING;
