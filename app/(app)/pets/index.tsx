import { FontAwesome } from "@expo/vector-icons";
import { useAdoptions } from "@features/adoptions/presentation/hooks/useAdoptions";
import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { useFavorites } from "@features/favorites/presentation/hooks/useFavorites";
import { usePets } from "@features/pets/presentation/hooks/usePets";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import LottieView from "lottie-react-native";
import { BottomNav } from "../../../components/BottomNav";
import catFace from "../../../assets/animations/cat_face.json";
import dogIntro from "../../../assets/animations/dog_intro.json";

import { SafeAreaView } from "react-native-safe-area-context";

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
  const { pets, myPets, adoptedPets, isLoading, isLoadingAdopted, createPet, deletePet, isCreating, isDeleting, createError } = usePets();
  const { createRequest, isCreating: isRequesting } = useAdoptions();
  const { favoriteIds, toggleFavorite, isToggling } = useFavorites();
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdoptModal, setShowAdoptModal] = useState<string | null>(null);
  const [adoptMessage, setAdoptMessage] = useState("");
  const [tab, setTab] = useState<"browse" | "my" | "adopted">("browse");

  const [petName, setPetName] = useState("");
  const [petSpecies, setPetSpecies] = useState<"perro" | "gato" | "ave" | "conejo" | "otro">("perro");
  const [petBreed, setPetBreed] = useState("");
  const [petAge, setPetAge] = useState("");
  const [petSize, setPetSize] = useState<"pequeno" | "mediano" | "grande">("mediano");
  const [petDescription, setPetDescription] = useState("");
  const [petHistory, setPetHistory] = useState("");
  const [petPersonality, setPetPersonality] = useState("");
  const [petPersonalityType, setPetPersonalityType] = useState<"sociable" | "tranquilo" | "protector" | "jugueton">("sociable");
  const [petImages, setPetImages] = useState<string[]>([]);

  const isRefugio = user?.role === "refugio";

  const filteredPets = useMemo(() => {
    let list = tab === "my" ? myPets : tab === "adopted" ? adoptedPets : pets;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.breed.toLowerCase().includes(q));
    }
    if (speciesFilter) {
      list = list.filter((p) => p.species === speciesFilter);
    }
    return list;
  }, [tab, pets, myPets, adoptedPets, search, speciesFilter]);

  const handleCreatePet = () => {
    if (!petName.trim()) return;
    createPet(
      {
        name: petName.trim(),
        species: petSpecies,
        breed: petBreed.trim(),
        age: petAge.trim(),
        size: petSize,
        description: petDescription.trim(),
        history: petHistory.trim(),
        personality: petPersonality.trim(),
        personalityType: petPersonalityType,
        imageUris: petImages.length > 0 ? petImages : undefined,
      },
      {
        onSuccess: () => {
          setPetName("");
          setPetBreed("");
          setPetAge("");
          setPetSize("mediano");
          setPetDescription("");
          setPetHistory("");
          setPetPersonality("");
          setPetPersonalityType("sociable");
          setPetImages([]);
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
    if (petImages.length >= 3) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPetImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    if (petImages.length >= 3) return;
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPetImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setPetImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (isLoading || (tab === "adopted" && isLoadingAdopted)) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.centered}>
          <LottieView source={dogIntro} autoPlay loop style={styles.loadingLottie} />
          <Text style={styles.loadingText}>Cargando mascotas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
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

        {isRefugio ? (
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
        ) : (
          <View style={styles.tabRow}>
            <Pressable
              style={[styles.tab, tab === "browse" && styles.tabActive]}
              onPress={() => setTab("browse")}
            >
              <Text style={[styles.tabText, tab === "browse" && styles.tabTextActive]}>Disponibles</Text>
            </Pressable>
            <Pressable
              style={[styles.tab, tab === "adopted" && styles.tabActive]}
              onPress={() => setTab("adopted")}
            >
              <Text style={[styles.tabText, tab === "adopted" && styles.tabTextActive]}>Adoptados</Text>
            </Pressable>
          </View>
        )}
      </View>

      {filteredPets.length === 0 ? (
        <View style={styles.emptyState}>
          <LottieView source={catFace} autoPlay loop style={styles.emptyLottie} />
          <Text style={styles.emptyTitle}>No hay mascotas</Text>
          <Text style={styles.emptyText}>
            {tab === "adopted" ? "Aún no tienes adopciones aprobadas" : isRefugio ? "Agrega tu primera mascota en adopción" : "Pronto habrá mascotas disponibles"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPets}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const colorMap: Record<string, string> = {
              perro: "#ffb74d",
              gato: "#ce93d8",
              ave: "#90caf9",
              conejo: "#f8bbd0",
              otro: "#80deea",
            };
            const headerColor = colorMap[item.species] ?? "#bdbdbd";

            return (
              <TouchableOpacity
                style={styles.petCard}
                onPress={() => router.push(`/pets/${item.id}` as any)}
                activeOpacity={0.95}
              >
                <View style={[styles.cardTop, { backgroundColor: headerColor }]}> 
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
                  ) : (
                    <Text style={styles.petImageEmoji}>{SPECIES_EMOJI[item.species] ?? "🐾"}</Text>
                  )}
                  {!isRefugio && (
                    <Pressable
                      style={styles.favBtn}
                      onPress={() => toggleFavorite(item.id)}
                      disabled={isToggling}
                    >
                      <FontAwesome
                        name={favoriteIds.includes(item.id) ? "heart" : "heart-o"}
                        size={16}
                        color="#fff"
                      />
                    </Pressable>
                  )}
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>
                    {item.breed} {item.age ? `· ${item.age}` : ""}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
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
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalScroll}>
            <View style={styles.overlay}>
              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>🐾 Registrar mascota</Text>
                  <Text style={styles.formSub}>Completa los datos de la mascota para publicarla en adopción</Text>
                </View>
                {createError && <Text style={styles.dialogError}>{createError}</Text>}

                <View style={styles.imageSection}>
                  <Text style={styles.formLabel}>FOTOS (máximo 3)</Text>
                  <View style={styles.imageRow}>
                    <TouchableOpacity style={styles.imageAddBtn} onPress={pickImage}>
                      <Text style={styles.imageAddIcon}>🖼️</Text>
                      <Text style={styles.imageAddText}>Galería</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.imageAddBtn} onPress={takePhoto}>
                      <Text style={styles.imageAddIcon}>📷</Text>
                      <Text style={styles.imageAddText}>Cámara</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.imagePreviewRow}>
                    {petImages.map((uri, i) => (
                      <View key={i} style={styles.imagePreviewWrap}>
                        <Image source={{ uri }} style={styles.imagePreview} resizeMode="cover" />
                        <TouchableOpacity style={styles.imageRemove} onPress={() => removeImage(i)}>
                          <Text style={styles.imageRemoveText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    {Array.from({ length: Math.max(0, 3 - petImages.length) }).map((_, i) => (
                      <View key={`empty-${i}`} style={styles.imagePreviewEmpty}>
                        <Text style={styles.imagePreviewEmptyText}>{i + petImages.length + 1}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.formDivider} />

                <Text style={styles.formLabel}>NOMBRE</Text>
                <TextInput style={styles.formInput} placeholder="Nombre de la mascota" placeholderTextColor="#b8d6e0" value={petName} onChangeText={setPetName} />

                <Text style={styles.formLabel}>ESPECIE</Text>
                <View style={styles.chipRow}>
                  {SPECIES_OPTIONS.map((s) => (
                    <Pressable
                      key={s.value}
                      style={[styles.chip, petSpecies === s.value && styles.chipActive]}
                      onPress={() => setPetSpecies(s.value)}
                    >
                      <Text style={[styles.chipText, petSpecies === s.value && styles.chipTextActive]}>{s.emoji} {s.label.split(" ")[1]}</Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.formRow}>
                  <View style={styles.formRowHalf}>
                    <Text style={styles.formLabel}>RAZA</Text>
                    <TextInput style={styles.formInput} placeholder="Ej: Labrador" placeholderTextColor="#b8d6e0" value={petBreed} onChangeText={setPetBreed} />
                  </View>
                  <View style={styles.formRowHalf}>
                    <Text style={styles.formLabel}>EDAD</Text>
                    <TextInput style={styles.formInput} placeholder="Ej: 2 años" placeholderTextColor="#b8d6e0" value={petAge} onChangeText={setPetAge} />
                  </View>
                </View>

                <Text style={styles.formLabel}>TAMAÑO</Text>
                <View style={styles.chipRow}>
                  {["pequeno", "mediano", "grande"].map((s) => (
                    <Pressable
                      key={s}
                      style={[styles.chip, petSize === s && styles.chipActive]}
                      onPress={() => setPetSize(s as any)}
                    >
                      <Text style={[styles.chipText, petSize === s && styles.chipTextActive]}>
                        {s === "pequeno" ? "🐣 Pequeño" : s === "mediano" ? "🐕 Mediano" : "🦮 Grande"}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.formLabel}>DESCRIPCIÓN</Text>
                <TextInput style={[styles.formInput, styles.formInputMultiline]} placeholder="Describe a la mascota..." placeholderTextColor="#b8d6e0" value={petDescription} onChangeText={setPetDescription} multiline numberOfLines={3} />

                <Text style={styles.formLabel}>HISTORIAL</Text>
                <TextInput style={[styles.formInput, styles.formInputMultiline]} placeholder="Historial de la mascota (ej: rescatado, vacunado, etc.)" placeholderTextColor="#b8d6e0" value={petHistory} onChangeText={setPetHistory} multiline numberOfLines={3} />

                <Text style={styles.formLabel}>PERSONALIDAD</Text>
                <TextInput style={[styles.formInput, styles.formInputMultiline]} placeholder="Describe su personalidad..." placeholderTextColor="#b8d6e0" value={petPersonality} onChangeText={setPetPersonality} multiline numberOfLines={2} />

                <Text style={styles.formLabel}>TIPO DE PERSONALIDAD</Text>
                <View style={styles.chipRow}>
                  {[
                    { value: "sociable", icon: "🤗", label: "Sociable" },
                    { value: "tranquilo", icon: "😌", label: "Tranquilo" },
                    { value: "protector", icon: "🛡️", label: "Protector" },
                    { value: "jugueton", icon: "🎾", label: "Juguetón" },
                  ].map((p) => (
                    <Pressable
                      key={p.value}
                      style={[styles.chip, petPersonalityType === p.value && styles.chipActive]}
                      onPress={() => setPetPersonalityType(p.value as any)}
                    >
                      <Text style={[styles.chipText, petPersonalityType === p.value && styles.chipTextActive]}>{p.icon} {p.label}</Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.formActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCreateModal(false)}>
                    <Text style={styles.cancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.saveBtn, isCreating && styles.saveBtnDisabled]} onPress={handleCreatePet} disabled={isCreating}>
                    {isCreating ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Guardar registro</Text>}
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
  safeArea: { flex: 1, backgroundColor: "#f0f7fa" },
  bgMesh: { ...StyleSheet.absoluteFillObject, backgroundColor: "#f0f7fa" },
  blobOne: { position: "absolute", top: -120, left: -160, width: 420, height: 420, borderRadius: 999, backgroundColor: "rgba(77,168,196,0.12)" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingLottie: { width: 100, height: 100 },
  loadingText: { color: "#4da8c4", fontSize: 14, marginTop: 12, fontWeight: "600" },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", color: "#1a3a4a" },
  subtitle: { color: "rgba(77,168,196,0.7)", fontSize: 13, fontWeight: "600", marginTop: 4 },
  searchShell: { height: 50, backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "rgba(77,168,196,0.15)", paddingHorizontal: 14, flexDirection: "row", alignItems: "center", marginBottom: 12, elevation: 2, shadowColor: "#4da8c4", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 4 } },
  searchIcon: { color: "#4da8c4", fontSize: 17, marginRight: 10, fontWeight: "800" },
  searchInput: { flex: 1, color: "#1a3a4a", fontSize: 15 },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "rgba(77,168,196,0.15)" },
  filterChipActive: { backgroundColor: "rgba(77,168,196,0.12)", borderColor: "#4da8c4" },
  filterChipText: { color: "rgba(77,168,196,0.7)", fontSize: 13, fontWeight: "700" },
  filterChipTextActive: { color: "#4da8c4" },
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  tab: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "rgba(77,168,196,0.15)" },
  tabActive: { backgroundColor: "rgba(77,168,196,0.12)", borderColor: "#4da8c4" },
  tabText: { color: "rgba(77,168,196,0.7)", fontSize: 13, fontWeight: "700" },
  tabTextActive: { color: "#4da8c4" },
  listContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 140 },
  listColumn: { justifyContent: "space-between" },
  columnWrapper: { justifyContent: "space-between", gap: 12, paddingHorizontal: 8 },
  petCard: { backgroundColor: "#fff", borderRadius: 14, width: "48%", marginBottom: 12, overflow: "hidden", elevation: 3, shadowColor: "#4da8c4", shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 6 } },
  cardTop: { height: 110, alignItems: "center", justifyContent: "center", position: "relative" },
  cardImage: { width: "100%", height: "100%" },
  favBtn: { position: "absolute", top: 8, right: 8, width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.16)" },
  petImageEmoji: { fontSize: 36 },
  cardBody: { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff" },
  cardName: { fontSize: 15, fontWeight: "800", color: "#1a3a4a", marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: "rgba(77,168,196,0.6)" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  emptyLottie: { width: 120, height: 120, marginBottom: 8 },
  emptyIcon: { fontSize: 48, marginBottom: 10 },
  emptyTitle: { color: "#1a3a4a", fontSize: 20, fontWeight: "800", marginBottom: 6 },
  emptyText: { color: "rgba(77,168,196,0.7)", fontSize: 15, textAlign: "center", maxWidth: 260 },
  fab: { position: "absolute", right: 24, bottom: 110, backgroundColor: "#4da8c4", width: 60, height: 60, borderRadius: 22, justifyContent: "center", alignItems: "center", elevation: 6, shadowColor: "#4da8c4", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.36, shadowRadius: 18 },
  fabText: { color: "#fff", fontSize: 28, fontWeight: "800" },
  modalScroll: { flexGrow: 1 },
  overlay: { flex: 1, backgroundColor: "rgba(77,168,196,0.3)", justifyContent: "center", padding: 16 },
  formCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "rgba(77,168,196,0.15)" },
  formHeader: { marginBottom: 16, alignItems: "center" },
  formTitle: { fontSize: 22, fontWeight: "800", color: "#1a3a4a" },
  formSub: { color: "rgba(77,168,196,0.7)", fontSize: 12, textAlign: "center", marginTop: 4, lineHeight: 17 },
  formLabel: { fontSize: 10, fontWeight: "800", color: "#3d8fa8", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.7, marginTop: 6 },
  formInput: { borderWidth: 1, borderColor: "rgba(77,168,196,0.2)", backgroundColor: "#f0f7fa", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 8, color: "#1a3a4a", fontSize: 14 },
  formInputMultiline: { minHeight: 70, textAlignVertical: "top" },
  formRow: { flexDirection: "row", gap: 10 },
  formRowHalf: { flex: 1 },
  formDivider: { height: 1, backgroundColor: "rgba(77,168,196,0.12)", marginVertical: 10 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: "#f0f7fa", borderWidth: 1, borderColor: "rgba(77,168,196,0.15)" },
  chipActive: { backgroundColor: "rgba(77,168,196,0.12)", borderColor: "#4da8c4" },
  chipText: { color: "rgba(77,168,196,0.7)", fontSize: 12, fontWeight: "700" },
  chipTextActive: { color: "#4da8c4" },
  imageSection: { marginBottom: 4 },
  imageRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  imageAddBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: "#f0f7fa", borderWidth: 1, borderColor: "rgba(77,168,196,0.15)", borderStyle: "dashed", alignItems: "center", justifyContent: "center" },
  imageAddIcon: { fontSize: 24, marginBottom: 4 },
  imageAddText: { color: "#4da8c4", fontSize: 12, fontWeight: "700" },
  imagePreviewRow: { flexDirection: "row", gap: 8 },
  imagePreviewWrap: { width: 80, height: 80, borderRadius: 12, overflow: "hidden", position: "relative", borderWidth: 1, borderColor: "rgba(77,168,196,0.15)" },
  imagePreview: { width: "100%", height: "100%" },
  imagePreviewEmpty: { width: 80, height: 80, borderRadius: 12, backgroundColor: "#f0f7fa", borderWidth: 1, borderColor: "rgba(77,168,196,0.1)", borderStyle: "dashed", alignItems: "center", justifyContent: "center" },
  imagePreviewEmptyText: { color: "rgba(77,168,196,0.3)", fontSize: 20, fontWeight: "700" },
  imageRemove: { position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" },
  imageRemoveText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  dialogError: { color: "#ba1a1a", backgroundColor: "#ffdad6", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12, fontSize: 13, fontWeight: "600" },
  formActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 12 },
  cancelBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14, backgroundColor: "rgba(77,168,196,0.1)" },
  cancelText: { color: "#4da8c4", fontSize: 14, fontWeight: "700" },
  saveBtn: { backgroundColor: "#4da8c4", borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 6 },
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  dialog: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "rgba(77,168,196,0.15)", maxHeight: "90%" },
  dialogKicker: { color: "#4da8c4", textTransform: "uppercase", letterSpacing: 1.6, fontSize: 12, fontWeight: "800", marginBottom: 6 },
  dialogTitle: { fontSize: 22, lineHeight: 28, fontWeight: "800", color: "#1a3a4a", marginBottom: 12 },
  dialogSubtitle: { color: "rgba(77,168,196,0.7)", fontSize: 14, marginBottom: 14 },
  dialogInput: { borderWidth: 1, borderColor: "rgba(77,168,196,0.2)", backgroundColor: "#f0f7fa", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, color: "#1a3a4a", fontSize: 15 },
  dialogActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 4 },
});