docker compose up postgress -d

cd my-turborepo && pnpm install

cd my-turborepo/packages/prisma && npx prisma migrate deploy

cd my-turborepo/packages/prisma && pnpm db:generate

cd my-turborepo/packages/prisma && pnpm db seed

cd my-turborepo/packages/prisma && npx prisma studio