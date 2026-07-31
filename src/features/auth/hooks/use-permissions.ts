'use client';

import { useAuthStore } from '../model/store';
import {
  OWNER_ROLE,
  STAFF_ROLE,
  STAFF_PERMISSION_CODES,
  SUPER_ADMIN_ROLE,
} from '@/shared/config/permissions';
import type { PermissionCode } from '@/shared/config/permissions';

export const useAuthPermissions = () => {
  const roleNames = useAuthStore((s) => s.roleNames);
  const permissionCodes = useAuthStore((s) => s.permissionCodes);
  const user = useAuthStore((s) => s.user);

  const isSuperAdmin = roleNames.includes(SUPER_ADMIN_ROLE);
  const isOwner = roleNames.includes(OWNER_ROLE);
  const isStaff = roleNames.includes(STAFF_ROLE) && !isOwner;
  const isAuthenticated = Boolean(user);

  const can = (code: PermissionCode): boolean => {
    if (!isAuthenticated) return false;
    if (isSuperAdmin) return true;
    if (isStaff) {
      return STAFF_PERMISSION_CODES.includes(
        code as (typeof STAFF_PERMISSION_CODES)[number],
      );
    }
    return permissionCodes.includes(code);
  };

  return {
    can,
    isSuperAdmin,
    isOwner,
    isStaff,
    isAuthenticated,
    roleNames,
    permissionCodes,
  };
};
