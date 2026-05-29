import { IFavoriteRepository } from "../../domain/repositories/IFavoriteRepository";

export class ToggleFavoriteUseCase {
  constructor(private repo: IFavoriteRepository) {}

  async execute(userId: string, petId: string): Promise<boolean> {
    const isFav = await this.repo.isFavorite(userId, petId);
    if (isFav) {
      await this.repo.removeFavorite(userId, petId);
      return false;
    } else {
      await this.repo.addFavorite(userId, petId);
      return true;
    }
  }
}
