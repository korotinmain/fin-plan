import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { computed } from '@angular/core';
import {
  Auth,
  authState,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from '@angular/fire/auth';
import { from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);

  /**
   * Signal reflecting the current Firebase User.
   * null  → not authenticated
   * User  → authenticated
   * undefined → auth state not yet resolved (initial emission)
   */
  readonly currentUser = toSignal<User | null>(
    authState(this.auth),
    { initialValue: null },
  );

  /** True once auth state has been resolved and user is signed in. */
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  signInWithGoogle(): Observable<UserCredential> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider));
  }

  signInWithEmailPassword(
    email: string,
    password: string,
  ): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  signOut(): Observable<void> {
    return from(signOut(this.auth));
  }
}
