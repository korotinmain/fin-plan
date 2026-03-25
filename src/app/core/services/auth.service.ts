import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { computed } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
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
   * Raw authState observable — used by guards to wait for the first
   * resolved Firebase auth state (avoids redirect on hard reload).
   */
  readonly user$ = authState(this.auth);

  /**
   * Signal reflecting the current Firebase User.
   * null  → not authenticated / auth state not yet resolved
   * User  → authenticated
   */
  readonly currentUser = toSignal<User | null>(
    this.user$,
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

  registerWithEmailPassword(
    email: string,
    password: string,
  ): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  signOut(): Observable<void> {
    return from(signOut(this.auth));
  }
}
