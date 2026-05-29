# Documentación Completa del Proyecto: PetAdopt (mi-chat-app)

## Índice

1. [Visión General](#1-visión-general)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Arquitectura Clean (Capas)](#4-arquitectura-clean-capas)
   - [4.1 Capa de Dominio (`domain/`)](#41-capa-de-dominio-domain)
   - [4.2 Capa de Aplicación (`application/`)](#42-capa-de-aplicación-application)
   - [4.3 Capa de Infraestructura (`infrastructure/`)](#43-capa-de-infraestructura-infrastructure)
   - [4.4 Capa de Presentación (`presentation/`)](#44-capa-de-presentación-presentation)
5. [Características por Feature](#5-características-por-feature)
   - [5.1 Auth (Autenticación)](#51-auth-autenticación)
   - [5.2 Pets (Mascotas)](#52-pets-mascotas)
   - [5.3 Chat (Mensajería en Tiempo Real)](#53-chat-mensajería-en-tiempo-real)
   - [5.4 Adoptions (Solicitudes de Adopción)](#54-adoptions-solicitudes-de-adopción)
   - [5.5 AI (Asistente Veterinario con Google Gemini)](#55-ai-asistente-veterinario-con-google-gemini)
   - [5.6 Map (Mapa de Refugios)](#56-map-mapa-de-refugios)
6. [Pantallas de la App](#6-pantallas-de-la-app)
7. [Componentes Compartidos](#7-componentes-compartidos)
8. [Animaciones con Lottie](#8-animaciones-con-lottie)
9. [Navegación y BottomNav](#9-navegación-y-bottomnav)
10. [Notificaciones Push](#10-notificaciones-push)
11. [Servicios de Google Integrados](#11-servicios-de-google-integrados)
12. [Supabase (Backend)](#12-supabase-backend)
13. [Manejo de Errores](#13-manejo-de-errores)
14. [Flujo Completo de Adopción](#14-flujo-completo-de-adopción)

---

## 1. Visión General

**PetAdopt** es una aplicación móvil desarrollada con **Expo SDK 54** y **React Native** que conecta **refugios de animales** con **adoptantes**. Permite a los refugios publicar mascotas disponibles y a los adoptantes explorar, chatear y solicitar adopciones. Incluye un **asistente veterinario con IA** (Google Gemini), **mapa interactivo** de refugios, **mensajería en tiempo real** y **notificaciones push** locales.

### Roles de Usuario

| Rol | Descripción |
|-----|-------------|
| **refugio** | Publica mascotas, gestiona solicitudes de adopción, chatea con adoptantes |
| **adoptante** | Explora mascotas, solicita adopción, chatea con refugios |

---

## 2. Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Expo SDK | 54.0.33 | Framework de React Native |
| React Native | 0.81.5 | UI móvil nativa |
| Expo Router | 6.0.23 | Enrutamiento basado en archivos |
| Supabase JS | 2.106.1 | Backend: Auth, DB, Storage, Realtime |
| TanStack React Query | 5.100.13 | Cache y estado de servidor |
| Zustand | 5.0.13 | Estado global (auth) |
| Google Gemini API | 3 Flash Preview | Asistente veterinario IA |
| expo-notifications | 0.32.17 | Notificaciones push locales |
| expo-location | 19.0.8 | Geolocalización |
| expo-image-picker | 17.0.11 | Selección de fotos |
| expo-web-browser | 15.0.10 | OAuth (Google Login) |
| expo-secure-store | 15.0.8 | Almacenamiento seguro de tokens |
| Lottie React Native | 7.3.1 | Animaciones JSON |
| react-native-webview | 13.15.0 | Mapa Leaflet embebido |
| TypeScript | 5.9.2 | Tipado estático |

### Dependencias clave del `package.json`:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.106.1",
    "@tanstack/react-query": "^5.100.13",
    "expo": "~54.0.33",
    "expo-notifications": "~0.32.17",
    "expo-router": "~6.0.23",
    "lottie-react-native": "~7.3.1",
    "react-native-webview": "13.15.0",
    "zustand": "^5.0.13"
  }
}
```

### Variables de Entorno (`.env`)

```
EXPO_PUBLIC_SUPABASE_URL=https://xdpcldcjnijwnnruocbf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
EXPO_PUBLIC_WEB_URL=https://auth-esfot-web-taupe.vercel.app
EXPO_PUBLIC_GEMINI_API_KEY=AIza...
```

---

## 3. Estructura del Proyecto

```
Taller10-main/
├── app/                          # Expo Router (páginas)
│   ├── _layout.tsx               # Layout raíz (AuthGuard, notificaciones)
│   ├── (app)/                    # Grupo autenticado
│   │   ├── _layout.tsx           # Stack navigator
│   │   ├── index.tsx             # Pantalla de salas de chat
│   │   ├── adoptions.tsx         # Solicitudes de adopción
│   │   ├── adoption-form.tsx     # Formulario de adopción
│   │   ├── ai-assistant.tsx      # Asistente IA veterinario
│   │   ├── map.tsx               # Mapa de refugios
│   │   ├── contacts.tsx          # Perfil de usuario
│   │   ├── editar-perfil.tsx     # Editar perfil
│   │   ├── privacidad.tsx        # Privacidad
│   │   ├── ayuda.tsx             # Ayuda
│   │   ├── debug-supabase.tsx    # Debug
│   │   ├── chat/
│   │   │   └── [roomId].tsx      # Sala de chat individual
│   │   └── pets/
│   │       ├── index.tsx         # Lista de mascotas + modal de creación
│   │       └── [petId].tsx       # Detalle de mascota
│   └── (auth)/                   # Grupo de autenticación
│       ├── _layout.tsx
│       ├── login.tsx
│       ├── register.tsx
│       ├── forgot-password.tsx
│       └── check-email.tsx
├── src/
│   ├── features/                 # Módulos por feature (Clean Architecture)
│   │   ├── auth/                 # Autenticación
│   │   ├── pets/                 # Mascotas
│   │   ├── chat/                 # Mensajería
│   │   ├── adoptions/            # Adopciones
│   │   ├── ai/                   # Asistente IA
│   │   └── map/                  # Mapa (solo hooks)
│   └── shared/                   # Código compartido
│       ├── domain/errors/        # AppError, AuthError, ChatError
│       └── infrastructure/supabase/ # Cliente Supabase
├── components/                   # Componentes UI reutilizables
│   ├── BottomNav.tsx             # Barra de navegación inferior
│   ├── auth-background.tsx       # Fondo animado de auth
│   ├── hello-wave.tsx            # Animación de saludo
│   ├── external-link.tsx         # Enlace externo
│   ├── haptic-tab.tsx            # Pestaña con retroalimentación háptica
│   ├── parallax-scroll-view.tsx  # Scroll con parallax
│   ├── themed-text.tsx           # Texto con tema
│   ├── themed-view.tsx           # View con tema
│   └── ui/
│       ├── icon-symbol.tsx       # Icono con símbolos SF
│       ├── icon-symbol.ios.tsx   # Versión iOS
│       └── collapsible.tsx       # Acordeón colapsable
├── assets/
│   └── animations/               # Animaciones Lottie JSON
│       ├── cat_face.json         # Cara de gato
│       ├── cat_paw.json          # Pata de gato
│       ├── map_marker.json       # Marcador de mapa
│       └── paw_walk.json         # Huella caminando
├── constants/
│   └── theme.ts                  # Colores y fuentes
├── hooks/                        # Hooks globales
│   ├── use-color-scheme.ts       # Esquema de color
│   ├── use-color-scheme.web.ts   # Versión web
│   └── use-theme-color.ts        # Color del tema
├── app.json                      # Configuración Expo
├── tsconfig.json                 # Config TypeScript
├── package.json                  # Dependencias
└── .env                          # Variables de entorno
```

---

## 4. Arquitectura Clean (Capas)

Cada feature sigue **Arquitectura Limpia** con 4 capas:

```
┌─────────────────────────────────────────────┐
│              presentation/                   │  ← Hooks, Store (React)
│     (hooks, store)                           │
├─────────────────────────────────────────────┤
│              application/                    │  ← Casos de uso
│     (use-cases)                              │
├─────────────────────────────────────────────┤
│              domain/                         │  ← Entidades, contratos
│     (entities, repositories)                 │
├─────────────────────────────────────────────┤
│           infrastructure/                    │  ← Implementaciones
│     (repositories/Supabase*)                 │
└─────────────────────────────────────────────┘
```

### 4.1 Capa de Dominio (`domain/`)

Define las **entidades** (modelos de datos) y los **contratos** (interfaces/repositorios). No depende de ninguna tecnología externa.

#### Entidad `User` (`src/features/auth/domain/entities/User.ts`)

```typescript
export type UserRole = "adoptante" | "refugio";

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatarUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
}
```

#### Entidad `Pet` (`src/features/pets/domain/entities/Pet.ts`)

```typescript
export type PetSpecies = "perro" | "gato" | "ave" | "conejo" | "otro";
export type PetStatus = "disponible" | "en_proceso" | "adoptado";
export type PetSize = "pequeno" | "mediano" | "grande";
export type PetPersonality = "sociable" | "tranquilo" | "protector" | "jugueton";

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  age: string;
  size: PetSize;
  description: string;
  history: string;
  personality: string;
  personalityType: PetPersonality;
  imageUrl: string | null;
  imageUrls: string[];
  shelterId: string;
  shelterName: string | null;
  status: PetStatus;
  createdAt: Date;
}
```

#### Entidad `Message` (`src/features/chat/domain/entities/Message.ts`)

```typescript
export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  imageUrl?: string | null;
  localImageUri?: string | null; // URI local para optimismo
  failed?: boolean;  // Marca mensaje como fallido
  sending?: boolean; // Estado de envío optimista
  createdAt: Date;
  authorUsername?: string; // Desnormalización controlada para UI
}
```

#### Entidad `Room` (`src/features/chat/domain/entities/Room.ts`)

```typescript
export interface Room {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
}
```

#### Entidad `AdoptionRequest` (`src/features/adoptions/domain/entities/AdoptionRequest.ts`)

```typescript
export type AdoptionStatus = "pendiente" | "aprobada" | "rechazada";

export interface AdoptionRequest {
  id: string;
  petId: string;
  petName: string | null;
  adoptanteId: string;
  adoptanteName: string | null;
  refugioId: string;
  status: AdoptionStatus;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Entidad `AiMessage` (`src/features/ai/domain/entities/AiMessage.ts`)

```typescript
export interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}
```

#### Contratos (Interfaces de Repositorio)

Cada feature define una interfaz que la capa de infraestructura debe implementar:

**`IAuthRepository`** (`src/features/auth/domain/repositories/IAuthRepository.ts`):
```typescript
export interface IAuthRepository {
  login(email: string, password: string): Promise<User>;
  loginWithGoogle(): Promise<User>;
  register(email: string, password: string, username: string, role: UserRole): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  resetPassword(email: string): Promise<void>;
  resendConfirmation(email: string): Promise<void>;
  updateProfile(data: UpdateProfileData): Promise<User>;
}
```

**`IPetRepository`** (`src/features/pets/domain/repositories/IPetRepository.ts`):
```typescript
export interface IPetRepository {
  getPets(): Promise<Pet[]>;
  getPetById(id: string): Promise<Pet | null>;
  getPetsByShelter(shelterId: string): Promise<Pet[]>;
  createPet(shelterId: string, input: CreatePetInput): Promise<Pet>;
  updatePet(id: string, input: UpdatePetInput): Promise<Pet>;
  deletePet(id: string): Promise<void>;
}
```

**`IChatRepository`** (`src/features/chat/domain/repositories/IChatRepository.ts`):
```typescript
export interface IChatRepository {
  getRooms(): Promise<Room[]>;
  createRoom(name: string, userId: string): Promise<Room>;
  getMessages(roomId: string): Promise<Message[]>;
  sendMessage(roomId: string, userId: string, input: SendMessageInput): Promise<Message>;
  subscribeToRoom(roomId: string, onMessage: (msg: Message) => void): () => void;
}
```

**`IAdoptionRepository`** (`src/features/adoptions/domain/repositories/IAdoptionRepository.ts`):
```typescript
export interface IAdoptionRepository {
  getRequestsForShelter(refugioId: string): Promise<AdoptionRequest[]>;
  getRequestsForAdoptante(adoptanteId: string): Promise<AdoptionRequest[]>;
  createRequest(petId: string, adoptanteId: string, message: string): Promise<AdoptionRequest>;
  respondRequest(requestId: string, status: AdoptionStatus): Promise<AdoptionRequest>;
}
```

**`IAiRepository`** (`src/features/ai/domain/repositories/IAiRepository.ts`):
```typescript
export interface IAiRepository {
  sendMessage(conversationHistory: AiMessage[], userMessage: string): Promise<string>;
}
```

### 4.2 Capa de Aplicación (`application/`)

Contiene los **casos de uso** que orquestan la lógica de negocio. Validan entradas y delegan en los repositorios.

#### Ejemplo: `LoginUseCase`

```typescript
export class LoginUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(email: string, password: string): Promise<User> {
    if (!email || !password) {
      throw new AuthError("Email y contraseña son requeridos");
    }
    try {
      return await this.authRepo.login(email, password);
    } catch (error) {
      throw new AuthError("Credenciales inválidas", error);
    }
  }
}
```

#### Ejemplo: `CreatePetUseCase`

```typescript
export class CreatePetUseCase {
  constructor(private readonly petRepo: IPetRepository) {}

  async execute(shelterId: string, input: CreatePetInput) {
    if (!input.name.trim()) throw new AppError("PET_ERROR", "El nombre es requerido");
    if (!input.species) throw new AppError("PET_ERROR", "La especie es requerida");
    if (!input.size) throw new AppError("PET_ERROR", "El tamaño es requerido");
    if (!input.personalityType) throw new AppError("PET_ERROR", "El tipo de personalidad es requerido");
    try {
      return await this.petRepo.createPet(shelterId, input);
    } catch (error) {
      throw new AppError("PET_ERROR", error instanceof Error ? error.message : "Error al crear mascota", error);
    }
  }
}
```

#### Ejemplo: `SendMessageUseCase`

```typescript
export class SendMessageUseCase {
  constructor(private readonly chatRepo: IChatRepository) {}

  async execute(roomId: string, userId: string, input: SendMessageInput): Promise<Message> {
    const trimmedContent = input.content?.trim() ?? "";
    const hasImage = !!input.imageUri;
    if (!trimmedContent && !hasImage) {
      throw new ChatError("El mensaje no puede estar vacío");
    }
    if (trimmedContent.length > 500) throw new ChatError("Máximo 500 caracteres");
    return this.chatRepo.sendMessage(roomId, userId, {
      content: trimmedContent,
      imageUri: input.imageUri ?? null,
    });
  }
}
```

### 4.3 Capa de Infraestructura (`infrastructure/`)

Implementa los contratos definidos en `domain/`. Aquí es donde vive la integración con **Supabase** y otras tecnologías externas.

#### Cliente Supabase Compartido (`src/shared/infrastructure/supabase/client.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Adaptador para que Supabase use SecureStore en vez de localStorage
const SecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
  },
});
```

#### `SupabaseAuthRepository` (fragmento - login con Google)

```typescript
async loginWithGoogle(): Promise<User> {
  const redirectTo = Linking.createURL("/");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data.url) throw new Error("No se pudo iniciar Google Login");

  // Abre el navegador para que el usuario autorice
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success" || !result.url) {
    throw new Error("El inicio de sesión con Google fue cancelado");
  }

  // Intercambia el código de autorización por una sesión
  const parsed = Linking.parse(result.url);
  const code = parsed.queryParams?.code;
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) throw exchangeError;

  // Recupera y retorna el usuario
  const { data: currentUserResult } = await supabase.auth.getUser();
  // ... mapeo a User ...
}
```

#### `SupabasePetRepository` (fragmento - subida de imágenes)

```typescript
private async uploadImage(petId: string, imageUri: string): Promise<string> {
  const extension = imageUri.split("?")[0].match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase() ?? "jpg";
  const filePath = `pets/${petId}/${Date.now()}.${extension}`;

  // Intento 1: Subida nativa con expo-file-system
  try {
    const token = ...; // obtiene token de sesión
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/Imagenes/${filePath}`;
    const result = await FileSystem.uploadAsync(uploadUrl, imageUri, {
      httpMethod: "PUT",
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": contentType },
    });
    if (result.status >= 200 && result.status < 300) {
      return `${SUPABASE_URL}/storage/v1/object/public/Imagenes/${filePath}`;
    }
  } catch {
    // Intento 2: Fallback con base64 -> Uint8Array -> fetch
    const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: "base64" });
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": contentType },
      body: bytes,
    });
    if (res.ok) return publicUrl;
    throw new Error("Failed to upload pet image");
  }
}
```

#### `SupabaseChatRepository` (fragmento - suscripción en tiempo real)

```typescript
subscribeToRoom(roomId: string, onMessage: (msg: Message) => void): () => void {
  const channel = supabase
    .channel(`room:${roomId}`)
    .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`,
      },
      async (payload) => {
        const { data: profile } = await supabase
          .from('profiles').select('username')
          .eq('id', payload.new.user_id).single();
        onMessage({
          id: payload.new.id,
          roomId: payload.new.room_id,
          userId: payload.new.user_id,
          content: payload.new.content,
          imageUrl: payload.new.image_url,
          createdAt: new Date(payload.new.created_at),
          authorUsername: profile?.username,
        });
      }
    ).subscribe();

  return () => { supabase.removeChannel(channel); }; // Cleanup
}
```

### 4.4 Capa de Presentación (`presentation/`)

Contiene los **hooks** de React y el **store** de Zustand. Los hooks instancian los casos de uso y los exponen a las pantallas.

#### `useAuth` Hook

```typescript
export function useAuth() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: LoginDto) => loginUseCase.execute(email, password),
    onSuccess: (user) => {
      setUser(user);
      router.replace("/(app)");
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: () => loginWithGoogleUseCase.execute(),
    onSuccess: (user) => {
      setUser(user);
      router.replace("/(app)");
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ email, password, username, role }: RegisterDto) =>
      registerUseCase.execute(email, password, username, role),
    onSuccess: () => router.replace("/(auth)/check-email"),
  });

  const logout = async () => {
    try { await authRepo.logout(); }
    finally {
      setUser(null);
      router.replace("/(auth)/login");
    }
  };

  return {
    user, login: loginMutation.mutate, register: registerMutation.mutate,
    loginWithGoogle: googleLoginMutation.mutate, logout,
    isLoading: loginMutation.isPending || registerMutation.isPending || googleLoginMutation.isPending,
    error: loginMutation.error?.message ?? registerMutation.error?.message ?? null,
    // ... más propiedades
  };
}
```

#### `useChat` Hook (con optimistic updates y Realtime)

```typescript
export function useChat(roomId: string) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  // Paso 1: Obtener historial con React Query
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: () => getMessagesUseCase.execute(roomId),
    enabled: !!user,
    staleTime: Infinity, // No revalida, Realtime maneja nuevos mensajes
  });

  // Paso 2: Suscripción Realtime para mensajes nuevos
  useEffect(() => {
    const unsubscribe = subscribeUseCase.execute(roomId, (newMsg) => {
      queryClient.setQueryData(["messages", roomId], (old: Message[] = []) => {
        const exists = old.some((m) => m.id === newMsg.id);
        return exists ? old : [...old, newMsg];
      });
    });
    return unsubscribe;
  }, [roomId]);

  // Paso 3: Envío con optimistic update
  const sendMutation = useMutation({
    mutationFn: (input: SendMessageInput) =>
      sendMessageUseCase.execute(roomId, user!.id, input),

    onMutate: async (input) => {
      const tempMsg: Message = {
        id: `temp-${Date.now()}`,
        roomId, userId: user!.id,
        content: input.content?.trim() ?? "",
        imageUrl: input.imageUri ?? null,
        localImageUri: input.imageUri ?? null,
        sending: true, failed: false,
        createdAt: new Date(),
        authorUsername: user!.username,
      };
      queryClient.setQueryData(["messages", roomId], (old: Message[] = []) => [...old, tempMsg]);
      return { tempMsg };
    },

    onSuccess: (realMsg, _content, context) => {
      // Reemplaza mensaje temporal con el real
      queryClient.setQueryData(["messages", roomId], (old: Message[] = []) =>
        old.map((m) => (m.id === context?.tempMsg.id ? realMsg : m)),
      );
    },

    onError: (_err, _content, context) => {
      if (context?.tempMsg) {
        queryClient.setQueryData(["messages", roomId], (old: Message[] = []) =>
          old.map((m) => m.id === context.tempMsg.id ? { ...m, failed: true, sending: false } : m),
        );
      }
    },
  });

  return { messages, sendMessage: sendMutation.mutate, retrySend, isLoading, isSending: sendMutation.isPending };
}
```

#### `useAdoptionNotifications` Hook (notificaciones push con Realtime)

```typescript
export function useAdoptionNotifications() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;

    // Configurar canal Android
    await Notifications.setNotificationChannelAsync("adoption-requests", {
      name: "Solicitudes de adopción",
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: "#4da8c4",
    });

    // Solicitar permisos
    const granted = await requestAdoptionPermissionsAsync();

    const channel = supabase.channel(`adoption-notifications:${user.id}`);

    // Escuchar INSERT (nueva solicitud -> notifica al refugio)
    channel.on("postgres_changes",
      { event: "INSERT", schema: "public", table: "adoption_requests" },
      async (payload) => {
        if (user.role === "refugio" && req.refugio_id === user.id) {
          const petName = "..." // query a pets
          const adoptanteName = "..." // query a profiles
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Nueva solicitud de adopción",
              body: `${adoptanteName} quiere adoptar a ${petName}`,
              data: { type: "adoption", requestId: req.id },
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1, channelId: "adoption-requests" },
          });
        }
      }
    );

    // Escuchar UPDATE (cambio de estado -> notifica al adoptante)
    channel.on("postgres_changes",
      { event: "UPDATE", schema: "public", table: "adoption_requests" },
      async (payload) => {
        if (user.role === "adoptante" && req.adoptante_id === user.id) {
          // Notifica "aprobada" o "rechazada"
        }
      }
    );

    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);
}
```

#### Store de Zustand (`authStore`)

```typescript
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

