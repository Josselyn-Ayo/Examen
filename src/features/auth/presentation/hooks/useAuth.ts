import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { LoginUseCase } from "../../application/use-cases/LoginUseCase";
import { LoginWithGoogleUseCase } from "../../application/use-cases/LoginWithGoogleUseCase";
import { RegisterUseCase } from "../../application/use-cases/RegisterUseCase";
import { ResetPasswordUseCase } from "../../application/use-cases/ResetPasswordUseCase";
import { ResendConfirmationUseCase } from "../../application/use-cases/ResendConfirmationUseCase";
import { UserRole } from "../../domain/entities/User";
import { SupabaseAuthRepository } from "../../infrastructure/repositories/SupabaseAuthRepository";
import { useAuthStore } from "../store/authStore";

type RegisterDto = { email: string; password: string; username: string; role: UserRole };
type LoginDto = { email: string; password: string };

const authRepo = new SupabaseAuthRepository();
const loginUseCase = new LoginUseCase(authRepo);
const loginWithGoogleUseCase = new LoginWithGoogleUseCase(authRepo);
const registerUseCase = new RegisterUseCase(authRepo);
const resetPasswordUseCase = new ResetPasswordUseCase(authRepo);
const resendConfirmationUseCase = new ResendConfirmationUseCase(authRepo);

export function useAuth() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: LoginDto) => loginUseCase.execute(email, password),
    onSuccess: (user) => {
      setUser(user);
      router.replace("/(app)");
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ email, password, username, role }: RegisterDto) =>
      registerUseCase.execute(email, password, username, role),
    onSuccess: () => {
      router.replace("/(auth)/check-email");
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: () => loginWithGoogleUseCase.execute(),
    onSuccess: (user) => {
      setUser(user);
      router.replace("/(app)");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (email: string) => resetPasswordUseCase.execute(email),
  });

  const resendConfirmationMutation = useMutation({
    mutationFn: (email: string) => resendConfirmationUseCase.execute(email),
  });

  const logout = async () => {
    try {
      await authRepo.logout();
    } finally {
      setUser(null);
      router.replace("/(auth)/login");
    }
  };

  return {
    user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    loginWithGoogle: googleLoginMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    resendConfirmation: resendConfirmationMutation.mutate,
    logout,
    isLoading:
      loginMutation.isPending || registerMutation.isPending || googleLoginMutation.isPending,
    isResetLoading: resetPasswordMutation.isPending,
    isResendLoading: resendConfirmationMutation.isPending,
    error:
      loginMutation.error?.message ??
      registerMutation.error?.message ??
      googleLoginMutation.error?.message ??
      null,
    resetError: resetPasswordMutation.error?.message ?? null,
    resendError: resendConfirmationMutation.error?.message ?? null,
    resetSuccess: resetPasswordMutation.isSuccess,
    resendSuccess: resendConfirmationMutation.isSuccess,
  };
}