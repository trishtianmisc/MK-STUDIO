# Phase 4 — Supabase RLS and Security

## Goal

Secure the database and backend against unauthorized access.

## Rules

Treat the frontend as untrusted.

RLS must enforce authorization at the database layer.

## Public catalogue

Determine which product/category operations are public.

Typically:
- public users can read published/visible catalogue data
- public users cannot create/update/delete products
- public users cannot manage product images

## Admin operations

Authorized admins may:
- create products
- update products
- deactivate/delete products according to the approved data policy
- manage categories
- manage product images

## Important

Do not use the Supabase service-role key in browser code.

If server-side privileged access is ever required:
- keep credentials server-only
- validate the caller
- keep the operation narrow
- never bypass authorization casually

## Validation

Validate data before database writes.

Validate uploaded files separately.

## Rate limiting

Apply rate limiting where it is useful, especially:
- login
- privileged API operations
- upload endpoints

Do not introduce excessive infrastructure.

## Verification

Attempt unauthorized operations directly, not only through the UI.

Confirm RLS rejects them.
