import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { Welcome } from './welcome/welcome';
import { authGuard } from './auth-guard';

/**
 * Definicja tras (routing) dla aplikacji.
 *
 * Tablica `routes` mapuje ścieżki URL na odpowiednie komponenty.
 * - Ścieżka główna ('') przekierowuje do '/login'.
 * - '/login' i '/register' są publicznie dostępne.
 * - '/welcome' jest chroniona przez `authGuard`, co oznacza, że dostęp do niej
 *   wymaga uwierzytelnienia użytkownika.
 */
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'welcome', component: Welcome, canActivate: [authGuard] },
];
