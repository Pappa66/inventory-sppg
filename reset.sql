-- SPPG MBG — Reset & Seed Komprehensif
-- Jalankan di Supabase SQL Editor

-- ============= 0. DISABLE RLS =============
ALTER TABLE public.users        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.items        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_lots   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.opnames      DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes      DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_trail  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations           DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_plans         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_plan_items    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_assignments   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_logs          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.anggaran_beneficiaries DISABLE ROW LEVEL SECURITY;

-- ============= 1. HAPUS SEMUA DATA =============
TRUNCATE TABLE anggaran_beneficiaries CASCADE;
TRUNCATE TABLE delivery_logs CASCADE;
TRUNCATE TABLE delivery_assignments CASCADE;
TRUNCATE TABLE delivery_plan_items CASCADE;
TRUNCATE TABLE delivery_plans CASCADE;
TRUNCATE TABLE destinations CASCADE;
TRUNCATE TABLE audit_trail CASCADE;
TRUNCATE TABLE opnames CASCADE;
TRUNCATE TABLE stock_lots CASCADE;
TRUNCATE TABLE purchases CASCADE;
TRUNCATE TABLE menus CASCADE;
TRUNCATE TABLE recipes CASCADE;
TRUNCATE TABLE items CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE settings CASCADE;

-- ============= 2. USERS =============
INSERT INTO public.users (id, email, name, role, is_active, password_hash, created_at)
VALUES
  ('a0000001-0000-0000-0000-000000000001'::uuid, 'admin@sppg.id',     'Administrator',    'admin',           true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000002'::uuid, 'akuntan@sppg.id',   'Sri Akuntansi',    'accountant',      true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000003'::uuid, 'kepala@sppg.id',    'Pak Kepala Dapur', 'kitchen_head',    true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000004'::uuid, 'chef@sppg.id',      'Chef Wulan',       'head_chef',       true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000005'::uuid, 'asisten@sppg.id',   'Asisten Lapangan', 'field_assistant', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000006'::uuid, 'ahligizi@sppg.id',  'Ahli Gizi Maya',   'nutritionist',    true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000007'::uuid, 'driver@sppg.id',    'Driver Budi',      'driver',          true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000008'::uuid, 'driver2@sppg.id',   'Driver Sari',      'driver',          true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000010'::uuid, 'persiapan@sppg.id', 'Rina Persiapan',   'persiapan',       true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000011'::uuid, 'masak@sppg.id',    'Sari Masak',      'tenaga_masak',    true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000012'::uuid, 'pemorsian@sppg.id','Dewi Pemorsian',  'pemorsian',       true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000013'::uuid, 'kebersihan@sppg.id','Siti Kebersihan', 'kebersihan',    true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  ('a0000001-0000-0000-0000-000000000014'::uuid, 'pencuci@sppg.id',  'Budi Pencuci',    'pencuci',         true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now())
ON CONFLICT (email) DO NOTHING;

-- ============= 3. ITEMS (30 bahan, 6 kategori) =============
INSERT INTO public.items (id, name, unit, category, par_level, price_per_unit, zone, allergens, created_at, updated_at)
VALUES
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
  ('b0000001-0000-0000-0000-000000000030'::uuid, 'Santan Instan',     'liter',  'BB',    8,  15000, 'DRY',     '{}'::text[],         now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============= 4. STOCK LOTS (various expiry, zones, quantities) =============
INSERT INTO public.stock_lots (id, item_id, quantity, actual_quantity, expiry_date, received_at, note, zone, created_at)
VALUES
  -- Beras Premium (3 lots)
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000001'::uuid, 100, 95,  now() + interval '6 months', now() - interval '30 days', 'Lot A - Gudang Pusat',       'DRY', now()),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000001'::uuid, 50,  48,  now() + interval '8 months', now() - interval '14 days', 'Lot B - Supplier Baru',       'DRY', now()),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000001'::uuid, 30,  30,  now() + interval '10 months',now() - interval '7 days',  'Lot C - Cadangan',            'DRY', now()),
  -- Beras Merah (1 lot)
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000002'::uuid, 20,  18,  now() + interval '4 months', now() - interval '10 days', 'Organik',                     'DRY', now()),
  -- Kentang
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000003'::uuid, 40,  35,  now() + interval '14 days',  now() - interval '5 days',  'Supplier Sayur',              'DRY', now()),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000003'::uuid, 25,  22,  now() + interval '20 days',  now() - interval '2 days',  'Lot baru',                    'DRY', now()),
  -- Mie Telur
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000004'::uuid, 30,  28,  now() + interval '5 months', now() - interval '15 days', 'Indofood',                    'DRY', now()),
  -- Jagung
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000005'::uuid, 15,  12,  now() + interval '7 days',   now() - interval '3 days',  'Panen lokal',                 'DRY', now()),
  -- Telur Ayam (EXPIRED lot)
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000006'::uuid, 10,  8,   now() - interval '2 days',   now() - interval '20 days', 'SUDAH EXPIRED — sisihkan',    'WET', now()),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000006'::uuid, 30,  28,  now() + interval '14 days',  now() - interval '7 days',  'Fresh dari peternakan',       'WET', now()),
  -- Tempe (almost expired)
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000007'::uuid, 20,  15,  now() + interval '3 days',   now() - interval '3 days',  'Produksi kemarin',            'WET', now()),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000007'::uuid, 15,  15,  now() + interval '5 days',   now() - interval '1 day',   'Baru datang',                 'WET', now()),
  -- Tahu
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000008'::uuid, 25,  20,  now() + interval '4 days',   now() - interval '2 days',  'Pabrik Tahu Sari',            'WET', now()),
  -- Ayam Beku
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000009'::uuid, 30,  25,  now() + interval '60 days',  now() - interval '20 days', 'Batch Maret',                 'FREEZER', now()),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000009'::uuid, 20,  20,  now() + interval '90 days',  now() - interval '10 days', 'Batch April',                 'FREEZER', now()),
  -- Ikan Kembung
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000010'::uuid, 15,  12,  now() + interval '45 days',  now() - interval '5 days',  'Supplier Ikan Laut',          'FREEZER', now()),
  -- Daging Sapi Giling (low stock - below par_level)
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000011'::uuid, 5,   4,   now() + interval '30 days',  now() - interval '3 days',  'Sisa stok — perlu restock',   'FREEZER', now()),
  -- Susu UHT
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000013'::uuid, 15,  14,  now() + interval '90 days',  now() - interval '5 days',  'Ultramilk',                   'WET', now()),
  -- Bawang Merah (below par)
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000022'::uuid, 3,   3,   now() + interval '30 days',  now() - interval '10 days', 'Stok hampir habis',           'DRY', now()),
  -- Minyak Goreng
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000029'::uuid, 20,  18,  '2027-06-01',                now() - interval '14 days', 'Bimoli 2lt × 10',            'DRY', now()),
  -- Cabe Merah
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000024'::uuid, 8,   7,   now() + interval '10 days',  now() - interval '2 days',  'Segar',                       'WET', now()),
  -- Kangkung
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000017'::uuid, 30,  25,  now() + interval '2 days',   now() - interval '1 day',   'Hampir expired — prioritaskan','WET', now());

