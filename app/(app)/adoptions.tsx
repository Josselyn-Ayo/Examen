import { useAdoptions } from "@features/adoptions/presentation/hooks/useAdoptions";
import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNav } from "../../components/BottomNav";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pendiente: { label: "Pendiente", color: "#f59e0b" },
  aprobada: { label: "Aprobada", color: "#059669" },
  rechazada: { label: "Rechazada", color: "#ef4444" },
};

export default function AdoptionsScreen() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const { shelterRequests, adoptanteRequests, isLoadingShelter, isLoadingAdoptante, respondRequest, isResponding, ensureRoom, isEnsuringRoom } = useAdoptions();
  const isRefugio = user?.role === "refugio";
  const requests = isRefugio ? shelterRequests : adoptanteRequests;
  const isLoading = isRefugio ? isLoadingShelter : isLoadingAdoptante;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.headerBg}>
        <View style={styles.deco1} />
        <View style={styles.deco2} />
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Feather name="file-text" size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.title}>Solicitudes</Text>
              <Text style={styles.subtitle}>
                {isRefugio ? "Gestiona las solicitudes de adopcion" : "Tus solicitudes de adopcion"}
              </Text>
            </View>
          </View>
          {!isRefugio && (
            <Pressable style={styles.formBtn} onPress={() => router.push("/(app)/adoption-form" as any)}>
              <Feather name="plus" size={16} color="#fff" />
              <Text style={styles.formBtnText}>Solicitar</Text>
            </Pressable>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4da8c4" />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Feather name="inbox" size={36} color="#b8d6e0" />
          </View>
          <Text style={styles.emptyTitle}>Sin solicitudes</Text>
          <Text style={styles.emptyText}>
            {isRefugio ? "Cuando alguien solicite adoptar, aparecera aqui." : "Solicita adoptar una mascota completando el formulario."}
          </Text>
          {!isRefugio && (
            <Pressable style={styles.emptyFormBtn} onPress={() => router.push("/(app)/adoption-form" as any)}>
              <Feather name="file-text" size={16} color="#fff" />
              <Text style={styles.emptyFormBtnText}>Llenar formulario</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const statusInfo = STATUS_LABELS[item.status] ?? { label: item.status, color: "#999" };
            const tieneChat = !!item.roomId;
            return (
              <View style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestPetName}>{item.petName ?? "Mascota"}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}15` }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                  </View>
                </View>
                {isRefugio && item.adoptanteName && (
                  <Text style={styles.requestFrom}>De: {item.adoptanteName}</Text>
                )}
                {!isRefugio && (
                  <Text style={styles.requestFrom}>De: {item.refugioName ?? "Refugio"}</Text>
                )}
                <Text style={styles.requestMessage} numberOfLines={3}>{item.message}</Text>
                <Text style={styles.requestDate}>
                  {item.createdAt.toLocaleDateString()}
                </Text>

                <View style={styles.actionRow}>
                  {isRefugio && item.status === "pendiente" && (
                    <>
                      <Pressable
                        style={styles.approveBtn}
                        onPress={() => respondRequest({ requestId: item.id, status: "aprobada" })}
                        disabled={isResponding}
                      >
                        <Feather name="check" size={14} color="#059669" />
                        <Text style={styles.approveBtnText}>Aprobar</Text>
                      </Pressable>
                      <Pressable
                        style={styles.rejectBtn}
                        onPress={() => respondRequest({ requestId: item.id, status: "rechazada" })}
                        disabled={isResponding}
                      >
                        <Feather name="x" size={14} color="#EF4444" />
                        <Text style={styles.rejectBtnText}>Rechazar</Text>
                      </Pressable>
                    </>
                  )}
                  {tieneChat ? (
                    <Pressable
                      style={styles.chatBtn}
                      onPress={() => router.push(`/(app)/chat/${item.roomId}`)}
                    >
                      <Feather name="message-circle" size={16} color="#fff" />
                      <Text style={styles.chatBtnText}>Ir al Chat</Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      style={[styles.chatBtn, isEnsuringRoom && { opacity: 0.6 }]}
                      onPress={async () => {
                        try {
                          const roomId = await ensureRoom(item);
                          router.push(`/(app)/chat/${roomId}`);
                        } catch {}
                      }}
                      disabled={isEnsuringRoom}
                    >
                      <Feather name="message-circle" size={16} color="#fff" />
                      <Text style={styles.chatBtnText}>{isEnsuringRoom ? "Creando..." : "Ir al Chat"}</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}

      <BottomNav active="adoptions" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f7fa" },

  headerBg: {
    backgroundColor: "#4da8c4",
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: "hidden",
    position: "relative",
  },
  deco1: { position: "absolute", top: -60, right: -50, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(255,255,255,0.08)" },
  deco2: { position: "absolute", top: 20, left: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.06)" },

  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "800", color: "#fff" },
  subtitle: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "600", marginTop: 2 },
  formBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  formBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 160 },

  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#4da8c4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  requestHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  requestPetName: { color: "#1a3a4a", fontSize: 16, fontWeight: "700", flex: 1 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  requestFrom: { color: "#4da8c4", fontSize: 13, marginBottom: 4, fontWeight: "600" },
  requestMessage: { color: "#374151", fontSize: 14, lineHeight: 20, marginBottom: 8 },
  requestDate: { color: "#8bb8c8", fontSize: 12, fontWeight: "600" },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 12, flexWrap: "wrap" },
  approveBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: "rgba(5,150,105,0.1)", borderWidth: 1, borderColor: "rgba(5,150,105,0.2)" },
  approveBtnText: { color: "#059669", fontWeight: "700", fontSize: 14 },
  rejectBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" },
  rejectBtnText: { color: "#EF4444", fontWeight: "700", fontSize: 14 },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#4da8c4",
    elevation: 3,
    shadowColor: "#4da8c4",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  chatBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  chatBtnDisabled: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(77,168,196,0.08)",
    borderWidth: 1,
    borderColor: "rgba(77,168,196,0.12)",
  },
  chatBtnDisabledText: { color: "#b8d6e0", fontWeight: "600", fontSize: 13 },

  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60, paddingHorizontal: 20 },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginBottom: 14, shadowColor: "#4da8c4", shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  emptyTitle: { color: "#1a3a4a", fontSize: 20, fontWeight: "800", marginBottom: 6 },
  emptyText: { color: "#8bb8c8", fontSize: 14, textAlign: "center", maxWidth: 260, lineHeight: 20, marginBottom: 20 },
  emptyFormBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#266e84",
    elevation: 3,
    shadowColor: "#1a5060",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  emptyFormBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
