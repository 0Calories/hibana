# Hibana

Gamified habit tracker using fire/flame metaphors. Users create "flames" (habits), allocate daily "fuel" (time budgets), track sessions, and "seal" (complete) them with celebration animations.

## Stack

- **Framework**: Next.js 16 (App Router, React 19, React Compiler enabled)
- **Language**: TypeScript 5 (strict mode)
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **UI**: shadcn/ui + Radix UI + Tailwind CSS 4
- **Linting/Formatting**: Biome (single quotes, 2-space indent, organized imports)
- **i18n**: next-intl (en, ja)
- **Animation**: framer-motion
- **Forms**: react-hook-form + Zod
- **Package Manager**: pnpm
- **Testing**: Playwright (E2E)

## Project Structure

```
app/
  (app)/          # Authenticated routes (flames, schedule, dashboard, habits, tasks)
  (auth)/         # Login/signup
  (marketing)/    # Landing page
components/ui/    # shadcn/ui components
lib/              # Utils, types, Zod schemas
utils/supabase/   # Supabase clients, generated types, row type exports
supabase/         # Migrations, seed, config
messages/         # i18n translation files (en.json, ja.json)
```

## Domain Model

- **Flame**: A habit/goal. Has name, color, icon, tracking_type (time|count), budget, schedule. Five visual levels: Candle, Torch, Blaze, Bonfire, Supernova.
- **Flame State Machine**: untended → burning → paused → sealing → sealed
- **Fuel Budget**: Daily minutes allocated across flames. Per-day-of-week configuration. Overburning is allowed but flagged.
- **Flame Session**: A tracking instance (started_at, ended_at, duration_seconds, is_completed).
- **Seal**: Completing a flame session. Triggers celebration animation.
- **Schedule**: `flame_schedules` (default weekly), `weekly_schedule_overrides` (per-week customization).
- **Flame Colors**: rose, orange, amber, indigo, teal, green, blue, sky, fuchsia (grouped: Earthly, Chemical, Cosmic).

## Architecture Patterns

- **Server Components by default**. Add `'use client'` only when interactivity is needed.
- **Server Actions** (`'use server'`) for all mutations and data fetching. Wrap Supabase calls with error handling. Revalidate with `revalidatePath()`.
- **Local state only** (useState). No global state library. Server is the source of truth.
- **Custom hooks**: `useFlameState`, `useFuel`, `useLongPress` — colocated in `/hooks` folders.
- **Supabase auth**: `createClientWithAuth()` for authenticated access, `createClient()` for public.
- **RLS enforced**: All tables have row-level security policies scoping data to the authenticated user.

## Code Conventions

- **Components**: PascalCase filenames (`FlameCard.tsx`)
- **Actions**: `actions.ts` or `*-actions.ts`
- **Hooks**: `use*` prefix, in colocated `/hooks` dirs
- **Types**: colocated or in `types.ts`. Suffix `Props` for component props, `Schema` for Zod, `Result` for action returns
- **Translations**: Always use `useTranslations()` from next-intl. All user-facing strings go in `messages/en.json` and `messages/ja.json`.
- **Formatting**: Run `pnpm biome check --write` before committing. Single quotes, 2-space indent.

## Git Conventions

- **Conventional Commits**: `type(scope): message`
- **Types**: feat, fix, chore, ref, polish, revert
- **Scope**: `(fnf)` = Feature Not Finalized (work in progress)
- **Examples**: `feat(fnf): Add flame scheduling view`, `fix: Correct fuel calculation on overburn`

## Database

Key tables: `flames`, `flame_schedules`, `flame_sessions`, `fuel_budgets`, `weekly_schedule_overrides`, `tasks`, `notes`, `waitlist`. Migrations in `supabase/migrations/`. Generated types in `utils/supabase/types.ts`, row helpers in `utils/supabase/rows.ts`.

## Common Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm biome check --write  # Lint + format
pnpx supabase db push      # Push migrations
pnpx supabase gen types typescript --local > utils/supabase/types.ts  # Regenerate types
```