## 5. Características por Feature

### 5.1 Auth (Autenticación)

**Archivos:**
- `src/features/auth/domain/entities/User.ts`
- `src/features/auth/domain/repositories/IAuthRepository.ts`
- `src/features/auth/application/use-cases/` (5 casos de uso)
- `src/features/auth/infrastructure/repositories/SupabaseAuthRepository.ts`
- `src/features/auth/presentation/store/authStore.ts`
- `src/features/auth/presentation/hooks/useAuth.ts`

**Métodos de autenticación:**
1. **Email y contraseña** - `signInWithPassword` / `signUp`
2. **Google OAuth** - `signInWithOAuth("google")` + `WebBrowser.openAuthSessionAsync` + `exchangeCodeForSession`

**Flujo de registro:**
1. Usuario llena formulario (email, password, username, rol)
2. Se llama a `supabase.auth.signUp()` con `emailRedirectTo` apuntando a la web de confirmación
3. Se inserta perfil en tabla `profiles`
4. Se redirige a pantalla "check-email" 
5. El usuario confirma su email visitando el enlace en `EXPO_PUBLIC_WEB_URL/confirm-email`

**Flujo de Google Login:**
1. Se llama a `supabase.auth.signInWithOAuth({ provider: "google", skipBrowserRedirect: true })`
2. Se abre `WebBrowser.openAuthSessionAsync` con la URL de OAuth
3. Google autentica al usuario y redirige con un `code` en la URL
4. Se intercambia el código por sesión con `exchangeCodeForSession`
5. Si es primera vez, se crea perfil automáticamente

