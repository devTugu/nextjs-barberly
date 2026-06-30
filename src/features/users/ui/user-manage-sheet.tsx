"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
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
import { useAuthPermissions, useAuthStore } from "@/features/auth";
import {
  PERMISSION_CODES,
  SUPER_ADMIN_ROLE,
} from "@/shared/config/permissions";
import { getErrorMessage } from "@/shared/api";
import { AdminFormSheet } from "@/widgets/admin-form-sheet";
import { UserDeleteDialog } from "./user-delete-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

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

function RoleBadge({
  name,
  onRemove,
  canRemove,
  removeAriaLabel,
}: {
  name: string;
  onRemove?: () => void;
  canRemove: boolean;
  removeAriaLabel: string;
}) {
  return (
    <Badge
      variant={name === SUPER_ADMIN_ROLE ? "default" : "secondary"}
      className="gap-1 pr-1">
      {name}
      {canRemove && onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-sm p-0.5 hover:bg-background/20"
          aria-label={removeAriaLabel}>
          <X className="size-3" />
        </button>
      ) : null}
    </Badge>
  );
}

export function UserManageSheet({ state, onOpenChange }: UserManageSheetProps) {
  const t = useTranslations("entities.users");
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth");
  const tTable = useTranslations("table");
  const tVal = useTranslations("validation");
  const { can } = useAuthPermissions();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const exportUserData = useExportUserData();
  const anonymizeUser = useAnonymizeUser();
  const assignRole = useAssignRole();
  const unassignRole = useUnassignRole();
  const currentUser = useAuthStore((state) => state.user);

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
      const payload = {
        isActive: values.isActive,
        ...(values.password ? { password: values.password } : {}),
      };
      await updateUser.mutateAsync({ id: user.id, data: payload });
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
  const footer =
    showProfileFooter && ((isCreate && canCreate) || (isEdit && canUpdate)) ? (
      <div className="space-y-4">
        {isEdit && (canExport || canAnonymize || canDelete) ? (
          <div className="rounded-md border p-3">
            <p className="text-sm font-medium">{t("privacyTitle")}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("privacyDescription")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {canExport ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  disabled={exportUserData.isPending}>
                  {exportUserData.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  {exportUserData.isPending
                    ? t("exportingData")
                    : t("exportData")}
                </Button>
              ) : null}
              {canAnonymize ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAnonymizeConfirmEmail("");
                    setAnonymizeOpen(true);
                  }}>
                  {t("anonymizePii")}
                </Button>
              ) : null}
            </div>
            {!canAnonymize && canDelete && currentUser?.id === user?.id ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {t("anonymizeSelfBlocked")}
              </p>
            ) : null}
          </div>
        ) : null}
        {isEdit && canDelete ? (
          <div className="rounded-md border border-destructive/30 p-3">
            <p className="text-sm font-medium text-destructive">
              {tCommon("dangerZone")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("dangerZoneDescription")}
            </p>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="mt-2"
              onClick={() => setDeleteOpen(true)}>
              {t("deleteUser")}
            </Button>
          </div>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}>
            {tCommon("cancel")}
          </Button>
          <Button type="submit" form={formId} disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {isCreate ? tCommon("create") : tCommon("save")}
          </Button>
        </div>
      </div>
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
        title={
          isCreate
            ? t("createTitle")
            : (user?.email ?? t("editTitle"))
        }
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
          <Form {...createForm}>
            <form
              id={formId}
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-4">
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tAuth("email")}</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tAuth("password")}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>{t("activeAccount")}</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        {t("activeAccountHint")}
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
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
              <Form {...editForm}>
                <form
                  id={formId}
                  onSubmit={editForm.handleSubmit(onEditSubmit)}
                  className="space-y-4">
                  <FormItem>
                    <FormLabel>{tAuth("email")}</FormLabel>
                    <Input value={user?.email ?? ""} disabled readOnly />
                  </FormItem>
                  <FormField
                    control={editForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("newPasswordOptional")}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-md border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>{t("activeAccount")}</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            {t("activeAccountHint")}
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="roles" className="mt-4 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">{t("currentRoles")}</p>
                {user && user.roles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((roleName) => {
                      const roleId = roleNameToId.get(roleName);
                      return (
                        <RoleBadge
                          key={roleName}
                          name={roleName}
                          canRemove={canUnassign && roleId !== undefined}
                          removeAriaLabel={tCommon("removeAriaLabel", {
                            name: roleName,
                          })}
                          onRemove={
                            roleId !== undefined
                              ? () =>
                                  setUnassignTarget({
                                    roleId,
                                    roleName,
                                  })
                              : undefined
                          }
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("emptyRoles")}
                  </p>
                )}
              </div>
              {canAssign ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t("addRole")}</p>
                  <div className="flex gap-2">
                    <Select
                      value={selectedRoleId}
                      onValueChange={(roleId) =>
                        setRoleSelection({ sheetId, roleId })
                      }>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder={t("selectRole")} />
                      </SelectTrigger>
                      <SelectContent>
                        {assignableRoles.map((role) => (
                          <SelectItem key={role.id} value={String(role.id)}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={handleAssignRole}
                      disabled={!selectedRoleId || assignRole.isPending}>
                      {assignRole.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : null}
                      {tCommon("add")}
                    </Button>
                  </div>
                  {assignableRoles.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {t("allRolesAssigned")}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </TabsContent>
          </Tabs>
        )}
      </AdminFormSheet>

      <AlertDialog
        open={unassignTarget !== null}
        onOpenChange={(dialogOpen) => !dialogOpen && setUnassignTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("removeRoleTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("removeRoleDescription", {
                roleName: unassignTarget?.roleName ?? "",
                email: user?.email ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnassignRole}>
              {tCommon("remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UserDeleteDialog
        user={user}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => onOpenChange(false)}
      />

      <AlertDialog
        open={anonymizeOpen}
        onOpenChange={(dialogOpen) => {
          setAnonymizeOpen(dialogOpen);
          if (!dialogOpen) setAnonymizeConfirmEmail("");
        }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("anonymizeTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("anonymizeDescription", { email: user?.email ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <label
              htmlFor="anonymize-confirm-email"
              className="text-sm font-medium">
              {t("anonymizeConfirmLabel")}
            </label>
            <Input
              id="anonymize-confirm-email"
              value={anonymizeConfirmEmail}
              onChange={(event) => setAnonymizeConfirmEmail(event.target.value)}
              placeholder={user?.email ?? ""}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={anonymizeUser.isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAnonymize}
              disabled={
                anonymizeUser.isPending ||
                anonymizeConfirmEmail.trim() !== (user?.email ?? "")
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {anonymizeUser.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {t("anonymizePii")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
