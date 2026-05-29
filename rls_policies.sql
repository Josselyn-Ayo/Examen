-- ============================================================
-- RLS POLICIES + SCHEMA — PetAdopt (ejecutar en Supabase SQL Editor)
-- ============================================================

-- 0. COLUMNAS PARA REFUGIOS + ROLE
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nit text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shelter_description text;

-- Poblar role en profiles desde auth.users.user_metadata para usuarios existentes
UPDATE profiles p SET role = u.raw_user_meta_data->>'role'
FROM auth.users u WHERE p.id = u.id AND p.role IS NULL;

-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

-- Cualquier usuario autenticado puede leer perfiles (para mostrar nombres en mascotas, chat, etc.)
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Un usuario puede insertar su propio perfil (signup / upsert)
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Un usuario puede actualizar su propio perfil
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- 2. PETS
-- ============================================================
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pets_select_available" ON pets;
DROP POLICY IF EXISTS "pets_insert_own" ON pets;
DROP POLICY IF EXISTS "pets_update_own" ON pets;
DROP POLICY IF EXISTS "pets_delete_own" ON pets;

-- Cualquier usuario autenticado puede leer mascotas disponibles
CREATE POLICY "pets_select_available" ON pets
  FOR SELECT USING (status = 'disponible' OR shelter_id = auth.uid());

-- Un refugio puede crear mascotas (shelter_id debe ser su propio id)
CREATE POLICY "pets_insert_own" ON pets
  FOR INSERT WITH CHECK (shelter_id = auth.uid());

-- Un refugio puede actualizar sus propias mascotas
CREATE POLICY "pets_update_own" ON pets
  FOR UPDATE USING (shelter_id = auth.uid());

-- Un refugio puede eliminar sus propias mascotas
CREATE POLICY "pets_delete_own" ON pets
  FOR DELETE USING (shelter_id = auth.uid());

-- 3. ADOPTION_REQUESTS
-- ============================================================
ALTER TABLE adoption_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "adoption_requests_select" ON adoption_requests;
DROP POLICY IF EXISTS "adoption_requests_insert" ON adoption_requests;
DROP POLICY IF EXISTS "adoption_requests_update" ON adoption_requests;

-- El adoptante puede ver sus propias solicitudes; el refugio puede ver las solicitudes de sus mascotas
CREATE POLICY "adoption_requests_select" ON adoption_requests
  FOR SELECT USING (
    adoptante_id = auth.uid() OR refugio_id = auth.uid()
  );

-- Un adoptante puede crear una solicitud (debe ser él mismo el adoptante)
CREATE POLICY "adoption_requests_insert" ON adoption_requests
  FOR INSERT WITH CHECK (adoptante_id = auth.uid());

-- El refugio puede actualizar el estado de las solicitudes de sus mascotas
CREATE POLICY "adoption_requests_update" ON adoption_requests
  FOR UPDATE USING (refugio_id = auth.uid());

-- 4. ROOMS (chat)
-- ============================================================
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rooms_select" ON rooms;
DROP POLICY IF EXISTS "rooms_insert" ON rooms;

-- Los participantes pueden ver las salas donde participan
-- (asumiendo que los usuarios se agregan como participantes vía una tabla room_participants o similar)
-- Si no hay tabla de participantes, permitimos ver salas donde el usuario es creador o participante vía messages
CREATE POLICY "rooms_select" ON rooms
  FOR SELECT USING (
    created_by = auth.uid()
    -- Si usas room_participants, descomenta:
    -- OR id IN (SELECT room_id FROM room_participants WHERE user_id = auth.uid())
  );

-- Cualquier usuario autenticado puede crear una sala
CREATE POLICY "rooms_insert" ON rooms
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- 5. MESSAGES (chat)
-- ============================================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;

-- Los participantes de la sala pueden ver mensajes
CREATE POLICY "messages_select" ON messages
  FOR SELECT USING (
    room_id IN (
      SELECT id FROM rooms WHERE created_by = auth.uid()
      -- Si usas room_participants:
      -- OR room_id IN (SELECT room_id FROM room_participants WHERE user_id = auth.uid())
    )
  );

-- Los participantes pueden enviar mensajes
CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND room_id IN (
      SELECT id FROM rooms WHERE created_by = auth.uid()
      -- Si usas room_participants:
      -- OR room_id IN (SELECT room_id FROM room_participants WHERE user_id = auth.uid())
    )
  );

-- 6. FAVORITES
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, pet_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites_select" ON favorites;
DROP POLICY IF EXISTS "favorites_insert" ON favorites;
DROP POLICY IF EXISTS "favorites_delete" ON favorites;

CREATE POLICY "favorites_select" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "favorites_insert" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_delete" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- 7. STORAGE (bucket "Imagenes")
-- ============================================================
-- NOTA: Esto se ejecuta en Storage > Policies en Supabase Dashboard
-- o via SQL con la extensión `storage`:

DROP POLICY IF EXISTS "storage_images_select" ON storage.objects;
DROP POLICY IF EXISTS "storage_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "storage_images_update" ON storage.objects;
DROP POLICY IF EXISTS "storage_images_delete" ON storage.objects;

CREATE POLICY "storage_images_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'Imagenes');

CREATE POLICY "storage_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'Imagenes'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "storage_images_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'Imagenes'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "storage_images_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'Imagenes'
    AND auth.role() = 'authenticated'
  );
