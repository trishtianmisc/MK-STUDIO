# Phase 2 — Supabase Database

## Goal

Design and implement the Supabase PostgreSQL schema based on the existing MK Studio frontend contract.

Before writing SQL, inspect `client/src/data/catalogue.ts` and the existing `ShowcaseProduct` type.

The database must account for the existing product fields, including:

- id
- slug
- name
- category
- categoryLabel
- description
- details
- sizing
- sizes
- fabric
- color
- rentalPrice
- availability
- unavailableDays
- rentalNote
- featured

## Principles

- Use PostgreSQL-native types where appropriate.
- Prefer relational structure for entities that need relationships.
- Use constraints for data integrity.
- Add useful indexes, especially for slug/category/status queries.
- Do not store secrets in the database.
- Do not invent booking/rental-date functionality; this project is a catalogue.

## Likely core entities

Evaluate:

- categories
- products
- product_images

Do not finalize the schema until it has been compared against the current frontend data.

## Migration

Create version-controlled SQL under:

```text
supabase/migrations/
```

Do not destroy the old Drizzle schema.

## Verification

Test:
- constraints
- inserts
- updates
- slug lookup
- category relationships
- expected product fields

Stop before implementing Auth/RLS unless explicitly requested.
