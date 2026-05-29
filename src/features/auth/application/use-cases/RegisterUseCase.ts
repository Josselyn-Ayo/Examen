import { AuthError } from "../../../../shared/domain/errors/AppError";
import { User, UserRole } from "../../domain/entities/User";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";

export class RegisterUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(
    email: string,
    password: string,
    username: string,
    role: UserRole,
  ): Promise<User> {
    if (!email || !password || !username) {
      throw new AuthError('Todos los campos son requeridos');
    }
    if (password.length < 6) {
      throw new AuthError('La contraseña debe tener al menos 6 caracteres');
    }
    try {
      return await this.authRepo.register(email, password, username, role);
    } catch (error) {
      const message = (error as any)?.message ?? String(error);
      throw new AuthError(message, error);
    }
  }
}