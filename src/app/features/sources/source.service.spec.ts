import { TestBed } from '@angular/core/testing';
import { firstValueFrom, isObservable, of } from 'rxjs';
import { SourceService } from './source.service';
import { Firestore } from '@angular/fire/firestore';
import { EMPTY_SOURCE_BALANCE, SourceBalance } from '../../core/models/source.model';

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

const FULL_BALANCE: SourceBalance = {
  cashUsd: 10_000,
  cardUsd: 5_000,
  cardUah: 200_000,
  cashUah: 50_000,
};

describe('SourceService', () => {
  let service: SourceService;

  beforeEach(() => {
    mocks.mockDoc.mockReturnValue({});
    mocks.mockSetDoc.mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        SourceService,
        { provide: Firestore, useValue: {} },
      ],
    });

    service = TestBed.inject(SourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBalances$', () => {
    it('returns EMPTY_SOURCE_BALANCE when the document does not exist (undefined)', async () => {
      mocks.mockDocData.mockReturnValue(of(undefined));

      const result = await firstValueFrom(service.getBalances$('uid-1'));
      expect(result).toEqual(EMPTY_SOURCE_BALANCE);
    });

    it('returns EMPTY_SOURCE_BALANCE when the document is empty', async () => {
      mocks.mockDocData.mockReturnValue(of({}));

      const result = await firstValueFrom(service.getBalances$('uid-1'));
      expect(result).toEqual(EMPTY_SOURCE_BALANCE);
    });

    it('returns full balance when all fields are present', async () => {
      mocks.mockDocData.mockReturnValue(of(FULL_BALANCE));

      const result = await firstValueFrom(service.getBalances$('uid-1'));
      expect(result).toEqual(FULL_BALANCE);
    });

    it('defaults missing fields to 0', async () => {
      mocks.mockDocData.mockReturnValue(of({ cashUsd: 3_000 }));

      const result = await firstValueFrom(service.getBalances$('uid-1'));
      expect(result).toEqual({ cashUsd: 3_000, cardUsd: 0, cardUah: 0, cashUah: 0 });
    });

    it('returns an Observable', () => {
      mocks.mockDocData.mockReturnValue(of(undefined));
      expect(isObservable(service.getBalances$('uid-1'))).toBe(true);
    });
  });

  describe('setBalances', () => {
    it('returns an Observable', () => {
      expect(isObservable(service.setBalances('uid-1', FULL_BALANCE))).toBe(true);
    });

    it('resolves without error', async () => {
      await expect(
        firstValueFrom(service.setBalances('uid-1', FULL_BALANCE)),
      ).resolves.toBeUndefined();
    });

    it('calls setDoc with the correct data and merge flag', async () => {
      await firstValueFrom(service.setBalances('uid-1', FULL_BALANCE));
      expect(mocks.mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        FULL_BALANCE,
        { merge: true },
      );
    });
  });

  describe('updateSource', () => {
    it('returns an Observable', () => {
      expect(isObservable(service.updateSource('uid-1', { cashUsd: 500 }))).toBe(true);
    });

    it('calls setDoc with only the partial data and merge flag', async () => {
      await firstValueFrom(service.updateSource('uid-1', { cardUah: 80_000 }));
      expect(mocks.mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        { cardUah: 80_000 },
        { merge: true },
      );
    });
  });
});
