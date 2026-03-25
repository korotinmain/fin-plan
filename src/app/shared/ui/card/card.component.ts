import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

export type CardVariant = 'default' | 'elevated' | 'flat';
export type CardPadding = 'default' | 'compact' | 'none';

@Component({
  selector: 'app-card',
  template: `
    <div [class]="classes()">
      <ng-content />
    </div>
  `,
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  readonly variant = input<CardVariant>('default');
  readonly padding = input<CardPadding>('default');

  readonly classes = computed(() =>
    ['card', `card--${this.variant()}`, `card--pad-${this.padding()}`].join(' '),
  );
}
