# Documentación Completa — PetAdopt

## 1. Introducción y Propósito

**PetAdopt** es una aplicación móvil (Expo/React Native) con una web app complementaria (Vite/React) para la adopción de mascotas. Conecta adoptantes con refugios mediante chat en tiempo real, asistente IA veterinario, mapa interactivo de refugios con OpenStreetMap, y gestión completa de solicitudes de adopción.

### Propósito de este documento

Explicar con código real la arquitectura del proyecto, estructura de carpetas, flujo de datos, función de cada archivo/componente, y conexión con todos los servicios externos (Supabase, Gemini AI, OpenStreetMap, notificaciones, etc.).

---

## 2. Arquitectura General

### 2.1 Clean Architecture (4 Capas)

Cada feature sigue **Arquitectura Limpia** con 4 capas. Aquí está la estructura de carpetas de una feature típica:

```
src/features/auth/                  ← Feature de autenticación
├── domain/                          ← 1. Capa de dominio (entidades + contratos)
│   ├── entities/
│   │   └── User.ts                  ← Entidad de negocio
│   └── repositories/
│       └── IAuthRepository.ts       ← Contrato/interfaz del repositorio
├── application/
│   └── use-cases/
│       └── LoginUseCase.ts          ← 2. Capa de aplicación (casos de uso)
├── infrastructure/
│   └── repositories/
│       └── SupabaseAuthRepository.ts ← 3. Capa de infraestructura (implementación)
└── presentation/
    ├── hooks/
    │   └── useAuth.ts               ← 4. Capa de presentación (hooks React)
    └── store/
        └── authStore.ts             ← Estado global (Zustand)
```

**Principio fundamental:** Las capas internas (domain) NO conocen las externas. Las capas externas (infrastructure, presentation) SÍ conocen las internas. Esto se llama **Dependency Inversion**.

---

### 2.2 Capa de Dominio (`domain/`) — Entidades + Contratos

Son tipos e interfaces PURAS, sin dependencias de frameworks. Definen LA FORMA de los datos y LOS CONTRATOS que los repositorios deben cumplir.

#### Entidad `User` → `src/features/auth/domain/entities/User.ts`

```typescript
export type UserRole = "adoptante" | "refugio";

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatarUrl?: string;
  // Datos de refugio (solo si role === "refugio")
  latitude?: number;
  longitude?: number;
  nit?: string;
  phone?: string;
  address?: string;
  shelterDescription?: string;
}
```

#### Entidad `Pet` → `src/features/pets/domain/entities/Pet.ts`

```typescript
export type PetSpecies = "perro" | "gato" | "conejo" | "otro";
export type PetStatus = "disponible" | "adoptado";
export type PetSize = "pequeño" | "mediano" | "grande";
export type PetPersonality = "tranquilo" | "activo" | "jugueton" | "timido" | "independiente";

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  age: number;
  size: PetSize;
  description: string;
  history: string;
  personality: string;
  personalityType: PetPersonality;
  imageUrl?: string;
  imageUrls?: string[];
  shelterId: string;
  shelterName?: string;
  status: PetStatus;
  createdAt: string;
}
```

#### Contrato `IAuthRepository` → `src/features/auth/domain/repositories/IAuthRepository.ts`

```typescript
import { User } from "../entities/User";

export interface UpdateProfileData {
  username?: string;
  avatarUrl?: string;
  latitude?: number;
  longitude?: number;
  nit?: string;
  phone?: string;
  address?: string;
  shelterDescription?: string;
}

export interface IAuthRepository {
  login(email: string, password: string): Promise<User>;
  loginWithGoogle(): Promise<User>;
  register(data: {
    email: string; password: string; username: string; role: UserRole;
  }): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  resetPassword(email: string): Promise<void>;
  resendConfirmation(email: string): Promise<void>;
  updateProfile(data: UpdateProfileData): Promise<User>;
}
```

#### Contrato `IPetRepository` → `src/features/pets/domain/repositories/IPetRepository.ts`

```typescript
export interface IPetRepository {
  getPets(): Promise<Pet[]>;
  getPetById(id: string): Promise<Pet | null>;
  getPetsByShelter(shelterId: string): Promise<Pet[]>;
  getPetsByAdoptante(adoptanteId: string): Promise<Pet[]>;
  createPet(input: CreatePetInput, images?: string[]): Promise<Pet>;
  updatePet(id: string, input: UpdatePetInput): Promise<Pet>;
  deletePet(id: string): Promise<void>;
}
```

#### Entidad `Message` → `src/features/chat/domain/entities/Message.ts`

```typescript
export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  imageUrl?: string;
  localImageUri?: string;  // URI local temporal mientras se sube
  failed?: boolean;        // true si falló el envío
  sending?: boolean;       // true mientras se envía (optimistic)
  createdAt: string;
  authorUsername?: string;
}
```

#### Error compartido → `src/shared/domain/errors/AppError.ts`

```typescript
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class AuthError extends AppError {
  constructor(message: string, cause?: unknown) {
    super("AUTH_ERROR", message, cause);
  }
}

export class ChatError extends AppError {
  constructor(message: string, cause?: unknown) {
    super("CHAT_ERROR", message, cause);
  }
}
```

---

### 2.3 Capa de Aplicación (`application/`) — Casos de Uso

Los casos de uso orquestan la lógica de negocio: validan inputs, llaman al repositorio (por su interfaz), y envuelven errores.

#### `LoginUseCase` → `src/features/auth/application/use-cases/LoginUseCase.ts`

```typescript
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { User } from "../../domain/entities/User";
import { AuthError } from "../../../../shared/domain/errors/AppError";

export class LoginUseCase {
  // Recibe el repositorio por SU INTERFAZ (no la implementación concreta)
  constructor(private authRepo: IAuthRepository) {}

  async execute(email: string, password: string): Promise<User> {
    if (!email || !password) {
      throw new AuthError("Email y contraseña son requeridos");
    }
    try {
      return await this.authRepo.login(email, password);
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError("Error al iniciar sesión", error);
    }
  }
}
```

