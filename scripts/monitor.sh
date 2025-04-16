#!/bin/bash

# Monitoring script for 1861 Public House ordering system
# This script provides basic monitoring for the application in production

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  1861 Public House Monitoring Script   ${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if running in Docker context
if ! command -v docker-compose &> /dev/null; then
  echo -e "${RED}Error: docker-compose not found. This script is meant to be run on the host machine.${NC}"
  exit 1
fi

# Get container status
echo -e "\n${BLUE}Container Status:${NC}"
docker-compose ps

# Check disk space
echo -e "\n${BLUE}Disk Space:${NC}"
df -h | grep -E '(^Filesystem|/$)'

# Check if the application is accessible
echo -e "\n${BLUE}Application Status:${NC}"
if curl -s --head http://localhost:5000 | grep "200 OK" > /dev/null; then
  echo -e "${GREEN}Application is accessible (HTTP 200 OK)${NC}"
else
  echo -e "${RED}Application is not accessible!${NC}"
fi

# Get recent logs
echo -e "\n${BLUE}Recent Logs:${NC}"
docker-compose logs --tail=20 app

# Database size
echo -e "\n${BLUE}Database Size:${NC}"
docker-compose exec db psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('orderingsystem')) as database_size;"

# Connection count
echo -e "\n${BLUE}Current Database Connections:${NC}"
docker-compose exec db psql -U postgres -c "SELECT count(*) AS active_connections FROM pg_stat_activity WHERE datname = 'orderingsystem';"

# Table sizes
echo -e "\n${BLUE}Table Sizes:${NC}"
docker-compose exec db psql -U postgres -d orderingsystem -c "SELECT relname as table_name, pg_size_pretty(pg_relation_size(relid)) as table_size FROM pg_catalog.pg_statio_user_tables ORDER BY pg_relation_size(relid) DESC;"

# Order statistics
echo -e "\n${BLUE}Order Statistics:${NC}"
docker-compose exec db psql -U postgres -d orderingsystem -c "SELECT COUNT(*) as total_orders FROM orders;"
docker-compose exec db psql -U postgres -d orderingsystem -c "SELECT COUNT(*) as today_orders FROM orders WHERE created_at::date = CURRENT_DATE;"
docker-compose exec db psql -U postgres -d orderingsystem -c "SELECT status, COUNT(*) FROM orders GROUP BY status ORDER BY COUNT(*) DESC;"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}  Monitoring Complete  ${NC}"
echo -e "${BLUE}========================================${NC}"