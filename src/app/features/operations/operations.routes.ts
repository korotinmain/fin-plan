import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';

export const operationsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./operations-page/operations-page.component').then((m) => m.OperationsPageComponent),
    title: () => inject(I18nService).translate('route.exchangeOpsTitle'),
  },
];