**Flujo de "recordar sesión":**
- En `_layout.tsx`, el `AuthGuard` llama a `authRepo.getCurrentUser()` al montar
- Supabase mantiene la sesión en `SecureStore` (almacenamiento encriptado)
- `onAuthStateChange` escucha cambios y actualiza el store

**Pantallas de autenticación:**
- `login.tsx` - Formulario de inicio de sesión con email/password + botón Google
- `register.tsx` - Formulario de registro con selección de rol
- `forgot-password.tsx` - Solicitud de restablecimiento de contraseña
- `check-email.tsx` - Mensaje informativo tras registro exitoso

### 5.2 Pets (Mascotas)

**Archivos:**
- `src/features/pets/domain/entities/Pet.ts`
- `src/features/pets/domain/repositories/IPetRepository.ts`
- `src/features/pets/application/use-cases/` (5 casos de uso)
- `src/features/pets/infrastructure/repositories/SupabasePetRepository.ts`
- `src/features/pets/presentation/hooks/usePets.ts`

**Operaciones:**
- `getPets()` - Obtiene todas las mascotas disponibles (status = "disponible")
- `getPetById(id)` - Obtiene detalle de una mascota
- `getPetsByShelter(shelterId)` - Obtiene mascotas de un refugio específico
- `createPet(shelterId, input)` - Crea mascota con subida de hasta 3 imágenes
- `updatePet(id, input)` - Actualiza datos de la mascota
- `deletePet(id)` - Elimina mascota

