import { useAiAssistant } from "@features/ai/presentation/hooks/useAiAssistant";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import LottieView from "lottie-react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNav } from "../../components/BottomNav";
import catFace from "../../assets/animations/cat_face.json";
import catPaw from "../../assets/animations/cat_paw.json";
import pawWalk from "../../assets/animations/paw_walk.json";

const PRIMARY = "#4da8c4";
const PRIMARY_LIGHT = "rgba(77,168,196,0.12)";
const PRIMARY_DARK = "#1a3a4a";
const BG = "#f0f7fa";

const SUGGESTIONS = [
  { icon: "🐕", text: "¿Cómo cuidar a un cachorro?" },
  { icon: "🐈", text: "¿Qué vacunas necesita un gato?" },
  { icon: "🥗", text: "¿Qué alimentos son tóxicos?" },
  { icon: "💊", text: "¿Cuándo llevar al veterinario?" },
];

export default function AiAssistantScreen() {
  const router = useRouter();
  const { messages, isLoading, error, sendMessage, clearChat } = useAiAssistant();
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSuggestion = (text: string) => {
    if (isLoading) return;
    sendMessage(text);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.bgPattern1} />
      <View style={styles.bgPattern2} />
      <View style={styles.bgPattern3} />
      <View style={styles.bgPattern4} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={styles.header}>
          <View style={styles.headerDeco1} />
          <View style={styles.headerDeco2} />
          <View style={styles.headerDeco3} />
          <View style={styles.headerLeft}>
            <View style={styles.aiAvatar}>
              <LottieView source={catFace} autoPlay loop style={styles.avatarLottie} />
            </View>
            <View>
              <Text style={styles.headerTitle}>PetCare AI</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.headerSub}>Asistente veterinario</Text>
              </View>
            </View>
          </View>
          <Pressable onPress={clearChat} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={14} color={PRIMARY} />
            <Text style={styles.clearBtnText}>Limpiar</Text>
          </Pressable>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={
            <View style={styles.welcomeSection}>
              <LottieView source={pawWalk} autoPlay loop style={styles.welcomeLottie} />
              <Text style={styles.welcomeTitle}>Hola, soy PetCare AI</Text>
              <Text style={styles.welcomeSub}>
                Tu asistente veterinario personal. Pregúntame lo que quieras sobre tus mascotas.
              </Text>
              <View style={styles.suggestionsRow}>
                {SUGGESTIONS.map((s, i) => (
                  <Pressable
                    key={i}
                    style={styles.suggestionChip}
                    onPress={() => handleSuggestion(s.text)}
                    disabled={isLoading}
                  >
                    <Text style={styles.suggestionIcon}>{s.icon}</Text>
                    <Text style={styles.suggestionText} numberOfLines={1}>{s.text}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          }
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.msgRow,
                item.role === "user" ? styles.msgRowUser : styles.msgRowAi,
              ]}
            >
              {item.role === "assistant" && (
                <View style={styles.msgAvatarWrap}>
                  <View style={styles.msgAvatar}>
                    <LottieView source={catPaw} autoPlay loop style={styles.msgPawLottie} />
                  </View>
                </View>
              )}
              <View
                style={[
                  styles.msgBubble,
                  item.role === "user" ? styles.msgUser : styles.msgAi,
                ]}
              >
                {item.role === "assistant" && (
                  <Text style={styles.msgAiLabel}>PetCare AI</Text>
                )}
                <Text style={[styles.msgText, item.role === "user" && styles.msgTextUser]}>
                  {item.content}
                </Text>
                <Text
                  style={[styles.msgTime, item.role === "user" && styles.msgTimeUser]}
                >
                  {item.createdAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          )}
        />

        {isLoading && (
          <View style={styles.typingIndicator}>
            <View style={styles.typingBubble}>
              <LottieView source={pawWalk} autoPlay loop style={styles.typingLottie} />
              <Text style={styles.typingText}>Pensando...</Text>
            </View>
          </View>
        )}

        {error && (
          <View style={styles.errorBar}>
            <Ionicons name="alert-circle" size={14} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.inputBar}>
          <View style={styles.inputShell}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Pregunta sobre salud de mascotas..."
              placeholderTextColor="#8bb8c8"
              multiline
              maxLength={500}
              editable={!isLoading}
            />
          </View>
          <Pressable
            style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Ionicons name="send" size={18}             color={input.trim() && !isLoading ? "#fff" : "#b8d6e0"} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <BottomNav active="ai" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },

  bgPattern1: {
    position: "absolute",
    top: 80,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(77,168,196,0.06)",
  },
  bgPattern2: {
    position: "absolute",
    top: 250,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(77,168,196,0.05)",
  },
  bgPattern3: {
    position: "absolute",
    bottom: 300,
    left: 20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(77,168,196,0.06)",
  },
  bgPattern4: {
    position: "absolute",
    bottom: 150,
    right: -20,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(77,168,196,0.04)",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: PRIMARY,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
    position: "relative",
    elevation: 6,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  headerDeco1: {
    position: "absolute",
    top: -30,
    right: -10,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  headerDeco2: {
    position: "absolute",
    bottom: -25,
    left: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(77,168,196,0.15)",
  },
  headerDeco3: {
    position: "absolute",
    top: 10,
    right: 100,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, zIndex: 1 },
  aiAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarLottie: { width: 34, height: 34 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#34D399",
  },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: "600" },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    zIndex: 1,
  },
  clearBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  welcomeSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  welcomeLottie: { width: 80, height: 80, marginBottom: 8 },
  welcomeTitle: {
    color: PRIMARY_DARK,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  welcomeSub: {
    color: PRIMARY,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 16,
    fontWeight: "500",
  },
  suggestionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: PRIMARY_LIGHT,
    elevation: 2,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  suggestionIcon: { fontSize: 14 },
  suggestionText: { color: PRIMARY_DARK, fontSize: 11, fontWeight: "600" },

  messagesContent: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 140,
    flexGrow: 1,
  },

  msgRow: {
    flexDirection: "row",
    marginBottom: 8,
    maxWidth: "90%",
  },
  msgRowUser: { alignSelf: "flex-end" },
  msgRowAi: { alignSelf: "flex-start" },

  msgAvatarWrap: { marginRight: 6, alignSelf: "flex-end" },
  msgAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  msgPawLottie: { width: 18, height: 18 },

  msgBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  msgUser: {
    backgroundColor: PRIMARY,
    borderBottomRightRadius: 4,
    shadowColor: PRIMARY,
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  msgAi: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: PRIMARY_LIGHT,
  },

  msgAiLabel: {
    color: PRIMARY,
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  msgText: { color: "#1F2937", fontSize: 14, lineHeight: 20 },
  msgTextUser: { color: "#FFFFFF" },
  msgTime: {     color: "rgba(77,168,196,0.3)", fontSize: 9, marginTop: 4, textAlign: "right" },
  msgTimeUser: { color: "rgba(255,255,255,0.5)" },

  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PRIMARY_LIGHT,
    elevation: 2,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  typingLottie: { width: 32, height: 32, marginRight: 6 },
  typingText: { color: PRIMARY, fontSize: 13, fontWeight: "600" },

  errorBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 16,
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: { color: "#DC2626", fontSize: 12, fontWeight: "600", flex: 1 },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 110,
  },
  inputShell: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: PRIMARY_LIGHT,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 3,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  input: { color: "#1F2937", fontSize: 14, maxHeight: 90 },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  sendBtnDisabled: { backgroundColor: PRIMARY_LIGHT, elevation: 0, shadowOpacity: 0 },
});
