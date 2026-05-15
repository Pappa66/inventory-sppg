-- SPPG MBG — Seed Data
-- Jalankan setelah supabase-schema.sql

-- ==================== USERS ====================
-- Semua password: admin123
INSERT INTO users (id, email, name, role, is_active, password_hash, created_at)
SELECT * FROM (VALUES
  (gen_random_uuid(), 'admin@sppg.id', 'Administrator', 'admin', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  (gen_random_uuid(), 'akuntan@sppg.id', 'Sri Akuntansi', 'accountant', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  (gen_random_uuid(), 'kepala@sppg.id', 'Pak Kepala Dapur', 'kitchen_head', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  (gen_random_uuid(), 'chef@sppg.id', 'Chef Wulan', 'head_chef', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  (gen_random_uuid(), 'asisten@sppg.id', 'Asisten Belanja', 'field_assistant', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  (gen_random_uuid(), 'staf@sppg.id', 'Staf Gudang', 'field_staff', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now()),
  (gen_random_uuid(), 'ahligizi@sppg.id', 'Ahli Gizi Maya', 'nutritionist', true, '$2a$10$Pz32qBguBXmHlFzQfE4uIuk8hWZEVNHcsS2dcrf2FcfCqGnh8iQW2', now())
) AS v
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = v.column2);

-- ==================== ITEMS (Master Bahan) ====================
INSERT INTO items (id, name, unit, category, par_level, price_per_unit, zone, allergens, created_at, updated_at)
SELECT * FROM (VALUES
  ('a1000001-0000-0000-0000-000000000001'::uuid, 'Beras Premium', 'kg', 'Karbo', 50, 15000, 'DRY', '{}'::text[], now(), now()),
  ('a1000001-0000-0000-0000-000000000002'::uuid, 'Telur Ayam', 'kg', 'Protein', 20, 28000, 'WET', '{telur}', now(), now()),
  ('a1000001-0000-0000-0000-000000000003'::uuid, 'Bayam', 'ikat', 'Sayur', 30, 4000, 'WET', '{}'::text[], now(), now()),
  ('a1000001-0000-0000-0000-000000000004'::uuid, 'Wortel', 'kg', 'Sayur', 15, 12000, 'WET', '{}'::text[], now(), now()),
  ('a1000001-0000-0000-0000-000000000005'::uuid, 'Minyak Goreng', 'liter', 'Bumbu', 10, 18000, 'DRY', '{}'::text[], now(), now()),
  ('a1000001-0000-0000-0000-000000000006'::uuid, 'Tempe', 'papan', 'Protein', 25, 7000, 'WET', '{kedelai}', now(), now()),
  ('a1000001-0000-0000-0000-000000000007'::uuid, 'Ayam Beku', 'kg', 'Protein', 10, 38000, 'FREEZER', '{}'::text[], now(), now()),
  ('a1000001-0000-0000-0000-000000000008'::uuid, 'Tahu', 'papan', 'Protein', 20, 5000, 'WET', '{kedelai}', now(), now()),
  ('a1000001-0000-0000-0000-000000000009'::uuid, 'Ikan Kembung', 'kg', 'Protein', 8, 35000, 'FREEZER', '{ikan}', now(), now()),
  ('a1000001-0000-0000-0000-000000000010'::uuid, 'Kentang', 'kg', 'Karbo', 25, 10000, 'DRY', '{}'::text[], now(), now()),
  ('a1000001-0000-0000-0000-000000000011'::uuid, 'Bawang Merah', 'kg', 'Bumbu', 10, 25000, 'DRY', '{}'::text[], now(), now()),
  ('a1000001-0000-0000-0000-000000000012'::uuid, 'Bawang Putih', 'kg', 'Bumbu', 8, 30000, 'DRY', '{}'::text[], now(), now()),
  ('a1000001-0000-0000-0000-000000000013'::uuid, 'Cabe Merah', 'kg', 'Bumbu', 5, 40000, 'DRY', '{}'::text[], now(), now()),
  ('a1000001-0000-0000-0000-000000000014'::uuid, 'Gula Pasir', 'kg', 'Bumbu', 15, 14000, 'DRY', '{}'::text[], now(), now()),
  ('a1000001-0000-0000-0000-000000000015'::uuid, 'Kecap Manis', 'botol', 'Bumbu', 5, 12000, 'DRY', '{kedelai}', now(), now()),
  ('a1000001-0000-0000-0000-000000000016'::uuid, 'Susu UHT', 'liter', 'Protein', 10, 18000, 'WET', '{susu}', now(), now()),
  ('a1000001-0000-0000-0000-000000000017'::uuid, 'Mie Telur', 'kg', 'Karbo', 15, 12000, 'DRY', '{telur,gluten}', now(), now()),
  ('a1000001-0000-0000-0000-000000000018'::uuid, 'Beras Merah', 'kg', 'Karbo', 10, 22000, 'DRY', '{}'::text[], now(), now()),
  ('a1000001-0000-0000-0000-000000000019'::uuid, 'Daging Sapi Giling', 'kg', 'Protein', 5, 55000, 'FREEZER', '{}'::text[], now(), now()),
  ('a1000001-0000-0000-0000-000000000020'::uuid, 'Labu Kuning', 'kg', 'Sayur', 12, 8000, 'DRY', '{}'::text[], now(), now())
) AS v
WHERE NOT EXISTS (SELECT 1 FROM items LIMIT 1);

-- ==================== STOCK LOTS ====================
INSERT INTO stock_lots (id, item_id, quantity, actual_quantity, expiry_date, received_at, note, zone, created_at)
SELECT * FROM (VALUES
  (gen_random_uuid(), 'a1000001-0000-0000-0000-000000000001'::uuid, 100, 85, '2026-07-15', now() - interval '14 days', 'Stok awal bulan', 'DRY', now()),
  (gen_random_uuid(), 'a1000001-0000-0000-0000-000000000002'::uuid, 30, 22, '2026-05-30', now() - interval '7 days', 'Supplier Bina Mandiri', 'WET', now()),
  (gen_random_uuid(), 'a1000001-0000-0000-0000-000000000003'::uuid, 40, 35, now() + interval '3 days', now() - interval '2 days', 'Panen lokal', 'WET', now()),
  (gen_random_uuid(), 'a1000001-0000-0000-0000-000000000004'::uuid, 25, 20, now() + interval '7 days', now() - interval '5 days', 'Supplier sayur', 'WET', now()),
  (gen_random_uuid(), 'a1000001-0000-0000-0000-000000000005'::uuid, 20, 15, '2026-12-31', now() - interval '10 days', 'Gudang pusat', 'DRY', now()),
  (gen_random_uuid(), 'a1000001-0000-0000-0000-000000000006'::uuid, 50, 40, '2026-05-28', now() - interval '3 days', 'Produksi harian', 'WET', now()),
  (gen_random_uuid(), 'a1000001-0000-0000-0000-000000000007'::uuid, 30, 25, '2026-08-01', now() - interval '20 days', 'Supplier unggas', 'FREEZER', now()),
  (gen_random_uuid(), 'a1000001-0000-0000-0000-000000000008'::uuid, 40, 35, '2026-05-29', now() - interval '2 days', 'Produksi harian', 'WET', now()),
  (gen_random_uuid(), 'a1000001-0000-0000-0000-000000000009'::uuid, 15, 12, '2026-06-15', now() - interval '5 days', 'Supplier ikan', 'FREEZER', now()),
  (gen_random_uuid(), 'a1000001-0000-0000-0000-000000000010'::uuid, 40, 30, '2026-06-30', now() - interval '12 days', 'Gudang pusat', 'DRY', now())
) AS v;

-- ==================== PURCHASES ====================
INSERT INTO purchases (id, category, description, amount_idr, receipt_total_idr, transport_amount_idr, supplier, items, purchased_at, created_by, created_by_name, created_at, verified, verified_by, verified_at)
SELECT * FROM (VALUES
  (gen_random_uuid(), 'STOCK', 'Pembelian beras 100kg', 1500000, 1500000, 50000, 'UD. Beras Jaya', '[{"item_id":"a1000001-0000-0000-0000-000000000001","quantity":100}]'::jsonb, now() - interval '14 days', 'asisten@sppg.id', 'Asisten Belanja', now() - interval '14 days', true, 'akuntan@sppg.id', now() - interval '12 days'),
  (gen_random_uuid(), 'STOCK', 'Telur 30kg', 840000, 840000, 0, 'Bina Mandiri Farm', '[{"item_id":"a1000001-0000-0000-0000-000000000002","quantity":30}]'::jsonb, now() - interval '7 days', 'asisten@sppg.id', 'Asisten Belanja', now() - interval '7 days', true, 'akuntan@sppg.id', now() - interval '6 days'),
  (gen_random_uuid(), 'STOCK', 'Sayur mayur', 280000, 260000, 20000, 'Pasar Induk', '[{"item_id":"a1000001-0000-0000-0000-000000000003","quantity":40},{"item_id":"a1000001-0000-0000-0000-000000000004","quantity":25}]'::jsonb, now() - interval '5 days', 'staf@sppg.id', 'Staf Gudang', now() - interval '5 days', true, 'akuntan@sppg.id', now() - interval '4 days'),
  (gen_random_uuid(), 'STOCK', 'Minyak goreng & bumbu', 540000, 540000, 0, 'Toko Sembako', '[{"item_id":"a1000001-0000-0000-0000-000000000005","quantity":20},{"item_id":"a1000001-0000-0000-0000-000000000011","quantity":10}]'::jsonb, now() - interval '10 days', 'asisten@sppg.id', 'Asisten Belanja', now() - interval '10 days', false, null, null),
  (gen_random_uuid(), 'STOCK', 'Protein: tempe, tahu, ayam', 1250000, 1200000, 50000, 'Supplier Protein', '[{"item_id":"a1000001-0000-0000-0000-000000000006","quantity":50},{"item_id":"a1000001-0000-0000-0000-000000000007","quantity":30}]'::jsonb, now() - interval '3 days', 'asisten@sppg.id', 'Asisten Belanja', now() - interval '3 days', false, null, null),
  (gen_random_uuid(), 'OPERATIONAL', 'Gas LPG 3kg (10 tabung)', 200000, 200000, 0, 'Agen Gas', '[]'::jsonb, now() - interval '6 days', 'staf@sppg.id', 'Staf Gudang', now() - interval '6 days', true, 'akuntan@sppg.id', now() - interval '5 days'),
  (gen_random_uuid(), 'OPERATIONAL', 'Kebersihan dapur', 150000, 150000, 0, 'Toko Alat', '[]'::jsonb, now() - interval '4 days', 'staf@sppg.id', 'Staf Gudang', now() - interval '4 days', false, null, null),
  (gen_random_uuid(), 'OPERATIONAL', 'Transport belanja', 100000, null, 100000, null, '[]'::jsonb, now() - interval '2 days', 'asisten@sppg.id', 'Asisten Belanja', now() - interval '2 days', false, null, null)
) AS v;

-- ==================== RECIPES ====================
INSERT INTO recipes (id, name, servings, ingredients, instructions, calories_kcal, protein_g, carbs_g, fats_g, sodium_mg, allergens, created_at)
SELECT * FROM (VALUES
  (gen_random_uuid(), 'Nasi Goreng Sayur', 50, '[{"item_id":"a1000001-0000-0000-0000-000000000001","name":"Beras Premium","quantity":5,"unit":"kg"},{"item_id":"a1000001-0000-0000-0000-000000000002","name":"Telur Ayam","quantity":10,"unit":"kg"},{"item_id":"a1000001-0000-0000-0000-000000000005","name":"Minyak Goreng","quantity":1,"unit":"liter"},{"item_id":"a1000001-0000-0000-0000-000000000011","name":"Bawang Merah","quantity":0.5,"unit":"kg"},{"item_id":"a1000001-0000-0000-0000-000000000012","name":"Bawang Putih","quantity":0.3,"unit":"kg"}]'::jsonb, 'Tumis bumbu halus, masukkan telur, nasi, sayur. Aduk rata.', 350, 12, 45, 10, 400, '{telur,gluten}'::text[], now() - interval '30 days'),
  (gen_random_uuid(), 'Sayur Sop Ayam', 50, '[{"item_id":"a1000001-0000-0000-0000-000000000007","name":"Ayam Beku","quantity":3,"unit":"kg"},{"item_id":"a1000001-0000-0000-0000-000000000004","name":"Wortel","quantity":2,"unit":"kg"},{"item_id":"a1000001-0000-0000-0000-000000000010","name":"Kentang","quantity":3,"unit":"kg"},{"item_id":"a1000001-0000-0000-0000-000000000011","name":"Bawang Merah","quantity":0.3,"unit":"kg"}]'::jsonb, 'Rebus ayam, masukkan sayur bertahap. Bumbui.', 280, 18, 25, 8, 350, '{}'::text[], now() - interval '28 days'),
  (gen_random_uuid(), 'Tempe Goreng Tepung', 50, '[{"item_id":"a1000001-0000-0000-0000-000000000006","name":"Tempe","quantity":5,"unit":"papan"},{"item_id":"a1000001-0000-0000-0000-000000000005","name":"Minyak Goreng","quantity":2,"unit":"liter"},{"item_id":"a1000001-0000-0000-0000-000000000017","name":"Mie Telur","quantity":1,"unit":"kg"}]'::jsonb, 'Potong tempe, celup adonan tepung, goreng hingga kuning.', 220, 10, 18, 14, 200, '{kedelai,gluten}'::text[], now() - interval '25 days'),
  (gen_random_uuid(), 'Tumis Labu Kuning', 50, '[{"item_id":"a1000001-0000-0000-0000-000000000020","name":"Labu Kuning","quantity":4,"unit":"kg"},{"item_id":"a1000001-0000-0000-0000-000000000011","name":"Bawang Merah","quantity":0.3,"unit":"kg"},{"item_id":"a1000001-0000-0000-0000-000000000012","name":"Bawang Putih","quantity":0.2,"unit":"kg"}]'::jsonb, 'Tumis bumbu, masukkan labu, tambah air sedikit.', 150, 3, 28, 4, 100, '{}'::text[], now() - interval '22 days'),
  (gen_random_uuid(), 'Ikan Kembung Goreng', 50, '[{"item_id":"a1000001-0000-0000-0000-000000000009","name":"Ikan Kembung","quantity":5,"unit":"kg"},{"item_id":"a1000001-0000-0000-0000-000000000005","name":"Minyak Goreng","quantity":2,"unit":"liter"},{"item_id":"a1000001-0000-0000-0000-000000000013","name":"Cabe Merah","quantity":0.2,"unit":"kg"}]'::jsonb, 'Bersihkan ikan, marinasi, goreng hingga matang.', 300, 22, 0, 20, 250, '{ikan}'::text[], now() - interval '20 days')
) AS v;

-- ==================== MENUS ====================
INSERT INTO menus (id, week_start, day, recipe_ids, portions, status, approved_by, approved_by_name, approved_at, signature, created_at)
SELECT * FROM (VALUES
  (gen_random_uuid(), (SELECT to_char(now(), 'YYYY-MM-DD')), 'mon', ARRAY[(SELECT id FROM recipes ORDER BY created_at LIMIT 1)::text], 100, 'APPROVED', (SELECT id FROM users WHERE email='ahligizi@sppg.id')::text, 'Ahli Gizi Maya', now() - interval '3 days', 'Ahli Gizi Maya (nutritionist) · signed', now() - interval '7 days'),
  (gen_random_uuid(), (SELECT to_char(now(), 'YYYY-MM-DD')), 'tue', ARRAY[(SELECT id FROM recipes ORDER BY created_at LIMIT 1 OFFSET 1)::text], 100, 'APPROVED', (SELECT id FROM users WHERE email='ahligizi@sppg.id')::text, 'Ahli Gizi Maya', now() - interval '2 days', 'Ahli Gizi Maya (nutritionist) · signed', now() - interval '7 days'),
  (gen_random_uuid(), (SELECT to_char(now(), 'YYYY-MM-DD')), 'wed', ARRAY[(SELECT id FROM recipes ORDER BY created_at LIMIT 1 OFFSET 2)::text], 100, 'DRAFT', null, null, null, null, now() - interval '7 days'),
  (gen_random_uuid(), (SELECT to_char(now(), 'YYYY-MM-DD')), 'thu', ARRAY[(SELECT id FROM recipes ORDER BY created_at LIMIT 1 OFFSET 3)::text], 100, 'PENDING_REVIEW', null, null, null, null, now() - interval '6 days'),
  (gen_random_uuid(), (SELECT to_char(now(), 'YYYY-MM-DD')), 'fri', ARRAY[(SELECT id FROM recipes ORDER BY created_at LIMIT 1 OFFSET 4)::text], 100, 'APPROVED', (SELECT id FROM users WHERE email='ahligizi@sppg.id')::text, 'Ahli Gizi Maya', now() - interval '1 day', 'Ahli Gizi Maya (nutritionist) · signed', now() - interval '7 days')
) AS v;

-- ==================== AUDIT TRAIL ====================
INSERT INTO audit_trail (id, timestamp, actor, actor_id, actor_role, action, entity, entity_id, zone, changes, note)
SELECT * FROM (VALUES
  (gen_random_uuid(), now() - interval '14 days', 'Asisten Belanja (Field Assistant)', (SELECT id FROM users WHERE email='asisten@sppg.id')::text, 'field_assistant', 'CREATE_PURCHASE', 'purchases', gen_random_uuid()::text, null, null::jsonb, 'Pembelian beras 100kg'),
  (gen_random_uuid(), now() - interval '12 days', 'Akuntan (Accountant)', (SELECT id FROM users WHERE email='akuntan@sppg.id')::text, 'accountant', 'VERIFY_PURCHASE', 'purchases', gen_random_uuid()::text, null, '{"verified":{"old":false,"new":true}}'::jsonb, 'Verifikasi pembelian beras'),
  (gen_random_uuid(), now() - interval '7 days', 'Admin (Admin)', (SELECT id FROM users WHERE email='admin@sppg.id')::text, 'admin', 'CREATE_USER', 'users', gen_random_uuid()::text, null, null::jsonb, 'Tambah user baru: Staf Gudang'),
  (gen_random_uuid(), now() - interval '3 days', 'Ahli Gizi Maya (Nutritionist)', (SELECT id FROM users WHERE email='ahligizi@sppg.id')::text, 'nutritionist', 'MENU_APPROVED', 'menus', gen_random_uuid()::text, null, '{"status":{"old":"PENDING_REVIEW","new":"APPROVED"}}'::jsonb, 'Menu Senin disetujui'),
  (gen_random_uuid(), now() - interval '1 day', 'Staf Gudang (Field Staff)', (SELECT id FROM users WHERE email='staf@sppg.id')::text, 'field_staff', 'OPNAME', 'opnames', gen_random_uuid()::text, 'DRY', null::jsonb, 'Opname rutin gudang kering')
) AS v;

-- ==================== SETTINGS ====================
INSERT INTO settings (key, value) VALUES ('logo', '') ON CONFLICT (key) DO NOTHING;
