import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { Link } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Easing,
    Image,
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

const { width: SCREEN_W } = Dimensions.get("window");

export default function RegisterScreen() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"adoptante" | "refugio">("adoptante");
  const [accepted, setAccepted] = useState(false);
  const { register, isLoading, error } = useAuth();

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const fadeTop = useRef(new Animated.Value(0)).current;
  const slideDog = useRef(new Animated.Value(50)).current;
  const fadeCard = useRef(new Animated.Value(0)).current;
  const cardUp = useRef(new Animated.Value(40)).current;
  const floatDog = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeTop, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(slideDog, { toValue: 0, duration: 900, delay: 150, easing: Easing.out(Easing.back(1.3)), useNativeDriver: true }),
      Animated.timing(fadeCard, { toValue: 1, duration: 700, delay: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(cardUp, { toValue: 0, duration: 700, delay: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    Animated.loop(Animated.sequence([
      Animated.timing(floatDog, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(floatDog, { toValue: 0, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(breathe, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(breathe, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
  }, []);

  const dogFloatY = floatDog.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const breatheScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });

  const handleRegister = () => {
    if (!passwordsMatch) return;
    register({ email, password, username: nombre || email.split("@")[0], role });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "android" ? 24 : 0}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <View style={styles.topSection}>
            <Animated.View style={[styles.deco1, { transform: [{ scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }] }]} />
            <View style={styles.deco2} />
            <View style={styles.deco3} />
            <View style={styles.deco4} />
            <View style={styles.deco5} />

            <Animated.View style={[styles.logoBlock, { opacity: fadeTop }]}>
              <View style={styles.logoIcon}>
                <MaterialCommunityIcons name="paw" size={26} color="#fff" />
              </View>
              <View>
                <Text style={styles.brandText}>PETADOPT</Text>
                <View style={styles.brandLine} />
              </View>
            </Animated.View>

            <Animated.View style={{ opacity: fadeTop }}>
              <Text style={styles.subtitle}>Crea tu cuenta y encuentra a tu amigo peludo</Text>
            </Animated.View>

            <Animated.View style={[styles.dogWrap, { transform: [{ translateY: Animated.add(slideDog, dogFloatY) }, { scale: breatheScale }] }]}>
              <View style={styles.dogShadow} />
              <Image source={require("../../assets/images/perrito2.png")} style={styles.dogImage} resizeMode="contain" />
            </Animated.View>
          </View>

          <Animated.View style={[styles.card, { opacity: fadeCard, transform: [{ translateY: cardUp }] }]}>
            <View style={styles.cardDeco1} />
            <View style={styles.cardDeco2} />

            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Feather name="user-plus" size={18} color="#fff" />
              </View>
              <View>
                <Text style={styles.cardTitle}>{role === "refugio" ? "Une tu refugio a nuestra red" : "Regístrate"}</Text>
                <Text style={styles.cardSub}>{role === "refugio" ? "Ayúdanos a conectar más patitas con sus hogares definitivos. Tu labor es fundamental." : "Completa tus datos para comenzar"}</Text>
              </View>
            </View>

            {error ? (
              <View style={styles.errorWrap}>
                <Feather name="alert-circle" size={16} color="#e05050" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.roleSection}>
              <Pressable style={[styles.roleCard, role === "adoptante" && styles.roleActive]} onPress={() => setRole("adoptante")}>
                <View style={[styles.roleCircle, role === "adoptante" && styles.roleCircleActive]}>
                  <Feather name="heart" size={20} color={role === "adoptante" ? "#fff" : "#4da8c4"} />
                </View>
                <Text style={[styles.roleLabel, role === "adoptante" && styles.roleLabelActive]}>Adoptante</Text>
                <Text style={styles.roleHint}>Quiero adoptar</Text>
              </Pressable>
              <Pressable style={[styles.roleCard, role === "refugio" && styles.roleActive]} onPress={() => setRole("refugio")}>
                <View style={[styles.roleCircle, role === "refugio" && styles.roleCircleActive]}>
                  <Feather name="home" size={20} color={role === "refugio" ? "#fff" : "#4da8c4"} />
                </View>
                <Text style={[styles.roleLabel, role === "refugio" && styles.roleLabelActive]}>Refugio</Text>
                <Text style={styles.roleHint}>Publico mascotas</Text>
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{role === "refugio" ? "Nombre del Refugio" : "Nombre"}</Text>
              <View style={styles.inputShell}>
                <View style={styles.iconBg}><Feather name="user" size={16} color="#4da8c4" /></View>
                <TextInput style={styles.input} placeholder={role === "refugio" ? "Ej. Refugio Huellas Felices" : "Refugio Huellas Felices"} placeholderTextColor="#a4c6d4" value={nombre} onChangeText={setNombre} autoCapitalize="words" />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <View style={styles.inputShell}>
                <View style={styles.iconBg}><Feather name="mail" size={16} color="#4da8c4" /></View>
                <TextInput style={styles.input} placeholder={role === "refugio" ? "contacto@refugio.com" : "tu@email.com"} placeholderTextColor="#a4c6d4" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoCorrect={false} textContentType="emailAddress" />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputShell}>
                <View style={styles.iconBg}><Feather name="lock" size={16} color="#4da8c4" /></View>
                <TextInput style={styles.input} placeholder="Mínimo 8 caracteres" placeholderTextColor="#a4c6d4" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" textContentType="newPassword" />
                <Pressable onPress={() => setShowPassword(c => !c)} hitSlop={10} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={19} color="#4da8c4" />
                </Pressable>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <View style={[styles.inputShell, !passwordsMatch && confirmPassword.length > 0 && styles.inputError]}>
                <View style={styles.iconBg}><Feather name="lock" size={16} color="#4da8c4" /></View>
                <TextInput style={styles.input} placeholder="Repite tu contraseña" placeholderTextColor="#a4c6d4" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} autoCapitalize="none" />
              </View>
              {!passwordsMatch && confirmPassword.length > 0 ? (
                <View style={styles.helperWrap}>
                  <Feather name="x-circle" size={12} color="#e05050" />
                  <Text style={styles.helperText}>Las contraseñas no coinciden</Text>
                </View>
              ) : null}
            </View>

            <Pressable style={({ pressed }) => [styles.acceptRow, pressed && { opacity: 0.7 }]} onPress={() => setAccepted(v => !v)}>
              <View style={[styles.checkBox, accepted && styles.checkActive]}>
                {accepted ? <Feather name="check" size={12} color="#fff" /> : null}
              </View>
              {role === "refugio" ? (
                <Text style={styles.acceptText}>Acepto los Términos de Servicio y la Política de Privacidad de PetAdopt.</Text>
              ) : (
                <Text style={styles.acceptText}>Acepto los <Text style={styles.acceptLink}>Términos</Text> y <Text style={styles.acceptLink}>Política de Privacidad</Text></Text>
              )}
            </Pressable>

            <Pressable style={({ pressed }) => [styles.mainBtn, pressed && !isLoading ? styles.btnPressed : null, (isLoading || !accepted) && styles.btnDisabled]} onPress={handleRegister} disabled={isLoading || !accepted}>
              {isLoading ? <ActivityIndicator color="#fff" /> : (
                <View style={styles.btnInner}>
                  <Text style={styles.btnText}>{role === "refugio" ? "Crear refugio" : "Crear cuenta"}</Text>
                  <Feather name="arrow-right" size={18} color="#fff" />
                </View>
              )}
            </Pressable>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
              <Link href="/(auth)/login" style={styles.loginLink}>Inicia sesión</Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#4da8c4" },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  topSection: { width: SCREEN_W, paddingTop: 22, paddingBottom: 44, alignItems: "center", position: "relative", overflow: "hidden", backgroundColor: "#4da8c4" },
  deco1: { position: "absolute", top: -100, right: -70, width: 300, height: 300, borderRadius: 150, backgroundColor: "rgba(255,255,255,0.09)" },
  deco2: { position: "absolute", top: 10, left: -90, width: 240, height: 240, borderRadius: 120, backgroundColor: "rgba(255,255,255,0.06)" },
  deco3: { position: "absolute", bottom: -20, right: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(255,255,255,0.05)" },
  deco4: { position: "absolute", bottom: 30, left: 30, width: 70, height: 70, borderRadius: 35, backgroundColor: "rgba(255,255,255,0.04)" },
  deco5: { position: "absolute", top: 60, right: 10, width: 50, height: 50, borderRadius: 25, backgroundColor: "rgba(255,255,255,0.06)" },
  logoBlock: { flexDirection: "row", alignItems: "center", justifyContent: "center", zIndex: 2 },
  logoIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginRight: 10, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)" },
  brandText: { color: "#fff", fontSize: 38, lineHeight: 42, fontWeight: "900", letterSpacing: 2 },
  brandLine: { height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.3)", marginTop: 2 },
  subtitle: { marginTop: 8, color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: "600", textAlign: "center", zIndex: 2 },
  dogWrap: { width: SCREEN_W, alignItems: "center", zIndex: 2 },
  dogShadow: { width: 110, height: 12, borderRadius: 55, backgroundColor: "rgba(0,50,80,0.08)", position: "absolute", bottom: -4 },
  dogImage: { width: 240, height: 150, marginTop: 10 },
  card: { backgroundColor: "#fff", borderTopLeftRadius: 34, borderTopRightRadius: 34, marginTop: -18, paddingTop: 28, paddingHorizontal: 22, paddingBottom: 26, position: "relative", overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 22, shadowOffset: { width: 0, height: -6 }, elevation: 10 },
  cardDeco1: { position: "absolute", top: -35, right: -35, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(77,168,196,0.06)" },
  cardDeco2: { position: "absolute", bottom: -25, left: -25, width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(77,168,196,0.04)" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 22 },
  cardHeaderIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#4da8c4", alignItems: "center", justifyContent: "center", shadowColor: "#4da8c4", shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  cardTitle: { fontSize: 22, fontWeight: "900", color: "#1a3a4a", letterSpacing: -0.3 },
  cardSub: { fontSize: 12, color: "#7aa8ba", fontWeight: "600", marginTop: 2 },
  errorWrap: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fef0f0", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14, borderWidth: 1, borderColor: "#fdd" },
  errorText: { color: "#e05050", fontSize: 13, fontWeight: "600", flex: 1 },
  roleSection: { flexDirection: "row", gap: 12, marginBottom: 20 },
  roleCard: { flex: 1, borderRadius: 20, borderWidth: 2, borderColor: "#e4eef2", backgroundColor: "#f7fbfc", paddingVertical: 16, paddingHorizontal: 12, alignItems: "center" },
  roleActive: { borderColor: "#4da8c4", backgroundColor: "#edf8fb" },
  roleCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#e4eef2", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  roleCircleActive: { backgroundColor: "#4da8c4" },
  roleLabel: { fontSize: 14, fontWeight: "800", color: "#6a9bab", marginBottom: 3 },
  roleLabelActive: { color: "#1a6a84" },
  roleHint: { fontSize: 11, color: "#8bbfcc", fontWeight: "500" },
  sepRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 8 },
  sepDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4da8c4" },
  sepText: { fontSize: 11, fontWeight: "800", color: "#4da8c4", textTransform: "uppercase", letterSpacing: 1 },
  sepLine: { flex: 1, height: 1, backgroundColor: "#e4eef2" },
  fieldGroup: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: "800", color: "#3d8fa8", marginBottom: 7, letterSpacing: 0.3 },
  inputShell: { minHeight: 50, borderRadius: 14, backgroundColor: "#f4f9fb", borderWidth: 1.5, borderColor: "#e4eef2", flexDirection: "row", alignItems: "center", paddingHorizontal: 5 },
  inputError: { borderColor: "#f0a0a0", backgroundColor: "#fef6f6" },
  iconBg: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(77,168,196,0.1)", alignItems: "center", justifyContent: "center", marginRight: 8 },
  input: { flex: 1, height: 50, color: "#1a3a4a", fontSize: 14, fontWeight: "600" },
  eyeBtn: { paddingLeft: 8, paddingVertical: 4 },
  helperWrap: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 },
  helperText: { color: "#e05050", fontSize: 11, fontWeight: "600" },
  acceptRow: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  checkBox: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: "#c8dde4", marginRight: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#f7fbfc" },
  checkActive: { backgroundColor: "#4da8c4", borderColor: "#4da8c4" },
  acceptText: { color: "#6a9bab", flex: 1, fontSize: 12, fontWeight: "500" },
  acceptLink: { color: "#266e84", fontWeight: "800" },
  mainBtn: { minHeight: 54, borderRadius: 16, backgroundColor: "#266e84", alignItems: "center", justifyContent: "center", shadowColor: "#1a5060", shadowOpacity: 0.3, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  btnPressed: { transform: [{ scale: 0.97 }] },
  btnDisabled: { opacity: 0.5 },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  loginRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 20 },
  loginText: { color: "#8bb8c8", fontSize: 14, fontWeight: "500" },
  loginLink: { color: "#266e84", fontSize: 14, fontWeight: "800" },
});