-- ============= 5. OPNAMES =============
INSERT INTO public.opnames (id, item_id, lot_id, counted_quantity, note, zone, temperature_c, humidity_pct, reason, counted_by, created_at)
SELECT * FROM (VALUES
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000001'::uuid, (SELECT id FROM stock_lots WHERE item_id = 'b0000001-0000-0000-0000-000000000001'::uuid ORDER BY created_at LIMIT 1), 95, 'Opname rutin', 'DRY', null, 55, 'Routine', 'Staf Gudang', now() - interval '7 days'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000006'::uuid, (SELECT id FROM stock_lots WHERE item_id = 'b0000001-0000-0000-0000-000000000006'::uuid ORDER BY created_at DESC LIMIT 1), 28, 'Cocok dengan catatan', 'WET', 3.5, null, 'Routine', 'Staf Gudang', now() - interval '5 days'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000009'::uuid, (SELECT id FROM stock_lots WHERE item_id = 'b0000001-0000-0000-0000-000000000009'::uuid ORDER BY created_at LIMIT 1), 23, 'Selisih 2 kg — penyusutan', 'FREEZER', -22, null, 'Adjustment', 'Staf Gudang', now() - interval '3 days'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000007'::uuid, (SELECT id FROM stock_lots WHERE item_id = 'b0000001-0000-0000-0000-000000000007'::uuid ORDER BY created_at LIMIT 1), 15, 'Tempe rusak 5 papan — spoilage', 'WET', 2, null, 'Spoilage', 'Staf Gudang', now() - interval '2 days'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000017'::uuid, (SELECT id FROM stock_lots WHERE item_id = 'b0000001-0000-0000-0000-000000000017'::uuid ORDER BY created_at LIMIT 1), 25, 'Kangkung layu 5 ikat', 'WET', 4, null, 'Spoilage', 'Staf Gudang', now() - interval '1 day'),
  (gen_random_uuid(), 'b0000001-0000-0000-0000-000000000024'::uuid, (SELECT id FROM stock_lots WHERE item_id = 'b0000001-0000-0000-0000-000000000024'::uuid ORDER BY created_at LIMIT 1), 7, 'Masih segar, ok', 'WET', 3, null, 'Routine', 'Staf Gudang', now())
) AS v;

