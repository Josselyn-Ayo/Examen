import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../../../../shared/infrastructure/supabase/client";
import { User, UserRole } from "../../domain/entities/User";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";

const isUserRole = (value: unknown): value is UserRole => value === "adoptante" || value === "refugio";
const normalizeRole = (value: unknown): UserRole => (isUserRole(value) ? value : "adoptante");

const getWebUrl = () => {
  const url = process.env.EXPO_PUBLIC_WEB_URL
    ? `${process.env.EXPO_PUBLIC_WEB_URL}`
    : "https://auth-esfot-web-taupe.vercel.app";
  return url.replace(/\/+$/, "");
};
const fallbackUsername = (email: string) => email.split("@")[0] || "usuario";

type ProfileRow = {
  username?: string | null;
  avatar_url?: string | null;
};

export class SupabaseAuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) throw error;

    const storedRole = normalizeRole(data.user.user_metadata?.role);

    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", data.user.id)
      .maybeSingle<ProfileRow>();

    if (!profile) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        username: fallbackUsername(data.user.email ?? email),
      });
    }

    return {
      id: data.user.id,
      email: data.user.email!,
      username: profile?.username ?? fallbackUsername(data.user.email ?? email),
      role: storedRole,
      avatarUrl: profile?.avatar_url ?? undefined,
    };
  }

  async loginWithGoogle(): Promise<User> {
    const redirectTo = Linking.createURL("/");
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
    if (result.type !== "success" || !result.url) {
      throw new Error("El inicio de sesión con Google fue cancelado");
    }

    const parsed = Linking.parse(result.url);
    const code = parsed.queryParams?.code;
    if (typeof code !== "string" || !code) {
      throw new Error("No se recibió el código de autorización de Google");
    }

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;

    const { data: currentUserResult } = await supabase.auth.getUser();
    const currentUser = currentUserResult.user;
    if (!currentUser) throw new Error("No se pudo recuperar el usuario de Google");

    const storedRole = normalizeRole(currentUser.user_metadata?.role);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", currentUser.id)
      .maybeSingle<ProfileRow>();

    if (profileError) throw profileError;
    if (!profile) {
      await supabase.from("profiles").insert({
        id: currentUser.id,
        username:
          currentUser.user_metadata?.full_name ??
          currentUser.user_metadata?.name ??
          fallbackUsername(currentUser.email ?? "usuario@example.com"),
      });
    }

    const user = await this.getCurrentUser();
    if (!user) throw new Error("No se pudo recuperar el usuario de Google");

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
    if (!data.user) throw new Error("No se pudo crear el usuario");
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ id: data.user.id, username });
    if (profileError) throw new Error(profileError.message);
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

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .maybeSingle<ProfileRow>();
    return {
      id: user.id,
      email: user.email!,
      username: profile?.username ?? fallbackUsername(user.email ?? "usuario@example.com"),
      role: normalizeRole(user.user_metadata?.role),
      avatarUrl: profile?.avatar_url ?? undefined,
    };
  }
}

