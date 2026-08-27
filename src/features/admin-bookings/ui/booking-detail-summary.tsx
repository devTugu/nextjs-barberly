'use client';

import type { BookingOutput } from '@/entities/booking';

interface BookingDetailSummaryProps {
  booking: BookingOutput;
  customerName: string;
  customerPhone: string;
  totalDuration: number;
  lockExpiresLabel: string | null;
  lockExpired: boolean;
  showPaymentStatus: boolean;
  labels: {
    paymentStatusTitle: string;
    settlementStatus: string;
    depositAmount: string;
    balanceDue: string;
    remainingBalance: string;
    lockExpired: string;
    lockExpiresAt: string;
    customer: string;
    services: string;
    summary: string;
  };
}

export function BookingDetailSummary({
  booking,
  customerName,
  customerPhone,
  totalDuration,
  lockExpiresLabel,
  lockExpired,
  showPaymentStatus,
  labels,
}: BookingDetailSummaryProps) {
  return (
    <>
      <p className="text-muted-foreground text-sm">
        {new Date(booking.startAtUtc).toLocaleString()} ·{' '}
        {booking.totalPrice.toLocaleString()}₮
      </p>
      {showPaymentStatus ? (
        <div className="rounded-md border p-3 text-sm space-y-2">
          <p className="text-muted-foreground">{labels.paymentStatusTitle}</p>
          <p className="font-medium">{labels.settlementStatus}</p>
          <div className="text-muted-foreground space-y-1">
            <p>
              {labels.depositAmount}: {booking.depositAmount.toLocaleString()}₮
            </p>
            <p>
              {labels.balanceDue}: {booking.balanceDue.toLocaleString()}₮
            </p>
            <p>
              {labels.remainingBalance}: {booking.remainingBalance.toLocaleString()}₮
            </p>
          </div>
          {booking.status === 'pending_payment' && lockExpiresLabel ? (
            <p className="text-muted-foreground mt-1">
              {lockExpired
                ? labels.lockExpired
                : labels.lockExpiresAt}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="grid gap-3 rounded-md border p-3 text-sm">
        <div>
          <p className="text-muted-foreground">{labels.customer}</p>
          <p className="font-medium">{customerName}</p>
          <p className="text-muted-foreground">{customerPhone}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{labels.services}</p>
          <div className="mt-2 space-y-2">
            {booking.services.map((service) => (
              <div
                key={service.serviceId}
                className="flex items-center justify-between gap-3"
              >
                <span>{service.serviceName}</span>
                <span className="text-muted-foreground whitespace-nowrap">
                  {service.durationMinutes} min · {service.price.toLocaleString()}₮
                </span>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground mt-2">{labels.summary}</p>
        </div>
      </div>
    </>
  );
}
