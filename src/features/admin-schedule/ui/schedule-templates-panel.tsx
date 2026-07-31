'use client';

import { useState } from 'react';
import { Loader2, Pencil, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  useApplyScheduleTemplate,
  useCreateScheduleTemplate,
  useDeleteScheduleTemplate,
  useScheduleTemplates,
  useUpdateScheduleTemplate,
  type ScheduleTemplate,
} from '@/entities/schedule';
import { ScheduleDeleteButton } from '@/features/admin-schedule/ui/schedule-delete-button';
import { ScheduleTemplateEditor } from '@/features/admin-schedule/ui/schedule-template-editor';
import { canManageSchedule } from '@/features/admin-schedule/ui/schedule-tenant-shared';
import { useAuthPermissions } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Skeleton } from '@/shared/ui/skeleton';

type TemplatesProps = { staffId: number };

export function ScheduleTemplatesPanel({ staffId }: TemplatesProps) {
  const t = useTranslations('entities.schedule');
  const tCommon = useTranslations('common');
  const tenant = useTenantSubdomain();
  const { can } = useAuthPermissions();
  const templatesQuery = useScheduleTemplates(tenant);
  const applyTemplate = useApplyScheduleTemplate(tenant);
  const createTemplate = useCreateScheduleTemplate(tenant);
  const updateTemplate = useUpdateScheduleTemplate(tenant);
  const deleteTemplate = useDeleteScheduleTemplate(tenant);
  const canCreate = canManageSchedule(can);
  const canDelete = can(PERMISSION_CODES.SCHEDULE_DELETE);
  const [editorOpen, setEditorOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyingTemplateId, setApplyingTemplateId] = useState(0);
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<ScheduleTemplate | null>(
    null,
  );

  const openCreate = () => {
    setEditingTemplate(null);
    setEditorOpen(true);
  };

  const openEdit = (template: ScheduleTemplate) => {
    setEditingTemplate(template);
    setEditorOpen(true);
  };

  const handleSaveTemplate = async (values: {
    name: string;
    description?: string;
    shifts: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
  }) => {
    try {
      if (editingTemplate) {
        await updateTemplate.mutateAsync({ id: editingTemplate.id, ...values });
        toast.success(t('templateUpdated'));
      } else {
        await createTemplate.mutateAsync(values);
        toast.success(t('templateCreated'));
      }
      setEditorOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const openApply = (templateId: number) => {
    setApplyingTemplateId(templateId);
    setEffectiveFrom('');
    setEffectiveTo('');
    setApplyOpen(true);
  };

  const handleApply = async () => {
    if (staffId <= 0) {
      toast.error(t('selectStaff'));
      return;
    }
    try {
      await applyTemplate.mutateAsync({
        templateId: applyingTemplateId,
        staffId,
        effectiveFrom: effectiveFrom || undefined,
        effectiveTo: effectiveTo || undefined,
      });
      toast.success(t('templateApplied'));
      setApplyOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (templatesQuery.isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>{t('templatesTitle')}</CardTitle>
          {canCreate ? (
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1 size-4" />
              {t('createTemplate')}
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3">
          {templatesQuery.data?.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('noTemplates')}</p>
          ) : (
            templatesQuery.data?.map((template) => (
              <div
                key={template.id}
                className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{template.name}</p>
                  {template.description ? (
                    <p className="text-muted-foreground text-sm">
                      {template.description}
                    </p>
                  ) : null}
                  <p className="text-muted-foreground text-xs">
                    {template.shifts.length} {t('shiftBlocks')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {canCreate ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(template)}
                      >
                        <Pencil className="mr-1 size-4" />
                        {t('editTemplate')}
                      </Button>
                      <Button
                        size="sm"
                        disabled={applyTemplate.isPending}
                        onClick={() => openApply(template.id)}
                      >
                        {t('applyTemplate')}
                      </Button>
                    </>
                  ) : null}
                  {canDelete && !template.isSystemPreset ? (
                    <ScheduleDeleteButton
                      title={t('deleteTemplateTitle')}
                      description={t('deleteTemplateDescription', {
                        name: template.name,
                      })}
                      onConfirm={() => deleteTemplate.mutateAsync(template.id)}
                    />
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('applyTemplate')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">{t('applyTemplateHint')}</p>
            <div className="space-y-2">
              <Label>{t('effectiveFrom')}</Label>
              <Input
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('effectiveTo')}</Label>
              <Input
                type="date"
                value={effectiveTo}
                onChange={(e) => setEffectiveTo(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                disabled={applyTemplate.isPending}
                onClick={() => void handleApply()}
              >
                {applyTemplate.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                {t('applyTemplate')}
              </Button>
              <Button variant="outline" onClick={() => setApplyOpen(false)}>
                {tCommon('cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? t('editTemplate') : t('createTemplate')}
            </DialogTitle>
          </DialogHeader>
          <ScheduleTemplateEditor
            template={editingTemplate}
            pending={createTemplate.isPending || updateTemplate.isPending}
            onCancel={() => setEditorOpen(false)}
            onSubmit={handleSaveTemplate}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
