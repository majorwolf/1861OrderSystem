#!/bin/bash

# Database restore script for 1861 Public House ordering system
# This script restores a backup to the PostgreSQL database

set -e

# Check if a backup file was specified
if [ -z "$1" ]; then
  echo "Error: No backup file specified."
  echo "Usage: $0 <backup_file>"
  exit 1
fi

BACKUP_FILE="$1"

# Check if the backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "Restoring database from backup: $BACKUP_FILE"
echo "Warning: This will overwrite the current database. Press Ctrl+C to cancel."
echo "Continuing in 5 seconds..."

# Countdown
for i in 5 4 3 2 1; do
  echo -n "$i... "
  sleep 1
done
echo "Starting restore"

# Check if script is running in Docker context or on host
if [ -n "$DATABASE_URL" ]; then
  # We're inside Docker, use environment variables
  PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE < "$BACKUP_FILE"
else
  # We're on the host, use docker-compose
  cat "$BACKUP_FILE" | docker-compose exec -T db psql -U postgres orderingsystem
fi

echo "Database restore completed successfully!"