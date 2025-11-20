import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'products/all',
  },
  {
    path: 'products/:category', // route component input binding
    loadComponent: () => import('./features/products-grid/products-grid') // lazy loading
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./features/my-wishlist/my-wishlist')
  },
];
