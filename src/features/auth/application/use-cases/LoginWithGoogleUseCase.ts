import { AuthError } from "../../../../shared/domain/errors/AppError";
import { User } from "../../domain/entities/User";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";

export class LoginWithGoogleUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(): Promise<User> {
    try {
      return await this.authRepo.loginWithGoogle();
    } catch (error) {
      throw new AuthError("No se pudo iniciar sesión con Google", error);
    }
  }
}