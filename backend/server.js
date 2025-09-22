// Różnica między importem ES Modules (import/export) a CommonJS (require):
//
// 1. CommonJS (CJS - `require`):
//    - To tradycyjny system modułów w Node.js. Używa składni: `const express = require('express');`.
//    - Działa synchronicznie, co oznacza, że ładowanie modułu blokuje wykonanie reszty kodu do czasu jego wczytania.
//    - Jest domyślnym systemem w Node.js, jeśli nie skonfigurowano inaczej.
//
// 2. ES Modules (ESM - `import`):
//    - To nowoczesny standard JavaScript, używany również w przeglądarkach. Składnia: `import express from "express";`.
//    - Działa asynchronicznie, co jest bardziej wydajne. Pozwala też na statyczną analizę kodu (np. tree-shaking).
//    - Ten plik używa składni `import`, ponieważ jest traktowany jako ES Module.
//
// Gdzie to się ustawia?
// Głównym sposobem jest dodanie pola `"type": "module"` w pliku `package.json` w tym samym folderze.
// To ustawienie informuje Node.js, aby wszystkie pliki `.js` w projekcie traktował jako ES Modules.

// Importowanie niezbędnych modułów
import express from "express"; // Framework do tworzenia aplikacji webowych w Node.js
import cors from "cors"; // Middleware do obsługi Cross-Origin Resource Sharing
import cookieParser from "cookie-parser"; // Middleware do parsowania ciasteczek
import expressSession from "express-session"; // Middleware do zarządzania sesjami
import fs from "fs/promises"; // Moduł systemu plików (w wersji z obsługą promisów ['funkcji asynchronicznych']) do operacji na plikach

// --- Konfiguracja serwera ---

const PORT = 3000; // Port, na którym serwer będzie nasłuchiwał
const app = express(); // Inicjalizacja aplikacji Express
const USERS_FILE = "./users.json"; // Ścieżka do pliku przechowującego dane użytkowników

// --- Konfiguracja Middleware ---

// Umożliwia żądania z serwera deweloperskiego Angulara (localhost:4200)
// `credentials: true` pozwala na przesyłanie ciasteczek i nagłówków autoryzacyjnych, bez tego nasze ciasteczka nie będą działały
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  })
);

// Middleware do parsowania ciała żądań w formacie JSON
app.use(express.json());

// Middleware do parsowania ciasteczek z żądań
app.use(cookieParser());

// Konfiguracja middleware do obsługi sesji
app.use(
  expressSession({
    // UWAGA: W środowisku produkcyjnym 'secret' powinien być długim, losowym ciągiem znaków
    // i przechowywanym jako zmienna środowiskowa, a nie na stałe w kodzie.
    secret: "secret_key",
    resave: false, // Nie zapisuj sesji, jeśli nie została zmodyfikowana
    saveUninitialized: false, // Nie twórz sesji, dopóki coś nie zostanie w niej zapisane
    cookie: { secure: false }, // W produkcji ustaw na 'true', jeśli używasz HTTPS
  })
);

// --- Definicje Endpointów (tras) ---

/**
 * @route POST /auth/register
 * @description Rejestruje nowego użytkownika.
 * Sprawdza, czy wszystkie pola zostały podane i czy użytkownik o danym loginie już nie istnieje.
 * Jeśli walidacja przejdzie pomyślnie, dodaje nowego użytkownika do pliku users.json.
 */
