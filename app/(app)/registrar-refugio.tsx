import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";

export default function RegistrarRefugioScreen() {
  const user = useAuthStore((s) => s.user);
  const { updateProfile, isUpdateProfileLoading, updateProfileError } = useAuth();
  const router = useRouter();

  const [nombre, setNombre] = useState(user?.username ?? "");
  const [nit, setNit] = useState(user?.nit ?? "");
  const [telefono, setTelefono] = useState(user?.phone ?? "");
  const [direccion, setDireccion] = useState(user?.address ?? "");
  const [descripcion, setDescripcion] = useState(user?.shelterDescription ?? "");
  const [latitude, setLatitude] = useState<number | null>(user?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(user?.longitude ?? null);
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);
  const [region, setRegion] = useState({
    latitude: user?.latitude ?? -33.4569,
    longitude: user?.longitude ?? -70.6483,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const mapRef = useRef<MapView>(null);

  const fadeCard = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeCard, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, []);

  const obtenerUbicacion = async () => {
    setObteniendoUbicacion(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Activa la ubicación para registrar tu refugio en el mapa.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude: lat, longitude: lng } = loc.coords;
      setLatitude(lat);
      setLongitude(lng);
      const newRegion = { ...region, latitude: lat, longitude: lng };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 600);
      geocode(lat, lng);
    } catch {
      Alert.alert("Error", "No se pudo obtener la ubicación.");
    } finally {
      setObteniendoUbicacion(false);
    }
  };

  const geocode = async (lat: number, lng: number) => {
    try {
      const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (geocode.length > 0) {
        const addr = geocode[0];
        const parts = [addr.street, addr.streetNumber, addr.city, addr.region, addr.country].filter(Boolean);
        setDireccion(parts.join(", "));
      }
    } catch {}
  };

  const onMapPress = async (e: any) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
    setLatitude(lat);
    setLongitude(lng);
    geocode(lat, lng);
  };

  const handleGuardar = () => {
    if (!nombre.trim()) {
      Alert.alert("Campo requerido", "El nombre del refugio es obligatorio.");
      return;
    }
    updateProfile(
      {
        username: nombre.trim(),
        role: "refugio",
        nit: nit.trim() || null,
        phone: telefono.trim() || null,
        address: direccion.trim() || null,
        shelterDescription: descripcion.trim() || null,
        latitude,
        longitude,
      },
      {
        onSuccess: () => {
          Alert.alert("Guardado", "Los datos del refugio se han guardado correctamente.");
          router.back();
        },
        onError: (err) => {
          Alert.alert("Error", err?.message ?? "No se pudieron guardar los datos");
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "android" ? 24 : 0}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.headerBg}>
            <View style={styles.deco1} />
            <View style={styles.deco2} />
          </View>

          <View style={styles.navBar}>
            <Pressable style={styles.backBtn} onPress={() => router.back()}>
              <Feather name="arrow-left" size={22} color="#fff" />
            </Pressable>
            <Text style={styles.navTitle}>Registrar refugio</Text>
            <View style={{ width: 40 }} />
          </View>

          <Animated.View style={[styles.card, { opacity: fadeCard, transform: [{ translateY: slideUp }] }]}>
            {updateProfileError && (
              <View style={styles.errorWrap}>
                <Feather name="alert-circle" size={14} color="#e05050" />
                <Text style={styles.errorText}>{updateProfileError}</Text>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nombre del refugio</Text>
              <View style={styles.inputShell}>
                <View style={styles.iconBg}><Feather name="home" size={16} color="#4da8c4" /></View>
                <TextInput style={styles.input} placeholder="Ej. Refugio Huellas Felices" placeholderTextColor="#a4c6d4" value={nombre} onChangeText={setNombre} autoCapitalize="words" />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>NIT</Text>
              <View style={styles.inputShell}>
                <View style={styles.iconBg}><Feather name="file-text" size={16} color="#4da8c4" /></View>
                <TextInput style={styles.input} placeholder="123456789-1" placeholderTextColor="#a4c6d4" value={nit} onChangeText={setNit} keyboardType="default" />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <View style={styles.inputShell}>
                <View style={styles.iconBg}><Feather name="phone" size={16} color="#4da8c4" /></View>
                <TextInput style={styles.input} placeholder="0991234567" placeholderTextColor="#a4c6d4" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Dirección</Text>
              <View style={styles.inputShell}>
                <View style={styles.iconBg}><Feather name="map-pin" size={16} color="#4da8c4" /></View>
                <TextInput style={styles.input} placeholder="Calle principal, ciudad" placeholderTextColor="#a4c6d4" value={direccion} onChangeText={setDireccion} autoCapitalize="words" />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Descripción</Text>
              <View style={[styles.inputShell, { minHeight: 80, alignItems: "flex-start" }]}>
                <View style={[styles.iconBg, { marginTop: 10 }]}><Feather name="info" size={16} color="#4da8c4" /></View>
                <TextInput style={[styles.input, { height: 80 }]} placeholder="Describe tu refugio, misión, servicios..." placeholderTextColor="#a4c6d4" value={descripcion} onChangeText={setDescripcion} multiline numberOfLines={4} />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Ubicación en el mapa</Text>
              <Text style={styles.hint}>Toca el mapa para colocar el marcador o usa el botón para obtener tu ubicación actual</Text>

              <View style={styles.mapContainer}>
                <MapView
                  ref={mapRef}
                  style={styles.map}
                  initialRegion={region}
                  onPress={onMapPress}
                  showsUserLocation
                  showsMyLocationButton={false}
                >
                  {latitude && longitude && (
                    <Marker
                      coordinate={{ latitude, longitude }}
                      draggable
                      onDragEnd={onMapPress}
                      title="Tu refugio"
                      description="Arrastra para ajustar la ubicación"
                    />
                  )}
                </MapView>
              </View>

              {latitude && longitude ? (
                <View style={styles.coordsBox}>
                  <Feather name="navigation" size={14} color="#266e84" />
                  <Text style={styles.coordsText}>
                    {latitude.toFixed(5)}, {longitude.toFixed(5)}
                  </Text>
                </View>
              ) : null}

              <View style={styles.mapActions}>
                <Pressable
                  style={[styles.mapBtn, obteniendoUbicacion && styles.btnDisabled]}
                  onPress={obtenerUbicacion}
                  disabled={obteniendoUbicacion}
                >
                  {obteniendoUbicacion ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Feather name="crosshair" size={15} color="#fff" />
                      <Text style={styles.mapBtnText}>Mi ubicación</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed, (isUpdateProfileLoading || !nombre.trim()) && styles.btnDisabled]}
              onPress={handleGuardar}
              disabled={isUpdateProfileLoading || !nombre.trim()}
            >
              {isUpdateProfileLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.btnInner}>
                  <Feather name="check" size={18} color="#fff" />
                  <Text style={styles.btnText}>Guardar refugio</Text>
                </View>
              )}
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#4da8c4" },
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  headerBg: { position: "absolute", top: 0, left: 0, right: 0, height: 200, backgroundColor: "#4da8c4", borderBottomLeftRadius: 36, borderBottomRightRadius: 36, overflow: "hidden" },
  deco1: { position: "absolute", top: -60, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.08)" },
  deco2: { position: "absolute", top: 30, left: -60, width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(255,255,255,0.06)" },
  navBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, zIndex: 2 },
  backBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  navTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  card: { backgroundColor: "#fff", borderTopLeftRadius: 34, borderTopRightRadius: 34, marginTop: 16, paddingTop: 28, paddingHorizontal: 22, paddingBottom: 28, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 20, shadowOffset: { width: 0, height: -6 }, elevation: 8 },
  errorWrap: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#fef0f0", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14, borderWidth: 1, borderColor: "#fdd" },
  errorText: { color: "#e05050", fontSize: 12, fontWeight: "600", flex: 1 },
  fieldGroup: { marginBottom: 18 },
  label: { fontSize: 12, fontWeight: "800", color: "#3d8fa8", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.8 },
  inputShell: { minHeight: 52, borderRadius: 14, backgroundColor: "#f4f9fb", borderWidth: 1.5, borderColor: "#e4eef2", flexDirection: "row", alignItems: "center", paddingHorizontal: 5 },
  iconBg: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(77,168,196,0.1)", alignItems: "center", justifyContent: "center", marginRight: 8 },
  input: { flex: 1, height: 52, color: "#1a3a4a", fontSize: 15, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#e4eef2", marginVertical: 10 },
  hint: { color: "#8bb8c8", fontSize: 11, fontWeight: "500", marginBottom: 10, lineHeight: 16 },
  mapContainer: { height: 220, borderRadius: 16, overflow: "hidden", marginBottom: 10, borderWidth: 1.5, borderColor: "#e4eef2" },
  map: { width: "100%", height: "100%" },
  coordsBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#edf8fb", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, borderWidth: 1, borderColor: "#d0eaf0" },
  coordsText: { color: "#266e84", fontSize: 13, fontWeight: "700" },
  mapActions: { flexDirection: "row", gap: 10 },
  mapBtn: { flex: 1, minHeight: 44, borderRadius: 12, backgroundColor: "#4da8c4", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 16 },
  mapBtnText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  btnDisabled: { opacity: 0.5 },
  saveBtn: { minHeight: 52, borderRadius: 16, backgroundColor: "#266e84", alignItems: "center", justifyContent: "center", marginTop: 6, shadowColor: "#1a5060", shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  saveBtnPressed: { transform: [{ scale: 0.97 }] },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
