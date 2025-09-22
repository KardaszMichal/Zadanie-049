import { Component, inject } from '@angular/core';
import { HttpApi } from '../http-api';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/**
 * Komponent strony logowania.
 * Umożliwia użytkownikom logowanie się do aplikacji przy użyciu formularza.
 */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true,
})
export class Login {
  httpApi = inject(HttpApi);
  router = inject(Router);

  // Formularz logowania z walidacją
  loginForm = new FormGroup({
    login: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  /**
   * Obsługuje wysłanie formularza logowania.
   * Po pomyślnym zalogowaniu przekierowuje na stronę powitalną.
   * W przypadku błędu wyświetla go w konsoli.
   */
  async onSubmit() {
    if (this.loginForm.valid) {
      try {
        await this.httpApi.login(this.loginForm.value);
        this.router.navigate(['/welcome']);
      } catch (err) {
        console.error('Błąd logowania', err);
        // Tutaj można dodać obsługę błędów w UI, np. wyświetlenie komunikatu
      }
    }
  }
}
