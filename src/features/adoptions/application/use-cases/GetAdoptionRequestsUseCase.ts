import { IAdoptionRepository } from "../../domain/repositories/IAdoptionRepository";

export class GetAdoptionRequestsUseCase {
  constructor(private readonly adoptionRepo: IAdoptionRepository) {}

  async forShelter(refugioId: string) {
    return this.adoptionRepo.getRequestsForShelter(refugioId);
  }

  async forAdoptante(adoptanteId: string) {
    return this.adoptionRepo.getRequestsForAdoptante(adoptanteId);
  }
}