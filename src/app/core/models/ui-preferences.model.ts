export type AppLocale = 'en' | 'uk';

export interface UiPreferences {
  locale: AppLocale;
}

export const DEFAULT_UI_PREFERENCES: UiPreferences = {
  locale: 'en',
};
