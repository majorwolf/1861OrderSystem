#!/bin/bash

# Exit on error
set -e

echo "Setting up 1861 Public House Ordering System..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker and Docker Compose before proceeding."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose before proceeding."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo ".env file created. You may want to edit it with your specific configuration."
else
    echo ".env file already exists. Using existing configuration."
fi

# Build and start the containers
echo "Building and starting Docker containers..."
docker-compose up -d --build

# Wait for the database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "Running database migrations..."
docker-compose exec app npm run db:push

echo "Setup completed successfully!"
echo "The application is now running at http://localhost:5000"