import { computed, inject, Injectable } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, of, switchMap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  EMPTY_SOURCE_BALANCE,
  SOURCE_META,
  SourceBalance,
  SourceId,
} from '../../core/models/source.model';
import { AuthService } from '../../core/services/auth.service';
import { calcUahTotal, calcUsdTotal } from './source.helpers';
import { SourceService } from './source.service';

@Injectable({ providedIn: 'root' })
export class SourceFacade {
  private readonly authService = inject(AuthService);
  private readonly sourceService = inject(SourceService);

  private readonly uid = computed(() => this.authService.currentUser()?.uid ?? null);

  /**
   * Source balances loaded from Firestore.
   * undefined → first snapshot not yet received (loading)
   * SourceBalance → persisted snapshot from Firestore
   */
  readonly balances = toSignal(
    toObservable(this.uid).pipe(
      switchMap((uid) =>
        uid !== null
          ? this.sourceService.getBalances$(uid).pipe(catchError(() => of(EMPTY_SOURCE_BALANCE)))
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

  balanceFor(id: SourceId): number {
    return (this.balances() ?? EMPTY_SOURCE_BALANCE)[id];
  }

  saveBalances(balances: SourceBalance): Observable<void> {
    const uid = this.uid();
    if (uid === null) return throwError(() => new Error('Not authenticated'));
    return this.sourceService.saveBalances(uid, balances);
  }
}
