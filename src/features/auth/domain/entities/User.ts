export type UserRole = "adoptante" | "refugio";

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatarUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
  nit?: string | null;
  phone?: string | null;
  address?: string | null;
  shelterDescription?: string | null;
}