'use client';

import Link from 'next/link';
import type { BookingOutput } from '@/entities/booking';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { staffLaneColor } from './calendar-layout';
import { bookingStatusVariant } from './calendar-time';

export function BookingCell({
  booking,
  timeZone,
  tStatus,
  className,
}: {
  booking: BookingOutput;
  timeZone: string;
  tStatus: (key: string) => string;
  className?: string;
}) {
  return (
    <Button
      variant="outline"
      className={cn(
        'min-h-11 h-auto w-full justify-start border-l-4 px-2 py-2 text-left',
        className,
      )}
      style={{ borderLeftColor: staffLaneColor(booking.staffId) }}
      asChild
    >
      <Link href={ROUTES.adminBooking(booking.id)}>
        <div className="space-y-1">
          <p className="text-xs font-medium">
            {new Intl.DateTimeFormat(undefined, {
              timeZone,
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(booking.startAtUtc))}
            {' · '}#{booking.id}
          </p>
          <Badge
            variant={bookingStatusVariant(booking.status)}
            className="text-xs"
          >
            {tStatus(booking.status)}
          </Badge>
        </div>
      </Link>
    </Button>
  );
}
