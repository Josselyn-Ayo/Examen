import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { Room } from "@features/chat/domain/entities/Room";
import { useRooms } from "@features/chat/presentation/hooks/useRooms";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { BottomNav } from "../../components/BottomNav";

import { SafeAreaView } from "react-native-safe-area-context";

export default function RoomsScreen() {
  const user = useAuthStore((s) => s.user);
  const { rooms, isLoading, createRoom, isCreating, createError, canCreateRooms } = useRooms();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [search, setSearch] = useState("");

  const filteredRooms = useMemo(
    () =>
      rooms.filter((room) =>
        room.name.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [rooms, search],
  );

  const handleCreate = () => {
    if (!roomName.trim() || isCreating) return;
    createRoom(roomName.trim(), {
      onSuccess: () => {
        setRoomName("");
        setModalVisible(false);
      },
    });
  };

  const buildAvatarUrl = (seed: string, style: "thumbs" | "bottts" = "thumbs") =>
    `https://api.dicebear.com/9.x/${style}/png?seed=${encodeURIComponent(seed)}`;

  const profileSource = user?.avatarUrl
    ? { uri: user.avatarUrl }
    : { uri: buildAvatarUrl(user?.username ?? user?.email ?? "user", "thumbs") };

  const hashCode = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i) | 0;
    return h;
  };

  function ChatListItem({ item }: { item: Room }) {
    const scale = useRef(new Animated.Value(1)).current;
    const floatY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(floatY, { toValue: -6, duration: 2400, useNativeDriver: true }),
          Animated.timing(floatY, { toValue: 0, duration: 2400, useNativeDriver: true }),
        ]),
      );
      anim.start();
      return () => anim.stop();
    }, [floatY]);

    const onPressIn = () => Animated.spring(scale, { toValue: 0.985, useNativeDriver: true }).start();
    const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

    const avatarSource = { uri: buildAvatarUrl(`${item.id}-${item.name}`, "bottts") };

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/chat/${item.id}`)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View style={[styles.roomItem, { transform: [{ scale }] }]}>
          <Animated.Image
            source={avatarSource}
            style={[styles.roomAvatar, styles.avatarImage, { transform: [{ translateY: floatY }] }]}
            resizeMode="cover"
          />
          <View style={styles.roomContent}>
            <View style={styles.roomTopRow}>
              <Text style={styles.roomName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.roomDate}>{item.createdAt.toLocaleDateString()}</Text>
            </View>
            <View style={styles.roomBottomRow}>
              <Text style={styles.roomPreview} numberOfLines={1}>
                Toca para abrir la sala y continuar la conversación.
              </Text>
              <View style={styles.roomPill}>
                <Text style={styles.roomPillText}>Open</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4da8c4" />
        </View>
      </SafeAreaView>
    );
  }

  return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.bgMesh} />
        <View style={styles.blobOne} />
        <View style={styles.blobTwo} />
        <View style={styles.blobThree} />

      <FlatList
        data={filteredRooms}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => <ChatListItem item={item} />}
        contentContainerStyle={
          filteredRooms.length === 0 ? styles.emptyListContent : styles.listContent
        }
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
                <Text style={styles.iconButtonText}>☰</Text>
              </TouchableOpacity>
              <View style={styles.topActions}>
                <View style={styles.profileBubble}>
                  <Image source={profileSource} style={styles.profileBubbleImage} resizeMode="cover" />
                </View>
              </View>
            </View>

            <View style={styles.heroRow}>
              <View style={styles.heroTextBlock}>
                <Text style={styles.title}>Messages</Text>
                <Text style={styles.subtitle}>
                  {filteredRooms.length} active conversations
                </Text>
              </View>
              <View style={styles.stackAvatars}>
                <View style={styles.stackAvatar}>
                  <Image source={profileSource} style={styles.stackAvatarImage} resizeMode="cover" />
                </View>
                <View style={styles.stackAvatar}>
                  <Image source={{ uri: buildAvatarUrl("team-alpha", "bottts") }} style={styles.stackAvatarImage} resizeMode="cover" />
                </View>
                <View style={styles.stackAvatarCount}>
                  <Text style={styles.stackAvatarCountText}>+12</Text>
                </View>
              </View>
            </View>

            <View style={styles.searchShell}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search chats and rooms..."
                placeholderTextColor="#777586"
              />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Chats</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✦</Text>
            <Text style={styles.emptyTitle}>No hay chats</Text>
            <Text style={styles.empty}>
              {user?.role === "refugio"
                ? "Crea una sala para empezar a atender consultas."
                : "Crea una sala para comunicarte con el refugio."}
            </Text>
          </View>
        }
      />

      {canCreateRooms ? (
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.9}>
          <Text style={styles.fabText}>💬</Text>
        </TouchableOpacity>
      ) : null}

      <BottomNav active="chat" />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.dialog}>
            <Text style={styles.dialogKicker}>Create room</Text>
            <Text style={styles.dialogTitle}>Nueva sala</Text>
            {createError && <Text style={styles.dialogError}>{createError}</Text>}
            <TextInput
              style={styles.dialogInput}
              placeholder="Nombre de la sala"
              value={roomName}
              onChangeText={setRoomName}
              autoFocus
              maxLength={50}
            />
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createBtn, isCreating && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.createText}>Crear</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f7fa",
  },
  bgMesh: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#f0f7fa",
  },
  blobOne: {
    position: "absolute",
    top: -120,
    left: -160,
    width: 420,
    height: 420,
    borderRadius: 999,
    backgroundColor: "rgba(77, 168, 196, 0.12)",
  },
  blobTwo: {
    position: "absolute",
    right: -120,
    bottom: -120,
    width: 460,
    height: 460,
    borderRadius: 999,
    backgroundColor: "rgba(77, 168, 196, 0.08)",
  },
  blobThree: {
    position: "absolute",
    top: "42%",
    right: 24,
    width: 300,
    height: 300,
    borderRadius: 999,
    backgroundColor: "rgba(240, 247, 250, 0.9)",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 140,
  },
  emptyListContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 140,
  },
  headerWrap: {
    marginTop: 4,
    marginBottom: 18,
  },
  topBar: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(77,168,196,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(77,168,196,0.12)",
  },
  iconButtonText: {
    color: "#4da8c4",
    fontSize: 17,
    fontWeight: "800",
  },
  title: {
    fontFamily: "System",
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "800",
    color: "#1a3a4a",
  },
  subtitle: {
    marginTop: 6,
    color: "rgba(77,168,196,0.7)",
    fontSize: 13,
    fontWeight: "600",
  },
  profileBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(77,168,196,0.1)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(77,168,196,0.15)",
  },
  profileBubbleImage: {
    width: 36,
    height: 36,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 18,
  },
  heroTextBlock: {
    flex: 1,
    paddingRight: 8,
  },
  stackAvatars: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  stackAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#f0f7fa",
    overflow: "hidden",
    marginLeft: -8,
    backgroundColor: "rgba(77,168,196,0.1)",
  },
  stackAvatarImage: {
    width: 36,
    height: 36,
  },
  stackAvatarCount: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#f0f7fa",
    marginLeft: -8,
    backgroundColor: "rgba(77,168,196,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  stackAvatarCountText: {
    color: "#4da8c4",
    fontSize: 10,
    fontWeight: "800",
  },
  searchShell: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(77,168,196,0.15)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#4da8c4",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  searchIcon: {
    color: "#4da8c4",
    fontSize: 17,
    marginRight: 10,
    fontWeight: "800",
  },
  searchInput: {
    flex: 1,
    color: "#1a3a4a",
    fontSize: 15,
  },
  sectionHeader: {
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#4da8c4",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "800",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 90,
  },
  emptyIcon: {
    color: "#4da8c4",
    fontSize: 28,
    marginBottom: 10,
    fontWeight: "800",
  },
  emptyTitle: {
    color: "#1a3a4a",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },
  empty: {
    color: "rgba(77,168,196,0.7)",
    fontSize: 15,
    textAlign: "center",
    maxWidth: 260,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  roomItem: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(77,168,196,0.12)",
    borderRadius: 30,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#4da8c4",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  roomAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(77,168,196,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  roomAvatarText: {
    color: "#4da8c4",
    fontSize: 22,
    fontWeight: "800",
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    marginRight: 16,
  },
  roomContent: {
    flex: 1,
  },
  roomTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 6,
    gap: 10,
  },
  roomBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  roomName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#1a3a4a",
  },
  roomDate: {
    fontSize: 10,
    color: "rgba(77,168,196,0.6)",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  roomPreview: {
    flex: 1,
    color: "rgba(77,168,196,0.6)",
    fontSize: 14,
  },
  roomPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(77,168,196,0.1)",
  },
  roomPillText: {
    color: "#4da8c4",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 110,
    backgroundColor: "#4da8c4",
    width: 64,
    height: 64,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#4da8c4",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.36,
    shadowRadius: 18,
  },
  fabText: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "800",
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 22,
    backgroundColor: "rgba(240,247,250,0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(77,168,196,0.12)",
  },
  bottomNavInner: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 26,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(77,168,196,0.1)",
    shadowColor: "#4da8c4",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -6 },
  },
  navItemActive: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(77,168,196,0.1)",
    borderRadius: 18,
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  navItem: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  navIconActive: {
    color: "#4da8c4",
    fontSize: 18,
    fontWeight: "800",
  },
  navLabelActive: {
    color: "#4da8c4",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "800",
  },
  navIcon: {
    color: "rgba(77,168,196,0.5)",
    fontSize: 18,
    fontWeight: "800",
  },
  navLabel: {
    color: "rgba(77,168,196,0.5)",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "700",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(77,168,196,0.3)",
    justifyContent: "center",
    padding: 24,
  },
  dialog: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(77,168,196,0.15)",
  },
  dialogKicker: {
    color: "#4da8c4",
    textTransform: "uppercase",
    letterSpacing: 1.6,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
  },
  dialogTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    color: "#1a3a4a",
    marginBottom: 12,
  },
  dialogError: {
    color: "#ba1a1a",
    backgroundColor: "#ffdad6",
    borderRadius: 14,
    fontSize: 13,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dialogInput: {
    borderWidth: 1,
    borderColor: "rgba(77,168,196,0.2)",
    backgroundColor: "#f0f7fa",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    color: "#1a3a4a",
  },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(77,168,196,0.1)",
  },
  cancelText: { color: "#4da8c4", fontSize: 15, fontWeight: "700" },
  createBtn: {
    backgroundColor: "#4da8c4",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  createText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});