app.post("/auth/register", async (req, res) => {
  const { name, surname, login, password } = req.body;

  // Walidacja, czy wszystkie wymagane dane zostały przesłane
  if (!name || !surname || !login || !password) {
    return res.status(400).send({ message: "Wszystkie pola są wymagane." });
  }

  try {
    // Odczytanie istniejących użytkowników z pliku
    const usersData = await fs.readFile(USERS_FILE, "utf8");
    const users = JSON.parse(usersData);

    // Sprawdzenie, czy użytkownik o podanym loginie już istnieje
    if (users.find((user) => user.login === login)) {
      return res
        .status(409)
        .send({ message: "Użytkownik o tym loginie już istnieje." });
    }

    // Tworzenie obiektu nowego użytkownika
    // Login i password to nasze zmienne pobrane z formularza, w pliku json ich nazwa domyślnie stanie się kluczem a zawartość wartością
    // Dla name oraz surname ustawiamy klucze do których wartości zmiennych są przypisywane
    const newUser = {
      login,
      password,
      firstName: name,
      lastName: surname,
    };

    users.push(newUser);

    // Zapisanie zaktualizowanej listy użytkowników do pliku
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));

    res.status(201).send({ message: "Rejestracja zakończona sukcesem." });
  } catch (error) {
    console.error("Błąd serwera podczas rejestracji:", error);
    res.status(500).send({ message: "Wystąpił błąd serwera." });
  }
});

/**
 * @route POST /auth/login
 * @description Loguje użytkownika.
 * Sprawdza, czy login i hasło pasują do istniejącego użytkownika.
 * Jeśli tak, tworzy sesję dla tego użytkownika.
 */
app.post("/auth/login", async (req, res) => {
  const { login, password } = req.body;
  try {
    const usersData = await fs.readFile(USERS_FILE, "utf8");
    const users = JSON.parse(usersData);

    // Wyszukanie użytkownika na podstawie loginu i hasła
    const user = users.find(
      (u) => u.login === login && u.password === password
    );

    if (user) {
      // Zapisanie danych użytkownika w obiekcie sesji
      req.session.user = {
        login: user.login,
        firstName: user.firstName,
        lastName: user.lastName,
      };
      res
        .status(200)
        .send({ message: "Zalogowano pomyślnie", user: req.session.user });
    } else {
      res.status(401).send({ message: "Nieprawidłowy login lub hasło." });
    }
  } catch (error) {
    console.error("Błąd serwera podczas logowania:", error);
    res.status(500).send({ message: "Wystąpił błąd serwera." });
  }
});

/**
 * @route POST /auth/logout
 * @description Wylogowuje użytkownika.
 * Niszczy aktywną sesję i usuwa ciasteczko sesji.
 * Zapisuje ciasteczko z datą ostatniego wylogowania.
 */
app.post("/auth/logout", (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.status(400).send({ message: "Brak aktywnej sesji." });
  }
  const cookieName = `lastLogged_${user.login}`;

  // Zniszczenie sesji na serwerze
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send({ message: "Wylogowanie nie powiodło się." });
    }
    const lastLogged = new Date().toISOString();
    res.cookie(cookieName, lastLogged); // Ustawia ciasteczko z datą ostatniego wylogowania
    res.clearCookie("connect.sid"); // Usuwa ciasteczko sesji po stronie klienta
    res.status(200).send({ message: "Wylogowano pomyślnie." });
  });
});

/**
 * Middleware autoryzacyjne.
 * Sprawdza, czy w sesji istnieje obiekt użytkownika.
 * Jeśli tak, przepuszcza żądanie dalej. W przeciwnym razie zwraca błąd 401.
 */
function authMiddleware(req, res, next) {
  if (req.session.user) {
    next(); // Użytkownik jest zalogowany, kontynuuj
  } else {
    res.status(401).send("Dostęp zabroniony. Zaloguj się."); // Użytkownik nie jest zalogowany
  }
}

/**
 * @route GET /api/user
 * @description Pobiera dane zalogowanego użytkownika.
 * Trasa jest chroniona przez `authMiddleware`.
 * Zwraca imię, nazwisko oraz datę ostatniego wylogowania (jeśli istnieje).
 */
app.get("/api/user", authMiddleware, (req, res) => {
  const { login, firstName, lastName } = req.session.user;
  const cookieName = `lastLogged_${login}`;
  const lastLogged = req.cookies[cookieName] || null;

  res.status(200).send({
    firstName,
    lastName,
    lastLogged,
  });
});

// --- Uruchomienie serwera ---

// Serwer nasłuchuje na zdefiniowanym porcie
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
