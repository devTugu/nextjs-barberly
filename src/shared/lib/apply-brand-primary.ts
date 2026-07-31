import { normalizeHexColor } from '@/shared/lib/normalize-hex-color';

export function applyBrandPrimary(color: string | null | undefined): void {
  if (typeof document === 'undefined') return;
  const normalized = normalizeHexColor(color);
  const root = document.documentElement;
  if (normalized) {
    root.style.setProperty('--brand-primary', normalized);
  } else {
    root.style.removeProperty('--brand-primary');
  }
}
