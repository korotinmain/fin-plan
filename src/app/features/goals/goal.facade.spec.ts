import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { GoalFacade } from './goal.facade';
import { GoalService } from './goal.service';

describe('GoalFacade', () => {
  const mockUser = signal<{ uid: string } | null>(null);
  const goalService = {
    getGoal$: vi.fn().mockReturnValue(of(null)),
    setGoal: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUser.set(null);
    goalService.getGoal$.mockReturnValue(of(null));

    TestBed.configureTestingModule({
      providers: [
        GoalFacade,
        { provide: AuthService, useValue: { currentUser: mockUser } },
        { provide: GoalService, useValue: goalService },
      ],
    });
  });

  it('should be created', () => {
    const facade: GoalFacade = TestBed.inject(GoalFacade);
    expect(facade).toBeTruthy();
  });

  it('sets isLoading to false once the goal stream resolves', async () => {
    const facade: GoalFacade = TestBed.inject(GoalFacade);
    await vi.waitFor(() => {
      expect(facade.isLoading()).toBe(false);
    });
  });

  it('returns hasGoal as false when no goal exists', () => {
    const facade: GoalFacade = TestBed.inject(GoalFacade);
    expect(facade.hasGoal()).toBe(false);
  });

  it('returns hasGoal as true when a goal exists', async () => {
    mockUser.set({ uid: 'uid-1' });
    goalService.getGoal$.mockReturnValue(
      of({ targetAmount: 250_000, alreadyPaidAmount: 40_000, currency: 'USD' as const }),
    );

    const facade: GoalFacade = TestBed.inject(GoalFacade);

    await vi.waitFor(() => {
      expect(goalService.getGoal$).toHaveBeenCalledWith('uid-1');
      expect(facade.hasGoal()).toBe(true);
    });
  });

  it('returns 0 as the default target amount', () => {
    const facade: GoalFacade = TestBed.inject(GoalFacade);
    expect(facade.targetAmount()).toBe(0);
  });

  it('returns the goal target amount when present', async () => {
    mockUser.set({ uid: 'uid-1' });
    goalService.getGoal$.mockReturnValue(
      of({ targetAmount: 180_000, alreadyPaidAmount: 40_000, currency: 'USD' as const }),
    );

    const facade: GoalFacade = TestBed.inject(GoalFacade);

    await vi.waitFor(() => {
      expect(facade.targetAmount()).toBe(180000);
    });
  });

  it('returns the already paid amount when present', async () => {
    mockUser.set({ uid: 'uid-1' });
    goalService.getGoal$.mockReturnValue(
      of({ targetAmount: 180_000, alreadyPaidAmount: 40_000, currency: 'USD' as const }),
    );

    const facade: GoalFacade = TestBed.inject(GoalFacade);

    await vi.waitFor(() => {
      expect(facade.goal()?.alreadyPaidAmount).toBe(40000);
    });
  });

  it('throws when saving while unauthenticated', () => {
    const facade: GoalFacade = TestBed.inject(GoalFacade);
    expect(() => facade.save(150_000, 40_000)).toThrow('Not authenticated');
  });
});
