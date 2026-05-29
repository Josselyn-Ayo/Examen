-- ============================================================
-- MIGRACIÓN: Chat basado en adopciones
-- Agrega columnas a rooms para vincular con adopciones
-- Agrega room_id a adoption_requests
-- Actualiza RLS para que adoptante y refugio accedan al chat
-- ============================================================

-- 1. Agregar columnas a rooms
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS pet_id uuid REFERENCES pets(id) ON DELETE SET NULL;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS adoptante_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS refugio_id uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- 1b. Agregar room_id a adoption_requests
ALTER TABLE adoption_requests ADD COLUMN IF NOT EXISTS room_id uuid REFERENCES rooms(id) ON DELETE SET NULL;

-- 2. Actualizar RLS para rooms
DROP POLICY IF EXISTS "rooms_select" ON rooms;
DROP POLICY IF EXISTS "rooms_insert" ON rooms;

CREATE POLICY "rooms_select" ON rooms
  FOR SELECT USING (
    created_by = auth.uid()
    OR adoptante_id = auth.uid()
    OR refugio_id = auth.uid()
  );

CREATE POLICY "rooms_insert" ON rooms
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- 2b. RLS para adoption_requests
DROP POLICY IF EXISTS "adoption_requests_select" ON adoption_requests;
DROP POLICY IF EXISTS "adoption_requests_insert" ON adoption_requests;
DROP POLICY IF EXISTS "adoption_requests_update" ON adoption_requests;

CREATE POLICY "adoption_requests_select" ON adoption_requests
  FOR SELECT USING (
    adoptante_id = auth.uid()
    OR refugio_id IN (
      SELECT id FROM profiles WHERE id = auth.uid() AND role = 'refugio'
    )
  );

CREATE POLICY "adoption_requests_insert" ON adoption_requests
  FOR INSERT WITH CHECK (adoptante_id = auth.uid());

CREATE POLICY "adoption_requests_update" ON adoption_requests
  FOR UPDATE USING (
    refugio_id IN (
      SELECT id FROM profiles WHERE id = auth.uid() AND role = 'refugio'
    )
  );

-- 3. Actualizar RLS para messages
DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;

CREATE POLICY "messages_select" ON messages
  FOR SELECT USING (
    room_id IN (
      SELECT id FROM rooms
      WHERE created_by = auth.uid()
         OR adoptante_id = auth.uid()
         OR refugio_id = auth.uid()
    )
  );

CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND room_id IN (
      SELECT id FROM rooms
      WHERE created_by = auth.uid()
         OR adoptante_id = auth.uid()
         OR refugio_id = auth.uid()
    )
  );
