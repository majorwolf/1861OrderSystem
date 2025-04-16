#!/bin/bash

# Health check script for 1861 Public House ordering system
# This script is used by Docker to check if the application is running properly

set -e

# Check if the application is responding
wget --spider -q http://localhost:5000/

# Check if database connection is working
if [ ! -z "$DATABASE_URL" ]; then
  PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT 1" > /dev/null
fi

# If we get this far, the application is healthy
exit 0