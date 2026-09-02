# MK Studio — Final Production Checklist

Do not publish until the following have been reviewed.

## Architecture

- [ ] Frontend and backend responsibilities are clear
- [ ] No unnecessary architecture/dependencies
- [ ] No duplicated production data sources
- [ ] Legacy Drizzle usage is understood

## Security

- [ ] Supabase RLS tested
- [ ] Admin authorization tested outside UI
- [ ] No service-role key in frontend
- [ ] No real secrets committed
- [ ] Input validation implemented
- [ ] Upload validation implemented
- [ ] Rate limiting applied where appropriate
- [ ] Production CORS configured
- [ ] Technical errors hidden from customers

## Database

- [ ] Schema finalized
- [ ] Migrations version-controlled
- [ ] Indexes reviewed
- [ ] Constraints reviewed
- [ ] Backup/recovery approach understood
- [ ] No destructive migration without backup/approval

## Catalogue

- [ ] Products load
- [ ] Search works
- [ ] Filters work
- [ ] Product detail works
- [ ] Missing products handled
- [ ] Empty state handled
- [ ] Availability display is informational only
- [ ] Existing product fields preserved

## Admin

- [ ] Login works
- [ ] Logout works
- [ ] Unauthorized users blocked
- [ ] Create works
- [ ] Edit works
- [ ] Deactivate/delete works as intended
- [ ] Image management works
- [ ] Validation works
- [ ] Error handling works

## Performance

- [ ] Images optimized
- [ ] Lazy loading used where appropriate
- [ ] No unnecessary requests
- [ ] No obvious N+1 queries
- [ ] Production build tested
- [ ] Mobile tested
- [ ] Desktop tested
- [ ] No serious console errors

## Deployment

- [ ] Production environment variables configured
- [ ] Database migrations applied
- [ ] Storage configured
- [ ] Domain works
- [ ] HTTPS works
- [ ] Nested routes work after refresh
- [ ] Production smoke test completed
- [ ] Rollback path known

## Final rule

If a critical checklist item fails, do not publish.

Fix it, verify it, and only then proceed.
