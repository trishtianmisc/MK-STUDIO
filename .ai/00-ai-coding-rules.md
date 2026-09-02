# MK Studio — AI Coding Rules

These rules apply to every future coding task in this project.

## Core rule

Inspect before changing. Understand the existing implementation before proposing or modifying code.

## Change discipline

- Make the smallest change that correctly solves the requested task.
- Do not rewrite working components without a concrete reason.
- Do not modify unrelated files.
- Preserve existing UI, routes, behavior, and design unless explicitly asked.
- Do not silently change architectural decisions.
- If an architectural choice is unclear, stop and explain the options.

## Dependencies

Before installing a package:
1. Check whether the project already has an equivalent dependency.
2. Explain why the new package is necessary.
3. Prefer the smallest dependency footprint.

Do not add libraries merely because they are popular.

## Security

- Never hardcode secrets.
- Never expose Supabase service-role credentials in client code.
- Never bypass Supabase RLS for convenience.
- Validate untrusted input.
- Treat uploaded files as untrusted.
- Do not expose stack traces or database errors to customers.

## Verification

Never claim a change works without verifying it.

After meaningful changes:
- run the relevant type checks
- run tests
- run the production build when appropriate
- inspect console/build errors
- verify affected user flows

## Data integrity

Keep one source of truth for production data.

During migration, static catalogue data may remain temporarily, but it must not become a second permanent database.

Do not perform destructive database operations without explicit approval.

## Git discipline

Before major changes, create a checkpoint commit.

Prefer small, logical commits.

## Performance

- Avoid unnecessary network requests.
- Avoid fetching data that the current screen does not need.
- Optimize product images.
- Use lazy loading where appropriate.
- Avoid unnecessary dependencies and client-side JavaScript.
- Do not add caching or infrastructure complexity without evidence it is needed.

## Stop conditions

If a requested change could break existing functionality, affect security, delete data, or require a major architectural decision, stop and explain before proceeding.