**Campos de una mascota:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| name | string | Nombre de la mascota |
| species | "perro" \| "gato" \| "ave" \| "conejo" \| "otro" | Especie |
| breed | string | Raza |
| age | string | Edad (texto libre) |
| size | "pequeno" \| "mediano" \| "grande" | Tamaño |
| description | string | Descripción general |
| history | string | Historial (salud, origen) |
| personality | string | Descripción de personalidad |
| personalityType | "sociable" \| "tranquilo" \| "protector" \| "jugueton" | Tipo de personalidad |
| imageUrls | string[] | URLs de imágenes (hasta 3) |
| status | "disponible" \| "en_proceso" \| "adoptado" | Estado de adopción |

**Subida de imágenes:**
- Usa `expo-file-system/legacy` para subir archivos nativamente a Supabase Storage
- Fallback con base64 -> Uint8Array -> fetch si el método nativo falla
- Las imágenes se almacenan en el bucket `Imagenes` con ruta `pets/{petId}/{timestamp}.{ext}`

**Pantallas:**
- `pets/index.tsx` - Grid de mascotas disponibles + modal de creación para refugios
- `pets/[petId].tsx` - Detalle completo con todas las fotos, descripción, historial, personalidad y botón de solicitar adopción

### 5.3 Chat (Mensajería en Tiempo Real)

