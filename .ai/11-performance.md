# Phase 11 — Production Performance

## Goal

Ensure the published MK Studio catalogue loads quickly and remains responsive.

## Priorities

### Images

- compress images
- resize appropriately
- use modern formats where practical
- lazy-load non-critical images
- avoid huge original files in the browser
- provide sensible fallbacks

### Data

- request only needed columns/data
- avoid repeated duplicate requests
- use indexed database fields for common queries
- paginate when catalogue size makes it useful
- avoid N+1 queries

### Frontend

- avoid unnecessary re-renders
- avoid oversized dependencies
- split code only when it provides a real benefit
- keep initial JavaScript reasonable

### Network

Avoid loading all products/images just because the catalogue exists.

## Verification

Measure the production build, not only the development server.

Test on:
- mobile
- slower network
- desktop

Check:
- initial page load
- catalogue load
- product detail load
- image loading
- interaction responsiveness

Do not add complex caching infrastructure without evidence it is necessary.
