import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  signInWithGoogle(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService
      .signInWithGoogle()
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: () => void this.router.navigate(['/']),
        error: (err: unknown) => {
          this.errorMessage.set(this.extractErrorMessage(err));
        },
      });
  }

  signInWithEmail(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();

    this.authService
      .signInWithEmailPassword(email, password)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: () => void this.router.navigate(['/']),
        error: (err: unknown) => {
          this.errorMessage.set(this.extractErrorMessage(err));
        },
      });
  }

  private extractErrorMessage(err: unknown): string {
    if (
      err !== null &&
      typeof err === 'object' &&
      'code' in err &&
      typeof (err as Record<string, unknown>)['code'] === 'string'
    ) {
      return this.mapFirebaseError((err as Record<string, string>)['code']);
    }
    return 'auth.errors.unexpected';
  }

  private mapFirebaseError(code: string): string {
    const messages: Record<string, string> = {
      'auth/invalid-credential': 'auth.errors.invalidCredential',
      'auth/user-not-found': 'auth.errors.userNotFound',
      'auth/wrong-password': 'auth.errors.wrongPassword',
      'auth/too-many-requests': 'auth.errors.tooManyRequests',
      'auth/popup-closed-by-user': 'auth.errors.popupClosedSignIn',
      'auth/popup-blocked': 'auth.errors.popupBlocked',
      'auth/cancelled-popup-request': 'auth.errors.popupCancelled',
      'auth/network-request-failed': 'auth.errors.network',
    };
    return messages[code] ?? 'auth.errors.signInFailed';
  }
}
