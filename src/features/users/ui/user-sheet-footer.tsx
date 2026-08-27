"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";

interface UserSheetFooterProps {
  isCreate: boolean;
  isEdit: boolean;
  isPending: boolean;
  formId: string;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
  canAnonymize: boolean;
  isSelf: boolean;
  exportPending: boolean;
  onClose: () => void;
  onExport: () => void;
  onAnonymize: () => void;
  onDelete: () => void;
}

export function UserSheetFooter({
  isCreate,
  isEdit,
  isPending,
  formId,
  canCreate,
  canUpdate,
  canDelete,
  canExport,
  canAnonymize,
  isSelf,
  exportPending,
  onClose,
  onExport,
  onAnonymize,
  onDelete,
}: UserSheetFooterProps) {
  const t = useTranslations("entities.users");
  const tCommon = useTranslations("common");

  return (
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
                onClick={onExport}
                disabled={exportPending}>
                {exportPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                {exportPending ? t("exportingData") : t("exportData")}
              </Button>
            ) : null}
            {canAnonymize ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAnonymize}>
                {t("anonymizePii")}
              </Button>
            ) : null}
          </div>
          {!canAnonymize && canDelete && isSelf ? (
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
            onClick={onDelete}>
            {t("deleteUser")}
          </Button>
        </div>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isPending}>
          {tCommon("cancel")}
        </Button>
        {((isCreate && canCreate) || (isEdit && canUpdate)) ? (
          <Button type="submit" form={formId} disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {isCreate ? tCommon("create") : tCommon("save")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
