# Phase 1 — Project Architecture

## Goal

Prepare the existing MK Studio project for a professional full-stack architecture.

## Stack

- React
- TypeScript
- Vite
- wouter
- Tailwind CSS
- Express
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase RLS
- pnpm

## Target

```text
MK-Studio/
├── client/                 # FRONTEND
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── features/
│       ├── services/
│       ├── hooks/
│       ├── contexts/
│       ├── lib/
│       ├── types/
│       ├── data/           # temporary migration source
│       └── images/         # temporary migration source
├── server/                 # BACKEND: Node + Express + TypeScript
│   ├── config/
│   ├── lib/
│   ├── middleware/
│   ├── services/
│   ├── controllers/
│   ├── routes/
│   ├── validators/
│   ├── types/
│   └── index.ts
├── supabase/               # Supabase migrations/seeds
│   ├── migrations/
│   └── seed.sql
├── shared/
│   ├── types/
│   └── schemas/
├── drizzle/                # legacy until verified unused
└── tests/
```

## Instructions

Inspect the existing code first. Establish only the folders/files that are actually justified.

Do not implement database tables, Auth, RLS, Storage, CRUD, or catalogue migration in this phase.

Preserve:
- existing routes
- wouter
- existing UI
- `client/src/data/catalogue.ts`
- current admin pages
- current Drizzle files

Verify build/type checks after restructuring.

Stop after Phase 1.
