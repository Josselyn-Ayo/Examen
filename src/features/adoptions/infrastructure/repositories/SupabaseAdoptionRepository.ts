import { AdoptionRequest, AdoptionStatus } from "../../domain/entities/AdoptionRequest";
import { IAdoptionRepository } from "../../domain/repositories/IAdoptionRepository";
import { supabase } from "@shared/infrastructure/supabase/client";

export class SupabaseAdoptionRepository implements IAdoptionRepository {
  async getRequestsForShelter(refugioId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from("adoption_requests")
      .select("id, pet_id, adoptante_id, refugio_id, status, message, created_at, updated_at")
      .eq("refugio_id", refugioId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return Promise.all((data ?? []).map((r) => this.enrich(r)));
  }

  async getRequestsForAdoptante(adoptanteId: string): Promise<AdoptionRequest[]> {
    const { data, error } = await supabase
      .from("adoption_requests")
      .select("id, pet_id, adoptante_id, refugio_id, status, message, created_at, updated_at")
      .eq("adoptante_id", adoptanteId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return Promise.all((data ?? []).map((r) => this.enrich(r)));
  }

  async createRequest(petId: string, adoptanteId: string, message: string): Promise<AdoptionRequest> {
    const { data: petData } = await supabase
      .from("pets")
      .select("shelter_id, name")
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
      petName: petData?.name ?? null,
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
      .select("id, pet_id, adoptante_id, refugio_id, status, message, created_at, updated_at")
      .single();
    if (error) throw error;

    if (status === "aprobada") {
      const { error: petError } = await supabase
        .from("pets")
        .update({ status: "adoptado" })
        .eq("id", data.pet_id);
      if (petError) console.warn("[adoption] pet status update error:", petError.message);
    }

    return this.enrich(data);
  }

  private async enrich(raw: any): Promise<AdoptionRequest> {
    const [{ data: pet }, { data: profile }] = await Promise.all([
      supabase.from("pets").select("name").eq("id", raw.pet_id).maybeSingle(),
      supabase.from("profiles").select("username").eq("id", raw.adoptante_id).maybeSingle(),
    ]);
    return {
      id: raw.id,
      petId: raw.pet_id,
      petName: pet?.name ?? null,
      adoptanteId: raw.adoptante_id,
      adoptanteName: profile?.username ?? null,
      refugioId: raw.refugio_id,
      status: raw.status as AdoptionStatus,
      message: raw.message ?? "",
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at ?? raw.created_at),
    };
  }
}