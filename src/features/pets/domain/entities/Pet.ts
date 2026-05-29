export type PetSpecies = "perro" | "gato" | "ave" | "conejo" | "otro";
export type PetStatus = "disponible" | "en_proceso" | "adoptado";
export type PetSize = "pequeno" | "mediano" | "grande";
export type PetPersonality = "sociable" | "tranquilo" | "protector" | "jugueton";

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  age: string;
  size: PetSize;
  description: string;
  history: string;
  personality: string;
  personalityType: PetPersonality;
  imageUrl: string | null;
  imageUrls: string[];
  shelterId: string;
  shelterName: string | null;
  status: PetStatus;
  createdAt: Date;
}

