You are an AI Developer Agent. I want you to fully dockerize my existing monorepo project.

Project structure:
- apps/frontend → Next.js 15
- apps/backend → NestJS
- packages/prisma → Prisma ORM
- docker-compose.yml (currently only runs PostgreSQL)

Goal:
Convert the entire system to a fully containerized application.

Requirements:
1. Create Dockerfile for apps/frontend (Next.js) with:
   - production build
   - support for hot reload in development mode

2. Create Dockerfile for apps/backend (NestJS) with:
   - production build
   - hot reload using ts-node-dev for development

3. Create Dockerfile for packages/prisma to run:
   - prisma generate
   - prisma migrate deploy

4. Update docker-compose.yml to include services:
   - postgres
   - backend
   - frontend
   - prisma-migrate

5. Ensure all services use environment variables correctly:
   - DATABASE_URL should use: postgresql://esgriba:esgriba123@postgres:5432/esgribadb
   - NEXT_PUBLIC_API_URL should point to backend container name

6. Implement volume mounts:
   - for frontend source code
   - for backend source code
   - so hot reload works inside docker

7. Ensure that:
   - `docker compose up --build` starts the entire system
   - frontend runs on http://localhost:3000
   - backend runs on http://localhost:4000
   - postgres runs on 5432

8. Do NOT change the monorepo architecture.

9. Write all generated files directly into the project:
   - apps/frontend/Dockerfile
   - apps/backend/Dockerfile
   - packages/prisma/Dockerfile
   - docker-compose.yml

10. After generating files, provide instructions on how to run the full system.

Begin now.
