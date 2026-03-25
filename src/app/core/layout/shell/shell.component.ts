import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppLocale } from '../../models/ui-preferences.model';
import { I18nService } from '../../services/i18n.service';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  private readonly authService = inject(AuthService);
  private readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  readonly user = this.authService.currentUser;
  readonly locale = this.i18n.locale;

  readonly initials = computed(() => {
    const u = this.user();
    if (!u) return '';
    if (u.displayName !== null && u.displayName !== '') {
      return u.displayName
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
    }
    return (u.email?.[0] ?? '').toUpperCase();
  });

  signOut(): void {
    this.authService.signOut().subscribe(() => {
      void this.router.navigate(['/auth/login']);
    });
  }

  setLocale(locale: AppLocale): void {
    this.i18n.setLocale(locale);
  }
}
