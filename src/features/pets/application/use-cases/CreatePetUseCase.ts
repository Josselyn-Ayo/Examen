import { AppError } from "../../../../shared/domain/errors/AppError";
import { CreatePetInput } from "../../domain/repositories/IPetRepository";
import { IPetRepository } from "../../domain/repositories/IPetRepository";

export class CreatePetUseCase {
  constructor(private readonly petRepo: IPetRepository) {}

  async execute(shelterId: string, input: CreatePetInput) {
    if (!input.name.trim()) throw new AppError("PET_ERROR", "El nombre es requerido");
    if (!input.species) throw new AppError("PET_ERROR", "La especie es requerida");
    try {
      return await this.petRepo.createPet(shelterId, input);
    } catch (error) {
      throw new AppError("PET_ERROR", error instanceof Error ? error.message : "Error al crear mascota", error);
    }
  }
}