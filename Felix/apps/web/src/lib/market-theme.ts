import { applyMarketTheme, getDefaultMarketTheme } from '@felix/ui';

const THEME_STORAGE_KEY = 'felix-market-theme-applied';

/**
 * Aplica tema de mercado no documento antes da primeira pintura (quando possível).
 */
export function initMarketTheme(): void {
  if (typeof document === 'undefined') return;
  applyMarketTheme(document.documentElement, getDefaultMarketTheme());
  try {
    localStorage.setItem(THEME_STORAGE_KEY, '1');
  } catch {
    // ignore quota errors
  }
}