-- ============= 6. PURCHASES (12 transaksi) =============
INSERT INTO public.purchases (id, category, description, amount_idr, receipt_total_idr, receipt_photo, transport_amount_idr, supplier, items, purchased_at, created_by, created_by_name, created_at, verified, verified_by, verified_at)
SELECT * FROM (VALUES
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
   '[]'::jsonb, now() - interval '1 day', 'asisten@sppg.id', 'Asisten Belanja', now() - interval '1 day', false, NULL, NULL)
) AS v;

-- ============= 7. RECIPES (15 resep) =============
INSERT INTO public.recipes (id, name, servings, ingredients, instructions, calories_kcal, protein_g, carbs_g, fats_g, sodium_mg, allergens, created_at)
VALUES
  ('c0000001-0000-0000-0000-000000000001'::uuid, 'Nasi Goreng Sayur', 1,
   '[{"item_id":"b0000001-0000-0000-0000-000000000001","name":"Beras Premium","qty":0.15,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000006","name":"Telur Ayam","qty":0.05,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000029","name":"Minyak Goreng","qty":0.02,"unit":"liter"},{"item_id":"b0000001-0000-0000-0000-000000000016","name":"Wortel","qty":0.05,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000022","name":"Bawang Merah","qty":0.02,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","qty":0.01,"unit":"kg"}]'::jsonb,
   'Tumis bawang merah & putih. Masukkan telur, orak-arik. Masukkan nasi, wortel, kecap. Aduk rata. Sajikan.',
   350, 12, 50, 10, 800, '{telur,gluten}'::text[], now() - interval '60 days'),
  ('c0000001-0000-0000-0000-000000000002'::uuid, 'Sayur Sop Ayam', 1,
   '[{"item_id":"b0000001-0000-0000-0000-000000000009","name":"Ayam Beku","qty":0.06,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000016","name":"Wortel","qty":0.05,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000003","name":"Kentang","qty":0.08,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000021","name":"Kol","qty":0.03,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000022","name":"Bawang Merah","qty":0.01,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","qty":0.005,"unit":"kg"}]'::jsonb,
   'Rebus ayam hingga empuk. Masukkan kentang & wortel. Masukkan kol & bumbu. Sajikan hangat.',
   280, 18, 25, 8, 600, '{}'::text[], now() - interval '55 days'),
  ('c0000001-0000-0000-0000-000000000003'::uuid, 'Tempe Goreng Tepung', 1,
   '[{"item_id":"b0000001-0000-0000-0000-000000000007","name":"Tempe","qty":0.1,"unit":"papan"},{"item_id":"b0000001-0000-0000-0000-000000000029","name":"Minyak Goreng","qty":0.03,"unit":"liter"},{"item_id":"b0000001-0000-0000-0000-000000000027","name":"Garam","qty":0.002,"unit":"kg"}]'::jsonb,
   'Potong tempe tipis. Celup ke adonan tepung berbumbu. Goreng hingga kuning keemasan.',
   220, 10, 18, 14, 200, '{kedelai}'::text[], now() - interval '50 days'),
  ('c0000001-0000-0000-0000-000000000004'::uuid, 'Ikan Kembung Goreng', 1,
   '[{"item_id":"b0000001-0000-0000-0000-000000000010","name":"Ikan Kembung","qty":0.1,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000029","name":"Minyak Goreng","qty":0.03,"unit":"liter"},{"item_id":"b0000001-0000-0000-0000-000000000024","name":"Cabe Merah","qty":0.005,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","qty":0.005,"unit":"kg"}]'::jsonb,
   'Bersihkan ikan, lumuri bumbu halus. Diamkan 15 menit. Goreng hingga matang.',
   300, 22, 0, 20, 250, '{ikan}'::text[], now() - interval '48 days'),
  ('c0000001-0000-0000-0000-000000000005'::uuid, 'Tumis Labu Kuning', 1,
   '[{"item_id":"b0000001-0000-0000-0000-000000000020","name":"Labu Kuning","qty":0.15,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000022","name":"Bawang Merah","qty":0.01,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","qty":0.005,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000029","name":"Minyak Goreng","qty":0.01,"unit":"liter"}]'::jsonb,
   'Potong labu dadu. Tumis bawang hingga harum, masukkan labu. Tambah air sedikit. Masak hingga empuk.',
   150, 3, 28, 4, 100, '{}'::text[], now() - interval '45 days'),
  ('c0000001-0000-0000-0000-000000000006'::uuid, 'Cap Cay', 1,
   '[{"item_id":"b0000001-0000-0000-0000-000000000016","name":"Wortel","qty":0.05,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000018","name":"Buncis","qty":0.05,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000019","name":"Tomat","qty":0.03,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000021","name":"Kol","qty":0.03,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","qty":0.005,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000008","name":"Tahu","qty":0.05,"unit":"papan"}]'::jsonb,
   'Tumis bawang putih. Masukkan wortel, buncis, kol. Tambah tahu, tomat. Bumbui saus tiram.',
   180, 8, 22, 6, 550, '{kedelai}'::text[], now() - interval '40 days'),
  ('c0000001-0000-0000-0000-000000000007'::uuid, 'Telur Balado', 1,
   '[{"item_id":"b0000001-0000-0000-0000-000000000006","name":"Telur Ayam","qty":0.1,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000024","name":"Cabe Merah","qty":0.03,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000022","name":"Bawang Merah","qty":0.015,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000019","name":"Tomat","qty":0.02,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000029","name":"Minyak Goreng","qty":0.02,"unit":"liter"}]'::jsonb,
   'Rebus telur, goreng sebentar. Haluskan cabe, bawang, tomat. Tumis sambal, masukkan telur. Aduk rata.',
   320, 14, 8, 26, 350, '{telur}'::text[], now() - interval '35 days'),
  ('c0000001-0000-0000-0000-000000000008'::uuid, 'Perkedel Kentang', 1,
   '[{"item_id":"b0000001-0000-0000-0000-000000000003","name":"Kentang","qty":0.15,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000006","name":"Telur Ayam","qty":0.02,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000022","name":"Bawang Merah","qty":0.01,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000027","name":"Garam","qty":0.001,"unit":"kg"}]'::jsonb,
   'Kukus kentang, haluskan. Campur bawang goreng, telur, garam. Bentuk bulat, goreng.',
   180, 5, 25, 8, 180, '{telur}'::text[], now() - interval '30 days'),
  ('c0000001-0000-0000-0000-000000000009'::uuid, 'Tumis Kangkung', 1,
   '[{"item_id":"b0000001-0000-0000-0000-000000000017","name":"Kangkung","qty":0.2,"unit":"ikat"},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","qty":0.005,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000024","name":"Cabe Merah","qty":0.005,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000027","name":"Garam","qty":0.001,"unit":"kg"}]'::jsonb,
   'Tumis bawang putih & cabe. Masukkan kangkung. Aduk cepat, tambah garam. Sajikan.',
   80, 4, 10, 3, 150, '{}'::text[], now() - interval '28 days'),
  ('c0000001-0000-0000-0000-000000000010'::uuid, 'Sup Jagung', 1,
   '[{"item_id":"b0000001-0000-0000-0000-000000000005","name":"Jagung Manis","qty":0.1,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000006","name":"Telur Ayam","qty":0.03,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","qty":0.005,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000016","name":"Wortel","qty":0.03,"unit":"kg"}]'::jsonb,
   'Rebus jagung & wortel. Masukkan kocokan telur sambil diaduk. Bumbui.',
   160, 7, 25, 4, 400, '{telur}'::text[], now() - interval '25 days'),
  ('c0000001-0000-0000-0000-000000000011'::uuid, 'Ayam Goreng', 1,
   '[{"item_id":"b0000001-0000-0000-0000-000000000009","name":"Ayam Beku","qty":0.1,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","qty":0.005,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000029","name":"Minyak Goreng","qty":0.03,"unit":"liter"},{"item_id":"b0000001-0000-0000-0000-000000000027","name":"Garam","qty":0.002,"unit":"kg"}]'::jsonb,
   'Ungkep ayam dengan bumbu bawang putih & garam hingga empuk. Goreng hingga kecoklatan.',
   280, 24, 0, 20, 300, '{}'::text[], now() - interval '22 days'),
  ('c0000001-0000-0000-0000-000000000012'::uuid, 'Tahu Bacem', 1,
   '[{"item_id":"b0000001-0000-0000-0000-000000000008","name":"Tahu","qty":0.15,"unit":"papan"},{"item_id":"b0000001-0000-0000-0000-000000000028","name":"Kecap Manis","qty":0.02,"unit":"botol"},{"item_id":"b0000001-0000-0000-0000-000000000022","name":"Bawang Merah","qty":0.01,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000026","name":"Gula Pasir","qty":0.01,"unit":"kg"}]'::jsonb,
   'Rebus tahu dengan kecap, gula, bawang hingga bumbu meresap. Goreng sebentar.',
   190, 10, 15, 10, 450, '{kedelai}'::text[], now() - interval '20 days'),
  ('c0000001-0000-0000-0000-000000000013'::uuid, 'Oseng Buncis', 1,
   '[{"item_id":"b0000001-0000-0000-0000-000000000018","name":"Buncis","qty":0.12,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000022","name":"Bawang Merah","qty":0.01,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000023","name":"Bawang Putih","qty":0.005,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000029","name":"Minyak Goreng","qty":0.01,"unit":"liter"}]'::jsonb,
   'Iris buncis serong. Tumis bawang, masukkan buncis. Tambah air sedikit. Masak hingga matang.',
   110, 5, 14, 5, 120, '{}'::text[], now() - interval '18 days'),
  ('c0000001-0000-0000-0000-000000000014'::uuid, 'Bubur Ayam', 1,
   '[{"item_id":"b0000001-0000-0000-0000-000000000001","name":"Beras Premium","qty":0.1,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000009","name":"Ayam Beku","qty":0.05,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000022","name":"Bawang Merah","qty":0.01,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000027","name":"Garam","qty":0.001,"unit":"kg"}]'::jsonb,
   'Rebus beras dengan kaldu ayam hingga menjadi bubur. Suwir ayam. Sajikan dengan bawang goreng.',
   300, 15, 42, 8, 500, '{}'::text[], now() - interval '15 days'),
  ('c0000001-0000-0000-0000-000000000015'::uuid, 'Pisang Goreng', 1,
   '[{"item_id":"b0000001-0000-0000-0000-000000000026","name":"Gula Pasir","qty":0.01,"unit":"kg"},{"item_id":"b0000001-0000-0000-0000-000000000029","name":"Minyak Goreng","qty":0.02,"unit":"liter"}]'::jsonb,
   'Potong pisang. Celup ke adonan tepung & gula. Goreng hingga kecoklatan.',
   200, 2, 32, 8, 50, '{gluten}'::text[], now() - interval '10 days');