**Archivos:**
- `src/features/chat/domain/entities/Message.ts`
- `src/features/chat/domain/entities/Room.ts`
- `src/features/chat/domain/repositories/IChatRepository.ts`
- `src/features/chat/application/use-cases/` (4 casos de uso)
- `src/features/chat/infrastructure/repositories/SupabaseChatRepository.ts`
- `src/features/chat/presentation/hooks/useChat.ts`
- `src/features/chat/presentation/hooks/useRooms.ts`
- `src/features/chat/presentation/hooks/useMessageNotifications.ts`

**Características:**

1. **Salas de chat (Rooms):** Los usuarios pueden crear salas de chat con nombre. Cada sala tiene un `id` y un `created_by`.

2. **Mensajes en tiempo real:** Vía `supabase.channel()` con `postgres_changes` filtrando por `room_id`. Cuando se inserta un nuevo mensaje en la tabla `messages`, el canal Realtime lo detecta y lo agrega al estado.

3. **Optimistic updates:** Al enviar un mensaje, primero se muestra instantáneamente (con estado `sending: true`), luego se reemplaza con el mensaje real al confirmarse, o se marca como `failed: true` si hay error, con botón de reintentar.

4. **Imágenes en chat:** Selección desde galería con `expo-image-picker`, subida a Supabase Storage, preview antes de enviar.

5. **Notificaciones de mensajes:** Hook `useMessageNotifications` que:
   - Escucha INSERTS en `messages` vía Realtime
   - Filtra solo mensajes donde el usuario NO es el autor (evita auto-notificaciones)
   - Obtiene el nombre de la sala y del autor con queries JOIN
   - Dispara notificación local con `expo-notifications`
   - Al tocar la notificación, navega a la sala de chat correspondiente

**Flujo de un mensaje:**
```
Usuario escribe -> onMutate (optimistic: tempMsg con sending=true)
  -> sendMessageUseCase.execute() -> SupabaseChatRepository.sendMessage()
    -> INSERT en tabla messages via Supabase REST
  -> onSuccess -> reemplaza tempMsg por realMsg
  -> Realtime detecta INSERT -> subscribeToRoom callback
    -> evita duplicado (exists check) -> agrega si es nuevo
  -> useMessageNotifications detecta INSERT
    -> si no es autor -> notificación local
```

### 5.4 Adoptions (Solicitudes de Adopción)

**Archivos:**
- `src/features/adoptions/domain/entities/AdoptionRequest.ts`
- `src/features/adoptions/domain/repositories/IAdoptionRepository.ts`
- `src/features/adoptions/application/use-cases/` (3 casos de uso)
- `src/features/adoptions/infrastructure/repositories/SupabaseAdoptionRepository.ts`
- `src/features/adoptions/presentation/hooks/useAdoptions.ts`
- `src/features/adoptions/presentation/hooks/useAdoptionNotifications.ts`

**Flujo completo de adopción:**

1. **Adoptante** ve detalle de mascota (`[petId].tsx`)
2. **Adoptante** toca "Solicitar adopción" -> modal con mensaje
3. `createRequest` inserta en `adoption_requests` con status `pendiente`
4. **Refugio** recibe notificación push (INSERT detectado por `useAdoptionNotifications`)
5. **Refugio** abre pantalla de solicitudes (`adoptions.tsx`)
6. **Refugio** ve tarjeta con nombre del adoptante, mascota, mensaje
7. **Refugio** aprueba o rechaza (botones Aprobar/Rechazar)
8. **Adoptante** recibe notificación push con el resultado (UPDATE detectado por `useAdoptionNotifications`)
9. Si es aprobada: mensaje "Contacta al refugio"
10. Si es rechazada: mensaje de rechazo

**Estados de solicitud:**
- `pendiente` - El refugio aún no responde
- `aprobada` - El refugio aprobó la solicitud
- `rechazada` - El refugio rechazó la solicitud

### 5.5 AI (Asistente Veterinario con Google Gemini)

**Archivos:**
- `src/features/ai/domain/entities/AiMessage.ts`
- `src/features/ai/domain/repositories/IAiRepository.ts`
- `src/features/ai/application/use-cases/SendAiMessageUseCase.ts`
- `src/features/ai/infrastructure/repositories/GeminiAiRepository.ts`
- `src/features/ai/presentation/hooks/useAiAssistant.ts`

**Características:**

1. **Modelo:** Google Gemini 3 Flash Preview (`gemini-3-flash-preview`)
2. **API:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent`
3. **System Prompt:** Actúa como veterinario experto "PetCare AI", responde en español, aclara que no sustituye consulta profesional, no usa markdown.
4. **Historial de conversación:** Se mantienen los últimos 10 mensajes como contexto.
5. **Rate limiting:** Maneja errores 429 (Too Many Requests) y 503 (Service Unavailable) con retry exponencial hasta 3 intentos.

**Manejo de respuestas:**
```typescript
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 2000;

