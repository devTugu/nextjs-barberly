import {
  OWNER_ROLE,
  STAFF_PERMISSION_CODES,
  STAFF_ROLE,
  SUPER_ADMIN_ROLE,
  type PermissionCode,
} from '@/shared/config/permissions';

export interface SessionAccessInput {
  isAuthenticated: boolean;
  roleNames: string[];
  permissionCodes: string[];
}

export function isSuperAdminRole(roleNames: string[]): boolean {
  return roleNames.includes(SUPER_ADMIN_ROLE);
}

export function isOwnerRole(roleNames: string[]): boolean {
  return roleNames.includes(OWNER_ROLE);
}

export function isStaffRole(roleNames: string[]): boolean {
  return roleNames.includes(STAFF_ROLE) && !isOwnerRole(roleNames);
}

export function canAccessPermission(
  session: SessionAccessInput,
  code: PermissionCode,
): boolean {
  if (!session.isAuthenticated) return false;
  if (isSuperAdminRole(session.roleNames)) return true;
  if (isStaffRole(session.roleNames)) {
    return STAFF_PERMISSION_CODES.includes(
      code as (typeof STAFF_PERMISSION_CODES)[number],
    );
  }
  return session.permissionCodes.includes(code);
}
