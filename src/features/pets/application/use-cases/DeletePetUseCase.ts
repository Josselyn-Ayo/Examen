import { AppError } from "../../../../shared/domain/errors/AppError";
import { IPetRepository } from "../../domain/repositories/IPetRepository";

export class DeletePetUseCase {
  constructor(private readonly petRepo: IPetRepository) {}

  async execute(id: string) {
    try {
      await this.petRepo.deletePet(id);
    } catch (error) {
      throw new AppError("PET_ERROR", (error as any)?.message ?? String(error), error);
    }
  }
}