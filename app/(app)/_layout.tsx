import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="chat/[roomId]" />
      <Stack.Screen name="pets/index" />
      <Stack.Screen name="pets/[petId]" />
      <Stack.Screen name="adoptions" />
      <Stack.Screen name="adoption-form" />
      <Stack.Screen name="ai-assistant" />
      <Stack.Screen name="map" />
      <Stack.Screen name="editar-perfil" />
      <Stack.Screen name="privacidad" />
      <Stack.Screen name="ayuda" />
    </Stack>
  );
}