for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });

    if (response.status === 429) {
      const waitMs = INITIAL_DELAY_MS * Math.pow(2, attempt);
      await delay(waitMs);
      continue; // Reintenta
    }
    // ... procesar respuesta exitosa
  } catch (error) {
    lastError = error;
    if (attempt < MAX_RETRIES - 1) await delay(INITIAL_DELAY_MS * Math.pow(2, attempt));
  }
}
```

**Limpieza de Markdown:** Como el system prompt pide no usar markdown pero Gemini a veces responde con él, el hook `useAiAssistant` aplica `cleanMarkdown()` que remueve asteriscos, negritas, headers, y código.

**Sugerencias de preguntas:**
- 🐕 ¿Cómo cuidar a un cachorro?
- 🐈 ¿Qué vacunas necesita un gato?
- 🥗 ¿Qué alimentos son tóxicos?
- 💊 ¿Cuándo llevar al veterinario?

### 5.6 Map (Mapa de Refugios)

**Archivos:**
- `src/features/map/presentation/hooks/useShelters.ts`

**Características:**

1. **Mapa embebido:** Usa `react-native-webview` con **Leaflet.js** (OpenStreetMap) renderizado como HTML.
2. **Marcadores:** Cada refugio con ubicación registrada aparece como un marker en el mapa.
3. **Ubicación del usuario:** Vía `expo-location`, se muestra la ubicación actual del usuario como marcador púrpura.
4. **Lista de refugios:** Debajo del mapa, una lista con los primeros 5 refugios, cada uno con un color de acento distinto.
5. **Botón "Ir":** Abre `openstreetmap.org/directions` para navegar al refugio.

**Generación del mapa HTML:**
```typescript
function generateMapHtml(shelters, userLat, userLng) {
  return `<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    // Marcadores de refugios
    L.marker([lat, lng]).addTo(map).bindPopup('<b>Nombre</b>');
    // Marcador de usuario
    L.marker([userLat, userLng], {icon: L.divIcon({...})}).addTo(map);
    map.fitBounds([...]);
  </script>
</body></html>`;
}
```

**Hook `useShelters`:**
- Obtiene todos los usuarios con `role = "refugio"` desde Supabase
- Cada refugio tiene: id, username, latitude, longitude, email
- Filtra solo aquellos con latitud/longitud no nulos para el mapa
- Cachea resultados con React Query

**Hook `useCurrentLocation`:**
- Solicita permisos de ubicación con `expo-location`
- Obtiene posición actual con precisión "Balanced"
- Cachea por 60 segundos

---

## 6. Pantallas de la App

### Pantallas Autenticadas (`(app)/`)

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `index.tsx` | Lista de salas de chat con búsqueda y creación |
| `/chat/[roomId]` | `chat/[roomId].tsx` | Sala de chat individual con mensajes, imágenes y reintento |
| `/pets` | `pets/index.tsx` | Grid de mascotas disponibles + modal de creación para refugios |
| `/pets/[petId]` | `pets/[petId].tsx` | Detalle de mascota con todas las fotos y solicitud de adopción |
| `/adoptions` | `adoptions.tsx` | Solicitudes de adopción (pendientes/aprobadas/rechazadas) |
| `/adoption-form` | `adoption-form.tsx` | Formulario para enviar solicitud de adopción |
| `/ai-assistant` | `ai-assistant.tsx` | Chat con asistente veterinario IA (Gemini) |
| `/map` | `map.tsx` | Mapa interactivo con refugios y ubicación actual |
| `/contacts` | `contacts.tsx` | Perfil del usuario |
| `/editar-perfil` | `editar-perfil.tsx` | Editar nombre y ubicación |
| `/privacidad` | `privacidad.tsx` | Política de privacidad |
| `/ayuda` | `ayuda.tsx` | Pantalla de ayuda |
| `/debug-supabase` | `debug-supabase.tsx` | Debug de conexión Supabase |

### Pantallas de Auth (`(auth)/`)

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/login` | `login.tsx` | Inicio de sesión (email + Google) |
| `/register` | `register.tsx` | Registro con selección de rol |
| `/forgot-password` | `forgot-password.tsx` | Restablecer contraseña |
| `/check-email` | `check-email.tsx` | Confirmación de registro exitoso |

---

## 7. Componentes Compartidos

### `BottomNav.tsx` - Barra de navegación inferior

```typescript
const ALL_TABS = [
  { id: "pets", icon: "paw", label: "Mascotas", route: "/(app)/pets" },
  { id: "chat", icon: "chatbubble-outline", label: "Chat", route: "/(app)" },
  { id: "ai", icon: "sparkles-outline", label: "IA", route: "/(app)/ai-assistant" },
  { id: "adoptions", icon: "file-text", label: "Solicitudes", route: "/(app)/adoptions" },
  { id: "map", icon: "map-pin", label: "Mapa", route: "/(app)/map" },
  { id: "profile", icon: "user", label: "Perfil", route: "/(app)/contacts" },
];
```

- 6 pestañas unificadas para ambos roles
- Usa `@expo/vector-icons` (Ionicons, Feather, MaterialCommunityIcons)
- Pestaña activa con fondo teal y texto blanco
- Inactivas con color `#5EEAD4`

### `auth-background.tsx` - Fondo animado de autenticación

- 5 círculos (orbs) de colores cálidos que se mueven lentamente
- Animación con `Animated.timing` y `Easing.sin` en loop (22s ciclo completo)
- Efecto blur con `expo-blur` (fallback translúcido si no está disponible)

### `hello-wave.tsx` - Animación de saludo

- Usa `react-native-reanimated` con animación CSS de rotación (25°)
- Se repite 4 veces con duración de 300ms

---

## 8. Animaciones con Lottie

**Librería:** `lottie-react-native` v7.3.1 (compatible con React Native 0.81 + New Architecture)

**Archivos JSON en `assets/animations/`:**

| Archivo | Uso |
|---------|-----|
| `cat_face.json` | Avatar del asistente AI, header de mapa |
| `cat_paw.json` | Icono de mensaje del AI, lista de refugios |
| `paw_walk.json` | Pantalla de bienvenida del AI, indicador de "pensando", empty state de chat |
| `map_marker.json` | Badge "Mapa en vivo" |

**Ejemplo de uso en `ai-assistant.tsx`:**

```typescript
import LottieView from "lottie-react-native";
import catFace from "../../assets/animations/cat_face.json";

// En el header
<View style={styles.aiAvatar}>
  <LottieView source={catFace} autoPlay loop style={styles.avatarLottie} />
</View>

// Indicador de "pensando"
<LottieView source={pawWalk} autoPlay loop style={styles.typingLottie} />
```

Todas las animaciones se usan con `autoPlay` y `loop` para que se reproduzcan continuamente.

---

## 9. Navegación y BottomNav

### Layout Raíz (`app/_layout.tsx`)

