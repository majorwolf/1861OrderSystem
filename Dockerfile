# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Copy production environment file
COPY .env.production .env

# Build the application
RUN npm run build

# Production stage
FROM node:20-slim

# Install essential tools for health checks and database init script
RUN apt-get update && \
    apt-get install -y wget postgresql-client && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built application from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./.env

# Copy scripts directory
COPY scripts/ ./scripts/
RUN chmod +x scripts/init-db.sh

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]