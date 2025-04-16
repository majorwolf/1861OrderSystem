#!/bin/bash

# 1861 Public House Deployment Script
# This script builds and deploys the restaurant ordering system using Docker Compose

set -e # Exit on any error

echo "===== 1861 Public House Ordering System Deployment ====="
echo "Starting deployment process..."

# Check if docker and docker-compose are installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Verify that required files exist
if [ ! -f "docker-compose.yml" ]; then
    echo "Error: docker-compose.yml file not found. Are you in the right directory?"
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    echo "Error: Dockerfile not found. Are you in the right directory?"
    exit 1
fi

if [ ! -f ".env.production" ]; then
    echo "Error: .env.production file not found. Please create this file first."
    exit 1
fi

# Make sure the database initialization script is executable
if [ -f "scripts/init-db.sh" ]; then
    chmod +x scripts/init-db.sh
    echo "Made database initialization script executable"
fi

# Make sure the QR code generation script is executable
if [ -f "scripts/generate-qr.sh" ]; then
    chmod +x scripts/generate-qr.sh
    echo "Made QR code generation script executable"
fi

# Prompt to set SESSION_SECRET if it's the default
grep -q "change_this_to_a_secure_random_string_in_production" .env.production
if [ $? -eq 0 ]; then
    echo "Warning: You are using the default SESSION_SECRET. This is insecure for production."
    echo -n "Would you like to generate a random secure SESSION_SECRET? (y/n): "
    read answer
    if [ "$answer" = "y" ]; then
        # Generate random string and replace in .env.production
        NEW_SECRET=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
        sed -i "s/change_this_to_a_secure_random_string_in_production/$NEW_SECRET/" .env.production
        echo "SESSION_SECRET updated with a secure random string"
    else
        echo "Please update SESSION_SECRET manually before deploying to production"
    fi
fi

# Optional: Prompt for server IP/domain for QR code generation
echo -n "Enter the server IP or domain for QR code generation (e.g., 192.168.1.100 or example.com), or leave empty to skip: "
read SERVER_IP

if [ ! -z "$SERVER_IP" ]; then
    # Set BASE_URL environment variable for QR code generation
    export BASE_URL="http://$SERVER_IP:5000"
    echo "BASE_URL set to $BASE_URL for QR code generation"
fi

# Build and deploy with docker-compose
echo "Building Docker images..."
docker-compose build

echo "Starting containers..."
docker-compose up -d

echo "Containers started successfully!"

# Generate QR codes if SERVER_IP was provided
if [ ! -z "$SERVER_IP" ]; then
    echo "Generating QR codes for tables..."
    docker-compose exec app ./scripts/generate-qr.sh
    echo "QR codes generated. They are available in the qr-codes directory inside the container."
    echo "You can copy them to your local machine using:"
    echo "  docker cp \$(docker-compose ps -q app):/app/qr-codes ."
fi

echo "===== Deployment Complete ====="
echo "The application should now be running at: http://$SERVER_IP:5000"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop the application: docker-compose down"
echo ""
echo "Staff Views:"
echo "- Kitchen View: http://$SERVER_IP:5000/kitchen"
echo "- Bar View: http://$SERVER_IP:5000/bar"
echo "- Admin View: http://$SERVER_IP:5000/admin"