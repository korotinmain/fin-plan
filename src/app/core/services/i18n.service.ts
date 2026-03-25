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
    'shell.nav.sources': 'Sources',
    'shell.nav.expectedFunds': 'Expected Funds',
    'shell.nav.exchangeOps': 'Activities',
    'shell.nav.currency': 'Currency',
    'shell.rates.eyebrow': 'Live FX',
    'shell.rates.title': 'Current rates',
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

    'goal.title': 'Dashboard',
    'goal.subtitle': 'Track your target, current savings, and paid-in amount in one place.',
    'goal.edit': 'Edit Dashboard',
    'goal.updateTitle': 'Edit Dashboard Values',
    'goal.setTitle': 'Set Up Your Dashboard',
    'goal.description':
      'Set your target in USD, record what is already paid toward the property, and keep current savings synced from the currency page.',
    'goal.targetAmount': 'Total Target',
    'goal.targetAmountHint': 'USD is the main planning currency across the platform.',
    'goal.alreadyPaid': 'Already Paid Toward Home',
    'goal.alreadyPaidHint':
      'Use this for deposits or partial payments already transferred to the property and no longer sitting in your balances.',
    'goal.savedAmount': 'Current Savings',
    'goal.savedAmountHint':
      'Automatically reflected from your saved balances on the currency page.',
    'goal.amountError': 'Enter a valid amount greater than $0.',
    'goal.saveError': 'Could not save dashboard values. Please try again.',
    'goal.saving': 'Saving...',
    'goal.updateCta': 'Save Changes',
    'goal.saveCta': 'Save Dashboard',
    'goal.cancel': 'Cancel',
    'goal.target': 'Target',
    'goal.totalTarget': 'Total Target',
    'goal.alreadySaved': 'Current Savings',
    'goal.remaining': 'Remaining',
    'goal.progress': 'Progress',
    'goal.progressSaved': '{{value}}% of total target reached',
    'goal.progressRate': 'Progress Rate',
    'goal.estimate': 'Est. Completion',
    'goal.estimateDone': 'Goal reached',
    'goal.estimatePace': 'at {{amount}}/month pace',
    'goal.gapToFill': 'Remaining Gap',
    'goal.stillNeeded': 'left to close',
    'goal.chartTitle': 'Progress Trajectory',
    'goal.chartSubtitle': 'Estimated 6-month view based on your current position',
    'goal.milestones': 'Progress Checkpoints',
    'goal.milestone25': '25% — First quarter',
    'goal.milestone50': '50% — Halfway there',
    'goal.milestone75': '75% — Almost there',
    'goal.milestone100': '100% — Goal reached',
    'goal.months': 'months',
    'goal.close': 'Close dialog',

    'route.dashboardTitle': 'Dashboard — FinPlan',
    'route.sourcesTitle': 'Sources — FinPlan',
    'route.expectedFundsTitle': 'Expected Funds — FinPlan',
    'route.exchangeOpsTitle': 'Activities — FinPlan',
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

    'sources.eyebrow': 'Money Sources',
    'sources.title': 'Source Breakdown',
    'sources.subtitle':
      'Track where your capital actually lives and how each source contributes in USD.',
    'sources.editBalances': 'Edit balances',
    'sources.shareOfCapital': 'Share of own capital: {{value}}%',
    'sources.active': 'active',
    'sources.currentAmount': 'Current amount',
    'sources.normalizedUsd': '≈ {{value}} normalized to USD',
    'sources.notes.cashUsd': 'Most liquid holding',
    'sources.notes.cardUsd': 'Digital reserve',
    'sources.notes.cardUah': 'FX exposure before conversion',
    'sources.notes.cashUah': 'Local liquidity',
    'sources.compositionTitle': 'Source composition',
    'sources.compositionSubtitle': 'How your own savings are distributed.',
    'sources.ownSavings': 'Own savings',
    'sources.insightsTitle': 'Source insights',
    'sources.insightsSubtitle':
      'Keep the UI tied to the house goal, not generic holdings analytics.',
    'sources.totalOwnSavings': 'Total own savings',
    'sources.totalOwnSavingsHint': 'Converted to the house baseline currency',
    'sources.usdAlreadyLiquid': 'USD already liquid',
    'sources.usdAlreadyLiquidHint': 'Immediately usable without FX conversion',
    'sources.uahExposure': 'UAH exposure',
    'sources.uahExposureHint': 'Still exposed to market spread and buy rate',
    'sources.recommendedNextStep': 'Recommended next step',
    'sources.recommendedCardUah': 'Convert Card UAH',
    'sources.recommendedCashUah': 'Convert Cash UAH',
    'sources.recommendedHint': 'Largest current FX risk before purchase window',
    'sources.editSubtitle':
      'Keep the four tracked balances aligned with your current capital position.',
    'sources.cancel': 'Cancel',
    'sources.save': 'Save balances',
    'sources.saving': 'Saving...',
    'sources.saveError': 'Could not save balances. Please try again.',

    'expectedFunds.eyebrow': 'External Support',
    'expectedFunds.title': 'Expected Borrowed Funds',
    'expectedFunds.subtitle':
      'Keep borrowed or promised money visible, auditable, and separate from your own savings.',
    'expectedFunds.addCta': 'Add expected fund',
    'expectedFunds.total': 'Expected total',
    'expectedFunds.totalHint': 'Included in readiness forecast, separate from own capital',
    'expectedFunds.confirmed': 'Confirmed amount',
    'expectedFunds.confirmedHint': 'High-confidence support already agreed',
    'expectedFunds.coverage': 'Support coverage',
    'expectedFunds.coverageHint': 'Of the still-missing amount after own savings',
    'expectedFunds.registryTitle': 'Support registry',
    'expectedFunds.registrySubtitle':
      'Each row should clearly explain who contributes, in what currency, and how it affects readiness.',
    'expectedFunds.colSource': 'Source',
    'expectedFunds.colOriginal': 'Original',
    'expectedFunds.colUsdValue': 'USD value',
    'expectedFunds.colEta': 'ETA',
    'expectedFunds.colStatus': 'Status',
    'expectedFunds.statusConfirmed': 'Confirmed',
    'expectedFunds.statusPlanned': 'Planned',
    'expectedFunds.edit': 'Edit',
    'expectedFunds.delete': 'Delete',
    'expectedFunds.emptyTitle': 'No expected funds yet',
    'expectedFunds.emptySubtitle':
      'Add promised or planned support so the readiness forecast reflects real inputs.',
    'expectedFunds.dialogAddTitle': 'Add expected fund',
    'expectedFunds.dialogEditTitle': 'Edit expected fund',
    'expectedFunds.dialogSubtitle':
      'Keep support entries visible, editable, and converted from their original currency.',
    'expectedFunds.form.sourceLabel': 'Source',
    'expectedFunds.form.sourcePlaceholder': 'Parents, partner, reserve support',
    'expectedFunds.form.descriptionLabel': 'Description',
    'expectedFunds.form.descriptionPlaceholder': 'What this support represents',
    'expectedFunds.form.currencyLabel': 'Currency',
    'expectedFunds.form.amountLabel': 'Original amount',
    'expectedFunds.form.etaLabel': 'ETA',
    'expectedFunds.form.etaPlaceholder': 'Q4 2026, May 2026, Optional',
    'expectedFunds.form.statusLabel': 'Status',
    'expectedFunds.form.status.confirmed': 'Confirmed',
    'expectedFunds.form.status.planned': 'Planned',
    'expectedFunds.cancel': 'Cancel',
    'expectedFunds.save': 'Save expected fund',
    'expectedFunds.saving': 'Saving...',
    'expectedFunds.errors.invalidForm':
      'Enter a source, ETA, and an amount above zero before saving.',
    'expectedFunds.errors.saveFailed': 'Could not save the expected fund. Please try again.',
    'expectedFunds.errors.deleteFailed': 'Could not delete the expected fund. Please try again.',

    'operations.eyebrow': 'Activities',
    'operations.title': 'Activities',
    'operations.subtitle':
      'Track movement between sources and keep every balance change visible in one place.',
    'operations.recordExchange': 'Record activity',
    'operations.activityTitle': 'Activity log',
    'operations.activitySubtitle':
      'Operations should be auditable and explain how balances changed.',
    'operations.filterLabel': 'Period',
    'operations.filterAllMonths': 'All months',
    'operations.filterEmptyTitle': 'No entries for this month',
    'operations.filterEmptySubtitle':
      'Choose another month or switch back to all results to see the full activity log.',
    'operations.colFrom': 'From',
    'operations.colTo': 'To',
    'operations.colEffect': 'Effect',
    'operations.emptyTitle': 'No operations recorded yet',
    'operations.emptySubtitle':
      'Use the top-right action to record a transfer, income, or conversion event.',
    'operations.dialogTitle': 'Record activity',
    'operations.dialogSubtitle':
      'Every entry updates tracked balances and keeps the movement visible in the activity log.',
    'operations.typeLabel': 'Operation type',
    'operations.type.exchange': 'Exchange',
    'operations.type.income': 'Income',
    'operations.type.transfer': 'Transfer',
    'operations.dateLabel': 'Date',
    'operations.noteLabel': 'Note',
    'operations.notePlaceholder': 'Optional context for this operation',
    'operations.fromSourceLabel': 'From source',
    'operations.toSourceLabel': 'To source',
    'operations.counterpartyLabel': 'Counterparty',
    'operations.counterpartyPlaceholder': 'Example: FOP payout',
    'operations.amountFromLabel': 'Amount sent',
    'operations.amountToLabel': 'Amount received',
    'operations.amountLabel': 'Amount',
    'operations.marketRateLabel': 'Market rate reference',
    'operations.marketRateHint': 'Current USD/UAH baseline from the currency tracker',
    'operations.cancel': 'Cancel',
    'operations.save': 'Save operation',
    'operations.saving': 'Saving...',
    'operations.chartTooltip': 'FX loss: ${{value}}',
    'operations.activity.expectedFundTitle': 'Expected fund',
    'operations.activity.expectedFundsDestination': 'Expected Funds',
    'operations.activity.expectedFundFootnote': 'live-converted and included in readiness',
    'operations.activity.incomeTitle': 'Income',
    'operations.activity.defaultIncomeSubtitle': 'External inflow',
    'operations.activity.incomeFootnote': 'income booked into the selected source',
    'operations.activity.transferTitle': 'Transfer',
    'operations.activity.zeroLoss': '0 loss',
    'operations.activity.transferFootnote': 'source rebalance',
    'operations.activity.exchangeTitle': 'Exchange',
    'operations.activity.lossSuffix': 'loss',
    'operations.activity.exchangeFootnote': 'buy rate {{actual}} vs market {{market}}',
    'operations.errors.invalidDate': 'Pick a valid operation date.',
    'operations.errors.invalidAmount': 'Enter an amount greater than zero.',
    'operations.errors.sameSource': 'Choose two different sources.',
    'operations.errors.exchangeRequiresDifferentCurrency':
      'Exchange operations must move between different currencies.',
    'operations.errors.counterpartyRequired': 'Counterparty is required for income.',
    'operations.errors.transferRequiresSameCurrency':
      'Transfers can only move between sources with the same currency.',
    'operations.errors.insufficientFunds': 'The source does not have enough balance for this move.',
    'operations.errors.marketRateUnavailable': 'Update market rates before recording an exchange.',
    'operations.errors.saveFailed': 'Could not save the operation. Please try again.',
  },
  uk: {
    'shell.brand.subtitle': 'Заощадження на дім',
    'shell.nav.dashboard': 'Панель',
    'shell.nav.sources': 'Джерела',
    'shell.nav.expectedFunds': 'Очікувані кошти',
    'shell.nav.exchangeOps': 'Активності',
    'shell.nav.currency': 'Валюта',
    'shell.rates.eyebrow': 'Live FX',
    'shell.rates.title': 'Поточні курси',
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

    'goal.title': 'Панель',
    'goal.subtitle': 'Відстежуйте ціль, поточні заощадження та вже сплачену суму в одному місці.',
    'goal.edit': 'Редагувати панель',
    'goal.updateTitle': 'Редагувати значення панелі',
    'goal.setTitle': 'Налаштуйте панель',
    'goal.description':
      'Встановіть ціль у USD, зафіксуйте суму, вже сплачену за житло, а поточні заощадження автоматично підтягнуться зі сторінки валюти.',
    'goal.targetAmount': 'Загальна ціль',
    'goal.targetAmountHint': 'USD є основною валютою планування на платформі.',
    'goal.alreadyPaid': 'Вже сплачено за житло',
    'goal.alreadyPaidHint':
      'Використовуйте це поле для завдатку або часткових оплат, які вже передані за обʼєкт і більше не входять до ваших поточних балансів.',
    'goal.savedAmount': 'Поточні заощадження',
    'goal.savedAmountHint': 'Автоматично відображається із збережених балансів на сторінці валюти.',
    'goal.amountError': 'Введіть коректну суму, більшу за $0.',
    'goal.saveError': 'Не вдалося зберегти значення панелі. Спробуйте ще раз.',
    'goal.saving': 'Збереження...',
    'goal.updateCta': 'Зберегти зміни',
    'goal.saveCta': 'Зберегти панель',
    'goal.cancel': 'Скасувати',
    'goal.target': 'Ціль',
    'goal.totalTarget': 'Загальна ціль',
    'goal.alreadySaved': 'Поточні заощадження',
    'goal.remaining': 'Залишилось',
    'goal.progress': 'Прогрес',
    'goal.progressSaved': '{{value}}% від загальної цілі досягнуто',
    'goal.progressRate': 'Темп прогресу',
    'goal.estimate': 'Оцінка завершення',
    'goal.estimateDone': 'Цілі досягнуто',
    'goal.estimatePace': 'за темпу {{amount}}/місяць',
    'goal.gapToFill': 'Залишковий розрив',
    'goal.stillNeeded': 'ще потрібно закрити',
    'goal.chartTitle': 'Траєкторія прогресу',
    'goal.chartSubtitle': 'орієнтовний 6-місячний вигляд на основі поточної позиції',
    'goal.milestones': 'Контрольні точки',
    'goal.milestone25': '25% — Перша чверть',
    'goal.milestone50': '50% — Половина шляху',
    'goal.milestone75': '75% — Майже фініш',
    'goal.milestone100': '100% — Ціль досягнута',
    'goal.months': 'місяців',
    'goal.close': 'Закрити діалог',

    'route.dashboardTitle': 'Панель — FinPlan',
    'route.sourcesTitle': 'Джерела — FinPlan',
    'route.expectedFundsTitle': 'Очікувані кошти — FinPlan',
    'route.exchangeOpsTitle': 'Активності — FinPlan',
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

    'sources.eyebrow': 'Джерела капіталу',
    'sources.title': 'Структура джерел',
    'sources.subtitle':
      'Відстежуйте, де саме лежить ваш капітал і як кожне джерело впливає на суму в USD.',
    'sources.editBalances': 'Редагувати баланси',
    'sources.shareOfCapital': 'Частка власного капіталу: {{value}}%',
    'sources.active': 'активне',
    'sources.currentAmount': 'Поточна сума',
    'sources.normalizedUsd': '≈ {{value}} після нормалізації в USD',
    'sources.notes.cashUsd': 'Найліквідніший резерв',
    'sources.notes.cardUsd': 'Цифровий резерв',
    'sources.notes.cardUah': 'FX-ризик до конвертації',
    'sources.notes.cashUah': 'Локальна ліквідність',
    'sources.compositionTitle': 'Композиція джерел',
    'sources.compositionSubtitle': 'Як розподіляються ваші власні заощадження.',
    'sources.ownSavings': 'Власні заощадження',
    'sources.insightsTitle': 'Інсайти по джерелах',
    'sources.insightsSubtitle':
      'Тримайте UI прив’язаним до цілі покупки, а не до абстрактної аналітики.',
    'sources.totalOwnSavings': 'Усього власних заощаджень',
    'sources.totalOwnSavingsHint': 'Переведено в базову валюту плану покупки',
    'sources.usdAlreadyLiquid': 'USD уже ліквідний',
    'sources.usdAlreadyLiquidHint': 'Можна використати одразу без FX-конверсії',
    'sources.uahExposure': 'Експозиція в UAH',
    'sources.uahExposureHint': 'Все ще під ризиком ринкового спреду та курсу купівлі',
    'sources.recommendedNextStep': 'Рекомендований наступний крок',
    'sources.recommendedCardUah': 'Конвертувати Card UAH',
    'sources.recommendedCashUah': 'Конвертувати Cash UAH',
    'sources.recommendedHint': 'Найбільший поточний FX-ризик перед вікном покупки',
    'sources.editSubtitle':
      'Тримайте чотири відстежувані баланси синхронними з вашим поточним положенням.',
    'sources.cancel': 'Скасувати',
    'sources.save': 'Зберегти баланси',
    'sources.saving': 'Збереження...',
    'sources.saveError': 'Не вдалося зберегти баланси. Спробуйте ще раз.',

    'expectedFunds.eyebrow': 'Зовнішня підтримка',
    'expectedFunds.title': 'Очікувані позикові кошти',
    'expectedFunds.subtitle':
      'Тримайте позикові або обіцяні кошти видимими, аудованими й окремими від власних заощаджень.',
    'expectedFunds.addCta': 'Додати очікуване джерело',
    'expectedFunds.total': 'Очікувана сума',
    'expectedFunds.totalHint': 'Включено в readiness-forecast, окремо від власного капіталу',
    'expectedFunds.confirmed': 'Підтверджена сума',
    'expectedFunds.confirmedHint': 'Підтримка з високою ймовірністю, уже узгоджена',
    'expectedFunds.coverage': 'Покриття підтримкою',
    'expectedFunds.coverageHint': 'Від суми, якої ще бракує після власних заощаджень',
    'expectedFunds.registryTitle': 'Реєстр підтримки',
    'expectedFunds.registrySubtitle':
      'Кожен рядок має чітко пояснювати, хто допомагає, у якій валюті й як це впливає на readiness.',
    'expectedFunds.colSource': 'Джерело',
    'expectedFunds.colOriginal': 'Оригінал',
    'expectedFunds.colUsdValue': 'Еквівалент у USD',
    'expectedFunds.colEta': 'ETA',
    'expectedFunds.colStatus': 'Статус',
    'expectedFunds.statusConfirmed': 'Підтверджено',
    'expectedFunds.statusPlanned': 'Заплановано',
    'expectedFunds.edit': 'Редагувати',
    'expectedFunds.delete': 'Видалити',
    'expectedFunds.emptyTitle': 'Очікуваних коштів поки немає',
    'expectedFunds.emptySubtitle':
      'Додайте обіцяну або заплановану підтримку, щоб readiness-прогноз спирався на реальні дані.',
    'expectedFunds.dialogAddTitle': 'Додати очікуване джерело',
    'expectedFunds.dialogEditTitle': 'Редагувати очікуване джерело',
    'expectedFunds.dialogSubtitle':
      'Тримайте записи про підтримку видимими, редагованими та конвертованими з їхньої оригінальної валюти.',
    'expectedFunds.form.sourceLabel': 'Джерело',
    'expectedFunds.form.sourcePlaceholder': 'Батьки, партнер, резервна підтримка',
    'expectedFunds.form.descriptionLabel': 'Опис',
    'expectedFunds.form.descriptionPlaceholder': 'Що саме означає ця підтримка',
    'expectedFunds.form.currencyLabel': 'Валюта',
    'expectedFunds.form.amountLabel': 'Оригінальна сума',
    'expectedFunds.form.etaLabel': 'ETA',
    'expectedFunds.form.etaPlaceholder': 'Q4 2026, May 2026, Optional',
    'expectedFunds.form.statusLabel': 'Статус',
    'expectedFunds.form.status.confirmed': 'Підтверджено',
    'expectedFunds.form.status.planned': 'Заплановано',
    'expectedFunds.cancel': 'Скасувати',
    'expectedFunds.save': 'Зберегти очікуване джерело',
    'expectedFunds.saving': 'Збереження...',
    'expectedFunds.errors.invalidForm':
      'Перед збереженням введіть джерело, ETA та суму, більшу за нуль.',
    'expectedFunds.errors.saveFailed': 'Не вдалося зберегти очікуване джерело. Спробуйте ще раз.',
    'expectedFunds.errors.deleteFailed': 'Не вдалося видалити очікуване джерело. Спробуйте ще раз.',

    'operations.eyebrow': 'Активності',
    'operations.title': 'Активності',
    'operations.subtitle':
      'Відстежуйте рух між джерелами та тримайте кожну зміну балансу видимою в одному місці.',
    'operations.recordExchange': 'Записати активність',
    'operations.activityTitle': 'Журнал активності',
    'operations.activitySubtitle': 'Операції мають бути аудованими та пояснювати зміну балансів.',
    'operations.filterLabel': 'Період',
    'operations.filterAllMonths': 'Усі місяці',
    'operations.filterEmptyTitle': 'За цей місяць записів немає',
    'operations.filterEmptySubtitle':
      'Оберіть інший місяць або поверніться до всіх результатів, щоб побачити повний журнал активності.',
    'operations.colFrom': 'Звідки',
    'operations.colTo': 'Куди',
    'operations.colEffect': 'Ефект',
    'operations.emptyTitle': 'Операцій поки немає',
    'operations.emptySubtitle':
      'Скористайтеся кнопкою праворуч угорі, щоб записати переказ, дохід або конверсію.',
    'operations.dialogTitle': 'Записати активність',
    'operations.dialogSubtitle':
      'Кожен запис оновлює відстежувані баланси й зберігає рух видимим у журналі активності.',
    'operations.typeLabel': 'Тип операції',
    'operations.type.exchange': 'Обмін',
    'operations.type.income': 'Дохід',
    'operations.type.transfer': 'Переказ',
    'operations.dateLabel': 'Дата',
    'operations.noteLabel': 'Примітка',
    'operations.notePlaceholder': 'Необов’язковий контекст для цієї операції',
    'operations.fromSourceLabel': 'Джерело списання',
    'operations.toSourceLabel': 'Джерело зарахування',
    'operations.counterpartyLabel': 'Контрагент',
    'operations.counterpartyPlaceholder': 'Наприклад: ФОП-виплата',
    'operations.amountFromLabel': 'Сума списання',
    'operations.amountToLabel': 'Сума отримання',
    'operations.amountLabel': 'Сума',
    'operations.marketRateLabel': 'Ринковий орієнтир',
    'operations.marketRateHint': 'Поточна базова пара USD/UAH з валютного трекера',
    'operations.cancel': 'Скасувати',
    'operations.save': 'Зберегти операцію',
    'operations.saving': 'Збереження...',
    'operations.chartTooltip': 'FX-втрата: ${{value}}',
    'operations.activity.expectedFundTitle': 'Очікуване джерело',
    'operations.activity.expectedFundsDestination': 'Очікувані кошти',
    'operations.activity.expectedFundFootnote': 'live-конвертовано та включено в readiness',
    'operations.activity.incomeTitle': 'Дохід',
    'operations.activity.defaultIncomeSubtitle': 'Зовнішнє надходження',
    'operations.activity.incomeFootnote': 'дохід зафіксовано в обране джерело',
    'operations.activity.transferTitle': 'Переказ',
    'operations.activity.zeroLoss': '0 втрат',
    'operations.activity.transferFootnote': 'ребаланс джерел',
    'operations.activity.exchangeTitle': 'Обмін',
    'operations.activity.lossSuffix': 'втрат',
    'operations.activity.exchangeFootnote': 'курс купівлі {{actual}} проти ринку {{market}}',
    'operations.errors.invalidDate': 'Виберіть коректну дату операції.',
    'operations.errors.invalidAmount': 'Введіть суму, більшу за нуль.',
    'operations.errors.sameSource': 'Оберіть два різні джерела.',
    'operations.errors.exchangeRequiresDifferentCurrency':
      'Операція обміну має відбуватися між різними валютами.',
    'operations.errors.counterpartyRequired': 'Для доходу потрібно вказати контрагента.',
    'operations.errors.transferRequiresSameCurrency':
      'Переказ можливий лише між джерелами з однаковою валютою.',
    'operations.errors.insufficientFunds': 'У джерелі недостатньо коштів для цієї операції.',
    'operations.errors.marketRateUnavailable': 'Оновіть ринкові курси перед записом обміну.',
    'operations.errors.saveFailed': 'Не вдалося зберегти операцію. Спробуйте ще раз.',
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
    const translations = TRANSLATIONS[this.locale()];
    const template = key in translations ? translations[key] : (TRANSLATIONS.en[key] ?? key);

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
