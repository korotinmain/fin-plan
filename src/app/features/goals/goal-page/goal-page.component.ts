import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { GoalFacade } from '../goal.facade';

@Component({
  selector: 'app-goal-page',
  imports: [ReactiveFormsModule, CurrencyPipe, CardComponent, SkeletonComponent],
  templateUrl: './goal-page.component.html',
  styleUrl: './goal-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalPageComponent {
  private readonly facade = inject(GoalFacade);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly isLoading = this.facade.isLoading;
  protected readonly hasGoal = this.facade.hasGoal;
  protected readonly targetAmount = this.facade.targetAmount;

  protected readonly isEditing = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly saveError = signal<string | null>(null);

  protected readonly form = this.fb.group({
    targetAmount: [0, [Validators.required, Validators.min(1)]],
  });

  protected startEditing(): void {
    this.form.patchValue({ targetAmount: this.targetAmount() });
    this.isEditing.set(true);
    this.saveError.set(null);
  }

  protected cancel(): void {
    this.isEditing.set(false);
    this.saveError.set(null);
  }

  protected save(): void {
    if (this.form.invalid) return;
    this.isSaving.set(true);
    this.saveError.set(null);

    const { targetAmount } = this.form.getRawValue();
    this.facade.save(targetAmount).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isEditing.set(false);
      },
      error: () => {
        this.isSaving.set(false);
        this.saveError.set('Could not save your goal. Please try again.');
      },
    });
  }
}
