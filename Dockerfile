# ==========================================
# STAGE 1: Build Frontend and Backend Assets
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install all dependencies (including devDependencies for TypeScript & Vite)
RUN npm ci

# Copy full application codebase
COPY . .

# Set build environment to production
ENV NODE_ENV=production

# Build static assets & server bundle
RUN npm run build

# ==========================================
# STAGE 2: Production Execution Environment
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment flags
ENV NODE_ENV=production
ENV PORT=3000

# Install non-root security user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S expressjs -u 1001

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built bundles and static assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/index.html ./index.html
COPY --from=builder /app/server ./server

# Change file ownership to unprivileged user
USER expressjs

# Expose server HTTP port
EXPOSE 3000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/healthz || exit 1

# Start production server
CMD ["node", "dist/server.cjs"]
