# YourStyle App - AI Coding Agent Instructions

Welcome, agent! This guide will help you understand the YourStyle application's architecture, conventions, and key workflows.

## 🚀 Project Overview

This is a full-stack, multi-tenant Next.js application built with the App Router. The core feature is an AI-powered chat interface that helps users generate content. The tech stack includes TypeScript, tRPC, Prisma, PostgreSQL, and Tailwind CSS.

- **Frontend**: Next.js with React (App Router)
- **Backend**: Next.js API Routes with tRPC for type-safe client-server communication.
- **Database**: PostgreSQL, managed with Prisma ORM.
- **Authentication**: NextAuth.js with a Prisma adapter.
- **Styling**: Tailwind CSS with Shadcn/UI components.
- **AI**: Use Google AI SDK for content generation.

## 🏗️ Architecture & Key Directories

- **`src/app/`**: Contains the Next.js App Router pages and API routes.
  - **`src/app/api/trpc/[trpc]/route.ts`**: The single entry point for all tRPC API calls.
  - **`src/app/api/auth/[...nextauth]/`**: Handles authentication logic via NextAuth.js.
- **`src/features/humain/`**: This is the heart of the application. It contains the React components and logic for the AI chat and content generation features.
- **`src/trpc/`**: Defines the tRPC API.
  - **`server.ts`**: The main tRPC router (`appRouter`) is defined here. Add new tRPC procedures in this directory and merge them into the `appRouter`.
  - **`react.tsx`**: The tRPC query client for use in React components.
- **`prisma/`**:
  - **`schema.prisma`**: The single source of truth for the database schema. After modifying this file, run `npx prisma generate` and `npx prisma migrate dev --name "your-migration-name"` to update the database and Prisma Client.
- **`src/components/ui/`**: Base UI components from Shadcn/UI. When adding new components, use the Shadcn CLI.
- **`src/lib/`**: Contains core utilities, including `auth.ts` (NextAuth.js config) and `utils.ts`.

##  workflows

### Development

1.  **Run the development server**:
    ```bash
    bun run dev
    ```
    The app will be available at `http://localhost:5010`.

2.  **Database Migrations**:
    When you change `prisma/schema.prisma`:
    ```bash
    # Generate the Prisma client
    npx prisma generate

    # Create and apply a new migration
    npx prisma migrate dev --name "descriptive-migration-name"
    ```

### API Development (tRPC)

To add a new API endpoint:

1.  Define a new procedure in a file within `src/trpc/`.
2.  Add the new procedure to the `appRouter` in `src/trpc/server.ts`.
3.  Use the `api` object from `src/trpc/react.tsx` in your client components to call the new procedure.

**Example tRPC query:**

```typescript
// In a client component
import { api } from "~/trpc/react";

const { data, isLoading } = api.post.all.useQuery();
```

##  conventions

- **Path Aliases**: Use `@/*` for imports from the `src` directory and `@generated/*` for the `generated` directory.
- **Styling**: Use `clsx` and `tailwind-merge` for constructing conditional class names.
- **State Management**: Use TanStack Query (via tRPC's React Query integration) for server state. For global client-side state, `valtio` is available (`src/stores/app.ts`).
- **Authentication**: User and session data are accessed through NextAuth.js hooks and helpers. The session object is available in both client and server components.
