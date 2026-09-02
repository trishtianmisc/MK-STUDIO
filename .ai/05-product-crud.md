# Phase 5 — Product CRUD

## Goal

Implement secure product management while preserving the existing frontend contract.

## Backend

Use the established `server/` structure:

```text
server/
├── routes/
├── controllers/
├── services/
└── validators/
```

Keep responsibilities clear.

Routes handle routing.
Controllers handle HTTP requests/responses.
Services contain business/data logic.
Validators validate input.

## Product operations

Implement only the approved catalogue requirements:

- create
- read
- update
- deactivate/delete according to the data policy
- featured flag
- category
- rental price
- availability/status
- descriptive fields
- sizes
- image relationships

Do not implement:
- checkout
- cart
- customer accounts
- booking dates
- automated rental conflict checking
- payment processing

## Validation

Reject malformed or invalid product data.

Use appropriate HTTP responses.

## Errors

Handle:
- 400 invalid input
- 401 unauthenticated
- 403 unauthorized
- 404 missing product
- 409 conflicts
- 429 rate limits
- 500 unexpected errors

Do not expose internal errors to customers.

## Verification

Test every CRUD operation and authorization boundary.
