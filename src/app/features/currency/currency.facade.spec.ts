import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  CurrencyData,
  EMPTY_CURRENCY_DATA,
  EMPTY_CURRENCY_HOLDINGS,
} from '../../core/models/currency.model';
import { AuthService } from '../../core/services/auth.service';
import { CurrencyFacade } from './currency.facade';
import { CurrencyService } from './currency.service';

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

describe('CurrencyFacade', () => {
  const mockUser = signal<{ uid: string } | null>(null);
  const currencyService = {
    getCurrencyData$: vi.fn().mockReturnValue(of(EMPTY_CURRENCY_DATA)),
    updateHoldings: vi.fn(),
    updateRates: vi.fn(),
    fetchLiveRates: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUser.set(null);
    currencyService.getCurrencyData$.mockReturnValue(of(EMPTY_CURRENCY_DATA));

    TestBed.configureTestingModule({
      providers: [
        CurrencyFacade,
        { provide: AuthService, useValue: { currentUser: mockUser } },
        { provide: CurrencyService, useValue: currencyService },
      ],
    });
  });

  it('should be created', () => {
    const facade = TestBed.inject(CurrencyFacade);
    expect(facade).toBeTruthy();
  });

  it('sets isLoading to false once data resolves', async () => {
    const facade = TestBed.inject(CurrencyFacade);
    await vi.waitFor(() => {
      expect(facade.isLoading()).toBe(false);
    });
  });

  it('returns empty holdings when unauthenticated', () => {
    const facade = TestBed.inject(CurrencyFacade);
    expect(facade.holdings()).toEqual(EMPTY_CURRENCY_HOLDINGS);
    expect(currencyService.getCurrencyData$).not.toHaveBeenCalled();
  });

  it('returns holdings from the service when authenticated', async () => {
    mockUser.set({ uid: 'uid-1' });
    currencyService.getCurrencyData$.mockReturnValue(of(FULL_DATA));

    const facade = TestBed.inject(CurrencyFacade);

    await vi.waitFor(() => {
      expect(currencyService.getCurrencyData$).toHaveBeenCalledWith('uid-1');
      expect(facade.holdings()).toEqual(FULL_DATA.holdings);
    });
  });

  it('returns zero totals when data is empty', () => {
    const facade = TestBed.inject(CurrencyFacade);
    expect(facade.totals()).toEqual({ totalUah: 0, totalUsd: 0, totalEur: 0 });
  });

  it('returns calculated totals for full data', async () => {
    mockUser.set({ uid: 'uid-1' });
    currencyService.getCurrencyData$.mockReturnValue(of(FULL_DATA));

    const facade = TestBed.inject(CurrencyFacade);

    await vi.waitFor(() => {
      expect(facade.totals()).toEqual({
        totalUah: 225610,
        totalUsd: 5436.3855,
        totalEur: 5104.2986,
      });
    });
  });

  it('returns 0 share for empty holdings', () => {
    const facade = TestBed.inject(CurrencyFacade);
    expect(facade.shareFor('USD')).toBe(0);
  });

  it('throws when updating rates while unauthenticated', () => {
    const facade = TestBed.inject(CurrencyFacade);
    expect(() => facade.updateRates({ usdToUah: 41.7 })).toThrow('Not authenticated');
  });
});
