# AGENTS

This file guides contributors and agents working on the shopping-list app.

## Project Goal
Build a simple, reliable shared shopping list for a family, with real-time sync
between two users (wife and husband). Start with web (Expo + React Native Web),
then reuse the same code for Android/iOS later.

## Non-Goals (MVP)
- No AI features or smart parsing.
- No auto-categories or store-based grouping.
- No localization UI yet (only one language for now), but structure strings for
  future i18n.
- No custom backend server.
- No mobile release work until web MVP is done.

## Tech Stack
- React Native + Expo with web support
- Firebase Authentication (email/password)
- Cloud Firestore
- JavaScript only (no TypeScript)

## Data Model (proposed)
users/{uid}:
  - email
  - createdAt

lists/{listId}:
  - name
  - ownerUid
  - memberUids: string[] (owner + participants)
  - createdAt

lists/{listId}/items/{itemId}:
  - text
  - done: boolean
  - createdAt
  - createdByUid

invites/{inviteId}:
  - listId
  - fromUid
  - toEmailLower
  - status: "pending" | "accepted" | "declined"
  - createdAt

## UI Screens
- Auth: Login / Register
- Lists: list of lists
- List details: list items
- Invites: incoming invites

## Architecture Constraints
- Use `t('key')` for all UI strings (prepare for i18n).
- Any categories/statuses in data should be stored as codes.
- Folder structure:
  src/
    navigation/
    screens/
      Auth/
      Lists/
      Invites/
    lib/
    components/

## Task List (Detailed)

SHOPPING LIST TASKS (RU / EN)

SL-1 Project structure
SL-1 RU — Структура проекта
- Создать папку src.
- Вынести логику из App.js.
- Создать папки: navigation, screens/Auth, screens/Lists, lib, components.

SL-1 EN — Project structure
- Create src folder.
- Move logic out of App.js.
- Create folders: navigation, screens/Auth, screens/Lists, lib, components.

--------------------------------------------------

SL-2 App navigation setup
SL-2 RU — Настройка навигации приложения
- Установить React Navigation.
- Создать RootNavigator.
- AuthStack: Login, Register.
- AppStack: Lists, ListDetails.

SL-2 EN — App navigation setup
- Install React Navigation.
- Create RootNavigator.
- AuthStack: Login, Register.
- AppStack: Lists, ListDetails.

--------------------------------------------------

SL-3 Auth screens (UI only)
SL-3 RU — Экраны авторизации (только UI)
- UI экрана Login.
- UI экрана Register.
- Навигация между экранами.

SL-3 EN — Auth screens (UI only)
- Login screen UI.
- Register screen UI.
- Navigation between screens.

--------------------------------------------------

SL-4 Firebase project setup
SL-4 RU — Настройка Firebase проекта
- Создать Firebase проект.
- Включить Email/Password аутентификацию.
- Создать Firestore (регион EU).

SL-4 EN — Firebase project setup
- Create Firebase project.
- Enable Email/Password authentication.
- Create Firestore (EU region).

--------------------------------------------------

SL-5 Firebase SDK integration
SL-5 RU — Подключение Firebase SDK
- Установить пакет firebase.
- Создать src/lib/firebase.js.
- Инициализировать app, auth и firestore.

SL-5 EN — Firebase SDK integration
- Install firebase package.
- Create src/lib/firebase.js.
- Initialize app, auth and firestore.

--------------------------------------------------

SL-6 Authentication logic
SL-6 RU — Логика авторизации
- Регистрация пользователя.
- Логин пользователя.
- Выход из аккаунта.
- Логика onAuthStateChanged.

SL-6 EN — Authentication logic
- Register user.
- Login user.
- Logout.
- onAuthStateChanged logic.

--------------------------------------------------

SL-7 Firestore data model
SL-7 RU — Модель данных Firestore
- Коллекция users.
- Коллекция lists.
- Подколлекция items.
- Массив members для общих списков.

SL-7 EN — Firestore data model
- users collection.
- lists collection.
- items subcollection.
- members array for shared lists.

--------------------------------------------------

SL-8 Lists screen
SL-8 RU — Экран списков
- Показать списки пользователя.
- Создание нового списка.
- Переименование / удаление (опционально).

SL-8 EN — Lists screen
- Show user lists.
- Create new list.
- Rename / delete list (optional).

--------------------------------------------------

SL-9 List details (items)
SL-9 RU — Экран списка товаров
- Realtime-обновление товаров.
- Добавление товара.
- Переключение статуса «куплено».
- Удаление товара.
- Сортировка: некупленные сверху.

SL-9 EN — List details (items)
- Realtime items.
- Add item.
- Toggle done state.
- Delete item.
- Sort undone items first.

--------------------------------------------------

SL-10 List sharing (invites)
SL-10 RU — Общий доступ к спискам
- Приглашение по email.
- Принятие приглашения.
- Добавление пользователя в members.
- Firestore listeners.
- Синхронизация данных между пользователями.

SL-10 EN — List sharing (invites)
- Invite by email.
- Accept invite.
- Add user to list members.
- Firestore listeners.
- Sync data between users.

--------------------------------------------------

SL-11 Realtime sync
SL-11 RU — Realtime синхронизация


SL-11 EN — Realtime sync


--------------------------------------------------

SL-12 Firestore security rules
SL-12 RU — Правила безопасности Firestore
- Доступ только для участников списка.
- Защита приглашений.

SL-12 EN — Firestore security rules
- Access only for list members.
- Protect invites.

--------------------------------------------------

SL-13 Web build
SL-13 RU — Веб-сборка
- Экспорт веб-версии Expo.
- Проверка роутинга.
- Тест в браузере и на телефоне.

SL-13 EN — Web build
- Expo web export.
- Routing check.
- Browser and mobile testing.

--------------------------------------------------

SL-14 GitHub Pages deploy
SL-14 RU — Деплой на GitHub Pages
- Настройка GitHub Pages.
- Опционально: GitHub Actions.

SL-14 EN — GitHub Pages deploy
- Setup GitHub Pages.
- Optional GitHub Actions.

--------------------------------------------------

SL-15 Privacy policy & support page
SL-15 RU — Privacy Policy и Support
- Страница Privacy Policy.
- Страница Support.
- Хостинг страниц.

SL-15 EN — Privacy policy & support page
- Privacy policy page.
- Support page.
- Hosting.

--------------------------------------------------

SL-16 Input parsing (no AI)
SL-16 RU — Умный ввод без ИИ
- Разбор текстового ввода.
- Дедупликация товаров.
- Определение количества.

SL-16 EN — Input parsing (no AI)
- Parse text input.
- Deduplicate items.
- Detect quantities.

--------------------------------------------------

SL-17 Categories
SL-17 RU — Категории товаров
- Коды категорий.
- Группировка товаров.
- Ручное изменение категории.

SL-17 EN — Categories
- Category codes.
- Item grouping.
- Manual category change.

--------------------------------------------------

SL-18 AI integration
SL-18 RU — Интеграция ИИ
- Backend endpoint.
- Структурированный JSON.
- Fallback без ИИ.

SL-18 EN — AI integration
- Backend endpoint.
- Structured JSON.
- Fallback without AI.

--------------------------------------------------

SL-19 i18n
SL-19 RU — Мультиязычность
- Настройка i18n.
- Языки: RU / DE / EN.
- Переключение языка.

SL-19 EN — Internationalization (i18n)
- i18n setup.
- RU / DE / EN languages.
- Language switch.

- Language switch.

## Release Notes
Web hosting planned for GitHub Pages after MVP. Mobile releases later via Expo/EAS.
