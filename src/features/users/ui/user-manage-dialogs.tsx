"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
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
import { Input } from "@/shared/ui/input";

interface UnassignRoleDialogProps {
  open: boolean;
  roleName: string;
  email: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function UnassignRoleDialog({
  open,
  roleName,
  email,
  onOpenChange,
  onConfirm,
}: UnassignRoleDialogProps) {
  const t = useTranslations("entities.users");
  const tCommon = useTranslations("common");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("removeRoleTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("removeRoleDescription", { roleName, email })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {tCommon("remove")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface AnonymizeUserDialogProps {
  open: boolean;
  email: string;
  confirmEmail: string;
  pending: boolean;
  onConfirmEmailChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function AnonymizeUserDialog({
  open,
  email,
  confirmEmail,
  pending,
  onConfirmEmailChange,
  onOpenChange,
  onConfirm,
}: AnonymizeUserDialogProps) {
  const t = useTranslations("entities.users");
  const tCommon = useTranslations("common");

  return (
    <AlertDialog
      open={open}
      onOpenChange={(dialogOpen) => {
        onOpenChange(dialogOpen);
        if (!dialogOpen) onConfirmEmailChange("");
      }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("anonymizeTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("anonymizeDescription", { email })}
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
            value={confirmEmail}
            onChange={(event) => onConfirmEmailChange(event.target.value)}
            placeholder={email}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>
            {tCommon("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={pending || confirmEmail.trim() !== email}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("anonymizePii")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
