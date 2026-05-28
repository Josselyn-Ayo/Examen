import type { UserRole } from "@features/auth/domain/entities/User";
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

export default function RegisterScreen() {
  const [nombre, setNombre] = useState("");
  const [nit, setNit] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("adoptante");
  const [accepted, setAccepted] = useState(false);
  const { register, isLoading, error } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <AuthBackground />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandIcon}>✦</Text>
            </View>
            <Text style={styles.brandText}>ADOPCIONES</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.headerBlock}>
              <Text style={styles.title}>Crea tu cuenta para adoptar</Text>
              <Text style={styles.subtitle}>
                Regístrate como adoptante o refugio para conectar perritos con un nuevo hogar.
              </Text>
            </View>

            <View style={styles.roleBlock}>
              <Text style={styles.label}>Tipo de cuenta</Text>
              <View style={styles.roleRow}>
                <Pressable
                  style={[styles.roleCard, role === "adoptante" && styles.roleCardActive]}
                  onPress={() => setRole("adoptante")}
                >
                  <Text style={[styles.roleTitle, role === "adoptante" && styles.roleTitleActive]}>
                    Adoptante
                  </Text>
                  <Text style={styles.roleSubtitle}>Adopta mascotas y gestiona el proceso.</Text>
                </Pressable>
                <Pressable
                  style={[styles.roleCard, role === "refugio" && styles.roleCardActive]}
                  onPress={() => setRole("refugio")}
                >
                  <Text style={[styles.roleTitle, role === "refugio" && styles.roleTitleActive]}>
                    Refugio
                  </Text>
                  <Text style={styles.roleSubtitle}>Publica mascotas en adopción.</Text>
                </Pressable>
              </View>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nombre del Refugio / Nombre</Text>
              <View style={styles.inputShell}>
                <Text style={styles.inputIcon}>🏷️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Refugio Huellas Felices"
                  placeholderTextColor="#8b93a7"
                  value={nombre}
                  onChangeText={setNombre}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>NIT / Identificación</Text>
              <View style={styles.inputShell}>
                <Text style={styles.inputIcon}>🧾</Text>
                <TextInput
                  style={styles.input}
                  placeholder="900.123.456-7"
                  placeholderTextColor="#8b93a7"
                  value={nit}
                  onChangeText={setNit}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Dirección</Text>
              <View style={styles.inputShell}>
                <Text style={styles.inputIcon}>📍</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Calle 123 #45-67, Ciudad"
                  placeholderTextColor="#8b93a7"
                  value={direccion}
                  onChangeText={setDireccion}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <View style={styles.inputShell}>
                <Text style={styles.inputIcon}>📞</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+57 300 000 0000"
                  placeholderTextColor="#8b93a7"
                  value={telefono}
                  onChangeText={setTelefono}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <View style={styles.inputShell}>
                <Text style={styles.inputIcon}>@</Text>
                <TextInput
                  style={styles.input}
                  placeholder="contacto@refugio.com"
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
                <Text style={styles.label}>Contraseña</Text>
              </View>
              <View style={styles.inputShell}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#8b93a7"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  textContentType="newPassword"
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

            <View style={{ marginVertical: 8, flexDirection: "row", alignItems: "center" }}>
              <Pressable
                onPress={() => setAccepted((v) => !v)}
                style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", marginRight: 10, alignItems: "center", justifyContent: "center", backgroundColor: accepted ? "#f6a94f" : "transparent" }}
              >
                {accepted ? <Text style={{ color: "#fff", fontSize: 14 }}>✓</Text> : null}
              </Pressable>
              <Text style={{ color: "rgba(255,248,239,0.86)", flex: 1 }}>
                Acepto los <Text style={{ color: "#ffd08a", fontWeight: "800" }}>Términos de Servicio</Text> y la <Text style={{ color: "#ffd08a", fontWeight: "800" }}>Política de Privacidad</Text>.
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && !isLoading ? styles.buttonPressed : null,
                isLoading || !accepted ? styles.buttonDisabled : null,
              ]}
              onPress={() => register({ nombre, nit, direccion, telefono, email, password, role })}
              disabled={isLoading || !accepted}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Crear cuenta</Text>
                  <Text style={styles.buttonArrow}>➜</Text>
                </View>
              )}
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/login" style={styles.link}>
                Login
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
  roleBlock: {
    marginBottom: 18,
  },
  roleRow: {
    flexDirection: "row",
    gap: 10,
  },
  roleCard: {
    flex: 1,
    minHeight: 86,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 14,
  },
  roleCardActive: {
    borderColor: "#f6a94f",
    backgroundColor: "rgba(246, 169, 79, 0.16)",
  },
  roleTitle: {
    color: "#fff8ef",
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 6,
  },
  roleTitleActive: {
    color: "#ffffff",
  },
  roleSubtitle: {
    color: "rgba(255, 248, 239, 0.72)",
    fontSize: 12,
    lineHeight: 16,
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
