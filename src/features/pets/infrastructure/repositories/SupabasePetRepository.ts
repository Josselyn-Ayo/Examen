import { Pet, PetSpecies, PetStatus } from "../../domain/entities/Pet";
import { CreatePetInput, IPetRepository, UpdatePetInput } from "../../domain/repositories/IPetRepository";
import { supabase } from "@shared/infrastructure/supabase/client";

const FileSystem: any = require("expo-file-system/legacy");

export class SupabasePetRepository implements IPetRepository {
  private readonly imagesBucket = "Imagenes";

  async getPets(): Promise<Pet[]> {
    const { data, error } = await supabase
      .from("pets")
      .select("id, name, species, breed, age, description, image_url, shelter_id, status, created_at, profiles(username)")
      .eq("status", "disponible")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.mapPet);
  }

  async getPetById(id: string): Promise<Pet | null> {
    const { data, error } = await supabase
      .from("pets")
      .select("id, name, species, breed, age, description, image_url, shelter_id, status, created_at, profiles(username)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return this.mapPet(data);
  }

  async getPetsByShelter(shelterId: string): Promise<Pet[]> {
    const { data, error } = await supabase
      .from("pets")
      .select("id, name, species, breed, age, description, image_url, shelter_id, status, created_at, profiles(username)")
      .eq("shelter_id", shelterId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.mapPet);
  }

  async createPet(shelterId: string, input: CreatePetInput): Promise<Pet> {
    let imageUrl: string | null = null;
    if (input.imageUri) {
      imageUrl = await this.uploadImage(shelterId, input.imageUri);
    }
    const { data, error } = await supabase
      .from("pets")
      .insert({
        name: input.name,
        species: input.species,
        breed: input.breed,
        age: input.age,
        description: input.description,
        image_url: imageUrl,
        shelter_id: shelterId,
        status: "disponible",
      })
      .select("id, name, species, breed, age, description, image_url, shelter_id, status, created_at, profiles(username)")
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
    if (input.description !== undefined) updateData.description = input.description;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.imageUri !== undefined) {
      updateData.image_url = input.imageUri ? await this.uploadImage(id, input.imageUri) : null;
    }
    const { data, error } = await supabase
      .from("pets")
      .update(updateData)
      .eq("id", id)
      .select("id, name, species, breed, age, description, image_url, shelter_id, status, created_at, profiles(username)")
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
    description: raw.description ?? "",
    imageUrl: raw.image_url ?? null,
    shelterId: raw.shelter_id,
    shelterName: raw.profiles?.username ?? null,
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