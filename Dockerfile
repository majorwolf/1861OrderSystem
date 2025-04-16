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

# Create simplified direct production server file
COPY docker-server.js ./

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
COPY --from=builder /app/docker-server.js ./docker-server.js

# Expose the port
EXPOSE 5000

# Command to run the application using our simplified production server
CMD ["node", "docker-server.js"]