import { describe, expect, it } from 'vitest';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import {
  canAccessPermission,
  isOwnerRole,
  isStaffRole,
  isSuperAdminRole,
} from './can-access';

describe('canAccessPermission', () => {
  it('denies unauthenticated users', () => {
    expect(
      canAccessPermission(
        { isAuthenticated: false, roleNames: ['SUPER_ADMIN'], permissionCodes: [] },
        PERMISSION_CODES.USER_READ,
      ),
    ).toBe(false);
  });

  it('allows super admins every permission', () => {
    expect(
      canAccessPermission(
        { isAuthenticated: true, roleNames: ['SUPER_ADMIN'], permissionCodes: [] },
        PERMISSION_CODES.TENANT_DELETE,
      ),
    ).toBe(true);
  });

  it('limits staff to the staff allowlist', () => {
    const staff = {
      isAuthenticated: true,
      roleNames: ['STAFF'],
      permissionCodes: [PERMISSION_CODES.USER_DELETE],
    };
    expect(canAccessPermission(staff, PERMISSION_CODES.BOOKING_READ)).toBe(true);
    expect(canAccessPermission(staff, PERMISSION_CODES.USER_DELETE)).toBe(false);
  });

  it('uses explicit permission codes for owners', () => {
    const owner = {
      isAuthenticated: true,
      roleNames: ['OWNER'],
      permissionCodes: [PERMISSION_CODES.SERVICE_UPDATE],
    };
    expect(canAccessPermission(owner, PERMISSION_CODES.SERVICE_UPDATE)).toBe(true);
    expect(canAccessPermission(owner, PERMISSION_CODES.SERVICE_DELETE)).toBe(false);
  });
});

describe('role helpers', () => {
  it('treats owner as not staff', () => {
    expect(isOwnerRole(['OWNER', 'STAFF'])).toBe(true);
    expect(isStaffRole(['OWNER', 'STAFF'])).toBe(false);
    expect(isStaffRole(['STAFF'])).toBe(true);
    expect(isSuperAdminRole(['SUPER_ADMIN'])).toBe(true);
  });
});
