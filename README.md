# Food Review Blog Platform

Fullstack Food Review Blog Platform with separated frontend and backend.

## Stack

- Frontend: Next.js, TypeScript, TailwindCSS, React Query, Axios
- Backend: Node.js, Express.js, TypeScript, PostgreSQL, Prisma ORM, JWT Authentication, Cloudinary, Google OAuth
- Infra: Docker Compose, Postgres, Redis, GitHub Actions

## Quick start

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

docker-compose up --build
```

Open:

- Frontend: http://localhost:3000
- Backend health: http://localhost:4000/api/v1/health

## Required production secrets

```bash
JWT_ACCESS_SECRET=replace-with-a-long-access-secret-minimum-24-chars
JWT_REFRESH_SECRET=replace-with-a-long-refresh-secret-minimum-24-chars
GOOGLE_CLIENT_ID=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Cloudinary variables are required for avatar, restaurant image and review image uploads.

## Backend scripts

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
npm run build
npm run start
```

## Frontend scripts

```bash
cd frontend
npm install
npm run lint
npm run build
npm run start
```

## API base

Frontend uses:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```
