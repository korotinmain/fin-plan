import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Functional route guard that protects all authenticated sections.
 * Returns an Observable so the router waits for Firebase to resolve the
 * persisted session before deciding — prevents the hard-reload redirect bug.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.user$.pipe(
    take(1),
    map((user) => (user ? true : router.createUrlTree(['/auth', 'login']))),
  );
};
