import { computed, inject, Injectable } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  CURRENCY_META,
  CurrencyCode,
  CurrencyHoldings,
  EMPTY_CURRENCY_HOLDINGS,
  EMPTY_CURRENCY_DATA,
  ExchangeRates,
} from '../../core/models/currency.model';
import { AuthService } from '../../core/services/auth.service';
import {
  buildPortfolioSegments,
  calcHoldingTotal,
  calcHoldingValueInUah,
  calcPortfolioShare,
  calcPortfolioTotals,
} from './currency.helpers';
import { CurrencyService } from './currency.service';

@Injectable({ providedIn: 'root' })
export class CurrencyFacade {
  private readonly authService = inject(AuthService);
  private readonly currencyService = inject(CurrencyService);

  private readonly uid = computed(() => this.authService.currentUser()?.uid ?? null);

  readonly currencyData = toSignal(
    toObservable(this.uid).pipe(
      switchMap((uid) =>
        uid !== null
          ? this.currencyService
              .getCurrencyData$(uid)
              .pipe(catchError(() => of(EMPTY_CURRENCY_DATA)))
          : of(EMPTY_CURRENCY_DATA),
      ),
    ),
  );

  readonly isLoading = computed(() => this.currencyData() === undefined);

  readonly holdings = computed<CurrencyHoldings>(() => {
    const data = this.currencyData() ?? EMPTY_CURRENCY_DATA;
    return data.holdings ?? EMPTY_CURRENCY_HOLDINGS;
  });

  readonly rates = computed<ExchangeRates>(() => {
    const data = this.currencyData() ?? EMPTY_CURRENCY_DATA;
    return {
      usdToUah: data.usdToUah,
      eurToUah: data.eurToUah,
      eurToUsd: data.eurToUsd,
    };
  });

  readonly meta = CURRENCY_META;

  readonly totals = computed(() => calcPortfolioTotals(this.currencyData() ?? EMPTY_CURRENCY_DATA));

  readonly chartSegments = computed(() => buildPortfolioSegments(this.holdings(), this.rates()));

  shareFor(code: CurrencyCode): number {
    return calcPortfolioShare(code, this.holdings(), this.rates());
  }

  valueInUah(code: CurrencyCode): number {
    const holdings = this.holdings();
    const amount = calcHoldingTotal(
      code === 'UAH' ? holdings.uah : code === 'USD' ? holdings.usd : holdings.eur,
    );
    return calcHoldingValueInUah(code, amount, this.rates());
  }

  totalFor(code: CurrencyCode): number {
    const holdings = this.holdings();
    return calcHoldingTotal(
      code === 'UAH' ? holdings.uah : code === 'USD' ? holdings.usd : holdings.eur,
    );
  }

  updateHoldings(payload: CurrencyHoldings): ReturnType<CurrencyService['updateHoldings']> {
    const uid = this.uid();
    if (uid === null) throw new Error('Not authenticated');
    return this.currencyService.updateHoldings(uid, payload);
  }

  updateRates(payload: Partial<ExchangeRates>): ReturnType<CurrencyService['updateRates']> {
    const uid = this.uid();
    if (uid === null) throw new Error('Not authenticated');
    return this.currencyService.updateRates(uid, payload);
  }

  /** Fetch live rates from API and persist them. Returns the fetched rates. */
  fetchAndSaveRates(): ReturnType<CurrencyService['fetchLiveRates']> {
    const uid = this.uid();
    if (uid === null) throw new Error('Not authenticated');
    return this.currencyService
      .fetchLiveRates()
      .pipe(
        switchMap((rates) =>
          this.currencyService.updateRates(uid, rates).pipe(switchMap(() => of(rates))),
        ),
      );
  }
}
