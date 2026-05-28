import { SupabaseAuthRepository } from '@features/auth/infrastructure/repositories/SupabaseAuthRepository';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { supabase } from '@shared/infrastructure/supabase/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import * as WebBrowser from 'expo-web-browser';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useMessageNotifications } from '../src/features/chat/presentation/hooks/useMessageNotifications';
 
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

  useEffect(() => {
    authRepo.getCurrentUser().then(setUser);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
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
    if (!user && !inAuth) router.replace('/(auth)/login');
    if (user && inAuth) {
      const homeRoute = user.role === 'refugio' ? REFUGIO_ROUTES.home : ADOPTANTE_ROUTES.home;
      router.replace(homeRoute as any);
    }
  }, [user, segments]);

  useEffect(() => {
    const redirectFromNotification = (notification: Notifications.Notification) => {
      const roomId = notification.request.content.data?.roomId;
      if (typeof roomId === 'string' && user) {
        router.push(`/(app)/chat/${roomId}`);
      }
    };

    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse?.notification) {
      redirectFromNotification(lastResponse.notification);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      redirectFromNotification(response.notification);
    });

    return () => subscription.remove();
  }, [router, user]);
 
  return <Slot />;
}
 
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard />
    </QueryClientProvider>
  );
}