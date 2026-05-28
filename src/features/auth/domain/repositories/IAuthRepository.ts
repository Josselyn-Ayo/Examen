import { User } from '../entities/User';

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
}