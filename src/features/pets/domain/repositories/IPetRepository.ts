import { Pet, PetPersonality, PetSize } from "../entities/Pet";

export type CreatePetInput = {
  name: string;
  species: Pet["species"];
  breed: string;
  age: string;
  size: PetSize;
  description: string;
  history: string;
  personality: string;
  personalityType: PetPersonality;
  imageUris?: string[];
};

export type UpdatePetInput = Partial<CreatePetInput> & { status?: Pet["status"] };

export interface IPetRepository {
  getPets(): Promise<Pet[]>;
  getPetById(id: string): Promise<Pet | null>;
  getPetsByShelter(shelterId: string): Promise<Pet[]>;
  getPetsByAdoptante(adoptanteId: string): Promise<Pet[]>;
  createPet(shelterId: string, input: CreatePetInput): Promise<Pet>;
  updatePet(id: string, input: UpdatePetInput): Promise<Pet>;
  deletePet(id: string): Promise<void>;
}