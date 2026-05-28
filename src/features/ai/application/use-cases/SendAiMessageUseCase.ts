import { AppError } from "../../../../shared/domain/errors/AppError";
import { AiMessage } from "../../domain/entities/AiMessage";
import { IAiRepository } from "../../domain/repositories/IAiRepository";

export class SendAiMessageUseCase {
  constructor(private readonly aiRepo: IAiRepository) {}

  async execute(conversationHistory: AiMessage[], userMessage: string): Promise<string> {
    if (!userMessage.trim()) throw new AppError("AI_ERROR", "El mensaje no puede estar vacío");
    try {
      return await this.aiRepo.sendMessage(conversationHistory, userMessage);
    } catch (error) {
      throw new AppError("AI_ERROR", error instanceof Error ? error.message : "Error al comunicarse con el asistente", error);
    }
  }
}