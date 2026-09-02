# Phase 9 — Testing and Quality

## Goal

Prevent regressions and catch AI-generated bugs before production.

## Test levels

Use the existing project tooling where possible.

### Unit tests

Test:
- validation
- formatters
- mapping/adapter logic
- utility functions

### Integration tests

Test:
- product service
- category service
- authentication boundaries
- API responses
- database interactions where practical

### End-to-end/manual flows

Verify:
- homepage
- catalogue
- search
- filters
- product detail
- admin login
- product creation
- product editing
- product deactivation/deletion
- image upload
- logout

## Edge cases

Test:
- product does not exist
- no products
- no images
- broken image
- invalid input
- network failure
- expired session
- unauthorized user
- duplicate slug
- very long text
- invalid upload
- mobile viewport

## Quality gate

Before declaring a phase complete:
- no new TypeScript errors
- tests pass
- production build passes
- no unexplained console errors
- affected user flow manually verified

Never say "works" without verification.
