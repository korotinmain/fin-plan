import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { Observable, firstValueFrom, of } from 'rxjs';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  const mockRouteSnapshot = {} as ActivatedRouteSnapshot;
  const mockRouterStateSnapshot = {} as RouterStateSnapshot;

  async function runGuard(): Promise<boolean | UrlTree> {
    const result = TestBed.runInInjectionContext(() =>
      authGuard(mockRouteSnapshot, mockRouterStateSnapshot),
    ) as Observable<boolean | UrlTree>;
    return firstValueFrom(result);
  }

  describe('when user IS authenticated', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: AuthService, useValue: { user$: of({ uid: 'abc' }) } },
        ],
      });
    });

    it('should return true', async () => {
      const result = await runGuard();
      expect(result).toBe(true);
    });
  });

  describe('when user is NOT authenticated', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: AuthService, useValue: { user$: of(null) } },
        ],
      });
    });

    it('should return a UrlTree redirecting to /auth/login', async () => {
      const result = await runGuard();
      expect(result instanceof UrlTree).toBe(true);
      const urlTree = result as UrlTree;
      expect(urlTree.toString()).toBe('/auth/login');
    });
  });
});
