-- ============================================================
-- FIX RLS — Reemplaza políticas restrictivas por permisivas
-- Ejecutar DESPUÉS de rls_policies.sql
-- ============================================================

-- PETS: mostrar TODAS las mascotas a usuarios autenticados
DROP POLICY IF EXISTS "pets_select_available" ON pets;
CREATE POLICY "pets_select_all" ON pets
  FOR SELECT USING (auth.role() = 'authenticated');

-- PROFILES: permitir UPDATE con cualquier dato (no solo role)
-- (ya existe profiles_update_own, asegurar que funciona)
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- ADOPTION_REQUESTS: asegurar SELECT funciona
DROP POLICY IF EXISTS "adoption_requests_select" ON adoption_requests;
CREATE POLICY "adoption_requests_select" ON adoption_requests
  FOR SELECT USING (
    adoptante_id = auth.uid() OR refugio_id = auth.uid()
  );

-- Si el problema persiste, descomenta la siguiente línea para ver errores:
-- SELECT * FROM pg_stat_activity;
