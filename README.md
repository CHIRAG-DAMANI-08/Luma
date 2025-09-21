# Luma — Comprehensive Documentation

---

## Table of Contents


- [Getting Started](#getting-started)
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack & Dependencies](#tech-stack--dependencies)
- [Features](#features)
- [Project Structure](#project-structure)
- [Module & File Reference](#module--file-reference)
- [Configuration & Environment](#configuration--environment)
- [Local Development & Deployment](#local-development--deployment)
- [API Reference](#api-reference)
- [Testing & Quality](#testing--quality)
- [Security & Privacy](#security--privacy)
- [CI/CD & Deployment](#cicd--deployment)
- [Contribution Guide](#contribution-guide)
- [Known Unknowns & Next Steps](#known-unknowns--next-steps)
- [Appendix](#appendix)

---
# Getting Started

This guide will walk you through the process of setting up and running the Luma application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (version 20 or later)
*   [npm](https://www.npmjs.com/) (or your preferred package manager)

## Installation

1.  Clone the repository to your local machine:

    ```bash
    git clone <repository-url>
    ```

2.  Navigate to the project directory:

    ```bash
    cd luma
    ```

3.  Install the dependencies:

    ```bash
    npm install
    ```

## Running the Development Server

To start the development server, run the following command:

```bash
npm run dev
```

This will start the application in development mode at [http://localhost:3000](http://localhost:3000).

## Building for Production

To build the application for production, run the following command:

```bash
npm run build
```

This will create an optimized build of the application in the `.next` directory.

To run the production build, use the following command:

```bash
npm run start
```

## Linting

To check the code for any linting errors, run the following command:

```bash
npm run lint
```


## Project Overview

**Purpose:**  
Luma is an AI-powered mental health companion web application. It provides journaling, mood tracking, personalized insights, and a dashboard for users to monitor their mental wellness.

**Audience:**  
- End users seeking mental health support.
- Developers maintaining/extending the Next.js frontend, Clerk authentication, and AI integrations.

**Core Goals:**  
- Secure, private, and responsive UI for mental health support.
- Integrate authentication, generative AI, and embeddings for personalized experiences.

---

## Architecture

- **Monolithic Next.js App Router**: SSR/SSG, client/server routes.
- **React Components**: UI in TypeScript.
- **Authentication**: Clerk.
- **AI Integrations**: Google Generative AI, ElevenLabs, Chroma embeddings.
- **Local Embedding Store**: Chroma SQLite files.
- **ORM**: Prisma (database backend, config: UNKNOWN).
- **Styling**: Tailwind CSS, shadcn/ui.

---

## Tech Stack & Dependencies

**Languages:**  
- TypeScript / TSX  
- CSS / Tailwind  
- JSON / Markdown

**Key Packages:**  
- next (v15.5.3)
- react, react-dom (19.1.0)
- @clerk/nextjs, @clerk/clerk-sdk-node
- @google/genai, @google/generative-ai
- @elevenlabs/client, @11labs/react
- @chroma-core/default-embed
- prisma, @prisma/client
- tailwindcss, @tailwindcss/typography
- framer-motion, lucide-react, sonner, lexical, react-hook-form

**External Services:**  
- Clerk (auth)
- Google Generative AI (LLM)
- ElevenLabs (TTS)
- Chroma (embeddings, local SQLite)

---

## Features

- **Authentication**: Secure sign-in/up via Clerk.
- **Landing/Home Page**: Hero, features, CTA.
- **Dashboard**: Feature highlights, stats.
- **Mood Tracking**: See `context.md`.
- **AI Chat & Audio**: Generative responses, TTS.
- **Semantic Search**: Chroma embeddings.
- **Dark Mode**: Tailwind, next-themes.

---

## Project Structure

```
/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/         # API routes (UNKNOWN contents)
├── components/
│   ├── MainFeatures.tsx
│   ├── UserTypes.tsx
│   ├── ui/
│   │   └── button.tsx
│   └── ...          # Other UI components (HeroSection, etc.)
├── chroma_data/
│   └── chroma.sqlite3
├── chroma_da/
│   └── chroma.sqlite3
├── context.md
├── package.json
├── README.md
└── .env.example
```

---

## Module & File Reference

### app/layout.tsx
- **Purpose**: Root layout, imports global CSS/font, wraps app in providers.
- **Exports**: `metadata`, `RootLayout({ children })`.
- **Dependencies**: ClerkProvider, Providers (UNKNOWN details).

### app/page.tsx
- **Purpose**: Home/landing page.
- **Imports**: Clerk (`useAuth`, `UserButton`), UI components.

### app/globals.css
- **Purpose**: Global styles, Tailwind imports, custom keyframes.

### components/MainFeatures.tsx
- **Purpose**: Dashboard mockup, feature highlights.
- **Dependencies**: Button, Link, Clerk hooks.

### components/UserTypes.tsx
- **Purpose**: User personas, CTA.

### chroma_data/chroma.sqlite3 & chroma_da/chroma.sqlite3
- **Purpose**: Local Chroma embedding DBs (SQLite).  
- **Security**: Ensure no sensitive data is committed.

### context.md
- **Purpose**: Implementation notes for Mood Tracking.

### package.json
- **Purpose**: Node scripts & dependencies.

### .env.example
- **Purpose**: Template for required environment variables.

### Other Components (UNKNOWN)
- HeroSection, Categories, goBeyond, Statement, Footer, ui/button, providers, prisma/schema.

---

## Configuration & Environment

**Required Environment Variables:**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_XXXXXXXXXXXXXXXX
CLERK_SECRET_KEY=sk_XXXXXXXXXXXXXXXX
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```
**Optional/Inferred:**
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
GOOGLE_API_KEY=...
ELEVENLABS_API_KEY=...
CHROMA_API_KEY=...
CHROMA_ENDPOINT=...
```
**Secrets Management:**  
- Use `.env.local` for development.  
- Use platform secret stores in production.

---

## Local Development & Deployment

**Quickstart:**
1. Clone: `git clone <repo-url> && cd luma`
2. Install: `npm install`
3. Create `.env.local` with required variables.
4. Start dev: `npm run dev`
5. Build: `npm run build`
6. Start: `npm start`

**Notes:**  
- For Prisma: `npx prisma migrate dev` after setting `DATABASE_URL`.
- Chroma db must be installed and run locally before anything
- Deploy on Vercel (recommended).

---

## API Reference

**API routes are in `/app/api` (contents: UNKNOWN).**  
Typical endpoints (to be documented):
- POST `/api/chat` — AI chat
- GET `/api/conversations` — List conversations
- POST `/api/embeddings` — Embedding search
- CRUD for journals/mood entries

**Action:**  
- Inspect `/app/api` and document endpoints, methods, params, auth, examples, errors.

---

## Testing & Quality

- **Tests:** Not found (UNKNOWN).  
  - Unit: Jest/Vitest + React Testing Library.
  - Integration: API route tests.
  - E2E: Playwright/Cypress.

- **Linting:**  
  - ESLint (`npm run lint`), config via `.eslintrc` or `@eslint/eslintrc`.

---

## Security & Privacy

- **Sensitive Data:** Journals, mood logs — encrypt at rest, secure in transit.
- **Authentication:** Clerk — configure keys securely.
- **Secrets:** Never commit `.env.local` or DB dumps.
- **Recommendations:**  
  - Use platform secret manager.
  - Add dependency scanning.
  - Add security policy (UNKNOWN).

---

## CI/CD & Deployment

- **CI/CD:** Not present (UNKNOWN).
- **Suggested:**  
  - GitHub Actions or Vercel.
  - Run lint, build, tests in CI.
  - Use Prisma migrations.
  - Use platform rollback.

---

## Contribution Guide

**Getting Started:**
1. Fork & clone.
2. Install deps.
3. Add `.env.local`.
4. Run `npm run dev`.

**Branching & PRs:**  
- Feature branches, PRs, CI checks, peer review, merge to `main`/`dev`.

**Reporting Issues:**  
- Use GitHub Issues.  
- For security, contact maintainers privately (UNKNOWN).

**Commit Guidelines:**  
- Use clear messages:  
  - `feat: add mood-tracking API`
  - `fix: typo in MainFeatures.tsx`

**Checklist:**  
- [ ] Lint passes
- [ ] Build succeeds
- [ ] Tests pass
- [ ] Docs updated
- [ ] No secrets committed

---

## Known Unknowns & Next Steps

- `/app/api` endpoints: UNKNOWN
- Prisma schema & migrations: UNKNOWN
- Tailwind/PostCSS config: UNKNOWN
- UI primitives: UNKNOWN
- Providers implementation: UNKNOWN
- CI/CD config: UNKNOWN
- Test suites: UNKNOWN
- AI/3rd-party env vars: UNKNOWN

**Actions:**  
- Scan repo for full documentation.
- Create `.env.example`.
- Add CONTRIBUTING.md, CODE_OF_CONDUCT.md.
- Add security policy.

---

## Appendix

- `app/layout.tsx` — Root layout
- `app/page.tsx` — Landing page
- `app/globals.css` — Global styles
- `components/MainFeatures.tsx` — Features section
- `components/UserTypes.tsx` — User personas
- `context.md` — Mood tracking notes
- `package.json` — Scripts & dependencies
- `chroma_data/chroma.sqlite3`, `chroma_da/chroma.sqlite3` — Chroma DBs

---

# Architecture

This document provides a high-level overview of the Luma application's architecture.

## Technology Stack

*   **Framework**: [Next.js](https://nextjs.org/) (React framework)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: A combination of custom components and UI components from [Radix UI](https://www.radix-ui.com/) and [shadcn/ui](https://ui.shadcn.com/).
*   **Database**: [Prisma](https://www.prisma.io/) ORM, likely with a relational database like PostgreSQL.
*   **Authentication**: [Clerk](https://clerk.com/)
*   **Vector Database**: [ChromaDB](https://www.trychroma.com/)
*   **AI**: The application leverages various AI technologies, including:
    *   [Google Generative AI](https://ai.google/)
    *   [Hugging Face Transformers](https://huggingface.co/docs/transformers/index)
    *   [ElevenLabs](https://elevenlabs.io/) for text-to-speech.

## High-Level Architecture

Luma is a full-stack web application built with Next.js. The architecture can be broken down into the following key areas:

*   **Frontend**: The frontend is built with React and TypeScript, using Next.js's App Router. Components are styled with Tailwind CSS, and the UI is built using a combination of custom components and components from Radix UI and shadcn/ui.

*   **Backend**: The backend is also built with Next.js, using API Routes. These routes handle everything from user authentication and data fetching to interactions with the AI services.

*   **Database**: The application uses Prisma as an ORM to interact with a relational database. The database schema is defined in `prisma/schema.prisma`.

*   **Authentication**: User authentication is handled by Clerk, which provides a complete solution for user management, sign-up, sign-in, and profile management.

*   **AI Features**: Luma integrates with several AI services to provide its core functionality. These services are used for tasks such as natural language processing, generative AI, and text-to-speech.

## Directory Structure

```
├── app/                # Next.js App Router
│   ├── api/            # API routes
│   ├── (pages)/        # Page components
│   └── layout.tsx      # Root layout
├── components/         # Shared React components
│   └── ui/             # UI components from shadcn/ui
├── lib/                # Utility functions and libraries
├── prisma/             # Prisma schema and migrations
├── public/             # Static assets
└── styles/             # Global styles
```
# API Reference

This document provides a detailed reference for the Luma application's API.

## Motivations

### Get Motivations

*   **Method**: `GET`
*   **URL**: `/api/motivations/get`
*   **Description**: Fetches motivations for the currently authenticated user.
*   **Response**: A JSON array of motivation objects.

### Send Motivation

*   **Method**: `POST`
*   **URL**: `/api/motivations/send`
*   **Description**: Sends a motivation to a user.
*   **Request Body**: `{ "goalText": "...", "senderName": "...", "note": "...", "receiverId": "..." }`
*   **Response**: A JSON object confirming the creation of the motivation.

## Chat

### Chat

*   **Method**: `POST`
*   **URL**: `/api/chat`
*   **Description**: Handles chat messages. It uses a streaming response.
*   **Request Body**: `{ "messages": [...] }`
*   **Response**: A streaming response with the AI's chat message.

### Proactive Check-in

*   **Method**: `POST`
*   **URL**: `/api/chat/proactive-checkin`
*   **Description**: Initiates a proactive check-in chat with the user.
*   **Response**: A streaming response with the AI's proactive check-in message.

### Get Chat Session

*   **Method**: `GET`
*   **URL**: `/api/chat/{sessionId}`
*   **Description**: Retrieves a specific chat session.
*   **URL Parameters**:
    *   `sessionId` (string, required): The ID of the chat session to retrieve.
*   **Response**: A JSON object representing the chat session.

## Webhooks

### Clerk Webhook

*   **Method**: `POST`
*   **URL**: `/api/webhooks/clerk`
*   **Description**: A webhook handler for Clerk. It handles user creation, deletion, and updates from Clerk.
*   **Response**: `200 OK` or an error.

## User Data

### Get User Data

*   **Method**: `GET`
*   **URL**: `/api/user-data`
*   **Description**: Fetches various user data, including mood entries, journal entries, and chat sessions.
*   **Response**: A JSON object containing the user's data.

## Onboarding

### Onboard User

*   **Method**: `POST`
*   **URL**: `/api/onboard`
*   **Description**: Onboards a new user by creating their profile.
*   **Request Body**: A JSON object containing the user's profile information.
*   **Response**: A JSON object confirming the creation of the profile.

## Profile

### Get Profile

*   **Method**: `GET`
*   **URL**: `/api/profile`
*   **Description**: Retrieves the profile of the currently authenticated user.
*   **Response**: A JSON object containing the user's profile information.

### Update Profile

*   **Method**: `PUT`
*   **URL**: `/api/profile`
*   **Description**: Updates the profile of the currently authenticated user.
*   **Request Body**: A JSON object containing the updated profile information.
*   **Response**: A JSON object confirming the update.

## Text-to-Speech

### Speak

*   **Method**: `POST`
*   **URL**: `/api/speak`
*   **Description**: Converts text to speech using the ElevenLabs API.
*   **Request Body**: `{ "text": "...", "voiceId": "..." }`
*   **Response**: An audio file.

## Mood

### Get Mood Entries

*   **Method**: `GET`
*   **URL**: `/api/mood`
*   **Description**: Retrieves mood entries for the authenticated user from the last 7 days.
*   **Response**: A JSON object containing an array of mood entries.

### Log Mood Entry

*   **Method**: `POST`
*   **URL**: `/api/mood`
*   **Description**: Logs a new mood entry for the authenticated user.
*   **Request Body**: `{ "mood": "...", "notes": "...", "factors": [...] }`
*   **Response**: A JSON object confirming the creation of the mood entry.

## Community

### Get Posts

*   **Method**: `GET`
*   **URL**: `/api/community/posts`
*   **Description**: Retrieves all posts from the community forum.
*   **Response**: A JSON array of post objects.

### Create Post

*   **Method**: `POST`
*   **URL**: `/api/community/posts`
*   **Description**: Creates a new post in the community forum.
*   **Request Body**: `{ "content": "..." }`
*   **Response**: A JSON object representing the newly created post.

### Vote on Post

*   **Method**: `POST`
*   **URL**: `/api/community/posts/{postId}/vote`
*   **Description**: Upvotes or downvotes a post.
*   **URL Parameters**:
    *   `postId` (string, required): The ID of the post to vote on.
*   **Request Body**: `{ "voteType": "UPVOTE" | "DOWNVOTE" }`
*   **Response**: A JSON object with the updated vote counts for the post.

------
# Components

This document provides an overview of the React components used in the Luma application.

## Core Components (`components/`)

These are the shared, reusable components that are used throughout the application.

*   **`Categories.tsx`**: A component for displaying categories.
*   **`document-upload.tsx`**: A component for uploading documents.
*   **`Footer.tsx`**: The application's footer.
*   **`goBeyond.tsx`**: A component that likely encourages users to explore more.
*   **`HeroSection.tsx`**: The hero section for the landing page.
*   **`main-nav.tsx`**: The main navigation bar.
*   **`MainFeatures.tsx`**: A section to highlight the main features of the application.
*   **`ProactiveCheckin.tsx`**: A component for proactive check-ins.
*   **`ReminderModal.tsx`**: A modal for setting reminders.
*   **`Statement.tsx`**: A component for displaying a statement or a quote.
*   **`theme-provider.tsx`**: A provider for managing the application's theme.
*   **`UserTypes.tsx`**: A component for displaying different user types.

### UI Components (`components/ui/`)

These are the basic UI components, likely from [shadcn/ui](https://ui.shadcn.com/).

*   **`alert.tsx`**: A component for displaying alerts.
*   **`badge.tsx`**: A component for displaying badges.
*   **`button.tsx`**: A button component.
*   **`card.tsx`**: A card component.
*   **`form.tsx`**: A component for building forms.
*   **`input.tsx`**: An input field component.
*   **`label.tsx`**: A label component.
*   **`radio-group.tsx`**: A radio group component.
*   **`select.tsx`**: A select component.
*   **`skeleton.tsx`**: A skeleton loading component.
*   **`slider.tsx`**: A slider component.
*   **`tabs.tsx`**: A tabs component.
*   **`textarea.tsx`**: A textarea component.
*   **`toaster.tsx`**: A toaster component for displaying notifications.

## Page-Specific Components (`app/`)

These are the components that are specific to a particular page or a route.

*   **`app/layout.tsx`**: The root layout for the entire application.
*   **`app/page.tsx`**: The main page of the application.
*   **`app/providers.tsx`**: A component for wrapping the application with providers.
*   **`app/chat/page.tsx`**: The main component for the chat page.
*   **`app/chat/components/ChatInterface.tsx`**: The user interface for the chat.
*   **`app/community/page.tsx`**: The main component for the community page.
*   **`app/dashboard/page.tsx`**: The main component for the dashboard page.
*   **`app/goals/page.tsx`**: The main component for the goals page.
*   **`app/goals/share/page.tsx`**: The main component for the goal sharing page.
*   **`app/journal/page.tsx`**: The main component for the journal page.
*   **`app/mood/page.tsx`**: The main component for the mood tracking page.
*   **`app/onboarding/page.tsx`**: The main component for the onboarding page.
*   **`app/profile/page.tsx`**: The main component for the user profile page.
*   **`app/resources/page.tsx`**: The main component for the resources page.
*   **`app/resources/emergency/page.tsx`**: The main component for the emergency resources page.
*   **`app/sign-in/[[...sign-in]]/page.tsx`**: The sign-in page.
*   **`app/sign-up/[[...sign-up]]/page.tsx`**: The sign-up page.
*   **`app/sos/page.tsx`**: The main component for the SOS page

----------

# Database Schema

This document outlines the database schema for the Luma application, which is defined using Prisma.

## Datasource

The database provider is PostgreSQL, and the connection URL is configured via the `DATABASE_URL` environment variable.

## Models

### User

Represents a user of the application.

| Field             | Type        | Description                                      |
| ----------------- | ----------- | ------------------------------------------------ |
| `id`              | `String`    | Unique identifier for the user.                  |
| `clerkId`         | `String`    | The user's ID from Clerk.                        |
| `email`           | `String`    | The user's email address.                        |
| `name`            | `String?`   | The user's name.                                 |
| `createdAt`       | `DateTime`  | The date and time the user was created.          |
| `updatedAt`       | `DateTime`  | The date and time the user was last updated.     |
| `profile`         | `Profile?`  | The user's profile information.                  |
| `chatSessions`    | `ChatSession[]` | The user's chat sessions.                      |
| `messages`        | `Message[]` | The user's messages.                             |
| `lastLoginAt`     | `DateTime?` | The date and time the user last logged in.       |
| `moodEntries`     | `MoodEntry[]` | The user's mood entries.                         |
| `activities`      | `UserActivity[]`| The user's activities.                           |
| `journalEntries`  | `JournalEntry[]`| The user's journal entries.                      |
| `motivations`     | `Motivation[]`| The user's motivations.                          |
| `posts`           | `Post[]`    | The user's posts.                                |
| `votes`           | `Vote[]`    | The user's votes.                                |

### Profile

Represents a user's profile information.

| Field                | Type       | Description                                      |
| -------------------- | ---------- | ------------------------------------------------ |
| `id`                 | `String`   | Unique identifier for the profile.               |
| `userId`             | `String`   | The ID of the user this profile belongs to.      |
| `nickname`           | `String?`  | The user's nickname.                             |
| `pronouns`           | `String?`  | The user's pronouns.                             |
| `preferredLanguage`  | `String`   | The user's preferred language.                   |
| `timezone`           | `String`   | The user's timezone.                             |
| `medicalConditions`  | `String?`  | The user's medical conditions.                   |
| `currentMedications` | `String?`  | The user's current medications.                  |
| `therapyExperience`  | `String?`  | The user's therapy experience.                   |
| `comfortLevel`       | `Int`      | The user's comfort level.                        |
| `goals`              | `String?`  | The user's goals.                                |
| `checkInFrequency`   | `String`   | The user's check-in frequency.                   |
| `dataSharingEnabled` | `Boolean`  | Whether the user has enabled data sharing.       |
| `createdAt`          | `DateTime` | The date and time the profile was created.       |
| `updatedAt`          | `DateTime` | The date and time the profile was last updated.  |

### ChatSession

Represents a chat session between a user and the AI assistant.

| Field       | Type        | Description                                      |
| ----------- | ----------- | ------------------------------------------------ |
| `id`        | `String`    | Unique identifier for the chat session.          |
| `userId`    | `String`    | The ID of the user this session belongs to.      |
| `title`     | `String`    | The title of the chat session.                   |
| `isActive`  | `Boolean`   | Whether the chat session is active.              |
| `createdAt` | `DateTime`  | The date and time the session was created.       |
| `updatedAt` | `DateTime`  | The date and time the session was last updated.  |
| `messages`  | `Message[]` | The messages in this chat session.               |

### Message

Represents a message in a chat session.

| Field          | Type           | Description                                      |
| -------------- | -------------- | ------------------------------------------------ |
| `id`           | `String`       | Unique identifier for the message.               |
| `sessionId`    | `String`       | The ID of the chat session this message belongs to.|
| `userId`       | `String`       | The ID of the user who sent the message.         |
| `content`      | `String`       | The content of the message.                      |
| `role`         | `String`       | The role of the message sender (`user` or `assistant`).|
| `journalEntries`| `JournalEntry[]`| The journal entries associated with this message.|
| `metadata`     | `Json?`        | Additional metadata for the message.             |
| `createdAt`    | `DateTime`     | The date and time the message was created.       |

### MoodEntry

Represents a user's mood entry.

| Field       | Type       | Description                                      |
| ----------- | ---------- | ------------------------------------------------ |
| `id`        | `String`   | Unique identifier for the mood entry.            |
| `userId`    | `String`   | The ID of the user this entry belongs to.        |
| `mood`      | `String`   | The user's mood.                                 |
| `notes`     | `String?`  | Additional notes about the mood entry.           |
| `metadata`  | `Json?`    | Additional metadata for the mood entry.          |
| `createdAt` | `DateTime` | The date and time the entry was created.         |
| `updatedAt` | `DateTime` | The date and time the entry was last updated.    |

### UserActivity

Represents a user's activity in the application.

| Field          | Type       | Description                                      |
| -------------- | ---------- | ------------------------------------------------ |
| `id`           | `String`   | Unique identifier for the activity.              |
| `userId`       | `String`   | The ID of the user who performed the activity.   |
| `activityType` | `String`   | The type of activity.                            |
| `metadata`     | `Json?`    | Additional metadata for the activity.            |
| `createdAt`    | `DateTime` | The date and time the activity occurred.         |

### JournalEntry

Represents a user's journal entry.

| Field          | Type       | Description                                      |
| -------------- | ---------- | ------------------------------------------------ |
| `id`           | `String`   | Unique identifier for the journal entry.         |
| `userId`       | `String`   | The ID of the user this entry belongs to.        |
| `title`        | `String?`  | The title of the journal entry.                  |
| `content`      | `String`   | The content of the journal entry.                |
| `tags`         | `String[]` | Tags associated with the journal entry.          |
| `createdAt`    | `DateTime` | The date and time the entry was created.         |
| `updatedAt`    | `DateTime` | The date and time the entry was last updated.    |
| `notionPageId` | `String?`  | The ID of the corresponding Notion page.         |
| `lastSyncedAt` | `DateTime?`| The date and time the entry was last synced with Notion.|
| `syncNeeded`   | `Boolean?` | Whether the entry needs to be synced with Notion.|

### Motivation

Represents a motivation sent to a user.

| Field        | Type       | Description                                      |
| ------------ | ---------- | ------------------------------------------------ |
| `id`         | `String`   | Unique identifier for the motivation.            |
| `userId`     | `String`   | The ID of the user receiving the motivation.     |
| `senderName` | `String`   | The name of the person sending the motivation.   |
| `note`       | `String?`  | The motivation message.                          |
| `goalText`   | `String`   | The goal being motivated.                        |
| `createdAt`  | `DateTime` | The date and time the motivation was created.    |

### Post

Represents a post in the community forum.

| Field             | Type       | Description                                      |
| ----------------- | ---------- | ------------------------------------------------ |
| `id`              | `String`   | Unique identifier for the post.                  |
| `content`         | `String`   | The content of the post.                         |
| `createdAt`       | `DateTime` | The date and time the post was created.          |
| `updatedAt`       | `DateTime` | The date and time the post was last updated.     |
| `authorId`        | `String`   | The ID of the user who created the post.         |
| `votes`           | `Vote[]`   | The votes on this post.                          |
| `anonymousUsername`| `String`   | The anonymous username of the post author.       |

### Vote

Represents a vote on a post.

| Field    | Type     | Description                                      |
| -------- | -------- | ------------------------------------------------ |
| `id`     | `String` | Unique identifier for the vote.                  |
| `postId` | `String` | The ID of the post this vote belongs to.         |
| `userId` | `String` | The ID of the user who cast the vote.            |
| `type`   | `VoteType` | The type of vote (`UPVOTE` or `DOWNVOTE`).       |

## Enums

### VoteType

| Value      | Description |
| ---------- | ----------- |
| `UPVOTE`   | An upvote.  |
| `DOWNVOTE` | A downvote. |

---------

