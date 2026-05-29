import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { Room } from "@features/chat/domain/entities/Room";
import { SupabaseChatRepository } from "@features/chat/infrastructure/repositories/SupabaseChatRepository";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const chatRepo = new SupabaseChatRepository();

export function useRooms() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const {
    data: rooms = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rooms", user?.id, user?.role],
    queryFn: () => chatRepo.getRooms(user!.id, user!.role),
    enabled: !!user,
  });

  const invalidateRooms = () => {
    queryClient.invalidateQueries({ queryKey: ["rooms"] });
  };

  return {
    rooms,
    isLoading,
    error: error?.message ?? null,
    invalidateRooms,
  };
}
