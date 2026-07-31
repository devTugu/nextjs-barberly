'use client';



import { useEffect, useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Loader2 } from 'lucide-react';

import { toast } from 'sonner';

import { api, getErrorMessage } from '@/shared/api';

import { API_ENDPOINTS } from '@/shared/config/api.config';

import { tenantQueryParams, useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';

import { Button } from '@/shared/ui/button';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

import { Input } from '@/shared/ui/input';

import { Label } from '@/shared/ui/label';

import { Switch } from '@/shared/ui/switch';

import { PageLoading } from '@/shared/ui/page-states';



interface LoyaltyRule {

  visitsRequired: number;

  discountPercent: number;

  isActive: boolean;

}



export function AdminLoyaltySettingsPanel() {

  const tenant = useTenantSubdomain();

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({

    queryKey: ['settings', 'loyalty', tenant],

    queryFn: () =>

      api.get<LoyaltyRule>(API_ENDPOINTS.SETTINGS.LOYALTY, {

        params: tenantQueryParams(tenant),

      }),

    enabled: Boolean(tenant),

  });



  const [visitsRequired, setVisitsRequired] = useState('5');

  const [discountPercent, setDiscountPercent] = useState('10');

  const [isActive, setIsActive] = useState(false);



  useEffect(() => {

    if (!data) return;

    setVisitsRequired(String(data.visitsRequired));

    setDiscountPercent(String(data.discountPercent));

    setIsActive(data.isActive);

  }, [data]);



  const save = useMutation({

    mutationFn: (payload: LoyaltyRule) =>

      api.patch<LoyaltyRule>(API_ENDPOINTS.SETTINGS.LOYALTY, payload, {

        params: tenantQueryParams(tenant),

      }),

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['settings', 'loyalty', tenant] });

      toast.success('Loyalty rule saved');

    },

    onError: (err) => toast.error(getErrorMessage(err)),

  });



  if (isLoading) return <PageLoading />;



  return (

    <Card className="mx-auto max-w-lg">

      <CardHeader>

        <CardTitle>Loyalty program</CardTitle>

      </CardHeader>

      <CardContent className="space-y-4">

        <div className="flex items-center justify-between">

          <Label htmlFor="loyalty-active">Enabled</Label>

          <Switch

            id="loyalty-active"

            checked={isActive}

            onCheckedChange={setIsActive}

          />

        </div>

        <div>

          <Label htmlFor="visits">Visits required</Label>

          <Input

            id="visits"

            type="number"

            min={1}

            value={visitsRequired}

            onChange={(e) => setVisitsRequired(e.target.value)}

          />

        </div>

        <div>

          <Label htmlFor="discount">Discount %</Label>

          <Input

            id="discount"

            type="number"

            min={0}

            max={100}

            value={discountPercent}

            onChange={(e) => setDiscountPercent(e.target.value)}

          />

        </div>

        <Button

          disabled={save.isPending}

          onClick={() =>

            save.mutate({

              visitsRequired: Number(visitsRequired),

              discountPercent: Number(discountPercent),

              isActive,

            })

          }

        >

          {save.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Save'}

        </Button>

      </CardContent>

    </Card>

  );

}


