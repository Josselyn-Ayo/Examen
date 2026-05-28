import { AppError } from "../../../../shared/domain/errors/AppError";
import { AdoptionStatus } from "../../domain/entities/AdoptionRequest";
import { IAdoptionRepository } from "../../domain/repositories/IAdoptionRepository";

export class RespondAdoptionRequestUseCase {
  constructor(private readonly adoptionRepo: IAdoptionRepository) {}

  async execute(requestId: string, status: AdoptionStatus) {
    if (status !== "aprobada" && status !== "rechazada") {
      throw new AppError("ADOPTION_ERROR", "Estado no válido");
    }
    try {
      return await this.adoptionRepo.respondRequest(requestId, status);
    } catch (error) {
      throw new AppError("ADOPTION_ERROR", error instanceof Error ? error.message : "Error al responder solicitud", error);
    }
  }
}