FROM node:20-slim

# Install essential tools for health checks and database init script
RUN apt-get update && \
    apt-get install -y wget postgresql-client && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Make sure the init script is executable
RUN chmod +x scripts/init-db.sh

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]