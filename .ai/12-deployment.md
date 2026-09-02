# Phase 12 — Deployment and Release

## Goal

Publish MK Studio safely.

## Pre-deployment

Verify:
- build passes
- tests pass
- environment variables are configured
- Supabase production project is ready
- migrations are applied
- RLS is enabled
- storage policies are correct
- admin account works
- public catalogue works

## Vercel

Deploy the frontend using the project's approved Vercel configuration.

If Express is deployed separately, configure the production API URL and CORS appropriately.

Do not assume local URLs work in production.

## Production smoke test

After deployment test:

- `/`
- `/catalogue`
- `/catalogue/<known-slug>`
- `/about`
- `/contact`
- `/admin`

Also test:
- refresh on nested routes
- mobile layout
- images
- admin login
- product management
- logout

## Rollback

Know the last working deployment/commit before publishing a risky change.

Never perform an emergency production change without a rollback path.
