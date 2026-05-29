import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { CreatePetUseCase } from "@features/pets/application/use-cases/CreatePetUseCase";
import { DeletePetUseCase } from "@features/pets/application/use-cases/DeletePetUseCase";
import { GetPetsUseCase } from "@features/pets/application/use-cases/GetPetsUseCase";
import { UpdatePetUseCase } from "@features/pets/application/use-cases/UpdatePetUseCase";
import { Pet } from "@features/pets/domain/entities/Pet";
import { CreatePetInput } from "@features/pets/domain/repositories/IPetRepository";
import { SupabasePetRepository } from "@features/pets/infrastructure/repositories/SupabasePetRepository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const petRepo = new SupabasePetRepository();
const getPetsUseCase = new GetPetsUseCase(petRepo);
const createPetUseCase = new CreatePetUseCase(petRepo);
const updatePetUseCase = new UpdatePetUseCase(petRepo);
const deletePetUseCase = new DeletePetUseCase(petRepo);

export function usePets() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: pets = [], isLoading, error, refetch } = useQuery({
    queryKey: ["pets"],
    queryFn: () => getPetsUseCase.execute(),
    enabled: !!user,
  });

  const { data: myPets = [], isLoading: isLoadingMyPets } = useQuery({
    queryKey: ["my-pets", user?.id],
    queryFn: () => petRepo.getPetsByShelter(user!.id),
    enabled: !!user && user.role === "refugio",
  });

  const { data: adoptedPets = [], isLoading: isLoadingAdopted } = useQuery({
    queryKey: ["adopted-pets", user?.id],
    queryFn: () => petRepo.getPetsByAdoptante(user!.id),
    enabled: !!user && user.role !== "refugio",
  });

  const createMutation = useMutation({
    mutationFn: (input: CreatePetInput) => createPetUseCase.execute(user!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["my-pets"] });
      queryClient.invalidateQueries({ queryKey: ["adopted-pets"] });
      queryClient.invalidateQueries({ queryKey: ["profile-stats"] });
    },
  });

  type UpdatePetArgs = { id: string; input: Partial<CreatePetInput> & { status?: Pet["status"] } };

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: UpdatePetArgs) =>
      updatePetUseCase.execute(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["my-pets"] });
      queryClient.invalidateQueries({ queryKey: ["adopted-pets"] });
      queryClient.invalidateQueries({ queryKey: ["profile-stats"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePetUseCase.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["my-pets"] });
      queryClient.invalidateQueries({ queryKey: ["adopted-pets"] });
      queryClient.invalidateQueries({ queryKey: ["profile-stats"] });
    },
  });

  return {
    pets,
    myPets,
    adoptedPets,
    isLoading,
    isLoadingMyPets,
    isLoadingAdopted,
    error: error?.message ?? null,
    refetch,
    createPet: createMutation.mutate,
    updatePet: updateMutation.mutate,
    deletePet: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error?.message ?? null,
    updateError: updateMutation.error?.message ?? null,
    deleteError: deleteMutation.error?.message ?? null,
  };
}