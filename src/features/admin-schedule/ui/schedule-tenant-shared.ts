import type { PermissionCode } from '@/shared/config/permissions';
import { PERMISSION_CODES } from '@/shared/config/permissions';

export function defaultScheduleRange(): { from: string; to: string } {
  const now = new Date();
  const from = `${now.getFullYear()}-01-01`;
  const to = `${now.getFullYear()}-12-31`;
  return { from, to };
}

export function canManageSchedule(can: (code: PermissionCode) => boolean): boolean {
  return (
    can(PERMISSION_CODES.SCHEDULE_CREATE) ||
    can(PERMISSION_CODES.SCHEDULE_UPDATE)
  );
}
