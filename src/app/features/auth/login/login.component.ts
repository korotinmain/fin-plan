import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly form: FormGroup = this.fb.group({
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
      .pipe(finalize(() => { this.isLoading.set(false); }))
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

    const { email, password } = this.form.getRawValue() as {
      email: string;
      password: string;
    };

    this.authService
      .signInWithEmailPassword(email, password)
      .pipe(finalize(() => { this.isLoading.set(false); }))
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
      return this.mapFirebaseError(
        (err as Record<string, string>)['code'],
      );
    }
    return 'An unexpected error occurred. Please try again.';
  }

  private mapFirebaseError(code: string): string {
    const messages: Record<string, string> = {
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/too-many-requests':
        'Too many attempts. Please try again later.',
      'auth/popup-closed-by-user':
        'Sign-in popup was closed. Please try again.',
      'auth/popup-blocked':
        'Popup was blocked by your browser. Please allow popups for this site.',
      'auth/cancelled-popup-request':
        'Only one sign-in popup can be open at a time.',
      'auth/network-request-failed':
        'Network error. Please check your connection.',
    };
    return messages[code] ?? 'Sign-in failed. Please try again.';
  }
}