#### `CreatePetUseCase` → `src/features/pets/application/use-cases/CreatePetUseCase.ts`

```typescript
export class CreatePetUseCase {
  constructor(private petRepo: IPetRepository) {}

  async execute(input: CreatePetInput, images?: string[]): Promise<Pet> {
    if (!input.name || !input.species || !input.size || !input.personalityType) {
      throw new AppError("PET_ERROR", "Campos requeridos: nombre, especie, tamaño, personalidad");
    }
    return await this.petRepo.createPet(input, images);
  }
}
```

#### `CreateAdoptionRequestUseCase` → (usa dos repositorios de diferentes features)

```typescript
export class CreateAdoptionRequestUseCase {
  constructor(
    private adoptionRepo: IAdoptionRepository,
    private chatRepo: IChatRepository  // Cross-feature!
  ) {}

  async execute(data: {
    petId: string; adoptanteId: string; refugioId: string; message: string;
  }): Promise<AdoptionRequest> {
    if (!data.message) throw new AppError("ADOPTION_ERROR", "Debes incluir un mensaje");

    const request = await this.adoptionRepo.createRequest(data);

    // Crea automáticamente una sala de chat entre adoptante y refugio
    const room = await this.chatRepo.createRoom({
      name: `Adopción: ${data.petId}`,
      createdBy: data.adoptanteId,
      petId: data.petId,
      adoptanteId: data.adoptanteId,
      refugioId: data.refugioId,
    });

    await this.adoptionRepo.updateRoomId(request.id, room.id);
    return { ...request, roomId: room.id };
  }
}
```

---

### 2.4 Capa de Infraestructura (`infrastructure/`) — Implementaciones Concretas

Aquí es donde el código realmente se conecta con Supabase, Gemini, etc.

#### `SupabaseAuthRepository` → `src/features/auth/infrastructure/repositories/SupabaseAuthRepository.ts`

```typescript
export class SupabaseAuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new AuthError(error.message, error);
    return this.mapUser(data.user);
  }

  async loginWithGoogle(): Promise<User> {
    const redirectUrl = Linking.createURL("/");
    const { data } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    });
    if (!data.url) throw new AuthError("No se pudo iniciar OAuth");

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
    if (result.type !== "success") throw new AuthError("Inicio de sesión cancelado");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AuthError("No se pudo obtener el usuario");
    await this.ensureProfile(user);
    return this.mapUser(user);
  }

  async register(data: {
    email: string; password: string; username: string; role: UserRole;
  }): Promise<User> {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { username: data.username, role: data.role } },
    });
    if (error) throw new AuthError(error.message, error);
    if (!authData.user) throw new AuthError("Error al crear usuario");

    await supabase.from("profiles").upsert({
      id: authData.user.id,
      username: data.username,
      role: data.role,
    });
    return this.mapUser(authData.user, data.username, data.role);
  }

  private async mapUser(
    supabaseUser: any, username?: string, role?: string
  ): Promise<User> {
    const profile = await this.getProfile(supabaseUser.id);
    return {
      id: supabaseUser.id,
      email: supabaseUser.email ?? "",
      username: username ?? profile?.username ?? "",
      role: this.normalizeRole(role ?? profile?.role),
      avatarUrl: profile?.avatar_url,
      latitude: profile?.latitude,
      longitude: profile?.longitude,
      nit: profile?.nit,
      phone: profile?.phone,
      address: profile?.address,
      shelterDescription: profile?.shelter_description,
    };
  }

  private getWebUrl(): string {
    return process.env.EXPO_PUBLIC_WEB_URL ?? "https://mascotas-web-nine.vercel.app";
  }
}
```

#### `SupabasePetRepository` → `src/features/pets/infrastructure/repositories/SupabasePetRepository.ts`

```typescript
export class SupabasePetRepository implements IPetRepository {
  async getPets(): Promise<Pet[]> {
    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .eq("status", "disponible")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data.map(this.mapToPet);
  }

  async createPet(input: CreatePetInput, images?: string[]): Promise<Pet> {
    let imageUrls: string[] = [];

    if (images && images.length > 0) {
      const session = await supabase.auth.getSession();
      const token = session?.data?.session?.access_token;
      if (!token) throw new Error("No autenticado");

      for (const uri of images) {
        const ext = uri.split(".").pop() ?? "jpg";
        const filePath = `pets/${Date.now()}.${ext}`;

        try {
          // Intento 1: FileSystem.uploadAsync (multipart nativo)
          const result = await FileSystem.uploadAsync(
            `${supabaseUrl}/storage/v1/object/Imagenes/${filePath}`,
            uri,
            {
              headers: { authorization: `Bearer ${token}` },
              httpMethod: "PUT",
            }
          );
          if (result.status === 200) {
            imageUrls.push(filePath);
          }
        } catch {
          // Fallback: base64 via fetch
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const response = await fetch(
            `${supabaseUrl}/storage/v1/object/Imagenes/${filePath}`,
            {
              method: "PUT",
              headers: {
                authorization: `Bearer ${token}`,
                "content-type": `image/${ext}`,
              },
              body: base64,
            }
          );
          if (response.ok) imageUrls.push(filePath);
        }
      }
    }

    const { data, error } = await supabase.from("pets").insert({
      name: input.name,
      species: input.species,
      breed: input.breed ?? null,
      age: input.age ?? null,
      size: input.size,
      description: input.description ?? null,
      history: input.history ?? null,
      personality: input.personality ?? null,
      personality_type: input.personalityType,
      image_url: imageUrls[0] ?? null,
      image_urls: imageUrls.length > 0 ? imageUrls : null,
      shelter_id: input.shelterId,
      status: "disponible",
    }).select().single();

    if (error) throw error;
    return this.mapToPet(data);
  }

  private mapToPet(data: any): Pet {
    return {
      id: data.id,
      name: data.name,
      species: data.species,
      breed: data.breed ?? "",
      age: data.age ?? 0,
      size: data.size,
      description: data.description ?? "",
      history: data.history ?? "",
      personality: data.personality ?? "",
      personalityType: data.personality_type,
      imageUrl: data.image_url,
      imageUrls: data.image_urls,
      shelterId: data.shelter_id,
      shelterName: data.shelter_name,
      status: data.status,
      createdAt: data.created_at,
    };
  }
}
```

