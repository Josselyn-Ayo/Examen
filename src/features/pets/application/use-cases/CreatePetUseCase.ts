import { AppError } from "../../../../shared/domain/errors/AppError";
import { CreatePetInput } from "../../domain/repositories/IPetRepository";
import { IPetRepository } from "../../domain/repositories/IPetRepository";

export class CreatePetUseCase {
  constructor(private readonly petRepo: IPetRepository) {}

  async execute(shelterId: string, input: CreatePetInput) {
    if (!input.name.trim()) throw new AppError("PET_ERROR", "El nombre es requerido");
    if (!input.species) throw new AppError("PET_ERROR", "La especie es requerida");
    if (!input.size) throw new AppError("PET_ERROR", "El tamaño es requerido");
    if (!input.personalityType) throw new AppError("PET_ERROR", "El tipo de personalidad es requerido");
    try {
      return await this.petRepo.createPet(shelterId, input);
    } catch (error) {
      throw new AppError("PET_ERROR", (error as any)?.message ?? String(error), error);
    }
  }
}