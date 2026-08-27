import type { useTranslations } from 'next-intl';
import type { Permission } from '../types/permission';

export interface PermissionGroup {
  key: string;
  title: string;
  items: Permission[];
}

type PermissionGroupsTranslator = ReturnType<
  typeof useTranslations<'permissionGroups'>
>;

const GROUP_DEFINITIONS = [
  { key: 'users', prefix: 'USER_' },
  { key: 'roles', prefix: 'ROLE_' },
  { key: 'permissions', prefix: 'PERMISSION_' },
] as const;

export function groupPermissions(
  items: Permission[],
  t: PermissionGroupsTranslator,
): PermissionGroup[] {
  const buckets = new Map<string, Permission[]>(
    GROUP_DEFINITIONS.map((group) => [group.key, []]),
  );

  for (const item of items) {
    const group = GROUP_DEFINITIONS.find((definition) =>
      item.code.startsWith(definition.prefix),
    );
    if (!group) continue;
    buckets.get(group.key)?.push(item);
  }

  return GROUP_DEFINITIONS.map((group) => ({
    key: group.key,
    title: t(group.key),
    items: buckets.get(group.key) ?? [],
  })).filter((group) => group.items.length > 0);
}

export function filterPermissions(
  items: Permission[],
  query: string,
): Permission[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;

  return items.filter(
    (item) =>
      item.code.toLowerCase().includes(normalized) ||
      (item.description?.toLowerCase().includes(normalized) ?? false),
  );
}
