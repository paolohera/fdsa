# FDSA Admin Portal - AI Development Rules

## Project

This is the FDSA Flight Dynamics School of Aeronautics
website and administrative dashboard.

## Development Rules

1. Inspect existing code before making changes.
2. Do not rewrite existing components unless necessary.
3. Do not modify unrelated functionality.
4. Preserve the existing FDSA visual identity.
5. Reuse existing components and utilities.
6. Do not install dependencies unless absolutely necessary.
7. Never create duplicate authentication systems.
8. Preserve existing Supabase authentication.
9. Protect admin routes.
10. Always verify the production build after significant changes.

## UI Rules

- Maintain the existing navy, cream, white, and gold visual language.
- Keep the dashboard responsive.
- Mobile layouts must remain functional.
- Do not introduce unnecessary animations.
- Buttons must have visible hover and focus states.
- Icons must have sufficient contrast.
- Modals must be viewport-level and must not be clipped by dashboard containers.

## Authentication

- Use the existing authentication implementation.
- Never bypass authentication.
- Never hardcode credentials.
- Logout must invalidate the existing session.
- Protected admin pages must remain protected.

## Before Editing

First inspect:
- relevant components
- authentication logic
- routing
- database calls
- existing reusable components
- existing styling conventions

Then make the smallest appropriate change.

## After Editing

Verify:
- no TypeScript/JavaScript errors
- no console errors
- no broken imports
- no broken routes
- production build succeeds
- existing functionality still works