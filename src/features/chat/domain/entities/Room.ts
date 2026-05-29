export interface Room {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  petId?: string;
  petName?: string;
  adoptanteId?: string;
  refugioId?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
}
