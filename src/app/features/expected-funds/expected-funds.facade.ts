import { computed, inject, Injectable } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { CurrencyFacade } from '../currency/currency.facade';
import { createExpectedFundId, toExpectedFundEntry } from './expected-funds.helpers';
import { ExpectedFundEntry, ExpectedFundRecord } from './expected-funds.data';
import { ExpectedFundsService } from './expected-funds.service';

@Injectable({ providedIn: 'root' })
export class ExpectedFundsFacade {
  private readonly authService = inject(AuthService);
  private readonly currencyFacade = inject(CurrencyFacade);
  private readonly expectedFundsService = inject(ExpectedFundsService);

  private readonly uid = computed(() => this.authService.currentUser()?.uid ?? null);

  readonly records = toSignal(
    toObservable(this.uid).pipe(
      switchMap((uid) =>
        uid !== null
          ? this.expectedFundsService.getExpectedFunds$(uid).pipe(catchError(() => of([])))
          : of([]),
      ),
    ),
  );

  readonly isLoading = computed(() => this.records() === undefined);

  readonly entries = computed<ExpectedFundEntry[]>(() =>
    (this.records() ?? []).map((record) =>
      toExpectedFundEntry(record, this.currencyFacade.rates()),
    ),
  );

  readonly totalUsd = computed(() =>
    this.entries().reduce((sum, entry) => sum + entry.usdValue, 0),
  );

  readonly confirmedUsd = computed(() =>
    this.entries()
      .filter((entry) => entry.status === 'confirmed')
      .reduce((sum, entry) => sum + entry.usdValue, 0),
  );

  readonly confirmedEntries = computed(() =>
    this.entries().filter((entry) => entry.status === 'confirmed'),
  );

  save(
    record: Omit<ExpectedFundRecord, 'id'> & { id?: string },
  ): ReturnType<ExpectedFundsService['setExpectedFunds']> {
    const uid = this.uid();

    if (uid === null) {
      throw new Error('Not authenticated');
    }

    const current = this.records() ?? [];
    const nextRecord: ExpectedFundRecord = {
      ...record,
      id: record.id ?? createExpectedFundId(),
    };

    const hasExisting = current.some((entry) => entry.id === nextRecord.id);
    const nextItems = hasExisting
      ? current.map((entry) => (entry.id === nextRecord.id ? nextRecord : entry))
      : [nextRecord, ...current];

    return this.expectedFundsService.setExpectedFunds(uid, nextItems);
  }

  remove(id: string): ReturnType<ExpectedFundsService['setExpectedFunds']> {
    const uid = this.uid();

    if (uid === null) {
      throw new Error('Not authenticated');
    }

    const nextItems = (this.records() ?? []).filter((entry) => entry.id !== id);
    return this.expectedFundsService.setExpectedFunds(uid, nextItems);
  }
}
