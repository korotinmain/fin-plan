import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { SourceFacade } from '../source.facade';
import { SourceId, SourceMeta } from '../../../core/models/source.model';

@Component({
  selector: 'app-sources-page',
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    DecimalPipe,
    CardComponent,
    SkeletonComponent,
    BadgeComponent,
  ],
  templateUrl: './sources-page.component.html',
  styleUrl: './sources-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SourcesPageComponent {
  private readonly facade = inject(SourceFacade);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly isLoading = this.facade.isLoading;
  protected readonly usdTotal = this.facade.usdTotal;
  protected readonly uahTotal = this.facade.uahTotal;
  protected readonly sourceMeta = this.facade.sourceMeta;

  /** Which source row is currently in edit mode (null = none) */
  protected readonly editingId = signal<SourceId | null>(null);
  protected readonly isSaving = signal(false);
  protected readonly saveError = signal<string | null>(null);

  protected readonly form = this.fb.group({
    amount: [0, [Validators.required, Validators.min(0)]],
  });

  protected balanceFor(id: SourceId): number {
    return this.facade.balanceFor(id);
  }

  protected startEditing(meta: SourceMeta): void {
    this.form.patchValue({ amount: this.facade.balanceFor(meta.id) });
    this.editingId.set(meta.id);
    this.saveError.set(null);
  }

  protected cancelEditing(): void {
    this.editingId.set(null);
    this.saveError.set(null);
  }

  protected save(id: SourceId): void {
    if (this.form.invalid) return;
    this.isSaving.set(true);
    this.saveError.set(null);

    const { amount } = this.form.getRawValue();
    this.facade.update(id, amount).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.editingId.set(null);
      },
      error: () => {
        this.isSaving.set(false);
        this.saveError.set('Could not save. Please try again.');
      },
    });
  }
}
