import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, NgTemplateOutlet } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { I18nService } from '../../../core/services/i18n.service';
import { CurrencyFacade } from '../../currency/currency.facade';
import { calcProgressPercent, calcRemaining } from '../goal.helpers';
import { GoalFacade } from '../goal.facade';
import { getChartTheme } from '../../../shared/helpers/chart-theme';

type GoalMilestone = {
  percent: number;
  labelKey: string;
  amount: number;
  reached: boolean;
  current: boolean;
};

@Component({
  selector: 'app-goal-page',
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    NgTemplateOutlet,
    BaseChartDirective,
    CardComponent,
    SkeletonComponent,
    TranslatePipe,
  ],
  templateUrl: './goal-page.component.html',
  styleUrl: './goal-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalPageComponent {
  private readonly facade = inject(GoalFacade);
  private readonly currencyFacade = inject(CurrencyFacade);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly i18n = inject(I18nService);
  private readonly theme = getChartTheme();

  protected readonly isLoading = this.facade.isLoading;
  protected readonly hasGoal = this.facade.hasGoal;
  protected readonly targetAmount = this.facade.targetAmount;
  protected readonly totals = this.currencyFacade.totals;

  protected readonly isEditing = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly progressScaleMarkers = [25, 50, 75, 100];

  protected readonly form = this.fb.group({
    targetAmount: [0, [Validators.required, Validators.min(1)]],
  });

  protected readonly targetAmountUsd = computed(() => this.targetAmount());

  protected readonly savedAmountUsd = computed(() => this.totals().totalUsd);

  protected readonly remainingAmountUsd = computed(() =>
    calcRemaining(this.targetAmountUsd(), this.savedAmountUsd()),
  );

  protected readonly progressPercent = computed(() =>
    calcProgressPercent(this.targetAmountUsd(), this.savedAmountUsd()),
  );

  protected readonly monthlyPaceUsd = computed(() => {
    const target = this.targetAmountUsd();
    const saved = this.savedAmountUsd();

    if (target <= 0) {
      return 0;
    }

    if (saved <= 0) {
      return Math.max(target / 24, 1);
    }

    return Math.max(saved / 6, target / 30);
  });

  protected readonly estimatedMonths = computed(() => {
    const remaining = this.remainingAmountUsd();
    const pace = this.monthlyPaceUsd();

    if (remaining <= 0) {
      return 0;
    }

    return Math.max(1, Math.ceil(remaining / Math.max(pace, 1)));
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
    const saved = this.savedAmountUsd();

    if (saved <= 0) {
      return [0, 0, 0, 0, 0, 0];
    }

    const weights = [0.58, 0.67, 0.75, 0.82, 0.91, 1];
    return weights.map((weight) => Math.round(saved * weight));
  });

  protected readonly progressChartData = computed<ChartData<'line'>>(() => ({
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
        borderWidth: 2,
        fill: true,
        tension: 0.35,
      },
    ],
  }));

  protected readonly progressChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: false,
      },
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
        grid: {
          color: this.theme.chartGrid,
        },
        ticks: {
          color: this.theme.textSecondary,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: this.theme.chartGrid,
        },
        ticks: {
          color: this.theme.textSecondary,
        },
      },
    },
  };

  protected readonly milestones = computed<GoalMilestone[]>(() => {
    const target = this.targetAmountUsd();
    const progress = this.progressPercent();
    const milestonePercents = [25, 50, 75, 100] as const;
    const currentPercent = milestonePercents.find((percent) => progress < percent) ?? 100;

    return milestonePercents.map((percent) => ({
      percent,
      labelKey: `goal.milestone${percent}`,
      amount: Math.round((target * percent) / 100),
      reached: progress >= percent,
      current: progress < 100 && currentPercent === percent,
    }));
  });

  protected startEditing(): void {
    this.form.patchValue({ targetAmount: Math.round(this.targetAmountUsd()) });
    this.isEditing.set(true);
    this.saveError.set(null);
  }

  protected cancel(): void {
    this.isEditing.set(false);
    this.saveError.set(null);
  }

  protected save(): void {
    if (this.form.invalid) return;

    this.isSaving.set(true);
    this.saveError.set(null);

    const { targetAmount } = this.form.getRawValue();
    this.facade.save(targetAmount).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isEditing.set(false);
      },
      error: () => {
        this.isSaving.set(false);
        this.saveError.set('goal.saveError');
      },
    });
  }
}
