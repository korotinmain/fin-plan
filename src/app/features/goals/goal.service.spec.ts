import { TestBed } from '@angular/core/testing';
import { firstValueFrom, isObservable, of } from 'rxjs';
import { GoalService } from './goal.service';
import { Firestore } from '@angular/fire/firestore';

// ─── Hoist Firestore mock functions ─────────────────────────────────────────
const mocks = vi.hoisted(() => ({
  mockDoc: vi.fn(),
  mockDocData: vi.fn(),
  mockSetDoc: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@angular/fire/firestore', () => ({
  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  Firestore: class {},
  doc: mocks.mockDoc,
  docData: mocks.mockDocData,
  setDoc: mocks.mockSetDoc,
}));

describe('GoalService', () => {
  let service: GoalService;

  beforeEach(() => {
    mocks.mockDoc.mockReturnValue({});

    TestBed.configureTestingModule({
      providers: [GoalService, { provide: Firestore, useValue: {} }],
    });

    service = TestBed.inject(GoalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getGoal$', () => {
    it('returns null when the Firestore document does not exist (undefined)', async () => {
      mocks.mockDocData.mockReturnValue(of(undefined));

      const result = await firstValueFrom(service.getGoal$('uid-1'));
      expect(result).toBeNull();
    });

    it('returns null when the document exists but has no targetAmount', async () => {
      mocks.mockDocData.mockReturnValue(of({ currency: 'USD' }));

      const result = await firstValueFrom(service.getGoal$('uid-1'));
      expect(result).toBeNull();
    });

    it('returns a Goal when the document has a targetAmount', async () => {
      mocks.mockDocData.mockReturnValue(of({ targetAmount: 250_000, currency: 'USD' }));

      const result = await firstValueFrom(service.getGoal$('uid-1'));
      expect(result).toEqual({ targetAmount: 250_000, currency: 'USD' });
    });
  });

  describe('setGoal', () => {
    it('returns an Observable', () => {
      const result = service.setGoal('uid-1', 250_000);
      expect(isObservable(result)).toBe(true);
    });

    it('resolves without error', async () => {
      await expect(firstValueFrom(service.setGoal('uid-1', 250_000))).resolves.toBeUndefined();
    });

    it('calls Firestore setDoc with the correct data', async () => {
      await firstValueFrom(service.setGoal('uid-1', 180_000));
      expect(mocks.mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        { targetAmount: 180_000, currency: 'USD' },
        { merge: true },
      );
    });
  });
});
