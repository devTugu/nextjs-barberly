import { describe, expect, it } from 'vitest';
import { filterPermissions, groupPermissions } from './group-permissions';
import type { Permission } from '../types/permission';

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

describe('filterPermissions', () => {
  it('returns all items when the query is empty', () => {
    const items = [permission('USER_READ')];
    expect(filterPermissions(items, '  ')).toEqual(items);
  });

  it('matches code or description', () => {
    const items: Permission[] = [
      { id: 1, code: 'USER_READ', description: 'Read users' },
      { id: 2, code: 'ROLE_READ', description: null },
    ];
    expect(filterPermissions(items, 'role')).toEqual([items[1]]);
    expect(filterPermissions(items, 'users')).toEqual([items[0]]);
  });
});
