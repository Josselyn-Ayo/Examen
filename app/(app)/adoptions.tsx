import { useAdoptions } from "@features/adoptions/presentation/hooks/useAdoptions";
import { useAuthStore } from "@features/auth/presentation/store/authStore";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BottomNav } from "../../components/BottomNav";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pendiente: { label: "Pendiente", color: "#f59e0b" },
  aprobada: { label: "Aprobada", color: "#059669" },
  rechazada: { label: "Rechazada", color: "#ef4444" },
};

export default function AdoptionsScreen() {
  const user = useAuthStore((s) => s.user);
  const { shelterRequests, adoptanteRequests, isLoadingShelter, isLoadingAdoptante, respondRequest, isResponding } = useAdoptions();
  const isRefugio = user?.role === "refugio";
  const requests = isRefugio ? shelterRequests : adoptanteRequests;
  const isLoading = isRefugio ? isLoadingShelter : isLoadingAdoptante;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bgMesh} />
      <View style={styles.blobOne} />

      <View style={styles.header}>
        <Text style={styles.title}>📋 Solicitudes</Text>
        <Text style={styles.subtitle}>
          {isRefugio ? "Gestiona las solicitudes de adopción" : "Tus solicitudes de adopción"}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#cebdff" />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>Sin solicitudes</Text>
          <Text style={styles.emptyText}>
            {isRefugio ? "Cuando alguien solicite adoptar, aparecerá aquí." : "Solicita adoptar una mascota desde su perfil."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const statusInfo = STATUS_LABELS[item.status] ?? { label: item.status, color: "#999" };
            return (
              <View style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestPetName}>{item.petName ?? "Mascota"}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                  </View>
                </View>
                {isRefugio && item.adoptanteName && (
                  <Text style={styles.requestFrom}>De: {item.adoptanteName}</Text>
                )}
                <Text style={styles.requestMessage} numberOfLines={3}>{item.message}</Text>
                <Text style={styles.requestDate}>
                  {item.createdAt.toLocaleDateString()}
                </Text>

                {isRefugio && item.status === "pendiente" && (
                  <View style={styles.actionRow}>
                    <Pressable
                      style={styles.approveBtn}
                      onPress={() => respondRequest({ requestId: item.id, status: "aprobada" })}
                      disabled={isResponding}
                    >
                      <Text style={styles.approveBtnText}>✓ Aprobar</Text>
                    </Pressable>
                    <Pressable
                      style={styles.rejectBtn}
                      onPress={() => respondRequest({ requestId: item.id, status: "rechazada" })}
                      disabled={isResponding}
                    >
                      <Text style={styles.rejectBtnText}>✗ Rechazar</Text>
                    </Pressable>
                  </View>
                )}
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
  safeArea: { flex: 1, backgroundColor: "#0c0e12" },
  bgMesh: { ...StyleSheet.absoluteFillObject, backgroundColor: "#0c0e12" },
  blobOne: { position: "absolute", top: -80, left: -100, width: 320, height: 320, borderRadius: 999, backgroundColor: "rgba(80,40,174,0.12)" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: "800", color: "#fff" },
  subtitle: { color: "rgba(226,226,231,0.7)", fontSize: 13, fontWeight: "600", marginTop: 4 },
  listContent: { paddingHorizontal: 20, paddingBottom: 140 },
  requestCard: { backgroundColor: "rgba(255,255,255,0.045)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 20, padding: 16, marginBottom: 12 },
  requestHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  requestPetName: { color: "#f4e9ff", fontSize: 16, fontWeight: "700", flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  requestFrom: { color: "rgba(244,233,255,0.6)", fontSize: 13, marginBottom: 4 },
  requestMessage: { color: "rgba(244,233,255,0.8)", fontSize: 14, lineHeight: 20, marginBottom: 8 },
  requestDate: { color: "rgba(244,233,255,0.35)", fontSize: 12 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  approveBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: "rgba(5,150,105,0.2)", borderWidth: 1, borderColor: "rgba(5,150,105,0.3)", alignItems: "center" },
  approveBtnText: { color: "#34d399", fontWeight: "700", fontSize: 14 },
  rejectBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: "rgba(239,68,68,0.2)", borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", alignItems: "center" },
  rejectBtnText: { color: "#f87171", fontWeight: "700", fontSize: 14 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 10 },
  emptyTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 6 },
  emptyText: { color: "rgba(226,226,231,0.72)", fontSize: 15, textAlign: "center", maxWidth: 260 },
  bottomNav: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20, backgroundColor: "rgba(12,14,18,0.9)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  bottomNavInner: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 26, paddingVertical: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  navItem: { flexDirection: "column", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6 },
  navIcon: { fontSize: 18, color: "rgba(226,226,231,0.62)" },
  navLabel: { fontSize: 10, color: "rgba(226,226,231,0.62)", marginTop: 3, fontWeight: "700" },
});