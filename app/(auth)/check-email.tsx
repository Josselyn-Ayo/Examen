import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { Link } from "expo-router";
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

export default function CheckEmailScreen() {
  const [email, setEmail] = useState("");
  const { resendConfirmation, isResendLoading, resendError, resendSuccess } = useAuth();

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
              <Text style={styles.icon}>📧</Text>
              <Text style={styles.title}>Verifica tu email</Text>
              <Text style={styles.subtitle}>
                Te hemos enviado un enlace de confirmación. Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
              </Text>
            </View>

            {resendSuccess && (
              <Text style={styles.success}>¡Enlace reenviado! Revisa tu email.</Text>
            )}

            {resendError ? <Text style={styles.error}>{resendError}</Text> : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>¿No recibiste el email?</Text>
              <View style={styles.inputShell}>
                <Text style={styles.inputIcon}>@</Text>
                <TextInput
                  style={styles.input}
                  placeholder="tu@email.com"
                  placeholderTextColor="#8b93a7"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  textContentType="emailAddress"
                />
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && !isResendLoading ? styles.buttonPressed : null,
                isResendLoading ? styles.buttonDisabled : null,
              ]}
              onPress={() => resendConfirmation(email)}
              disabled={isResendLoading || !email}
            >
              {isResendLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Reenviar enlace</Text>
                  <Text style={styles.buttonArrow}>➜</Text>
                </View>
              )}
            </Pressable>

            <View style={styles.footer}>
              <Link href="/(auth)/login" style={styles.link}>
                Ir al login
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
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
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
  success: {
    color: "#bbf7d0",
    backgroundColor: "rgba(5, 150, 105, 0.18)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    fontSize: 14,
    fontWeight: "600",
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