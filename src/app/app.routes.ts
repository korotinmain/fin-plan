import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

export const routes: Routes = [
  // ─── Public: auth (redirect to dashboard if already signed in) ───────────
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },

  // ─── Protected: app shell ────────────────────────────────────────────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layout/shell/shell.component').then(
        (m) => m.ShellComponent,
      ),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard-placeholder.component').then(
            (m) => m.DashboardPlaceholderComponent,
          ),
        title: 'Dashboard — FinPlan',
      },
    ],
  },

  // ─── Wildcard ────────────────────────────────────────────────────────────
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