-- ============= 8. MENUS (minggu ini + minggu lalu) =============
-- Minggu ini: mixed statuses
INSERT INTO public.menus (id, week_start, day, recipe_ids, portions, status, approved_by, approved_by_name, approved_at, signature, created_at)
VALUES
  ('d0000001-0000-0000-0000-000000000001'::uuid, to_char(date_trunc('week', now()), 'YYYY-MM-DD'), 'mon',
   ARRAY['c0000001-0000-0000-0000-000000000001'::text, 'c0000001-0000-0000-0000-000000000005'::text, 'c0000001-0000-0000-0000-000000000008'::text],
   100, 'APPROVED', 'a0000001-0000-0000-0000-000000000007'::text, 'Ahli Gizi Maya', now() - interval '2 days',
   'Ahli Gizi Maya (nutritionist) · Menu seimbang · 2026-07-02', now() - interval '7 days'),
  ('d0000001-0000-0000-0000-000000000002'::uuid, to_char(date_trunc('week', now()), 'YYYY-MM-DD'), 'tue',
   ARRAY['c0000001-0000-0000-0000-000000000002'::text, 'c0000001-0000-0000-0000-000000000007'::text, 'c0000001-0000-0000-0000-000000000009'::text],
   100, 'APPROVED', 'a0000001-0000-0000-0000-000000000007'::text, 'Ahli Gizi Maya', now() - interval '1 day',
   'Ahli Gizi Maya (nutritionist) · Adjusted protein · 2026-07-03', now() - interval '6 days'),
  ('d0000001-0000-0000-0000-000000000003'::uuid, to_char(date_trunc('week', now()), 'YYYY-MM-DD'), 'wed',
   ARRAY['c0000001-0000-0000-0000-000000000011'::text, 'c0000001-0000-0000-0000-000000000013'::text, 'c0000001-0000-0000-0000-000000000015'::text],
   100, 'PENDING_REVIEW', NULL, NULL, NULL, NULL, now() - interval '5 days'),
  ('d0000001-0000-0000-0000-000000000004'::uuid, to_char(date_trunc('week', now()), 'YYYY-MM-DD'), 'thu',
   ARRAY['c0000001-0000-0000-0000-000000000006'::text, 'c0000001-0000-0000-0000-000000000010'::text],
   100, 'DRAFT', NULL, NULL, NULL, NULL, now() - interval '4 days'),
  ('d0000001-0000-0000-0000-000000000005'::uuid, to_char(date_trunc('week', now()), 'YYYY-MM-DD'), 'fri',
   ARRAY['c0000001-0000-0000-0000-000000000004'::text, 'c0000001-0000-0000-0000-000000000012'::text, 'c0000001-0000-0000-0000-000000000014'::text],
   100, 'DRAFT', NULL, NULL, NULL, NULL, now() - interval '3 days');

