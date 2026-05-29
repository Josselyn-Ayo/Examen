import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { Message } from "@features/chat/domain/entities/Message";
import { useChat } from "@features/chat/presentation/hooks/useChat";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import chatLoading from "../../../assets/animations/chat_loading.json";

export default function ChatScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { messages, sendMessage, isSending, retrySend } = useChat(roomId);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [input, setInput] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const handleSend = useCallback(async () => {
    if (!input.trim() && !imageUri) return;
    sendMessage({ content: input.trim(), imageUri });
    setInput("");
    setImageUri(null);
  }, [imageUri, input, sendMessage]);

  const handlePickImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permiso requerido", "Necesitamos permiso para acceder a tus imágenes.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  }, []);

  const renderMsg = ({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.userId === user?.id;
    const prevMsg = messages[index - 1];
    const isSameUser = prevMsg && prevMsg.userId === item.userId;
    const showAvatar = !isOwn && !isSameUser;

    return (
      <View
        style={[
          styles.msgRow,
          isOwn ? styles.msgRowOwn : styles.msgRowOther,
          !isSameUser && styles.msgRowFirst,
        ]}
      >
        {!isOwn && (
          <View style={styles.avatarCol}>
            {showAvatar ? (
              <View style={styles.msgAvatar}>
                <Text style={styles.msgAvatarText}>
                  {(item.authorUsername ?? "C").slice(0, 1).toUpperCase()}
                </Text>
              </View>
            ) : (
              <View style={styles.avatarSpacer} />
            )}
          </View>
        )}

        <View style={[styles.bubbleWrap, isOwn && styles.bubbleWrapOwn]}>
          {showAvatar && (
            <Text style={styles.authorName}>{item.authorUsername ?? "Usuario"}</Text>
          )}
          <View
            style={[
              styles.bubble,
              isOwn ? styles.bubbleOwn : styles.bubbleOther,
              isSameUser && isOwn && styles.bubbleOwnChain,
              isSameUser && !isOwn && styles.bubbleOtherChain,
            ]}
          >
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.msgImage} resizeMode="cover" />
            ) : null}
            {item.content.trim() ? (
              <Text style={[styles.msgText, isOwn && styles.msgTextOwn]}>{item.content}</Text>
            ) : item.imageUrl ? (
              <Text style={[styles.msgText, isOwn && styles.msgTextOwn]}>Imagen</Text>
            ) : null}
          </View>
          <View style={styles.msgMeta}>
            <Text style={[styles.msgTime, isOwn && styles.msgTimeOwn]}>
              {item.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
            {item.failed && (
              <TouchableOpacity onPress={() => retrySend(item.id)} style={styles.retryBtn}>
                <Ionicons name="refresh" size={12} color="#EF4444" />
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const chatPartner = messages.find((m) => m.authorUsername && m.userId !== user?.id)?.authorUsername ?? "Chat";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <View style={styles.header}>
          <View style={styles.headerDeco} />
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerAvatarWrap}>
              <View style={styles.headerAvatar}>
                <Text style={styles.headerAvatarText}>
                  {chatPartner.slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={styles.onlineDot} />
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>{chatPartner}</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDotSmall} />
                <Text style={styles.headerSubtitle}>En línea</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.infoBtn} activeOpacity={0.85}>
            <Ionicons name="ellipsis-vertical" size={18} color="#4da8c4" />
          </TouchableOpacity>
        </View>

        <View style={styles.chatBg}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderMsg}
            contentContainerStyle={
              messages.length === 0 ? styles.emptyContent : styles.chatContent
            }
            ListHeaderComponent={
              <View style={styles.dateSeparator}>
                <View style={styles.dateLine} />
                <View style={styles.datePill}>
                  <Text style={styles.datePillText}>Hoy</Text>
                </View>
                <View style={styles.dateLine} />
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <LottieView source={chatLoading} autoPlay loop style={styles.emptyLottie} />
                <Text style={styles.emptyTitle}>Inicia la conversación</Text>
                <Text style={styles.emptyText}>
                  Coordina la visita para conocer a la mascota.
                </Text>
              </View>
            }
          />
        </View>

        <View style={styles.footer}>
          {imageUri && (
            <View style={styles.previewWrap}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <TouchableOpacity style={styles.previewRemove} onPress={() => setImageUri(null)}>
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.attachBtn}
              activeOpacity={0.85}
              onPress={handlePickImage}
            >
              <Ionicons name="camera-outline" size={22} color="#4da8c4" />
            </TouchableOpacity>

            <View style={styles.inputShell}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Escribe un mensaje..."
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={500}
                blurOnSubmit={false}
                onSubmitEditing={() => {}}
                returnKeyType="default"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!input.trim() && !imageUri) || isSending
                  ? styles.sendBtnDisabled
                  : styles.sendBtnActive,
              ]}
              onPress={handleSend}
              activeOpacity={0.9}
              disabled={isSending || (!input.trim() && !imageUri)}
            >
              <Ionicons
                name="send"
                size={18}
                color={(!input.trim() && !imageUri) || isSending ? "#9CA3AF" : "#fff"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#4da8c4" },
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#4da8c4",
    position: "relative",
    overflow: "hidden",
  },
  headerDeco: {
    position: "absolute",
    top: -30,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  headerAvatarWrap: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  headerAvatarText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  onlineDot: {
    position: "absolute",
    right: 0,
    bottom: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#34D399",
    borderWidth: 2,
    borderColor: "#4da8c4",
  },
  headerInfo: { justifyContent: "center" },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "800" },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  onlineDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34D399",
  },
  headerSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: "600" },
  infoBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  chatBg: {
    flex: 1,
    backgroundColor: "#f0f7fa",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },

  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  emptyContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },

  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 4,
  },
  dateLine: { flex: 1, height: 1, backgroundColor: "#b8d6e0" },
  datePill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(77,168,196,0.1)",
    marginHorizontal: 10,
  },
  datePillText: { color: "#4da8c4", fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyLottie: { width: 120, height: 120, marginBottom: 12 },
  emptyTitle: { color: "#1a3a4a", fontSize: 20, fontWeight: "800", marginBottom: 6 },
  emptyText: { color: "#4da8c4", fontSize: 14, textAlign: "center", lineHeight: 20 },

  msgRow: {
    flexDirection: "row",
    marginBottom: 4,
    maxWidth: "88%",
  },
  msgRowOwn: { alignSelf: "flex-end" },
  msgRowOther: { alignSelf: "flex-start" },
  msgRowFirst: { marginBottom: 8 },

  avatarCol: { width: 32, alignItems: "center", paddingTop: 2 },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(77,168,196,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  msgAvatarText: { color: "#4da8c4", fontSize: 11, fontWeight: "800" },
  avatarSpacer: { width: 28, height: 28 },

  bubbleWrap: { maxWidth: "88%" },
  bubbleWrapOwn: { alignItems: "flex-end" },

  authorName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4da8c4",
    marginBottom: 4,
    marginLeft: 4,
    letterSpacing: 0.3,
  },

  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  bubbleOwn: {
    backgroundColor: "#4da8c4",
    borderBottomRightRadius: 6,
  },
  bubbleOther: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(77,168,196,0.12)",
  },
  bubbleOwnChain: { borderTopRightRadius: 6 },
  bubbleOtherChain: { borderTopLeftRadius: 6 },

  msgImage: {
    width: 200,
    height: 200,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: "rgba(77,168,196,0.08)",
  },

  msgText: { fontSize: 15, lineHeight: 21, color: "#1F2937" },
  msgTextOwn: { color: "#FFFFFF" },

  msgMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 2,
    paddingHorizontal: 4,
  },
  msgTime: { fontSize: 10, color: "#9CA3AF", fontWeight: "600" },
  msgTimeOwn: { color: "rgba(255,255,255,0.55)" },

  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginLeft: 8,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  retryText: { color: "#EF4444", fontSize: 10, fontWeight: "700" },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "rgba(77,168,196,0.12)",
  },

  previewWrap: {
    alignSelf: "flex-start",
    width: 100,
    height: 100,
    borderRadius: 16,
    marginBottom: 10,
    overflow: "hidden",
    backgroundColor: "rgba(77,168,196,0.08)",
    borderWidth: 2,
    borderColor: "rgba(77,168,196,0.15)",
    elevation: 2,
    shadowColor: "#4da8c4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  previewImage: { width: "100%", height: "100%" },
  previewRemove: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },

  attachBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(77,168,196,0.1)",
    borderWidth: 1,
    borderColor: "rgba(77,168,196,0.15)",
    marginBottom: 2,
  },

  inputShell: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderRadius: 23,
    backgroundColor: "#f0f7fa",
    borderWidth: 1.5,
    borderColor: "rgba(77,168,196,0.15)",
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  input: {
    color: "#1F2937",
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 10,
  },

  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  sendBtnDisabled: {
    backgroundColor: "#F3F4F6",
  },
  sendBtnActive: {
    backgroundColor: "#4da8c4",
    elevation: 4,
    shadowColor: "#4da8c4",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
