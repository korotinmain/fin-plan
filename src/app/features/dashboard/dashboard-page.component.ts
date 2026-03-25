import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { CardComponent } from '../../shared/ui/card/card.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { CurrencyFacade } from '../currency/currency.facade';
import { GoalFacade } from '../goals/goal.facade';
import { SourceFacade } from '../sources/source.facade';
import { calcTotalSavingsUsd } from '../sources/source.helpers';
import { DEFAULT_HOUSE_TARGET_USD } from '../expected-funds/expected-funds.data';
import { I18nService } from '../../core/services/i18n.service';
import { getChartTheme } from '../../shared/helpers/chart-theme';
import { EMPTY_SOURCE_BALANCE } from '../../core/models/source.model';
import { ExpectedFundsFacade } from '../expected-funds/expected-funds.facade';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    CurrencyPipe,
    DecimalPipe,
    RouterLink,
    BaseChartDirective,
    CardComponent,
    TranslatePipe,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private readonly sourceFacade = inject(SourceFacade);
  private readonly currencyFacade = inject(CurrencyFacade);
  private readonly goalFacade = inject(GoalFacade);
  private readonly expectedFundsFacade = inject(ExpectedFundsFacade);
  private readonly i18n = inject(I18nService);
  private readonly theme = getChartTheme();
  protected readonly sourceBalances = computed(
    () => this.sourceFacade.balances() ?? EMPTY_SOURCE_BALANCE,
  );

  protected readonly targetAmountUsd = computed(() =>
    this.goalFacade.targetAmount() > 0 ? this.goalFacade.targetAmount() : DEFAULT_HOUSE_TARGET_USD,
  );

  protected readonly ownSavingsUsd = computed(() =>
    calcTotalSavingsUsd(this.sourceBalances(), this.currencyFacade.rates().usdToUah),
  );

  protected readonly borrowedSupportUsd = this.expectedFundsFacade.totalUsd;

  protected readonly readyCapitalUsd = computed(
    () => this.ownSavingsUsd() + this.borrowedSupportUsd(),
  );

  protected readonly remainingGapUsd = computed(() =>
    Math.max(this.targetAmountUsd() - this.readyCapitalUsd(), 0),
  );

  protected readonly readinessProgress = computed(() => {
    const target = this.targetAmountUsd();
    if (target <= 0) {
      return 0;
    }

    return Math.min((this.readyCapitalUsd() / target) * 100, 100);
  });

  protected readonly activeSourceCount = computed(
    () => Object.values(this.sourceBalances()).filter((value) => value > 0).length,
  );

  protected readonly uahExposureUsd = computed(() => {
    const rate = this.currencyFacade.rates().usdToUah;
    if (rate <= 0) {
      return 0;
    }

    const balances = this.sourceBalances();
    return (balances.cardUah + balances.cashUah) / rate;
  });

  protected readonly fxLossesUsd = computed(() => Math.round(this.uahExposureUsd() * 0.021));

  protected readonly monthlyPaceUsd = computed(() => {
    const ownSavings = this.ownSavingsUsd();
    return ownSavings > 0 ? Math.max(ownSavings / 5.25, 1) : 0;
  });

  protected readonly estimatedMonths = computed(() => {
    const remaining = this.remainingGapUsd();
    const pace = this.monthlyPaceUsd();
    if (remaining <= 0 || pace <= 0) {
      return 0;
    }

    return Math.ceil(remaining / pace);
  });

  protected readonly growthLabels = computed(() => {
    const locale = this.i18n.locale() === 'uk' ? 'uk-UA' : 'en-US';
    const formatter = new Intl.DateTimeFormat(locale, { month: 'short' });

    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return formatter.format(date);
    });
  });

  protected readonly growthSeries = computed(() => {
    const readyCapital = this.readyCapitalUsd();
    const baseline = readyCapital > 0 ? readyCapital : 28_720;
    const weights = [0.12, 0.24, 0.41, 0.58, 0.73, 1];
    return weights.map((weight) => Math.round(baseline * weight));
  });

  protected readonly growthChartData = computed<ChartData<'line'>>(() => ({
    labels: this.growthLabels(),
    datasets: [
      {
        data: this.growthSeries(),
        borderColor: this.theme.violet,
        backgroundColor: this.theme.violetFill,
        pointBackgroundColor: this.theme.violet,
        pointBorderColor: this.theme.violet,
        pointRadius: 3,
        pointHoverRadius: 4,
        borderWidth: 3,
        fill: true,
        tension: 0.35,
      },
    ],
  }));

  protected readonly growthChartOptions: ChartOptions<'line'> = {
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
        displayColors: false,
        titleColor: this.theme.textPrimary,
        bodyColor: this.theme.textPrimary,
      },
    },
    scales: {
      x: {
        grid: { color: this.theme.chartGrid },
        ticks: { color: this.theme.textSecondary },
      },
      y: {
        beginAtZero: true,
        grid: { color: this.theme.chartGrid },
        ticks: { display: false },
      },
    },
  };
}
