import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CurrencyData,
  CurrencyHoldings,
  EMPTY_CURRENCY_DATA,
  ExchangeRates,
} from '../../core/models/currency.model';

interface OpenExchangeRatesResponse {
  base_code: string;
  rates: Record<string, number>;
}

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(Injector);
  private readonly http = inject(HttpClient);

  getCurrencyData$(uid: string): Observable<CurrencyData> {
    const ref = doc(this.firestore, `currency/${uid}`);
    return runInInjectionContext(this.injector, () =>
      (docData(ref) as Observable<Partial<CurrencyData> | undefined>).pipe(
        map((data) => ({
          uah: data?.uah ?? 0,
          usd: data?.usd ?? 0,
          eur: data?.eur ?? 0,
          usdToUah: data?.usdToUah ?? 0,
          eurToUah: data?.eurToUah ?? 0,
          eurToUsd: data?.eurToUsd ?? 0,
        })),
      ),
    );
  }

  setCurrencyData(uid: string, payload: CurrencyData): Observable<void> {
    const ref = doc(this.firestore, `currency/${uid}`);
    return from(setDoc(ref, payload, { merge: true }));
  }

  updateHoldings(uid: string, holdings: Partial<CurrencyHoldings>): Observable<void> {
    const ref = doc(this.firestore, `currency/${uid}`);
    return from(setDoc(ref, holdings, { merge: true }));
  }

  updateRates(uid: string, rates: Partial<ExchangeRates>): Observable<void> {
    const ref = doc(this.firestore, `currency/${uid}`);
    return from(setDoc(ref, rates, { merge: true }));
  }

  /** Fetch live USD/EUR/UAH rates from open.er-api.com (free, no API key). */
  fetchLiveRates(): Observable<ExchangeRates> {
    return this.http.get<OpenExchangeRatesResponse>('https://open.er-api.com/v6/latest/USD').pipe(
      map((res) => {
        const r = res.rates;
        return {
          usdToUah: r['UAH'],
          eurToUah: r['UAH'] / r['EUR'],
          eurToUsd: 1 / r['EUR'],
        };
      }),
    );
  }
}

export { EMPTY_CURRENCY_DATA };
