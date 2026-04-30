# Automated Database Migration Workflow

## Problem

Database migrations are created and tested locally but deployed to production via a manual `db:push` command. This has led to situations where migrations were merged to `master` but never pushed to production, causing local and production databases to fall out of sync and requiring painful manual restoration.

## Solution

Two GitHub Actions jobs that automate migration validation on PRs and deployment to production on merge to `master`, eliminating manual `db push` entirely.

## Design

### Job 1: PR Migration Validation

**Trigger:** Pull requests to `master` that modify files in `supabase/migrations/**`.

**Purpose:** Validate that all migrations apply cleanly against a fresh database and that generated types are up to date.

**Steps:**

1. Checkout code
2. Setup Supabase CLI via `supabase/setup-cli`
3. Setup pnpm + Node.js (needed for type generation and formatting)
4. Install dependencies (needed for Biome, which `db:types` uses for formatting)
5. Run `supabase db start` — starts only the Postgres container and applies all migrations sequentially against a clean database
6. Generate TypeScript types from the migrated schema via `pnpm db:types`
7. Diff the generated `lib/supabase/types.ts` against the committed version — fail if they differ

**Why `db start` instead of `start`:** `supabase db start` spins up just the database, skipping Auth, Storage, Edge Functions, etc. It's faster and sufficient for migration validation.

**Why check types:** Catches the common mistake of modifying the schema but forgetting to run `db:types` before committing. The generated types file must always match the current migration state.

### Job 2: Production Migration Deployment

**Trigger:** Push to `master` (i.e., after PR merge), only when files in `supabase/migrations/**` changed.

**Purpose:** Automatically deploy new migrations to the production Supabase project.

**Steps:**

1. Checkout code
2. Setup Supabase CLI via `supabase/setup-cli`
3. Link to production project via `supabase link --project-ref $PRODUCTION_PROJECT_ID`
4. Run `supabase db push` to apply pending migrations

**Failure behavior:** If `db push` fails, the GitHub Actions workflow fails and sends a notification. The migration file is already in `master`, so after diagnosing and fixing the issue (either amending the migration or adding a corrective follow-up migration), re-running the workflow applies it.

**Secrets required:**

| Secret | Source | Purpose |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | Supabase Dashboard > Account > Access Tokens | Authenticates the CLI for remote operations |
| `PRODUCTION_PROJECT_ID` | Supabase Dashboard > Project Settings > General | Identifies which project to push to |
| `PRODUCTION_DB_PASSWORD` | Supabase Dashboard > Project Settings > Database | Authenticates the database connection |

### Workflow File Structure

Both jobs live in a single workflow file: `.github/workflows/migrations.yml`.

- The validation job runs on `pull_request` events targeting `master`, filtered to `supabase/migrations/**` paths.
- The deploy job runs on `push` events to `master`, filtered to the same paths.
- They are independent jobs (not dependent on each other) since they trigger on different events.

### CLAUDE.md Updates

The Database Migrations section of `CLAUDE.md` will be updated to document:

- The automated deployment flow (CI handles `db push` on merge to `master`)
- The complete migration development loop: create migration, apply locally, regenerate types, commit, open PR, CI validates, merge, CI deploys
- That `db:push` should not be run manually under normal circumstances

### What Doesn't Change

- **Local development flow:** `supabase migration new`, `db:migrate`, `db:types` remain the same
- **`db:push` script:** Stays in `package.json` as an escape hatch for exceptional manual deploys
- **Existing CI workflows:** Playwright (`playwright.yml`) and lint (`lint.yml`) are untouched
- **Migration files, Supabase config, application code:** No changes
- **Seed data:** Not deployed to production (seeds are local-only by default)

## File Changes

| File | Action | Description |
|---|---|---|
| `.github/workflows/migrations.yml` | Create | PR validation + production deploy workflow |
| `CLAUDE.md` | Edit | Update database migrations section |

## Future Considerations

- **Staging environment:** A staging Supabase project can be added later as an intermediate deployment target on PRs, providing validation against a real hosted environment before production. The workflow shape supports this without restructuring.
- **Branch protection:** After the workflow is deployed, enable "Require status checks to pass before merging" on `master` and add the validation job as a required check.
- **Migration rollback tooling:** Supabase does not support automatic rollbacks. If needed, a convention for writing "down" migrations as separate follow-up files could be established.
