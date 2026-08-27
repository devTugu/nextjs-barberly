"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormValues,
  type UpdateUserFormValues,
  type UserOutput,
  useCreateUser,
  useUpdateUser,
  useUser,
  useExportUserData,
  useAnonymizeUser,
} from "@/entities/user";
import { useAssignRole, useRoles, useUnassignRole } from "@/entities/role";
import { useAuthPermissions, useAuthStore } from "@/entities/session";
import { PERMISSION_CODES } from "@/shared/config/permissions";
import { getErrorMessage } from "@/shared/api";
import { AdminFormSheet } from "@/shared/ui/admin-form-sheet";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { UserDeleteDialog } from "./user-delete-dialog";
import { UserCreateForm } from "./user-create-form";
import { UserEditProfileForm } from "./user-edit-profile-form";
import {
  AnonymizeUserDialog,
  UnassignRoleDialog,
} from "./user-manage-dialogs";
import { UserRolesPanel } from "./user-roles-panel";
import { UserSheetFooter } from "./user-sheet-footer";

export type UserSheetState =
  | { mode: "create" }
  | { mode: "edit"; user: UserOutput; tab?: "profile" | "roles" };

interface UserManageSheetProps {
  state: UserSheetState | null;
  onOpenChange: (open: boolean) => void;
}

interface UnassignTarget {
  roleId: number;
  roleName: string;
}

