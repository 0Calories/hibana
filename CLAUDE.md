# Hibana

Gamified productivity platform using fire/flame metaphors. Habits are Flames, Time is Fuel, and Sparks are currency that can be redeemed for prizes.

## Git Naming Conventions

- **Conventional Commits**: `type(scope): message`
- **Types**: feat, fix, chore, ref, polish, revert
- **Scope**: Refers to the domain or epic feature being covered e.g ui, test, db, tooling, fnf (fire and flames feature), sparks (currency feature). Can be excluded if scope is general
- **Examples**: `feat(ui): Update visual design of scheduling page`, `fix(db): RLS policy on flames table`, `chore(fnf): Add i18n strings for reward messages`, `fix: Correct fuel calculation on overburn`
- **Branch Naming**: Prefixed by type, followed by kebab-case name for the branch, e.g. `feat/flame-visual-design`, `fix/overburn-calculation`

## Scripts
See @package.json for available scripts for this project.

## Workflow
- Create a new appropriately named branch before making changes
- Run linter and formatter before committing
- Regenerate types and run migrations after making DB changes
- Include a brief and well-structured summarization of your changes in the commit message