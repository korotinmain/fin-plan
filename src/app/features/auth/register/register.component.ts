import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

const passwordsMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value as string;
  const confirm = group.get('confirmPassword')?.value as string;
  return password && confirm && password !== confirm ? { passwordsMismatch: true } : null;
};

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group(
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

  signUpWithEmail(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();

    this.authService
      .registerWithEmailPassword(email, password)
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
      'auth/email-already-in-use': 'auth.errors.emailInUse',
      'auth/invalid-email': 'auth.errors.invalidEmail',
      'auth/weak-password': 'auth.errors.weakPassword',
      'auth/popup-closed-by-user': 'auth.errors.popupClosedSignUp',
      'auth/popup-blocked': 'auth.errors.popupBlocked',
      'auth/cancelled-popup-request': 'auth.errors.popupCancelledSignUp',
      'auth/network-request-failed': 'auth.errors.network',
    };
    return messages[code] ?? 'auth.errors.signUpFailed';
  }
}
