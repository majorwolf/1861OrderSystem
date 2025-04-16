# Development Guide for 1861 Public House Order System

This document provides detailed information for developers who want to work on and extend the 1861 Public House Digital Order System.

## Local Development Setup

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/your_database_name
PGUSER=username
PGHOST=localhost
PGPASSWORD=password
PGDATABASE=your_database_name
PGPORT=5432

# Server
PORT=5000
NODE_ENV=development
```

### Database Migration and Seeding

The application uses Drizzle ORM for database operations. Initial seeds include menu items and tables.

1. **Manual Database Reset:**
   ```bash
   npx drizzle-kit drop
   npx drizzle-kit push:pg
   ```

2. **Seeding Data:**
   ```bash
   npm run db:seed
   ```

## Architecture Overview

### Client-Server Communication

1. **REST API**: Used for CRUD operations on menu items, orders, and tables
2. **WebSockets**: Used for real-time order status updates

### Data Flow

1. Customer places an order
2. Order is categorized as kitchen, bar, or both
3. Order appears in the respective staff views
4. Staff updates status which is broadcasted to all connected clients

## Component Structure

### Key Frontend Components

- **OrderContext**: Central state management for orders and cart
- **MenuItemCard**: Displays individual menu items
- **PizzaCustomization**: Modal for customizing pizza orders
- **OrderCard**: Displays orders in kitchen and bar views
- **Cart**: Manages the customer's current order

### Backend Services

- **routes.ts**: Defines API endpoints and WebSocket handlers
- **storage.ts**: Interface for data storage operations
- **database-storage.ts**: PostgreSQL implementation of storage

## Database Schema

### Main Tables

1. **menu_items**: Stores all menu items with category, price, description
2. **toppings**: Stores available pizza toppings 
3. **menu_item_toppings**: Join table for preset toppings on menu items
4. **tables**: Restaurant tables with QR code information
5. **orders**: Customer orders with items, status, and table information

### Key Relationships

- Menu items have many toppings (for pizza preset configurations)
- Orders belong to a table
- Orders contain multiple order items

## WebSocket Events

The application uses WebSockets for real-time updates:

1. **orderUpdate**: Broadcast when an order status changes
2. **kitchenUpdate**: Broadcast when kitchen status changes
3. **barUpdate**: Broadcast when bar status changes

## Adding New Features

### Adding a New Menu Category

1. Add a new category value in shared/schema.ts
2. Update the customer view to display the new category section
3. Update the order routing logic in customer-view.tsx

### Modifying Order Flow

The order flow is controlled by:
1. `handleSubmitOrder` in Cart.tsx
2. Order creation in customer-view.tsx
3. Status updates in kitchen-view.tsx and bar-view.tsx

### UI Customization

The application uses:
1. **theme.json**: Controls the primary color and UI theme
2. **Tailwind CSS**: For responsive layout and styling
3. **shadcn/ui**: For UI components

## Testing

To run the tests:

```bash
npm test
```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Verify environment variables are correct
- Check database user permissions

### WebSocket Connection Problems

- Ensure the server is running
- Check for errors in browser console
- Verify the correct WebSocket URL is used in websocket.ts

## Deployment Considerations

### Production Build

```bash
npm run build
```

### Database Migration in Production

Use Drizzle Kit to manage schema changes:

```bash
NODE_ENV=production npx drizzle-kit push:pg
```

### Hosting Requirements

- Node.js runtime environment
- PostgreSQL database
- Support for WebSocket connections