'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';

interface AdminTableActionsProps {
  name: string;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AdminTableActions({
  name,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
}: AdminTableActionsProps) {
  const t = useTranslations('common');
  const showEdit = canEdit && Boolean(onEdit);
  const showDelete = canDelete && Boolean(onDelete);

  if (!showEdit && !showDelete) return null;

  return (
    <div className="flex items-center justify-end gap-1">
      {showEdit ? (
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={onEdit}
          aria-label={t('editAriaLabel', { name })}
        >
          <Pencil className="size-4" />
        </Button>
      ) : null}
      {showDelete ? (
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-destructive hover:text-destructive"
          onClick={onDelete}
          aria-label={t('deleteAriaLabel', { name })}
        >
          <Trash2 className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
