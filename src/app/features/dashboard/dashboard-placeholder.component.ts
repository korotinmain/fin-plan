import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/**
 * Temporary dashboard placeholder — Phase 2 will replace this with the real
 * app shell and dashboard content.
 */
@Component({
  selector: 'app-dashboard',
  imports: [TranslatePipe],
  template: `
    <div class="dashboard-placeholder">
      <div class="dashboard-placeholder__card">
        <h1>{{ 'dashboard.title' | t }}</h1>
        <p>
          {{ 'dashboard.signedInAs' | t }}
          <strong>{{ email() ?? ('dashboard.unknown' | t) }}</strong>
        </p>
        <button class="btn-signout" type="button" (click)="signOut()">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M11 11l3-3-3-3M14 8H6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          {{ 'shell.signOut' | t }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-placeholder {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--color-bg-base);
      }
      .dashboard-placeholder__card {
        background-color: var(--color-bg-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-xl);
        padding: var(--space-10) var(--space-12);
        text-align: center;
        h1 {
          font-size: var(--text-3xl);
          font-weight: var(--font-bold);
          color: var(--color-text-primary);
          margin-bottom: var(--space-4);
        }
        p {
          color: var(--color-text-secondary);
          margin-bottom: var(--space-8);
        }
      }
      .btn-signout {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-3) var(--space-6);
        background-color: var(--color-bg-elevated);
        border: 1px solid var(--color-border-strong);
        border-radius: var(--radius-md);
        color: var(--color-text-primary);
        font-size: var(--text-base);
        cursor: pointer;
        transition: background-color var(--transition-fast);
        &:hover {
          background-color: var(--color-bg-overlay);
        }
        svg {
          width: var(--icon-md);
          height: var(--icon-md);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPlaceholderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly email = (): string | null => this.authService.currentUser()?.email ?? null;

  signOut(): void {
    this.authService.signOut().subscribe({
      next: () => void this.router.navigate(['/auth', 'login']),
    });
  }
}
