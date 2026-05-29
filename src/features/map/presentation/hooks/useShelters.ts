import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { supabase } from "@shared/infrastructure/supabase/client";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";

export interface ShelterLocation {
  id: string;
  name: string;
  username: string;
  latitude: number | null;
  longitude: number | null;
}

export function useShelters() {
  const user = useAuthStore((s) => s.user);

  const { data: shelters = [], isLoading: isLoadingShelters, error } = useQuery({
    queryKey: ["shelters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, latitude, longitude")
        .not("latitude", "is", null)
        .not("longitude", "is", null);
      if (error) throw error;
      return (data ?? []).map((s: any): ShelterLocation => ({
        id: s.id,
        name: s.username ?? "Refugio",
        username: s.username ?? "",
        latitude: s.latitude ?? null,
        longitude: s.longitude ?? null,
      }));
    },
    enabled: !!user,
  });

  const sheltersWithLocation = shelters.filter((s) => s.latitude !== null && s.longitude !== null);

  return { shelters, sheltersWithLocation, isLoadingShelters, error };
}

export function useCurrentLocation() {
  const { data: location, isLoading, error } = useQuery({
    queryKey: ["current-location"],
    queryFn: async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") throw new Error("Permiso de ubicación denegado");
      return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    },
    staleTime: 60_000,
    retry: 1,
  });

  return {
    latitude: location?.coords.latitude ?? null,
    longitude: location?.coords.longitude ?? null,
    isLoading,
    error: error?.message ?? null,
  };
}