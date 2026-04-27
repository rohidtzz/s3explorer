# Build stage for client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY apps/client/package*.json ./
RUN npm ci
COPY apps/client/ ./
RUN npm run build

# Build stage for server
FROM node:20-alpine AS server-builder
WORKDIR /app/server

# Install native deps for better-sqlite3 compilation
RUN apk add --no-cache python3 make g++

COPY apps/server/package*.json ./
RUN npm ci
COPY apps/server/ ./
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# python3/make/g++ for the better-sqlite3 native rebuild; su-exec for the
# entrypoint to drop from root → node after fixing volume ownership.
RUN apk add --no-cache python3 make g++ su-exec

# Copy server build and dependencies
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/node_modules ./node_modules
COPY --from=server-builder /app/server/package*.json ./

# Rebuild native modules for Alpine
RUN npm rebuild better-sqlite3

# Copy client build to be served by the server
COPY --from=client-builder /app/client/dist ./public

# /data is reconciled by the entrypoint at runtime so bind mounts and managed
# volumes (Railway, etc.) work regardless of the host's mount permissions.
RUN mkdir -p /data

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/data

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
