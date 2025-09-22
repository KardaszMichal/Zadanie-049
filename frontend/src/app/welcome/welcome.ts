import { Component, inject, signal } from '@angular/core';
import { AuthenticatedUser, HttpApi } from '../http-api';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * Komponent strony powitalnej.
 * Wyświetla informacje o zalogowanym użytkowniku i pozwala na wylogowanie.
 */
@Component({
  selector: 'app-welcome',
  imports: [CommonModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
})
export class Welcome {
  // Sygnał przechowujący dane zalogowanego użytkownika lub null
  user = signal<AuthenticatedUser | null>(null);
  httpApi = inject(HttpApi);
  router = inject(Router);

  /**
   * Metoda cyklu życia komponentu, wywoływana po jego inicjalizacji.
   * Pobiera dane bieżącego użytkownika i ustawia je w sygnale `user`.
   * W przypadku błędu (np. brak sesji) przekierowuje na stronę logowania.
   */
  async ngOnInit(): Promise<void> {
    try {
      const currentUser = await this.httpApi.getCurrentUser();
      this.user.set(currentUser);
    } catch (error) {
      console.error('Błąd pobierania użytkownika', error);
      this.router.navigate(['/login']);
    }
  }

  /**
   * Obsługuje proces wylogowania.
   * Wywołuje metodę API do wylogowania i przekierowuje na stronę logowania.
   */
  async logout() {
    try {
      await this.httpApi.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Błąd wylogowania', error);
    }
  }
}
