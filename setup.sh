#!/bin/bash

# 1861 Public House Order System Setup Script
echo "Setting up 1861 Public House Order System..."
echo "=================================================="

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js v18 or later."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Node.js version is $NODE_VERSION. Version 18 or later is required."
    exit 1
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if .env file exists, create if not
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/orderingsystem
PGUSER=postgres
PGHOST=localhost
PGPASSWORD=postgres
PGDATABASE=orderingsystem
PGPORT=5432

# Server
PORT=5000
NODE_ENV=development
EOF
    echo ".env file created with default settings."
    echo "IMPORTANT: Please update the database credentials in .env file if needed."
fi

# Check if PostgreSQL is installed and running
echo "Checking PostgreSQL..."
if command -v pg_isready &> /dev/null; then
    if pg_isready &> /dev/null; then
        echo "PostgreSQL is running."
    else
        echo "PostgreSQL is installed but not running. Please start your PostgreSQL server."
        exit 1
    fi
else
    echo "PostgreSQL client not found. Please make sure PostgreSQL is installed."
    echo "You'll need to manually setup the database."
fi

# Setup database
echo "Pushing database schema..."
npm run db:push

# Seed database
echo "Seeding database with initial data..."
npx tsx db-seed.ts

echo "=================================================="
echo "Setup completed!"
echo "To start the application, run: npm run dev"
echo "The application will be available at: http://localhost:5000"