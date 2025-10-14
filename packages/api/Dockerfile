FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 py3-pip bash
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY packages/api/package.json ./packages/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
RUN apk add --no-cache python3 bash
WORKDIR /app
RUN npm install -g pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/api/node_modules ./packages/api/node_modules
COPY . .

# Build API package
WORKDIR /app/packages/api
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
RUN apk add --no-cache python3 bash
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apiuser

# Copy built application
COPY --from=builder --chown=apiuser:nodejs /app/packages/api/dist ./dist
COPY --from=builder --chown=apiuser:nodejs /app/packages/api/package.json ./
COPY --from=deps --chown=apiuser:nodejs /app/packages/api/node_modules ./node_modules

# Copy core scripts
COPY --from=builder --chown=apiuser:nodejs /app/packages/core/scripts ./scripts
RUN chmod +x ./scripts/*.sh

USER apiuser

EXPOSE 3001

CMD ["node", "dist/index.js"]