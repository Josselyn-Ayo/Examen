import { AppError } from "../../../../shared/domain/errors/AppError";
import { IAdoptionRepository } from "../../domain/repositories/IAdoptionRepository";

export class CreateAdoptionRequestUseCase {
  constructor(private readonly adoptionRepo: IAdoptionRepository) {}

  async execute(petId: string, adoptanteId: string, message: string) {
    if (!message.trim()) throw new AppError("ADOPTION_ERROR", "Incluye un mensaje para el refugio");
    try {
      return await this.adoptionRepo.createRequest(petId, adoptanteId, message);
    } catch (error) {
      throw new AppError("ADOPTION_ERROR", error instanceof Error ? error.message : "Error al enviar solicitud", error);
    }
  }
}