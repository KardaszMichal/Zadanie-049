import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { HttpApi } from './http-api';

/**
 * Strażnik (guard) autoryzacji dla tras w aplikacji Angular.
 *
 * Ta funkcja CanActivateFn sprawdza, czy użytkownik jest zalogowany,
 * próbując pobrać dane bieżącego użytkownika za pomocą `HttpApi`.
 *
 * @param route - Aktywowana trasa.
 * @param state - Stan routera.
 * @returns `true`, jeśli użytkownik jest uwierzytelniony, w przeciwnym razie `UrlTree`
 *          przekierowujące do strony logowania.
 */
export const authGuard: CanActivateFn = async (route, state): Promise<boolean | UrlTree> => {
  const httpApi = inject(HttpApi);
  const router = inject(Router);
  try {
    const user = await httpApi.getCurrentUser();
    return !!user;
  } catch (err) {
    return router.createUrlTree(['/login']);
  }
};
