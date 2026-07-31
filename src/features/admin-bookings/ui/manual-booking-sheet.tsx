'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  manualBookingSchema,
  type ManualBookingFormValues,
  useCreateManualBooking,
} from '@/entities/booking';
import { useServices } from '@/entities/service';
import { useStaffList } from '@/entities/staff';
import { useAuthPermissions } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { AdminFormSheet } from '@/widgets/admin-form-sheet';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

interface ManualBookingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toUtcIso(localDatetime: string): string {
  return new Date(localDatetime).toISOString();
}

export function ManualBookingSheet({
  open,
  onOpenChange,
}: ManualBookingSheetProps) {
  const t = useTranslations('entities.bookings');
  const tCommon = useTranslations('common');
  const tTable = useTranslations('table');
  const tenant = useTenantSubdomain();
  const { can } = useAuthPermissions();
  const createBooking = useCreateManualBooking(tenant);
  const { data: services = [] } = useServices(tenant);
  const { data: staff = [] } = useStaffList(tenant, open);

  const schema = useMemo(() => manualBookingSchema(), []);

  const form = useForm<ManualBookingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      staffId: 0,
      startAtUtc: '',
      serviceIds: [],
    },
  });

  const selectedIds = form.watch('serviceIds');
  const summary = useMemo(() => {
    const selected = services.filter((s) => selectedIds.includes(s.id));
    const duration = selected.reduce((sum, s) => sum + s.durationMinutes, 0);
    const price = selected.reduce((sum, s) => sum + s.price, 0);
    return { duration, price, selected };
  }, [services, selectedIds]);

  useEffect(() => {
    if (!open) return;
    form.reset({ staffId: 0, startAtUtc: '', serviceIds: [] });
  }, [open, form]);

  if (!open) return null;

  const canSubmit = can(PERMISSION_CODES.BOOKING_CREATE);
  const formId = 'manual-booking-form';
  const isPending = createBooking.isPending;

  const onSubmit = async (values: ManualBookingFormValues) => {
    const startIso = toUtcIso(values.startAtUtc);
    const endDate = new Date(startIso);
    endDate.setMinutes(endDate.getMinutes() + summary.duration);
    try {
      await createBooking.mutateAsync({
        staffId: values.staffId,
        startAtUtc: startIso,
        endAtUtc: endDate.toISOString(),
        totalPrice: summary.price,
        customerId: values.customerId,
        services: summary.selected.map((s) => ({
          serviceId: s.id,
          serviceName: s.name,
          durationMinutes: s.durationMinutes,
          price: s.price,
        })),
      });
      toast.success(t('toastManualCreated'));
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const footer = canSubmit ? (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isPending}
      >
        {tCommon('cancel')}
      </Button>
      <Button
        type="submit"
        form={formId}
        disabled={isPending || summary.selected.length === 0}
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {tCommon('create')}
      </Button>
    </div>
  ) : null;

  return (
    <AdminFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('manualTitle')}
      description={t('manualDescription')}
      size="lg"
      showContentLocale={false}
      footer={footer}
    >
      <Form {...form}>
        <form
          id={formId}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="staffId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('staff')}</FormLabel>
                <Select
                  value={field.value ? String(field.value) : ''}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('staffPlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {staff
                      .filter((m) => m.isActive)
                      .map((member) => (
                        <SelectItem key={member.id} value={String(member.id)}>
                          {member.displayName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startAtUtc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tTable('time')}</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="serviceIds"
            render={() => (
              <FormItem>
                <FormLabel>{t('services')}</FormLabel>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                  {services
                    .filter((s) => s.isActive)
                    .map((service) => (
                      <FormField
                        key={service.id}
                        control={form.control}
                        name="serviceIds"
                        render={({ field }) => {
                          const checked = field.value?.includes(service.id);
                          return (
                            <FormItem className="flex items-center gap-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(value) => {
                                    const next = value
                                      ? [...(field.value ?? []), service.id]
                                      : (field.value ?? []).filter(
                                          (id) => id !== service.id,
                                        );
                                    field.onChange(next);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {service.name} — {service.durationMinutes} min ·{' '}
                                {service.price.toLocaleString()}₮
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          {summary.selected.length > 0 ? (
            <p className="text-muted-foreground text-sm">
              {t('summary', {
                duration: summary.duration,
                price: summary.price.toLocaleString(),
              })}
            </p>
          ) : null}
        </form>
      </Form>
    </AdminFormSheet>
  );
}
