import { computed, inject, Injectable } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { GoalService } from './goal.service';

@Injectable({ providedIn: 'root' })
export class GoalFacade {
  private readonly authService = inject(AuthService);
  private readonly goalService = inject(GoalService);

  private readonly uid = computed(() => this.authService.currentUser()?.uid ?? null);

  /**
   * Signal for the user's goal.
   * undefined → auth/Firestore not yet resolved (loading)
   * null      → authenticated but no goal set
   * Goal      → goal exists
   */
  readonly goal = toSignal(
    toObservable(this.uid).pipe(
      switchMap((uid) =>
        uid !== null ? this.goalService.getGoal$(uid).pipe(catchError(() => of(null))) : of(null),
      ),
    ),
  );

  readonly isLoading = computed(() => this.goal() === undefined);
  readonly hasGoal = computed(() => {
    const goal = this.goal();
    return goal !== null && goal !== undefined;
  });
  readonly targetAmount = computed(() => this.goal()?.targetAmount ?? 0);
  readonly alreadyPaidAmount = computed(() => this.goal()?.alreadyPaidAmount ?? 0);

  save(targetAmount: number, alreadyPaidAmount: number): ReturnType<GoalService['setGoal']> {
    const uid = this.uid();
    if (uid === null) throw new Error('Not authenticated');
    return this.goalService.setGoal(uid, targetAmount, alreadyPaidAmount);
  }
}
