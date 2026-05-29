export interface IFavoriteRepository {
  getFavorites(userId: string): Promise<string[]>;
  isFavorite(userId: string, petId: string): Promise<boolean>;
  addFavorite(userId: string, petId: string): Promise<void>;
  removeFavorite(userId: string, petId: string): Promise<void>;
}
