import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';

export const goalRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./goal-page/goal-page.component').then((m) => m.GoalPageComponent),
    title: () => inject(I18nService).translate('route.dashboardTitle'),
  },
];
