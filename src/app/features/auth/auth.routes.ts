import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
    title: () => inject(I18nService).translate('route.loginTitle'),
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then((m) => m.RegisterComponent),
    title: () => inject(I18nService).translate('route.registerTitle'),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
