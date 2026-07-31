export async function attachCustomerBooking(
  tenant: string,
  bookingId: number,
): Promise<void> {
  const csrf = await import('@/shared/lib/csrf-client').then((m) =>
    m.mutatingFetchHeaders(),
  );
  const res = await fetch(
    `/api/customer-auth/me/attach-booking?tenant=${tenant}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(await csrf) },
      body: JSON.stringify({ bookingId }),
    },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: { message?: string } }).error?.message ??
        'Failed to attach booking',
    );
  }
}
