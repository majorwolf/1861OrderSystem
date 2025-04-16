#!/bin/bash

# Upgrade script for 1861 Public House ordering system
# This script safely upgrades the application to a newer version

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  1861 Public House Upgrade Script      ${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if running in Docker context
if ! command -v docker-compose &> /dev/null; then
  echo -e "${RED}Error: docker-compose not found. This script is meant to be run on the host machine.${NC}"
  exit 1
fi

# Confirm upgrade
echo -e "${YELLOW}This script will upgrade the 1861 Public House ordering system to the latest version.${NC}"
echo -e "${YELLOW}Make sure you have pulled the latest code before running this script.${NC}"
echo -e "${YELLOW}It's recommended to backup the database before proceeding.${NC}"
echo -n "Do you want to create a database backup before upgrading? (y/n): "
read backup_response

# Create backup if requested
if [[ "$backup_response" == "y" || "$backup_response" == "Y" ]]; then
  echo -e "${BLUE}Creating database backup...${NC}"
  ./scripts/backup-db.sh
  if [ $? -ne 0 ]; then
    echo -e "${RED}Database backup failed. Aborting upgrade.${NC}"
    exit 1
  fi
  echo -e "${GREEN}Database backup created successfully.${NC}"
fi

# Stop current containers
echo -e "\n${BLUE}Stopping current containers...${NC}"
docker-compose down
echo -e "${GREEN}Containers stopped successfully.${NC}"

# Rebuild images with latest code
echo -e "\n${BLUE}Building new Docker images...${NC}"
docker-compose build
echo -e "${GREEN}Images built successfully.${NC}"

# Start containers
echo -e "\n${BLUE}Starting updated containers...${NC}"
docker-compose up -d
echo -e "${GREEN}Containers started successfully.${NC}"

# Wait for app to be healthy
echo -e "\n${BLUE}Waiting for application to start...${NC}"
attempt=1
max_attempts=30
until curl -s --head http://localhost:5000 | grep "200 OK" > /dev/null; do
  if [ $attempt -gt $max_attempts ]; then
    echo -e "${RED}Application failed to start within timeout period.${NC}"
    echo -e "${RED}Check logs with 'docker-compose logs app'${NC}"
    exit 1
  fi
  echo -n "."
  sleep 2
  ((attempt++))
done
echo -e "\n${GREEN}Application is up and running!${NC}"

# Check database status
echo -e "\n${BLUE}Checking database status...${NC}"
docker-compose exec db psql -U postgres -c "SELECT 1" > /dev/null
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Database is working correctly.${NC}"
else
  echo -e "${RED}Database check failed. Please check database logs.${NC}"
  exit 1
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}  Upgrade Completed Successfully!       ${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "\nYou can view the application at: http://localhost:5000"
echo -e "Run './scripts/monitor.sh' to check system status."