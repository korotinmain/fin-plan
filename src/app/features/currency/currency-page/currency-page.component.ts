import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { map, startWith } from 'rxjs';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { CURRENCY_META, CurrencyCode, CurrencyHoldings } from '../../../core/models/currency.model';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { convertAmount } from '../currency.helpers';
import { CurrencyFacade } from '../currency.facade';
import {
  currencySymbol,
  formatConverterAmount,
  formatConverterInputAmount,
  formatConverterRate,
  formatHoldingAmount,
  getAlternativeCurrency,
  holdingFormKey,
  holdingInputStep,
} from '../currency-formatting.helpers';
import { getChartTheme } from '../../../shared/helpers/chart-theme';

type HoldingChannel = 'cash' | 'card';
type HoldingKey = 'uah' | 'usd' | 'eur';

@Component({
  selector: 'app-currency-page',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    BaseChartDirective,
    CardComponent,
    BadgeComponent,
    SkeletonComponent,
    TranslatePipe,
  ],
  templateUrl: './currency-page.component.html',
  styleUrl: './currency-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyPageComponent {
  private readonly facade = inject(CurrencyFacade);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly i18n = inject(I18nService);
  private readonly theme = getChartTheme();

  private get locale(): string {
    return this.i18n.locale() === 'uk' ? 'uk-UA' : 'en-US';
  }

  protected readonly isLoading = this.facade.isLoading;
  protected readonly holdings = this.facade.holdings;
  protected readonly rates = this.facade.rates;
  protected readonly totals = this.facade.totals;
  protected readonly chartSegments = this.facade.chartSegments;
  protected readonly meta = CURRENCY_META;

  protected readonly isEditingHoldings = signal(false);
  protected readonly isSavingHoldings = signal(false);
  protected readonly holdingsError = signal<string | null>(null);

  protected readonly isFetchingRates = signal(false);
  protected readonly fetchRatesError = signal<string | null>(null);
  protected readonly ratesLastFetched = signal<Date | null>(null);
  protected readonly hasAutoFetchedRates = signal(false);

  protected readonly holdingsForm = this.fb.group({
    uah: this.fb.group({
      cash: [0, [Validators.required, Validators.min(0)]],
      card: [0, [Validators.required, Validators.min(0)]],
    }),
    usd: this.fb.group({
      cash: [0, [Validators.required, Validators.min(0)]],
      card: [0, [Validators.required, Validators.min(0)]],
    }),
    eur: this.fb.group({
      cash: [0, [Validators.required, Validators.min(0)]],
      card: [0, [Validators.required, Validators.min(0)]],
    }),
  });

  protected readonly converterForm = this.fb.group({
    amount: [0, [Validators.required, Validators.min(0)]],
    from: ['USD' as CurrencyCode, [Validators.required]],
    to: ['UAH' as CurrencyCode, [Validators.required]],
  });

  protected readonly converterState = toSignal(
    this.converterForm.valueChanges.pipe(
      startWith(this.converterForm.getRawValue()),
      map((value) => ({
        amount: value.amount ?? 0,
        from: (value.from ?? 'USD') as CurrencyCode,
        to: (value.to ?? 'UAH') as CurrencyCode,
      })),
    ),
    {
      initialValue: this.converterForm.getRawValue(),
    },
  );

  protected readonly converterResult = computed(() => {
    const { amount, from, to } = this.converterState();
    return convertAmount(amount, from, to, this.rates());
  });

  protected readonly converterRate = computed(() => {
    const { from, to } = this.converterState();
    return convertAmount(1, from, to, this.rates());
  });

  protected readonly fromCurrencyOptions = computed(() => {
    const to = this.converterState().to;
    return this.meta.filter((item) => item.code !== to);
  });

  protected readonly toCurrencyOptions = computed(() => {
    const from = this.converterState().from;
    return this.meta.filter((item) => item.code !== from);
  });

  protected readonly doughnutChartData = computed<ChartData<'doughnut'>>(() => {
    const segments = this.chartSegments();
    const shares = segments.map((segment) => segment.share);
    const totalShare = shares.reduce((sum, share) => sum + share, 0);

    if (totalShare <= 0) {
      return {
        labels: ['No holdings'],
        datasets: [
          {
            data: [1],
            backgroundColor: [this.theme.chartEmpty],
            borderWidth: 0,
            hoverOffset: 0,
          },
        ],
      };
    }

    return {
      labels: segments.map((segment) => segment.code),
      datasets: [
        {
          data: shares,
          backgroundColor: [this.theme.violet, this.theme.emerald, this.theme.primary],
          borderWidth: 0,
          spacing: 2,
          hoverOffset: 2,
        },
      ],
    };
  });

  protected readonly doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    cutout: '72%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: this.theme.surface,
        borderColor: this.theme.border,
        borderWidth: 1,
        titleColor: this.theme.textPrimary,
        bodyColor: this.theme.textPrimary,
        displayColors: false,
        callbacks: {
          label: (context) =>
            this.i18n.translate('currency.chartTooltipLabel', {
              label: context.label,
              value: this.formatChartSharePercent(context.parsed),
            }),
        },
      },
    },
  };

  constructor() {
    this.converterForm.controls.from.valueChanges.pipe(takeUntilDestroyed()).subscribe((from) => {
      this.syncConverterCurrencies('from', from as CurrencyCode);
    });

    this.converterForm.controls.to.valueChanges.pipe(takeUntilDestroyed()).subscribe((to) => {
      this.syncConverterCurrencies('to', to as CurrencyCode);
    });

    effect(() => {
      const user = this.authService.currentUser();
      const hasAutoFetchedRates = this.hasAutoFetchedRates();

      if (user === null || hasAutoFetchedRates) {
        return;
      }

      this.hasAutoFetchedRates.set(true);
      queueMicrotask(() => {
        this.fetchLiveRates();
      });
    });
  }

  protected shareFor(code: CurrencyCode): number {
    return this.facade.shareFor(code);
  }

  protected holdingAmount(code: CurrencyCode): number {
    return this.facade.totalFor(code);
  }

  protected holdingChannelAmount(code: CurrencyCode, channel: HoldingChannel): number {
    const balance = this.holdings()[this.holdingFormKey(code)];
    return balance[channel];
  }

  protected editedHoldingAmount(code: CurrencyCode, channel: HoldingChannel): number {
    const balance = (this.holdingsForm.getRawValue() as CurrencyHoldings)[
      this.holdingFormKey(code)
    ];
    return balance[channel];
  }

  protected editedHoldingTotal(code: CurrencyCode): number {
    return this.editedHoldingAmount(code, 'cash') + this.editedHoldingAmount(code, 'card');
  }

  protected valueInUah(code: CurrencyCode): number {
    return this.facade.valueInUah(code);
  }

  protected editedValueInUah(code: CurrencyCode): number {
    return convertAmount(this.editedHoldingTotal(code), code, 'UAH', this.rates());
  }

  protected holdingInputStep(code: CurrencyCode): number {
    return holdingInputStep(code);
  }

  protected holdingFormKey(code: CurrencyCode): HoldingKey {
    return holdingFormKey(code);
  }

  protected cashSharePercent(code: CurrencyCode): number {
    const total = this.holdingAmount(code);
    return total > 0 ? (this.holdingChannelAmount(code, 'cash') / total) * 100 : 0;
  }

  protected cardSharePercent(code: CurrencyCode): number {
    const total = this.holdingAmount(code);
    return total > 0 ? (this.holdingChannelAmount(code, 'card') / total) * 100 : 0;
  }

  protected formatHoldingAmount(code: CurrencyCode, amount: number): string {
    return formatHoldingAmount(code, amount, this.locale);
  }

  protected swapConverterCurrencies(): void {
    const { from, to } = this.converterState();
    this.converterForm.patchValue({ from: to, to: from });
  }

  protected converterSymbol(code: CurrencyCode): string {
    return currencySymbol(code);
  }

  protected formatConverterInputAmount(amount: number): string {
    return formatConverterInputAmount(amount, this.locale);
  }

  protected formatConverterAmount(amount: number, code: CurrencyCode): string {
    return formatConverterAmount(amount, code, this.locale);
  }

  protected formatConverterRate(amount: number, code: CurrencyCode): string {
    return formatConverterRate(amount, code, this.locale);
  }

  protected formatChartSharePercent(value: number): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  }

  protected fetchLiveRates(): void {
    if (this.isFetchingRates()) return;
    this.isFetchingRates.set(true);
    this.fetchRatesError.set(null);

    this.facade.fetchAndSaveRates().subscribe({
      next: () => {
        this.isFetchingRates.set(false);
        this.ratesLastFetched.set(new Date());
      },
      error: () => {
        this.isFetchingRates.set(false);
        this.fetchRatesError.set('currency.rates.fetchError');
      },
    });
  }

  protected startEditingHoldings(): void {
    const holdings = this.holdings();
    this.holdingsForm.setValue(holdings);
    this.holdingsError.set(null);
    this.isEditingHoldings.set(true);
  }

  protected cancelEditingHoldings(): void {
    this.holdingsError.set(null);
    this.isEditingHoldings.set(false);
  }

  protected saveHoldings(): void {
    if (this.holdingsForm.invalid) return;
    this.isSavingHoldings.set(true);
    this.holdingsError.set(null);

    this.facade.updateHoldings(this.holdingsForm.getRawValue() as CurrencyHoldings).subscribe({
      next: () => {
        this.isSavingHoldings.set(false);
        this.isEditingHoldings.set(false);
      },
      error: () => {
        this.isSavingHoldings.set(false);
        this.holdingsError.set('currency.dialog.saveError');
      },
    });
  }

  private syncConverterCurrencies(changed: 'from' | 'to', value: CurrencyCode): void {
    const oppositeControl =
      changed === 'from' ? this.converterForm.controls.to : this.converterForm.controls.from;

    if (oppositeControl.value !== value) {
      return;
    }

    oppositeControl.setValue(this.getAlternativeCurrency(value));
  }

  private getAlternativeCurrency(excluded: CurrencyCode): CurrencyCode {
    return getAlternativeCurrency(excluded);
  }
}
