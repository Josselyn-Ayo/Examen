import { useAiAssistant } from "@features/ai/presentation/hooks/useAiAssistant";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { BottomNav } from "../../components/BottomNav";

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bgMesh} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.aiAvatar}>
              <Text style={styles.aiAvatarEmoji}>🤖</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>PetCare AI</Text>
              <Text style={styles.headerSub}>Asistente veterinario</Text>
            </View>
          </View>
          <Pressable onPress={clearChat} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Limpiar</Text>
          </Pressable>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={[styles.msgBubble, item.role === "user" ? styles.msgUser : styles.msgAi]}>
              <Text style={[styles.msgText, item.role === "user" && styles.msgTextUser]}>
                {item.content}
              </Text>
              <Text style={styles.msgTime}>
                {item.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          )}
        />

        {isLoading && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color="#cebdff" />
            <Text style={styles.typingText}>Pensando...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBar}>
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
              placeholderTextColor="#777586"
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
            <Text style={styles.sendBtnText}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <BottomNav active="ai" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0c0e12" },
  bgMesh: { ...StyleSheet.absoluteFillObject, backgroundColor: "#0c0e12" },
  flex: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  aiAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(124,77,255,0.2)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  aiAvatarEmoji: { fontSize: 22 },
  headerTitle: { color: "#f4e9ff", fontSize: 17, fontWeight: "800" },
  headerSub: { color: "rgba(244,233,255,0.6)", fontSize: 12, fontWeight: "600" },
  clearBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  clearBtnText: { color: "#cebdff", fontSize: 13, fontWeight: "700" },
  messagesContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 140, flexGrow: 1 },
  msgBubble: { maxWidth: "85%", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 10 },
  msgUser: { alignSelf: "flex-end", backgroundColor: "#7c4dff", borderBottomRightRadius: 4 },
  msgAi: { alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.07)", borderBottomLeftRadius: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  msgText: { color: "#f4e9ff", fontSize: 15, lineHeight: 21 },
  msgTextUser: { color: "#fff" },
  msgTime: { color: "rgba(244,233,255,0.4)", fontSize: 10, marginTop: 4, textAlign: "right" },
  typingIndicator: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 6 },
  typingText: { color: "rgba(244,233,255,0.5)", fontSize: 13 },
  errorBar: { marginHorizontal: 16, marginVertical: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: "rgba(255,82,130,0.15)" },
  errorText: { color: "#ffd8e1", fontSize: 13 },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 110 },
  inputShell: { flex: 1, minHeight: 48, maxHeight: 120, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", paddingHorizontal: 16, paddingVertical: 12 },
  input: { color: "#f4e9ff", fontSize: 15, maxHeight: 96 },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#7c4dff", alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: "#fff", fontSize: 20, fontWeight: "800" },
  bottomNav: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20, backgroundColor: "rgba(12,14,18,0.9)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  bottomNavInner: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 26, paddingVertical: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  navItem: { flexDirection: "column", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6 },
  navItemActive: { backgroundColor: "rgba(206,189,255,0.12)", borderRadius: 16, paddingHorizontal: 16 },
  navIcon: { fontSize: 18, color: "rgba(226,226,231,0.62)" },
  navIconActive: { fontSize: 18, color: "#cebdff", fontWeight: "800" },
  navLabel: { fontSize: 10, color: "rgba(226,226,231,0.62)", marginTop: 3, fontWeight: "700" },
  navLabelActive: { fontSize: 10, color: "#cebdff", marginTop: 3, fontWeight: "800" },
});