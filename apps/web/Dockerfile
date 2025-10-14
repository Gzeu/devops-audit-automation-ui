FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
RUN npm install -g pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY . .

# Build UI package first
WORKDIR /app/packages/ui
RUN pnpm build

# Build web application
WORKDIR /app/apps/web
RUN pnpm build

# Production image, copy all the files and run remix
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 remixuser

# Copy built application
COPY --from=builder --chown=remixuser:nodejs /app/apps/web/build ./build
COPY --from=builder --chown=remixuser:nodejs /app/apps/web/package.json ./
COPY --from=deps --chown=remixuser:nodejs /app/apps/web/node_modules ./node_modules

USER remixuser

EXPOSE 3000

CMD ["npm", "start"]