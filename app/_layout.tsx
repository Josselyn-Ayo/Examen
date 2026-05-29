import { SupabaseAuthRepository } from '@features/auth/infrastructure/repositories/SupabaseAuthRepository';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { supabase } from '@shared/infrastructure/supabase/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isRunningInExpoGo } from 'expo';
import * as WebBrowser from 'expo-web-browser';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useMessageNotifications } from '../src/features/chat/presentation/hooks/useMessageNotifications';
import { useAdoptionNotifications } from '../src/features/adoptions/presentation/hooks/useAdoptionNotifications';

WebBrowser.maybeCompleteAuthSession();
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } }
});
const authRepo = new SupabaseAuthRepository();

const ADOPTANTE_ROUTES = { home: "/(app)/pets" } as const;
const REFUGIO_ROUTES = { home: "/(app)" } as const;

function AuthGuard() {
  const { user, setUser } = useAuthStore();
  const segments = useSegments();
  const router   = useRouter();
  const activeRoomId = segments[0] === '(app)' && segments[1] === 'chat' ? segments[2] ?? null : null;

  useMessageNotifications(activeRoomId);
  useAdoptionNotifications();

  useEffect(() => {
    authRepo.getCurrentUser().then(setUser);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          router.replace('/(auth)/reset-password');
        }
        if (session) {
          const user = await authRepo.getCurrentUser();
          setUser(user);
        } else {
          setUser(null);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!segments[0]) return;
    const inAuth = segments[0] === '(auth)';
    const isResetPassword = segments[1] === 'reset-password';
    if (!user && !inAuth) router.replace('/(auth)/login');
    if (user && inAuth && !isResetPassword) {
      const homeRoute = user.role === 'refugio' ? REFUGIO_ROUTES.home : ADOPTANTE_ROUTES.home;
      router.replace(homeRoute as any);
    }
  }, [user, segments]);

  useEffect(() => {
    let cancelled = false;
    let subscription: { remove: () => void } | null = null;

    if (isRunningInExpoGo()) return;

    (async () => {
      try {
        const Notif = await import('expo-notifications');
        if (cancelled) return;

        const redirectFromNotification = (notification: Notif.Notification) => {
          const data = notification.request.content.data;
          const roomId = data?.roomId;
          const notifType = data?.type;
          if (typeof roomId === 'string' && user) {
            router.push(`/(app)/chat/${roomId}`);
          } else if (notifType === 'adoption' && user) {
            router.push('/(app)/adoptions');
          }
        };

        const lastResponse = Notif.getLastNotificationResponse();
        if (lastResponse?.notification) {
          redirectFromNotification(lastResponse.notification);
        }

        subscription = Notif.addNotificationResponseReceivedListener((response) => {
          redirectFromNotification(response.notification);
        });
      } catch {}
    })();

    return () => {
      cancelled = true;
      try { subscription?.remove(); } catch {}
    };
  }, [router, user]);
 
  return <Slot />;
}
 
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthGuard />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}