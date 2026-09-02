# Phase 7 — Frontend Data Integration

## Goal

Move the frontend from static catalogue data to the production data source without unnecessary UI rewrites.

Current source:

`client/src/data/catalogue.ts`

Current product contract:

`ShowcaseProduct`

## Strategy

Create a mapping/adapter layer if necessary:

```text
Supabase product row
        ↓
mapper/adapter
        ↓
ShowcaseProduct
        ↓
existing UI
```

This is preferred over rewriting every page around database-specific fields.

## Services

Use frontend services such as:

```text
client/src/services/products.ts
client/src/services/categories.ts
client/src/services/images.ts
```

Do not scatter raw database queries across page components.

## Catalogue

Preserve:
- search
- filtering
- sorting
- existing visual design
- route behavior

Use efficient queries.

Do not fetch unnecessary data.

## Product detail

Preserve:

`/catalogue/:slug`

The detail page should query by slug through the service/data layer.

Handle:
- loading
- missing product
- network/database error
- missing image

## Migration safety

Keep the static catalogue available until Supabase data is verified.

Only remove static production data after successful migration and testing.
