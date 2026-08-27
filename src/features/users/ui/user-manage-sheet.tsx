'use client';

import { useTranslations } from 'next-intl';
import { AdminFormSheet } from '@/shared/ui/admin-form-sheet';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { UserDeleteDialog } from './user-delete-dialog';
import { UserCreateForm } from './user-create-form';
import { UserEditProfileForm } from './user-edit-profile-form';
import {
  AnonymizeUserDialog,
  UnassignRoleDialog,
} from './user-manage-dialogs';
import { UserRolesPanel } from './user-roles-panel';
import { UserSheetFooter } from './user-sheet-footer';
import {
  useUserManageSheet,
  type UserSheetState,
} from './use-user-manage-sheet';

export type { UserSheetState };

interface UserManageSheetProps {
  state: UserSheetState | null;
  onOpenChange: (open: boolean) => void;
}

export function UserManageSheet({ state, onOpenChange }: UserManageSheetProps) {
  const sheet = useUserManageSheet(state, onOpenChange);
  const t = useTranslations('entities.users');

  if (!sheet.open) return null;

  const isPending =
    sheet.createUser.isPending ||
    sheet.updateUser.isPending ||
    sheet.exportUserData.isPending ||
    sheet.anonymizeUser.isPending;
  const formId = sheet.isCreate ? 'user-create-form' : 'user-edit-form';
  const showProfileFooter =
    sheet.isCreate || (sheet.isEdit && sheet.activeTab === 'profile');
  const canSubmitProfile =
    (sheet.isCreate && sheet.canCreate) || (sheet.isEdit && sheet.canUpdate);

  const footer = showProfileFooter && canSubmitProfile ? (
    <UserSheetFooter
      isCreate={sheet.isCreate}
      isEdit={sheet.isEdit}
      isPending={isPending}
      formId={formId}
      canCreate={sheet.canCreate}
      canUpdate={sheet.canUpdate}
      canDelete={sheet.canDelete}
      canExport={sheet.canExport}
      canAnonymize={sheet.canAnonymize}
      isSelf={sheet.currentUser?.id === sheet.user?.id}
      exportPending={sheet.exportUserData.isPending}
      onClose={() => onOpenChange(false)}
      onExport={() => void sheet.handleExportData()}
      onAnonymize={() => {
        sheet.setAnonymizeConfirmEmail('');
        sheet.setAnonymizeOpen(true);
      }}
      onDelete={() => sheet.setDeleteOpen(true)}
    />
  ) : sheet.isEdit && sheet.activeTab === 'roles' ? (
    <div className="flex justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
      >
        {sheet.tCommon('close')}
      </Button>
    </div>
  ) : null;

  return (
    <>
      <AdminFormSheet
        open={sheet.open}
        onOpenChange={onOpenChange}
        title={
          sheet.isCreate ? t('createTitle') : (sheet.user?.email ?? t('editTitle'))
        }
        description={
          sheet.isCreate
            ? t('createDescription')
            : sheet.activeTab === 'roles'
              ? t('editRolesDescription')
              : t('editProfileDescription')
        }
        size="md"
        showContentLocale={false}
        footer={footer}
      >
        {sheet.isCreate ? (
          <UserCreateForm
            key={sheet.sheetId}
            formId={formId}
            onSubmit={sheet.onCreateSubmit}
          />
        ) : (
          <Tabs
            value={sheet.activeTab}
            onValueChange={(value) =>
              sheet.setTabSelection({
                sheetId: sheet.sheetId,
                tab: value as 'profile' | 'roles',
              })
            }
          >
            <TabsList className="w-full">
              <TabsTrigger value="profile" className="flex-1">
                {t('tabProfile')}
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex-1">
                {sheet.tTable('roles')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-4">
              <UserEditProfileForm
                key={sheet.user?.id ?? 'edit'}
                formId={formId}
                email={sheet.user?.email ?? ''}
                isActive={sheet.user?.isActive ?? true}
                onSubmit={sheet.onEditSubmit}
              />
            </TabsContent>
            <TabsContent value="roles" className="mt-4">
              {sheet.user ? (
                <UserRolesPanel
                  user={sheet.user}
                  assignableRoles={sheet.assignableRoles}
                  roleNameToId={sheet.roleNameToId}
                  canAssign={sheet.canAssign}
                  canUnassign={sheet.canUnassign}
                  selectedRoleId={sheet.selectedRoleId}
                  assignPending={sheet.assignRole.isPending}
                  onSelectRole={(roleId) =>
                    sheet.setRoleSelection({ sheetId: sheet.sheetId, roleId })
                  }
                  onAssign={() => void sheet.handleAssignRole()}
                  onUnassign={sheet.setUnassignTarget}
                />
              ) : null}
            </TabsContent>
          </Tabs>
        )}
      </AdminFormSheet>

      <UnassignRoleDialog
        open={sheet.unassignTarget !== null}
        roleName={sheet.unassignTarget?.roleName ?? ''}
        email={sheet.user?.email ?? ''}
        onOpenChange={(dialogOpen) =>
          !dialogOpen && sheet.setUnassignTarget(null)
        }
        onConfirm={() => void sheet.handleUnassignRole()}
      />

      <UserDeleteDialog
        user={sheet.user}
        open={sheet.deleteOpen}
        onOpenChange={sheet.setDeleteOpen}
        onDeleted={() => onOpenChange(false)}
      />

      <AnonymizeUserDialog
        open={sheet.anonymizeOpen}
        email={sheet.user?.email ?? ''}
        confirmEmail={sheet.anonymizeConfirmEmail}
        pending={sheet.anonymizeUser.isPending}
        onConfirmEmailChange={sheet.setAnonymizeConfirmEmail}
        onOpenChange={sheet.setAnonymizeOpen}
        onConfirm={() => void sheet.handleAnonymize()}
      />
    </>
  );
}
