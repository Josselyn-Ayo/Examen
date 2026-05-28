import { useShelters, useCurrentLocation } from "@features/map/presentation/hooks/useShelters";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BottomNav } from "../../components/BottomNav";

export default function MapScreen() {
  const { shelters, sheltersWithLocation, isLoadingShelters } = useShelters();
  const { latitude, longitude, isLoading: isLoadingLocation, error: locationError } = useCurrentLocation();

  const openInMaps = (lat: number, lng: number, name: string) => {
    const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
    Linking.openURL(url);
  };

  const openDirections = (destLat: number, destLng: number) => {
    if (latitude && longitude) {
      const url = `https://www.openstreetmap.org/directions?from=${latitude},${longitude}&to=${destLat},${destLng}`;
      Linking.openURL(url);
    } else {
      openInMaps(destLat, destLng, "");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bgMesh} />
      <View style={styles.blobOne} />

      <View style={styles.header}>
        <Text style={styles.title}>🗺️ Refugios</Text>
        <Text style={styles.subtitle}>
          {latitude ? "Ubicación detectada" : "Encuentra refugios cercanos"}
        </Text>
      </View>

      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapEmoji}>🌍</Text>
        <Text style={styles.mapTitle}>Mapa de refugios</Text>
        <Text style={styles.mapSub}>
          {sheltersWithLocation.length > 0
            ? `${sheltersWithLocation.length} refugio${sheltersWithLocation.length > 1 ? "s" : ""} con ubicación`
            : "Aún no hay refugios con ubicación registrada"}
        </Text>
        {isLoadingLocation && <ActivityIndicator size="small" color="#cebdff" style={{ marginTop: 8 }} />}
        {!isLoadingLocation && latitude && (
          <Text style={styles.locationText}>
            Tu ubicación: {latitude.toFixed(4)}, {longitude!.toFixed(4)}
          </Text>
        )}
      </View>

      {isLoadingShelters ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#cebdff" />
        </View>
      ) : (
        <FlatList
          data={shelters}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏠</Text>
              <Text style={styles.emptyTitle}>Sin refugios</Text>
              <Text style={styles.emptyText}>No hay refugios registrados aún.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.shelterCard}>
              <View style={styles.shelterInfo}>
                <Text style={styles.shelterName}>{item.name}</Text>
                <Text style={styles.shelterEmail}>{item.email}</Text>
                {item.latitude && item.longitude ? (
                  <Text style={styles.shelterCoords}>
                    📍 {item.latitude.toFixed(4)}, {item.longitude!.toFixed(4)}
                  </Text>
                ) : (
                  <Text style={styles.shelterNoCoords}>Sin ubicación registrada</Text>
                )}
              </View>
              {item.latitude && item.longitude ? (
                <View style={styles.shelterActions}>
                  <TouchableOpacity
                    style={styles.mapBtn}
                    onPress={() => openInMaps(item.latitude!, item.longitude!, item.name)}
                  >
                    <Text style={styles.mapBtnText}>🗺️ Ver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dirBtn}
                    onPress={() => openDirections(item.latitude!, item.longitude!)}
                  >
                    <Text style={styles.dirBtnText}>🧭 Ir</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          )}
        />
      )}

      <BottomNav active="map" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0c0e12" },
  bgMesh: { ...StyleSheet.absoluteFillObject, backgroundColor: "#0c0e12" },
  blobOne: { position: "absolute", top: -80, right: -100, width: 320, height: 320, borderRadius: 999, backgroundColor: "rgba(80,40,174,0.12)" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: "800", color: "#fff" },
  subtitle: { color: "rgba(226,226,231,0.7)", fontSize: 13, fontWeight: "600", marginTop: 4 },
  mapPlaceholder: { marginHorizontal: 20, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 24, alignItems: "center", marginBottom: 16 },
  mapEmoji: { fontSize: 48, marginBottom: 8 },
  mapTitle: { color: "#f4e9ff", fontSize: 18, fontWeight: "800", marginBottom: 4 },
  mapSub: { color: "rgba(244,233,255,0.6)", fontSize: 14, textAlign: "center" },
  locationText: { color: "rgba(244,233,255,0.5)", fontSize: 12, marginTop: 8 },
  listContent: { paddingHorizontal: 20, paddingBottom: 140 },
  shelterCard: { backgroundColor: "rgba(255,255,255,0.045)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 20, padding: 16, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  shelterInfo: { flex: 1 },
  shelterName: { color: "#f4e9ff", fontSize: 16, fontWeight: "700", marginBottom: 3 },
  shelterEmail: { color: "rgba(244,233,255,0.5)", fontSize: 13, marginBottom: 2 },
  shelterCoords: { color: "#cebdff", fontSize: 12, fontWeight: "600" },
  shelterNoCoords: { color: "rgba(244,233,255,0.35)", fontSize: 12 },
  shelterActions: { flexDirection: "row", gap: 8 },
  mapBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  mapBtnText: { color: "#cebdff", fontSize: 13, fontWeight: "700" },
  dirBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: "#7c4dff" },
  dirBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  emptyState: { alignItems: "center", paddingTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 10 },
  emptyTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 6 },
  emptyText: { color: "rgba(226,226,231,0.72)", fontSize: 15, textAlign: "center" },
  bottomNav: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20, backgroundColor: "rgba(12,14,18,0.9)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  bottomNavInner: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 26, paddingVertical: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  navItem: { flexDirection: "column", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6 },
  navItemActive: { backgroundColor: "rgba(206,189,255,0.12)", borderRadius: 16, paddingHorizontal: 16 },
  navIcon: { fontSize: 18, color: "rgba(226,226,231,0.62)" },
  navIconActive: { fontSize: 18, color: "#cebdff", fontWeight: "800" },
  navLabel: { fontSize: 10, color: "rgba(226,226,231,0.62)", marginTop: 3, fontWeight: "700" },
  navLabelActive: { fontSize: 10, color: "#cebdff", marginTop: 3, fontWeight: "800" },
});