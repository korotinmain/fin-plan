import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { signal } from '@angular/core';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  const mockRouteSnapshot = {} as ActivatedRouteSnapshot;
  const mockRouterStateSnapshot = {} as RouterStateSnapshot;

  function runGuard(): boolean | UrlTree {
    return TestBed.runInInjectionContext(() =>
      authGuard(mockRouteSnapshot, mockRouterStateSnapshot),
    ) as boolean | UrlTree;
  }

  describe('when user IS authenticated', () => {
    beforeEach(() => {
      const isAuthSignal = signal(true);
      const mockAuthService = {
        isAuthenticated: isAuthSignal,
      };

      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: AuthService, useValue: mockAuthService },
        ],
      });
    });

    it('should return true', () => {
      const result = runGuard();
      expect(result).toBe(true);
    });
  });

  describe('when user is NOT authenticated', () => {
    beforeEach(() => {
      const isAuthSignal = signal(false);
      const mockAuthService = {
        isAuthenticated: isAuthSignal,
      };

      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: AuthService, useValue: mockAuthService },
        ],
      });
    });

    it('should return a UrlTree redirecting to /auth/login', () => {
      const result = runGuard();
      expect(result instanceof UrlTree).toBe(true);
      const urlTree = result as UrlTree;
      expect(urlTree.toString()).toBe('/auth/login');
    });
  });
});
