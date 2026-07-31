import type { Page } from '@playwright/test';

const customerPhone = process.env.E2E_CUSTOMER_PHONE ?? '99119911';
const otpCode = process.env.NEXT_PUBLIC_OTP_DEV_BYPASS_CODE ?? '000000';
const csrfHeader = 'x-csrf-token';

async function fetchCsrf(page: Page): Promise<string> {
  const response = await page.request.get('/api/auth/csrf');
  const json = (await response.json()) as { data: { token: string } };
  return json.data.token;
}

export async function loginAsCustomer(
  page: Page,
  tenant = 'demo',
): Promise<void> {
  const csrf = await fetchCsrf(page);
  const headers = {
    'Content-Type': 'application/json',
    [csrfHeader]: csrf,
  };
  await page.request.post(`/api/customer-auth/otp/send?tenant=${tenant}`, {
    headers,
    data: { phone: customerPhone },
  });
  await page.request.post(`/api/customer-auth/otp/verify?tenant=${tenant}`, {
    headers,
    data: { phone: customerPhone, code: otpCode },
  });
  await page.goto(`/user/dashboard?tenant=${tenant}`);
  await page.waitForURL(/\/user\/dashboard/, { timeout: 15_000 });
}

export { customerPhone, otpCode };
