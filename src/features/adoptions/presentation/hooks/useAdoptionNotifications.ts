import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { supabase } from "@shared/infrastructure/supabase/client";
import { isRunningInExpoGo } from "expo";
import { useEffect } from "react";
import { Platform } from "react-native";

const ADOPTION_NOTIFICATION_CHANNEL_ID = "adoption-requests";

let adoptionChannel: ReturnType<typeof supabase.channel> | null = null;
let subscribedAdoptionUserId: string | null = null;
let adoptionSetupPromise: Promise<void> | null = null;

async function ensureAdoptionChannelAsync() {
  if (Platform.OS !== "android") return;
  try {
    const Notif = await import('expo-notifications');
    await Notif.setNotificationChannelAsync(ADOPTION_NOTIFICATION_CHANNEL_ID, {
      name: "Solicitudes de adopción",
      description: "Notificaciones de solicitudes de adopción",
      importance: Notif.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#4da8c4",
      showBadge: true,
    });
  } catch {}
}

async function requestAdoptionPermissionsAsync() {
  try {
    const Notif = await import('expo-notifications');
    const current = await Notif.getPermissionsAsync();
    const granted = current.granted || current.ios?.status === Notif.IosAuthorizationStatus.PROVISIONAL;
    if (granted) return true;
    const requested = await Notif.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    return requested.granted || requested.ios?.status === Notif.IosAuthorizationStatus.PROVISIONAL;
  } catch {
    return false;
  }
}

export function useAdoptionNotifications() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (isRunningInExpoGo()) return;

    let cancelled = false;

    const start = async () => {
      if (!user) return;

      if (adoptionSetupPromise) {
        await adoptionSetupPromise;
        return;
      }

      adoptionSetupPromise = (async () => {
        try {
          const granted = await requestAdoptionPermissionsAsync().catch(() => false);
          if (!granted || cancelled) return;

          await ensureAdoptionChannelAsync().catch(() => {});

          if (subscribedAdoptionUserId === user.id && adoptionChannel) return;

          if (adoptionChannel) {
            await supabase.removeChannel(adoptionChannel).catch(() => {});
            adoptionChannel = null;
            subscribedAdoptionUserId = null;
          }

          const channel = supabase.channel(`adoption-notifications:${user.id}`);

          channel.on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "adoption_requests" },
            async (payload) => {
              try {
                const req = payload.new as {
                  id: string;
                  pet_id: string;
                  adoptante_id: string;
                  refugio_id: string;
                  message: string;
                };
                if (!req) return;

                if (user.role === "refugio" && req.refugio_id === user.id) {
                  const [{ data: pet }, { data: profile }] = await Promise.all([
                    supabase.from("pets").select("name").eq("id", req.pet_id).single(),
                    supabase.from("profiles").select("username").eq("id", req.adoptante_id).single(),
                  ]);

                  const petName = pet?.name ?? "una mascota";
                  const adoptanteName = profile?.username ?? "Un adoptante";

                  try {
                    const Notif = await import('expo-notifications');
                    await Notif.scheduleNotificationAsync({
                      content: {
                        title: "Nueva solicitud de adopción",
                        body: `${adoptanteName} quiere adoptar a ${petName}`,
                        data: { type: "adoption", requestId: req.id },
                        sound: "default",
                      },
                      trigger: {
                        type: Notif.SchedulableTriggerInputTypes.TIME_INTERVAL,
                        seconds: 1,
                        channelId: ADOPTION_NOTIFICATION_CHANNEL_ID,
                      },
                    });
                  } catch {}
                }
              } catch {}
            },
          );

          channel.on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "adoption_requests" },
            async (payload) => {
              try {
                const req = payload.new as {
                  id: string;
                  pet_id: string;
                  adoptante_id: string;
                  refugio_id: string;
                  status: string;
                };
                if (!req) return;

                if (user.role === "adoptante" && req.adoptante_id === user.id) {
                  const { data: pet } = await supabase
                    .from("pets")
                    .select("name")
                    .eq("id", req.pet_id)
                    .single();

                  const petName = pet?.name ?? "una mascota";
                  const isApproved = req.status === "aprobada";

                  try {
                    const Notif = await import('expo-notifications');
                    await Notif.scheduleNotificationAsync({
                      content: {
                        title: isApproved ? "Solicitud aprobada" : "Solicitud rechazada",
                        body: isApproved
                          ? `Tu solicitud para adoptar a ${petName} fue aprobada. Contacta al refugio.`
                          : `Tu solicitud para adoptar a ${petName} fue rechazada.`,
                        data: { type: "adoption", requestId: req.id, status: req.status },
                        sound: "default",
                      },
                      trigger: {
                        type: Notif.SchedulableTriggerInputTypes.TIME_INTERVAL,
                        seconds: 1,
                        channelId: ADOPTION_NOTIFICATION_CHANNEL_ID,
                      },
                    });
                  } catch {}
                }
              } catch {}
            },
          );

          adoptionChannel = channel.subscribe();
          subscribedAdoptionUserId = user.id;
        } catch {} finally {
          adoptionSetupPromise = null;
        }
      })();

      await adoptionSetupPromise;
    };

    void start();

    return () => {
      cancelled = true;
      if (subscribedAdoptionUserId === user?.id && adoptionChannel) {
        void supabase.removeChannel(adoptionChannel);
        adoptionChannel = null;
        subscribedAdoptionUserId = null;
      }
    };
  }, [user?.id]);
}
