# ============================================
# BUILD STAGE
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

# Install dependencies
RUN npm ci

# Copy source
COPY src ./src

# Build
RUN npm run build

# ============================================
# RUNTIME STAGE
# ============================================
FROM node:18-alpine

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache curl tini

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy prisma schema
COPY prisma ./prisma

# Copy built app from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Entrypoint
ENTRYPOINT ["/sbin/tini", "--"]

# Start app
CMD ["node", "dist/index.js"]

# Metadata
LABEL org.opencontainers.image.title="Novalis Backend"
LABEL org.opencontainers.image.description="Backend API para Novalis - Sistema de Inteligência Imobiliária"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.authors="Kauã Santos Novaes"
