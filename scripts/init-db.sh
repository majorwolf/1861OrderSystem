#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for PostgreSQL to start..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c '\q'; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL started, running database setup..."

# Run database migrations
NODE_ENV=production npm run db:push

echo "Database initialization completed!"