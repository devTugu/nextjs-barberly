'use client';

import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  useBrandCatalogSyncStatus,
  useApplyBrandCatalogSync,
} from '@/entities/dashboard';
import { useMyTenant } from '@/entities/tenant';
import { useAuthPermissions } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

function formatSyncedAt(
  value: string | null,
  neverLabel: string,
  format: (d: Date) => string,
): string {
  if (!value) return neverLabel;
  return format(new Date(value));
}

export function BrandCatalogSyncPanel() {
  const t = useTranslations('entities.services');
  const tenant = useTenantSubdomain();
  const { can } = useAuthPermissions();
  const { data: myTenant } = useMyTenant(tenant);
  const isBrandRoot =
    myTenant != null &&
    myTenant.parentTenantId == null &&
    !myTenant.inheritance?.isChild;

  const { data, isLoading, isError } = useBrandCatalogSyncStatus(
    tenant,
    Boolean(isBrandRoot),
  );
  const applySync = useApplyBrandCatalogSync(tenant);

  if (!isBrandRoot) return null;
  if (isError) return null;

  const canApply = can(PERMISSION_CODES.SERVICE_UPDATE);

  const onApply = async () => {
    try {
      await applySync.mutateAsync(undefined);
      toast.success(t('catalogSyncSuccess'));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-base">{t('catalogSyncTitle')}</CardTitle>
          <CardDescription>{t('catalogSyncDescription')}</CardDescription>
        </div>
        {canApply ? (
          <Button
            type="button"
            size="sm"
            onClick={() => void onApply()}
            disabled={applySync.isPending || isLoading}
          >
            {applySync.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            {t('catalogSyncApply')}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-28 w-full" />
        ) : !data ? null : (
          <>
            {data.hasPendingChanges ? (
              <Alert variant="warning">
                <AlertTriangle />
                <AlertTitle>{t('catalogSyncDriftTitle')}</AlertTitle>
                <AlertDescription>
                  {t('catalogSyncDriftBody')}
                </AlertDescription>
              </Alert>
            ) : null}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('catalogSyncBranch')}</TableHead>
                  <TableHead>{t('catalogSyncLastSynced')}</TableHead>
                  <TableHead className="text-right">
                    {t('catalogSyncStatus')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.branches.map((branch) => (
                  <TableRow key={branch.tenantId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{branch.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {branch.subdomain}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatSyncedAt(
                        branch.lastSyncedAt,
                        t('catalogSyncNever'),
                        (d) => d.toLocaleString(),
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {branch.needsSync
                        ? t('catalogSyncNeedsSync')
                        : t('catalogSyncInSync')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}
