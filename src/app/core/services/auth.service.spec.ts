import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, isObservable } from 'rxjs';
import { AuthService } from './auth.service';
import { Auth } from '@angular/fire/auth';

// ─── Hoist mock functions before module imports are resolved ──────────────────
const mocks = vi.hoisted(() => ({
  authStateFn: vi.fn(),
  signInWithPopup: vi.fn().mockResolvedValue({ user: { uid: 'google-uid' } }),
  signInWithEmailAndPassword: vi
    .fn()
    .mockResolvedValue({ user: { uid: 'email-uid' } }),
  signOut: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@angular/fire/auth', () => ({
  authState: mocks.authStateFn,
  signInWithPopup: mocks.signInWithPopup,
  signInWithEmailAndPassword: mocks.signInWithEmailAndPassword,
  signOut: mocks.signOut,
  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  GoogleAuthProvider: class {
    static PROVIDER_ID = 'google.com';
  },
  // Auth is used as an injection token — provide a stable class reference
  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  Auth: class {},
}));

describe('AuthService', () => {
  let service: AuthService;
  let authStateSubject: BehaviorSubject<{ uid: string } | null>;

  beforeEach(() => {
    authStateSubject = new BehaviorSubject<{ uid: string } | null>(null);
    mocks.authStateFn.mockReturnValue(authStateSubject.asObservable());

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Auth, useValue: {} },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with null currentUser', () => {
    expect(service.currentUser()).toBeNull();
  });

  it('isAuthenticated should be false when currentUser is null', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('isAuthenticated should be true when a user is emitted', () => {
    const mockUser = { uid: 'test-uid-123' };

    authStateSubject.next(mockUser);

    expect(service.currentUser()).toEqual(mockUser);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('isAuthenticated should return false after sign-out (null) emission', () => {
    const mockUser = { uid: 'test-uid-456' };

    authStateSubject.next(mockUser);
    expect(service.isAuthenticated()).toBe(true);

    authStateSubject.next(null);
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('signInWithGoogle should return an Observable', () => {
    const result = service.signInWithGoogle();
    expect(isObservable(result)).toBe(true);
  });

  it('signInWithEmailPassword should return an Observable', () => {
    const result = service.signInWithEmailPassword(
      'test@example.com',
      'password123',
    );
    expect(isObservable(result)).toBe(true);
  });

  it('signOut should return an Observable', () => {
    const result = service.signOut();
    expect(isObservable(result)).toBe(true);
  });
});
