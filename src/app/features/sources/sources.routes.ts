import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';

export const sourceRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./sources-page/sources-page.component').then((m) => m.SourcesPageComponent),
    title: () => inject(I18nService).translate('route.sourcesTitle'),
  },
];
