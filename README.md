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

SL-1 Project structure [DONE]
SL-1 RU — Структура проекта
- Создать папку src.
- Вынести логику из App.js.
- Создать папки: navigation, screens/Auth, screens/Lists, lib, components.

SL-1 EN — Project structure
- Create src folder.
- Move logic out of App.js.
- Create folders: navigation, screens/Auth, screens/Lists, lib, components.

--------------------------------------------------

SL-2 App navigation setup [DONE]
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

SL-3 Auth screens (UI only) [DONE]
SL-3 RU — Экраны авторизации (только UI)
- UI экрана Login.
- UI экрана Register.
- Навигация между экранами.

SL-3 EN — Auth screens (UI only)
- Login screen UI.
- Register screen UI.
- Navigation between screens.

--------------------------------------------------

SL-4 Firebase project setup [DONE]
SL-4 RU — Настройка Firebase проекта
- Создать Firebase проект.
- Включить Email/Password аутентификацию.
- Создать Firestore (регион EU).

SL-4 EN — Firebase project setup
- Create Firebase project.
- Enable Email/Password authentication.
- Create Firestore (EU region).

--------------------------------------------------

SL-5 Firebase SDK integration [DONE]
SL-5 RU — Подключение Firebase SDK
- Установить пакет firebase.
- Создать src/lib/firebase.js.
- Инициализировать app, auth и firestore.

SL-5 EN — Firebase SDK integration
- Install firebase package.
- Create src/lib/firebase.js.
- Initialize app, auth and firestore.

--------------------------------------------------

SL-6 Authentication logic [DONE]
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

SL-7 Firestore data model [DONE]
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

SL-8 Lists screen [DONE]
SL-8 RU — Экран списков
- Показать списки пользователя.
- Создание нового списка.
- Переименование / удаление (опционально).

SL-8 EN — Lists screen
- Show user lists.
- Create new list.
- Rename / delete list (optional).

--------------------------------------------------

SL-9 List details (items) [DONE]
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

SL-10 List sharing (invites) [DONE]
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

SL-11 Add translations [DONE]


--------------------------------------------------

SL-12 Firestore security rules [DONE]
SL-12 RU — Правила безопасности Firestore
- Доступ только для участников списка.
- Защита приглашений.

SL-12 EN — Firestore security rules
- Access only for list members.
- Protect invites.

--------------------------------------------------

SL-13 Web build [DONE]
SL-13 RU — Веб-сборка
- Экспорт веб-версии Expo.
- Проверка роутинга.
- Тест в браузере и на телефоне.

SL-13 EN — Web build [DONE]
- Expo web export.
- Routing check.
- Browser and mobile testing.

--------------------------------------------------

SL-14 GitHub Pages deploy [DONE]
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
SL-19 RU — Мультиязычность [DONE]
- Настройка i18n.
- Языки: RU / DE / EN.
- Переключение языка.

SL-19 EN — Internationalization (i18n) [DONE]
- i18n setup.
- RU / DE / EN languages.
- Language switch.

SL-20 Смена пароля и забыл пароль(восстановление через email) [DONE]

SL-21 Показать/скрыть пароль [DONE]

