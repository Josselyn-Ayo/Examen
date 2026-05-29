import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

import { SafeAreaView } from "react-native-safe-area-context";

type FAQItem = { q: string; a: string };

const FAQ: FAQItem[] = [
  { q: "¿Cómo adopto una mascota?", a: "Ve a la sección de Mascotas, elige la que te guste y presiona 'Solicitar adopción'. El refugio recibirá tu solicitud y te contactará." },
  { q: "¿Cómo registro mi refugio en el mapa?", a: "En tu perfil, ve a 'Mi refugio' y presiona 'Registrar ubicación'. Asegúrate de tener el GPS activado para que tu refugio aparezca en el mapa." },
  { q: "¿Puedo cambiar mi rol de adoptante a refugio?", a: "Actualmente no es posible cambiar el rol desde la app. Puedes crear una nueva cuenta con el rol que necesites." },
  { q: "¿Cómo uso el asistente de IA?", a: "En la pestaña 'IA' puedes hacer preguntas sobre cuidado de mascotas, salud, alimentación y más. El asistente te responderá al instante." },
  { q: "¿Es gratuito usar PetAdopt?", a: "Sí, PetAdopt es completamente gratuito tanto para adoptantes como para refugios." },
  { q: "¿Cómo recupero mi contraseña?", a: "En la pantalla de inicio de sesión, toca '¿Olvidaste tu contraseña?' y sigue las instrucciones que llegarán a tu correo." },
  { q: "¿Cómo contacto a un refugio?", a: "Cuando solicites adoptar una mascota, el refugio recibe tu solicitud automáticamente. También puedes usar el chat si el refugio lo tiene habilitado." },
  { q: "¿Puedo publicar una mascota si soy adoptante?", a: "No, solo los usuarios con rol de Refugio pueden publicar mascotas en adopción. Si representas un refugio, regístrate con ese rol." },
];

export default function AyudaScreen() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const fadeCard = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeCard, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(cardSlide, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, []);

  const toggle = (i: number) => setOpenIndex(prev => prev === i ? null : i);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBg}>
          <View style={styles.deco1} />
          <View style={styles.deco2} />
        </View>

        <View style={styles.navBar}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.navTitle}>Centro de ayuda</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Feather name="help-circle" size={32} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>¿En qué podemos ayudarte?</Text>
          <Text style={styles.heroSub}>Encuentra respuestas a las preguntas más comunes</Text>
        </View>

        <Animated.View style={[styles.card, { opacity: fadeCard, transform: [{ translateY: cardSlide }] }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>Preguntas frecuentes</Text>
          </View>

          {FAQ.map((item, i) => (
            <Pressable key={i} style={styles.faqItem} onPress={() => toggle(i)}>
              <View style={styles.faqTop}>
                <View style={styles.faqIconBg}>
                  <Feather name="help-circle" size={16} color="#4da8c4" />
                </View>
                <Text style={styles.faqQ}>{item.q}</Text>
                <Ionicons name={openIndex === i ? "chevron-up" : "chevron-down"} size={18} color="#b8d6e0" />
              </View>
              {openIndex === i && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqA}>{item.a}</Text>
                </View>
              )}
            </Pressable>
          ))}

          <View style={[styles.sectionHeader, { marginTop: 20 }]}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>Contacto</Text>
          </View>

          <View style={styles.contactCard}>
            <View style={styles.contactRow}>
              <View style={styles.contactIconBg}>
                <Feather name="mail" size={18} color="#4da8c4" />
              </View>
              <View>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>soporte@petadopt.com</Text>
              </View>
            </View>
            <View style={styles.contactDivider} />
            <View style={styles.contactRow}>
              <View style={styles.contactIconBg}>
                <Feather name="message-circle" size={18} color="#4da8c4" />
              </View>
              <View>
                <Text style={styles.contactLabel}>Chat en la app</Text>
                <Text style={styles.contactValue}>Usa la pestaña de IA para pedir ayuda</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#4da8c4" },
  scrollContent: { paddingBottom: 40 },
  headerBg: { position: "absolute", top: 0, left: 0, right: 0, height: 280, backgroundColor: "#4da8c4", borderBottomLeftRadius: 36, borderBottomRightRadius: 36, overflow: "hidden" },
  deco1: { position: "absolute", top: -60, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.08)" },
  deco2: { position: "absolute", top: 30, left: -60, width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(255,255,255,0.06)" },
  navBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, zIndex: 2 },
  backBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  navTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  heroSection: { alignItems: "center", marginTop: 10, marginBottom: 12, zIndex: 2 },
  heroIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 12, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)" },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  heroSub: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "500", marginTop: 4, textAlign: "center" },
  card: { backgroundColor: "#fff", borderTopLeftRadius: 34, borderTopRightRadius: 34, marginTop: 12, paddingTop: 26, paddingHorizontal: 22, paddingBottom: 28, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 20, shadowOffset: { width: 0, height: -6 }, elevation: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  sectionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4da8c4" },
  sectionTitle: { fontSize: 12, fontWeight: "800", color: "#3d8fa8", textTransform: "uppercase", letterSpacing: 1 },
  faqItem: { backgroundColor: "#f4f9fb", borderRadius: 14, marginBottom: 8, borderWidth: 1, borderColor: "#e4eef2", overflow: "hidden" },
  faqTop: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 14, gap: 10 },
  faqIconBg: { width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(77,168,196,0.1)", alignItems: "center", justifyContent: "center" },
  faqQ: { flex: 1, fontSize: 14, fontWeight: "700", color: "#1a3a4a" },
  faqAnswer: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 0 },
  faqA: { fontSize: 13, color: "#5a8a9a", fontWeight: "500", lineHeight: 20, paddingLeft: 42 },
  contactCard: { backgroundColor: "#f4f9fb", borderRadius: 16, borderWidth: 1, borderColor: "#e4eef2", overflow: "hidden" },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  contactIconBg: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(77,168,196,0.1)", alignItems: "center", justifyContent: "center" },
  contactLabel: { fontSize: 12, color: "#8bb8c8", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  contactValue: { fontSize: 14, color: "#1a3a4a", fontWeight: "600", marginTop: 2 },
  contactDivider: { height: 1, backgroundColor: "#e4eef2", marginLeft: 66 },
});
