import { computed, inject, Injectable } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ExchangeRates } from '../../core/models/currency.model';
import { OperationDraft, OperationRecord } from '../../core/models/operation.model';
import { SourceBalance } from '../../core/models/source.model';
import { AuthService } from '../../core/services/auth.service';
import { buildOperationMutation } from './operation.helpers';
import { OperationService } from './operation.service';

@Injectable({ providedIn: 'root' })
export class OperationFacade {
  private readonly authService = inject(AuthService);
  private readonly operationService = inject(OperationService);

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

  record(
    draft: OperationDraft,
    balances: SourceBalance,
    rates: ExchangeRates,
  ): ReturnType<OperationService['recordOperation']> {
    const uid = this.uid();

    if (uid === null) {
      throw new Error('Not authenticated');
    }

    const { record } = buildOperationMutation(draft, balances, rates);

    return this.operationService.recordOperation(
      uid,
      this.operations() ?? [],
      record,
    );
  }
}
