import { Message } from "../entities/Message";
import { Room } from "../entities/Room";

export type SendMessageInput = {
  content?: string;
  imageUri?: string | null;
};

export interface IChatRepository {
  getRooms(userId: string, role: string): Promise<Room[]>;
  createRoom(name: string, createdBy: string, petId?: string, adoptanteId?: string, refugioId?: string): Promise<Room>;
  getMessages(roomId: string): Promise<Message[]>;
  sendMessage(
    roomId: string,
    userId: string,
    input: SendMessageInput,
  ): Promise<Message>;
  subscribeToRoom(
    roomId: string,
    onMessage: (msg: Message) => void,
  ): () => void;
}
