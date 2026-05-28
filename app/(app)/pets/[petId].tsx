import { usePets } from "@features/pets/presentation/hooks/usePets";
import { useAdoptions } from "@features/adoptions/presentation/hooks/useAdoptions";
import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SPECIES_EMOJI: Record<string, string> = {
  perro: "🐕", gato: "🐈", ave: "🦜", conejo: "🐇", otro: "🐾",
};

export default function PetDetailScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { pets, myPets, deletePet, isDeleting } = usePets();
  const { createRequest, isCreating: isRequesting } = useAdoptions();
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [adoptMessage, setAdoptMessage] = useState("");

  const allPets = [...pets, ...myPets];
  const pet = allPets.find((p) => p.id === petId);
  const isRefugio = user?.role === "refugio";
  const isOwner = pet?.shelterId === user?.id;

  if (!pet) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#cebdff" />
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert("Eliminar mascota", "¿Estás seguro de que deseas eliminar esta mascota?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => deletePet(pet.id, { onSuccess: () => router.back() }),
      },
    ]);
  };

  const handleAdopt = () => {
    createRequest(
      { petId: pet.id, message: adoptMessage.trim() || "Me gustaría adoptar esta mascota." },
      {
        onSuccess: () => {
          setShowAdoptModal(false);
          setAdoptMessage("");
          Alert.alert("Solicitud enviada", "Tu solicitud de adopción ha sido enviada al refugio.");
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bgMesh} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <View style={styles.heroImage}>
          {pet.imageUrl ? (
            <Image source={{ uri: pet.imageUrl }} style={styles.heroImg} resizeMode="cover" />
          ) : (
            <Text style={styles.heroEmoji}>{SPECIES_EMOJI[pet.species] ?? "🐾"}</Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.nameRow}>
            <Text style={styles.petName}>{pet.name}</Text>
            <View style={[styles.statusPill, pet.status === "disponible" && styles.statusGreen]}>
              <Text style={styles.statusText}>
                {pet.status === "disponible" ? "Disponible" : pet.status === "en_proceso" ? "En proceso" : "Adoptado"}
              </Text>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Especie</Text>
              <Text style={styles.detailValue}>{SPECIES_EMOJI[pet.species]} {pet.species}</Text>
            </View>
            {pet.breed && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Raza</Text>
                <Text style={styles.detailValue}>{pet.breed}</Text>
              </View>
            )}
            {pet.age && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Edad</Text>
                <Text style={styles.detailValue}>{pet.age}</Text>
              </View>
            )}
            {pet.shelterName && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Refugio</Text>
                <Text style={styles.detailValue}>{pet.shelterName}</Text>
              </View>
            )}
          </View>

          {pet.description ? (
            <View style={styles.descriptionBlock}>
              <Text style={styles.descriptionTitle}>Descripción</Text>
              <Text style={styles.descriptionText}>{pet.description}</Text>
            </View>
          ) : null}

          {!isOwner && pet.status === "disponible" && (
            <TouchableOpacity style={styles.adoptBtn} onPress={() => setShowAdoptModal(true)} activeOpacity={0.85}>
              <Text style={styles.adoptBtnText}>💝 Solicitar adopción</Text>
            </TouchableOpacity>
          )}

          {isOwner && (
            <View style={styles.ownerActions}>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={isDeleting}>
                <Text style={styles.deleteBtnText}>{isDeleting ? "Eliminando..." : "🗑️ Eliminar mascota"}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {showAdoptModal && (
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Solicitar adopción</Text>
            <Text style={styles.dialogSubtitle}>
              Cuéntale al refugio por qué quieres adoptar a {pet.name}.
            </Text>
            <TextInput
              style={styles.dialogInput}
              value={adoptMessage}
              onChangeText={setAdoptMessage}
              placeholder="Me gustaría adoptar porque..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
            <View style={styles.dialogActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdoptModal(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.createBtn, isRequesting && { opacity: 0.6 }]} onPress={handleAdopt} disabled={isRequesting}>
                {isRequesting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.createText}>Enviar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0c0e12" },
  bgMesh: { ...StyleSheet.absoluteFillObject, backgroundColor: "#0c0e12" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  backBtn: { paddingVertical: 10 },
  backText: { color: "#cebdff", fontSize: 15, fontWeight: "700" },
  heroImage: { width: "100%", height: 220, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center", overflow: "hidden", marginBottom: 16 },
  heroImg: { width: "100%", height: "100%" },
  heroEmoji: { fontSize: 72 },
  card: { backgroundColor: "rgba(255,255,255,0.045)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 24, padding: 20 },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  petName: { fontSize: 24, fontWeight: "800", color: "#f4e9ff", flex: 1 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)" },
  statusGreen: { backgroundColor: "rgba(5,150,105,0.2)" },
  statusText: { fontSize: 11, fontWeight: "700", color: "#cebdff", textTransform: "uppercase" },
  detailsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
  detailItem: { flex: 1, minWidth: "40%", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 12 },
  detailLabel: { color: "rgba(244,233,255,0.5)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  detailValue: { color: "#f4e9ff", fontSize: 14, fontWeight: "600" },
  descriptionBlock: { marginBottom: 16 },
  descriptionTitle: { color: "rgba(244,233,255,0.6)", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6 },
  descriptionText: { color: "#e8ddff", fontSize: 15, lineHeight: 22 },
  adoptBtn: { backgroundColor: "#7c4dff", borderRadius: 16, paddingVertical: 16, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  adoptBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  ownerActions: { marginTop: 16 },
  deleteBtn: { backgroundColor: "rgba(220,38,38,0.15)", borderRadius: 14, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: "rgba(220,38,38,0.3)" },
  deleteBtnText: { color: "#ff6b6b", fontWeight: "700" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(19,27,46,0.45)", justifyContent: "center", padding: 24 },
  dialog: { backgroundColor: "rgba(20,14,36,0.97)", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  dialogTitle: { fontSize: 22, fontWeight: "800", color: "#f4e9ff", marginBottom: 8 },
  dialogSubtitle: { color: "rgba(244,233,255,0.7)", fontSize: 14, marginBottom: 14 },
  dialogInput: { borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, color: "#f4e9ff", fontSize: 15, minHeight: 80 },
  dialogActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.06)" },
  cancelText: { color: "#cebdff", fontSize: 15, fontWeight: "700" },
  createBtn: { backgroundColor: "#7c4dff", borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12 },
  createText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});