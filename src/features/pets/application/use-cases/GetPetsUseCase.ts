import { IPetRepository } from "../../domain/repositories/IPetRepository";

export class GetPetsUseCase {
  constructor(private readonly petRepo: IPetRepository) {}

  async execute() {
    return this.petRepo.getPets();
  }
}