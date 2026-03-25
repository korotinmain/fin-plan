import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type SkeletonVariant = 'rect' | 'text' | 'circle';

@Component({
  selector: 'app-skeleton',
  template: `
    <div
      class="skeleton"
      [class.skeleton--text]="variant() === 'text'"
      [class.skeleton--circle]="variant() === 'circle'"
      [style.width]="width()"
      [style.height]="height()"
    ></div>
  `,
  styleUrl: './skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {
  readonly width = input<string>('100%');
  readonly height = input<string>('16px');
  readonly variant = input<SkeletonVariant>('rect');
}
