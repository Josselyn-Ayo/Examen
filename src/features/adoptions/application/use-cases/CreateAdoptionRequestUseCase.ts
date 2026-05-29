import { AppError } from "../../../../shared/domain/errors/AppError";
import { IChatRepository } from "../../../chat/domain/repositories/IChatRepository";
import { IAdoptionRepository } from "../../domain/repositories/IAdoptionRepository";

export class CreateAdoptionRequestUseCase {
  constructor(
    private readonly adoptionRepo: IAdoptionRepository & { updateRoomId: (requestId: string, roomId: string) => Promise<void> },
    private readonly chatRepo?: IChatRepository,
  ) {}

  async execute(petId: string, adoptanteId: string, message: string) {
    if (!message.trim()) throw new AppError("ADOPTION_ERROR", "Incluye un mensaje para el refugio");
    try {
      const request = await this.adoptionRepo.createRequest(petId, adoptanteId, message);

      if (this.chatRepo && request.refugioId) {
        const roomName = `Adopción: ${request.petName ?? "Mascota"}`;
        const room = await this.chatRepo.createRoom(roomName, adoptanteId, petId, adoptanteId, request.refugioId).catch((err) => {
          console.warn("[CreateAdoptionRequestUseCase] error creating chat room:", err);
          return null;
        });
        if (room) {
          await this.adoptionRepo.updateRoomId(request.id, room.id);
        }
      }

      return request;
    } catch (error) {
      throw new AppError("ADOPTION_ERROR", (error as any)?.message ?? String(error), error);
    }
  }
}
