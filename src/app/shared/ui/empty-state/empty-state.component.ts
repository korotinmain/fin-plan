import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly actionLabel = input<string>('');

  readonly action = output<void>();
}
