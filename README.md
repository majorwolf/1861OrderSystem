# 1861 Public House - Restaurant Ordering System

A digital QR code-based restaurant ordering system designed specifically for 1861 Public House in Barboursville, WV. This application allows customers to scan QR codes at their tables to submit orders directly to the kitchen and bar for real-time processing.

## Features

- **QR Code-Based Ordering**: Customers scan table-specific QR codes to place orders
- **Real-Time Updates**: WebSocket-based communication for instant order updates
- **Kitchen & Bar Views**: Separate interfaces for food and drink preparation
- **Pizza Customization**: Advanced system for adding/removing toppings
- **Admin Interface**: Manage menu items, toppings, and system settings
- **Responsive Design**: Works on mobile, tablet, and desktop devices

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Real-Time Communication**: WebSockets
- **Containerization**: Docker, Docker Compose

## Deployment Guide

### Prerequisites

- Docker and Docker Compose installed on the server
- Access to a server with ports 5000 (application) and 5432 (database) available

### Production Deployment Steps

#### Option 1: Using the automated deployment script

1. Clone the repository:
   ```
   git clone https://github.com/your-repo/1861-public-house.git
   cd 1861-public-house
   ```

2. Run the deployment script:
   ```
   ./deploy.sh
   ```
   
   The script will:
   - Check for required dependencies
   - Offer to generate a secure SESSION_SECRET
   - Ask for your server IP/domain name
   - Build and start the Docker containers
   - Generate QR codes for all tables

#### Option 2: Manual deployment

1. Clone the repository:
   ```
   git clone https://github.com/your-repo/1861-public-house.git
   cd 1861-public-house
   ```

2. Configure environment variables:
   - Edit the `.env.production` file with appropriate values
   - Make sure to change the `SESSION_SECRET` to a secure random string

3. Build and start the containers:
   ```
   docker-compose up -d
   ```

4. The application will be available at:
   ```
   http://your-server-ip:5000
   ```

5. To view logs:
   ```
   docker-compose logs -f
   ```

6. To stop the application:
   ```
   docker-compose down
   ```

7. To generate QR codes for tables:
   ```
   export BASE_URL="http://your-server-ip:5000"
   ./scripts/generate-qr.sh
   ```

### Database Backups

#### Using the convenience scripts

The application includes scripts to help manage database backups:

1. Create a backup:
   ```
   ./scripts/backup-db.sh
   ```
   This will create a timestamped backup file in the `backups` directory.

2. Restore from a backup:
   ```
   ./scripts/restore-db.sh backups/db_backup_20250416_120000.sql
   ```
   This will restore the database from the specified backup file.

#### Manual backup and restore

If needed, you can manually backup and restore the database:

To create a database backup:

```
docker-compose exec db pg_dump -U postgres orderingsystem > backup_$(date +%Y-%m-%d).sql
```

To restore from a backup:

```
cat backup_file.sql | docker-compose exec -T db psql -U postgres orderingsystem
```

## QR Code Generation

### Automatic QR Code Generation

The application includes scripts to automatically generate QR codes for all tables in the database:

1. Using the deploy script:
   ```
   ./deploy.sh
   ```
   When prompted, enter your server IP or domain name.

2. Using the QR generation script directly:
   ```
   export BASE_URL="http://your-server-ip:5000"
   ./scripts/generate-qr.sh
   ```

3. From within a running Docker container:
   ```
   docker-compose exec app ./scripts/generate-qr.sh
   ```

QR codes will be generated in the `qr-codes` directory with proper branding for 1861 Public House.

### Manual QR Code Generation

If needed, you can manually generate QR codes for each table with URLs in this format:
```
http://your-server-ip:5000/customer?table={table_number}
```

Print these QR codes and place them on the corresponding tables.

## Staff Views

- **Kitchen View**: `http://your-server-ip:5000/kitchen`
- **Bar View**: `http://your-server-ip:5000/bar`
- **Admin View**: `http://your-server-ip:5000/admin`

## Maintenance

- Regularly backup the database
- Monitor disk space for the PostgreSQL volume
- Check application logs for any errors

## Support

For technical support or feature requests, please contact the development team.