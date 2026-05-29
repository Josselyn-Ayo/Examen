import { useProfileStats } from "@features/auth/presentation/hooks/useProfileStats";
import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import * as Location from "expo-location";
import { BottomNav } from "../../components/BottomNav";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const buildAvatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/thumbs/png?seed=${encodeURIComponent(seed)}`;

import { SafeAreaView } from "react-native-safe-area-context";

export default function ContactsScreen() {
  const user = useAuthStore((s) => s.user);
  const { favoritesCount, solicitudesCount, adoptadosCount, petsCount } = useProfileStats();
  const { logout, updateProfile, isUpdateProfileLoading, updateProfileError } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const isRefugio = user?.role === "refugio";

  const fadeAvatar = useRef(new Animated.Value(0)).current;
  const slideInfo = useRef(new Animated.Value(20)).current;
  const fadeCards = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAvatar, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(slideInfo, { toValue: 0, duration: 600, delay: 150, easing: Easing.out(Easing.back(1.1)), useNativeDriver: true }),
      Animated.timing(fadeCards, { toValue: 1, duration: 600, delay: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try { await logout(); } catch { setLoading(false); }
  };

  const handleSaveLocation = async () => {
    setSavingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Activa la ubicación para registrar tu refugio en el mapa.");
        setSavingLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      updateProfile({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch {
      Alert.alert("Error", "No se pudo obtener la ubicación.");
    } finally {
      setSavingLocation(false);
    }
  };

  const profileSource = user?.avatarUrl
    ? { uri: user.avatarUrl }
    : { uri: buildAvatarUrl(user?.username ?? user?.email ?? "user") };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.headerBg}>
        <View style={styles.deco1} />
        <View style={styles.deco2} />
        <View style={styles.deco3} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.avatarSection, { opacity: fadeAvatar }]}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarRing2}>
              <Image source={profileSource} style={styles.avatar} />
            </View>
          </View>
          <View style={styles.roleBadge}>
            <MaterialCommunityIcons name={isRefugio ? "home" : "heart"} size={14} color="#fff" />
            <Text style={styles.roleBadgeText}>{isRefugio ? "Refugio" : "Adoptante"}</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.nameSection, { opacity: fadeAvatar, transform: [{ translateY: slideInfo }] }]}>
          <Text style={styles.userName}>{user?.username ?? "Sin nombre"}</Text>
          <Text style={styles.userEmail}>{user?.email ?? ""}</Text>
        </Animated.View>

        <Animated.View style={[styles.cardsSection, { opacity: fadeCards, transform: [{ translateY: slideInfo }] }]}>
          <View style={styles.statsRow}>
            {isRefugio ? (
              <>
                <Pressable style={styles.statCard} onPress={() => router.push("/(app)/pets")}>
                  <MaterialCommunityIcons name="paw" size={22} color="#4da8c4" />
                  <Text style={styles.statNumber}>{petsCount}</Text>
                  <Text style={styles.statLabel}>Mascotas</Text>
                </Pressable>
                <Pressable style={styles.statCard} onPress={() => router.push("/(app)/adoptions")}>
                  <Feather name="file-text" size={20} color="#4da8c4" />
                  <Text style={styles.statNumber}>{solicitudesCount}</Text>
                  <Text style={styles.statLabel}>Solicitudes</Text>
                </Pressable>
                <Pressable style={styles.statCard} onPress={() => router.push("/(app)/adoptions")}>
                  <Feather name="check-circle" size={20} color="#4da8c4" />
                  <Text style={styles.statNumber}>{adoptadosCount}</Text>
                  <Text style={styles.statLabel}>Aprobadas</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable style={styles.statCard} onPress={() => router.push("/(app)/pets")}>
                  <MaterialCommunityIcons name="paw" size={22} color="#4da8c4" />
                  <Text style={styles.statNumber}>{favoritesCount}</Text>
                  <Text style={styles.statLabel}>Favoritos</Text>
                </Pressable>
                <Pressable style={styles.statCard} onPress={() => router.push("/(app)/adoptions")}>
                  <Feather name="file-text" size={20} color="#4da8c4" />
                  <Text style={styles.statNumber}>{solicitudesCount}</Text>
                  <Text style={styles.statLabel}>Solicitudes</Text>
                </Pressable>
                <Pressable style={styles.statCard} onPress={() => router.push("/(app)/pets")}>
                  <Feather name="check-circle" size={20} color="#4da8c4" />
                  <Text style={styles.statNumber}>{adoptadosCount}</Text>
                  <Text style={styles.statLabel}>Adoptados</Text>
                </Pressable>
              </>
            )}
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>Mi cuenta</Text>
          </View>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => router.push("/(app)/editar-perfil")}>
            <View style={styles.menuIconBg}>
              <Feather name="user" size={18} color="#4da8c4" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Editar perfil</Text>
              <Text style={styles.menuSub}>Nombre, foto y datos personales</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#b8d6e0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => router.push("/(app)/privacidad")}>
            <View style={styles.menuIconBg}>
              <Feather name="shield" size={18} color="#4da8c4" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Privacidad</Text>
              <Text style={styles.menuSub}>Contraseña y seguridad</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#b8d6e0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => router.push("/(app)/ayuda")}>
            <View style={styles.menuIconBg}>
              <Feather name="help-circle" size={18} color="#4da8c4" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Ayuda</Text>
              <Text style={styles.menuSub}>Preguntas frecuentes y soporte</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#b8d6e0" />
          </TouchableOpacity>

          {isRefugio && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionDot} />
                <Text style={styles.sectionTitle}>Mi refugio</Text>
              </View>

              <View style={styles.locationCard}>
                <View style={styles.locationTop}>
                  <Feather name="map-pin" size={18} color="#4da8c4" />
                  <Text style={styles.locationTitle}>Ubicación del refugio</Text>
                </View>
                <Text style={styles.locationDesc}>
                  {user?.latitude && user?.longitude
                    ? "Tu refugio ya está registrado en el mapa."
                    : "Registra la ubicación para que los adoptantes te encuentren."}
                </Text>
                {user?.latitude && user?.longitude ? (
                  <View style={styles.locationCoords}>
                    <Feather name="navigation" size={14} color="#266e84" />
                    <Text style={styles.locationCoordsText}>
                      {user.latitude.toFixed(4)}, {user.longitude.toFixed(4)}
                    </Text>
                  </View>
                ) : null}
                <TouchableOpacity
                  style={[styles.locationBtn, (savingLocation || isUpdateProfileLoading) && styles.btnDisabled]}
                  onPress={() => router.push("/(app)/registrar-refugio")}
                  disabled={savingLocation || isUpdateProfileLoading}
                  activeOpacity={0.8}
                >
                  <View style={styles.locationBtnInner}>
                    <Feather name="edit" size={15} color="#fff" />
                    <Text style={styles.locationBtnText}>
                      Registrar refugio
                    </Text>
                  </View>
                </TouchableOpacity>
                {updateProfileError && <Text style={styles.errorText}>{updateProfileError}</Text>}
              </View>
            </>
          )}

          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: "#e05050" }]} />
            <Text style={[styles.sectionTitle, { color: "#c04040" }]}>Sesión</Text>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} disabled={loading} activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator color="#e05050" />
            ) : (
              <View style={styles.logoutInner}>
                <Feather name="log-out" size={18} color="#e05050" />
                <Text style={styles.logoutText}>Cerrar sesión</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.versionText}>PetAdopt v1.0.0</Text>
        </Animated.View>
      </ScrollView>

      <BottomNav active="profile" />
    </SafeAreaView>
  );
}

import { ScrollView } from "react-native";

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f7fa" },
  headerBg: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 260,
    backgroundColor: "#4da8c4",
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: "hidden",
  },
  deco1: { position: "absolute", top: -60, right: -50, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(255,255,255,0.08)" },
  deco2: { position: "absolute", top: 20, left: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.06)" },
  deco3: { position: "absolute", bottom: -20, right: 30, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.05)" },
  scrollContent: { paddingTop: 30, paddingHorizontal: 20, paddingBottom: 120 },
  avatarSection: { alignItems: "center", marginTop: 4 },
  avatarRing: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
    padding: 4,
  },
  avatarRing2: {
    width: 112, height: 112, borderRadius: 56,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
    padding: 3,
    overflow: "hidden",
  },
  avatar: { width: "100%", height: "100%", borderRadius: 56 },
  roleBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 999, marginTop: -16, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  roleBadgeText: { color: "#fff", fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  nameSection: { alignItems: "center", marginTop: 12, marginBottom: 20 },
  userName: { color: "#fff", fontSize: 24, fontWeight: "900", letterSpacing: -0.5, textShadowColor: "rgba(0,30,60,0.1)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  userEmail: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "500", marginTop: 4 },
  cardsSection: {},
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: "#fff", borderRadius: 18,
    paddingVertical: 16, alignItems: "center",
    shadowColor: "#4da8c4", shadowOpacity: 0.08,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  statNumber: { fontSize: 20, fontWeight: "900", color: "#1a3a4a", marginTop: 6 },
  statLabel: { fontSize: 11, color: "#7aa8ba", fontWeight: "700", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16, marginBottom: 10 },
  sectionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4da8c4" },
  sectionTitle: { fontSize: 12, fontWeight: "800", color: "#3d8fa8", textTransform: "uppercase", letterSpacing: 1 },
  menuItem: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 14,
    marginBottom: 8,
    shadowColor: "#4da8c4", shadowOpacity: 0.06,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  menuIconBg: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: "rgba(77,168,196,0.1)",
    alignItems: "center", justifyContent: "center",
    marginRight: 12,
  },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: "700", color: "#1a3a4a" },
  menuSub: { fontSize: 12, color: "#8bb8c8", fontWeight: "500", marginTop: 2 },
  locationCard: {
    backgroundColor: "#fff", borderRadius: 18,
    padding: 18, marginBottom: 8,
    shadowColor: "#4da8c4", shadowOpacity: 0.06,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  locationTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  locationTitle: { fontSize: 14, fontWeight: "800", color: "#1a3a4a" },
  locationDesc: { fontSize: 12, color: "#8bb8c8", fontWeight: "500", lineHeight: 18, marginBottom: 10 },
  locationCoords: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(77,168,196,0.08)", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12,
  },
  locationCoordsText: { fontSize: 13, color: "#266e84", fontWeight: "700" },
  locationBtn: {
    backgroundColor: "#266e84", borderRadius: 14,
    paddingVertical: 12, alignItems: "center",
    shadowColor: "#1a5060", shadowOpacity: 0.2,
    shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  locationBtnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  locationBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  btnDisabled: { opacity: 0.5 },
  errorText: { color: "#e05050", fontSize: 12, marginTop: 8, textAlign: "center" },
  logoutBtn: {
    backgroundColor: "#fff", borderRadius: 16,
    paddingVertical: 14, alignItems: "center",
    borderWidth: 1.5, borderColor: "rgba(224,80,80,0.2)",
    shadowColor: "#e05050", shadowOpacity: 0.06,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  logoutInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoutText: { color: "#e05050", fontSize: 15, fontWeight: "800" },
  versionText: { textAlign: "center", color: "#a4c6d4", fontSize: 11, fontWeight: "500", marginTop: 16, marginBottom: 8 },
});
