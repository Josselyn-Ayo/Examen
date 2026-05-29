import { supabase } from "@shared/infrastructure/supabase/client";
import { IFavoriteRepository } from "../../domain/repositories/IFavoriteRepository";

export class SupabaseFavoriteRepository implements IFavoriteRepository {
  async getFavorites(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from("favorites")
      .select("pet_id")
      .eq("user_id", userId);
    if (error) throw error;
    return (data ?? []).map((r) => r.pet_id);
  }

  async isFavorite(userId: string, petId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("pet_id", petId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  }

  async addFavorite(userId: string, petId: string): Promise<void> {
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: userId, pet_id: petId });
    if (error) throw error;
  }

  async removeFavorite(userId: string, petId: string): Promise<void> {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("pet_id", petId);
    if (error) throw error;
  }
}