-- Minggu lalu: all APPROVED
INSERT INTO public.menus (id, week_start, day, recipe_ids, portions, status, approved_by, approved_by_name, approved_at, signature, created_at)
SELECT
  gen_random_uuid(),
  to_char(date_trunc('week', now()) - interval '7 days', 'YYYY-MM-DD'),
  day,
  recipe_ids,
  100, 'APPROVED',
  'a0000001-0000-0000-0000-000000000007'::text, 'Ahli Gizi Maya',
  now() - interval '8 days',
  'Ahli Gizi Maya (nutritionist) · signed week prior',
  now() - interval '14 days'
FROM (VALUES
  ('mon', ARRAY['c0000001-0000-0000-0000-000000000001'::text, 'c0000001-0000-0000-0000-000000000003'::text]),
  ('tue', ARRAY['c0000001-0000-0000-0000-000000000002'::text, 'c0000001-0000-0000-0000-000000000009'::text]),
  ('wed', ARRAY['c0000001-0000-0000-0000-000000000011'::text, 'c0000001-0000-0000-0000-000000000005'::text]),
  ('thu', ARRAY['c0000001-0000-0000-0000-000000000006'::text, 'c0000001-0000-0000-0000-000000000013'::text]),
  ('fri', ARRAY['c0000001-0000-0000-0000-000000000004'::text, 'c0000001-0000-0000-0000-000000000015'::text])
) AS days(day, recipe_ids);

