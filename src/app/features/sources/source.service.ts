import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FIRESTORE_PATHS } from '../../core/constants/firestore.constants';
import { EMPTY_SOURCE_BALANCE, SourceBalance } from '../../core/models/source.model';

@Injectable({ providedIn: 'root' })
export class SourceService {
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(Injector);

  /**
   * Streams the latest saved SourceBalance from Firestore.
   * Returns EMPTY_SOURCE_BALANCE when the document does not yet exist.
   */
  getBalances$(uid: string): Observable<SourceBalance> {
    const ref = doc(this.firestore, FIRESTORE_PATHS.sources(uid));

    return runInInjectionContext(this.injector, () =>
      (docData(ref) as Observable<SourceBalance | undefined>).pipe(
        map((data) => data ?? EMPTY_SOURCE_BALANCE),
      ),
    );
  }

  /**
   * Persists a full SourceBalance snapshot to Firestore.
   * Called after every operation mutation to keep balances in sync.
   */
  saveBalances(uid: string, balances: SourceBalance): Observable<void> {
    const ref = doc(this.firestore, FIRESTORE_PATHS.sources(uid));
    return from(setDoc(ref, balances));
  }
}
