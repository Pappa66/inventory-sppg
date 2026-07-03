-- SPPG MBG — Seed Data
-- Gunakan reset.sql untuk reset + seed lengkap.
-- File ini hanya untuk tambahan data jika reset.sql sudah dijalankan.

-- ==================== USERS ====================
INSERT INTO users (id, email, name, role, is_active, password_hash, created_at)
SELECT * FROM (VALUES
  (gen_random_uuid(), 'admin@sppg.id',     'Administrator',    'admin',           true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  (gen_random_uuid(), 'akuntan@sppg.id',   'Sri Akuntansi',    'accountant',      true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  (gen_random_uuid(), 'kepala@sppg.id',    'Pak Kepala Dapur', 'kitchen_head',    true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  (gen_random_uuid(), 'chef@sppg.id',      'Chef Wulan',       'head_chef',       true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  (gen_random_uuid(), 'asisten@sppg.id',   'Asisten Belanja',  'field_assistant', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  (gen_random_uuid(), 'staf@sppg.id',      'Staf Gudang',      'field_staff',     true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  (gen_random_uuid(), 'ahligizi@sppg.id',  'Ahli Gizi Maya',   'nutritionist',    true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now())
) AS v
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = v.column2);

-- ==================== ITEMS ====================
INSERT INTO items (id, name, unit, category, par_level, price_per_unit, zone, allergens, created_at, updated_at)
SELECT * FROM (VALUES
  ('b0000001-0000-0000-0000-000000000001'::uuid, 'Beras Premium',     'kg',     'Karbo',   50,  15000, 'DRY',     '{}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000002'::uuid, 'Beras Merah',       'kg',     'Karbo',   10,  22000, 'DRY',     '{}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000003'::uuid, 'Kentang',           'kg',     'Karbo',   25,  10000, 'DRY',     '{}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000006'::uuid, 'Telur Ayam',        'kg',     'Protein', 20,  28000, 'WET',     '{telur}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000007'::uuid, 'Tempe',             'papan',  'Protein', 25,   7000, 'WET',     '{kedelai}'::text[],   now(), now()),
  ('b0000001-0000-0000-0000-000000000009'::uuid, 'Ayam Beku',         'kg',     'Protein', 15,  38000, 'FREEZER', '{}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000015'::uuid, 'Bayam',             'ikat',   'Sayur',   30,   4000, 'WET',     '{}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000016'::uuid, 'Wortel',            'kg',     'Sayur',   15,  12000, 'WET',     '{}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000022'::uuid, 'Bawang Merah',      'kg',     'Bumbu',   10,  25000, 'DRY',     '{}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000023'::uuid, 'Bawang Putih',      'kg',     'Bumbu',    8,  20000, 'DRY',     '{}'::text[],     now(), now()),
  ('b0000001-0000-0000-0000-000000000029'::uuid, 'Minyak Goreng',     'liter',  'Bumbu',   12,  18000, 'DRY',     '{}'::text[],     now(), now())
) AS v
WHERE NOT EXISTS (SELECT 1 FROM items LIMIT 1);

-- Untuk data lengkap (30 items, 15 recipes, menus, opnames, audit trail, dll.),
-- jalankan reset.sql di Supabase SQL Editor.
-- File ini hanya menyediakan data minimal untuk development.
