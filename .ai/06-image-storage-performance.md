# Phase 6 — Product Image Storage and Performance

## Goal

Implement safe, performant product image management using Supabase Storage.

## Upload security

Treat every uploaded file as untrusted.

Validate:
- file type
- file size
- filename/path safety
- number of files where appropriate

Do not trust a browser-provided MIME type alone.

Use safe storage paths and avoid arbitrary path traversal.

## Storage architecture

Use Supabase Storage for production product images.

Maintain a relationship between products and their images rather than embedding an uncontrolled list of URLs in UI code.

## Performance

Fashion images are a major performance concern.

Prefer:
- appropriately resized images
- WebP/AVIF when supported by the chosen workflow
- thumbnails for catalogue cards
- larger images only when needed
- lazy loading below the fold
- responsive image dimensions
- avoiding multi-megabyte originals as routine browser assets

Do not download every high-resolution image on the homepage.

## Migration

Keep current local images until the Supabase migration is verified.

Do not delete local images prematurely.

## Verification

Test:
- upload
- invalid file rejection
- oversized file rejection
- image deletion
- broken image fallback
- mobile image loading
- catalogue performance
