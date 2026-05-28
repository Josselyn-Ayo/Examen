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
    View
} from "react-native";
import { AuthBackground } from "../../components/auth-background";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle, isLoading, error } = useAuth();

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
              <Text style={styles.title}>Encuentra tu nuevo compañero</Text>
              <Text style={styles.subtitle}>
                Inicia sesión para seguir el proceso de adopción y cuidar a tu futuro peludito.
              </Text>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputShell}>
                <Text style={styles.inputIcon}>@</Text>
                <TextInput
                  style={styles.input}
                  placeholder="alex@example.com"
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

            <View style={styles.fieldGroup}>
              <View style={styles.passwordRow}>
                <Text style={styles.label}>Password</Text>
                <Link href="/(auth)/forgot-password" style={styles.forgotLink}>
                  Forgot Password?
                </Link>
              </View>
              <View style={styles.inputShell}>
                <Text style={styles.inputIcon}>⌂</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#8b93a7"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  textContentType="password"
                />
                <Pressable
                  onPress={() => setShowPassword((current) => !current)}
                  hitSlop={10}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeText}>{showPassword ? "◉" : "◌"}</Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && !isLoading ? styles.buttonPressed : null,
                isLoading ? styles.buttonDisabled : null,
              ]}
              onPress={() => login({ email, password })}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Ingresar</Text>
                  <Text style={styles.buttonArrow}>➜</Text>
                </View>
              )}
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o continúa con</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.googleButton,
                pressed && !isLoading ? styles.googleButtonPressed : null,
                isLoading ? styles.buttonDisabled : null,
              ]}
              onPress={() => loginWithGoogle()}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#111c2d" />
              ) : (
                <View style={styles.googleButtonContent}>
                  <Text style={styles.googleIcon}>G</Text>
                  <Text style={styles.googleButtonText}>Continuar con Google</Text>
                </View>
              )}
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account? </Text>
              <Link href="/(auth)/register" style={styles.link}>
                Register
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
  passwordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgotLink: {
    color: "#f7c98d",
    fontSize: 12,
    fontWeight: "700",
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
  eyeButton: {
    paddingLeft: 8,
    paddingVertical: 6,
  },
  eyeText: {
    fontSize: 16,
    color: "rgba(255, 248, 239, 0.65)",
    fontWeight: "700",
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
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255, 248, 239, 0.64)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  googleButton: {
    minHeight: 56,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  googleButtonPressed: {
    backgroundColor: "rgba(255,255,255,0.1)",
    transform: [{ scale: 0.99 }],
  },
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "rgba(246, 169, 79, 0.18)",
    color: "#fff8ef",
    textAlign: "center",
    textAlignVertical: "center",
    fontWeight: "800",
    lineHeight: 24,
  },
  googleButtonText: {
    color: "#fff8ef",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },
  footer: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  footerText: {
    color: "rgba(255, 248, 239, 0.72)",
    fontSize: 14,
  },
  link: {
    color: "#ffd08a",
    fontSize: 14,
    fontWeight: "800",
  },
});
