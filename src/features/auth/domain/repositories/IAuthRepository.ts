import { User } from '../entities/User';

export type UpdateProfileData = {
  username?: string;
  role?: string;
  latitude?: number | null;
  longitude?: number | null;
  nit?: string | null;
  phone?: string | null;
  address?: string | null;
  shelterDescription?: string | null;
};

export interface IAuthRepository {
	login(email: string, password: string): Promise<User>;
	loginWithGoogle(): Promise<User>;
	register(
		email: string,
		password: string,
		username: string,
		role: "adoptante" | "refugio",
	): Promise<User>;
	logout(): Promise<void>;
	getCurrentUser(): Promise<User | null>;
	resetPassword(email: string): Promise<void>;
	resendConfirmation(email: string): Promise<void>;
	updateProfile(data: UpdateProfileData): Promise<User>;
}