```typescript
function AuthGuard() {
  useMessageNotifications(activeRoomId);
  useAdoptionNotifications();

  useEffect(() => {
    authRepo.getCurrentUser().then(setUser);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(...);
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Redirigir según estado de autenticación
    if (!user && !inAuth) router.replace('/(auth)/login');
    if (user && inAuth) router.replace(homeRoute);
  }, [user, segments]);

  // Manejar notificaciones tocadas
  useEffect(() => {
    const redirect = (notification) => {
      const data = notification.request.content.data;
      if (data?.roomId) router.push(`/(app)/chat/${data.roomId}`);
      else if (data?.type === 'adoption') router.push('/(app)/adoptions');
    };
    // Escuchar respuesta a notificaciones
    const subscription = Notifications.addNotificationResponseReceivedListener(redirect);
    return () => subscription.remove();
  }, [router, user]);

  return <Slot />;
}
```

### Layout de App (`app/(app)/_layout.tsx`)

```typescript
export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="chat/[roomId]" />
      <Stack.Screen name="pets/index" />
      <Stack.Screen name="pets/[petId]" />
      <Stack.Screen name="adoptions" />
      <Stack.Screen name="adoption-form" />
      <Stack.Screen name="ai-assistant" />
      <Stack.Screen name="map" />
      <Stack.Screen name="editar-perfil" />
      <Stack.Screen name="privacidad" />
      <Stack.Screen name="ayuda" />
    </Stack>
  );
}
```

### Esquema de navegación:

```
AuthGuard (app/_layout.tsx)
├── No autenticado -> (auth)/
│   ├── login
│   ├── register
│   ├── forgot-password
│   └── check-email
└── Autenticado -> (app)/
    ├── index (Chat Rooms) ← BottomNav: "Chat"
    ├── pets/index (Mascotas) ← BottomNav: "Mascotas"
    ├── pets/[petId] (Detalle)
    ├── adoptions (Solicitudes) ← BottomNav: "Solicitudes"
    ├── adoption-form (Formulario)
    ├── ai-assistant (IA) ← BottomNav: "IA"
    ├── map (Mapa) ← BottomNav: "Mapa"
    ├── contacts (Perfil) ← BottomNav: "Perfil"
    ├── editar-perfil
    ├── privacidad
    └── ayuda
```

---

## 10. Notificaciones Push

### Hook `useMessageNotifications`

- Escucha **INSERTS** en tabla `messages` vía Supabase Realtime
- Filtra: solo notifica si el mensaje NO es del usuario actual
- Obtiene nombre de sala y autor con queries JOIN
- Dispara notificación local con `expo-notifications`
- Usa canal Android `"chat-messages"` con alta prioridad

### Hook `useAdoptionNotifications`

- Escucha **INSERTS** y **UPDATES** en tabla `adoption_requests`
- INSERT: notifica al **refugio** cuando alguien solicita adoptar
- UPDATE: notifica al **adoptante** cuando el refugio aprueba/rechaza
- Obtiene nombre de mascota (`pets.name`) y adoptante (`profiles.username`)
- Usa canal Android `"adoption-requests"` con color teal `#4da8c4`

### Manejo de notificaciones tocadas

En `app/_layout.tsx`:

```typescript
const redirectFromNotification = (notification) => {
  const data = notification.request.content.data;
  if (data?.roomId) {
    router.push(`/(app)/chat/${data.roomId}`);    // Chat
  } else if (data?.type === 'adoption') {
    router.push('/(app)/adoptions');                // Adopciones
  }
};

// Para notificaciones que abrieron la app
const lastResponse = Notifications.getLastNotificationResponse();
if (lastResponse?.notification) redirectFromNotification(lastResponse.notification);

// Para notificaciones recibidas mientras la app está abierta
const subscription = Notifications.addNotificationResponseReceivedListener(redirectFromNotification);
```

### Configuración de canales Android

```typescript
await Notifications.setNotificationChannelAsync("chat-messages", {
  name: "Mensajes de chat",
  importance: Notifications.AndroidImportance.HIGH,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: "#4da8c4",
});

await Notifications.setNotificationChannelAsync("adoption-requests", {
  name: "Solicitudes de adopción",
  description: "Notificaciones de solicitudes de adopción",
  importance: Notifications.AndroidImportance.HIGH,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: "#4da8c4",
  showBadge: true,
});
```

---

## 11. Servicios de Google Integrados

### 1. Google OAuth (Inicio de sesión)

**API:** Supabase Auth + Google OAuth

**Flujo:**
1. `supabase.auth.signInWithOAuth({ provider: "google" })` genera URL de autorización
2. `WebBrowser.openAuthSessionAsync()` abre el navegador del sistema
3. Usuario autoriza la aplicación en Google
4. Google redirige con código de autorización
5. `supabase.auth.exchangeCodeForSession(code)` intercambia código por sesión

**Configuración en Supabase:**
- Google provider habilitado en Supabase Dashboard
- Client ID y Client Secret configurados

### 2. Google Gemini AI (Asistente Veterinario)

**API:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent`

**API Key:** `EXPO_PUBLIC_GEMINI_API_KEY` en `.env`

**Características:**
- Modelo: Gemini 3 Flash Preview (rápido y eficiente)
- System prompt: Asistente veterinario experto en español
- Historial de conversación: últimos 10 mensajes como contexto
- Manejo de errores: retry con backoff exponencial para 429 y 503
- Filtro de seguridad: detecta `blockReason` y `finishReason: "SAFETY"`
- Sin markdown: se limpian asteriscos, negritas, headers

### 3. Mapas OpenStreetMap (No es Google Maps pero similar)

**Tecnología:** Leaflet.js + OpenStreetMap (vía WebView)

**Ruteo:** `openstreetmap.org/directions` para navegación

---

## 12. Supabase (Backend)

### Proyecto
- **URL:** `https://xdpcldcjnijwnnruocbf.supabase.co`
- **Servicios utilizados:**
  - Auth (autenticación)
  - Database (PostgreSQL)
  - Realtime (suscripciones en tiempo real)
  - Storage (bucket "Imagenes" para fotos)

### Tablas

#### `profiles`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid (PK) | Misma ID que auth.users |
| username | text | Nombre de usuario |
| avatar_url | text | URL del avatar |
| latitude | float8 | Latitud para mapa |
| longitude | float8 | Longitud para mapa |
| email | text | Email |

