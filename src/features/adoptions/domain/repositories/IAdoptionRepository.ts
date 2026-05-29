import { AdoptionRequest } from "../entities/AdoptionRequest";

export interface IAdoptionRepository {
  getRequestsForShelter(refugioId: string): Promise<AdoptionRequest[]>;
  getRequestsForAdoptante(adoptanteId: string): Promise<AdoptionRequest[]>;
  createRequest(petId: string, adoptanteId: string, message: string): Promise<AdoptionRequest>;
  respondRequest(requestId: string, status: AdoptionRequest["status"]): Promise<AdoptionRequest>;
  updateRoomId(requestId: string, roomId: string): Promise<void>;
}
