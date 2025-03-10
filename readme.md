# GoIT Node.js Homework 2 ÷ 6

## Description:

### REST API. Application based on Node.JS. It allows to create (sign up), delete, log in (authenticate, authorize, create/verify token, hash/verify passwords), log out user, generate/upload user's avatar. App also allows to: get, add, find, update, delete contact/s. Database with collections of users and contacts stored in MongoDB. Add and configure nodemailer (used Sendgrid.com as a SMTP service); send email to user with verification token, to verify email. Applied jest tests - e2e. Application was tested with Insomnia/Postman/Browser.

### Saved contacts, and users on MongoDB. Particular user has access only to its contacts (get, modify, add, delete).

### Used Mongoose library to work on MongoDB.

### Add contacts pagination.

### Now app allows also: CREATE (SIGN UP) / DELETE / LOGIN / LOGOUT / MODIFY (subscription, create token etc.) User.

### User auth, generate and validate tokens, password hashing and validating.

### Add jest tests: user sign up, login, logout, delete (tests e2e).

## INSTRUCTIONS to hw 2 ÷ 6 in polish:

Wykonaj forka tego repozytorium, aby wykonywać zadania domowe (2-6). Fork utworzy repozytorium na
Twoim koncie na http://github.com

Dodaj mentora jako collaboratora.

Dla każdego zadania domowego utwórz nową gałąź (branch).

- hw02 - on branch hw02-express
- hw03 - on branch hw03-mongodb
- hw04 - on branch he04-auth
- hw05 - on branch hw05-avatars
- hw06 - on branch hw02-email

Każda nowa gałąź dla zadania powinna być tworzona z gałęzi master.

Po zakończeniu wykonania zadania domowego na swojej gałęzi, należy zrobić pull request (PR).
Następnie dodaj mentora do przeglądu kodu. Dopiero po zatwierdzeniu PR przez mentora możesz scalić
gałąź z zadaniem domowym do gałęzi master.

Uważnie czytaj komentarze mentora. Popraw uwagi i zrób commit na gałęzi z zadaniem domowym. Zmiany
automatycznie pojawią się w PR po wysłaniu commitu z poprawkami na GitHub. Po poprawkach ponownie
dodaj mentora do przeglądu kodu.

- Podczas oddawania zadania domowego podaj link do PR.
- Kod JS jest czytelny i zrozumiały, do formatowania używany jest Prettier.

### Komendy:

- `npm start` &mdash; uruchamia serwer w trybie produkcyjnym
- `npm run start:dev` &mdash; uruchamia serwer w trybie deweloperskim (development)
- `npm run lint` &mdash; uruchamia sprawdzanie kodu z ESLint, należy wykonać przed każdym PR i
  poprawić wszystkie błędy lintera
- `npm lint:fix` &mdash; to samo co powyższe, ale również automatycznie poprawia proste błędy.