#### `pets`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid (PK) | ID único |
| name | text | Nombre |
| species | text | Especie |
| breed | text | Raza |
| age | text | Edad |
| size | text | Tamaño (pequeno/mediano/grande) |
| description | text | Descripción |
| history | text | Historial |
| personality | text | Personalidad |
| personality_type | text | Tipo de personalidad |
| image_url | text | URL de la foto principal |
| image_urls | jsonb | Array de URLs de fotos |
| shelter_id | uuid (FK -> profiles.id) | ID del refugio |
| status | text | Estado (disponible/en_proceso/adoptado) |
| created_at | timestamptz | Fecha de creación |

#### `rooms`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid (PK) | ID de la sala |
| name | text | Nombre de la sala |
| created_by | uuid (FK) | ID del creador |
| created_at | timestamptz | Fecha de creación |

#### `messages`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid (PK) | ID del mensaje |
| room_id | uuid (FK -> rooms.id) | Sala a la que pertenece |
| user_id | uuid (FK) | ID del autor |
| content | text | Contenido del mensaje |
| image_url | text | URL de imagen adjunta |
| created_at | timestamptz | Fecha de envío |

#### `adoption_requests`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid (PK) | ID de la solicitud |
| pet_id | uuid (FK -> pets.id) | Mascota solicitada |
| adoptante_id | uuid (FK -> profiles.id) | ID del adoptante |
| refugio_id | uuid (FK -> profiles.id) | ID del refugio |
| status | text | Estado (pendiente/aprobada/rechazada) |
| message | text | Mensaje del adoptante |
| created_at | timestamptz | Fecha de creación |
| updated_at | timestamptz | Fecha de actualización |

### Storage

**Bucket:** `Imagenes` (público)

Estructura de archivos:
```
Imagenes/
├── pets/{petId}/{timestamp}.jpg  ← Fotos de mascotas
└── {roomId}/{userId}/{timestamp}.jpg  ← Imágenes de chat
```

### Realtime

Se usan **dos canales de Realtime** para notificaciones:

1. **Chat messages:** `channel("room:{roomId}")` escucha INSERTS en `messages` filtrados por `room_id`
2. **Adoption notifications:** `channel("adoption-notifications:{userId}")` escucha INSERTS y UPDATES en `adoption_requests`

---

## 13. Manejo de Errores

### Clase `AppError`

```typescript
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, cause?: unknown) {
    super('AUTH_ERROR', message, cause);
  }
}

export class ChatError extends AppError {
  constructor(message: string, cause?: unknown) {
    super('CHAT_ERROR', message, cause);
  }
}
```

### Patrón de uso en casos de uso

```typescript
// Validación de entrada
if (!input.name.trim()) throw new AppError("PET_ERROR", "El nombre es requerido");

// Captura de errores de infraestructura
try {
  return await this.petRepo.createPet(shelterId, input);
} catch (error) {
  throw new AppError("PET_ERROR", error instanceof Error ? error.message : "Error al crear mascota", error);
}
```

### Manejo en hooks

```typescript
// useAuth expone errores por mutación
error: loginMutation.error?.message ?? registerMutation.error?.message ?? null,

// usePets similar
createError: createMutation.error?.message ?? null,

// useChat marca mensajes como failed en lugar de ocultarlos
onError: (_err, _content, context) => {
  if (context?.tempMsg) {
    queryClient.setQueryData(["messages", roomId], (old: Message[] = []) =>
      old.map((m) => m.id === context.tempMsg.id ? { ...m, failed: true, sending: false } : m),
    );
  }
},
```

### Códigos de error

| Código | Feature | Significado |
|--------|---------|-------------|
| AUTH_ERROR | Auth | Error de autenticación |
| CHAT_ERROR | Chat | Error de chat |
| PET_ERROR | Pets | Error de mascotas |
| ADOPTION_ERROR | Adoptions | Error de adopción |
| AI_ERROR | AI | Error del asistente |

---

## 14. Flujo Completo de Adopción

```
ADOPTANTE                          REFUGIO
    |                                 |
    |-- Ve mascota en lista --------->|
    |-- Abre detalle ([petId].tsx) -->|
    |-- Toca "Solicitar adopción" --->|
    |-- Escribe mensaje ------------->|
    |-- Confirma -------------------->|
    |                                 |
    |   (INSERT en adoption_requests) |
    |                                 |
    |                      <--- NOTIFICACIÓN PUSH
    |                           "Nuevo adoptante"
    |                                 |
    |                      Refugio abre adoptions.tsx
    |                      Ve solicitud pendiente
    |                      Lee mensaje del adoptante
    |                      Decide: Aprobar / Rechazar
    |                                 |
    |   (UPDATE en adoption_requests) |
    |                                 |
    |<--- NOTIFICACIÓN PUSH ----------|
    |   "Aprobada" o "Rechazada"      |
    |                                 |
    | Si aprobada: contacta refugio --|
    | Si rechazada: busca otra mascota|
    |                                 |
```

---

## Notas Técnicas Adicionales

### Expo Router (v6) - Enrutamiento basado en archivos

El proyecto usa Expo Router v6 con file-based routing. Las rutas se definen por la estructura de carpetas en `app/`:

- `app/_layout.tsx` → Layout raíz (compartido por todas las rutas)
- `app/(app)/_layout.tsx` → Layout para el grupo `(app)` (stack navigator)
- `app/(auth)/_layout.tsx` → Layout para el grupo `(auth)`
- `app/(app)/pets/[petId].tsx` → Ruta dinámica `/pets/:petId`
- Grupos con paréntesis `(app)` y `(auth)` no afectan la URL

### TypeScript Path Aliases

```json
{
  "compilerOptions": {
    "paths": {
      "@features/*": ["src/features/*"],
      "@shared/*": ["src/shared/*"]
    }
  }
}
```

### Optimistic Updates en Chat

El chat implementa un patrón de **optimistic updates** con 3 fases:

1. **onMutate:** Crea un mensaje temporal con `id: "temp-{timestamp}"`, `sending: true` y lo agrega inmediatamente
2. **onSuccess:** Reemplaza el temporal por el real (con ID real de Supabase)
3. **onError:** Marca el temporal como `failed: true` para que el usuario vea el error y pueda reintentar

### App Web de Confirmación (`apps/web/`)

Existe una app web separada en `apps/web/` construida con Vite que maneja:
- Confirmación de email (`/confirm-email`)
- Restablecimiento de contraseña (`/reset-password`)

Esta app se despliega en **Vercel** (`auth-esfot-web-taupe.vercel.app`) y recibe los redirects de Supabase Auth.
