import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { I18nService } from './core/services/i18n.service';

export const routes: Routes = [
  // ─── Public: auth (redirect to dashboard if already signed in) ───────────
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },

  // ─── Protected: app shell ────────────────────────────────────────────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard-page.component').then(
            (m) => m.DashboardPageComponent,
          ),
        title: () => inject(I18nService).translate('route.dashboardTitle'),
      },
      {
        path: 'sources',
        loadChildren: () => import('./features/sources/sources.routes').then((m) => m.sourceRoutes),
      },
      {
        path: 'expected-funds',
        loadChildren: () =>
          import('./features/expected-funds/expected-funds.routes').then(
            (m) => m.expectedFundsRoutes,
          ),
      },
      {
        path: 'exchange-ops',
        loadChildren: () =>
          import('./features/operations/operations.routes').then((m) => m.operationsRoutes),
        title: () => inject(I18nService).translate('route.exchangeOpsTitle'),
      },
      {
        path: 'goals',
        loadChildren: () => import('./features/goals/goals.routes').then((m) => m.goalRoutes),
      },
      {
        path: 'currency',
        loadChildren: () =>
          import('./features/currency/currency.routes').then((m) => m.currencyRoutes),
      },
    ],
  },

  // ─── Wildcard ────────────────────────────────────────────────────────────
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
