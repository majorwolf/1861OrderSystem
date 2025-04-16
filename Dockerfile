# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Replace server/db.ts with Docker-compatible version
RUN mv server/db-docker.ts server/db.ts

# Add our build script
COPY docker-build.sh ./
RUN chmod +x docker-build.sh

# Build the application and transpile TypeScript files
RUN ./docker-build.sh

# Create simplified direct production server files
COPY server-prod.js ./
COPY docker-db.js ./

# Production stage
FROM node:20-alpine

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/public ./client/public
COPY --from=builder /app/server-prod.js ./server-prod.js
COPY --from=builder /app/docker-db.js ./docker-db.js
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/server ./server

# Expose the port
EXPOSE 5000

# Command to run the application using our simplified production server
CMD ["node", "server-prod.js"]