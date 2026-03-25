import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { doc, docData, Firestore, writeBatch } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FIRESTORE_PATHS } from '../../core/constants/firestore.constants';
import { EMPTY_OPERATIONS_DOCUMENT, OperationRecord } from '../../core/models/operation.model';
import { SourceBalance } from '../../core/models/source.model';
import { sortOperationsDescending } from './operation.helpers';

@Injectable({ providedIn: 'root' })
export class OperationService {
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(Injector);

  getOperations$(uid: string): Observable<OperationRecord[]> {
    const ref = doc(this.firestore, FIRESTORE_PATHS.operations(uid));

    return runInInjectionContext(this.injector, () =>
      (docData(ref) as Observable<{ items?: OperationRecord[] } | undefined>).pipe(
        map((data) => sortOperationsDescending(data?.items ?? EMPTY_OPERATIONS_DOCUMENT.items)),
      ),
    );
  }

  recordOperation(
    uid: string,
    currentItems: OperationRecord[],
    nextRecord: OperationRecord,
    nextBalances: SourceBalance,
  ): Observable<void> {
    const operationsRef = doc(this.firestore, FIRESTORE_PATHS.operations(uid));
    const sourcesRef = doc(this.firestore, FIRESTORE_PATHS.sources(uid));
    const batch = writeBatch(this.firestore);

    batch.set(
      operationsRef,
      { items: sortOperationsDescending([nextRecord, ...currentItems]) },
      { merge: true },
    );
    batch.set(sourcesRef, nextBalances, { merge: true });

    return from(batch.commit()).pipe(map(() => undefined));
  }
}
