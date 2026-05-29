import { useShelters, useCurrentLocation, ShelterLocation } from "@features/map/presentation/hooks/useShelters";
import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import WebView from "react-native-webview";
import LottieView from "lottie-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNav } from "../../components/BottomNav";
import catFace from "../../assets/animations/cat_face.json";
import catPaw from "../../assets/animations/cat_paw.json";
import mapMarker from "../../assets/animations/map_marker.json";
import pawWalk from "../../assets/animations/paw_walk.json";

const ACCENT_COLORS = ["#4FC3F7", "#7C4DFF", "#81C784", "#FFB74D", "#F06292"];

function generateMapHtml(shelters: { name: string; latitude: number; longitude: number }[], userLat: number | null, userLng: number | null) {
  const markers = shelters
    .map(
      (s, i) =>
        `L.marker([${s.latitude}, ${s.longitude}], {icon: L.divIcon({className:'',html:'<div style="background:#${ACCENT_COLORS[i % ACCENT_COLORS.length].slice(1)};width:24px;height:24px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800">${i + 1}</div>',iconSize:[24,24],iconAnchor:[12,12]})}).addTo(map).bindPopup('<b>${s.name.replace(/'/g, "\\'")}</b>');`
    )
    .join("\n");

  const userMarker =
    userLat !== null && userLng !== null
      ? `L.marker([${userLat}, ${userLng}], {icon: L.divIcon({className:'',html:'<div style="background:#7c4dff;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>',iconSize:[16,16],iconAnchor:[8,8]})}).addTo(map).bindPopup('<b>Tu ubicación</b>');`
      : "";

  const centerLat = userLat ?? -0.18;
  const centerLng = userLng ?? -78.46;
  const bounds =
    shelters.length > 0
      ? `map.fitBounds([${shelters.map((s) => `[${s.latitude}, ${s.longitude}]`).join(",")}], { padding: [60, 60] });`
      : `map.setView([${centerLat}, ${centerLng}], 13);`;

  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{margin:0;padding:0;height:100%;width:100%;}</style>
</head><body>
<div id="map"></div>
<script>
var map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OSM contributors',
  maxZoom: 19
}).addTo(map);
${markers}
${userMarker}
${bounds}
var routeLine = null;
var routeEnd = null;
function showRoute(fromLat, fromLng, toLat, toLng, label) {
  if (routeLine) map.removeLayer(routeLine);
  if (routeEnd) map.removeLayer(routeEnd);
  routeLine = L.polyline([[fromLat, fromLng], [toLat, toLng]], {color: '#7C4DFF', weight: 4, opacity: 0.8, dashArray: '10, 10'}).addTo(map);
  routeEnd = L.marker([toLat, toLng], {icon: L.divIcon({className:'',html:'<div style="background:#F06292;width:28px;height:28px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:14px">📍</div>',iconSize:[28,28],iconAnchor:[14,14]})}).addTo(map).bindPopup('<b>' + label + '</b><br/><i>Destino</i>');
  map.fitBounds([[fromLat, fromLng], [toLat, toLng]], {padding: [60, 60]});
}
function clearRoute() {
  if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
  if (routeEnd) { map.removeLayer(routeEnd); routeEnd = null; }
  if (${shelters.length > 0}) { map.fitBounds([${shelters.map((s) => `[${s.latitude}, ${s.longitude}]`).join(",")}], { padding: [60, 60] }); }
}
</script>
</body></html>`;
}

export default function MapScreen() {
  const user = useAuthStore((s) => s.user);
  const { sheltersWithLocation, isLoadingShelters, error: sheltersError } = useShelters();
  const { latitude, longitude, isLoading: isLoadingLocation } = useCurrentLocation();
  const isRefugio = user?.role === "refugio";
  const [routeShelter, setRouteShelter] = useState<ShelterLocation | null>(null);
  const webViewRef = useRef<WebView>(null);

  const sheltersOnMap = sheltersWithLocation.map((s) => ({
    name: s.name,
    latitude: s.latitude!,
    longitude: s.longitude!,
  }));

  const mapHtml = generateMapHtml(sheltersOnMap, latitude, longitude);
  const isMapReady = !isLoadingShelters && !isLoadingLocation;

  const handleRoute = (shelter: ShelterLocation) => {
    if (routeShelter?.id === shelter.id) {
      setRouteShelter(null);
      webViewRef.current?.injectJavaScript("clearRoute(); true;");
    } else if (latitude !== null && longitude !== null) {
      setRouteShelter(shelter);
      webViewRef.current?.injectJavaScript(
        `showRoute(${latitude}, ${longitude}, ${shelter.latitude}, ${shelter.longitude}, '${shelter.name.replace(/'/g, "\\'")}'); true;`
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerDecor1} />
          <View style={styles.headerDecor2} />
          <View style={styles.headerRow}>
            <LottieView source={catFace} autoPlay loop style={styles.headerLottie} />
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Refugios</Text>
              <Text style={styles.subtitle}>
                {sheltersWithLocation.length > 0
                  ? `${sheltersWithLocation.length} refugio${sheltersWithLocation.length > 1 ? "s" : ""} en el mapa`
                  : isRefugio
                    ? "Registra tu ubicación en Perfil para aparecer en el mapa"
                    : "Aún no hay refugios con ubicación"}
              </Text>
            </View>
          </View>
        </View>

        {isMapReady ? (
          <View style={styles.mapContainer}>
            <View style={styles.mapBadge}>
              <LottieView source={mapMarker} autoPlay loop style={styles.badgeLottie} />
              <Text style={styles.mapBadgeText}>Mapa en vivo</Text>
            </View>
            <WebView
              ref={webViewRef}
              source={{ html: mapHtml }}
              style={styles.map}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.mapLoading}>
                  <LottieView source={pawWalk} autoPlay loop style={styles.webviewLoadingLottie} />
                  <Text style={styles.loadingText}>Cargando mapa...</Text>
                </View>
              )}
            />
          </View>
        ) : (
          <View style={styles.mapLoading}>
            <LottieView source={pawWalk} autoPlay loop style={styles.loadingLottie} />
            <Text style={styles.loadingText}>Cargando mapa...</Text>
          </View>
        )}

        <View style={styles.listSection}>
          <View style={styles.listHeaderRow}>
            <LottieView source={catPaw} autoPlay loop style={styles.listLottie} />
            <View style={styles.listAccentBar} />
            <Text style={styles.listTitle}>
              {isRefugio ? "Todos los refugios" : "Refugios disponibles"}
            </Text>
          </View>

          {isLoadingShelters ? (
            <ActivityIndicator size="small" color="#7C4DFF" />
          ) : sheltersError ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Error al cargar refugios</Text>
              <Text style={styles.emptyText}>{(sheltersError as any)?.message ?? String(sheltersError)}</Text>
            </View>
          ) : sheltersWithLocation.length === 0 ? (
            <View style={styles.emptyCard}>
              <LottieView source={catFace} autoPlay loop style={styles.emptyLottie} />
              <Text style={styles.emptyText}>
                {isRefugio
                  ? "Registra tu ubicación en Perfil para aparecer aquí."
                  : "No hay refugios con ubicación registrada aún."}
              </Text>
            </View>
          ) : (
            sheltersWithLocation.slice(0, 5).map((shelter, index) => {
              const isActive = routeShelter?.id === shelter.id;
              return (
                <View key={shelter.id} style={[styles.shelterCard, isActive && styles.shelterCardActive, { borderLeftColor: ACCENT_COLORS[index % ACCENT_COLORS.length] }]}>
                  <View style={styles.shelterInfo}>
                    <View style={styles.shelterNameRow}>
                      <View style={[styles.shelterDot, { backgroundColor: ACCENT_COLORS[index % ACCENT_COLORS.length] }]} />
                      <Text style={styles.shelterName}>{shelter.name}</Text>
                    </View>
                    <Text style={styles.shelterCoords}>
                      📍 {shelter.latitude!.toFixed(4)}, {shelter.longitude!.toFixed(4)}
                    </Text>
                  </View>
                  <Pressable
                    style={[styles.routeBtn, isActive && styles.routeBtnActive]}
                    onPress={() => handleRoute(shelter)}
                  >
                    <Text style={[styles.routeBtnText, isActive && styles.routeBtnTextActive]}>
                      {isActive ? "✕ Ruta" : "🧭 Ir"}
                    </Text>
                  </Pressable>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <BottomNav active="map" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#E8F4FD" },
  scrollContent: { paddingBottom: 90 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: "#B3E5FC",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
    position: "relative",
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  headerLottie: { width: 64, height: 64, marginRight: 10 },
  headerTextWrap: { flex: 1 },
  headerDecor1: {
    position: "absolute",
    top: -30,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(124,77,255,0.12)",
  },
  headerDecor2: {
    position: "absolute",
    bottom: -20,
    left: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(79,195,247,0.18)",
  },
  title: { fontSize: 28, fontWeight: "800", color: "#1A237E" },
  subtitle: { color: "#3949AB", fontSize: 13, fontWeight: "600", marginTop: 4, lineHeight: 18 },
  mapContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 6,
    shadowColor: "#7C4DFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    position: "relative",
  },
  mapBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  badgeLottie: { width: 20, height: 20, marginRight: 4 },
  mapBadgeText: { fontSize: 11, fontWeight: "700", color: "#1A237E" },
  map: { flex: 1, minHeight: 300 },
  mapLoading: { flex: 1, justifyContent: "center", alignItems: "center", minHeight: 300 },
  webviewLoadingLottie: { width: 80, height: 80 },
  loadingLottie: { width: 100, height: 100 },
  loadingText: { color: "#7C4DFF", fontSize: 13, marginTop: 8, fontWeight: "600" },
  listSection: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8 },
  listHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  listLottie: { width: 32, height: 32, marginRight: 4 },
  listAccentBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: "#7C4DFF",
    marginRight: 8,
  },
  listTitle: {
    color: "#3949AB",
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "800",
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#4FC3F7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  emptyLottie: { width: 120, height: 120, marginBottom: 8 },
  emptyText: { color: "#5C6BC0", fontSize: 14, textAlign: "center", lineHeight: 20 },
  emptyTitle: { color: "#1A237E", fontSize: 16, fontWeight: "700", marginBottom: 6 },
  shelterCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(79,195,247,0.15)",
    borderLeftWidth: 4,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#4FC3F7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  shelterInfo: { flex: 1 },
  shelterNameRow: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
  shelterDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  shelterName: { color: "#1A237E", fontSize: 15, fontWeight: "700" },
  shelterCoords: { color: "#7986CB", fontSize: 12, marginLeft: 16 },
  shelterCardActive: { backgroundColor: "#EDE7F6", borderWidth: 1.5, borderColor: "#7C4DFF" },
  routeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: "#B3E5FC",
    shadowColor: "#4FC3F7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  routeBtnActive: { backgroundColor: "#7C4DFF" },
  routeBtnText: { color: "#1A237E", fontSize: 13, fontWeight: "700" },
  routeBtnTextActive: { color: "#fff" },
});