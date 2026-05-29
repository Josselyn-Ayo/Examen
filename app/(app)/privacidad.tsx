import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
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
import { supabase } from "@shared/infrastructure/supabase/client";

import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacidadScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState(false);

  const fadeCard = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeCard, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(cardSlide, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, []);

  const handleChangePassword = async () => {
    setLocalError("");
    setSuccess(false);

    if (!currentPassword.trim()) {
      setLocalError("Ingresa tu contraseña actual.");
      return;
    }
    if (newPassword.length < 8) {
      setLocalError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (currentPassword === newPassword) {
      setLocalError("La nueva contraseña debe ser diferente a la actual.");
      return;
    }

    setLoading(true);
    try {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email ?? "",
        password: currentPassword,
      });
      if (reauthError) {
        setLocalError("La contraseña actual es incorrecta.");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        setLocalError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setLocalError("Ocurrió un error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.navTitle}>Privacidad y seguridad</Text>
            <View style={{ width: 40 }} />
          </View>

          <Animated.View style={[styles.card, { opacity: fadeCard, transform: [{ translateY: cardSlide }] }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Feather name="lock" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Cambiar contraseña</Text>
                <Text style={styles.sectionSub}>Actualiza tu contraseña para mantener tu cuenta segura</Text>
              </View>
            </View>

            {localError ? (
              <View style={styles.errorWrap}>
                <Feather name="alert-circle" size={14} color="#e05050" />
                <Text style={styles.errorText}>{localError}</Text>
              </View>
            ) : null}

            {success && (
              <View style={styles.successWrap}>
                <Feather name="check-circle" size={14} color="#2eaa6e" />
                <Text style={styles.successText}>Contraseña actualizada correctamente</Text>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Contraseña actual</Text>
              <View style={styles.inputShell}>
                <View style={styles.iconBg}>
                  <Feather name="lock" size={16} color="#4da8c4" />
                </View>
                <TextInput style={styles.input} placeholder="Ingresa tu contraseña actual" placeholderTextColor="#a4c6d4" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry={!showCurrent} autoCapitalize="none" />
                <Pressable onPress={() => setShowCurrent(c => !c)} hitSlop={10} style={styles.eyeBtn}>
                  <Ionicons name={showCurrent ? "eye-off" : "eye"} size={20} color="#4da8c4" />
                </Pressable>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nueva contraseña</Text>
              <View style={styles.inputShell}>
                <View style={styles.iconBg}>
                  <Feather name="key" size={16} color="#4da8c4" />
                </View>
                <TextInput style={styles.input} placeholder="Mínimo 8 caracteres" placeholderTextColor="#a4c6d4" value={newPassword} onChangeText={setNewPassword} secureTextEntry={!showNew} autoCapitalize="none" />
                <Pressable onPress={() => setShowNew(c => !c)} hitSlop={10} style={styles.eyeBtn}>
                  <Ionicons name={showNew ? "eye-off" : "eye"} size={20} color="#4da8c4" />
                </Pressable>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirmar nueva contraseña</Text>
              <View style={[styles.inputShell, confirmPassword.length > 0 && newPassword !== confirmPassword && styles.inputError]}>
                <View style={styles.iconBg}>
                  <Feather name="key" size={16} color="#4da8c4" />
                </View>
                <TextInput style={styles.input} placeholder="Repite tu nueva contraseña" placeholderTextColor="#a4c6d4" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showNew} autoCapitalize="none" />
              </View>
              {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <View style={styles.helperWrap}>
                  <Feather name="x-circle" size={12} color="#e05050" />
                  <Text style={styles.helperText}>Las contraseñas no coinciden</Text>
                </View>
              )}
            </View>

            <Pressable style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed, loading && styles.btnDisabled]} onPress={handleChangePassword} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <View style={styles.btnInner}>
                  <Feather name="shield" size={18} color="#fff" />
                  <Text style={styles.btnText}>Actualizar contraseña</Text>
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
  headerBg: { position: "absolute", top: 0, left: 0, right: 0, height: 220, backgroundColor: "#4da8c4", borderBottomLeftRadius: 36, borderBottomRightRadius: 36, overflow: "hidden" },
  deco1: { position: "absolute", top: -60, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.08)" },
  deco2: { position: "absolute", top: 30, left: -60, width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(255,255,255,0.06)" },
  navBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16, zIndex: 2 },
  backBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  navTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  card: { backgroundColor: "#fff", borderTopLeftRadius: 34, borderTopRightRadius: 34, marginTop: 10, paddingTop: 28, paddingHorizontal: 22, paddingBottom: 28, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 20, shadowOffset: { width: 0, height: -6 }, elevation: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 22 },
  sectionIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: "#266e84", alignItems: "center", justifyContent: "center", shadowColor: "#266e84", shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  sectionTitle: { fontSize: 20, fontWeight: "900", color: "#1a3a4a", letterSpacing: -0.3 },
  sectionSub: { fontSize: 12, color: "#7aa8ba", fontWeight: "500", marginTop: 3 },
  errorWrap: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#fef0f0", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14, borderWidth: 1, borderColor: "#fdd" },
  errorText: { color: "#e05050", fontSize: 12, fontWeight: "600", flex: 1 },
  successWrap: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#edfbf3", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14, borderWidth: 1, borderColor: "#c0f0d6" },
  successText: { color: "#2eaa6e", fontSize: 12, fontWeight: "700", flex: 1 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "800", color: "#3d8fa8", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.8 },
  inputShell: { minHeight: 52, borderRadius: 14, backgroundColor: "#f4f9fb", borderWidth: 1.5, borderColor: "#e4eef2", flexDirection: "row", alignItems: "center", paddingHorizontal: 5 },
  inputError: { borderColor: "#f0a0a0", backgroundColor: "#fef6f6" },
  iconBg: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(77,168,196,0.1)", alignItems: "center", justifyContent: "center", marginRight: 8 },
  input: { flex: 1, height: 52, color: "#1a3a4a", fontSize: 15, fontWeight: "600" },
  eyeBtn: { padding: 8 },
  helperWrap: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 },
  helperText: { color: "#e05050", fontSize: 11, fontWeight: "600" },
  saveBtn: { minHeight: 52, borderRadius: 16, backgroundColor: "#266e84", alignItems: "center", justifyContent: "center", marginTop: 6, shadowColor: "#1a5060", shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  saveBtnPressed: { transform: [{ scale: 0.97 }] },
  btnDisabled: { opacity: 0.5 },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
