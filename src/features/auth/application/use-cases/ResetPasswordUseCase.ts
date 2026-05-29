import { AuthError } from "../../../../shared/domain/errors/AppError";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";

export class ResetPasswordUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(email: string): Promise<void> {
    if (!email) {
      throw new AuthError("El email es requerido");
    }
    try {
      await this.authRepo.resetPassword(email);
    } catch (error) {
      const message = (error as any)?.message ?? String(error);
      throw new AuthError(message, error);
    }
  }
}