#!/bin/bash

# Database backup script for 1861 Public House ordering system
# This script creates a backup of the PostgreSQL database

set -e

# Default backup directory
BACKUP_DIR="./backups"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp for the backup file
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

echo "Creating database backup..."

# Check if script is running in Docker context or on host
if [ -n "$DATABASE_URL" ]; then
  # We're inside Docker, use environment variables
  PGPASSWORD=$PGPASSWORD pg_dump -h $PGHOST -U $PGUSER -d $PGDATABASE > "$BACKUP_FILE"
else
  # We're on the host, use docker-compose
  docker-compose exec db pg_dump -U postgres orderingsystem > "$BACKUP_FILE"
fi

echo "Backup created successfully: $BACKUP_FILE"
echo "Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"