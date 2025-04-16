# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Make sure the public directory exists
RUN mkdir -p public

# Copy production environment file
COPY .env.production .env

# Build the application
RUN npm run build
# Copy client build to public directory
RUN mkdir -p public && cp -r dist/client/* public/ || true

# Production stage
FROM node:20-slim

# Install essential tools for health checks and database init script
RUN apt-get update && \
    apt-get install -y wget postgresql-client && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies) since we need them for running in production
# The codebase currently imports Vite even in production mode
RUN npm ci

# Copy built application from the builder stage
COPY --from=builder /app/dist ./dist
# Create public directory for static files
RUN mkdir -p ./public
# Copy static files (if exists)
COPY --from=builder /app/public ./public || true
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/attached_assets ./attached_assets
COPY --from=builder /app/server/production.js ./server/production.js

# Copy scripts directory
COPY scripts/ ./scripts/
RUN chmod +x scripts/init-db.sh

# Expose the port the app runs on
EXPOSE 5000

# Command to run the production server instead of using npm start
CMD ["node", "server/production.js"]