export function UserManageSheet({ state, onOpenChange }: UserManageSheetProps) {
  const t = useTranslations("entities.users");
  const tCommon = useTranslations("common");
  const tTable = useTranslations("table");
  const tVal = useTranslations("validation");
  const { can } = useAuthPermissions();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const exportUserData = useExportUserData();
  const anonymizeUser = useAnonymizeUser();
  const assignRole = useAssignRole();
  const unassignRole = useUnassignRole();
  const currentUser = useAuthStore((store) => store.user);

  const isCreate = state?.mode === "create";
  const isEdit = state?.mode === "edit";
  const editUserId = isEdit ? state.user.id : 0;
  const open = state !== null;

  const { data: freshUser } = useUser(editUserId, open && isEdit);
  const user = freshUser ?? (isEdit ? state.user : null);

  const { data: rolesData } = useRoles({ page: 1, limit: 100 });
  const [tabSelection, setTabSelection] = useState<{
    sheetId: string;
    tab: "profile" | "roles";
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
  const [anonymizeConfirmEmail, setAnonymizeConfirmEmail] = useState("");

  const sheetId = !open
    ? ""
    : isCreate
      ? "create"
      : `edit-${user?.id}-${isEdit && state.mode === "edit" ? (state.tab ?? "profile") : "profile"}`;

  const defaultTab =
    isEdit && state?.mode === "edit" ? (state.tab ?? "profile") : "profile";

  const activeTab =
    tabSelection?.sheetId === sheetId && sheetId !== ""
      ? tabSelection.tab
      : defaultTab;

  const selectedRoleId =
    roleSelection?.sheetId === sheetId ? roleSelection.roleId : "";

  const validationMessages = useMemo(
    () => ({
      invalidEmail: tVal("invalidEmail"),
      passwordMinLength: tVal("passwordMinLength"),
    }),
    [tVal],
  );

  const createSchema = useMemo(
    () => createUserSchema(validationMessages),
    [validationMessages],
  );
  const updateSchema = useMemo(
    () => updateUserSchema(validationMessages),
    [validationMessages],
  );

  const createForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { email: "", password: "", isActive: true },
  });
  const editForm = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: { password: "", isActive: true },
  });

  useEffect(() => {
    if (!open) return;
    if (isCreate) {
      createForm.reset({ email: "", password: "", isActive: true });
      return;
    }
    if (user) {
      editForm.reset({ password: "", isActive: user.isActive });
    }
  }, [open, isCreate, user, createForm, editForm]);

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

  if (!open) return null;

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
      toast.success(t("toastCreated"));
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
      toast.success(t("toastUpdated"));
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
      toast.success(t("toastRoleAssigned"));
      setRoleSelection({ sheetId, roleId: "" });
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
      toast.success(t("toastRoleRemoved"));
      setUnassignTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    try {
      await exportUserData.mutateAsync(user.id);
      toast.success(t("toastExported"));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleAnonymize = async () => {
    if (!user) return;
    if (anonymizeConfirmEmail.trim() !== user.email) {
      toast.error(t("anonymizeConfirmLabel"));
      return;
    }
    try {
      await anonymizeUser.mutateAsync(user.id);
      toast.success(t("toastAnonymized"));
      setAnonymizeOpen(false);
      setAnonymizeConfirmEmail("");
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const isPending =
    createUser.isPending ||
    updateUser.isPending ||
    exportUserData.isPending ||
    anonymizeUser.isPending;
  const formId = isCreate ? "user-create-form" : "user-edit-form";
  const showProfileFooter = isCreate || (isEdit && activeTab === "profile");
  const canSubmitProfile =
    (isCreate && canCreate) || (isEdit && canUpdate);

  const footer = showProfileFooter && canSubmitProfile ? (
    <UserSheetFooter
      isCreate={isCreate}
      isEdit={isEdit}
      isPending={isPending}
      formId={formId}
      canCreate={canCreate}
      canUpdate={canUpdate}
      canDelete={canDelete}
      canExport={canExport}
      canAnonymize={canAnonymize}
      isSelf={currentUser?.id === user?.id}
      exportPending={exportUserData.isPending}
      onClose={() => onOpenChange(false)}
      onExport={() => void handleExportData()}
      onAnonymize={() => {
        setAnonymizeConfirmEmail("");
        setAnonymizeOpen(true);
      }}
      onDelete={() => setDeleteOpen(true)}
    />
  ) : isEdit && activeTab === "roles" ? (
    <div className="flex justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}>
        {tCommon("close")}
      </Button>
    </div>
  ) : null;

  return (
    <>
      <AdminFormSheet
        open={open}
        onOpenChange={onOpenChange}
        title={isCreate ? t("createTitle") : (user?.email ?? t("editTitle"))}
        description={
          isCreate
            ? t("createDescription")
            : activeTab === "roles"
              ? t("editRolesDescription")
              : t("editProfileDescription")
        }
        size="md"
        showContentLocale={false}
        footer={footer}>
        {isCreate ? (
          <UserCreateForm
            form={createForm}
            formId={formId}
            onSubmit={onCreateSubmit}
          />
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setTabSelection({
                sheetId,
                tab: value as "profile" | "roles",
              })
            }>
            <TabsList className="w-full">
              <TabsTrigger value="profile" className="flex-1">
                {t("tabProfile")}
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex-1">
                {tTable("roles")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-4">
              <UserEditProfileForm
                form={editForm}
                formId={formId}
                email={user?.email ?? ""}
                onSubmit={onEditSubmit}
              />
            </TabsContent>
            <TabsContent value="roles" className="mt-4">
              {user ? (
                <UserRolesPanel
                  user={user}
                  assignableRoles={assignableRoles}
                  roleNameToId={roleNameToId}
                  canAssign={canAssign}
                  canUnassign={canUnassign}
                  selectedRoleId={selectedRoleId}
                  assignPending={assignRole.isPending}
                  onSelectRole={(roleId) =>
                    setRoleSelection({ sheetId, roleId })
                  }
                  onAssign={() => void handleAssignRole()}
                  onUnassign={setUnassignTarget}
                />
              ) : null}
            </TabsContent>
          </Tabs>
        )}
      </AdminFormSheet>

      <UnassignRoleDialog
        open={unassignTarget !== null}
        roleName={unassignTarget?.roleName ?? ""}
        email={user?.email ?? ""}
        onOpenChange={(dialogOpen) => !dialogOpen && setUnassignTarget(null)}
        onConfirm={() => void handleUnassignRole()}
      />

      <UserDeleteDialog
        user={user}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => onOpenChange(false)}
      />

      <AnonymizeUserDialog
        open={anonymizeOpen}
        email={user?.email ?? ""}
        confirmEmail={anonymizeConfirmEmail}
        pending={anonymizeUser.isPending}
        onConfirmEmailChange={setAnonymizeConfirmEmail}
        onOpenChange={setAnonymizeOpen}
        onConfirm={() => void handleAnonymize()}
      />
    </>
  );
}
