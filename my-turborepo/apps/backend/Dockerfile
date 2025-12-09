# Backend Dockerfile - Using Debian for better native module support
FROM node:20-slim AS base

# Install dependencies for Prisma and native modules
RUN apt-get update && apt-get install -y \
    openssl \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy package files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/prisma/package.json ./packages/prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=deps /app/packages/prisma/node_modules ./packages/prisma/node_modules

# Copy source code
COPY . .

# Generate Prisma Client
WORKDIR /app/packages/prisma
RUN pnpm prisma generate

# Build backend
WORKDIR /app/apps/backend
RUN pnpm run build

# Production image - Use slim for smaller size but with glibc
FROM node:20-slim AS runner
WORKDIR /app/apps/backend

# Install only runtime dependencies
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

ENV NODE_ENV=production

# Copy the root node_modules with .pnpm directory
COPY --from=builder /app/node_modules /app/node_modules

# Copy necessary files
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./package.json
COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/packages/prisma/schema.prisma ./schema.prisma
COPY --from=builder /app/packages/prisma/migrations ./migrations
COPY --from=builder /app/packages /app/packages

EXPOSE 4000

ENV PORT=4000
ENV DATABASE_URL="postgresql://esgriba:esgriba123@postgres:5432/esgribadb?schema=public"

CMD ["node", "dist/main.js"]
