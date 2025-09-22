import { Component, inject } from '@angular/core';
import { HttpApi } from '../http-api';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../user';

/**
 * Komponent strony rejestracji.
 * Umożliwia nowym użytkownikom rejestrację
 */
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule,RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  httpApi = inject(HttpApi);
  router = inject(Router);

  // Formularz rejestracji z walidacją
  loginForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    surname: new FormControl('', [Validators.required]),
    login: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  /**
   * Obsługuje wysłanie formularza rejestracji.
   * Po pomyślnej rejestracji przekierowuje na stronę logowania.
   * W przypadku błędu wyświetla go w konsoli.
   */
  async onSubmit() {
    if (this.loginForm.valid) {
      try {
        await this.httpApi.register(this.loginForm.value as User);
        this.router.navigate(['/login']);
      } catch (err) {
        console.error('Błąd rejestracji', err);
        // Tutaj można dodać obsługę błędów w UI, np. wyświetlenie komunikatu
      }
    }
  }
}
