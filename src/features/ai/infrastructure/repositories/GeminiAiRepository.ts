import { AiMessage } from "../../domain/entities/AiMessage";
import { IAiRepository } from "../../domain/repositories/IAiRepository";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const SYSTEM_PROMPT = `Eres un asistente veterinario experto llamado "PetCare AI". Respondes preguntas sobre salud y cuidados de mascotas (perros, gatos, aves, conejos, etc.). 
Siempre responde en español. Sé amable, claro y útil. Si la pregunta no está relacionada con mascotas, redirige cortésmente al tema.
IMPORTANTE: Aclara siempre que no sustituyes la consulta veterinaria profesional y que ante emergencias deben acudir a un veterinario.`;

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 2000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class GeminiAiRepository implements IAiRepository {
  async sendMessage(conversationHistory: AiMessage[], userMessage: string): Promise<string> {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API key no configurada");

    const contents = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: "Entendido. Soy PetCare AI, un asistente veterinario. Estoy listo para ayudar con consultas sobre salud y cuidados de mascotas en español." }] },
      ...conversationHistory
        .filter((msg) => msg.role !== "assistant" || msg.content.trim() !== "")
        .slice(-10)
        .map((msg) => ({
          role: msg.role === "user" ? "user" : ("model" as const),
          parts: [{ text: msg.content }],
        })),
      { role: "user" as const, parts: [{ text: userMessage }] },
    ];

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents }),
        });

        if (response.status === 429) {
          const retryAfter = response.headers.get("retry-after");
          const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : INITIAL_DELAY_MS * Math.pow(2, attempt);
          if (attempt < MAX_RETRIES - 1) {
            await delay(waitMs);
            continue;
          }
          throw new Error("El asistente está muy ocupado en este momento. Por favor intenta de nuevo en unos segundos.");
        }

        if (response.status === 503) {
          if (attempt < MAX_RETRIES - 1) {
            await delay(INITIAL_DELAY_MS * Math.pow(2, attempt));
            continue;
          }
          throw new Error("El servicio no está disponible temporalmente. Intenta de nuevo en un momento.");
        }

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Error de conexión (${response.status}). Intenta de nuevo.`);
        }

        const data: any = await response.json();

        if (data?.promptFeedback?.blockReason) {
          throw new Error("No puedo responder esa pregunta. Intenta con otra consulta sobre mascotas.");
        }

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          const finishReason = data?.candidates?.[0]?.finishReason;
          if (finishReason === "SAFETY") {
            throw new Error("No puedo responder esa pregunta por políticas de seguridad. Reformula tu consulta sobre mascotas.");
          }
          throw new Error("No se recibió respuesta del asistente. Intenta de nuevo.");
        }

        return text;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Error desconocido");
        if (attempt < MAX_RETRIES - 1) {
          await delay(INITIAL_DELAY_MS * Math.pow(2, attempt));
          continue;
        }
      }
    }

    throw lastError ?? new Error("No se pudo conectar con el asistente. Intenta de nuevo más tarde.");
  }
}