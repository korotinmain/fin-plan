import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.authService.currentUser;

  readonly initials = computed(() => {
    const u = this.user();
    if (!u) return '';
    if (u.displayName) {
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
      this.router.navigate(['/auth/login']);
    });
  }
}
