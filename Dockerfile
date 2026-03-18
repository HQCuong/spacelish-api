# Multi-stage build for production optimization

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and config needed for build
COPY package.json yarn.lock ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install ALL dependencies (devDependencies needed for build: typescript, nest cli, etc.)
RUN yarn install --frozen-lockfile

# Copy source code
COPY src/ ./src/

# Build the application
RUN yarn build

# Stage 2: Production
FROM node:22-alpine AS production

WORKDIR /app

# Copy package files and install only production dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["node", "dist/main.js"]