#### `GeminiAiRepository` → `src/features/ai/infrastructure/repositories/GeminiAiRepository.ts`

```typescript
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

const SYSTEM_PROMPT = `Eres PetCare AI, un asistente veterinario amigable y experto.
Responde en español de forma clara y sin usar markdown.
Ayuda con dudas sobre cuidados básicos, alimentación, comportamiento y salud.
SIEMPRE recomienda visitar a un veterinario real para emergencias o diagnósticos.`;

export class GeminiAiRepository implements IAiRepository {
  async sendMessage(
    conversationHistory: AiMessage[], userMessage: string
  ): Promise<string> {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) throw new AppError("AI_ERROR", "API key de Gemini no configurada");

    const history = conversationHistory.slice(-10); // últimos 10 mensajes
    const contents = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      ...history.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    ];

    let lastError: Error | null = null;

    // Retry: 3 intentos con backoff exponencial
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(`${API_URL}?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents }),
        });

        if (response.status === 429 || response.status === 503) {
          // Rate limited / service unavailable → esperar y reintentar
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
          continue;
        }

        const data = await response.json();

        if (data.promptFeedback?.blockReason) {
          return "Lo siento, no puedo responder a esa pregunta.";
        }

        return data.candidates?.[0]?.content?.parts?.[0]?.text
          ?? "Lo siento, no pude procesar tu mensaje.";
      } catch (err) {
        lastError = err instanceof Error ? err : new Error("Error desconocido");
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
        }
      }
    }

    throw new AppError("AI_ERROR", "Error al comunicarse con la IA", lastError);
  }
}
```

---

### 2.5 Capa de Presentación (`presentation/`) — Hooks React + Store

Los hooks instancian los repositorios y casos de uso como singletons, y exponen una API limpia para las pantallas usando React Query y Zustand.

#### `useAuth` hook → `src/features/auth/presentation/hooks/useAuth.ts`

```typescript
// Singletons: se crean UNA SOLA VEZ fuera del hook
const authRepo = new SupabaseAuthRepository();
const loginUseCase = new LoginUseCase(authRepo);
const registerUseCase = new RegisterUseCase(authRepo);
const googleUseCase = new LoginWithGoogleUseCase(authRepo);
const resetUseCase = new ResetPasswordUseCase(authRepo);
const resendUseCase = new ResendConfirmationUseCase(authRepo);

export function useAuth() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      loginUseCase.execute(data.email, data.password),
    onSuccess: (user) => {
      setUser(user);
      router.replace("/(app)");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: {
      email: string; password: string; username: string; role: UserRole;
    }) => registerUseCase.execute(data),
    onSuccess: () => {
      router.replace("/(auth)/check-email");
    },
  });

  const googleMutation = useMutation({
    mutationFn: () => googleUseCase.execute(),
    onSuccess: (user) => {
      setUser(user);
      router.replace("/(app)");
    },
  });

  return {
    user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    loginWithGoogle: googleMutation.mutateAsync,
    logout: async () => { await authRepo.logout(); setUser(null); router.replace("/(auth)/login"); },
    resetPassword: (email: string) => resetUseCase.execute(email),
    resendConfirmation: (email: string) => resendUseCase.execute(email),
    isLoading: loginMutation.isPending || registerMutation.isPending || googleMutation.isPending,
    error: loginMutation.error?.message ?? registerMutation.error?.message ?? null,
  };
}
```

#### `useChat` hook → `src/features/chat/presentation/hooks/useChat.ts`

```typescript
// Singletons
const chatRepo = new SupabaseChatRepository();
const getMessagesUseCase = new GetMessagesUseCase(chatRepo);
const sendMessageUseCase = new SendMessageUseCase(chatRepo);
const subscribeUseCase = new SubscribeToRoomUseCase(chatRepo);

