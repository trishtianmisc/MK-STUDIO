# Phase 10 — Production Security and Hardening

## Security checklist

Before launch verify:

- HTTPS
- production environment variables
- no secrets in source control
- no service-role key in client bundle
- Supabase RLS enabled and tested
- admin authorization enforced
- input validation
- output/error handling
- safe file uploads
- sensible rate limiting
- secure CORS configuration
- dependency audit
- no sensitive data in logs
- no debug endpoints exposed

## Environment

Keep development and production credentials separate.

Use `.env.example` with placeholders.

Never commit real `.env` files.

## API

Use appropriate status codes.

Do not leak:
- stack traces
- SQL/database details
- internal paths
- credentials
- tokens

## Admin

Assume attackers can bypass the UI.

All privileged actions must be protected at the server/database layer.

## Final review

Run a production build and inspect the generated application for accidental secrets, debug code, and obvious security issues.
