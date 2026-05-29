import { supabase } from "@shared/infrastructure/supabase/client";
import { useAdoptions } from "@features/adoptions/presentation/hooks/useAdoptions";
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
import { Feather, Ionicons } from "@expo/vector-icons";

type PetOption = { id: string; name: string };

export default function AdoptionFormScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { createRequest } = useAdoptions();

  const [fullName, setFullName] = useState(user?.username ?? "");
  const [cedula, setCedula] = useState("");
  const [profesion, setProfesion] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState(user?.email ?? "");
  const [hogar, setHogar] = useState("");
  const [certifico, setCertifico] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pets, setPets] = useState<PetOption[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [loadingPets, setLoadingPets] = useState(true);
  const [showPetPicker, setShowPetPicker] = useState(false);

  const fadeCard = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeCard, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(cardSlide, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    supabase
      .from("pets")
      .select("id, name")
      .eq("status", "disponible")
      .order("name")
      .then(({ data }) => {
        setPets(data ?? []);
        setLoadingPets(false);
      });
  }, []);

  const isValid =
    fullName.trim() &&
    cedula.trim() &&
    profesion.trim() &&
    experiencia.trim() &&
    telefono.trim() &&
    correo.trim() &&
    hogar.trim() &&
    certifico &&
    selectedPetId;

  const handleSubmit = async () => {
    if (!isValid || submitting || !selectedPetId) return;
    setSubmitting(true);
    const message = `Solicitud de ${fullName}:
- Cédula: ${cedula}
- Profesión: ${profesion}
- Teléfono: ${telefono}
- Correo: ${correo}
- Experiencia: ${experiencia}
- Hogar: ${hogar}`;
    createRequest(
      { petId: selectedPetId, message },
      {
        onSuccess: () => {
          setSubmitting(false);
          setSubmitted(true);
        },
        onError: (err) => {
          setSubmitting(false);
          Alert.alert("Error", err.message);
        },
      },
    );
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerBg}>
          <View style={styles.deco1} />
          <View style={styles.deco2} />
        </View>
        <View style={styles.successContainer}>
          <View style={styles.successIconWrap}>
            <Feather name="check-circle" size={48} color="#059669" />
          </View>
          <Text style={styles.successTitle}>Solicitud enviada</Text>
          <Text style={styles.successText}>
            Tu solicitud de adopcion ha sido registrada exitosamente. El refugio revisara tu informacion y se pondra en contacto contigo.
          </Text>
          <Pressable style={styles.successBtn} onPress={() => router.back()}>
            <Text style={styles.successBtnText}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "android" ? 24 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBg}>
            <View style={styles.deco1} />
            <View style={styles.deco2} />
          </View>

          <View style={styles.navBar}>
            <Pressable style={styles.backBtn} onPress={() => router.back()}>
              <Feather name="arrow-left" size={22} color="#fff" />
            </Pressable>
            <Text style={styles.navTitle}>Solicitud de adopcion</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.heroSection}>
            <View style={styles.heroIcon}>
              <Feather name="heart" size={28} color="#fff" />
            </View>
            <Text style={styles.heroTitle}>Formulario de adopcion</Text>
            <Text style={styles.heroSub}>
              Completa tus datos para solicitar la adopcion. Toda la informacion sera revisada por el refugio.
            </Text>
          </View>

          <Animated.View style={[styles.card, { opacity: fadeCard, transform: [{ translateY: cardSlide }] }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: "#F97316" }]}>
                <Feather name="search" size={18} color="#fff" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Mascota a adoptar</Text>
                <Text style={styles.sectionSub}>Selecciona la mascota que deseas adoptar</Text>
              </View>
            </View>

            <Pressable style={styles.petPickerBtn} onPress={() => setShowPetPicker(!showPetPicker)}>
              <Feather name="paw-print" size={18} color="#4da8c4" />
              <Text style={[styles.petPickerText, !selectedPetId && styles.petPickerPlaceholder]}>
                {selectedPetId ? pets.find((p) => p.id === selectedPetId)?.name : loadingPets ? "Cargando mascotas..." : "Selecciona una mascota"}
              </Text>
              <Feather name={showPetPicker ? "chevron-up" : "chevron-down"} size={18} color="#4da8c4" />
            </Pressable>

            {showPetPicker && (
              <View style={styles.petList}>
                {pets.length === 0 ? (
                  <Text style={styles.petListEmpty}>No hay mascotas disponibles</Text>
                ) : (
                  pets.map((pet) => (
                    <Pressable
                      key={pet.id}
                      style={[styles.petOption, selectedPetId === pet.id && styles.petOptionActive]}
                      onPress={() => {
                        setSelectedPetId(pet.id);
                        setShowPetPicker(false);
                      }}
                    >
                      <Feather
                        name={selectedPetId === pet.id ? "check-circle" : "circle"}
                        size={18}
                        color={selectedPetId === pet.id ? "#4da8c4" : "#b8d6e0"}
                      />
                      <Text style={[styles.petOptionText, selectedPetId === pet.id && styles.petOptionTextActive]}>
                        {pet.name}
                      </Text>
                    </Pressable>
                  ))
                )}
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Feather name="user" size={18} color="#fff" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Datos personales</Text>
                <Text style={styles.sectionSub}>Informacion del solicitante</Text>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nombres completos</Text>
              <View style={styles.inputShell}>
                <View style={styles.iconBg}>
                  <Feather name="user" size={16} color="#4da8c4" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Maria Lopez Garcia"
                  placeholderTextColor="#b8d6e0"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Cedula de identidad</Text>
              <View style={styles.inputShell}>
                <View style={styles.iconBg}>
                  <Feather name="credit-card" size={16} color="#4da8c4" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 1712345678"
                  placeholderTextColor="#b8d6e0"
                  value={cedula}
                  onChangeText={setCedula}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Profesion</Text>
              <View style={styles.inputShell}>
                <View style={styles.iconBg}>
                  <Feather name="briefcase" size={16} color="#4da8c4" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Veterinaria, Ingeniera, Estudiante..."
                  placeholderTextColor="#b8d6e0"
                  value={profesion}
                  onChangeText={setProfesion}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Telefono</Text>
              <View style={styles.inputShell}>
                <View style={styles.iconBg}>
                  <Feather name="phone" size={16} color="#4da8c4" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="0991234567"
                  placeholderTextColor="#b8d6e0"
                  value={telefono}
                  onChangeText={setTelefono}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Correo</Text>
              <View style={styles.inputShell}>
                <View style={styles.iconBg}>
                  <Feather name="mail" size={16} color="#4da8c4" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="tu@email.com"
                  placeholderTextColor="#b8d6e0"
                  value={correo}
                  onChangeText={setCorreo}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: "#F97316" }]}>
                <Feather name="home" size={18} color="#fff" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Experiencia y hogar</Text>
                <Text style={styles.sectionSub}>Cuentanos sobre ti</Text>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Experiencia con mascotas</Text>
              <View style={[styles.inputShell, { minHeight: 60, alignItems: "flex-start" }]}>
                <View style={[styles.iconBg, { marginTop: 10 }]}>
                  <Ionicons name="paw-outline" size={16} color="#4da8c4" />
                </View>
                <TextInput
                  style={[styles.input, { height: 60 }]}
                  placeholder="Describe tu experiencia previa con animales..."
                  placeholderTextColor="#b8d6e0"
                  value={experiencia}
                  onChangeText={setExperiencia}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Cuentanos sobre tu hogar</Text>
              <View style={[styles.inputShell, { minHeight: 80, alignItems: "flex-start" }]}>
                <View style={[styles.iconBg, { marginTop: 10 }]}>
                  <Feather name="home" size={16} color="#4da8c4" />
                </View>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  placeholder="Tipo de vivienda, espacio disponible, si hay otras mascotas, ninos, etc..."
                  placeholderTextColor="#b8d6e0"
                  value={hogar}
                  onChangeText={setHogar}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: "#DC2626" }]}>
                <Feather name="shield" size={18} color="#fff" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Compromiso</Text>
                <Text style={styles.sectionSub}>Declaracion de responsabilidad</Text>
              </View>
            </View>

            <Pressable
              style={[styles.certBox, certifico && styles.certBoxActive]}
              onPress={() => setCertifico(!certifico)}
            >
              <View style={[styles.checkbox, certifico && styles.checkboxActive]}>
                {certifico && <Feather name="check" size={14} color="#fff" />}
              </View>
              <Text style={styles.certText}>
                Certifico que la informacion proporcionada es verdadera y acepto el compromiso de cuidado responsable que conlleva la adopcion de un ser vivo.
              </Text>
            </Pressable>

            <Pressable
              style={[styles.submitBtn, (!isValid || submitting) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!isValid || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.btnInner}>
                  <Feather name="send" size={18} color="#fff" />
                  <Text style={styles.btnText}>Enviar solicitud</Text>
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

  headerBg: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 260,
    backgroundColor: "#4da8c4",
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: "hidden",
  },
  deco1: { position: "absolute", top: -60, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.08)" },
  deco2: { position: "absolute", top: 30, left: -60, width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(255,255,255,0.06)" },

  navBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6, zIndex: 2 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  navTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },

  heroSection: { alignItems: "center", marginTop: 8, marginBottom: 10, paddingHorizontal: 20, zIndex: 2 },
  heroIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 8, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)" },
  heroTitle: { color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  heroSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "500", marginTop: 4, textAlign: "center", lineHeight: 17 },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 24,
    marginTop: 6,
    paddingTop: 20,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },

  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16, paddingHorizontal: 18 },
  sectionIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: "#4da8c4", alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1a3a4a" },
  sectionSub: { fontSize: 11, color: "#4da8c4", fontWeight: "500", marginTop: 2 },

  fieldGroup: { marginBottom: 14, paddingHorizontal: 18 },
  label: { fontSize: 11, fontWeight: "800", color: "#3d8fa8", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.7 },
  inputShell: {
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: "#F0F9FF",
    borderWidth: 1.5,
    borderColor: "#BAE6FD",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  iconBg: { width: 34, height: 34, borderRadius: 9, backgroundColor: "rgba(14,165,233,0.1)", alignItems: "center", justifyContent: "center", marginRight: 7 },
  input: { flex: 1, height: 48, color: "#1a3a4a", fontSize: 14, fontWeight: "600" },

  rowGroup: { flexDirection: "row" },
  petPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginBottom: 4,
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: "#F0F9FF",
    borderWidth: 1.5,
    borderColor: "#BAE6FD",
    paddingHorizontal: 12,
    gap: 8,
  },
  petPickerText: { flex: 1, color: "#1a3a4a", fontSize: 14, fontWeight: "600" },
  petPickerPlaceholder: { color: "#b8d6e0" },
  petList: {
    marginHorizontal: 18,
    marginBottom: 6,
    backgroundColor: "#fff",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#BAE6FD",
    overflow: "hidden",
  },
  petListEmpty: { padding: 16, color: "#8bb8c8", textAlign: "center", fontSize: 13 },
  petOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F9FF",
  },
  petOptionActive: { backgroundColor: "#F0F9FF" },
  petOptionText: { color: "#1a3a4a", fontSize: 14, fontWeight: "600" },
  petOptionTextActive: { color: "#4da8c4", fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#BAE6FD", marginVertical: 14, marginHorizontal: 18 },

  certBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FEF2F2",
    borderRadius: 13,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#FECACA",
    marginBottom: 16,
    marginHorizontal: 18,
  },
  certBoxActive: { backgroundColor: "#F0F9FF", borderColor: "#4da8c4" },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxActive: { backgroundColor: "#4da8c4", borderColor: "#4da8c4" },
  certText: { flex: 1, fontSize: 13, color: "#374151", lineHeight: 19, fontWeight: "500" },

  submitBtn: {
    minHeight: 50,
    borderRadius: 15,
    backgroundColor: "#4da8c4",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginHorizontal: 18,
    shadowColor: "#4da8c4",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.45, elevation: 0, shadowOpacity: 0 },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 7 },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "800" },

  successContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 30 },
  successIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 18 },
  successTitle: { color: "#fff", fontSize: 22, fontWeight: "900", marginBottom: 10 },
  successText: { color: "rgba(255,255,255,0.8)", fontSize: 14, textAlign: "center", lineHeight: 21, marginBottom: 26 },
  successBtn: { paddingHorizontal: 30, paddingVertical: 13, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)" },
  successBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