export function useChat(roomId: string) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // 1. Fetch histórico (con staleTime: Infinity porque usamos Realtime)
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: () => getMessagesUseCase.execute(roomId),
    staleTime: Infinity,
  });

  // 2. Suscripción Realtime
  useEffect(() => {
    const unsubscribe = subscribeUseCase.execute(roomId, (newMessage) => {
      queryClient.setQueryData<Message[]>(["messages", roomId], (old) => {
        if (!old) return [newMessage];
        // Deduplicación: evitar duplicados del optimistic update
        const exists = old.some(
          (m) => m.id === newMessage.id || m.id === `temp-${Date.now()}`
        );
        return exists ? old : [...old, newMessage];
      });
    });
    return unsubscribe;
  }, [roomId]);

  // 3. Envío con Optimistic Update
  const sendMutation = useMutation({
    mutationFn: (data: { content: string; imageUri?: string }) =>
      sendMessageUseCase.execute({
        roomId,
        userId: user!.id,
        content: data.content,
        imageUri: data.imageUri,
      }),

    // FASE 1: ANTES de la mutación → crear mensaje temporal
    onMutate: async (data) => {
      const tempMsg: Message = {
        id: `temp-${Date.now()}`,
        roomId,
        userId: user!.id,
        content: data.content,
        sending: true,
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData<Message[]>(["messages", roomId], (old) =>
        old ? [...old, tempMsg] : [tempMsg]
      );
      return { tempMsg };
    },

    // FASE 2: ÉXITO → reemplazar temporal por real
    onSuccess: (realMsg, _vars, context) => {
      queryClient.setQueryData<Message[]>(["messages", roomId], (old) =>
        old?.map((m) => m.id === context?.tempMsg.id ? realMsg : m) ?? []
      );
    },

    // FASE 3: ERROR → marcar como fallido
    onError: (_err, _vars, context) => {
      queryClient.setQueryData<Message[]>(["messages", roomId], (old) =>
        old?.map((m) =>
          m.id === context?.tempMsg.id
            ? { ...m, failed: true, sending: false }
            : m
        ) ?? []
      );
    },
  });

  const retrySend = (failedMsg: Message) => {
    // Eliminar el fallido y re-enviar
    queryClient.setQueryData<Message[]>(["messages", roomId], (old) =>
      old?.filter((m) => m.id !== failedMsg.id) ?? []
    );
    sendMutation.mutate({
      content: failedMsg.content,
      imageUri: failedMsg.localImageUri,
    });
  };

  return {
    messages,
    sendMessage: sendMutation.mutate,
    retrySend,
    isLoading,
    isSending: sendMutation.isPending,
  };
}
```

#### `usePets` hook → `src/features/pets/presentation/hooks/usePets.ts`

```typescript
export function usePets() {
  const { user } = useAuthStore();

  const { data: pets = [], isLoading, error, refetch } = useQuery({
    queryKey: ["pets"],
    queryFn: () => new GetPetsUseCase(new SupabasePetRepository()).execute(),
  });

  const { data: myPets = [], isLoading: isLoadingMyPets } = useQuery({
    queryKey: ["myPets", user?.id],
    queryFn: () => new SupabasePetRepository().getPetsByShelter(user!.id),
    enabled: user?.role === "refugio",
  });

  const createMutation = useMutation({
    mutationFn: (data: { input: CreatePetInput; images?: string[] }) =>
      new CreatePetUseCase(new SupabasePetRepository()).execute(data.input, data.images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["myPets"] });
    },
  });

  return {
    pets, myPets, isLoading, isLoadingMyPets, error, refetch,
    createPet: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error?.message ?? null,
  };
}
```

#### `authStore` (Zustand) → `src/features/auth/presentation/store/authStore.ts`

```typescript
import { create } from "zustand";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

---

### 2.6 Cliente Supabase Compartido → `src/shared/infrastructure/supabase/client.ts`

```typescript
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

// Adaptador SecureStore para que Supabase guarde tokens de forma encriptada
const SecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL
  ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  ?? "";

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan variables de entorno Supabase. Revisa tu archivo .env"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStoreAdapter,  // Tokens encriptados
    autoRefreshToken: true,
    persistSession: true,
  },
});
```

---

## 3. Estructura de Carpetas (con código)

### 3.1 Árbol General

```
Taller10-main/
├── app/                    ← Pantallas (Expo Router file-based routing)
├── apps/web/               ← Web app para auth redirects
├── src/                    ← Lógica de negocio (Clean Architecture)
├── components/             ← Componentes UI reutilizables
├── hooks/                  ← Hooks globales
├── constants/              ← Colores y fuentes del tema
├── assets/                 ← Imágenes y animaciones Lottie
├── .env                    ← Variables de entorno
├── app.json                ← Configuración Expo
├── eas.json                ← Perfiles EAS Build
└── *.sql                   ← Migraciones de Supabase
```

### 3.2 `app/` — Pantallas (Expo Router)

Expo Router usa **file-based routing**: la estructura de carpetas define las rutas.

```
app/
├── _layout.tsx                      ← Ruta: / (Layout raíz)
│
├── (auth)/                          ← Grupo sin BottomNav
│   ├── _layout.tsx                  ← Stack navigator
│   ├── login.tsx                    ← /login
│   ├── register.tsx                 ← /register
│   ├── check-email.tsx              ← /check-email
│   ├── forgot-password.tsx          ← /forgot-password
│   └── reset-password.tsx           ← /reset-password
│
└── (app)/                           ← Grupo con BottomNav
    ├── _layout.tsx                  ← Stack navigator
    ├── index.tsx                    ← / (Chat rooms)
    ├── adoptions.tsx                ← /adoptions
    ├── adoption-form.tsx            ← /adoption-form
    ├── ai-assistant.tsx             ← /ai-assistant
    ├── map.tsx                      ← /map
    ├── contacts.tsx                 ← /contacts
    ├── editar-perfil.tsx            ← /editar-perfil
    ├── registrar-refugio.tsx        ← /registrar-refugio
    ├── privacidad.tsx               ← /privacidad
    ├── ayuda.tsx                    ← /ayuda
    ├── debug-supabase.tsx           ← /debug-supabase
    ├── chat/
    │   └── [roomId].tsx             ← /chat/:roomId (ruta dinámica)
    └── pets/
        ├── index.tsx                ← /pets
        └── [petId].tsx              ← /pets/:petId (ruta dinámica)
```

**Ejemplo: ¿Cómo se define una ruta dinámica?**

En `chat/[roomId].tsx`, el parámetro `roomId` se obtiene así:

```typescript
// app/(app)/chat/[roomId].tsx
import { useLocalSearchParams } from "expo-router";

export default function ChatRoom() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { messages, sendMessage, isLoading } = useChat(roomId);
  // ...
}
```

**Ejemplo: Layout raíz con AuthGuard:**

```typescript
// app/_layout.tsx
function AuthGuard() {
  useMessageNotifications(activeRoomId);  // ← Hook de notificaciones
  useAdoptionNotifications();            // ← Hook de notificaciones

  useEffect(() => {
    authRepo.getCurrentUser().then(setUser);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setUser(null);
      if (event === "PASSWORD_RECOVERY") router.replace("/(auth)/reset-password");
    });
    return () => subscription.unsubscribe();
  }, []);

  // Redirigir según auth state
  useEffect(() => {
    if (!user && !inAuth) router.replace("/(auth)/login");
    if (user && inAuth) router.replace(user.role === "refugio" ? "/(app)" : "/(app)/pets");
  }, [user, segments]);

  // Notificaciones push tocadas
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((notification) => {
      const data = notification.request.content.data;
      if (data?.roomId) router.push(`/(app)/chat/${data.roomId}`);
      else if (data?.type === "adoption") router.push("/(app)/adoptions");
    });
    return () => sub.remove();
  }, []);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <AuthGuard />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
```

