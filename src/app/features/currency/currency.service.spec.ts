import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { firstValueFrom, isObservable, of } from 'rxjs';
import { CurrencyService } from './currency.service';
import {
  CurrencyData,
  EMPTY_CURRENCY_DATA,
  EMPTY_CURRENCY_HOLDINGS,
} from '../../core/models/currency.model';

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

const FULL_DATA: CurrencyData = {
  holdings: {
    uah: { cash: 30_000, card: 15_000 },
    usd: { cash: 2_000, card: 1_500 },
    eur: { cash: 500, card: 300 },
  },
  usdToUah: 41.5,
  eurToUah: 44.2,
  eurToUsd: 1.0651,
};

describe('CurrencyService', () => {
  let service: CurrencyService;

  beforeEach(() => {
    mocks.mockDoc.mockReturnValue({});
    mocks.mockSetDoc.mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [CurrencyService, { provide: Firestore, useValue: {} }],
    });

    service = TestBed.inject(CurrencyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrencyData$', () => {
    it('returns EMPTY_CURRENCY_DATA when the document does not exist', async () => {
      mocks.mockDocData.mockReturnValue(of(undefined));

      const result = await firstValueFrom(service.getCurrencyData$('uid-1'));
      expect(result).toEqual(EMPTY_CURRENCY_DATA);
    });

    it('defaults missing fields to 0', async () => {
      mocks.mockDocData.mockReturnValue(of({ usd: 100 }));

      const result = await firstValueFrom(service.getCurrencyData$('uid-1'));
      expect(result).toEqual({
        ...EMPTY_CURRENCY_DATA,
        holdings: {
          ...EMPTY_CURRENCY_HOLDINGS,
          usd: { cash: 100, card: 0 },
        },
      });
    });

    it('returns full data when all fields are present', async () => {
      mocks.mockDocData.mockReturnValue(of(FULL_DATA));

      const result = await firstValueFrom(service.getCurrencyData$('uid-1'));
      expect(result).toEqual(FULL_DATA);
    });

    it('returns an Observable', () => {
      mocks.mockDocData.mockReturnValue(of(undefined));
      expect(isObservable(service.getCurrencyData$('uid-1'))).toBe(true);
    });
  });

  describe('updateHoldings', () => {
    it('returns an Observable', () => {
      expect(
        isObservable(
          service.updateHoldings('uid-1', {
            uah: { cash: 0, card: 0 },
            usd: { cash: 200, card: 0 },
            eur: { cash: 0, card: 0 },
          }),
        ),
      ).toBe(true);
    });

    it('writes holdings with merge enabled', async () => {
      await firstValueFrom(
        service.updateHoldings('uid-1', {
          uah: { cash: 0, card: 0 },
          usd: { cash: 0, card: 0 },
          eur: { cash: 250, card: 50 },
        }),
      );
      expect(mocks.mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        {
          holdings: {
            uah: { cash: 0, card: 0 },
            usd: { cash: 0, card: 0 },
            eur: { cash: 250, card: 50 },
          },
          uah: 0,
          usd: 0,
          eur: 300,
        },
        { merge: true },
      );
    });
  });

  describe('updateRates', () => {
    it('writes rates with merge enabled', async () => {
      await firstValueFrom(service.updateRates('uid-1', { usdToUah: 41.7 }));
      expect(mocks.mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        { usdToUah: 41.7 },
        { merge: true },
      );
    });
  });
});
