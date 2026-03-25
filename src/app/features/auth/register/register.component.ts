import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

const passwordsMatchValidator: ValidatorFn = (
  group: AbstractControl,
): ValidationErrors | null => {
  const password = group.get('password')?.value as string;
  const confirm = group.get('confirmPassword')?.value as string;
  return password && confirm && password !== confirm
    ? { passwordsMismatch: true }
    : null;
};

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly form: FormGroup = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator },
  );

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  signUpWithGoogle(): void {
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

  signUpWithEmail(): void {
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
      .registerWithEmailPassword(email, password)
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
      return this.mapFirebaseError((err as Record<string, string>)['code']);
    }
    return 'An unexpected error occurred. Please try again.';
  }

  private mapFirebaseError(code: string): string {
    const messages: Record<string, string> = {
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password is too weak. Use at least 8 characters.',
      'auth/popup-closed-by-user': 'Sign-up popup was closed. Please try again.',
      'auth/popup-blocked':
        'Popup was blocked by your browser. Please allow popups for this site.',
      'auth/cancelled-popup-request':
        'Only one sign-up popup can be open at a time.',
      'auth/network-request-failed':
        'Network error. Please check your connection.',
    };
    return messages[code] ?? 'Sign-up failed. Please try again.';
  }
}