### 3.3 `src/features/` — Lógica de Negocio (Clean Architecture)

Cada feature tiene 4 carpetas (domain, application, infrastructure, presentation):

```
src/features/auth/     ← Autenticación (5 use-cases, 1 repositorio, 1 hook, 1 store)
src/features/pets/     ← Mascotas (5 use-cases, 1 repositorio, 1 hook)
src/features/chat/     ← Chat (4 use-cases, 1 repositorio, 3 hooks)
src/features/adoptions/ ← Adopciones (3 use-cases, 1 repositorio, 2 hooks)
src/features/favorites/ ← Favoritos (2 use-cases, 1 repositorio, 1 hook)
src/features/ai/       ← Asistente IA (1 use-case, 1 repositorio, 1 hook)
src/features/map/      ← Mapa de refugios (1 hook, sin domain/application/infrastructure)
```

**¿Dónde se conecta cada hook con su repositorio?**

En los hooks de presentation se instancian los singletons:

```typescript
// src/features/auth/presentation/hooks/useAuth.ts
const authRepo = new SupabaseAuthRepository();  // ← instancia única
const loginUseCase = new LoginUseCase(authRepo); // ← recibe interfaz, no concreto
```

```typescript
// src/features/pets/presentation/hooks/usePets.ts
const petRepo = new SupabasePetRepository();     // ← instancia única
const getPetsUseCase = new GetPetsUseCase(petRepo);
```

```typescript
// src/features/chat/presentation/hooks/useChat.ts
const chatRepo = new SupabaseChatRepository();
const getMessagesUseCase = new GetMessagesUseCase(chatRepo);
```

**¿Dónde se cruzan features?** En `CreateAdoptionRequestUseCase`:

```typescript
// src/features/adoptions/application/use-cases/CreateAdoptionRequestUseCase.ts
export class CreateAdoptionRequestUseCase {
  constructor(
    private adoptionRepo: IAdoptionRepository,
    private chatRepo: IChatRepository  // ← Importa interfaz de CHAT feature
  ) {}
}
```

### 3.4 `src/shared/` — Código Compartido

```
src/shared/
├── domain/errors/
│   └── AppError.ts           ← AppError, AuthError, ChatError
└── infrastructure/supabase/
    └── client.ts             ← Cliente Supabase singleton (con SecureStore)
```

### 3.5 `components/` — Componentes UI

```
components/
├── BottomNav.tsx              ← Barra inferior con 6 tabs
├── auth-background.tsx        ← Fondo animado para auth
├── external-link.tsx          ← Enlace que abre in-app browser
├── haptic-tab.tsx             ← Tab con feedback háptico
├── hello-wave.tsx             ← Animación de mano
├── parallax-scroll-view.tsx   ← Scroll con parallax
├── themed-text.tsx            ← Texto con tema claro/oscuro
├── themed-view.tsx            ← View con tema claro/oscuro
└── ui/
    ├── collapsible.tsx        ← Acordeón expandible
    ├── icon-symbol.tsx        ← Icono multi-plataforma (Android/Web)
    └── icon-symbol.ios.tsx    ← Icono multi-plataforma (iOS)
```

**Ejemplo de `BottomNav`:**

```typescript
// components/BottomNav.tsx
type Tab = "chat" | "pets" | "ai" | "adoptions" | "map" | "profile";

export function BottomNav({ active }: { active: Tab }) {
  const tabs = [
    { key: "chat" as Tab, icon: "chatbubbles", iconSet: Ionicons, route: "/(app)" },
    { key: "pets" as Tab, icon: "paw", iconSet: Ionicons, route: "/(app)/pets" },
    { key: "ai" as Tab, icon: "cpu", iconSet: Feather, route: "/(app)/ai-assistant" },
    { key: "adoptions" as Tab, icon: "file-text", iconSet: Feather, route: "/(app)/adoptions" },
    { key: "map" as Tab, icon: "map", iconSet: Ionicons, route: "/(app)/map" },
    { key: "profile" as Tab, icon: "account", iconSet: MaterialCommunityIcons, route: "/(app)/contacts" },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => router.replace(tab.route)}
            style={[styles.tab, isActive && styles.activeTab]}
          >
            <tab.iconSet name={tab.icon} size={22} color={isActive ? "#fff" : "#9ca3af"} />
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
```

### 3.6 `hooks/` — Hooks Globales

```
hooks/
├── use-color-scheme.ts       ← useColorScheme para native
├── use-color-scheme.web.ts   ← useColorScheme para web (con hidratación)
└── use-theme-color.ts        ← Resuelve color del theme
```

**Ejemplo:**

```typescript
// hooks/use-theme-color.ts
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];
  if (colorFromProps) return colorFromProps;
  return Colors[theme][colorName];
}
```

### 3.7 `constants/` — Tema

```typescript
// constants/theme.ts
export const Colors = {
  light: {
    text: "#11181c",
    background: "#fff",
    tint: "#0a7ea4",
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: "#0a7ea4",
  },
  dark: {
    text: "#eceeef",
    background: "#151718",
    tint: "#0a7ea4",
    icon: "#9ba1a6",
    tabIconDefault: "#9ba1a6",
    tabIconSelected: "#0a7ea4",
  },
};
```

---

## 4. Descripción de Pantallas con Código

### 4.1 Login → `app/(auth)/login.tsx`

```typescript
export default function LoginScreen() {
  const { login, loginWithGoogle, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <ScrollView style={styles.container}>
      {/* Imagen animada del perro */}
      <Animated.Image
        source={require("../../assets/images/perrito2.png")}
        style={[styles.dogImage, { transform: [{ rotate }, { translateY: float }] }]}
      />
      <Text style={styles.title}>Iniciar Sesión</Text>

      <TextInput placeholder="Correo electrónico" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Contraseña" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={styles.button}
        onPress={() => login({ email, password })}
        disabled={isLoading}
      >
        <Text>{isLoading ? "Cargando..." : "Iniciar Sesión"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={loginWithGoogle}>
        <Text>Iniciar con Google</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
```

