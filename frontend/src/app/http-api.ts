import { Injectable } from '@angular/core';
import { User } from './user';

/**
 * Interfejs reprezentujący dane uwierzytelnionego użytkownika.
 */
export interface AuthenticatedUser {
  firstName: string;
  lastName: string;
  lastLogged: string | null;
}

/**
 * Serwis do obsługi komunikacji HTTP z backendem.
 * Odpowiada za wszystkie operacje API, takie jak logowanie, rejestracja,
 * pobieranie danych użytkownika i wylogowywanie.
 */
@Injectable({
  providedIn: 'root',
})
export class HttpApi {
  private authUrl = 'http://localhost:3000/auth';
  private apiUrl = 'http://localhost:3000/api';
  constructor() {}

  /**
   * Prywatna metoda pomocnicza do obsługi odpowiedzi HTTP.
   * Sprawdza, czy odpowiedź jest poprawna (status 2xx). Jeśli nie, rzuca błąd z komunikatem z serwera.
   * W przeciwnym razie parsuje odpowiedź jako JSON.
   * @template T - Oczekiwany typ danych w odpowiedzi.
   * @param response - Obiekt odpowiedzi Fetch API.
   * @returns Obietnica (Promise) z danymi w formacie T lub null, jeśli odpowiedź jest pusta.
   * @throws {Error} Gdy odpowiedź serwera nie jest poprawna (np. status 4xx, 5xx).
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'Wystąpił błąd serwera');
    }
    const text = await response.text();
    return text ? (JSON.parse(text) as T) : (null as T);
  }

  /**
   * Wysyła żądanie logowania do serwera.
   * @param userData - Dane logowania użytkownika (np. { login: '...', password: '...' }).
   * @returns Obietnica (Promise) z odpowiedzią serwera (np. dane zalogowanego użytkownika).
   */
  async login(userData: any): Promise<any> {
    const response = await fetch(`${this.authUrl}/login`, {
      method: 'POST',
      credentials: 'include', // Ważne dla obsługi ciasteczek sesyjnych
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return this.handleResponse<any>(response);
  }

  /**
   * Wysyła żądanie rejestracji nowego użytkownika.
   * @param User - Obiekt `User` z danymi nowego użytkownika.
   * @returns Obietnica (Promise) z odpowiedzią serwera.
   */
  async register(User: User): Promise<any> {
    const response = await fetch(`${this.authUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(User),
    });
    return this.handleResponse<any>(response);
  }

  /**
   * Pobiera dane aktualnie zalogowanego użytkownika na podstawie sesji.
   * Wymaga uwierzytelnienia (przesłania ciasteczka sesyjnego).
   * @returns Obietnica (Promise) z danymi uwierzytelnionego użytkownika (`AuthenticatedUser`).
   */
  async getCurrentUser(): Promise<AuthenticatedUser> {
    const response = await fetch(`${this.apiUrl}/user`, {
      method: 'GET',
      credentials: 'include', // Ważne dla obsługi ciasteczek sesyjnych
    });
    return this.handleResponse<AuthenticatedUser>(response);
  }

  /**
   * Wysyła żądanie wylogowania do serwera, kończąc sesję użytkownika.
   * @returns Obietnica (Promise) z odpowiedzią serwera.
   */
  async logout(): Promise<any> {
    const response = await fetch(`${this.authUrl}/logout`, {
      method: 'POST',
      credentials: 'include', // Ważne dla obsługi ciasteczek sesyjnych
    });
    return this.handleResponse<any>(response);
  }
}
