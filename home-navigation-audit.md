# MK Studio Collection Rail — Navigation Audit

The redesigned homepage remains a frontend-only experience. Its calls to action route into existing pages or scroll to named homepage sections; no backend actions are triggered.

| Homepage control | Verified destination | Behavior |
|---|---|---|
| Shop the edit | `#discover` | Smooth-scrolls to discovery doors |
| New in | `#current-edit` | Smooth-scrolls to the current edit shelf |
| How it works | `#rental-ritual` | Smooth-scrolls to the rental ritual |
| Shop the collection / View all pieces | `/catalogue` | Opens the existing catalogue |
| Wedding edit / After dark / Studio days | `/catalogue` | Opens the existing catalogue |
| Product card | `/catalogue/:slug` | Opens the corresponding existing product-detail page |
| Order shortcut | `/order` | Opens the existing frontend-only rental order page |
| Footer catalogue / story / contact | `/catalogue`, `/about`, `/contact` | Opens existing routes |
| Mobile Contact the studio | `/contact` | Opens the existing contact page |

The automated UI coverage in `client/src/pages/Home.test.tsx` exercises this matrix alongside the pre-existing test suite.