**¿Dónde se conecta?** `useAuth()` → `LoginUseCase` → `SupabaseAuthRepository.login()` → `supabase.auth.signInWithPassword()`

### 4.2 Chat → `app/(app)/chat/[roomId].tsx`

```typescript
export default function ChatRoom() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { messages, sendMessage, retrySend, isLoading } = useChat(roomId);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.bubble, item.userId === user.id ? styles.own : styles.other]}>
      {item.sending && <Text style={styles.sending}>Enviando...</Text>}
      {item.failed && (
        <TouchableOpacity onPress={() => retrySend(item)}>
          <Text style={styles.retry}>Error. Tocar para reintentar.</Text>
        </TouchableOpacity>
      )}
      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.image} />}
      <Text>{item.content}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <LottieView source={chatLoading} autoPlay loop style={styles.loading} />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList data={messages} renderItem={renderMessage} inverted />
      <MessageInput onSend={(text) => sendMessage({ content: text })} />
    </View>
  );
}
```

### 4.3 AI Assistant → `app/(app)/ai-assistant.tsx`

```typescript
export default function AiAssistantScreen() {
  const { messages, sendMessage, isLoading, clearChat } = useAiAssistant();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <LottieView source={catFace} autoPlay loop style={styles.avatar} />
        <Text style={styles.title}>🐾 PetCare AI</Text>
        <TouchableOpacity onPress={clearChat}><Text>🗑️ Limpiar</Text></TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={item.role === "user" ? styles.userMsg : styles.aiMsg}>
            {item.role === "assistant" && <LottieView source={catPaw} style={styles.paw} />}
            <Text>{item.content}</Text>
          </View>
        )}
      />

      {isLoading && <LottieView source={chatLoading} autoPlay loop style={styles.typing} />}

      <MessageInput onSend={sendMessage} />
    </View>
  );
}
```

**¿Dónde se conecta?** `useAiAssistant()` → `SendAiMessageUseCase` → `GeminiAiRepository.sendMessage()` → `fetch(GEMINI_API)`

### 4.4 Mapa → `app/(app)/map.tsx`

```typescript
export default function MapScreen() {
  const { shelters } = useShelters();
  const { latitude, longitude } = useCurrentLocation();

  // Genera HTML con Leaflet y OpenStreetMap
  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    </head>
    <body>
      <div id="map" style="width:100%;height:100%;"></div>
      <script>
        const map = L.map('map').setView([${latitude ?? -2.9}, ${longitude ?? -79.0}], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);

        // Marcadores de refugios
        ${shelters.map((s) => `
          L.marker([${s.latitude}, ${s.longitude}], {
            icon: L.divIcon({ className: 'shelter-marker', html: '📍' })
          }).addTo(map).bindPopup('${s.username}');
        `).join('')}

        // Ubicación del usuario
        ${latitude && longitude ? `
          L.circleMarker([${latitude}, ${longitude}], {
            color: '#3b82f6', radius: 8
          }).addTo(map).bindPopup('Tu ubicación');
        ` : ''}
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView source={{ html: mapHTML }} style={styles.map} />
      <FlatList data={shelters} renderItem={ShelterCard} />
    </View>
  );
}
```

**¿Dónde se conecta?** `useShelters()` → `supabase.from("profiles").select("id, username, latitude, longitude")` + OpenStreetMap tiles via Leaflet

---

## 5. Flujo de Datos con Código

### 5.1 Flujo de Autenticación

```
Pantalla (login.tsx)
  ↓ llama
useAuth().login({ email, password })
  ↓
LoginUseCase.execute(email, password)
  ↓ valida: if (!email || !password) throw AuthError
  ↓
SupabaseAuthRepository.login(email, password)
  ↓
supabase.auth.signInWithPassword({ email, password })
  ↓
  Éxito: mapea usuario → authStore.setUser(user) → router.replace("/(app)")
  Error: AuthError → se muestra en pantalla
```

**Código de la conexión real:**

```typescript
// SupabaseAuthRepository.ts
async login(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new AuthError(error.message, error);
  return this.mapUser(data.user);
}

// useAuth.ts
const loginMutation = useMutation({
  mutationFn: (data: { email: string; password: string }) =>
    loginUseCase.execute(data.email, data.password),
  onSuccess: (user) => {
    setUser(user);                    // ← Zustand store
    router.replace("/(app)");         // ← Navegación
  },
});
```

### 5.2 Flujo de Chat (Optimistic Updates)

```
Pantalla (chat/[roomId].tsx)
  ↓
useChat(roomId)
  │
  ├── useQuery(["messages", roomId]) → GetMessagesUseCase
  │     → SupabaseChatRepository.getMessages(roomId)
  │     → supabase.from("messages").select("*").eq("room_id", roomId)
  │
  ├── useEffect → SubscribeToRoomUseCase
  │     → SupabaseChatRepository.subscribeToRoom(roomId)
  │     → supabase.channel().on("postgres_changes", { ... })
  │
  └── useMutation → sendMessage
        → Optimistic Update (3 fases):
          1. onMutate:  crea mensaje temp { sending: true }
          2. onSuccess: reemplaza temp por real
          3. onError:   marca temp como { failed: true }
```

**Código real del Optimistic Update (useChat.ts):**

```typescript
const sendMutation = useMutation({
  mutationFn: (data) => sendMessageUseCase.execute({ roomId, ...data }),

  onMutate: async (data) => {
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      roomId, userId: user!.id, content: data.content,
      sending: true,
      createdAt: new Date().toISOString(),
    };
    queryClient.setQueryData<Message[]>(["messages", roomId], (old) =>
      old ? [...old, tempMsg] : [tempMsg]
    );
    return { tempMsg };
  },

  onSuccess: (realMsg, _vars, context) => {
    queryClient.setQueryData<Message[]>(["messages", roomId], (old) =>
      old?.map((m) => m.id === context?.tempMsg.id ? realMsg : m) ?? []
    );
  },

  onError: (_err, _vars, context) => {
    queryClient.setQueryData<Message[]>(["messages", roomId], (old) =>
      old?.map((m) =>
        m.id === context?.tempMsg.id ? { ...m, failed: true, sending: false } : m
      ) ?? []
    );
  },
});
```

