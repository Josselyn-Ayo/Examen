import { AuthError } from "../../../../shared/domain/errors/AppError";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";

export class ResendConfirmationUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(email: string): Promise<void> {
    if (!email) {
      throw new AuthError("El email es requerido");
    }
    try {
      await this.authRepo.resendConfirmation(email);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al reenviar la confirmación";
      throw new AuthError(message, error);
    }
  }
}