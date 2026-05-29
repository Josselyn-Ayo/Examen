import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

import { SafeAreaView } from "react-native-safe-area-context";

const buildAvatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/thumbs/png?seed=${encodeURIComponent(seed)}`;

export default function EditProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const { updateProfile, isUpdateProfileLoading, updateProfileError } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState(user?.username ?? "");
  const [saved, setSaved] = useState(false);

  const fadeCard = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeCard, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(cardSlide, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSave = () => {
    if (!username.trim()) return;
    setSaved(false);
    updateProfile({ username: username.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const profileSource = user?.avatarUrl
    ? { uri: user.avatarUrl }
    : { uri: buildAvatarUrl(user?.username ?? "user") };

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
            <Text style={styles.navTitle}>Editar perfil</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.avatarSection}>
            <View style={styles.avatarRing}>
              <Image source={profileSource} style={styles.avatar} />
            </View>
            <Pressable style={styles.cameraBtn}>
              <Feather name="camera" size={16} color="#fff" />
            </Pressable>
          </View>

          <Animated.View style={[styles.card, { opacity: fadeCard, transform: [{ translateY: cardSlide }] }]}>
            {updateProfileError ? (
              <View style={styles.errorWrap}>
                <Feather name="alert-circle" size={14} color="#e05050" />
                <Text style={styles.errorText}>{updateProfileError}</Text>
              </View>
            ) : null}

            {saved && (
              <View style={styles.successWrap}>
                <Feather name="check-circle" size={14} color="#2eaa6e" />
                <Text style={styles.successText}>Perfil actualizado correctamente</Text>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nombre de usuario</Text>
              <View style={styles.inputShell}>
                <View style={styles.iconBg}>
                  <Feather name="user" size={16} color="#4da8c4" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Tu nombre"
                  placeholderTextColor="#a4c6d4"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <View style={[styles.inputShell, { opacity: 0.6 }]}>
                <View style={styles.iconBg}>
                  <Feather name="mail" size={16} color="#4da8c4" />
                </View>
                <TextInput
                  style={[styles.input, { color: "#8bb8c8" }]}
                  value={user?.email ?? ""}
                  editable={false}
                />
                <View style={styles.lockBadge}>
                  <Feather name="lock" size={12} color="#8bb8c8" />
                </View>
              </View>
              <Text style={styles.hint}>El correo no se puede cambiar</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Rol</Text>
              <View style={[styles.inputShell, { opacity: 0.6 }]}>
                <View style={styles.iconBg}>
                  <Feather name={user?.role === "refugio" ? "home" : "heart"} size={16} color="#4da8c4" />
                </View>
                <TextInput
                  style={[styles.input, { color: "#8bb8c8" }]}
                  value={user?.role === "refugio" ? "Refugio" : "Adoptante"}
                  editable={false}
                />
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed, isUpdateProfileLoading && styles.btnDisabled]}
              onPress={handleSave}
              disabled={isUpdateProfileLoading || !username.trim()}
            >
              {isUpdateProfileLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.btnInner}>
                  <Feather name="check" size={18} color="#fff" />
                  <Text style={styles.btnText}>Guardar cambios</Text>
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
  headerBg: { position: "absolute", top: 0, left: 0, right: 0, height: 280, backgroundColor: "#4da8c4", borderBottomLeftRadius: 36, borderBottomRightRadius: 36, overflow: "hidden" },
  deco1: { position: "absolute", top: -60, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.08)" },
  deco2: { position: "absolute", top: 30, left: -60, width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(255,255,255,0.06)" },
  navBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, zIndex: 2 },
  backBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  navTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  avatarSection: { alignItems: "center", marginTop: 10, marginBottom: -16, zIndex: 2 },
  avatarRing: { width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.2)", padding: 3, overflow: "hidden" },
  avatar: { width: "100%", height: "100%", borderRadius: 50 },
  cameraBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#266e84", alignItems: "center", justifyContent: "center", marginTop: -24, marginLeft: 60, borderWidth: 2, borderColor: "#fff" },
  card: { backgroundColor: "#fff", borderTopLeftRadius: 34, borderTopRightRadius: 34, marginTop: 24, paddingTop: 28, paddingHorizontal: 22, paddingBottom: 28, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 20, shadowOffset: { width: 0, height: -6 }, elevation: 8 },
  errorWrap: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#fef0f0", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14, borderWidth: 1, borderColor: "#fdd" },
  errorText: { color: "#e05050", fontSize: 12, fontWeight: "600", flex: 1 },
  successWrap: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#edfbf3", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14, borderWidth: 1, borderColor: "#c0f0d6" },
  successText: { color: "#2eaa6e", fontSize: 12, fontWeight: "700", flex: 1 },
  fieldGroup: { marginBottom: 18 },
  label: { fontSize: 12, fontWeight: "800", color: "#3d8fa8", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.8 },
  inputShell: { minHeight: 52, borderRadius: 14, backgroundColor: "#f4f9fb", borderWidth: 1.5, borderColor: "#e4eef2", flexDirection: "row", alignItems: "center", paddingHorizontal: 5 },
  iconBg: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(77,168,196,0.1)", alignItems: "center", justifyContent: "center", marginRight: 8 },
  input: { flex: 1, height: 52, color: "#1a3a4a", fontSize: 15, fontWeight: "600" },
  lockBadge: { width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(77,168,196,0.08)", alignItems: "center", justifyContent: "center", marginRight: 4 },
  hint: { fontSize: 11, color: "#8bb8c8", fontWeight: "500", marginTop: 5 },
  saveBtn: { minHeight: 52, borderRadius: 16, backgroundColor: "#266e84", alignItems: "center", justifyContent: "center", marginTop: 6, shadowColor: "#1a5060", shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  saveBtnPressed: { transform: [{ scale: 0.97 }] },
  btnDisabled: { opacity: 0.5 },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
