import { IPetRepository } from "../../domain/repositories/IPetRepository";

export class GetPetByIdUseCase {
  constructor(private readonly petRepo: IPetRepository) {}

  async execute(id: string) {
    return this.petRepo.getPetById(id);
  }
}