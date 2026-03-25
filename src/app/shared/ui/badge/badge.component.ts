import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

@Component({
  selector: 'app-badge',
  template: `<span [class]="classes()">{{ label() }}</span>`,
  styleUrl: './badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  readonly label = input.required<string>();
  readonly variant = input<BadgeVariant>('neutral');

  readonly classes = computed(() =>
    ['badge', `badge--${this.variant()}`].join(' '),
  );
}
