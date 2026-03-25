import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { I18nService } from '../../../core/services/i18n.service';
import { CurrencyFacade } from '../../currency/currency.facade';
import { GoalFacade } from '../../goals/goal.facade';
import { SourceFacade } from '../../sources/source.facade';
import { calcTotalSavingsUsd } from '../../sources/source.helpers';
import { EMPTY_SOURCE_BALANCE } from '../../../core/models/source.model';
import {
  DEFAULT_HOUSE_TARGET_USD,
  ExpectedFundCurrency,
  ExpectedFundEntry,
  ExpectedFundRecord,
  ExpectedFundStatus,
} from '../expected-funds.data';
import { ExpectedFundsFacade } from '../expected-funds.facade';

@Component({
  selector: 'app-expected-funds-page',
  imports: [ReactiveFormsModule, CurrencyPipe, CardComponent, BadgeComponent, TranslatePipe],
  templateUrl: './expected-funds-page.component.html',
  styleUrl: './expected-funds-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpectedFundsPageComponent {
  private readonly sourceFacade = inject(SourceFacade);
  private readonly currencyFacade = inject(CurrencyFacade);
  private readonly goalFacade = inject(GoalFacade);
  private readonly expectedFundsFacade = inject(ExpectedFundsFacade);
  private readonly i18n = inject(I18nService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly searchTerm = signal('');
  protected readonly isDialogOpen = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly editingId = signal<string | null>(null);
  protected readonly currencies: ExpectedFundCurrency[] = ['USD', 'EUR', 'UAH'];
  protected readonly statuses: ExpectedFundStatus[] = ['confirmed', 'planned'];
  protected readonly sourceBalances = computed(
    () => this.sourceFacade.balances() ?? EMPTY_SOURCE_BALANCE,
  );
  protected readonly entries = this.expectedFundsFacade.entries;
  protected readonly records = this.expectedFundsFacade.records;

  protected readonly form = this.fb.group({
    source: ['', [Validators.required]],
    description: ['', [Validators.required]],
    originalCurrency: ['USD' as ExpectedFundCurrency, [Validators.required]],
    originalAmount: [0, [Validators.required, Validators.min(1)]],
    eta: ['', [Validators.required]],
    status: ['planned' as ExpectedFundStatus, [Validators.required]],
  });

  protected readonly ownSavingsUsd = computed(() =>
    calcTotalSavingsUsd(this.sourceBalances(), this.currencyFacade.rates().usdToUah),
  );

  protected readonly targetAmountUsd = computed(() =>
    this.goalFacade.targetAmount() > 0 ? this.goalFacade.targetAmount() : DEFAULT_HOUSE_TARGET_USD,
  );

  protected readonly expectedTotalUsd = this.expectedFundsFacade.totalUsd;

  protected readonly confirmedAmountUsd = this.expectedFundsFacade.confirmedUsd;

  protected readonly supportCoveragePercent = computed(() => {
    const gapAfterOwnSavings = Math.max(this.targetAmountUsd() - this.ownSavingsUsd(), 1);
    return Math.round((this.expectedTotalUsd() / gapAfterOwnSavings) * 100);
  });

  protected readonly filteredEntries = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    if (query === '') {
      return this.entries();
    }

    return this.entries().filter((entry) =>
      [entry.source, entry.description, entry.eta, entry.originalCurrency, entry.status]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  });

  protected readonly dialogTitle = computed(() =>
    this.editingId() === null
      ? this.i18n.translate('expectedFunds.dialogAddTitle')
      : this.i18n.translate('expectedFunds.dialogEditTitle'),
  );

  protected readonly hasEntries = computed(() => this.entries().length > 0);

  protected setSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  protected openCreateDialog(): void {
    this.editingId.set(null);
    this.form.reset({
      source: '',
      description: '',
      originalCurrency: 'USD',
      originalAmount: 0,
      eta: '',
      status: 'planned',
    });
    this.saveError.set(null);
    this.isDialogOpen.set(true);
  }

  protected openEditDialog(entry: ExpectedFundEntry): void {
    this.editingId.set(entry.id);
    this.form.setValue({
      source: entry.source,
      description: entry.description,
      originalCurrency: entry.originalCurrency,
      originalAmount: entry.originalAmount,
      eta: entry.eta,
      status: entry.status,
    });
    this.saveError.set(null);
    this.isDialogOpen.set(true);
  }

  protected closeDialog(): void {
    this.isDialogOpen.set(false);
    this.isSaving.set(false);
    this.saveError.set(null);
  }

  protected saveEntry(): void {
    if (this.form.invalid) {
      this.saveError.set(this.i18n.translate('expectedFunds.errors.invalidForm'));
      return;
    }

    this.isSaving.set(true);
    this.saveError.set(null);

    const value = this.form.getRawValue();
    const payload: Omit<ExpectedFundRecord, 'id'> & { id?: string } = {
      id: this.editingId() ?? undefined,
      source: value.source.trim(),
      description: value.description.trim(),
      originalCurrency: value.originalCurrency,
      originalAmount: value.originalAmount,
      eta: value.eta.trim(),
      status: value.status,
    };

    this.expectedFundsFacade
      .save(payload)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.closeDialog();
        },
        error: () => {
          this.isSaving.set(false);
          this.saveError.set(this.i18n.translate('expectedFunds.errors.saveFailed'));
        },
      });
  }

  protected deleteEntry(entry: ExpectedFundEntry): void {
    this.expectedFundsFacade
      .remove(entry.id)
      .pipe(take(1))
      .subscribe({
        error: () => {
          this.saveError.set(this.i18n.translate('expectedFunds.errors.deleteFailed'));
        },
      });
  }

  protected originalAmountLabel(entry: ExpectedFundEntry): string {
    const formatted = new Intl.NumberFormat(this.i18n.locale() === 'uk' ? 'uk-UA' : 'en-US', {
      maximumFractionDigits: 0,
    }).format(entry.originalAmount);

    return `${entry.originalCurrency} ${formatted}`;
  }

  protected statusVariant(entry: ExpectedFundEntry): 'success' | 'neutral' {
    return entry.status === 'confirmed' ? 'success' : 'neutral';
  }

  protected statusLabel(entry: ExpectedFundEntry): string {
    return this.i18n.translate(
      entry.status === 'confirmed'
        ? 'expectedFunds.statusConfirmed'
        : 'expectedFunds.statusPlanned',
    );
  }
}
