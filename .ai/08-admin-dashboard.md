# Phase 8 — Admin Dashboard

## Goal

Build the real admin management experience using the approved backend architecture.

## Admin capabilities

The admin should be able to manage:

- products
- categories
- product images
- rental price
- availability/status
- visibility
- featured status
- product metadata

## UX

Provide:
- loading states
- success feedback
- validation messages
- error states
- confirmation before destructive actions
- empty states
- upload progress where appropriate

Do not expose raw database errors.

## Safety

Destructive operations must require deliberate user action.

Do not allow unauthorized users to perform operations by calling the API directly.

RLS/backend authorization remains the final enforcement layer.

## Preserve

Keep the existing site's visual identity and routing unless redesign is explicitly requested.
