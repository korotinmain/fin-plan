import { Routes } from '@angular/router';

export const sourceRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./sources-page/sources-page.component').then(
        (m) => m.SourcesPageComponent,
      ),
    title: 'Sources — FinPlan',
  },
];
