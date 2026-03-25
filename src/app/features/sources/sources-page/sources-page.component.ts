import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { SourceFacade } from '../source.facade';
import { CurrencyFacade } from '../../currency/currency.facade';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import {
  EMPTY_SOURCE_BALANCE,
  SourceBalance,
  SourceId,
  SOURCE_META,
} from '../../../core/models/source.model';
import { calcTotalSavingsUsd, convertUahToUsd } from '../source.helpers';
import { getChartTheme } from '../../../shared/helpers/chart-theme';

type SourceCardViewModel = {
  id: SourceId;
  label: string;
  currency: 'USD' | 'UAH';
  amount: number;
  normalizedUsd: number;
  share: number;
};

@Component({
  selector: 'app-sources-page',
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    DecimalPipe,
    BaseChartDirective,
    CardComponent,
    SkeletonComponent,
    BadgeComponent,
    TranslatePipe,
  ],
  templateUrl: './sources-page.component.html',
  styleUrl: './sources-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourcesPageComponent {
  private readonly facade = inject(SourceFacade);
  private readonly currencyFacade = inject(CurrencyFacade);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly theme = getChartTheme();

  protected readonly isLoading = this.facade.isLoading;
  protected readonly balances = computed(() => this.facade.balances() ?? EMPTY_SOURCE_BALANCE);
  protected readonly sourceMeta = SOURCE_META;

  protected readonly isEditing = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly saveError = signal<string | null>(null);

  protected readonly form = this.fb.group({
    cashUsd: [0, [Validators.required, Validators.min(0)]],
    cardUsd: [0, [Validators.required, Validators.min(0)]],
    cardUah: [0, [Validators.required, Validators.min(0)]],
    cashUah: [0, [Validators.required, Validators.min(0)]],
  });

  protected readonly ownSavingsUsd = computed(() =>
    calcTotalSavingsUsd(this.balances(), this.currencyFacade.rates().usdToUah),
  );

  protected readonly usdAlreadyLiquid = computed(
    () => this.balances().cashUsd + this.balances().cardUsd,
  );

  protected readonly uahExposureUsd = computed(() =>
    convertUahToUsd(
      this.balances().cardUah + this.balances().cashUah,
      this.currencyFacade.rates().usdToUah,
    ),
  );

  protected readonly recommendedNextStep = computed(() =>
    this.balances().cardUah >= this.balances().cashUah
      ? 'sources.recommendedCardUah'
      : 'sources.recommendedCashUah',
  );

  protected readonly sourceCards = computed<SourceCardViewModel[]>(() => {
    const rate = this.currencyFacade.rates().usdToUah;
    const totalOwnSavings = this.ownSavingsUsd();

    return SOURCE_META.map((meta) => {
      const amount = this.balances()[meta.id];
      const normalizedUsd = meta.currency === 'USD' ? amount : convertUahToUsd(amount, rate);
      const share = totalOwnSavings > 0 ? (normalizedUsd / totalOwnSavings) * 100 : 0;

      return {
        id: meta.id,
        label: meta.label,
        currency: meta.currency,
        amount,
        normalizedUsd,
        share,
      };
    });
  });

  protected readonly compositionData = computed<ChartData<'doughnut'>>(() => ({
    labels: this.sourceCards().map((card) => card.label),
    datasets: [
      {
        data: this.sourceCards().map((card) => Math.max(card.share, 0)),
        backgroundColor: [
          this.theme.violet,
          this.theme.emerald,
          this.theme.primary,
          getComputedStyle(document.documentElement).getPropertyValue('--color-warning').trim(),
        ],
        borderWidth: 0,
        spacing: 2,
        hoverOffset: 2,
      },
    ],
  }));

  protected readonly compositionOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: this.theme.surface,
        borderColor: this.theme.border,
        borderWidth: 1,
        titleColor: this.theme.textPrimary,
        bodyColor: this.theme.textPrimary,
      },
    },
  };

  protected openEditor(): void {
    this.form.setValue(this.balances());
    this.isEditing.set(true);
    this.saveError.set(null);
  }

  protected cancelEditing(): void {
    this.isEditing.set(false);
    this.saveError.set(null);
  }

  protected saveAll(): void {
    if (this.form.invalid) return;

    this.isSaving.set(true);
    this.saveError.set(null);

    this.facade.saveAll(this.form.getRawValue() as SourceBalance).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isEditing.set(false);
      },
      error: () => {
        this.isSaving.set(false);
        this.saveError.set('sources.saveError');
      },
    });
  }

  protected balanceLabel(card: SourceCardViewModel): string {
    return card.currency === 'USD'
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(card.amount)
      : `₴${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(card.amount)}`;
  }
}
