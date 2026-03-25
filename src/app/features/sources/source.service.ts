import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EMPTY_SOURCE_BALANCE, SourceBalance } from '../../core/models/source.model';
import { FIRESTORE_PATHS } from '../../core/constants/firestore.constants';

@Injectable({ providedIn: 'root' })
export class SourceService {
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(Injector);

  /**
   * Returns an observable of the user's source balances.
   * Stored as a single document at sources/{uid}.
   * Returns EMPTY_SOURCE_BALANCE when no document exists yet.
   *
   * runInInjectionContext is required because docData() calls inject()
   * internally and would error when called inside a switchMap callback.
   */
  getBalances$(uid: string): Observable<SourceBalance> {
    const ref = doc(this.firestore, FIRESTORE_PATHS.sources(uid));
    return runInInjectionContext(this.injector, () =>
      (docData(ref) as Observable<Partial<SourceBalance> | undefined>).pipe(
        map((data) => ({
          cashUsd: data?.cashUsd ?? 0,
          cardUsd: data?.cardUsd ?? 0,
          cardUah: data?.cardUah ?? 0,
          cashUah: data?.cashUah ?? 0,
        })),
      ),
    );
  }

  /**
   * Persists the full source balance map (upsert via merge).
   */
  setBalances(uid: string, balances: SourceBalance): Observable<void> {
    const ref = doc(this.firestore, FIRESTORE_PATHS.sources(uid));
    return from(setDoc(ref, balances, { merge: true }));
  }

  /**
   * Updates a single source's balance without overwriting others.
   */
  updateSource(uid: string, partial: Partial<SourceBalance>): Observable<void> {
    const ref = doc(this.firestore, FIRESTORE_PATHS.sources(uid));
    return from(setDoc(ref, partial, { merge: true }));
  }
}

export { EMPTY_SOURCE_BALANCE };
