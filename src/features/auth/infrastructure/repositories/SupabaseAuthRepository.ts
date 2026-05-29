import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../../../../shared/infrastructure/supabase/client";
import { User, UserRole } from "../../domain/entities/User";
import { IAuthRepository, UpdateProfileData } from "../../domain/repositories/IAuthRepository";

const isUserRole = (value: unknown): value is UserRole => value === "adoptante" || value === "refugio";
const normalizeRole = (value: unknown): UserRole => (isUserRole(value) ? value : "adoptante");

const getWebUrl = () => {
  const url = process.env.EXPO_PUBLIC_WEB_URL
    ? `${process.env.EXPO_PUBLIC_WEB_URL}`
    : "https://mascotas-web-nine.vercel.app";
  return url.replace(/\/+$/, "");
};
const fallbackUsername = (email: string) => email.split("@")[0] || "usuario";

type ProfileRow = {
  username?: string | null;
  avatar_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  role?: string | null;
  nit?: string | null;
  phone?: string | null;
  address?: string | null;
  shelter_description?: string | null;
};

export class SupabaseAuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) throw error;

    const storedRole = normalizeRole(data.user.user_metadata?.role);

    return this.mapUser(data.user, storedRole);
  }

  async loginWithGoogle(): Promise<User> {
    const redirectTo = Linking.createURL("");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data.url) throw new Error("No se pudo iniciar Google Login");

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === "cancel") {
      throw new Error("El inicio de sesión con Google fue cancelado");
    }
    if (result.type !== "success" || !result.url) {
      throw new Error("No se recibió respuesta de Google");
    }

    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(
      new URL(result.url).searchParams.get("code") ?? ""
    );
    if (sessionError) throw sessionError;
    if (!session?.user) throw new Error("No se pudo obtener la sesión de Google");

    await this.ensureProfile(session.user);
    const user = await this.mapUser(session.user);
    return user;
  }

  async register(
    email: string,
    password: string,
    username: string,
    role: UserRole,
  ): Promise<User> {
    const confirmationRedirect = `${getWebUrl()}/confirm-email`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          role,
        },
        emailRedirectTo: confirmationRedirect,
      },
    });
    if (error) throw error;
    if (!data || !data.user) throw new Error("No se pudo crear el usuario");

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ id: data.user.id, username, role }, { onConflict: "id" });
    if (profileError) {
      console.warn("[register] profile upsert error (non-fatal):", profileError.message);
    }

    return { id: data.user.id, email: data.user.email!, username, role };
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async resetPassword(email: string): Promise<void> {
    const resetRedirect = `${getWebUrl()}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetRedirect,
    });
    if (error) throw error;
  }

  async resendConfirmation(email: string): Promise<void> {
    const confirmationRedirect = `${getWebUrl()}/confirm-email`;
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: confirmationRedirect,
      },
    });
    if (error) throw error;
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error("No hay sesión activa");

    const updateData: Record<string, unknown> = {};
    if (data.username !== undefined) updateData.username = data.username;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.nit !== undefined) updateData.nit = data.nit;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.shelterDescription !== undefined) updateData.shelter_description = data.shelterDescription;

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", authUser.id);
    if (error) throw error;

    return this.getCurrentUser() as Promise<User>;
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return this.mapUser(user);
  }

  private async ensureProfile(authUser: { id: string; email?: string | null; user_metadata?: { role?: unknown; full_name?: string; name?: string } }) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", authUser.id)
      .maybeSingle();
    const role = normalizeRole(authUser.user_metadata?.role);
    if (!existing) {
      await supabase.from("profiles").insert({
        id: authUser.id,
        username:
          authUser.user_metadata?.full_name ??
          authUser.user_metadata?.name ??
          fallbackUsername(authUser.email ?? "usuario@example.com"),
        role,
      });
    } else if (role) {
      await supabase.from("profiles").update({ role }).eq("id", authUser.id);
    }
  }

  private async mapUser(authUser: { id: string; email?: string | null; user_metadata?: { role?: unknown } }, storedRole?: UserRole): Promise<User> {
    const role = storedRole ?? normalizeRole(authUser.user_metadata?.role);
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url, latitude, longitude, role, nit, phone, address, shelter_description")
      .eq("id", authUser.id)
      .maybeSingle<ProfileRow>();
    if (!profile) {
      await supabase.from("profiles").insert({
        id: authUser.id,
        username: fallbackUsername(authUser.email ?? "usuario@example.com"),
        role,
      });
    } else if (!profile.role && role) {
      await supabase.from("profiles").update({ role }).eq("id", authUser.id);
    }
    return {
      id: authUser.id,
      email: authUser.email!,
      username: profile?.username ?? fallbackUsername(authUser.email ?? "usuario@example.com"),
      role,
      avatarUrl: profile?.avatar_url ?? undefined,
      latitude: profile?.latitude ?? null,
      longitude: profile?.longitude ?? null,
      nit: profile?.nit ?? null,
      phone: profile?.phone ?? null,
      address: profile?.address ?? null,
      shelterDescription: profile?.shelter_description ?? null,
    };
  }
}

