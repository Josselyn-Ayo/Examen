import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { usePets } from "@features/pets/presentation/hooks/usePets";
import { useAdoptions } from "@features/adoptions/presentation/hooks/useAdoptions";
import { useRouter } from "expo-router";
import { useState, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { BottomNav } from "../../../components/BottomNav";

const SPECIES_OPTIONS = [
  { value: "perro" as const, label: "🐕 Perro", emoji: "🐕" },
  { value: "gato" as const, label: "🐈 Gato", emoji: "🐈" },
  { value: "ave" as const, label: "🦜 Ave", emoji: "🦜" },
  { value: "conejo" as const, label: "🐇 Conejo", emoji: "🐇" },
  { value: "otro" as const, label: "🐾 Otro", emoji: "🐾" },
];

const SPECIES_EMOJI: Record<string, string> = {
  perro: "🐕", gato: "🐈", ave: "🦜", conejo: "🐇", otro: "🐾",
};

export default function PetsScreen() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const { pets, myPets, isLoading, createPet, deletePet, isCreating, isDeleting, createError } = usePets();
  const { createRequest, isCreating: isRequesting } = useAdoptions();
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdoptModal, setShowAdoptModal] = useState<string | null>(null);
  const [adoptMessage, setAdoptMessage] = useState("");
  const [tab, setTab] = useState<"browse" | "my">("browse");

  const [petName, setPetName] = useState("");
  const [petSpecies, setPetSpecies] = useState<"perro" | "gato" | "ave" | "conejo" | "otro">("perro");
  const [petBreed, setPetBreed] = useState("");
  const [petAge, setPetAge] = useState("");
  const [petDescription, setPetDescription] = useState("");
  const [petImage, setPetImage] = useState<string | null>(null);

  const isRefugio = user?.role === "refugio";

  const filteredPets = useMemo(() => {
    let list = tab === "my" ? myPets : pets;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.breed.toLowerCase().includes(q));
    }
    if (speciesFilter) {
      list = list.filter((p) => p.species === speciesFilter);
    }
    return list;
  }, [tab, pets, myPets, search, speciesFilter]);

  const handleCreatePet = () => {
    if (!petName.trim()) return;
    createPet(
      {
        name: petName.trim(),
        species: petSpecies,
        breed: petBreed.trim(),
        age: petAge.trim(),
        description: petDescription.trim(),
        imageUri: petImage,
      },
      {
        onSuccess: () => {
          setPetName("");
          setPetBreed("");
          setPetAge("");
          setPetDescription("");
          setPetImage(null);
          setShowCreateModal(false);
        },
      },
    );
  };

  const handleAdopt = (petId: string) => {
    createRequest(
      { petId, message: adoptMessage.trim() || "Me gustaría adoptar esta mascota." },
      {
        onSuccess: () => {
          setShowAdoptModal(null);
          setAdoptMessage("");
        },
      },
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPetImage(result.assets[0].uri);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#cebdff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bgMesh} />
      <View style={styles.blobOne} />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>🐾 Mascotas</Text>
            <Text style={styles.subtitle}>
              {isRefugio ? "Gestiona tus mascotas en adopción" : "Encuentra tu compañero ideal"}
            </Text>
          </View>
        </View>

        <View style={styles.searchShell}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar mascotas..."
            placeholderTextColor="#777586"
          />
        </View>

        <View style={styles.filterRow}>
          <Pressable
            style={[styles.filterChip, !speciesFilter && styles.filterChipActive]}
            onPress={() => setSpeciesFilter(null)}
          >
            <Text style={[styles.filterChipText, !speciesFilter && styles.filterChipTextActive]}>Todos</Text>
          </Pressable>
          {SPECIES_OPTIONS.map((s) => (
            <Pressable
              key={s.value}
              style={[styles.filterChip, speciesFilter === s.value && styles.filterChipActive]}
              onPress={() => setSpeciesFilter(speciesFilter === s.value ? null : s.value)}
            >
              <Text style={[styles.filterChipText, speciesFilter === s.value && styles.filterChipTextActive]}>
                {s.emoji}
              </Text>
            </Pressable>
          ))}
        </View>

        {isRefugio && (
          <View style={styles.tabRow}>
            <Pressable
              style={[styles.tab, tab === "browse" && styles.tabActive]}
              onPress={() => setTab("browse")}
            >
              <Text style={[styles.tabText, tab === "browse" && styles.tabTextActive]}>Disponibles</Text>
            </Pressable>
            <Pressable
              style={[styles.tab, tab === "my" && styles.tabActive]}
              onPress={() => setTab("my")}
            >
              <Text style={[styles.tabText, tab === "my" && styles.tabTextActive]}>Mis Mascotas</Text>
            </Pressable>
          </View>
        )}
      </View>

      {filteredPets.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🐾</Text>
          <Text style={styles.emptyTitle}>No hay mascotas</Text>
          <Text style={styles.emptyText}>
            {isRefugio ? "Agrega tu primera mascota en adopción" : "Pronto habrá mascotas disponibles"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPets}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.petCard}
              onPress={() => router.push(`/pets/${item.id}` as any)}
              activeOpacity={0.85}
            >
              <View style={styles.petImageWrap}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.petImage} resizeMode="cover" />
                ) : (
                  <Text style={styles.petImageEmoji}>{SPECIES_EMOJI[item.species] ?? "🐾"}</Text>
                )}
              </View>
              <View style={styles.petInfo}>
                <View style={styles.petTopRow}>
                  <Text style={styles.petName} numberOfLines={1}>{item.name}</Text>
                  <View style={[styles.statusPill, item.status === "disponible" && styles.statusPillGreen]}>
                    <Text style={styles.statusText}>
                      {item.status === "disponible" ? "Disponible" : item.status === "en_proceso" ? "En proceso" : "Adoptado"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.petBreed} numberOfLines={1}>
                  {SPECIES_EMOJI[item.species]} {item.breed} {item.age ? `· ${item.age}` : ""}
                </Text>
                {item.shelterName && (
                  <Text style={styles.petShelter}>Por {item.shelterName}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {isRefugio && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)} activeOpacity={0.9}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      {!isRefugio && showAdoptModal && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setShowAdoptModal(null)}>
          <View style={styles.overlay}>
            <View style={styles.dialog}>
              <Text style={styles.dialogTitle}>Solicitar adopción</Text>
              <Text style={styles.dialogSubtitle}>
                Escribe un mensaje al refugio explicando por qué te gustaría adoptar.
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
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdoptModal(null)}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.createBtn, isRequesting && { opacity: 0.6 }]}
                  onPress={() => handleAdopt(showAdoptModal)}
                  disabled={isRequesting}
                >
                  {isRequesting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.createText}>Enviar</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {isRefugio && showCreateModal && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setShowCreateModal(false)}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.overlay}>
              <View style={styles.dialog}>
                <Text style={styles.dialogKicker}>Nuevo</Text>
                <Text style={styles.dialogTitle}>Registrar mascota</Text>
                {createError && <Text style={styles.dialogError}>{createError}</Text>}

                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                  {petImage ? (
                    <Image source={{ uri: petImage }} style={styles.pickedImage} resizeMode="cover" />
                  ) : (
                    <Text style={styles.imagePickerText}>📷 Agregar foto</Text>
                  )}
                </TouchableOpacity>

                <TextInput style={styles.dialogInput} placeholder="Nombre" placeholderTextColor="#999" value={petName} onChangeText={setPetName} />
                <View style={styles.speciesRow}>
                  {SPECIES_OPTIONS.map((s) => (
                    <Pressable
                      key={s.value}
                      style={[styles.speciesChip, petSpecies === s.value && styles.speciesChipActive]}
                      onPress={() => setPetSpecies(s.value)}
                    >
                      <Text style={styles.speciesChipText}>{s.emoji}</Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput style={styles.dialogInput} placeholder="Raza" placeholderTextColor="#999" value={petBreed} onChangeText={setPetBreed} />
                <TextInput style={styles.dialogInput} placeholder="Edad (ej: 2 años)" placeholderTextColor="#999" value={petAge} onChangeText={setPetAge} />
                <TextInput style={[styles.dialogInput, { height: 80 }]} placeholder="Descripción" placeholderTextColor="#999" value={petDescription} onChangeText={setPetDescription} multiline />

                <View style={styles.dialogActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCreateModal(false)}>
                    <Text style={styles.cancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.createBtn, isCreating && { opacity: 0.6 }]} onPress={handleCreatePet} disabled={isCreating}>
                    {isCreating ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.createText}>Crear</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </Modal>
      )}

      <BottomNav active="pets" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0c0e12" },
  bgMesh: { ...StyleSheet.absoluteFillObject, backgroundColor: "#0c0e12" },
  blobOne: { position: "absolute", top: -120, left: -160, width: 420, height: 420, borderRadius: 999, backgroundColor: "rgba(80,40,174,0.18)" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", color: "#fff" },
  subtitle: { color: "rgba(226,226,231,0.7)", fontSize: 13, fontWeight: "600", marginTop: 4 },
  searchShell: { height: 50, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 14, flexDirection: "row", alignItems: "center", marginBottom: 12 },
  searchIcon: { color: "rgba(232,221,255,0.72)", fontSize: 17, marginRight: 10, fontWeight: "800" },
  searchInput: { flex: 1, color: "rgba(232,221,255,0.95)", fontSize: 15 },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  filterChipActive: { backgroundColor: "rgba(206,189,255,0.15)", borderColor: "#cebdff" },
  filterChipText: { color: "rgba(226,226,231,0.7)", fontSize: 13, fontWeight: "700" },
  filterChipTextActive: { color: "#cebdff" },
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  tab: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  tabActive: { backgroundColor: "rgba(206,189,255,0.15)", borderColor: "#cebdff" },
  tabText: { color: "rgba(226,226,231,0.7)", fontSize: 13, fontWeight: "700" },
  tabTextActive: { color: "#cebdff" },
  listContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 140 },
  petCard: { backgroundColor: "rgba(255,255,255,0.045)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 24, padding: 16, marginBottom: 12, flexDirection: "row", alignItems: "center" },
  petImageWrap: { width: 60, height: 60, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center", marginRight: 14, overflow: "hidden" },
  petImage: { width: 60, height: 60, borderRadius: 18 },
  petImageEmoji: { fontSize: 28 },
  petInfo: { flex: 1 },
  petTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  petName: { fontSize: 16, fontWeight: "700", color: "#e8ddff", flex: 1 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)" },
  statusPillGreen: { backgroundColor: "rgba(5,150,105,0.2)" },
  statusText: { fontSize: 10, fontWeight: "700", color: "#cebdff", textTransform: "uppercase", letterSpacing: 0.5 },
  petBreed: { color: "rgba(226,226,231,0.7)", fontSize: 13, marginBottom: 2 },
  petShelter: { color: "rgba(226,226,231,0.5)", fontSize: 12 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 10 },
  emptyTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 6 },
  emptyText: { color: "rgba(226,226,231,0.72)", fontSize: 15, textAlign: "center", maxWidth: 260 },
  fab: { position: "absolute", right: 24, bottom: 110, backgroundColor: "#cebdff", width: 60, height: 60, borderRadius: 22, justifyContent: "center", alignItems: "center", elevation: 6, shadowColor: "#cebdff", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.36, shadowRadius: 18 },
  fabText: { color: "#0c0e12", fontSize: 28, fontWeight: "800" },
  bottomNav: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20, backgroundColor: "rgba(12,14,18,0.9)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  bottomNavInner: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 26, paddingVertical: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  navItem: { flexDirection: "column", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6 },
  navItemActive: { backgroundColor: "rgba(206,189,255,0.12)", borderRadius: 16, paddingHorizontal: 16 },
  navIcon: { fontSize: 18, color: "rgba(226,226,231,0.62)" },
  navIconActive: { fontSize: 18, color: "#cebdff", fontWeight: "800" },
  navLabel: { fontSize: 10, color: "rgba(226,226,231,0.62)", marginTop: 3, fontWeight: "700" },
  navLabelActive: { fontSize: 10, color: "#cebdff", marginTop: 3, fontWeight: "800" },
  overlay: { flex: 1, backgroundColor: "rgba(19,27,46,0.45)", justifyContent: "center", padding: 24 },
  dialog: { backgroundColor: "rgba(20,14,36,0.97)", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", maxHeight: "90%" },
  dialogKicker: { color: "#cebdff", textTransform: "uppercase", letterSpacing: 1.6, fontSize: 12, fontWeight: "800", marginBottom: 6 },
  dialogTitle: { fontSize: 22, lineHeight: 28, fontWeight: "800", color: "#f4e9ff", marginBottom: 12 },
  dialogSubtitle: { color: "rgba(244,233,255,0.7)", fontSize: 14, marginBottom: 14 },
  dialogError: { color: "#ffd8e1", backgroundColor: "rgba(255,82,130,0.18)", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10, fontSize: 13, fontWeight: "600" },
  dialogInput: { borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, color: "#f4e9ff", fontSize: 15 },
  dialogActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 4 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.06)" },
  cancelText: { color: "#cebdff", fontSize: 15, fontWeight: "700" },
  createBtn: { backgroundColor: "#7c4dff", borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12 },
  createText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  imagePicker: { height: 120, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 10, overflow: "hidden" },
  imagePickerText: { color: "rgba(244,233,255,0.7)", fontSize: 15 },
  pickedImage: { width: "100%", height: "100%" },
  speciesRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  speciesChip: { width: 48, height: 48, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  speciesChipActive: { backgroundColor: "rgba(206,189,255,0.2)", borderColor: "#cebdff" },
  speciesChipText: { fontSize: 22 },
});