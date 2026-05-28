import { AdoptionRequest, AdoptionStatus } from "../../domain/entities/AdoptionRequest";
import { IAdoptionRepository } from "../../domain/repositories/IAdoptionRepository";
import { supabase } from "@shared/infrastructure/supabase/client";

export class SupabaseAdoptionRepository implements IAdoptionRepository {
  async getRequestsForShelter(refugioId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from("adoption_requests")
      .select("id, pet_id, adoptante_id, refugio_id, status, message, created_at, updated_at, pets(name), profiles(username)")
      .eq("refugio_id", refugioId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.mapForShelter);
  }

  async getRequestsForAdoptante(adoptanteId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from("adoption_requests")
      .select("id, pet_id, adoptante_id, refugio_id, status, message, created_at, updated_at, pets(name), profiles(username)")
      .eq("adoptante_id", adoptanteId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.mapForAdoptante);
  }

  async createRequest(petId: string, adoptanteId: string, message: string): Promise<AdoptionRequest> {
    const { data: petData } = await supabase
      .from("pets")
      .select("shelter_id")
      .eq("id", petId)
      .single();
    const refugioId = petData?.shelter_id;
    if (!refugioId) throw new Error("Mascota no encontrada");

    const { data, error } = await supabase
      .from("adoption_requests")
      .insert({
        pet_id: petId,
        adoptante_id: adoptanteId,
        refugio_id: refugioId,
        message,
        status: "pendiente",
      })
      .select("id, pet_id, adoptante_id, refugio_id, status, message, created_at, updated_at")
      .single();
    if (error) throw error;
    return {
      id: data.id,
      petId: data.pet_id,
      petName: null,
      adoptanteId: data.adoptante_id,
      adoptanteName: null,
      refugioId: data.refugio_id,
      status: data.status as AdoptionStatus,
      message: data.message,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at ?? data.created_at),
    };
  }

  async respondRequest(requestId: string, status: AdoptionStatus): Promise<AdoptionRequest> {
    const { data, error } = await supabase
      .from("adoption_requests")
      .update({ status })
      .eq("id", requestId)
      .select("id, pet_id, adoptante_id, refugio_id, status, message, created_at, updated_at, pets(name), profiles(username)")
      .single();
    if (error) throw error;
    return this.mapForShelter(data);
  }

  private mapForShelter = (raw: any): AdoptionRequest => ({
    id: raw.id,
    petId: raw.pet_id,
    petName: raw.pets?.name ?? null,
    adoptanteId: raw.adoptante_id,
    adoptanteName: raw.profiles?.username ?? null,
    refugioId: raw.refugio_id,
    status: raw.status as AdoptionStatus,
    message: raw.message ?? "",
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at ?? raw.created_at),
  });

  private mapForAdoptante = (raw: any): AdoptionRequest => ({
    id: raw.id,
    petId: raw.pet_id,
    petName: raw.pets?.name ?? null,
    adoptanteId: raw.adoptante_id,
    adoptanteName: null,
    refugioId: raw.refugio_id,
    status: raw.status as AdoptionStatus,
    message: raw.message ?? "",
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at ?? raw.created_at),
  });
}