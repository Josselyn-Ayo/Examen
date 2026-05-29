import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { CreateAdoptionRequestUseCase } from "@features/adoptions/application/use-cases/CreateAdoptionRequestUseCase";
import { GetAdoptionRequestsUseCase } from "@features/adoptions/application/use-cases/GetAdoptionRequestsUseCase";
import { RespondAdoptionRequestUseCase } from "@features/adoptions/application/use-cases/RespondAdoptionRequestUseCase";
import { AdoptionRequest, AdoptionStatus } from "@features/adoptions/domain/entities/AdoptionRequest";
import { SupabaseAdoptionRepository } from "@features/adoptions/infrastructure/repositories/SupabaseAdoptionRepository";
import { SupabaseChatRepository } from "@features/chat/infrastructure/repositories/SupabaseChatRepository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const adoptionRepo = new SupabaseAdoptionRepository();
const chatRepo = new SupabaseChatRepository();
const createRequestUseCase = new CreateAdoptionRequestUseCase(adoptionRepo, chatRepo);
const respondRequestUseCase = new RespondAdoptionRequestUseCase(adoptionRepo);
const getRequestsUseCase = new GetAdoptionRequestsUseCase(adoptionRepo);

export function useAdoptions() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: shelterRequests = [], isLoading: isLoadingShelter } = useQuery({
    queryKey: ["adoption-requests-shelter", user?.id],
    queryFn: () => getRequestsUseCase.forShelter(user!.id),
    enabled: !!user && user.role === "refugio",
  });

  const { data: adoptanteRequests = [], isLoading: isLoadingAdoptante } = useQuery({
    queryKey: ["adoption-requests-adoptante", user?.id],
    queryFn: () => getRequestsUseCase.forAdoptante(user!.id),
    enabled: !!user && user.role === "adoptante",
  });

  const createMutation = useMutation({
    mutationFn: ({ petId, message }: { petId: string; message: string }) =>
      createRequestUseCase.execute(petId, user!.id, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adoption-requests-adoptante"] });
      queryClient.invalidateQueries({ queryKey: ["adoption-requests-shelter"] });
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["adopted-pets"] });
      queryClient.invalidateQueries({ queryKey: ["profile-stats"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const respondMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: AdoptionStatus }) =>
      respondRequestUseCase.execute(requestId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adoption-requests-shelter"] });
      queryClient.invalidateQueries({ queryKey: ["adoption-requests-adoptante"] });
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["adopted-pets"] });
      queryClient.invalidateQueries({ queryKey: ["profile-stats"] });
    },
  });

  const ensureRoomMutation = useMutation({
    mutationFn: async (request: AdoptionRequest) => {
      if (request.roomId) return request.roomId;
      const petName = request.petName ?? "Mascota";
      const room = await chatRepo.createRoom(petName, user!.id, request.petId, request.adoptanteId, request.refugioId);
      await adoptionRepo.updateRoomId(request.id, room.id);
      return room.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adoption-requests-shelter"] });
      queryClient.invalidateQueries({ queryKey: ["adoption-requests-adoptante"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  return {
    shelterRequests,
    adoptanteRequests,
    isLoadingShelter,
    isLoadingAdoptante,
    createRequest: createMutation.mutate,
    respondRequest: respondMutation.mutate,
    ensureRoom: ensureRoomMutation.mutateAsync,
    isEnsuringRoom: ensureRoomMutation.isPending,
    isCreating: createMutation.isPending,
    isResponding: respondMutation.isPending,
    createError: createMutation.error?.message ?? null,
    respondError: respondMutation.error?.message ?? null,
  };
}
