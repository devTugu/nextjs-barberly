'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  type CreateUserFormValues,
  type UpdateUserFormValues,
  type UserOutput,
  useAnonymizeUser,
  useCreateUser,
  useExportUserData,
  useUpdateUser,
  useUser,
} from '@/entities/user';
import { useAssignRole, useRoles, useUnassignRole } from '@/entities/role';
import { useAuthPermissions, useAuthStore } from '@/entities/session';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';

export type UserSheetState =
  | { mode: 'create' }
  | { mode: 'edit'; user: UserOutput; tab?: 'profile' | 'roles' };

interface UnassignTarget {
  roleId: number;
  roleName: string;
}

export function useUserManageSheet(
  state: UserSheetState | null,
  onOpenChange: (open: boolean) => void,
) {
  const t = useTranslations('entities.users');
  const tCommon = useTranslations('common');
  const tTable = useTranslations('table');
  const { can } = useAuthPermissions();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const exportUserData = useExportUserData();
  const anonymizeUser = useAnonymizeUser();
  const assignRole = useAssignRole();
  const unassignRole = useUnassignRole();
  const currentUser = useAuthStore((store) => store.user);

  const isCreate = state?.mode === 'create';
  const isEdit = state?.mode === 'edit';
  const editUserId = isEdit ? state.user.id : 0;
  const open = state !== null;

  const { data: freshUser } = useUser(editUserId, open && isEdit);
  const user = freshUser ?? (isEdit ? state.user : null);

  const { data: rolesData } = useRoles({ page: 1, limit: 100 });
  const [tabSelection, setTabSelection] = useState<{
    sheetId: string;
    tab: 'profile' | 'roles';
  } | null>(null);
  const [roleSelection, setRoleSelection] = useState<{
    sheetId: string;
    roleId: string;
  } | null>(null);
  const [unassignTarget, setUnassignTarget] = useState<UnassignTarget | null>(
    null,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [anonymizeOpen, setAnonymizeOpen] = useState(false);
  const [anonymizeConfirmEmail, setAnonymizeConfirmEmail] = useState('');

  const sheetId = !open
    ? ''
    : isCreate
      ? 'create'
      : `edit-${user?.id}-${isEdit && state.mode === 'edit' ? (state.tab ?? 'profile') : 'profile'}`;

  const defaultTab =
    isEdit && state?.mode === 'edit' ? (state.tab ?? 'profile') : 'profile';
  const activeTab =
    tabSelection?.sheetId === sheetId && sheetId !== ''
      ? tabSelection.tab
      : defaultTab;
  const selectedRoleId =
    roleSelection?.sheetId === sheetId ? roleSelection.roleId : '';

  const assignableRoles = useMemo(() => {
    if (!user) return [];
    return (
      rolesData?.items.filter((role) => !user.roles.includes(role.name)) ?? []
    );
  }, [rolesData, user]);

  const roleNameToId = useMemo(() => {
    const map = new Map<string, number>();
    rolesData?.items.forEach((role) => map.set(role.name, role.id));
    return map;
  }, [rolesData]);

  const canCreate = can(PERMISSION_CODES.USER_CREATE);
  const canUpdate = can(PERMISSION_CODES.USER_UPDATE);
  const canAssign = can(PERMISSION_CODES.ROLE_CREATE);
  const canUnassign = can(PERMISSION_CODES.ROLE_DELETE);
  const canDelete = can(PERMISSION_CODES.USER_DELETE);
  const canExport = can(PERMISSION_CODES.USER_READ);
  const canAnonymize =
    canDelete && user !== null && currentUser?.id !== user.id;

  const onCreateSubmit = async (values: CreateUserFormValues) => {
    try {
      await createUser.mutateAsync(values);
      toast.success(t('toastCreated'));
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const onEditSubmit = async (values: UpdateUserFormValues) => {
    if (!user) return;
    try {
      await updateUser.mutateAsync({
        id: user.id,
        data: {
          isActive: values.isActive,
          ...(values.password ? { password: values.password } : {}),
        },
      });
      toast.success(t('toastUpdated'));
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleAssignRole = async () => {
    if (!user || !selectedRoleId) return;
    try {
      await assignRole.mutateAsync({
        userId: user.id,
        roleId: Number(selectedRoleId),
      });
      toast.success(t('toastRoleAssigned'));
      setRoleSelection({ sheetId, roleId: '' });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleUnassignRole = async () => {
    if (!user || !unassignTarget) return;
    try {
      await unassignRole.mutateAsync({
        userId: user.id,
        roleId: unassignTarget.roleId,
      });
      toast.success(t('toastRoleRemoved'));
      setUnassignTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    try {
      await exportUserData.mutateAsync(user.id);
      toast.success(t('toastExported'));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleAnonymize = async () => {
    if (!user) return;
    if (anonymizeConfirmEmail.trim() !== user.email) {
      toast.error(t('anonymizeConfirmLabel'));
      return;
    }
    try {
      await anonymizeUser.mutateAsync(user.id);
      toast.success(t('toastAnonymized'));
      setAnonymizeOpen(false);
      setAnonymizeConfirmEmail('');
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return {
    t,
    tCommon,
    tTable,
    open,
    isCreate,
    isEdit,
    user,
    currentUser,
    sheetId,
    activeTab,
    selectedRoleId,
    assignableRoles,
    roleNameToId,
    canCreate,
    canUpdate,
    canAssign,
    canUnassign,
    canDelete,
    canExport,
    canAnonymize,
    createUser,
    updateUser,
    exportUserData,
    anonymizeUser,
    assignRole,
    unassignTarget,
    deleteOpen,
    anonymizeOpen,
    anonymizeConfirmEmail,
    setTabSelection,
    setRoleSelection,
    setUnassignTarget,
    setDeleteOpen,
    setAnonymizeOpen,
    setAnonymizeConfirmEmail,
    onCreateSubmit,
    onEditSubmit,
    handleAssignRole,
    handleUnassignRole,
    handleExportData,
    handleAnonymize,
  };
}
