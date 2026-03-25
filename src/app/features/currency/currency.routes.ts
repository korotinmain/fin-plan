import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';

export const currencyRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./currency-page/currency-page.component').then((m) => m.CurrencyPageComponent),
    title: () => inject(I18nService).translate('route.currencyTitle'),
  },
];
