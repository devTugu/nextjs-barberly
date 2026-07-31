'use client';

import { useTranslations } from 'next-intl';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';

export function InheritOverrideToggle({
  isChild,
  inherited,
  onChange,
  disabled,
}: {
  isChild: boolean;
  inherited: boolean;
  onChange: (inherit: boolean) => void;
  disabled?: boolean;
}) {
  const t = useTranslations('adminSettings');
  if (!isChild) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
      <div className="space-y-0.5">
        <Label className="text-sm font-medium">
          {inherited ? t('inheritFromBrand') : t('overrideBrand')}
        </Label>
        <p className="text-muted-foreground text-xs">
          {inherited ? t('inheritHint') : t('overrideHint')}
        </p>
      </div>
      <Switch
        checked={!inherited}
        disabled={disabled}
        onCheckedChange={(checked) => onChange(!checked)}
        aria-label={inherited ? t('inheritFromBrand') : t('overrideBrand')}
      />
    </div>
  );
}
