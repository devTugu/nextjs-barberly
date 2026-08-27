'use client';

import type { PermissionCode } from '@/shared/config/permissions';
import { canAccessPermission, isOwnerRole, isStaffRole, isSuperAdminRole } from '../lib/can-access';
import { useAuthStore } from '../model/store';

export const useAuthPermissions = () => {
  const roleNames = useAuthStore((s) => s.roleNames);
  const permissionCodes = useAuthStore((s) => s.permissionCodes);
  const user = useAuthStore((s) => s.user);

  const isSuperAdmin = isSuperAdminRole(roleNames);
  const isOwner = isOwnerRole(roleNames);
  const isStaff = isStaffRole(roleNames);
  const isAuthenticated = Boolean(user);

  const can = (code: PermissionCode): boolean =>
    canAccessPermission(
      { isAuthenticated, roleNames, permissionCodes },
      code,
    );

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