### 5.3 Flujo de Asistente IA

```
Pantalla (ai-assistant.tsx)
  ↓
useAiAssistant().sendMessage("Mi perro no come")
  ↓ agrega mensaje user al estado
SendAiMessageUseCase.execute(history, "Mi perro no come")
  ↓ valida no vacío
GeminiAiRepository.sendMessage(history, "Mi perro no come")
  ↓
fetch("https://generativelanguage.googleapis.com/.../gemini-3-flash-preview:generateContent?key=API_KEY", {
  method: "POST",
  body: JSON.stringify({ contents: [systemPrompt, ...history] }),
})
  ↓ retry 3 intentos si 429/503
  ↓
  Éxito: agrega respuesta al estado
  Error: AppError("AI_ERROR", ...)
```

### 5.4 Flujo de Solicitud de Adopción

```
Pantalla (pets/index.tsx → modal)
  ↓
useAdoptions().createRequest({ petId, adoptanteId, refugioId, message })
  ↓
CreateAdoptionRequestUseCase.execute(data)
  ↓ 1. Valida mensaje
  ↓ 2. SupabaseAdoptionRepository.createRequest(data)
  │      → INSERT INTO adoption_requests
  ↓ 3. SupabaseChatRepository.createRoom(...)
  │      → INSERT INTO rooms
  ↓ 4. SupabaseAdoptionRepository.updateRoomId(request.id, room.id)
  │      → UPDATE adoption_requests SET room_id = ?
  ↓
  Refugio recibe NOTIFICACIÓN PUSH (vía Realtime + expo-notifications)
```

### 5.5 Notificaciones Push (Realtime → Local)

```typescript
// useMessageNotifications.ts
export function useMessageNotifications(activeRoomId: string | null) {
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`message-notifications:${user.id}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const msg = payload.new as any;

          // No notificar mensajes propios o del room activo
          if (msg.user_id === user.id) return;
          if (msg.room_id === activeRoomId) return;

          // Obtener nombres para la notificación
          const { data: room } = await supabase
            .from("rooms").select("name,pet_id").eq("id", msg.room_id).single();
          const { data: author } = await supabase
            .from("profiles").select("username").eq("id", msg.user_id).single();

          // Programar notificación local
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `Mensaje: ${room?.name ?? "Chat"}`,
              body: `${author?.username ?? "Alguien"}: ${msg.content}`,
              data: { roomId: msg.room_id, type: "chat" },
            },
            trigger: null,  // inmediata
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, activeRoomId]);
}
```

---

## 6. Servicios Externos (con código)

### 6.1 Supabase

| Componente | Archivo | Código clave |
|-----------|---------|-------------|
| **Auth** | `SupabaseAuthRepository.ts` | `supabase.auth.signInWithPassword()`, `signInWithOAuth()`, `signUp()`, `signOut()`, `resetPasswordForEmail()` |
| **Database** | Todos los `Supabase*Repository.ts` | `supabase.from("pets").select()`, `.insert()`, `.update()`, `.delete()` |
| **Realtime** | `SupabaseChatRepository.ts`, `useMessageNotifications.ts`, `useAdoptionNotifications.ts` | `supabase.channel().on("postgres_changes", { event: "INSERT" })` |
| **Storage** | `SupabasePetRepository.ts`, `SupabaseChatRepository.ts` | `FileSystem.uploadAsync(url, uri)` o `fetch(url, { method: "PUT", body: base64 })` |

**Cliente Supabase (compartido):**

```typescript
// src/shared/infrastructure/supabase/client.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStoreAdapter,  // ← tokens encriptados con expo-secure-store
    autoRefreshToken: true,
    persistSession: true,
  },
});
```

**Ejemplo de consulta a la base de datos:**

```typescript
// SupabasePetRepository.ts
async getPets(): Promise<Pet[]> {
  const { data, error } = await supabase
    .from("pets")
    .select("*")
    .eq("status", "disponible")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(this.mapToPet);
}
```

**Ejemplo de Realtime:**

```typescript
// SupabaseChatRepository.ts
subscribeToRoom(roomId: string, onMessage: (msg: Message) => void): () => void {
  const channel = supabase
    .channel(`room:${roomId}`)
    .on("postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
      async (payload) => {
        const newMsg = payload.new as any;
        const { data } = await supabase
          .from("profiles").select("username").eq("id", newMsg.user_id).single();
        onMessage({ ...newMsg, authorUsername: data?.username });
      }
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
```

### 6.2 Gemini AI

```typescript
// src/features/ai/infrastructure/repositories/GeminiAiRepository.ts
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

const SYSTEM_PROMPT = `Eres PetCare AI, asistente veterinario...`;

async sendMessage(history, userMessage): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  const contents = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    ...history.slice(-10).map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  ];

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${API_URL}?key=${apiKey}`, {
      method: "POST",
      body: JSON.stringify({ contents }),
    });
    if (res.status === 429 || res.status === 503) {
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      continue;
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Error";
  }
  throw new AppError("AI_ERROR", "Error al comunicarse con la IA");
}
```

### 6.3 OpenStreetMap + Leaflet

```typescript
// app/(app)/map.tsx — HTML generado dinámicamente para WebView
const html = `
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <div id="map"></div>
  <script>
    const map = L.map('map').setView([${lat}, ${lng}], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    ${shelters.map(s => `
      L.marker([${s.latitude}, ${s.longitude}]).addTo(map);
    `).join('')}
  </script>
`;
```

### 6.4 Notificaciones (expo-notifications)

```typescript
// Configuración de canales
await Notifications.setNotificationChannelAsync("chat-messages", {
  name: "Mensajes de chat",
  importance: Notifications.AndroidImportance.HIGH,
});

// Programar notificación
await Notifications.scheduleNotificationAsync({
  content: {
    title: `Mensaje: ${roomName}`,
    body: `${author}: ${preview}`,
    data: { roomId: msg.room_id, type: "chat" },
  },
  trigger: null,  // inmediata
});
```

### 6.5 Location (expo-location)

```typescript
// useShelters.ts
const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== "granted") return;

const location = await Location.getCurrentPositionAsync({
  accuracy: Location.Accuracy.Balanced,
});
// location.coords.latitude, location.coords.longitude

// registrar-refugio.tsx
const address = await Location.reverseGeocodeAsync({
  latitude: event.nativeEvent.coordinate.latitude,
  longitude: event.nativeEvent.coordinate.longitude,
});
```

### 6.6 DiceBear API (Avatares)

```typescript
// app/(app)/index.tsx (chat rooms)
const avatarUrl = `https://api.dicebear.com/9.x/bottts/png?seed=${room.id}`;

// app/(app)/contacts.tsx (perfil)
const avatarUrl = `https://api.dicebear.com/9.x/thumbs/png?seed=${user.username}`;
```

---

## 7. Variables de Entorno

### Archivo `.env` (raíz — app móvil)

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_WEB_URL=https://mascotas-web-nine.vercel.app
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### Tipos (env.d.ts)

```typescript
declare module "expo-constants" {
  interface Env {
    EXPO_PUBLIC_SUPABASE_URL: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
    EXPO_PUBLIC_WEB_URL: string;
    EXPO_PUBLIC_GEMINI_API_KEY: string;
  }
}
```

**¿Dónde se usa `EXPO_PUBLIC_WEB_URL`?**

```typescript
// src/features/auth/infrastructure/repositories/SupabaseAuthRepository.ts
const webUrl = process.env.EXPO_PUBLIC_WEB_URL ?? "https://mascotas-web-nine.vercel.app";

async resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${webUrl}/reset-password`,
  });
  if (error) throw new AuthError(error.message, error);
}

async resendConfirmation(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${webUrl}/confirm-email` },
  });
  if (error) throw new AuthError(error.message, error);
}
```

---

## 8. Web App (apps/web/) — Código

### Router → `apps/web/src/app/router.tsx`

```typescript
export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/confirm-email"  element={<ConfirmEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="*" element={<Navigate to="/confirm-email" replace />} />
    </Routes>
  </BrowserRouter>
);
```

### Hook Confirmación → `apps/web/src/features/confirm-email/model/useConfirmEmail.ts`

```typescript
export function useConfirmEmail() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        setStatus("success");
        supabase.auth.signOut();  // Cierra sesión web, el usuario vuelve a la app
      }
    });

    // Timeout por si el token no es válido
    const timer = setTimeout(() => {
      setStatus("error");
      setError("El enlace ha expirado o es inválido.");
    }, 10000);

    return () => { subscription.unsubscribe(); clearTimeout(timer); };
  }, []);

  return { status, error };
}
```

### Hook Reset Password → `apps/web/src/features/reset-password/model/useResetPassword.ts`

```typescript
export function useResetPassword() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        // Esperar a que Supabase recupere la sesión del token_code
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          if (event !== "PASSWORD_RECOVERY") return;
          setStatus("idle");
        });
        return () => subscription.unsubscribe();
      }
    });
  }, []);

  const updatePassword = async (password: string) => {
    setStatus("loading");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setStatus("error");
      return;
    }
    await supabase.auth.signOut();
    setStatus("success");
  };

  return { status, error, updatePassword };
}
```

---

## 9. Animaciones Lottie

```typescript
// Ejemplo de import y uso (ai-assistant.tsx)
import LottieView from "lottie-react-native";
import catFace from "../../assets/animations/cat_face.json";

