export type UserRole = "adoptante" | "refugio";

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatarUrl?: string;
}