# Phase 3 — Authentication and Admin

## Goal

Replace the existing hardcoded admin authentication with secure Supabase Auth.

Inspect first:

- `client/src/lib/adminAccess.ts`
- `client/src/pages/AdminAccess.tsx`
- `client/src/pages/AdminPreview.tsx`

## Requirements

- Use Supabase Auth for admin login.
- Do not store passwords in the application database.
- Do not implement client-only admin protection.
- Authorization must be enforced outside the UI as well.
- Preserve the existing `/admin` route.
- Preserve the current UI style unless explicitly asked to redesign it.

## Admin authorization

Choose and document a secure authorization model compatible with Supabase RLS.

The database must be able to distinguish authorized admins from ordinary authenticated users.

Do not rely on:
- hidden buttons
- frontend route guards alone
- localStorage flags
- hardcoded passwords
- hardcoded admin IDs

## Session handling

Handle:
- login
- logout
- session restoration
- expired sessions
- unauthorized access

Provide user-friendly errors without exposing technical details.

## Verification

Test:
- valid login
- invalid login
- logout
- refresh while authenticated
- refresh while unauthenticated
- direct access to admin operations
- non-admin access

Stop before unrelated features.
