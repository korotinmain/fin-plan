import { computed, inject, Injectable } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ExchangeRates } from '../../core/models/currency.model';
import { OperationDraft, OperationRecord } from '../../core/models/operation.model';
import { SourceBalance } from '../../core/models/source.model';
import { AuthService } from '../../core/services/auth.service';
import { SourceService } from '../sources/source.service';
import { buildOperationMutation, calcBalancesFromOperations } from './operation.helpers';
import { OperationService } from './operation.service';

@Injectable({ providedIn: 'root' })
export class OperationFacade {
  private readonly authService = inject(AuthService);
  private readonly operationService = inject(OperationService);
  private readonly sourceService = inject(SourceService);

  private readonly uid = computed(() => this.authService.currentUser()?.uid ?? null);

  readonly operations = toSignal(
    toObservable(this.uid).pipe(
      switchMap((uid) =>
        uid !== null
          ? this.operationService.getOperations$(uid).pipe(catchError(() => of([])))
          : of([]),
      ),
    ),
  );

  readonly isLoading = computed(() => this.operations() === undefined);

  record(draft: OperationDraft, balances: SourceBalance, rates: ExchangeRates): Observable<void> {
    const uid = this.uid();

    if (uid === null) {
      throw new Error('Not authenticated');
    }

    const { record, nextBalances } = buildOperationMutation(draft, balances, rates);

    return this.operationService
      .recordOperation(uid, this.operations() ?? [], record)
      .pipe(switchMap(() => this.sourceService.saveBalances(uid, nextBalances)));
  }

  update(id: string, draft: OperationDraft, rates: ExchangeRates): Observable<void> {
    const uid = this.uid();
    if (uid === null) throw new Error('Not authenticated');

    // Compute balances without the existing record so validation is correct
    const opsWithoutThis = (this.operations() ?? []).filter((op) => op.id !== id);
    const balancesWithoutThis = calcBalancesFromOperations(opsWithoutThis);
    const { record, nextBalances } = buildOperationMutation(draft, balancesWithoutThis, rates);
    const updatedRecord: OperationRecord = { ...record, id };

    return this.operationService
      .updateOperation(uid, this.operations() ?? [], updatedRecord)
      .pipe(switchMap(() => this.sourceService.saveBalances(uid, nextBalances)));
  }

  delete(id: string): Observable<void> {
    const uid = this.uid();
    if (uid === null) throw new Error('Not authenticated');

    const remainingOps = (this.operations() ?? []).filter((op) => op.id !== id);
    const newBalances = calcBalancesFromOperations(remainingOps);

    return this.operationService
      .deleteOperation(uid, this.operations() ?? [], id)
      .pipe(switchMap(() => this.sourceService.saveBalances(uid, newBalances)));
  }
}
