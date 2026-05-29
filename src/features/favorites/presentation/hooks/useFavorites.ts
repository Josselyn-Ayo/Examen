import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { ToggleFavoriteUseCase } from "@features/favorites/application/use-cases/ToggleFavoriteUseCase";
import { GetFavoritesUseCase } from "@features/favorites/application/use-cases/GetFavoritesUseCase";
import { SupabaseFavoriteRepository } from "@features/favorites/infrastructure/repositories/SupabaseFavoriteRepository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const favRepo = new SupabaseFavoriteRepository();
const getFavoritesUseCase = new GetFavoritesUseCase(favRepo);
const toggleFavoriteUseCase = new ToggleFavoriteUseCase(favRepo);

export function useFavorites() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: favoriteIds = [], isLoading } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: () => getFavoritesUseCase.execute(user!.id),
    enabled: !!user,
  });

  const toggleMutation = useMutation({
    mutationFn: (petId: string) => toggleFavoriteUseCase.execute(user!.id, petId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["profile-stats"] });
    },
  });

  return {
    favoriteIds,
    isLoading,
    toggleFavorite: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
  };
}
