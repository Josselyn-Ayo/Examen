import { AiMessage } from "../entities/AiMessage";

export interface IAiRepository {
  sendMessage(conversationHistory: AiMessage[], userMessage: string): Promise<string>;
}