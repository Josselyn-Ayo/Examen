import { AppError } from "../../../../shared/domain/errors/AppError";
import { UpdatePetInput } from "../../domain/repositories/IPetRepository";
import { IPetRepository } from "../../domain/repositories/IPetRepository";

export class UpdatePetUseCase {
  constructor(private readonly petRepo: IPetRepository) {}

  async execute(id: string, input: UpdatePetInput) {
    try {
      return await this.petRepo.updatePet(id, input);
    } catch (error) {
      throw new AppError("PET_ERROR", (error as any)?.message ?? String(error), error);
    }
  }
}