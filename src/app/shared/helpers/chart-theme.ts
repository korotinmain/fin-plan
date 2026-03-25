/**
 * Reads design-token CSS custom properties at runtime and returns a typed
 * theme object for use in Chart.js configuration.
 *
 * Call once per component instance as a class field initialiser.
 * Safe to call in the browser — do not use in SSR contexts.
 */
export interface ChartTheme {
  violet: string;
  violetFill: string;
  emerald: string;
  primary: string;
  surface: string;
  chartEmpty: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  chartGrid: string;
}

export function getChartTheme(): ChartTheme {
  const style = getComputedStyle(document.documentElement);
  const get = (name: string): string => style.getPropertyValue(name).trim();
  return {
    violet: get('--color-accent-violet'),
    violetFill: get('--color-chart-violet-fill'),
    emerald: get('--color-accent-emerald'),
    primary: get('--color-primary'),
    surface: get('--color-bg-surface'),
    chartEmpty: get('--color-chart-empty'),
    textPrimary: get('--color-text-primary'),
    textSecondary: get('--color-text-secondary'),
    border: get('--color-border'),
    chartGrid: get('--color-chart-grid'),
  };
}
