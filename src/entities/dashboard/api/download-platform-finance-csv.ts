import { env } from '@/shared/config/env';
import { API_ENDPOINTS } from '@/shared/config/api.config';

function parseFilename(contentDisposition: string | null, fallback: string): string {
  if (!contentDisposition) {
    return fallback;
  }

  const match = /filename="([^"]+)"/.exec(contentDisposition);
  return match?.[1] ?? fallback;
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export async function downloadPlatformFinanceCsv(month: string): Promise<void> {
  const url = `${env.API_BASE_URL}${API_ENDPOINTS.DASHBOARD.PLATFORM_FINANCE_EXPORT}?month=${encodeURIComponent(month)}`;
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'text/csv' },
  });

  if (!response.ok) {
    throw new Error('EXPORT_FAILED');
  }

  const blob = await response.blob();
  const filename = parseFilename(
    response.headers.get('content-disposition'),
    `platform-finance-${month}.csv`,
  );
  triggerBrowserDownload(blob, filename);
}