-- ============= 9. AUDIT TRAIL =============
INSERT INTO public.audit_trail (id, timestamp, actor, actor_id, actor_role, action, entity, entity_id, changes, note)
SELECT * FROM (VALUES
  (gen_random_uuid(), now() - interval '30 days', 'Asisten Belanja (field_assistant)', 'a0000001-0000-0000-0000-000000000005'::text, 'field_assistant', 'CREATE_PURCHASE', 'purchases', gen_random_uuid()::text, NULL::jsonb, 'Pembelian Beras Premium 150kg'),
  (gen_random_uuid(), now() - interval '28 days', 'Sri Akuntansi (accountant)', 'a0000001-0000-0000-0000-000000000002'::text, 'accountant', 'VERIFY_PURCHASE', 'purchases', gen_random_uuid()::text, '{"verified":{"old":false,"new":true}}'::jsonb, 'Verifikasi pembelian beras'),
  (gen_random_uuid(), now() - interval '20 days', 'Asisten Belanja (field_assistant)', 'a0000001-0000-0000-0000-000000000005'::text, 'field_assistant', 'CREATE_PURCHASE', 'purchases', gen_random_uuid()::text, NULL::jsonb, 'Telur Ayam 30kg + Telur Puyuh 5kg'),
  (gen_random_uuid(), now() - interval '14 days', 'Chef Wulan (head_chef)', 'a0000001-0000-0000-0000-000000000004'::text, 'head_chef', 'CREATE_RECIPE', 'recipes', 'c0000001-0000-0000-0000-000000000001'::text, NULL::jsonb, 'Resep baru: Nasi Goreng Sayur'),
  (gen_random_uuid(), now() - interval '14 days', 'Chef Wulan (head_chef)', 'a0000001-0000-0000-0000-000000000004'::text, 'head_chef', 'CREATE_RECIPE', 'recipes', 'c0000001-0000-0000-0000-000000000002'::text, NULL::jsonb, 'Resep baru: Sayur Sop Ayam'),
  (gen_random_uuid(), now() - interval '12 days', 'Chef Wulan (head_chef)', 'a0000001-0000-0000-0000-000000000004'::text, 'head_chef', 'CREATE_RECIPE', 'recipes', 'c0000001-0000-0000-0000-000000000006'::text, NULL::jsonb, 'Resep baru: Cap Cay'),
  (gen_random_uuid(), now() - interval '10 days', 'Ahli Gizi Maya (nutritionist)', 'a0000001-0000-0000-0000-000000000007'::text, 'nutritionist', 'UPDATE_RECIPE', 'recipes', 'c0000001-0000-0000-0000-000000000001'::text, '{"calories_kcal":{"old":320,"new":350},"protein_g":{"old":10,"new":12}}'::jsonb, 'Update profil gizi Nasi Goreng'),
  (gen_random_uuid(), now() - interval '8 days', 'Ahli Gizi Maya (nutritionist)', 'a0000001-0000-0000-0000-000000000007'::text, 'nutritionist', 'MENU_APPROVED', 'menus', 'd0000001-0000-0000-0000-000000000001'::text, '{"status":{"old":"PENDING_REVIEW","new":"APPROVED"}}'::jsonb, 'Menu Senin disetujui'),
  (gen_random_uuid(), now() - interval '7 days', 'Chef Wulan (head_chef)', 'a0000001-0000-0000-0000-000000000004'::text, 'head_chef', 'CREATE_MENU', 'menus', 'd0000001-0000-0000-0000-000000000005'::text, NULL::jsonb, 'Menu Jumat dibuat'),
  (gen_random_uuid(), now() - interval '6 days', 'Administrator (admin)', 'a0000001-0000-0000-0000-000000000001'::text, 'admin', 'UPDATE_ITEM', 'items', 'b0000001-0000-0000-0000-000000000001'::text, '{"par_level":{"old":40,"new":50}}'::jsonb, 'Update par-level beras'),
  (gen_random_uuid(), now() - interval '5 days', 'Staf Gudang (field_staff)', 'a0000001-0000-0000-0000-000000000006'::text, 'field_staff', 'OPNAME', 'opnames', gen_random_uuid()::text, NULL::jsonb, 'Opname rutin gudang kering — beras 95kg'),
  (gen_random_uuid(), now() - interval '3 days', 'Staf Gudang (field_staff)', 'a0000001-0000-0000-0000-000000000006'::text, 'field_staff', 'OPNAME', 'opnames', gen_random_uuid()::text, NULL::jsonb, 'Spoilage tempe 5 papan'),
  (gen_random_uuid(), now() - interval '2 days', 'Sri Akuntansi (accountant)', 'a0000001-0000-0000-0000-000000000002'::text, 'accountant', 'VERIFY_PURCHASE', 'purchases', gen_random_uuid()::text, '{"verified":{"old":false,"new":true}}'::jsonb, 'Verifikasi sayur mingguan'),
  (gen_random_uuid(), now() - interval '1 day', 'Asisten Belanja (field_assistant)', 'a0000001-0000-0000-0000-000000000005'::text, 'field_assistant', 'CREATE_PURCHASE', 'purchases', gen_random_uuid()::text, NULL::jsonb, 'Transport belanja harian'),
  (gen_random_uuid(), now(), 'Staf Gudang (field_staff)', 'a0000001-0000-0000-0000-000000000006'::text, 'field_staff', 'OPNAME', 'opnames', gen_random_uuid()::text, NULL::jsonb, 'Opname cabe merah — ok 7kg')
) AS v;

