import { SendAiMessageUseCase } from "@features/ai/application/use-cases/SendAiMessageUseCase";
import { AiMessage } from "@features/ai/domain/entities/AiMessage";
import { GeminiAiRepository } from "@features/ai/infrastructure/repositories/GeminiAiRepository";
import { useState } from "react";

const aiRepo = new GeminiAiRepository();
const sendAiMessageUseCase = new SendAiMessageUseCase(aiRepo);

function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "• ")
    .replace(/^\d+\.\s+/gm, (m) => m)
    .replace(/`([^`]+)`/g, "$1")
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?/g, "").trim());
}

export function useAiAssistant() {
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "¡Hola! Soy PetCare AI, tu asistente veterinario. Pregúntame sobre salud y cuidados de mascotas. Recuerda que no sustituyo una consulta veterinaria profesional.",
      createdAt: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: AiMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendAiMessageUseCase.execute(messages.slice(1), content.trim());
      const assistantMsg: AiMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: cleanMarkdown(response),
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al comunicarse con el asistente");
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "¡Hola! Soy PetCare AI, tu asistente veterinario. Pregúntame sobre salud y cuidados de mascotas. Recuerda que no sustituyo una consulta veterinaria profesional.",
        createdAt: new Date(),
      },
    ]);
    setError(null);
  };

  return { messages, isLoading, error, sendMessage, clearChat };
}