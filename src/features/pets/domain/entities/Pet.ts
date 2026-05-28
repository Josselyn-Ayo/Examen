export type PetSpecies = "perro" | "gato" | "ave" | "conejo" | "otro";
export type PetStatus = "disponible" | "en_proceso" | "adoptado";

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  age: string;
  description: string;
  imageUrl: string | null;
  shelterId: string;
  shelterName: string | null;
  status: PetStatus;
  createdAt: Date;
}