import { computed, inject, Injectable } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  EMPTY_SOURCE_BALANCE,
  SOURCE_META,
  SourceBalance,
  SourceId,
} from '../../core/models/source.model';
import { AuthService } from '../../core/services/auth.service';
import { SourceService } from './source.service';
import { calcUahTotal, calcUsdTotal } from './source.helpers';

@Injectable({ providedIn: 'root' })
export class SourceFacade {
  private readonly authService = inject(AuthService);
  private readonly sourceService = inject(SourceService);

  private readonly uid = computed(
    () => this.authService.currentUser()?.uid ?? null,
  );

  /**
   * Signal for the live source balances document.
   * undefined → loading (auth/Firestore not yet resolved)
   * SourceBalance → resolved (may be all zeros if no document exists)
   */
  readonly balances = toSignal(
    toObservable(this.uid).pipe(
      switchMap((uid) =>
        uid !== null
          ? this.sourceService
              .getBalances$(uid)
              .pipe(catchError(() => of(EMPTY_SOURCE_BALANCE)))
          : of(EMPTY_SOURCE_BALANCE),
      ),
    ),
  );

  readonly isLoading = computed(() => this.balances() === undefined);

  /** USD total: cashUsd + cardUsd */
  readonly usdTotal = computed(() => calcUsdTotal(this.balances() ?? EMPTY_SOURCE_BALANCE));

  /** UAH total: cardUah + cashUah */
  readonly uahTotal = computed(() => calcUahTotal(this.balances() ?? EMPTY_SOURCE_BALANCE));

  /** Static source metadata (labels, currencies) */
  readonly sourceMeta = SOURCE_META;

  /**
   * Returns the current balance for a given source.
   */
  balanceFor(id: SourceId): number {
    return (this.balances() ?? EMPTY_SOURCE_BALANCE)[id];
  }

  /**
   * Saves an update to a single source balance.
   */
  update(id: SourceId, amount: number): ReturnType<SourceService['updateSource']> {
    const uid = this.uid();
    if (uid === null) throw new Error('Not authenticated');
    return this.sourceService.updateSource(uid, { [id]: amount } as Partial<SourceBalance>);
  }
}
