import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
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
  ExpectedFundCurrency,
  ExpectedFundEntry,
  ExpectedFundRecord,
  ExpectedFundStatus,
} from '../expected-funds.data';
import { ExpectedFundsFacade } from '../expected-funds.facade';

@Component({
  selector: 'app-expected-funds-page',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    CurrencyPipe,
    CardComponent,
    BadgeComponent,
    TranslatePipe,
  ],
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

  protected readonly isDialogOpen = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly editingId = signal<string | null>(null);
  protected readonly submitAttempted = signal(false);
  protected readonly currencies: ExpectedFundCurrency[] = ['USD', 'EUR', 'UAH'];
  protected readonly statuses: ExpectedFundStatus[] = ['confirmed', 'planned'];
  protected readonly sourceBalances = computed(
    () => this.sourceFacade.balances() ?? EMPTY_SOURCE_BALANCE,
  );
  protected readonly entries = this.expectedFundsFacade.entries;
  protected readonly records = this.expectedFundsFacade.records;

  protected readonly form = this.fb.group({
    source: ['', [Validators.required]],
    description: [''],
    originalCurrency: ['USD' as ExpectedFundCurrency, [Validators.required]],
    originalAmount: [0, [Validators.required, Validators.min(1)]],
    eta: ['', [Validators.required]],
    status: ['planned' as ExpectedFundStatus, [Validators.required]],
  });

  protected readonly ownSavingsUsd = computed(() =>
    calcTotalSavingsUsd(this.sourceBalances(), this.currencyFacade.rates().usdToUah),
  );

  protected readonly targetAmountUsd = computed(() => {
    const target = this.goalFacade.targetAmount();
    return target > 0 ? target : null;
  });

  protected readonly expectedTotalUsd = this.expectedFundsFacade.totalUsd;

  protected readonly confirmedAmountUsd = this.expectedFundsFacade.confirmedUsd;

  protected readonly supportCoveragePercent = computed<number | null>(() => {
    const target = this.targetAmountUsd();
    if (target === null) return null;
    const gapAfterOwnSavings = Math.max(target - this.ownSavingsUsd(), 1);
    return Math.round((this.expectedTotalUsd() / gapAfterOwnSavings) * 100);
  });

  protected readonly dialogTitle = computed(() =>
    this.editingId() === null
      ? this.i18n.translate('expectedFunds.dialogAddTitle')
      : this.i18n.translate('expectedFunds.dialogEditTitle'),
  );

  protected readonly hasEntries = computed(() => this.entries().length > 0);

  protected openCreateDialog(): void {
    this.editingId.set(null);
    this.submitAttempted.set(false);
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
    this.submitAttempted.set(false);
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
    this.submitAttempted.set(false);
  }

  protected saveEntry(): void {
    this.submitAttempted.set(true);

    if (!this.isFormSubmittable()) {
      this.form.markAllAsTouched();
      this.saveError.set(this.i18n.translate('expectedFunds.errors.invalidForm'));
      return;
    }

    this.isSaving.set(true);
    this.saveError.set(null);

    const value = this.form.getRawValue();
    const originalAmount = value.originalAmount;
    const payload: Omit<ExpectedFundRecord, 'id'> & { id?: string } = {
      id: this.editingId() ?? undefined,
      source: value.source.trim(),
      description: value.description.trim(),
      originalCurrency: value.originalCurrency,
      originalAmount,
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

  protected fieldInvalid(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitAttempted());
  }

  private isFormSubmittable(): boolean {
    const value = this.form.getRawValue();
    const source = value.source.trim();
    const eta = value.eta.trim();
    const originalAmount = value.originalAmount;

    return (
      source !== '' &&
      eta !== '' &&
      Number.isFinite(originalAmount) &&
      originalAmount > 0 &&
      this.form.controls.originalCurrency.valid &&
      this.form.controls.status.valid
    );
  }
}
