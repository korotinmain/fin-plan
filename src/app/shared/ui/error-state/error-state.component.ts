import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-error-state',
  templateUrl: './error-state.component.html',
  styleUrl: './error-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorStateComponent {
  readonly message = input.required<string>();
  readonly retryLabel = input<string>('Try again');
  readonly showRetry = input<boolean>(true);

  readonly retry = output<void>();
}
