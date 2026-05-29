import { IFavoriteRepository } from "../../domain/repositories/IFavoriteRepository";

export class GetFavoritesUseCase {
  constructor(private repo: IFavoriteRepository) {}

  async execute(userId: string): Promise<string[]> {
    return this.repo.getFavorites(userId);
  }
}
