import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'products',
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products-grid/products-grid') // lazy loading
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./features/my-wishlist/my-wishlist')
  },
];
