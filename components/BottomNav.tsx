import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type TabId = "chat" | "pets" | "adoptions" | "ai" | "map" | "profile";

const ADOPTANTE_TABS: { id: TabId; icon: string; label: string; route: string }[] = [
  { id: "pets", icon: "🐾", label: "Mascotas", route: "/(app)/pets" },
  { id: "ai", icon: "🤖", label: "IA", route: "/(app)/ai-assistant" },
  { id: "map", icon: "🗺️", label: "Mapa", route: "/(app)/map" },
  { id: "profile", icon: "👤", label: "Perfil", route: "/(app)/contacts" },
];

const REFUGIO_TABS: { id: TabId; icon: string; label: string; route: string }[] = [
  { id: "chat", icon: "💬", label: "Chat", route: "/(app)" },
  { id: "pets", icon: "🐾", label: "Mascotas", route: "/(app)/pets" },
  { id: "adoptions", icon: "📋", label: "Solicitudes", route: "/(app)/adoptions" },
  { id: "map", icon: "🗺️", label: "Mapa", route: "/(app)/map" },
  { id: "profile", icon: "👤", label: "Perfil", route: "/(app)/contacts" },
];

interface BottomNavProps {
  active: TabId;
}

export function BottomNav({ active }: BottomNavProps) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const tabs = user?.role === "refugio" ? REFUGIO_TABS : ADOPTANTE_TABS;

  return (
    <View style={styles.bottomNav}>
      <View style={styles.bottomNavInner}>
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.navItem, isActive && styles.navItemActive]}
              activeOpacity={0.85}
              onPress={() => router.replace(tab.route as any)}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <Text style={[styles.navIcon, isActive && styles.navIconActive]}>
                {tab.icon}
              </Text>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: "rgba(12,14,18,0.92)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  bottomNavInner: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 26,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    shadowColor: "#cebdff",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -6 },
  },
  navItem: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  navItemActive: {
    backgroundColor: "rgba(206,189,255,0.14)",
  },
  navIcon: {
    fontSize: 18,
    color: "rgba(226,226,231,0.62)",
  },
  navIconActive: {
    color: "#cebdff",
    fontWeight: "800",
  },
  navLabel: {
    fontSize: 10,
    color: "rgba(226,226,231,0.62)",
    marginTop: 3,
    fontWeight: "700",
  },
  navLabelActive: {
    color: "#cebdff",
    fontWeight: "800",
  },
});