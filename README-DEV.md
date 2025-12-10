docker compose up postgres -d

cd my-turborepo && pnpm install

cd packages/prisma && npx prisma migrate deploy

cd packages/prisma && pnpm db:generate

cd packages/prisma && pnpm prisma db seed

cd packages/prisma && npx prisma studio