# 1861 Public House Ordering System

A digital QR code-based restaurant ordering system for 1861 Public House in Barboursville, WV. This application provides an intelligent, interactive dining experience through advanced digital interfaces.

## Features

- React-based frontend with role-specific views
- Real-time order synchronization using WebSockets
- Responsive design for mobile and desktop devices
- Secure API endpoints for order processing
- Optimized kitchen and bar workflows
- Pizza customization system with toppings management
- Order confirmation with confetti celebration
- Admin interface for menu and topping management

## System Requirements

- Ubuntu Server 20.04 LTS or newer
- Node.js 18.x or later
- PostgreSQL 14.x or later
- Nginx (for production deployment)
- PM2 (process manager for Node.js)

## Production Deployment Guide

### 1. Server Preparation

```bash
# Update the server
sudo apt update
sudo apt upgrade -y

# Install required packages
sudo apt install -y curl git build-essential nginx

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js and npm installation
node --version
npm --version

# Install PM2 globally
sudo npm install -g pm2
```

### 2. PostgreSQL Installation

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create a database user and database
sudo -u postgres psql -c "CREATE USER publichouse WITH PASSWORD 'your_strong_password';"
sudo -u postgres psql -c "CREATE DATABASE publichouse_db OWNER publichouse;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE publichouse_db TO publichouse;"
```

### 3. Application Deployment

```bash
# Create application directory
sudo mkdir -p /var/www/publichouse
sudo chown $USER:$USER /var/www/publichouse

# Clone the repository
git clone https://github.com/yourusername/publichouse-ordering.git /var/www/publichouse
cd /var/www/publichouse

# Install dependencies
npm install

# Create .env file for production
cat > .env << EOL
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://publichouse:your_strong_password@localhost:5432/publichouse_db
SESSION_SECRET=your_session_secret_key
EOL

# Build the client
npm run build
```

### 4. Database Setup

```bash
# Run database migrations
NODE_ENV=production npm run db:push
```

### 5. Configure PM2 for Application Management

```bash
# Create a PM2 ecosystem file
cat > ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: "publichouse-ordering",
    script: "server/index.js",
    env: {
      NODE_ENV: "production",
      PORT: 5000
    },
    instances: "max",
    exec_mode: "cluster",
    watch: false,
    max_memory_restart: "500M"
  }]
};
EOL

# Start the application with PM2
pm2 start ecosystem.config.js

# Save PM2 process list and configure to start on system startup
pm2 save
pm2 startup
# Follow the instructions provided by PM2 to complete the startup configuration
```

### 6. Configure Nginx as a Reverse Proxy

```bash
# Create Nginx configuration file
sudo nano /etc/nginx/sites-available/publichouse.conf
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/publichouse.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Configure SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts to complete the process
```

### 8. Firewall Configuration

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Enable the firewall
sudo ufw enable
```

## Application Maintenance

### Update Application

```bash
cd /var/www/publichouse
git pull
npm install
npm run build
pm2 restart publichouse-ordering
```

### Database Backup

```bash
# Backup the database
sudo -u postgres pg_dump publichouse_db > publichouse_backup_$(date +%Y%m%d).sql

# Restore the database
sudo -u postgres psql publichouse_db < backup_file.sql
```

### Checking Logs

```bash
# View application logs
pm2 logs publichouse-ordering

# View specific number of lines
pm2 logs publichouse-ordering --lines 100

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Application Not Starting

1. Check for errors in PM2 logs: `pm2 logs`
2. Verify environment variables in `.env` file
3. Ensure database connection is working: `psql -U publichouse -h localhost publichouse_db`

### Database Connection Issues

1. Check PostgreSQL service status: `sudo systemctl status postgresql`
2. Verify database user permissions: `sudo -u postgres psql -c "\du"`
3. Test database connection string: `psql "postgresql://publichouse:password@localhost:5432/publichouse_db"`

### WebSocket Connection Problems

1. Ensure Nginx is properly configured for WebSocket proxying
2. Check that ports are open in the firewall: `sudo ufw status`
3. Verify client-side WebSocket URL formation (wss:// for HTTPS, ws:// for HTTP)

## Security Considerations

1. Always use strong passwords for database and user accounts
2. Keep the server updated with security patches
3. Consider implementing rate limiting in Nginx
4. Use HTTPS for all connections
5. Regularly backup your database
6. Use secure environment variables for sensitive information

## System Architecture

- **Frontend**: React with TailwindCSS and ShadCN UI
- **Backend**: Node.js Express server
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: WebSockets for instant order updates
- **Authentication**: Session-based authentication for staff roles

## License

Copyright © 2025 1861 Public House. All rights reserved.