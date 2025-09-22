# Aplikacja z Autoryzacją Użytkownika (Angular + Node.js)

Prosta aplikacja typu SPA (Single Page Application) demonstrująca proces logowania i rejestracji użytkownika. Frontend został zbudowany w oparciu o Angular, natomiast backend to prosty serwer Node.js z użyciem frameworka Express.

## Architektura i Działanie Aplikacji

Aplikacja składa się z dwóch głównych części: `frontend` i `backend`.

### Backend

Prosty serwer oparty na **Node.js** i **Express**, który udostępnia API do autoryzacji.

- `server.js`: Główny plik serwera. Odpowiada za obsługę żądań HTTP.
- `users.json`: Plik pełniący rolę prostej bazy danych do przechowywania informacji o użytkownikach.
- **Sesje:** Backend wykorzystuje `express-session` do zarządzania sesjami użytkowników za pomocą ciasteczek (cookies).

### Frontend

Aplikacja kliencka napisana w **Angular** w architekturze standalone.

- **Komponenty:** `Login`, `Register`, `Welcome`.
- **Serwis:** `HttpApiService` do komunikacji z backendem.
- **Routing (`app.routes.ts`):** Definiuje ścieżki i chroni dostęp do komponentu `Welcome` za pomocą `authGuard`.
- **Guard (`auth-guard.ts`):** Sprawdza, czy użytkownik jest zalogowany przed udzieleniem dostępu do chronionej trasy.

## Tworzenie Aplikacji od Podstaw

Poniżej znajduje się instrukcja krok po kroku, jak odtworzyć ten projekt.

### Wymagania Wstępne

