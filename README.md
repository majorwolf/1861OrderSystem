# 1861 Public House Ordering System

A digital ordering system for 1861 Public House in Barboursville, WV. This application allows customers to scan a QR code at their table and place orders directly to the kitchen and bar.

## Features

- Customer-facing menu with item customization
- Kitchen view for food preparation
- Bar view for drink preparation
- Admin interface for menu and topping management
- Real-time order updates via WebSockets
- Order confirmation with confetti celebration

## Tech Stack

- **Frontend**: React, TailwindCSS, shadcn/ui components
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: React Context, TanStack Query
- **Real-time Communication**: WebSockets

## Deployment with Docker

This application can be easily deployed using Docker and Docker Compose.

### Prerequisites

- Docker
- Docker Compose

### Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/1861-publichouse-ordering.git
   cd 1861-publichouse-ordering
   ```

2. Create a `.env` file based on the `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Start the application with Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. The application will be available at http://localhost:5000

### Stopping the Application

```bash
docker-compose down
```

To remove all data (including the database volume):
```bash
docker-compose down -v
```

## Development

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- PostgreSQL (or you can use the Docker Compose setup)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file to match your local environment.

3. Run database migrations:
   ```bash
   npm run db:push
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. The application will be available at http://localhost:5000

## License

MIT

## Acknowledgments

- 1861 Public House, Barboursville, WV