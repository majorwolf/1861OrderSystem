#!/bin/bash

# Database initialization script for 1861 Public House ordering system
# This script initializes the PostgreSQL database with the schema and initial data

set -e

echo "Database initialization script started..."

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h "$PGHOST" -U "$PGUSER"; do
  echo "Postgres is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is ready - initializing database..."

# Create schema using our production server
echo "Creating database schema..."
NODE_ENV=production node ./server/production.js --setup-db-only || {
  echo "Failed to create database schema"
  exit 1
}

echo "Database initialization completed successfully!"