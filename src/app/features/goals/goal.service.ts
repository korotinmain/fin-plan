import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Goal } from '../../core/models/goal.model';
import { FIRESTORE_PATHS } from '../../core/constants/firestore.constants';

@Injectable({ providedIn: 'root' })
export class GoalService {
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(Injector);

  /**
   * Returns an observable of the user's goal, or null if none is set.
   * The Firestore document is keyed by the user's UID: goals/{uid}
   *
   * runInInjectionContext is required because docData() calls inject()
   * internally. Without it, calling getGoal$ inside a switchMap (async)
   * triggers AngularFire's "outside injection context" warning.
   */
  getGoal$(uid: string): Observable<Goal | null> {
    const ref = doc(this.firestore, FIRESTORE_PATHS.goals(uid));
    return runInInjectionContext(this.injector, () =>
      (
        docData(ref) as Observable<
          | {
              targetAmount?: number;
              alreadyPaidAmount?: number;
              currency?: string;
              updatedAt?: string;
            }
          | undefined
        >
      ).pipe(
        map((data) =>
          data?.targetAmount !== undefined
            ? {
                targetAmount: data.targetAmount,
                alreadyPaidAmount: data.alreadyPaidAmount ?? 0,
                currency: 'USD' as const,
              }
            : null,
        ),
      ),
    );
  }

  /**
   * Creates or updates the user's goal (upsert via merge).
   */
  setGoal(uid: string, targetAmount: number, alreadyPaidAmount: number): Observable<void> {
    const ref = doc(this.firestore, FIRESTORE_PATHS.goals(uid));
    return from(setDoc(ref, { targetAmount, alreadyPaidAmount, currency: 'USD' }, { merge: true }));
  }
}
