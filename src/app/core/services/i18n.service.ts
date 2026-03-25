import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { AppLocale, DEFAULT_UI_PREFERENCES } from '../models/ui-preferences.model';
import { UserPreferencesService } from './user-preferences.service';

type TranslationParams = Record<string, string | number | null | undefined>;

const STORAGE_KEY = 'fin-plan.locale';

const TRANSLATIONS: Record<AppLocale, Record<string, string>> = {
  en: {
    'shell.brand.subtitle': 'House Savings',
    'shell.nav.dashboard': 'Dashboard',
    'shell.nav.goals': 'Savings Goal',
    'shell.nav.currency': 'Currency',
    'shell.locale.label': 'Language',
    'shell.signOut': 'Sign out',

    'auth.mockup.label': 'House Fund',
    'auth.mockup.badge': 'On track',
    'auth.mockup.progress': '71% of €60,000 goal',
    'auth.mockup.date': 'Est. Q3 2026',
    'auth.encryption': 'Secured with 256-bit encryption',

    'auth.login.panelTitle': 'Your finances, fully visualized.',
    'auth.login.panelText':
      'One intelligent dashboard to plan, track, and grow your savings — with clarity.',
    'auth.login.feature.progress': 'Real-time savings progress tracking',
    'auth.login.feature.forecast': 'Smart budget forecasting & projections',
    'auth.login.feature.security': 'Secure, private, encrypted by default',
    'auth.login.title': 'Welcome back',
    'auth.login.subtitle': 'Sign in to your financial dashboard',
    'auth.login.google': 'Continue with Google',
    'auth.login.googleLoading': 'Signing in…',
    'auth.login.divider': 'or continue with email',
    'auth.login.email': 'Email address',
    'auth.login.emailPlaceholder': 'you@example.com',
    'auth.login.emailError': 'Please enter a valid email address',
    'auth.login.password': 'Password',
    'auth.login.passwordPlaceholder': '••••••••',
    'auth.login.passwordError': 'Password must be at least 6 characters',
    'auth.login.forgotPassword': 'Forgot password?',
    'auth.login.submit': 'Sign in',
    'auth.login.noAccount': "Don't have an account?",
    'auth.login.createAccount': 'Create account',
    'auth.login.submitCta': 'Sign in',

    'auth.register.panelTitle': 'Start your path to home ownership.',
    'auth.register.panelText':
      'Set your goal, connect your savings, and watch your progress grow — all in one place.',
    'auth.register.feature.free': 'Free to use — no credit card needed',
    'auth.register.feature.balances': 'All your currency balances in one view',
    'auth.register.feature.fx': 'Live FX rates & real progress tracking',
    'auth.register.title': 'Create your account',
    'auth.register.subtitle': 'Start tracking your savings toward your home goal',
    'auth.register.google': 'Continue with Google',
    'auth.register.googleLoading': 'Creating account…',
    'auth.register.divider': 'or sign up with email',
    'auth.register.email': 'Email address',
    'auth.register.emailPlaceholder': 'you@example.com',
    'auth.register.emailError': 'Please enter a valid email address',
    'auth.register.password': 'Password',
    'auth.register.passwordPlaceholder': 'At least 8 characters',
    'auth.register.passwordError': 'Password must be at least 8 characters',
    'auth.register.confirmPassword': 'Confirm password',
    'auth.register.confirmPlaceholder': 'Repeat your password',
    'auth.register.confirmError': 'Please confirm your password',
    'auth.register.confirmMismatch': 'Passwords do not match',
    'auth.register.submit': 'Create account',
    'auth.register.hasAccount': 'Already have an account?',
    'auth.register.signIn': 'Sign in',

    'auth.errors.unexpected': 'An unexpected error occurred. Please try again.',
    'auth.errors.invalidCredential': 'Invalid email or password.',
    'auth.errors.userNotFound': 'No account found with this email.',
    'auth.errors.wrongPassword': 'Incorrect password.',
    'auth.errors.tooManyRequests': 'Too many attempts. Please try again later.',
    'auth.errors.popupClosedSignIn': 'Sign-in popup was closed. Please try again.',
    'auth.errors.popupClosedSignUp': 'Sign-up popup was closed. Please try again.',
    'auth.errors.popupBlocked':
      'Popup was blocked by your browser. Please allow popups for this site.',
    'auth.errors.popupCancelled': 'Only one sign-in popup can be open at a time.',
    'auth.errors.popupCancelledSignUp': 'Only one sign-up popup can be open at a time.',
    'auth.errors.network': 'Network error. Please check your connection.',
    'auth.errors.emailInUse': 'An account with this email already exists.',
    'auth.errors.invalidEmail': 'Please enter a valid email address.',
    'auth.errors.weakPassword': 'Password is too weak. Use at least 8 characters.',
    'auth.errors.signInFailed': 'Sign-in failed. Please try again.',
    'auth.errors.signUpFailed': 'Sign-up failed. Please try again.',

    'goal.title': 'Savings Goal',
    'goal.subtitle': 'Track your house purchase progress',
    'goal.edit': 'Edit Values',
    'goal.updateTitle': 'Edit Savings Goal',
    'goal.setTitle': 'Set Up Your Savings Goal',
    'goal.description':
      'Set your target in USD. Current savings are calculated automatically from the balances you entered on the currency page.',
    'goal.targetAmount': 'Total Target',
    'goal.targetAmountHint': 'USD is the main planning currency across the platform.',
    'goal.savedAmount': 'Amount Already Saved',
    'goal.savedAmountHint':
      'Automatically reflected from your saved balances on the currency page.',
    'goal.amountError': 'Enter a valid amount greater than $0.',
    'goal.saveError': 'Could not save your goal. Please try again.',
    'goal.saving': 'Saving...',
    'goal.updateCta': 'Save Changes',
    'goal.saveCta': 'Save Goal',
    'goal.cancel': 'Cancel',
    'goal.target': 'Target',
    'goal.totalTarget': 'Total Target',
    'goal.alreadySaved': 'Already Saved',
    'goal.remaining': 'Remaining',
    'goal.progress': 'Progress',
    'goal.progressSaved': '{{value}}% of total target reached',
    'goal.progressRate': 'Progress Rate',
    'goal.estimate': 'Est. Completion',
    'goal.estimateDone': 'Goal reached',
    'goal.estimatePace': 'at {{amount}}/month pace',
    'goal.gapToFill': 'Gap to Fill',
    'goal.stillNeeded': 'still needed',
    'goal.chartTitle': 'Savings Trajectory',
    'goal.chartSubtitle': 'estimated 6-month view from your current balance',
    'goal.milestones': 'Milestones',
    'goal.milestone25': '25% — First quarter',
    'goal.milestone50': '50% — Halfway there',
    'goal.milestone75': '75% — Almost there',
    'goal.milestone100': '100% — Goal reached',
    'goal.months': 'months',
    'goal.close': 'Close dialog',

    'dashboard.title': 'Dashboard',
    'dashboard.signedInAs': 'You are signed in as',
    'dashboard.unknown': 'unknown',

    'route.dashboardTitle': 'Dashboard — FinPlan',
    'route.goalTitle': 'Goal — FinPlan',
    'route.currencyTitle': 'Currency Tracker — FinPlan',
    'route.loginTitle': 'Sign in — FinPlan',
    'route.registerTitle': 'Create account — FinPlan',

    'currency.title': 'Currency Tracker',
    'currency.subtitle': 'UAH · USD · EUR holdings and conversion',
    'currency.editHoldings': 'Edit Holdings',
    'currency.aria.holdings': 'Currency holdings',
    'currency.aria.distributionChart': 'Portfolio distribution chart',
    'currency.aria.closeDialog': 'Close dialog',
    'currency.rates.usdToUah': 'USD → UAH',
    'currency.rates.eurToUah': 'EUR → UAH',
    'currency.rates.eurToUsd': 'EUR → USD',
    'currency.rates.updatedAt': 'Updated {{time}}',
    'currency.rates.update': 'Update rates',
    'currency.rates.fetchError': 'Could not fetch live rates. Please try again.',
    'currency.shareOfTotal': '{{value}}% of total',
    'currency.total': 'Total',
    'currency.cash': 'Cash',
    'currency.card': 'Card',
    'currency.totalValue': 'Total Portfolio Value',
    'currency.distribution': 'Portfolio Distribution',
    'currency.distributionCaption': 'by current holdings value',
    'currency.chartTooltipLabel': '{{label}}: {{value}}',
    'currency.converter': 'Currency Converter',
    'currency.converterHint': 'Live preview based on the active rates',
    'currency.converterRate': 'Rate: {{from}} = {{to}}',
    'currency.amount': 'Amount',
    'currency.from': 'From',
    'currency.to': 'To',
    'currency.swap': 'Swap currencies',
    'currency.convertedValue': 'Converted value',
    'currency.dialog.title': 'Edit Currency Holdings',
    'currency.dialog.subtitle': 'Split each currency between cash and bank card balances.',
    'currency.dialog.uah': 'UAH Amount',
    'currency.dialog.usd': 'USD Amount',
    'currency.dialog.eur': 'EUR Amount',
    'currency.dialog.save': 'Save',
    'currency.dialog.cancel': 'Cancel',
    'currency.dialog.saving': 'Saving...',
    'currency.dialog.saveError': 'Could not save holdings. Please try again.',
  },
  uk: {
    'shell.brand.subtitle': 'Заощадження на дім',
    'shell.nav.dashboard': 'Панель',
    'shell.nav.goals': 'Ціль заощаджень',
    'shell.nav.currency': 'Валюта',
    'shell.locale.label': 'Мова',
    'shell.signOut': 'Вийти',

    'auth.mockup.label': 'Фонд на дім',
    'auth.mockup.badge': 'За планом',
    'auth.mockup.progress': '71% від цілі €60,000',
    'auth.mockup.date': 'Орієнтовно III кв. 2026',
    'auth.encryption': 'Захищено 256-бітним шифруванням',

    'auth.login.panelTitle': 'Ваші фінанси, повністю візуалізовані.',
    'auth.login.panelText':
      'Єдина розумна панель, щоб планувати, відстежувати та збільшувати заощадження — прозоро й зрозуміло.',
    'auth.login.feature.progress': 'Відстеження прогресу заощаджень у реальному часі',
    'auth.login.feature.forecast': 'Розумне прогнозування бюджету та сценарії',
    'auth.login.feature.security': 'Безпечно, приватно, шифрування за замовчуванням',
    'auth.login.title': 'З поверненням',
    'auth.login.subtitle': 'Увійдіть до своєї фінансової панелі',
    'auth.login.google': 'Продовжити з Google',
    'auth.login.googleLoading': 'Вхід…',
    'auth.login.divider': 'або продовжити через email',
    'auth.login.email': 'Email',
    'auth.login.emailPlaceholder': 'you@example.com',
    'auth.login.emailError': 'Введіть коректну email-адресу',
    'auth.login.password': 'Пароль',
    'auth.login.passwordPlaceholder': '••••••••',
    'auth.login.passwordError': 'Пароль має містити щонайменше 6 символів',
    'auth.login.forgotPassword': 'Забули пароль?',
    'auth.login.submit': 'Увійти',
    'auth.login.noAccount': 'Ще немає акаунта?',
    'auth.login.createAccount': 'Створити акаунт',
    'auth.login.submitCta': 'Увійти',

    'auth.register.panelTitle': 'Почніть свій шлях до власного житла.',
    'auth.register.panelText':
      'Встановіть ціль, додайте свої заощадження та спостерігайте, як зростає прогрес — усе в одному місці.',
    'auth.register.feature.free': 'Безкоштовно — жодної банківської картки не потрібно',
    'auth.register.feature.balances': 'Усі ваші валютні залишки в одному місці',
    'auth.register.feature.fx': 'Актуальні курси та реальний прогрес',
    'auth.register.title': 'Створіть акаунт',
    'auth.register.subtitle': 'Почніть відстежувати заощадження на свою ціль',
    'auth.register.google': 'Продовжити з Google',
    'auth.register.googleLoading': 'Створення акаунта…',
    'auth.register.divider': 'або зареєструйтесь через email',
    'auth.register.email': 'Email',
    'auth.register.emailPlaceholder': 'you@example.com',
    'auth.register.emailError': 'Введіть коректну email-адресу',
    'auth.register.password': 'Пароль',
    'auth.register.passwordPlaceholder': 'Щонайменше 8 символів',
    'auth.register.passwordError': 'Пароль має містити щонайменше 8 символів',
    'auth.register.confirmPassword': 'Підтвердьте пароль',
    'auth.register.confirmPlaceholder': 'Повторіть пароль',
    'auth.register.confirmError': 'Підтвердьте пароль',
    'auth.register.confirmMismatch': 'Паролі не збігаються',
    'auth.register.submit': 'Створити акаунт',
    'auth.register.hasAccount': 'Вже маєте акаунт?',
    'auth.register.signIn': 'Увійти',

    'auth.errors.unexpected': 'Сталася неочікувана помилка. Спробуйте ще раз.',
    'auth.errors.invalidCredential': 'Невірний email або пароль.',
    'auth.errors.userNotFound': 'Акаунт із таким email не знайдено.',
    'auth.errors.wrongPassword': 'Неправильний пароль.',
    'auth.errors.tooManyRequests': 'Забагато спроб. Спробуйте пізніше.',
    'auth.errors.popupClosedSignIn': 'Вікно входу було закрито. Спробуйте ще раз.',
    'auth.errors.popupClosedSignUp': 'Вікно реєстрації було закрито. Спробуйте ще раз.',
    'auth.errors.popupBlocked':
      'Браузер заблокував спливаюче вікно. Дозвольте popup для цього сайту.',
    'auth.errors.popupCancelled': 'Одночасно може бути відкрито лише одне вікно входу.',
    'auth.errors.popupCancelledSignUp': 'Одночасно може бути відкрито лише одне вікно реєстрації.',
    'auth.errors.network': 'Помилка мережі. Перевірте підключення.',
    'auth.errors.emailInUse': 'Акаунт із таким email вже існує.',
    'auth.errors.invalidEmail': 'Введіть коректну email-адресу.',
    'auth.errors.weakPassword': 'Пароль занадто слабкий. Використайте щонайменше 8 символів.',
    'auth.errors.signInFailed': 'Не вдалося увійти. Спробуйте ще раз.',
    'auth.errors.signUpFailed': 'Не вдалося зареєструватися. Спробуйте ще раз.',

    'goal.title': 'Ціль заощаджень',
    'goal.subtitle': 'Відстежуйте прогрес до покупки житла',
    'goal.edit': 'Редагувати значення',
    'goal.updateTitle': 'Редагувати ціль заощаджень',
    'goal.setTitle': 'Налаштуйте ціль заощаджень',
    'goal.description':
      'Встановіть ціль у USD. Поточні заощадження автоматично підтягуються з балансів, які ви зберегли на сторінці валюти.',
    'goal.targetAmount': 'Загальна ціль',
    'goal.targetAmountHint': 'USD є основною валютою планування на платформі.',
    'goal.savedAmount': 'Вже збережено',
    'goal.savedAmountHint': 'Автоматично відображається із збережених балансів на сторінці валюти.',
    'goal.amountError': 'Введіть коректну суму, більшу за $0.',
    'goal.saveError': 'Не вдалося зберегти ціль. Спробуйте ще раз.',
    'goal.saving': 'Збереження...',
    'goal.updateCta': 'Зберегти зміни',
    'goal.saveCta': 'Зберегти ціль',
    'goal.cancel': 'Скасувати',
    'goal.target': 'Ціль',
    'goal.totalTarget': 'Загальна ціль',
    'goal.alreadySaved': 'Вже збережено',
    'goal.remaining': 'Залишилось',
    'goal.progress': 'Прогрес',
    'goal.progressSaved': '{{value}}% від загальної цілі досягнуто',
    'goal.progressRate': 'Темп прогресу',
    'goal.estimate': 'Оцінка завершення',
    'goal.estimateDone': 'Цілі досягнуто',
    'goal.estimatePace': 'за темпу {{amount}}/місяць',
    'goal.gapToFill': 'Залишок до цілі',
    'goal.stillNeeded': 'ще потрібно',
    'goal.chartTitle': 'Траєкторія заощаджень',
    'goal.chartSubtitle': 'орієнтовний 6-місячний вигляд від поточного балансу',
    'goal.milestones': 'Етапи',
    'goal.milestone25': '25% — Перша чверть',
    'goal.milestone50': '50% — Половина шляху',
    'goal.milestone75': '75% — Майже фініш',
    'goal.milestone100': '100% — Ціль досягнута',
    'goal.months': 'місяців',
    'goal.close': 'Закрити діалог',

    'dashboard.title': 'Панель',
    'dashboard.signedInAs': 'Ви увійшли як',
    'dashboard.unknown': 'невідомо',

    'route.dashboardTitle': 'Панель — FinPlan',
    'route.goalTitle': 'Ціль — FinPlan',
    'route.currencyTitle': 'Валютний трекер — FinPlan',
    'route.loginTitle': 'Вхід — FinPlan',
    'route.registerTitle': 'Створити акаунт — FinPlan',

    'currency.title': 'Валютний трекер',
    'currency.subtitle': 'UAH · USD · EUR залишки та конвертація',
    'currency.editHoldings': 'Редагувати залишки',
    'currency.aria.holdings': 'Валютні залишки',
    'currency.aria.distributionChart': 'Діаграма структури портфеля',
    'currency.aria.closeDialog': 'Закрити діалог',
    'currency.rates.usdToUah': 'USD → UAH',
    'currency.rates.eurToUah': 'EUR → UAH',
    'currency.rates.eurToUsd': 'EUR → USD',
    'currency.rates.updatedAt': 'Оновлено {{time}}',
    'currency.rates.update': 'Оновити курс',
    'currency.rates.fetchError': 'Не вдалося отримати актуальні курси. Спробуйте ще раз.',
    'currency.shareOfTotal': '{{value}}% від загальної суми',
    'currency.total': 'Усього',
    'currency.cash': 'Готівка',
    'currency.card': 'Картка',
    'currency.totalValue': 'Загальна вартість портфеля',
    'currency.distribution': 'Структура портфеля',
    'currency.distributionCaption': 'за поточною вартістю активів',
    'currency.chartTooltipLabel': '{{label}}: {{value}}',
    'currency.converter': 'Конвертер валют',
    'currency.converterHint': 'Попередній перегляд за активними курсами',
    'currency.converterRate': 'Курс: {{from}} = {{to}}',
    'currency.amount': 'Сума',
    'currency.from': 'З',
    'currency.to': 'В',
    'currency.swap': 'Поміняти валюти місцями',
    'currency.convertedValue': 'Конвертоване значення',
    'currency.dialog.title': 'Редагувати валютні залишки',
    'currency.dialog.subtitle': 'Розподіліть кожну валюту між готівкою та балансом на картці.',
    'currency.dialog.uah': 'Сума UAH',
    'currency.dialog.usd': 'Сума USD',
    'currency.dialog.eur': 'Сума EUR',
    'currency.dialog.save': 'Зберегти',
    'currency.dialog.cancel': 'Скасувати',
    'currency.dialog.saving': 'Збереження...',
    'currency.dialog.saveError': 'Не вдалося зберегти залишки. Спробуйте ще раз.',
  },
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly authService = inject(AuthService);
  private readonly userPreferencesService = inject(UserPreferencesService);

  private readonly uid = computed(() => this.authService.currentUser()?.uid ?? null);
  readonly locale = signal<AppLocale>(this.readStoredLocale());

  private readonly remotePreferences = toSignal(
    toObservable(this.uid).pipe(
      switchMap((uid) =>
        uid !== null
          ? this.userPreferencesService.getUiPreferences$(uid).pipe(catchError(() => of(null)))
          : of(null),
      ),
    ),
    { initialValue: null },
  );

  constructor() {
    effect(() => {
      const remoteLocale = this.remotePreferences()?.locale;
      if (remoteLocale === undefined || remoteLocale === this.locale()) {
        return;
      }

      this.locale.set(remoteLocale);
      this.storeLocale(remoteLocale);
    });
  }

  setLocale(locale: AppLocale): void {
    if (locale === this.locale()) {
      return;
    }

    this.locale.set(locale);
    this.storeLocale(locale);

    const uid = this.uid();
    if (uid === null) {
      return;
    }

    this.userPreferencesService.updateUiPreferences(uid, { locale }).subscribe({
      error: () => {
        // Keep the optimistic locale locally; Firestore sync will catch up on the next successful save.
      },
    });
  }

  translate(key: string, params?: TranslationParams): string {
    const template = TRANSLATIONS[this.locale()][key] ?? TRANSLATIONS.en[key] ?? key;

    if (params === undefined) {
      return template;
    }

    return Object.entries(params).reduce(
      (result, [name, value]) => result.replaceAll(`{{${name}}}`, String(value)),
      template,
    );
  }

  private readStoredLocale(): AppLocale {
    if (typeof localStorage === 'undefined') {
      return DEFAULT_UI_PREFERENCES.locale;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'uk' ? 'uk' : DEFAULT_UI_PREFERENCES.locale;
  }

  private storeLocale(locale: AppLocale): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(STORAGE_KEY, locale);
  }
}
