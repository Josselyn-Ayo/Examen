export interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}