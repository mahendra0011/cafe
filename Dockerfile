# Multi-stage Dockerfile for 7 Bites Cafe OS
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project source
COPY . .

# Set Nitro preset to node-server for standalone HTTP server
ENV NITRO_PRESET=node-server
ENV NODE_ENV=production

# Build client, SSR, and Nitro standalone server
RUN npm run build

# Production runner stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=10000
ENV HOST=0.0.0.0

# Copy built outputs from builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./

EXPOSE 10000

CMD ["node", ".output/server/index.mjs"]
