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

SL-1 Project structure
- Create src folder.
- Move logic out of App.js.
- Create folders: navigation, screens/Auth, screens/Lists, lib, components.

SL-2 App navigation setup
- Install React Navigation.
- Create RootNavigator.
- AuthStack: Login, Register.
- AppStack: Lists, ListDetails.

SL-3 Auth screens (UI only)
- Login screen UI.
- Register screen UI.
- Navigation between screens.

SL-4 Firebase project setup
- Create Firebase project.
- Enable Email/Password auth.
- Create Firestore (EU region).

SL-5 Firebase SDK integration
- Install firebase package.
- Create src/lib/firebase.js.
- Init app, auth, firestore.

SL-6 Authentication logic
- Register user.
- Login user.
- Logout.
- onAuthStateChanged logic.

SL-7 Firestore data model
- users collection.
- lists collection.
- items subcollection.
- members array for shared lists.

SL-8 Lists screen
- Show user lists.
- Create new list.
- Rename/delete list (optional).

SL-9 List details (items)
- Realtime items.
- Add item.
- Toggle done.
- Delete item.
- Sort undone first.

SL-10 List sharing (invites)
- Invite by email.
- Accept invite.
- Add user to list members.

SL-11 Realtime sync
- Firestore listeners.
- Sync between users.

SL-12 Firestore security rules
- Access only for list members.
- Protect invites.

SL-13 Web build
- Expo web export.
- Routing check.
- Browser + mobile test.

SL-14 GitHub Pages deploy
- Setup Pages.
- Optional GitHub Actions.

SL-15 Privacy policy & support page
- Privacy policy page.
- Support page.
- Hosting.

SL-16 Input parsing (no AI)
- Parse text input.
- Deduplicate items.
- Detect quantities.

SL-17 Categories
- Category codes.
- Grouping.
- Manual change.

SL-18 AI integration
- Backend endpoint.
- Structured JSON.
- Fallback without AI.

SL-19 i18n
- i18n setup.
- RU / DE / EN.
- Language switch.

## Release Notes
Web hosting planned for GitHub Pages after MVP. Mobile releases later via Expo/EAS.
