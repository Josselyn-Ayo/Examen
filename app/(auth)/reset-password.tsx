import { supabase } from "@shared/infrastructure/supabase/client";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
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
import { AuthBackground } from "../../components/auth-background";

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async () => {
    if (!passwordsMatch) return;
    setLoading(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.replace("/(app)"), 2000);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AuthBackground />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandIcon}>✦</Text>
            </View>
            <Text style={styles.brandText}>ADOPCIONES</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.headerBlock}>
              <Text style={styles.title}>Nueva contraseña</Text>
              <Text style={styles.subtitle}>
                Ingresa tu nueva contraseña para restablecer tu cuenta.
              </Text>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {success ? (
              <View style={styles.successCard}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.successTitle}>¡Contraseña actualizada!</Text>
                <Text style={styles.successText}>
                  Redirigiendo a la aplicación...
                </Text>
              </View>
            ) : (
              <View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Nueva contraseña</Text>
                  <View style={styles.inputShell}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Mínimo 8 caracteres"
                      placeholderTextColor="#8b93a7"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      autoCapitalize="none"
                      textContentType="newPassword"
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Confirmar contraseña</Text>
                  <View
                    style={[
                      styles.inputShell,
                      !passwordsMatch && confirmPassword.length > 0 && styles.inputError,
                    ]}
                  >
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Repite tu contraseña"
                      placeholderTextColor="#8b93a7"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      autoCapitalize="none"
                    />
                  </View>
                  {!passwordsMatch && confirmPassword.length > 0 ? (
                    <Text style={styles.helperText}>Las contraseñas no coinciden</Text>
                  ) : null}
                </View>
              </View>
            )}

            {!success && (
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  pressed && !loading ? styles.buttonPressed : null,
                  (loading || !passwordsMatch) ? styles.buttonDisabled : null,
                ]}
                onPress={handleSubmit}
                disabled={loading || !passwordsMatch}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>Actualizar contraseña</Text>
                    <Text style={styles.buttonArrow}>➜</Text>
                  </View>
                )}
              </Pressable>
            )}

            <View style={styles.footer}>
              <Link href="/(auth)/login" style={styles.link}>
                Volver al login
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#09000f",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  brandRow: {
    alignItems: "center",
    marginBottom: 16,
  },
  brandBadge: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "rgba(246, 169, 79, 0.82)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  brandIcon: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  brandText: {
    marginTop: 10,
    color: "#ffe4c0",
    fontSize: 14,
    letterSpacing: 4,
    fontWeight: "700",
  },
  card: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    backgroundColor: "rgba(20, 27, 34, 0.82)",
    borderRadius: 34,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 207, 160, 0.16)",
    shadowColor: "#000",
    shadowOpacity: 0.38,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 },
    elevation: 6,
  },
  headerBlock: {
    marginBottom: 22,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    color: "#fff8ef",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255, 248, 239, 0.74)",
    textAlign: "center",
  },
  error: {
    color: "#ffe0e0",
    backgroundColor: "rgba(191, 72, 72, 0.18)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    fontSize: 14,
    fontWeight: "600",
  },
  successCard: {
    alignItems: "center",
    paddingVertical: 20,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 12,
    color: "#059669",
    fontWeight: "700",
  },
  successTitle: {
    color: "#059669",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  successText: {
    color: "rgba(255, 248, 239, 0.72)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: "#fff8ef",
    marginBottom: 8,
  },
  inputShell: {
    minHeight: 56,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.05)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: "#e05050",
  },
  inputIcon: {
    width: 22,
    textAlign: "center",
    marginRight: 10,
    color: "rgba(255, 248, 239, 0.65)",
    fontSize: 16,
    fontWeight: "700",
  },
  input: {
    flex: 1,
    height: 56,
    color: "#fff",
    fontSize: 15,
  },
  helperText: {
    color: "#e05050",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
    marginLeft: 4,
  },
  button: {
    marginTop: 6,
    minHeight: 56,
    backgroundColor: "#f6a94f",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    shadowColor: "#000",
    shadowOpacity: 0.34,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
  },
  buttonArrow: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  footer: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  link: {
    color: "#ffd08a",
    fontSize: 14,
    fontWeight: "800",
  },
});
