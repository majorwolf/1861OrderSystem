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

# Stop any running containers for this project
echo "Stopping any existing containers..."
docker-compose down

# Build and start the containers
echo "Building and starting Docker containers..."
docker-compose up -d --build

# Wait for the database to be ready
echo "Waiting for database to be ready..."
max_retries=30
counter=0
until docker-compose exec postgres pg_isready -U "${PGUSER:-orderapp}" || [ $counter -eq $max_retries ]; do
    echo "Waiting for database connection..."
    sleep 2
    counter=$((counter+1))
done

if [ $counter -eq $max_retries ]; then
    echo "Failed to connect to database after multiple attempts."
    echo "Please check your PostgreSQL container logs with: docker-compose logs postgres"
    exit 1
fi

# Run database migrations
echo "Running database migrations..."
docker-compose exec app npm run db:push

echo "Setup completed successfully!"
echo "The application is now running at http://localhost:5000"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop the application:"
echo "  docker-compose down"
echo ""
echo "To stop and remove all data (including database):"
echo "  docker-compose down -v"