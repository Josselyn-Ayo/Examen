import { Pet, PetPersonality, PetSize, PetSpecies, PetStatus } from "../../domain/entities/Pet";
import { CreatePetInput, IPetRepository, UpdatePetInput } from "../../domain/repositories/IPetRepository";
import { supabase } from "@shared/infrastructure/supabase/client";

const FileSystem: any = require("expo-file-system/legacy");

export class SupabasePetRepository implements IPetRepository {
  private readonly imagesBucket = "Imagenes";

  async getPets(): Promise<Pet[]> {
    const { data, error } = await supabase
      .from("pets")
      .select("id, name, species, breed, age, size, description, history, personality, personality_type, image_url, image_urls, shelter_id, status, created_at")
      .eq("status", "disponible")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.mapPet);
  }

  async getPetById(id: string): Promise<Pet | null> {
    const { data, error } = await supabase
      .from("pets")
      .select("id, name, species, breed, age, size, description, history, personality, personality_type, image_url, image_urls, shelter_id, status, created_at")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return this.mapPet(data);
  }

  async getPetsByAdoptante(adoptanteId: string): Promise<Pet[]> {
    const { data: requests, error: reqError } = await supabase
      .from("adoption_requests")
      .select("pet_id")
      .eq("adoptante_id", adoptanteId)
      .eq("status", "aprobada");
    if (reqError) throw reqError;
    if (!requests || requests.length === 0) return [];
    const petIds = requests.map((r) => r.pet_id);
    const { data, error } = await supabase
      .from("pets")
      .select("id, name, species, breed, age, size, description, history, personality, personality_type, image_url, image_urls, shelter_id, status, created_at")
      .in("id", petIds)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.mapPet);
  }

  async getPetsByShelter(shelterId: string): Promise<Pet[]> {
    const { data, error } = await supabase
      .from("pets")
      .select("id, name, species, breed, age, size, description, history, personality, personality_type, image_url, image_urls, shelter_id, status, created_at")
      .eq("shelter_id", shelterId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.mapPet);
  }

  async createPet(shelterId: string, input: CreatePetInput): Promise<Pet> {
    let imageUrls: string[] = [];
    if (input.imageUris && input.imageUris.length > 0) {
      imageUrls = await Promise.all(input.imageUris.map((uri) => this.uploadImage(shelterId, uri)));
    }
    const { data, error } = await supabase
      .from("pets")
      .insert({
        name: input.name,
        species: input.species,
        breed: input.breed,
        age: input.age,
        size: input.size,
        description: input.description,
        history: input.history,
        personality: input.personality,
        personality_type: input.personalityType,
        image_url: imageUrls[0] ?? null,
        image_urls: imageUrls,
        shelter_id: shelterId,
        status: "disponible",
      })
      .select("id, name, species, breed, age, size, description, history, personality, personality_type, image_url, image_urls, shelter_id, status, created_at")
      .single();
    if (error) throw error;
    return this.mapPet(data);
  }

  async updatePet(id: string, input: UpdatePetInput): Promise<Pet> {
    const updateData: Record<string, any> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.species !== undefined) updateData.species = input.species;
    if (input.breed !== undefined) updateData.breed = input.breed;
    if (input.age !== undefined) updateData.age = input.age;
    if (input.size !== undefined) updateData.size = input.size;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.history !== undefined) updateData.history = input.history;
    if (input.personality !== undefined) updateData.personality = input.personality;
    if (input.personalityType !== undefined) updateData.personality_type = input.personalityType;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.imageUris !== undefined) {
      const urls = await Promise.all(input.imageUris.map((uri) => this.uploadImage(id, uri)));
      updateData.image_url = urls[0] ?? null;
      updateData.image_urls = urls;
    }
    const { data, error } = await supabase
      .from("pets")
      .update(updateData)
      .eq("id", id)
      .select("id, name, species, breed, age, size, description, history, personality, personality_type, image_url, image_urls, shelter_id, status, created_at")
      .single();
    if (error) throw error;
    return this.mapPet(data);
  }

  async deletePet(id: string): Promise<void> {
    const { error } = await supabase.from("pets").delete().eq("id", id);
    if (error) throw error;
  }

  private mapPet = (raw: any): Pet => ({
    id: raw.id,
    name: raw.name,
    species: raw.species as PetSpecies,
    breed: raw.breed ?? "",
    age: raw.age ?? "",
    size: (raw.size ?? "mediano") as PetSize,
    description: raw.description ?? "",
    history: raw.history ?? "",
    personality: raw.personality ?? "",
    personalityType: (raw.personality_type ?? "sociable") as PetPersonality,
    imageUrl: raw.image_url ?? null,
    imageUrls: raw.image_urls ?? [],
    shelterId: raw.shelter_id,
    shelterName: null,
    status: raw.status as PetStatus,
    createdAt: new Date(raw.created_at),
  });

  private async uploadImage(petId: string, imageUri: string): Promise<string> {
    const extension = imageUri.split("?")[0].match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase() ?? "jpg";
    const filePath = `pets/${petId}/${Date.now()}.${extension}`;
    const contentType = `image/${extension}`;

    try {
      const sessionRes: any = await supabase.auth.getSession?.();
      const token = sessionRes?.data?.session?.access_token ?? sessionRes?.session?.access_token;
      if (!token) throw new Error("No session token");
      const uploadUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/${this.imagesBucket}/${filePath}`;
      const result = await FileSystem.uploadAsync(uploadUrl, imageUri, {
        httpMethod: "PUT",
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": contentType },
      });
      if (result.status >= 200 && result.status < 300) {
        return `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${this.imagesBucket}/${filePath}`;
      }
      throw new Error(`Upload failed: ${result.status}`);
    } catch {
      const sessionRes: any = await supabase.auth.getSession?.();
      const token = sessionRes?.data?.session?.access_token ?? sessionRes?.session?.access_token;
      if (!token) throw new Error("No session token");
      const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: "base64" });
      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
      const uploadUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/${this.imagesBucket}/${filePath}`;
      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": contentType },
        body: bytes,
      });
      if (res.ok) {
        return `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${this.imagesBucket}/${filePath}`;
      }
      throw new Error("Failed to upload pet image");
    }
  }
}