export type AdoptionStatus = "pendiente" | "aprobada" | "rechazada";

export interface AdoptionRequest {
  id: string;
  petId: string;
  petName: string | null;
  adoptanteId: string;
  adoptanteName: string | null;
  refugioId: string;
  status: AdoptionStatus;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}