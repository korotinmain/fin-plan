import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FIRESTORE_PATHS } from '../../core/constants/firestore.constants';
import { EMPTY_EXPECTED_FUNDS_DOCUMENT, ExpectedFundRecord } from './expected-funds.data';

@Injectable({ providedIn: 'root' })
export class ExpectedFundsService {
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(Injector);

  getExpectedFunds$(uid: string): Observable<ExpectedFundRecord[]> {
    const ref = doc(this.firestore, FIRESTORE_PATHS.expectedFunds(uid));

    return runInInjectionContext(this.injector, () =>
      (docData(ref) as Observable<{ items?: ExpectedFundRecord[] } | undefined>).pipe(
        map((data) => data?.items ?? EMPTY_EXPECTED_FUNDS_DOCUMENT.items),
      ),
    );
  }

  setExpectedFunds(uid: string, items: ExpectedFundRecord[]): Observable<void> {
    const ref = doc(this.firestore, FIRESTORE_PATHS.expectedFunds(uid));
    return from(setDoc(ref, { items }, { merge: true }));
  }
}
