import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DEFAULT_UI_PREFERENCES, UiPreferences } from '../models/ui-preferences.model';
import { FIRESTORE_PATHS } from '../constants/firestore.constants';

@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(Injector);

  getUiPreferences$(uid: string): Observable<UiPreferences> {
    const ref = doc(this.firestore, FIRESTORE_PATHS.userPreferences(uid));

    return runInInjectionContext(this.injector, () =>
      (docData(ref) as Observable<Partial<UiPreferences> | undefined>).pipe(
        map((data) => ({
          locale: data?.locale === 'uk' ? 'uk' : DEFAULT_UI_PREFERENCES.locale,
        })),
      ),
    );
  }

  updateUiPreferences(uid: string, payload: Partial<UiPreferences>): Observable<void> {
    const ref = doc(this.firestore, FIRESTORE_PATHS.userPreferences(uid));
    return from(setDoc(ref, payload, { merge: true }));
  }
}