<LottieView source={catFace} autoPlay loop style={styles.avatar} />
```

| Archivo | Ruta | Usado en |
|---------|------|----------|
| `cat_face.json` | `assets/animations/` | `ai-assistant.tsx`, `pets/index.tsx` |
| `cat_paw.json` | `assets/animations/` | `ai-assistant.tsx`, `map.tsx` |
| `chat_loading.json` | `assets/animations/` | `chat/[roomId].tsx`, `ai-assistant.tsx` |
| `dog_intro.json` | `assets/animations/` | `pets/index.tsx`, `map.tsx` |
| `heart.json` | `assets/animations/` | `ai-assistant.tsx`, `map.tsx` |
| `map_marker.json` | `assets/animations/` | `map.tsx` |

---

## 10. Despliegue

### Web App (Vercel)

```json
// apps/web/vercel.json — Rewrites SPA
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

URL: `https://mascotas-web-nine.vercel.app`

### App Móvil (EAS Build)

```json
// eas.json
{
  "build": {
    "production": {
      "channel": "production"
    }
  }
}
```

Comandos: `eas build --profile production`, `npm run ios`, `npm run android`

---

## 11. Códigos de Error

| Código | Clase | Lanzado desde |
|--------|-------|--------------|
| `AUTH_ERROR` | `AuthError` (extends `AppError`) | `SupabaseAuthRepository.ts`, `LoginUseCase.ts`, `RegisterUseCase.ts`, etc. |
| `CHAT_ERROR` | `ChatError` (extends `AppError`) | `SupabaseChatRepository.ts`, `SendMessageUseCase.ts` |
| `PET_ERROR` | `AppError("PET_ERROR", ...)` | `CreatePetUseCase.ts` |
| `ADOPTION_ERROR` | `AppError("ADOPTION_ERROR", ...)` | `CreateAdoptionRequestUseCase.ts` |
| `AI_ERROR` | `AppError("AI_ERROR", ...)` | `GeminiAiRepository.ts` |

```typescript
// Uso típico en casos de uso:
if (!email || !password) {
  throw new AuthError("Email y contraseña son requeridos");
}
```

```typescript
// Captura en hooks:
error: loginMutation.error?.message ?? registerMutation.error?.message ?? null,
```
