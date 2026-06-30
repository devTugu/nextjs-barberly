'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { publicGet, publicPost } from '@/shared/lib/public-api';
import { env } from '@/shared/config/env';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';

type Service = {
  id: number;
  name: string;
  durationMinutes: number;
  price: number;
};

type Slot = { startAtUtc: string; staffId: number };

type Booking = {
  id: number;
  status: string;
  totalPrice: number;
  startAtUtc: string;
};

type PaymentResult = {
  paymentId: number;
  invoiceId: string;
  qrText: string;
  urls: Array<{ name: string; link: string; description: string }>;
};

const STEPS = ['services', 'slot', 'otp', 'pay'] as const;
type Step = (typeof STEPS)[number];

export function BookingWizard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tenant = searchParams.get('tenant') ?? 'demo';

  const [step, setStep] = useState<Step>('services');
  const [services, setServices] = useState<Service[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpHint, setOtpHint] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    publicGet<Service[]>('/services', tenant)
      .then(setServices)
      .catch((e) => setError(e.message));
  }, [tenant]);

  const totalPrice = useMemo(
    () =>
      services
        .filter((s) => selectedIds.includes(s.id))
        .reduce((sum, s) => sum + s.price, 0),
    [services, selectedIds],
  );

type SlotResponse = {
  staffId: number;
  slots: Array<{ startUtc: string }>;
};

  const loadSlots = useCallback(async () => {
    if (!date || selectedIds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const durationMinutes = services
        .filter((s) => selectedIds.includes(s.id))
        .reduce((sum, s) => sum + s.durationMinutes, 0);
      const result = await publicGet<SlotResponse>('/available-slots', tenant, {
        date,
        serviceId: String(selectedIds[0]),
        durationMinutes: String(durationMinutes),
      });
      setSlots(
        (result.slots ?? []).map((slot) => ({
          startAtUtc: slot.startUtc,
          staffId: result.staffId,
        })),
      );
      setStep('slot');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load slots');
    } finally {
      setLoading(false);
    }
  }, [date, selectedIds, tenant]);

  const lockSlot = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    setError(null);
    try {
      const locked = await publicPost<Booking>('/bookings/lock', tenant, {
        serviceIds: selectedIds,
        startAtUtc: selectedSlot.startAtUtc,
        staffId: selectedSlot.staffId,
      });
      setBooking(locked);
      setStep('otp');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Slot unavailable');
    } finally {
      setLoading(false);
    }
  };

  const devOtpBypass = env.OTP_DEV_BYPASS_CODE;
  const isDevBooking = env.APP_ENV !== 'production' && devOtpBypass !== null;

  const verifyAndContinue = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const csrf = await import('@/shared/lib/csrf-client').then((m) =>
        m.mutatingFetchHeaders(),
      );
      const res = await fetch(`/api/customer-auth/otp/verify?tenant=${tenant}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(await csrf) },
        body: JSON.stringify({
          phone,
          code,
          bookingId: booking?.id,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error?.message ?? 'OTP verify failed');
      }
      setStep('pay');
      await startPayment();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'OTP verify failed');
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    setLoading(true);
    setError(null);
    setOtpHint(null);
    try {
      const csrf = await import('@/shared/lib/csrf-client').then((m) =>
        m.mutatingFetchHeaders(),
      );
      const res = await fetch(`/api/customer-auth/otp/send?tenant=${tenant}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(await csrf) },
        body: JSON.stringify({ phone }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message ?? 'OTP send failed');
      }
      const data = body.data as {
        devCode?: string;
        devBypassCode?: string;
      };
      if (data.devCode) {
        setOtp(data.devCode);
        setOtpHint(`Dev OTP: ${data.devCode}`);
      } else if (data.devBypassCode) {
        setOtp(data.devBypassCode);
        setOtpHint(`Dev bypass: ${data.devBypassCode}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'OTP send failed');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    await verifyAndContinue(otp);
  };

  const devContinue = async () => {
    if (!devOtpBypass) return;
    setOtp(devOtpBypass);
    await verifyAndContinue(devOtpBypass);
  };

  const startPayment = async () => {
    if (!booking) return;
    setLoading(true);
    try {
      const result = await publicPost<PaymentResult>(
        `/bookings/${booking.id}/pay`,
        tenant,
      );
      setPayment(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const simulatePay = async () => {
    if (!payment || !booking) return;
    setLoading(true);
    try {
      await publicPost('/webhooks/qpay/simulate', tenant, {
        invoice_id: payment.invoiceId,
        payment_id: `sim-${Date.now()}`,
        payment_status: 'PAID',
        payment_amount: booking.totalPrice,
      });
      router.push(
        `${ROUTES.BOOK_CONFIRM}?tenant=${tenant}&bookingId=${booking.id}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Simulate failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Book appointment</h1>
        <span className="text-sm text-muted-foreground">{tenant}</span>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {step === 'services' && (
        <Card>
          <CardHeader>
            <CardTitle>Choose services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {services.map((service) => (
              <label
                key={service.id}
                className="flex cursor-pointer items-center gap-3 rounded-md border p-3"
              >
                <Checkbox
                  checked={selectedIds.includes(service.id)}
                  onCheckedChange={(checked) => {
                    setSelectedIds((ids) =>
                      checked
                        ? [...ids, service.id]
                        : ids.filter((id) => id !== service.id),
                    );
                  }}
                />
                <span className="flex-1">{service.name}</span>
                <span className="text-sm text-muted-foreground">
                  {service.durationMinutes}m · {service.price.toLocaleString()}₮
                </span>
              </label>
            ))}
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Button
              disabled={!selectedIds.length || !date || loading}
              onClick={loadSlots}
              className="w-full"
            >
              Next: pick a time
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'slot' && (
        <Card>
          <CardHeader>
            <CardTitle>Available slots</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {slots.length === 0 && (
              <p className="text-sm text-muted-foreground">No slots this day.</p>
            )}
            {slots.map((slot) => (
              <Button
                key={slot.startAtUtc}
                variant={
                  selectedSlot?.startAtUtc === slot.startAtUtc
                    ? 'default'
                    : 'outline'
                }
                onClick={() => setSelectedSlot(slot)}
              >
                {new Date(slot.startAtUtc).toLocaleString()}
              </Button>
            ))}
            <Button disabled={!selectedSlot || loading} onClick={lockSlot}>
              Reserve slot
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'otp' && (
        <Card>
          <CardHeader>
            <CardTitle>Verify phone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Booking #{booking?.id} · {totalPrice.toLocaleString()}₮
            </p>
            {isDevBooking && (
              <p className="rounded-md bg-muted px-3 py-2 text-sm">
                Dev: утас оруулаад <strong>{devOtpBypass}</strong> кодоор шууд
                үргэлжлүүлж болно (SMS шаардлагагүй).
              </p>
            )}
            <Input
              placeholder="Phone (e.g. 99112233)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {isDevBooking ? (
              <Button
                onClick={devContinue}
                disabled={!phone || loading}
                className="w-full"
              >
                Continue (dev — no SMS)
              </Button>
            ) : null}
            <Button variant="outline" onClick={sendOtp} disabled={!phone || loading}>
              Send OTP
            </Button>
            {otpHint ? (
              <p className="text-sm text-muted-foreground">{otpHint}</p>
            ) : null}
            <Input
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button onClick={verifyOtp} disabled={!otp || !phone || loading} className="w-full">
              Verify & continue to pay
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'pay' && payment && (
        <Card>
          <CardHeader>
            <CardTitle>Pay with QPay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="break-all font-mono text-xs">{payment.qrText}</p>
            <Button onClick={simulatePay} disabled={loading} className="w-full">
              Simulate payment (dev)
            </Button>
            <Button variant="link" asChild>
              <Link href={ROUTES.HOME}>Back home</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
