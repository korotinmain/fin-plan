import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Temporary dashboard placeholder — Phase 2 will replace this with the real
 * app shell and dashboard content.
 */
@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-placeholder">
      <div class="dashboard-placeholder__card">
        <h1>Dashboard</h1>
        <p>You are signed in as <strong>{{ email() }}</strong></p>
        <button class="btn-signout" type="button" (click)="signOut()">
          Sign out
        </button>
      </div>
    </div>
  `,
  styles: [`
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
      p { color: var(--color-text-secondary); margin-bottom: var(--space-8); }
    }
    .btn-signout {
      padding: var(--space-3) var(--space-6);
      background-color: var(--color-bg-elevated);
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      font-size: var(--text-base);
      cursor: pointer;
      transition: background-color var(--transition-fast);
      &:hover { background-color: var(--color-bg-overlay); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPlaceholderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly email = (): string => this.authService.currentUser()?.email ?? 'unknown';

  signOut(): void {
    this.authService.signOut().subscribe({
      next: () => void this.router.navigate(['/auth', 'login']),
    });
  }
}
