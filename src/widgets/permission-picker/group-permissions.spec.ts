import { describe, expect, it } from 'vitest';
import { groupPermissions } from './group-permissions';
import type { Permission } from '@/entities/permission';

const permission = (code: string): Permission => ({
  id: 1,
  code,
  description: null,
});

const mockTranslator = (key: string) => key;

describe('groupPermissions', () => {
  it('groups permissions by module prefix', () => {
    const groups = groupPermissions(
      [
        permission('USER_READ'),
        permission('USER_CREATE'),
        permission('ROLE_READ'),
      ],
      mockTranslator,
    );

    expect(groups.map((group) => group.key)).toEqual(['users', 'roles']);
    expect(groups[0]?.items).toHaveLength(2);
    expect(groups[1]?.items[0]?.code).toBe('ROLE_READ');
  });

  it('omits empty groups', () => {
    const groups = groupPermissions([permission('USER_READ')], mockTranslator);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.key).toBe('users');
  });
});
