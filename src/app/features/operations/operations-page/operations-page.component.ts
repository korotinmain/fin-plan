import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
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
import { ExpectedFundsFacade } from '../../expected-funds/expected-funds.facade';

interface OperationFormValue {
  type: OperationType;
  occurredAt: string;
  fromSource: SourceId;
  toSource: SourceId;
  fromAmount: number;
  toAmount: number;
  counterparty: string;
  note: string;
}

interface ActivityEntry {
  id: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  monthKey: string | null;
  fromLabel: string;
  toLabel: string;
  effectLabel: string;
  effectVariant: 'danger' | 'success' | 'neutral';
  footnote: string;
  sortKey: number;
  operationType: 'income' | 'transfer' | 'exchange' | 'expected';
}

interface ActivityMonthOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-operations-page',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule, CardComponent, TranslatePipe],
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

  protected readonly sourceMeta = SOURCE_META;
  protected readonly operationTypes: OperationType[] = ['income', 'transfer'];
  protected readonly isLoading = this.operationFacade.isLoading;
  protected readonly isDialogOpen = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly selectedMonth = signal('all');
  protected readonly selectedType = signal<'all' | 'income' | 'transfer' | 'exchange'>('all');
  protected readonly editingId = signal<string | null>(null);
  protected readonly deleteConfirmId = signal<string | null>(null);
  protected readonly isDeleting = signal(false);
  protected readonly isEditMode = computed(() => this.editingId() !== null);

  protected readonly form = this.fb.group({
    type: ['income' as OperationType],
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
        type: (value.type ?? 'income') as OperationType,
        occurredAt: value.occurredAt ?? todayIsoDate(),
        fromSource: (value.fromSource ?? 'cardUah') as SourceId,
        toSource: (value.toSource ?? 'cashUsd') as SourceId,
        fromAmount: value.fromAmount ?? 0,
        toAmount: value.toAmount ?? 0,
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

    // transfer (withdrawal): same currency, different source
    const fromCurrency = sourceCurrencyFor(state.fromSource);
    return SOURCE_META.filter(
      (item) => item.id !== state.fromSource && item.currency === fromCurrency,
    );
  });

  protected readonly activityEntries = computed(() => {
    const entries = this.operations().map((entry) => this.mapOperationToActivity(entry));
    const expectedFundEntries = this.expectedFundsFacade.confirmedEntries().map((entry, index) => ({
      id: `expected-${entry.id}`,
      title: this.i18n.translate('operations.activity.expectedFundTitle'),
      subtitle: entry.source,
      dateLabel: entry.eta,
      monthKey: null,
      fromLabel: '—',
      toLabel: this.i18n.translate('operations.activity.expectedFundsDestination'),
      effectLabel: `+${new Intl.NumberFormat(this.localeCode(), { maximumFractionDigits: 0 }).format(entry.usdValue)} USD`,
      effectVariant: 'success' as const,
      footnote: `${entry.originalAmount.toLocaleString(this.localeCode())} ${entry.originalCurrency} ${this.i18n.translate('operations.activity.expectedFundFootnote')}`,
      sortKey: -index - 1,
      operationType: 'expected' as const,
    }));

    return [...entries, ...expectedFundEntries].sort((left, right) => right.sortKey - left.sortKey);
  });

  protected readonly monthOptions = computed<ActivityMonthOption[]>(() => {
    const formatter = new Intl.DateTimeFormat(this.localeCode(), {
      month: 'long',
      year: 'numeric',
    });
    const seen = new Set<string>();
    const dynamicOptions = this.activityEntries()
      .filter((entry) => entry.monthKey !== null)
      .reduce<ActivityMonthOption[]>((options, entry) => {
        if (entry.monthKey === null || seen.has(entry.monthKey)) {
          return options;
        }

        seen.add(entry.monthKey);
        options.push({
          value: entry.monthKey,
          label: formatter.format(new Date(`${entry.monthKey}-01T00:00:00`)),
        });

        return options;
      }, []);

    return [
      { value: 'all', label: this.i18n.translate('operations.filterAllMonths') },
      ...dynamicOptions,
    ];
  });

  protected readonly filteredActivityEntries = computed(() => {
    const selectedMonth = this.selectedMonth();
    const selectedType = this.selectedType();

    return this.activityEntries().filter((entry) => {
      const monthMatch = selectedMonth === 'all' || entry.monthKey === selectedMonth;
      const typeMatch =
        selectedType === 'all' ||
        entry.operationType === selectedType ||
        (selectedType === 'income' && entry.operationType === 'expected');
      return monthMatch && typeMatch;
    });
  });

  protected readonly hasAnyActivityEntries = computed(() => this.activityEntries().length > 0);

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
    this.editingId.set(null);
    this.saveError.set(null);
    this.form.reset({
      type: 'income',
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

  protected openEditDialog(entryId: string): void {
    const record = this.operations().find((op) => op.id === entryId);
    if (!record) return;

    this.editingId.set(entryId);
    this.saveError.set(null);
    this.form.reset({
      type: record.type,
      occurredAt: record.occurredAt,
      fromSource: record.fromSource ?? 'cardUah',
      toSource: record.toSource ?? 'cashUsd',
      fromAmount: record.fromAmount ?? 0,
      toAmount: record.toAmount ?? 0,
      counterparty: record.counterparty ?? '',
      note: record.note,
    });
    this.isDialogOpen.set(true);
  }

  protected closeDialog(): void {
    this.isDialogOpen.set(false);
    this.isSaving.set(false);
    this.saveError.set(null);
    this.editingId.set(null);
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

    const editId = this.editingId();
    const action$ =
      editId !== null
        ? this.operationFacade.update(editId, draft, this.currencyFacade.rates())
        : this.operationFacade.record(draft, this.sourceBalances(), this.currencyFacade.rates());

    action$.pipe(take(1)).subscribe({
      next: () => {
        this.closeDialog();
      },
      error: (error: unknown) => {
        this.isSaving.set(false);
        this.saveError.set(this.resolveError(error));
      },
    });
  }

  protected requestDelete(id: string): void {
    this.deleteConfirmId.set(id);
  }

  protected cancelDelete(): void {
    this.deleteConfirmId.set(null);
  }

  protected confirmDelete(id: string): void {
    this.isDeleting.set(true);
    this.operationFacade
      .delete(id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.deleteConfirmId.set(null);
          this.isDeleting.set(false);
        },
        error: () => {
          this.deleteConfirmId.set(null);
          this.isDeleting.set(false);
        },
      });
  }

  protected effectBadgeVariant(entry: ActivityEntry): 'danger' | 'success' | 'neutral' {
    return entry.effectVariant;
  }

  protected setSelectedMonth(value: string): void {
    this.selectedMonth.set(value);
  }

  protected setSelectedType(value: string): void {
    this.selectedType.set(value as 'all' | 'income' | 'transfer' | 'exchange');
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
        monthKey: entry.occurredAt.slice(0, 7),
        fromLabel: '—',
        toLabel: sourceLabelFor(entry.toSource),
        effectLabel: `+${formatter.format(entry.toAmount)} ${sourceCurrencyFor(entry.toSource)}`,
        effectVariant: 'success',
        footnote:
          entry.note.trim() !== ''
            ? entry.note
            : this.i18n.translate('operations.activity.incomeFootnote'),
        sortKey,
        operationType: 'income',
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
        monthKey: entry.occurredAt.slice(0, 7),
        fromLabel: `${formatter.format(entry.fromAmount)} ${sourceCurrencyFor(entry.fromSource)}`,
        toLabel: sourceLabelFor(entry.toSource),
        effectLabel: `-${formatter.format(entry.fromAmount)} ${sourceCurrencyFor(entry.fromSource)}`,
        effectVariant: 'danger',
        footnote:
          entry.note.trim() !== ''
            ? entry.note
            : this.i18n.translate('operations.activity.transferFootnote'),
        sortKey,
        operationType: 'transfer',
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
        monthKey: entry.occurredAt.slice(0, 7),
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
        operationType: 'exchange',
      };
    }

    return {
      id: entry.id,
      title: this.i18n.translate('operations.activity.exchangeTitle'),
      subtitle: '',
      dateLabel: this.formatDateLabel(entry.occurredAt),
      monthKey: entry.occurredAt.slice(0, 7),
      fromLabel: '—',
      toLabel: '—',
      effectLabel: '—',
      effectVariant: 'neutral',
      footnote: entry.note,
      sortKey,
      operationType: 'exchange',
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
