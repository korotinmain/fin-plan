import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';

export const expectedFundsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./expected-funds-page/expected-funds-page.component').then(
        (m) => m.ExpectedFundsPageComponent,
      ),
    title: () => inject(I18nService).translate('route.expectedFundsTitle'),
  },
];
