import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { supabase } from "@shared/infrastructure/supabase/client";
import { useQuery } from "@tanstack/react-query";

async function count(table: string, column: string, value: string, statusFilter?: string) {
  let query = supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq(column, value);
  if (statusFilter) query = query.eq("status", statusFilter);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export function useProfileStats() {
  const user = useAuthStore((s) => s.user);
  const isRefugio = user?.role === "refugio";
  const userId = user?.id;

  const { data: favoritesCount = 0 } = useQuery({
    queryKey: ["profile-stats", "favorites", userId],
    queryFn: () => count("favorites", "user_id", userId!),
    enabled: !!userId,
  });

  const { data: solicitudesCount = 0 } = useQuery({
    queryKey: ["profile-stats", "solicitudes", userId],
    queryFn: () =>
      isRefugio
        ? count("adoption_requests", "refugio_id", userId!)
        : count("adoption_requests", "adoptante_id", userId!),
    enabled: !!userId,
  });

  const { data: adoptadosCount = 0 } = useQuery({
    queryKey: ["profile-stats", "adoptados", userId],
    queryFn: () =>
      count("adoption_requests", isRefugio ? "refugio_id" : "adoptante_id", userId!, "aprobada"),
    enabled: !!userId,
  });

  const { data: petsCount = 0 } = useQuery({
    queryKey: ["profile-stats", "pets", userId],
    queryFn: () => count("pets", "shelter_id", userId!),
    enabled: !!userId && isRefugio,
  });

  return { favoritesCount, solicitudesCount, adoptadosCount, petsCount };
}
