export interface CustomerSession {
  id: number;
  phone: string;
  name: string | null;
  needsProfile: boolean;
}

export async function fetchCustomerSession(
  tenant: string,
): Promise<CustomerSession | null> {
  const res = await fetch(`/api/customer-auth/me?tenant=${tenant}`, {
    credentials: 'include',
  });
  if (!res.ok) return null;
  const body = await res.json();
  const data = body.data as {
    id: number;
    phone: string;
    name: string | null;
    needsProfile?: boolean;
  };
  if (!data?.id) return null;
  return {
    id: data.id,
    phone: data.phone,
    name: data.name,
    needsProfile: data.needsProfile ?? !data.name?.trim(),
  };
}
