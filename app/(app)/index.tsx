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
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { BottomNav } from "../../components/BottomNav";

import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatListScreen() {
  const user = useAuthStore((s) => s.user);
  const { rooms, isLoading } = useRooms();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const isRefugio = user?.role === "refugio";

  const filteredRooms = useMemo(
    () =>
      rooms.filter((room) =>
        (room.petName ?? room.name).toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [rooms, search],
  );

  const buildAvatarUrl = (seed: string, style: "thumbs" | "bottts" = "thumbs") =>
    `https://api.dicebear.com/9.x/${style}/png?seed=${encodeURIComponent(seed)}`;

  const profileSource = user?.avatarUrl
    ? { uri: user.avatarUrl }
    : { uri: buildAvatarUrl(user?.username ?? user?.email ?? "user", "thumbs") };

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

    const avatarSource = { uri: buildAvatarUrl(`${item.id}-${item.petName ?? item.name}`, "bottts") };

    const displayName = item.petName ?? item.name;
    const subtitle = item.lastMessage
      ? item.lastMessage.length > 60
        ? item.lastMessage.slice(0, 60) + "..."
        : item.lastMessage
      : "Toca para abrir la conversación.";

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
                {displayName}
              </Text>
              <Text style={styles.roomDate}>
                {item.lastMessageAt
                  ? item.lastMessageAt.toLocaleDateString()
                  : item.createdAt.toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.roomBottomRow}>
              <Text style={styles.roomPreview} numberOfLines={1}>
                {subtitle}
              </Text>
              <View style={styles.roomPill}>
                <Text style={styles.roomPillText}>Chat</Text>
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
                <Text style={styles.title}>
                  {isRefugio ? "Adopciones" : "Mis adopciones"}
                </Text>
                <Text style={styles.subtitle}>
                  {filteredRooms.length > 0
                    ? `${filteredRooms.length} conversación${filteredRooms.length !== 1 ? "es" : ""} activa${filteredRooms.length !== 1 ? "s" : ""}`
                    : "Conversaciones sobre adopciones"}
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
                  <Text style={styles.stackAvatarCountText}>+{Math.max(0, rooms.length)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.searchShell}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar conversaciones..."
                placeholderTextColor="#777586"
              />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {isRefugio ? "Solicitudes con chat" : "Mis conversaciones"}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🐾</Text>
            <Text style={styles.emptyTitle}>Sin conversaciones</Text>
            <Text style={styles.empty}>
              {isRefugio
                ? "Cuando alguien solicite adoptar una mascota, aparecerá aquí su conversación."
                : "Solicita adoptar una mascota para iniciar una conversación con el refugio."}
            </Text>
          </View>
        }
      />

      <BottomNav active="chat" />
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
});
