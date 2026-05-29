import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { CreateAdoptionRequestUseCase } from "@features/adoptions/application/use-cases/CreateAdoptionRequestUseCase";
import { GetAdoptionRequestsUseCase } from "@features/adoptions/application/use-cases/GetAdoptionRequestsUseCase";
import { RespondAdoptionRequestUseCase } from "@features/adoptions/application/use-cases/RespondAdoptionRequestUseCase";
import { AdoptionStatus } from "@features/adoptions/domain/entities/AdoptionRequest";
import { SupabaseAdoptionRepository } from "@features/adoptions/infrastructure/repositories/SupabaseAdoptionRepository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const adoptionRepo = new SupabaseAdoptionRepository();
const createRequestUseCase = new CreateAdoptionRequestUseCase(adoptionRepo);
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

  return {
    shelterRequests,
    adoptanteRequests,
    isLoadingShelter,
    isLoadingAdoptante,
    createRequest: createMutation.mutate,
    respondRequest: respondMutation.mutate,
    isCreating: createMutation.isPending,
    isResponding: respondMutation.isPending,
    createError: createMutation.error?.message ?? null,
    respondError: respondMutation.error?.message ?? null,
  };
}