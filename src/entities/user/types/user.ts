export interface UserOutput {
  id: number;
  email: string;
  isActive: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  roles: string[];
  permissionCodes: string[];
  staffMemberId?: number | null;
}

export interface CreateUserInput {
  email: string;
  password: string;
  isActive?: boolean;
}

export interface UpdateUserInput {
  password?: string;
  isActive?: boolean;
}
