# Food Review Platform Production Audit Report

## Audit summary

### Fixed build/type/runtime issues
- Removed remote `next/font/google` dependency that broke offline and Docker builds.
- Added `Suspense` boundaries for pages using `useSearchParams` to satisfy Next.js 16 production build rules.
- Fixed backend TypeScript errors from Express 5 route params, Zod parsing and Prisma generated-type coupling.
- Fixed backend start path from `dist/server.js` to `dist/src/server.js`.
- Added deterministic Docker build steps and `.dockerignore` files.

### Removed incomplete static behavior
- Removed frontend fallback blog data and deleted the static `frontend/data` directory.
- Blog list/detail now render only real backend data or explicit empty/error states.
- Map page no longer references a missing static map image or hardcoded restaurant markers; it reads restaurants from `/restaurants`.
- Login form no longer ships with demo credentials.
- Seed file now creates only roles and categories, not sample users/posts.

### Backend improvements
- Added missing `RestaurantImage` model and migration SQL.
- Added restaurant image relations to repositories and services.
- Added stricter upload validation for JPEG, PNG, WEBP and GIF files.
- Added local domain types to avoid brittle generated Prisma type imports in source code.
- Kept Prisma runtime usage intact; generated client is still produced by `npx prisma generate` in CI/Docker.

### Frontend improvements
- Added React Query provider.
- Converted core list/detail/search/notification flows to React Query.
- Added filtering UI for posts and restaurants: area, price range, rating and sort.
- Added Google Identity Services button when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is configured.
- Preserved existing visual design and did not rewrite the UI.

## Verified in sandbox

```bash
cd frontend && npm install --no-audit --no-fund
cd frontend && npm run lint
cd frontend && npm run build
cd backend && npm install --no-audit --no-fund
cd backend && npm run build
```

All commands above completed successfully.

## Environment limitation

`npx prisma generate`, `prisma migrate` and `docker-compose up` could not be fully executed inside this sandbox because:

- Prisma CLI attempts to download native engines from `binaries.prisma.sh`, which is not reachable from the sandbox.
- Docker is not installed in the sandbox.

The project is configured so these commands run in normal development/CI/Docker environments with network and Docker available.