-- ============= 10. SETTINGS =============
INSERT INTO public.settings (key, value) VALUES ('dapur_name', 'SPPG MBG Dapur Contoh') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.settings (key, value) VALUES ('logo', '') ON CONFLICT (key) DO NOTHING;

-- ============= 11. ANGGARAN SAMPLE =============
INSERT INTO public.anggaran_beneficiaries (id, plan_date, total_portions, price_per_portion, rab, actual, notes, created_by)
VALUES
  (gen_random_uuid(), CURRENT_DATE - 6, 425, 15000, 6375000, 6200000, 'Senin', 'a0000001-0000-0000-0000-000000000005'),
  (gen_random_uuid(), CURRENT_DATE - 5, 425, 15000, 6375000, 6300000, 'Selasa', 'a0000001-0000-0000-0000-000000000005'),
  (gen_random_uuid(), CURRENT_DATE - 4, 425, 15000, 6375000, 6350000, 'Rabu', 'a0000001-0000-0000-0000-000000000005'),
  (gen_random_uuid(), CURRENT_DATE - 3, 425, 15000, 6375000, 6280000, 'Kamis', 'a0000001-0000-0000-0000-000000000005'),
  (gen_random_uuid(), CURRENT_DATE - 2, 425, 15000, 6375000, 6320000, 'Jumat', 'a0000001-0000-0000-0000-000000000005');