- Zainstalowany [Node.js](https://nodejs.org/)
- Zainstalowany [Angular CLI](https://angular.dev/tools/cli): `npm install -g @angular/cli`

### Krok 1: Inicjalizacja Projektu Backendowego

1.  **Stwórz folder i zainicjuj projekt npm:**

    ```bash
    mkdir backend
    cd backend
    npm init -y
    ```

    **Wyjaśnienie:** `npm init -y` tworzy domyślny plik `package.json`, który zarządza zależnościami i skryptami projektu.

2.  **Zainstaluj potrzebne zależności:**

    ```bash
    npm install express express-session cookie-parser cors
    ```

    **Wyjaśnienie zależności:**

    - `express`: Framework do budowy serwera i obsługi API.
    - `express-session`: Middleware do zarządzania sesjami użytkowników.
    - `cookie-parser`: Middleware do zarządzania ciastkami.
    - `cors`: Middleware pozwalające na żądania z innej domeny (niezbędne do komunikacji między frontendem na porcie 4200 a backendem na porcie 3000).

3.  **Stwórz pliki `server.js` oraz `users.json`.**

### Krok 2: Inicjalizacja Projektu Frontendowego

1.  **Utwórz nową aplikację Angular w głównym folderze projektu:**

    ```bash
    ng new frontend --standalone --routing --style=css
    ```

    **Wyjaśnienie flag:**

    - `--standalone`: Tworzy aplikację w architekturze komponentów samodzielnych.
    - `--routing`: Konfiguruje podstawowy routing.
    - `--style=css`: Ustawia CSS jako domyślny język stylów.

2.  \*\*Dodaj Bootstrap (opcjonalnie, dla stylizacji):
    ```bash
    cd frontend
    ng add @ng-bootstrap/ng-bootstrap
    ```
    **Wyjaśnienie:** `ng add` automatycznie instaluje i konfiguruje bibliotekę w projekcie Angular.

### Krok 3: Generowanie Elementów Aplikacji (Frontend)

Użyj Angular CLI, aby wygenerować szkielety potrzebnych elementów.

1.  **Komponenty:**
    ```bash
    ng generate component login --standalone
    ng generate component register --standalone
    ng generate component welcome --standalone
    ```
2.  **Serwis:**
    ```bash
    ng generate service http-api
    ```
3.  **Guard:**
    ```bash
    ng generate guard auth --functional
    ```

### Krok 4: Implementacja Logiki

#### Backend (`server.js`)

- **Co:** Zaimportuj biblioteki (`express`, `session`, `bcrypt`, `cors`, `fs`). Skonfiguruj `cors` i middleware `express.json()` oraz `express-session`.
- **Dlaczego:** Przygotowuje to serwer do parsowania danych JSON, obsługi sesji i zezwalania na żądania z frontendu.

- **Endpoint `POST /auth/register`:**

  - **Co:** Odczytuje `users.json`, sprawdza, czy użytkownik już istnieje. Jeśli nie, haszuje hasło za pomocą `bcrypt.hash()` i zapisuje nowego użytkownika do pliku.
  - **Dlaczego:** Zapewnia bezpieczną rejestrację, unikając przechowywania haseł w formie jawnej.

- **Endpoint `POST /auth/login`:**

  - **Co:** Wyszukuje użytkownika po loginie. Jeśli istnieje, porównuje hasło z hashem w bazie za pomocą `bcrypt.compare()`. Po poprawnym logowaniu, dane użytkownika są zapisywane w `req.session`.
  - **Dlaczego:** Weryfikuje tożsamość użytkownika i rozpoczyna sesję, która będzie identyfikowana przez ciasteczko w przeglądarce.

- **Endpoint `GET /api/user`:**

  - **Co:** Sprawdza, czy w `req.session` istnieją dane zalogowanego użytkownika. Jeśli tak, zwraca je. W przeciwnym razie zwraca błąd 401 (Unauthorized).
  - **Dlaczego:** Umożliwia frontendowi weryfikację, czy sesja jest aktywna i pobranie danych zalogowanej osoby.

- **Endpoint `POST /auth/logout`:**
  - **Co:** Niszczy sesję za pomocą `req.session.destroy()`.
  - **Dlaczego:** Bezpiecznie kończy sesję użytkownika na serwerze.

#### Frontend

- **`http-api.service.ts`:**

  - **Co:** Zaimplementuj metody (`login`, `register`, `getCurrentUser`, `logout`), które używają `fetch` do wywoływania odpowiednich endpointów backendu. Pamiętaj o dodaniu opcji `credentials: 'include'` do `fetch`.
  - **Dlaczego:** Centralizuje całą komunikację z API w jednym miejscu. `credentials: 'include'` jest kluczowe, aby przeglądarka automatycznie wysyłała i odbierała ciasteczka sesyjne.

- **`app.routes.ts`:**

  - **Co:** Zdefiniuj tablicę `routes`. Ustaw przekierowanie z `''` do `login`. Przypisz ścieżki `/login`, `/register` i `/welcome` do odpowiednich komponentów. Do trasy `/welcome` dodaj `canActivate: [authGuard]`.
  - **Dlaczego:** Tworzy to mapę nawigacji aplikacji i zabezpiecza dostęp do strony powitalnej.

- **`auth.guard.ts`:**

  - **Co:** Wewnątrz funkcji wstrzyknij `HttpApi` i `Router`. W bloku `try...catch` wywołaj `httpApi.getCurrentUser()`. W `try` zwróć `true`. W `catch` przekieruj użytkownika do `/login` za pomocą `router.createUrlTree(['/login'])`.
  - **Dlaczego:** Działa jak strażnik, który przed wejściem na chronioną stronę pyta backend, czy sesja jest ważna. Jeśli nie, blokuje dostęp.

- **Komponenty `login` i `register`:**

  - **Co:** Użyj `ReactiveFormsModule` do zbudowania formularzy (`FormGroup`, `FormControl`). W metodzie `onSubmit()` wywołaj odpowiednią metodę z `HttpApiService`, a po sukcesie przekieruj użytkownika za pomocą `Router`.
  - **Dlaczego:** `ReactiveFormsModule` daje pełną kontrolę nad formularzem i jego walidacją w kodzie TypeScript.

- **`welcome.component.ts`:**
  - **Co:** W `ngOnInit` wywołaj `httpApi.getCurrentUser()`, aby pobrać dane i wyświetlić je w szablonie. Stwórz metodę `logout()`, która wywołuje `httpApi.logout()` i przekierowuje do strony logowania.
  - **Dlaczego:** Komponent musi pobrać swoje dane po załadowaniu, aby wyświetlić spersonalizowaną treść. Funkcja wylogowania pozwala zakończyć sesję.

### Krok 5: Uruchomienie Aplikacji

1.  **Uruchom serwer backend:**

    ```bash
    cd backend
    node server.js
    ```

2.  **Uruchom serwer frontend:**
    ```bash
    cd frontend
    ng serve
    ```

Aplikacja będzie dostępna pod adresem `http://localhost:4200/`.
