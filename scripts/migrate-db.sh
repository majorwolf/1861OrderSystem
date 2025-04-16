#!/bin/bash

# Database migration script for 1861 Public House ordering system
# This script runs database migrations using Drizzle

set -e

echo "Database migration script started..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h "$PGHOST" -U "$PGUSER"; do
  echo "Postgres is unavailable - sleeping"
  sleep 1
done

echo -e "${GREEN}PostgreSQL is ready - running migrations...${NC}"

# Create a backup before migration
echo -e "${YELLOW}Creating backup before migration...${NC}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/app/backups"
mkdir -p $BACKUP_DIR
BACKUP_FILE="$BACKUP_DIR/pre_migration_${TIMESTAMP}.sql"

pg_dump -h "$PGHOST" -U "$PGUSER" "$PGDATABASE" > "$BACKUP_FILE"
echo -e "${GREEN}Backup created at $BACKUP_FILE${NC}"

# Run the migration
echo "Running database migration..."
if [ -f "node_modules/.bin/drizzle-kit" ]; then
  echo "Using drizzle-kit for migration..."
  ./node_modules/.bin/drizzle-kit push
  MIGRATION_STATUS=$?
else
  echo "Using npm script for migration..."
  npm run db:push
  MIGRATION_STATUS=$?
fi

# Check migration status
if [ $MIGRATION_STATUS -eq 0 ]; then
  echo -e "${GREEN}Migration completed successfully!${NC}"
else
  echo -e "${RED}Migration failed with status code $MIGRATION_STATUS${NC}"
  echo -e "${YELLOW}Consider restoring from backup: $BACKUP_FILE${NC}"
  exit $MIGRATION_STATUS
fi