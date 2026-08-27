"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { UserOutput } from "@/entities/user";
import type { Role } from "@/entities/role";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { UserRoleBadge } from "./user-role-badge";

interface UserRolesPanelProps {
  user: UserOutput;
  assignableRoles: Role[];
  roleNameToId: Map<string, number>;
  canAssign: boolean;
  canUnassign: boolean;
  selectedRoleId: string;
  assignPending: boolean;
  onSelectRole: (roleId: string) => void;
  onAssign: () => void;
  onUnassign: (target: { roleId: number; roleName: string }) => void;
}

export function UserRolesPanel({
  user,
  assignableRoles,
  roleNameToId,
  canAssign,
  canUnassign,
  selectedRoleId,
  assignPending,
  onSelectRole,
  onAssign,
  onUnassign,
}: UserRolesPanelProps) {
  const t = useTranslations("entities.users");
  const tCommon = useTranslations("common");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">{t("currentRoles")}</p>
        {user.roles.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user.roles.map((roleName) => {
              const roleId = roleNameToId.get(roleName);
              return (
                <UserRoleBadge
                  key={roleName}
                  name={roleName}
                  canRemove={canUnassign && roleId !== undefined}
                  removeAriaLabel={tCommon("removeAriaLabel", {
                    name: roleName,
                  })}
                  onRemove={
                    roleId !== undefined
                      ? () => onUnassign({ roleId, roleName })
                      : undefined
                  }
                />
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("emptyRoles")}</p>
        )}
      </div>
      {canAssign ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">{t("addRole")}</p>
          <div className="flex gap-2">
            <Select value={selectedRoleId} onValueChange={onSelectRole}>
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
              onClick={onAssign}
              disabled={!selectedRoleId || assignPending}>
              {assignPending ? (
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
    </div>
  );
}
