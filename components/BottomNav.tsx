import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";

type TabId = "chat" | "pets" | "adoptions" | "ai" | "map" | "profile";

const ALL_TABS: { id: TabId; iconSet: "ion" | "feather" | "mc"; icon: string; label: string; route: string }[] = [
  { id: "pets", iconSet: "mc", icon: "paw", label: "Mascotas", route: "/(app)/pets" },
  { id: "chat", iconSet: "ion", icon: "chatbubble-outline", label: "Chat", route: "/(app)" },
  { id: "ai", iconSet: "ion", icon: "sparkles-outline", label: "IA", route: "/(app)/ai-assistant" },
  { id: "adoptions", iconSet: "feather", icon: "file-text", label: "Solicitudes", route: "/(app)/adoptions" },
  { id: "map", iconSet: "feather", icon: "map-pin", label: "Mapa", route: "/(app)/map" },
  { id: "profile", iconSet: "feather", icon: "user", label: "Perfil", route: "/(app)/contacts" },
];

interface BottomNavProps {
  active: TabId;
}

function TabIcon({ iconSet, icon, size, color }: { iconSet: "ion" | "feather" | "mc"; icon: string; size: number; color: string }) {
  if (iconSet === "ion") return <Ionicons name={icon as any} size={size} color={color} />;
  if (iconSet === "mc") return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
  return <Feather name={icon as any} size={size} color={color} />;
}

export function BottomNav({ active }: BottomNavProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {ALL_TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.tabActive]}
              activeOpacity={0.85}
              onPress={() => router.replace(tab.route as any)}
              hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
            >
              <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                <TabIcon
                  iconSet={tab.iconSet}
                  icon={tab.icon}
                  size={isActive ? 16 : 14}
                  color={isActive ? "#fff" : "#5EEAD4"}
                />
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>
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
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 14,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "rgba(77,168,196,0.15)",
  },
  bar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#f0f7fa",
    borderRadius: 20,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(77,168,196,0.15)",
    elevation: 4,
    shadowColor: "#4da8c4",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tab: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: 14,
    minWidth: 44,
  },
  tabActive: {
    backgroundColor: "#4da8c4",
    elevation: 3,
    shadowColor: "#4da8c4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconWrapActive: {
    backgroundColor: "transparent",
  },
  label: {
    fontSize: 7,
    color: "#8bb8c8",
    marginTop: 1,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  labelActive: {
    color: "#fff",
    fontWeight: "800",
  },
});