SL-22 
SL-23 Добавить экраны Lists / Invites / Settings [DONE]
SL-24 Сделать чтоб при вводе текста и ажатии enter элемент добавлялся в список [DONE]
SL-25 Добавить дневную и ночную темы [DONE]
SL-26 Убрать Logout со страницы Lists [DONE]
SL-27 Убрать заголовки сверху, т.к. у нас есть экраны внизу
SL-28 Пофиксить отступы внизу, т.к. обрезается текст на Settings странице [DONE]
SL-29 добавить отображение того, с кем ты делишь список и кто из них хозяин списка [DONE]
SL-30 добавить обработку ентера для всех инпутов [DONE]
SL-31 исправить баг при смене темы - возвращает на Lists(только на мобильной версии?), при смене языка так же кидает на Lists [DONE]
SL-32 [missing "en.invites.accept.error" translation] - ошибка при принятии приглашения. Добавить переводы при ошибке [DONE]
SL-33 Запретить дублировать приглашения. [DONE]
SL-34 исправить ошибку  [runtime not ready]: TypeError: Cannot read property 'host' of undefined [DONE]
SL-35 добавить возможность давать права на редактирование/переименование списка
SL-36 добавить псевдонимы(уникальные имена), чтоб не светить имейл.
SL-37 добавить поиск по имени с подсказками.
SL-38 app/ios - при смене языка язык меняется только на странице выборя языка а переходе между экранами язык остаётся предыдущий. [DONE]
SL-39 решить вопрос с размером кнопок, которые зависят от длины контента внутри
SL-40 app/ios - в приложении текст кнопок перехода между страницами не виден и иконки находятся слишком внизу, почти возле рамки и неудобно нажимать.[DONE]
SL-41 добавить scheme for linking [DONE]
SL-42 на странице списка языков есть ссылка Tabs без перевода, хидер и футер не переводится после смены языка. [DONE]
SL-43 пофиксить разметку выбора страниц [DONE]
SL-44 сообщение об ошибке должно находиться под элементом, который вызвал ошибку. Например инпуты [DONE]
SL-45 добавить оповещение на андроид и ios, когда приходит invite.[DONE]
SL-46 dev build setup для Android/iOS (полная инструкция по установке и запуску).
SL-47 добавить защиту от дубля продукта в списке
SL-48 При регистрации сделать подтверждение почты?
SL-49 уведомлять участника об удалённом списке (alert + push).
SL-50 сделать отдельную страницу для восстановления пароля.
SL-51 создать страницу для рецептов, сделать возможность делится рецептами, создавать список покупок под рецепт.
SL-52 вынести стили в отдельные файлы ?
SL-53 поменять роутинг страниц, вынести настройки в settings [DONE]
SL-54 при удалении продукта из списка - показывать всплывающую подсказку, что такой то продукт удалён из списка
SL-56 добавить иконку [DONE]
SL-57 переименовать "Выйти" из списка на более что-то более понятное для юзера [DONE]
SL-58 добавить очистить список и очистить купленное [DONE]
SL-59 добавить скопировать список нажал “Скопировать” → вводишь новое имя → появляется новый список туда копируются либо все товары, либо только некупленные (можем выбрать вариант)
SL-60 кто может очищать списки? Сделать возможность давать права на это?
SL-61 использовать как вишлист
SL-62 сделать пометку кто добавил и кто отметил элемент списка
SL-63 сделать оповещение, когда добавлен или отмечен элемент списка
SL-63 сделать оповещение, когда добавлен или отмечен элемент списка
SL-64 поменять кнопку Удалить на иконку корзины на элементе списка [DONE]
SL-65 добавить кнопку переименовать на элемент списка [DONE]
SL-66 на вебе текст залазит на иконку когда вводишь текст без пробелов [DONE]
SL-67 Сетевые ошибки: показывать понятные сообщения при network/unavailable
SL-68 Блокировать кнопки во время запроса (invite/create/accept и т.п.)
SL-69 Добавить кнопку "Повторить" после ошибки create/add/invite
SL-70 Показать офлайн-статус при ошибке listener (unavailable)
SL-71 добавить короткие тості после ключевіх действий(создание, приглашение, выход)


## Push Notifications (SL-45)
Client:
- Uses `expo-notifications` to request permission and store Expo push tokens on `users/{uid}`.
- Tokens are stored in `expoPushTokens` and updated with `pushTokenUpdatedAt`.

Backend:
- Firebase Cloud Function `sendInviteNotification` sends a push when a new invite is created.
- Requires `functions/` deployment and a configured Firebase project.

Setup:
1) `npm install expo-notifications`
2) `firebase init functions` (select this project, JavaScript, Node 18)
3) `cd functions && npm install`
4) `firebase deploy --only functions`

Notes:
- iOS push requires a physical device.
- Expo Go can receive push notifications, production builds need proper app ids.

## List Deletion Notifications (SL-49)
- When a list is removed, the list details screen shows an alert and returns to Lists.
- Cloud Function sends a push to other members of the deleted list.


## Release Notes
Web hosting planned for GitHub Pages after MVP. Mobile releases later via Expo/EAS.
