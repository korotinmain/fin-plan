import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { map, startWith, take } from 'rxjs';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { CurrencyFacade } from '../../currency/currency.facade';
import {
  OperationDraft,
  OperationRecord,
  OperationType,
} from '../../../core/models/operation.model';
import { EMPTY_SOURCE_BALANCE, SOURCE_META, SourceId } from '../../../core/models/source.model';
import { I18nService } from '../../../core/services/i18n.service';
import { OperationFacade } from '../operation.facade';
import { SourceFacade } from '../../sources/source.facade';
import { sourceCurrencyFor, sourceLabelFor } from '../operation.helpers';
import { getChartTheme } from '../../../shared/helpers/chart-theme';
import { ExpectedFundsFacade } from '../../expected-funds/expected-funds.facade';

type OperationFormValue = {
  type: OperationType;
  occurredAt: string;
  fromSource: SourceId;
  toSource: SourceId;
  fromAmount: number;
  toAmount: number;
  counterparty: string;
  note: string;
};

type ActivityEntry = {
  id: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  fromLabel: string;
  toLabel: string;
  effectLabel: string;
  effectVariant: 'danger' | 'success' | 'neutral';
  footnote: string;
  sortKey: number;
};

@Component({
  selector: 'app-operations-page',
  imports: [ReactiveFormsModule, DecimalPipe, BaseChartDirective, CardComponent, TranslatePipe],
  templateUrl: './operations-page.component.html',
  styleUrl: './operations-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsPageComponent {
  private readonly operationFacade = inject(OperationFacade);
  private readonly sourceFacade = inject(SourceFacade);
  private readonly currencyFacade = inject(CurrencyFacade);
  private readonly expectedFundsFacade = inject(ExpectedFundsFacade);
  private readonly i18n = inject(I18nService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly theme = getChartTheme();

  protected readonly sourceMeta = SOURCE_META;
  protected readonly operationTypes: OperationType[] = ['exchange', 'income', 'transfer'];
  protected readonly isLoading = this.operationFacade.isLoading;
  protected readonly isDialogOpen = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly saveError = signal<string | null>(null);

  protected readonly form = this.fb.group({
    type: ['exchange' as OperationType],
    occurredAt: [todayIsoDate()],
    fromSource: ['cardUah' as SourceId],
    toSource: ['cashUsd' as SourceId],
    fromAmount: [0],
    toAmount: [0],
    counterparty: [''],
    note: [''],
  });

  protected readonly formState = toSignal(
    this.form.valueChanges.pipe(
      startWith(this.form.getRawValue()),
      map((value) => ({
        type: (value.type ?? 'exchange') as OperationType,
        occurredAt: value.occurredAt ?? todayIsoDate(),
        fromSource: (value.fromSource ?? 'cardUah') as SourceId,
        toSource: (value.toSource ?? 'cashUsd') as SourceId,
        fromAmount: Number(value.fromAmount ?? 0),
        toAmount: Number(value.toAmount ?? 0),
        counterparty: value.counterparty ?? '',
        note: value.note ?? '',
      })),
    ),
    { initialValue: this.form.getRawValue() as OperationFormValue },
  );

  protected readonly sourceBalances = computed(
    () => this.sourceFacade.balances() ?? EMPTY_SOURCE_BALANCE,
  );

  protected readonly operations = computed(() => this.operationFacade.operations() ?? []);

  protected readonly toSourceOptions = computed(() => {
    const state = this.formState();

    if (state.type === 'income') {
      return SOURCE_META;
    }

    const fromCurrency = sourceCurrencyFor(state.fromSource);

    return SOURCE_META.filter((item) => {
      if (item.id === state.fromSource) {
        return false;
      }

      return state.type === 'exchange'
        ? item.currency !== fromCurrency
        : item.currency === fromCurrency;
    });
  });

  protected readonly cumulativeFxLossUsd = computed(() =>
    this.operations()
      .filter((entry) => entry.type === 'exchange')
      .reduce((sum, entry) => sum + entry.fxLossUsd, 0),
  );

  protected readonly largestRecentLoss = computed(() => {
    const candidates = this.operations().filter((entry) => entry.type === 'exchange');

    if (candidates.length === 0) {
      return null;
    }

    return [...candidates].sort((left, right) => right.fxLossUsd - left.fxLossUsd)[0] ?? null;
  });

  protected readonly largestRecentLossNote = computed(() => {
    const recentLoss = this.largestRecentLoss();

    if (recentLoss === null || recentLoss.fromSource === null || recentLoss.toSource === null) {
      return this.i18n.translate('operations.noLossesTracked');
    }

    return `${sourceLabelFor(recentLoss.fromSource)} → ${sourceLabelFor(recentLoss.toSource)}`;
  });

  protected readonly monthlyFxLoss = computed(() => {
    const formatter = new Intl.DateTimeFormat(this.localeCode(), { month: 'short' });
    const buckets = Array.from({ length: 5 }, (_, index) => {
      const bucketDate = new Date();
      bucketDate.setDate(1);
      bucketDate.setMonth(bucketDate.getMonth() - (4 - index));

      return {
        key: `${bucketDate.getFullYear()}-${String(bucketDate.getMonth() + 1).padStart(2, '0')}`,
        label: formatter.format(bucketDate),
        value: 0,
      };
    });

    const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

    this.operations().forEach((entry) => {
      if (entry.type !== 'exchange' || entry.fxLossUsd <= 0) {
        return;
      }

      const key = entry.occurredAt.slice(0, 7);
      const bucket = bucketMap.get(key);

      if (bucket !== undefined) {
        bucket.value = Math.round((bucket.value + entry.fxLossUsd) * 100) / 100;
      }
    });

    return buckets;
  });

  protected readonly fxLossChartData = computed<ChartData<'line'>>(() => ({
    labels: this.monthlyFxLoss().map((item) => item.label),
    datasets: [
      {
        data: this.monthlyFxLoss().map((item) => item.value),
        borderColor: this.theme.violet,
        backgroundColor: this.theme.violetFill,
        pointBackgroundColor: this.theme.violet,
        pointBorderColor: this.theme.surface,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 4,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  }));

  protected readonly fxLossChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false },
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
            this.i18n.translate('operations.chartTooltip', {
              value: Number(context.parsed.y).toFixed(0),
            }),
        },
      },
    },
    scales: {
      x: {
        border: { display: false },
        grid: { display: false },
        ticks: { color: this.theme.textSecondary, font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: this.theme.chartGrid },
        ticks: {
          color: this.theme.textSecondary,
          font: { size: 11 },
          callback: (value) => `$${value}`,
        },
      },
    },
  };

  protected readonly activityEntries = computed(() => {
    const entries = this.operations().map((entry) => this.mapOperationToActivity(entry));
    const expectedFundEntries = this.expectedFundsFacade.confirmedEntries().map((entry, index) => ({
      id: `expected-${entry.id}`,
      title: this.i18n.translate('operations.activity.expectedFundTitle'),
      subtitle: entry.source,
      dateLabel: entry.eta,
      fromLabel: '—',
      toLabel: this.i18n.translate('operations.activity.expectedFundsDestination'),
      effectLabel: `+${new Intl.NumberFormat(this.localeCode(), { maximumFractionDigits: 0 }).format(entry.usdValue)} USD`,
      effectVariant: 'success' as const,
      footnote: `${entry.originalAmount.toLocaleString(this.localeCode())} ${entry.originalCurrency} ${this.i18n.translate('operations.activity.expectedFundFootnote')}`,
      sortKey: -index - 1,
    }));

    return [...entries, ...expectedFundEntries]
      .sort((left, right) => right.sortKey - left.sortKey)
      .slice(0, 6);
  });

  protected readonly selectedExchangeRate = computed(() => {
    const state = this.formState();

    if (state.type !== 'exchange') {
      return null;
    }

    const fromCurrency = sourceCurrencyFor(state.fromSource);
    const toCurrency = sourceCurrencyFor(state.toSource);

    if (fromCurrency === toCurrency) {
      return null;
    }

    const usdToUah = this.currencyFacade.rates().usdToUah;
    return Number.isFinite(usdToUah) && usdToUah > 0 ? usdToUah : null;
  });

  constructor() {
    effect(() => {
      const options = this.toSourceOptions();
      const current = this.form.controls.toSource.value;

      if (options.length === 0) {
        return;
      }

      if (!options.some((item) => item.id === current)) {
        this.form.controls.toSource.setValue(options[0].id);
      }
    });
  }

  protected openDialog(): void {
    this.saveError.set(null);
    this.form.reset({
      type: 'exchange',
      occurredAt: todayIsoDate(),
      fromSource: 'cardUah',
      toSource: 'cashUsd',
      fromAmount: 0,
      toAmount: 0,
      counterparty: '',
      note: '',
    });
    this.isDialogOpen.set(true);
  }

  protected closeDialog(): void {
    this.isDialogOpen.set(false);
    this.isSaving.set(false);
    this.saveError.set(null);
  }

  protected setType(type: OperationType): void {
    this.form.controls.type.setValue(type);
    this.saveError.set(null);
  }

  protected saveOperation(): void {
    let draft: OperationDraft;

    try {
      draft = this.buildDraft();
    } catch (error) {
      this.saveError.set(this.resolveError(error));
      return;
    }

    this.isSaving.set(true);
    this.saveError.set(null);

    this.operationFacade
      .record(draft, this.sourceBalances(), this.currencyFacade.rates())
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.closeDialog();
        },
        error: (error: unknown) => {
          this.isSaving.set(false);
          this.saveError.set(this.resolveError(error));
        },
      });
  }

  protected effectBadgeVariant(entry: ActivityEntry): 'danger' | 'success' | 'neutral' {
    return entry.effectVariant;
  }

  private buildDraft(): OperationDraft {
    const state = this.formState();

    switch (state.type) {
      case 'exchange':
        return {
          type: 'exchange',
          occurredAt: state.occurredAt,
          fromSource: state.fromSource,
          toSource: state.toSource,
          fromAmount: state.fromAmount,
          toAmount: state.toAmount,
          note: state.note,
        };
      case 'income':
        return {
          type: 'income',
          occurredAt: state.occurredAt,
          toSource: state.toSource,
          amount: state.toAmount,
          counterparty: state.counterparty,
          note: state.note,
        };
      case 'transfer':
        return {
          type: 'transfer',
          occurredAt: state.occurredAt,
          fromSource: state.fromSource,
          toSource: state.toSource,
          amount: state.fromAmount,
          note: state.note,
        };
    }
  }

  private mapOperationToActivity(entry: OperationRecord): ActivityEntry {
    const sortKey = Date.parse(`${entry.occurredAt}T00:00:00`);
    const formatter = new Intl.NumberFormat(this.localeCode(), { maximumFractionDigits: 0 });

    if (entry.type === 'income' && entry.toSource !== null && entry.toAmount !== null) {
      return {
        id: entry.id,
        title: this.i18n.translate('operations.activity.incomeTitle'),
        subtitle:
          entry.counterparty ?? this.i18n.translate('operations.activity.defaultIncomeSubtitle'),
        dateLabel: this.formatDateLabel(entry.occurredAt),
        fromLabel: '—',
        toLabel: sourceLabelFor(entry.toSource),
        effectLabel: `+${formatter.format(entry.toAmount)} ${sourceCurrencyFor(entry.toSource)}`,
        effectVariant: 'success',
        footnote:
          entry.note.trim() !== ''
            ? entry.note
            : this.i18n.translate('operations.activity.incomeFootnote'),
        sortKey,
      };
    }

    if (
      entry.type === 'transfer' &&
      entry.fromSource !== null &&
      entry.toSource !== null &&
      entry.fromAmount !== null
    ) {
      return {
        id: entry.id,
        title: this.i18n.translate('operations.activity.transferTitle'),
        subtitle: sourceLabelFor(entry.fromSource),
        dateLabel: this.formatDateLabel(entry.occurredAt),
        fromLabel: `${formatter.format(entry.fromAmount)} ${sourceCurrencyFor(entry.fromSource)}`,
        toLabel: sourceLabelFor(entry.toSource),
        effectLabel: this.i18n.translate('operations.activity.zeroLoss'),
        effectVariant: 'neutral',
        footnote:
          entry.note.trim() !== ''
            ? entry.note
            : this.i18n.translate('operations.activity.transferFootnote'),
        sortKey,
      };
    }

    if (
      entry.type === 'exchange' &&
      entry.fromSource !== null &&
      entry.toSource !== null &&
      entry.fromAmount !== null &&
      entry.toAmount !== null
    ) {
      return {
        id: entry.id,
        title: this.i18n.translate('operations.activity.exchangeTitle'),
        subtitle: sourceLabelFor(entry.fromSource),
        dateLabel: this.formatDateLabel(entry.occurredAt),
        fromLabel: `${formatter.format(entry.fromAmount)} ${sourceCurrencyFor(entry.fromSource)}`,
        toLabel: `${formatter.format(entry.toAmount)} ${sourceCurrencyFor(entry.toSource)} • ${sourceLabelFor(entry.toSource)}`,
        effectLabel:
          entry.fxLossUsd > 0
            ? `-${formatter.format(entry.fxLossUsd)} USD ${this.i18n.translate('operations.activity.lossSuffix')}`
            : this.i18n.translate('operations.activity.zeroLoss'),
        effectVariant: entry.fxLossUsd > 0 ? 'danger' : 'neutral',
        footnote:
          entry.actualRate !== null && entry.marketRate !== null
            ? this.i18n.translate('operations.activity.exchangeFootnote', {
                actual: entry.actualRate.toFixed(2),
                market: entry.marketRate.toFixed(2),
              })
            : entry.note,
        sortKey,
      };
    }

    return {
      id: entry.id,
      title: this.i18n.translate('operations.activity.exchangeTitle'),
      subtitle: '',
      dateLabel: this.formatDateLabel(entry.occurredAt),
      fromLabel: '—',
      toLabel: '—',
      effectLabel: '—',
      effectVariant: 'neutral',
      footnote: entry.note,
      sortKey,
    };
  }

  private resolveError(error: unknown): string {
    if (error instanceof Error && error.message.startsWith('operations.errors.')) {
      return this.i18n.translate(error.message);
    }

    return this.i18n.translate('operations.errors.saveFailed');
  }

  private formatDateLabel(value: string): string {
    const date = new Date(`${value}T00:00:00`);

    return new Intl.DateTimeFormat(this.localeCode(), {
      day: 'numeric',
      month: 'short',
    }).format(date);
  }

  private localeCode(): string {
    return this.i18n.locale() === 'uk' ? 'uk-UA' : 'en-US';
  }
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
