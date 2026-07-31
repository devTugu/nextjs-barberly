export interface ServiceOutput {
  id: number;
  tenantId: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  isActive: boolean;
  sortOrder: number;
  templateKey?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceInput {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  sortOrder?: number;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string | null;
  durationMinutes?: number;
  price?: number;
  isActive?: boolean;
  sortOrder?: number;
}
