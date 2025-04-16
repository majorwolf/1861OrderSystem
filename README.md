# 1861 Public House Digital Order System

A QR code-based restaurant ordering system for 1861 Public House in Barboursville, WV. This application provides a digital interface for customers to place orders directly to the kitchen and bar, improving the dining experience and operational efficiency.

## Features

- **Customer View**: Customers scan QR codes at their tables to place orders directly to the kitchen and bar
- **Menu Management**: Staff can update menu items and toppings availability in real-time
- **Kitchen View**: Displays food orders with status tracking
- **Bar View**: Shows drink orders with independent status tracking
- **Real-Time Updates**: WebSocket integration for live order status updates
- **QR Code Management**: Generate and manage QR codes for tables

## Technology Stack

- **Frontend**: React with TypeScript
- **Backend**: Express.js (Node.js)
- **Database**: PostgreSQL
- **State Management**: Context API and React Query
- **Styling**: Tailwind CSS with shadcn/ui components
- **Real-time Communication**: WebSockets

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm (v8 or higher)
- PostgreSQL (v14 or higher)

## Getting Started

### Setting Up the Database

1. Create a PostgreSQL database for the application
2. Set up your database connection by creating a `.env` file in the root directory with:

```
DATABASE_URL=postgresql://username:password@localhost:5432/your_database_name
```

### Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd 1861-public-house-order-system
```

2. Install dependencies:
```bash
npm install
```

3. Push the database schema:
```bash
npm run db:push
```

### Running the Application

1. Start the development server:
```bash
npm run dev
```

2. The application will be available at:
- Main application: http://localhost:5000
- Customer ordering view: http://localhost:5000/table/1 (for Table 1)
- Kitchen view: http://localhost:5000/kitchen
- Bar view: http://localhost:5000/bar
- Admin views: http://localhost:5000/admin/menu, /admin/qrcodes, /admin/toppings

## Application Structure

- `/client` - Frontend React application
  - `/src/components` - Reusable UI components
  - `/src/pages` - Page components
  - `/src/context` - React context providers
  - `/src/hooks` - Custom React hooks
  - `/src/lib` - Utility functions
- `/server` - Express.js backend
  - `routes.ts` - API endpoints and WebSocket setup
  - `storage.ts` - Data storage interface
  - `database-storage.ts` - Implementation of storage with PostgreSQL
- `/shared` - Shared code between frontend and backend
  - `schema.ts` - Database schema and type definitions

## Key Workflows

### Customer Ordering Process
1. Customer scans QR code for their table
2. They browse the menu and add items to cart
3. Pizza items can be customized with toppings
4. Customer submits order after entering their last name
5. Order is sent to kitchen and/or bar based on item types
6. Customer receives a confirmation with confetti effect

### Kitchen/Bar Order Management
1. Staff sees incoming orders in their respective views
2. Orders can be updated with status: new → preparing → ready → delivered
3. Completed orders can be hidden
4. Orders display customer name, table number, and items

### Admin Features
1. Menu items can be added/edited/deleted
2. Topping management for pizzas
3. Item availability can be toggled on/off
4. QR codes can be generated for tables

## Deployment

For production deployment:
1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## License

This project is proprietary software developed for 1861 Public House.