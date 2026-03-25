import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeComponent, BadgeVariant } from './badge.component';

describe('BadgeComponent', () => {
  let fixture: ComponentFixture<BadgeComponent>;

  function createBadge(label: string, variant?: BadgeVariant): HTMLElement {
    fixture = TestBed.createComponent(BadgeComponent);
    fixture.componentRef.setInput('label', label);
    if (variant) {
      fixture.componentRef.setInput('variant', variant);
    }
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('span') as HTMLElement;
  }

  it('renders the label text', () => {
    const el = createBadge('Active');
    expect(el.textContent?.trim()).toBe('Active');
  });

  it('applies neutral variant class by default', () => {
    const el = createBadge('Draft');
    expect(el.classList).toContain('badge--neutral');
  });

  it.each<BadgeVariant>(['success', 'warning', 'danger', 'info', 'neutral'])(
    'applies badge--%s class for variant %s',
    (variant) => {
      const el = createBadge('Label', variant);
      expect(el.classList).toContain(`badge--${variant}`);
    },
  );

  it('always includes base badge class', () => {
    const el = createBadge('Test', 'success');
    expect(el.classList).toContain('badge');
  });
});
