# Hibana

Gamified productivity platform using fire/flame metaphors. Habits are Flames, Time is Fuel, and Sparks are currency that can be redeemed for prizes.

## Git Naming Conventions

- **PR Naming**: `type(scope): message`
- **Types**: feat, fix, chore, ref, polish, revert
- **Scope**: Refers to the domain or epic feature being covered e.g ui, test, db, tooling, fnf (fire and flames feature), sparks (currency feature). Can be excluded if scope is general
- **Examples**: `feat(ui): Update visual design of scheduling page`, `fix(db): RLS policy on flames table`, `chore(fnf): Add i18n strings for reward messages`, `fix: Correct fuel calculation on overburn`
- **Branch Naming**: Prefixed by type, followed by kebab-case name for the branch, e.g. `feat/flame-visual-design`, `fix/overburn-calculation`
- **Commits**: Very brief 1-line summary of the change

## Scripts
See @package.json for available scripts for this project.

## Database Migrations

- **RLS Policy Principle of Least Privilege**: Before adding an INSERT, UPDATE, or DELETE RLS policy, consider whether the operation is performed by the client (via `createClientWithAuth`) or by the server (via SECURITY DEFINER RPCs / `createServiceClient`). If a table is only mutated by server-side RPCs, clients should only have a SELECT policy. SECURITY DEFINER functions bypass RLS, so they don't need client-facing write policies.
- **Trigger-managed rows**: Tables like `profiles` and `user_state` that are auto-created by database triggers (SECURITY DEFINER) don't need client INSERT policies.
- **Applying migrations locally**: Use `pnpm db:migrate` to apply pending migrations to the local database. Never use `db:reset` to test migrations as it wipes all local data. `db:push` is for pushing to the remote/production database only.

## Workflow
- Create a new appropriately named branch before making changes
- Regenerate types and run migrations after making DB changes
- Keep commits as atomically scoped as possible to allow ease of reading history
- If making a new PR, include a brief and well-structured summarization of your changes in the description
