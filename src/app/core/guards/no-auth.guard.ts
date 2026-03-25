import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Prevents authenticated users from accessing public-only routes (e.g. login).
 * Returns an Observable so the router waits for Firebase to resolve the
 * persisted session — prevents a signed-in user from briefly seeing the login page.
 */
export const noAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.user$.pipe(
    take(1),
    map((user) => (user ? router.createUrlTree(['/dashboard']) : true)),
  );
};
