'use client';



import { useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Loader2 } from 'lucide-react';

import { toast } from 'sonner';

import { api } from '@/shared/api';

import { getErrorMessage } from '@/shared/api';

import { API_ENDPOINTS } from '@/shared/config/api.config';

import { tenantQueryParams, useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';

import { Button } from '@/shared/ui/button';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import { Input } from '@/shared/ui/input';

import { Label } from '@/shared/ui/label';

import { PageLoading } from '@/shared/ui/page-states';



interface RentInvoice {

  id: number;

  staffId: number;

  periodMonth: string;

  amount: number;

  status: string;

}



export function AdminRentInvoicesPanel() {

  const tenant = useTenantSubdomain();

  const queryClient = useQueryClient();

  const [periodMonth, setPeriodMonth] = useState(() => {

    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  });



  const { data, isLoading } = useQuery({

    queryKey: ['settings', 'rent-invoices', tenant],

    queryFn: () =>

      api.get<{ items: RentInvoice[] }>(API_ENDPOINTS.SETTINGS.RENT_INVOICES, {

        params: tenantQueryParams(tenant),

      }),

    enabled: Boolean(tenant),

  });

  const invoices = data?.items ?? [];



  const generate = useMutation({

    mutationFn: () =>

      api.patch<{ createdCount: number }>(

        API_ENDPOINTS.SETTINGS.GENERATE_RENT,

        {},

        { params: { ...tenantQueryParams(tenant), periodMonth } },

      ),

    onSuccess: (result) => {

      queryClient.invalidateQueries({

        queryKey: ['settings', 'rent-invoices', tenant],

      });

      toast.success(`Generated ${result.createdCount} invoices`);

    },

    onError: (err) => toast.error(getErrorMessage(err)),

  });



  if (isLoading) return <PageLoading />;



  return (

    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">

      <Card>

        <CardHeader>

          <CardTitle>Generate monthly rent</CardTitle>

        </CardHeader>

        <CardContent className="flex flex-wrap items-end gap-3">

          <div>

            <Label htmlFor="period">Period (YYYY-MM)</Label>

            <Input

              id="period"

              value={periodMonth}

              onChange={(e) => setPeriodMonth(e.target.value)}

            />

          </div>

          <Button

            disabled={generate.isPending}

            onClick={() => generate.mutate()}

          >

            {generate.isPending ? (

              <Loader2 className="size-4 animate-spin" />

            ) : (

              'Generate'

            )}

          </Button>

        </CardContent>

      </Card>



      <Card>

        <CardHeader>

          <CardTitle>Rent invoices</CardTitle>

        </CardHeader>

        <CardContent>

          <ul className="space-y-2 text-sm">

            {invoices.map((invoice) => (

              <li

                key={invoice.id}

                className="flex justify-between rounded-md border px-3 py-2"

              >

                <span>

                  Staff #{invoice.staffId} — {invoice.periodMonth}

                </span>

                <span>

                  {invoice.amount.toLocaleString()} MNT ({invoice.status})

                </span>

              </li>

            ))}

            {invoices.length === 0 ? (

              <p className="text-muted-foreground">No rent invoices yet.</p>

            ) : null}

          </ul>

        </CardContent>

      </Card>

    </div>

  );

}


