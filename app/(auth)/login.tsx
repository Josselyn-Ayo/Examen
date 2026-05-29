import { Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle, isLoading, error } = useAuth();

  const fadeAll = useRef(new Animated.Value(0)).current;
  const slideDog = useRef(new Animated.Value(60)).current;
  const fadeCard = useRef(new Animated.Value(0)).current;
  const cardUp = useRef(new Animated.Value(50)).current;
  const floatDog = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAll, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(slideDog, { toValue: 0, duration: 900, delay: 150, easing: Easing.out(Easing.back(1.3)), useNativeDriver: true }),
      Animated.timing(fadeCard, { toValue: 1, duration: 700, delay: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(cardUp, { toValue: 0, duration: 700, delay: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    Animated.loop(Animated.sequence([
      Animated.timing(floatDog, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(floatDog, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(breathe, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(breathe, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
  }, []);

  const dogFloatY = floatDog.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const breatheScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });
  const deco1Scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "android" ? 24 : 0}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={styles.topSection}>
            <Animated.View style={[styles.deco1, { transform: [{ scale: deco1Scale }] }]} />
            <View style={styles.deco2} />
            <View style={styles.deco3} />
            <View style={styles.deco4} />
            <View style={styles.deco5} />
            <View style={styles.deco6} />

            <Animated.View style={[styles.logoBlock, { opacity: fadeAll }]}>
              <View style={styles.logoIcon}>
                <MaterialCommunityIcons name="paw" size={28} color="#fff" />
              </View>
              <View>
                <Text style={styles.brandText}>PETADOPT</Text>
                <View style={styles.brandLine} />
              </View>
            </Animated.View>

            <Animated.View style={{ opacity: fadeAll }}>
              <Text style={styles.subtitle}>La forma fácil de encontrar a tu amigo peludo</Text>
            </Animated.View>

            <Animated.View style={[styles.dogWrap, { transform: [{ translateY: Animated.add(slideDog, dogFloatY) }, { scale: breatheScale }] }]}>
              <View style={styles.dogShadow} />
              <Image source={require("../../assets/images/Perrito.png")} style={styles.dogImage} resizeMode="contain" />
            </Animated.View>
          </View>

          <Animated.View style={[styles.card, { opacity: fadeCard, transform: [{ translateY: cardUp }] }]}>
            <View style={styles.cardWave1} />
            <View style={styles.cardWave2} />

            <View style={styles.welcomeRow}>
              <View style={styles.welcomeIcon}>
                <Feather name="log-in" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.welcomeTitle}>Bienvenido de nuevo</Text>
                <Text style={styles.welcomeSub}>Inicia sesión para continuar</Text>
              </View>
            </View>

            {error ? (
              <View style={styles.errorWrap}>
                <Feather name="alert-circle" size={16} color="#e05050" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Usuario</Text>
              <View style={styles.inputShell}>
                <View style={styles.iconBg}>
                  <Feather name="user" size={16} color="#4da8c4" />
                </View>
                <TextInput style={styles.input} placeholder="Ingresa tu usuario" placeholderTextColor="#a4c6d4" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} textContentType="username" />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputShell}>
                <View style={styles.iconBg}>
                  <Feather name="lock" size={16} color="#4da8c4" />
                </View>
                <TextInput style={styles.input} placeholder="Ingresa tu contraseña" placeholderTextColor="#a4c6d4" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" textContentType="password" />
                <Pressable onPress={() => setShowPassword(c => !c)} hitSlop={10} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#4da8c4" />
                </Pressable>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Pressable style={styles.rememberRow}>
                <View style={styles.checkBox}>
                  <Feather name="check" size={10} color="#4da8c4" />
                </View>
                <Text style={styles.metaText}>Recordarme</Text>
              </Pressable>
              <Link href="/(auth)/forgot-password" style={styles.forgotLink}>¿Olvidaste tu contraseña?</Link>
            </View>

            <Pressable style={({ pressed }) => [styles.mainBtn, pressed && !isLoading ? styles.btnPressed : null, isLoading && styles.btnDisabled]} onPress={() => login({ email, password })} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : (
                <View style={styles.btnInner}>
                  <MaterialCommunityIcons name="paw" size={20} color="#fff" />
                  <Text style={styles.btnText}>Iniciar sesión</Text>
                  <Feather name="arrow-right" size={18} color="rgba(255,255,255,0.6)" />
                </View>
              )}
            </Pressable>

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <View style={styles.orCircle}>
                <MaterialCommunityIcons name="dog" size={14} color="#4da8c4" />
              </View>
              <View style={styles.orLine} />
            </View>

            <Pressable style={({ pressed }) => [styles.googleBtn, pressed && styles.googlePressed]} onPress={() => loginWithGoogle()} disabled={isLoading}>
              <View style={styles.gIconBg}>
                <FontAwesome name="google" size={16} color="#4da8c4" />
              </View>
              <Text style={styles.gBtnText}>Continuar con Google</Text>
              <Feather name="chevron-right" size={18} color="#b8d6e0" />
            </Pressable>

            <View style={styles.regRow}>
              <Text style={styles.regText}>¿No tienes cuenta? </Text>
              <Link href="/(auth)/register" style={styles.regLink}>Regístrate aquí</Link>
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
  topSection: { width: SCREEN_W, paddingTop: 30, paddingBottom: 56, alignItems: "center", position: "relative", overflow: "hidden", backgroundColor: "#4da8c4" },
  deco1: { position: "absolute", top: -120, right: -80, width: 320, height: 320, borderRadius: 160, backgroundColor: "rgba(255,255,255,0.09)" },
  deco2: { position: "absolute", top: 20, left: -100, width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(255,255,255,0.06)" },
  deco3: { position: "absolute", bottom: -10, left: 40, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.05)" },
  deco4: { position: "absolute", top: 70, right: 15, width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.07)" },
  deco5: { position: "absolute", bottom: 30, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.04)" },
  deco6: { position: "absolute", top: -40, left: "35%", width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)" },
  logoBlock: { flexDirection: "row", alignItems: "center", justifyContent: "center", zIndex: 2 },
  logoIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginRight: 12, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)" },
  brandText: { color: "#fff", fontSize: 40, lineHeight: 44, fontWeight: "900", letterSpacing: 2, textShadowColor: "rgba(0,30,60,0.12)", textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 6 },
  brandLine: { height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.3)", marginTop: 3 },
  subtitle: { marginTop: 10, color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: "600", textAlign: "center", zIndex: 2 },
  dogWrap: { width: SCREEN_W, alignItems: "center", zIndex: 2 },
  dogShadow: { width: 120, height: 14, borderRadius: 60, backgroundColor: "rgba(0,50,80,0.08)", position: "absolute", bottom: -6 },
  dogImage: { width: 260, height: 170, marginTop: 10 },
  card: { backgroundColor: "#fff", borderTopLeftRadius: 36, borderTopRightRadius: 36, marginTop: -24, paddingTop: 30, paddingHorizontal: 24, paddingBottom: 30, position: "relative", overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 24, shadowOffset: { width: 0, height: -8 }, elevation: 12 },
  cardWave1: { position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(77,168,196,0.06)" },
  cardWave2: { position: "absolute", bottom: -30, left: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(77,168,196,0.04)" },
  welcomeRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 26 },
  welcomeIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: "#4da8c4", alignItems: "center", justifyContent: "center", shadowColor: "#4da8c4", shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  welcomeTitle: { fontSize: 20, fontWeight: "900", color: "#1a3a4a", letterSpacing: -0.3 },
  welcomeSub: { fontSize: 12, color: "#7aa8ba", fontWeight: "600", marginTop: 2 },
  errorWrap: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fef0f0", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16, borderWidth: 1, borderColor: "#fdd" },
  errorText: { color: "#e05050", fontSize: 13, fontWeight: "600", flex: 1 },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: "800", color: "#3d8fa8", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.8 },
  inputShell: { minHeight: 54, borderRadius: 16, backgroundColor: "#f4f9fb", borderWidth: 1.5, borderColor: "#e4eef2", flexDirection: "row", alignItems: "center", paddingHorizontal: 5 },
  iconBg: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(77,168,196,0.1)", alignItems: "center", justifyContent: "center", marginRight: 8 },
  input: { flex: 1, height: 54, color: "#1a3a4a", fontSize: 15, fontWeight: "600" },
  eyeBtn: { padding: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  rememberRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkBox: { width: 22, height: 22, borderRadius: 7, backgroundColor: "#f4f9fb", borderWidth: 1.5, borderColor: "#c8dde4", alignItems: "center", justifyContent: "center" },
  metaText: { color: "#6a9bab", fontSize: 12, fontWeight: "700" },
  forgotLink: { color: "#3d8fa8", fontSize: 12, fontWeight: "700" },
  mainBtn: { minHeight: 56, borderRadius: 18, backgroundColor: "#266e84", alignItems: "center", justifyContent: "center", shadowColor: "#1a5060", shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  btnPressed: { transform: [{ scale: 0.97 }] },
  btnDisabled: { opacity: 0.6 },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  orRow: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  orLine: { flex: 1, height: 1, backgroundColor: "#e4eef2" },
  orCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#f4f9fb", alignItems: "center", justifyContent: "center", marginHorizontal: 10, borderWidth: 1, borderColor: "#e4eef2" },
  googleBtn: { flexDirection: "row", alignItems: "center", minHeight: 52, borderRadius: 16, backgroundColor: "#f4f9fb", borderWidth: 1.5, borderColor: "#e4eef2", paddingHorizontal: 14 },
  googlePressed: { transform: [{ scale: 0.98 }], borderColor: "#4da8c4", backgroundColor: "#edf8fb" },
  gIconBg: { width: 36, height: 36, borderRadius: 11, backgroundColor: "rgba(77,168,196,0.1)", alignItems: "center", justifyContent: "center", marginRight: 10 },
  gBtnText: { flex: 1, color: "#3d8fa8", fontSize: 14, fontWeight: "700" },
  regRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 22 },
  regText: { color: "#8bb8c8", fontSize: 14, fontWeight: "500" },
  regLink: { color: "#266e84", fontSize: 14, fontWeight: "800" },
});
