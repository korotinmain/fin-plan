import { Routes } from '@angular/router';

export const goalRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./goal-page/goal-page.component').then(
        (m) => m.GoalPageComponent,
      ),
    title: 'Goal — FinPlan',
  },
];
