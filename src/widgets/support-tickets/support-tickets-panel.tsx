'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { PageLoading } from '@/shared/ui/page-states';
import { Badge } from '@/shared/ui/badge';

export function SupportTicketsPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['platform', 'support-tickets'],
    queryFn: () =>
      api.get<{
        items: Array<{
          id: number;
          subject: string;
          status: string;
          reporterEmail: string | null;
          createdAt: string;
        }>;
      }>(API_ENDPOINTS.PLATFORM.SUPPORT_TICKETS),
  });

  if (isLoading) return <PageLoading />;

  return (
    <div className="flex flex-col gap-3 p-4">
      {(data?.items ?? []).map((ticket) => (
        <Card key={ticket.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{ticket.subject}</CardTitle>
            <Badge variant="outline">{ticket.status}</Badge>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {ticket.reporterEmail ?? '—'} · {new Date(ticket.createdAt).toLocaleString()}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
