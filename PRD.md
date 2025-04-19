# 1861 Public House Ordering System - Product Requirements Document

## 1. Executive Summary

The 1861 Public House Ordering System is a QR code-based digital ordering platform for 1861 Public House restaurant in Barboursville, WV. This system replaces traditional paper menus and order taking with a streamlined digital process that allows customers to place orders directly from their tables, while providing real-time updates to the kitchen and bar staff.

## 2. Product Overview

### 2.1 Purpose
To digitize and optimize the restaurant ordering experience, reducing wait times, minimizing errors, and improving overall customer satisfaction while enhancing operational efficiency for the 1861 Public House staff.

### 2.2 Target Users
- **Customers**: Restaurant patrons who visit 1861 Public House
- **Kitchen Staff**: Chefs and kitchen support team
- **Bar Staff**: Bartenders and drink service personnel
- **Restaurant Administrators**: Managers responsible for menu and system management

### 2.3 Key Benefits
- Reduces order errors and improves accuracy
- Eliminates wait time for servers to take orders
- Provides real-time updates on order status
- Streamlines kitchen and bar operations
- Enables easy menu and inventory management

## 3. Product Architecture

### 3.1 Technology Stack
- **Frontend**: React, TailwindCSS, ShadCN UI
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: WebSockets
- **Styling**: Tailwind CSS, Theme JSON for consistent branding

### 3.2 System Components
- QR code generation and management
- Customer ordering interface
- Order processing system
- Kitchen view for food preparation
- Bar view for beverage preparation
- Admin interface for menu and system management
- Order confirmation and status tracking

## 4. Core Features & Functionality

### 4.1 Customer Experience
- **QR Code Scanning**: Customers scan table-specific QR codes to access the digital menu
- **Digital Menu Browsing**: Intuitive browsing of available menu items
- **Food Customization**: Ability to customize pizzas with toppings (add/remove)
- **Order Cart Management**: Add, remove, or modify items in the order cart
- **Order Submission**: Place orders directly from the digital interface
- **Order Confirmation**: Receive visual confirmation with celebratory animation
- **Last Name Association**: Associate last name with orders for identification

### 4.2 Kitchen & Bar Operations
- **Real-time Order Notifications**: Immediate display of new orders
- **Segregated Views**: Separate interfaces for kitchen (food) and bar (drinks)
- **Order Categorization**: Automatic routing of food items to kitchen and beverages to bar
- **Status Management**: Update order status through preparation workflow
- **Order Filtering**: Filter orders by status for better workspace management
- **Order Prioritization**: Visual indicators for order age and priority

### 4.3 Administrative Functions
- **Menu Management**: Add, edit, delete, and toggle availability of menu items
- **Topping Management**: Manage pizza topping options and availability
- **Table Management**: Configure tables and associated QR codes
- **Order History**: View and search order history
- **System Monitoring**: Monitor system performance and status

## 5. User Interfaces

### 5.1 Customer Interface
- **Home Page**: Entry point with 1861 Public House branding
- **Menu Page**: Categorized display of food and beverage options
- **Pizza Customization Modal**: Interface for adding/removing toppings
- **Cart View**: Summary of selected items with pricing
- **Order Confirmation Page**: Visual confirmation with confetti animation

### 5.2 Kitchen Interface
- **Order Queue**: List of pending food orders
- **Order Detail View**: Detailed view of order contents including customizations
- **Status Controls**: Buttons to update preparation status
- **History View**: Access to completed orders
- **Filter Controls**: Ability to filter by order status

### 5.3 Bar Interface
- **Drink Orders Queue**: List of pending drink orders
- **Order Detail View**: Detailed view of drink orders
- **Status Controls**: Buttons to update preparation status
- **History View**: Access to completed orders
- **Filter Controls**: Ability to filter by order status

### 5.4 Admin Interface
- **Menu Management**: Interface for modifying menu items
- **Topping Management**: Interface for managing pizza toppings
- **QR Code Management**: Generate and manage table QR codes
- **System Settings**: Configure system parameters

## 6. Technical Requirements

### 6.1 Performance
- **Response Time**: Page load times under 2 seconds
- **Real-time Updates**: Order updates propagated within 1 second
- **Concurrent Users**: Support up to 100 simultaneous users
- **Order Processing**: Handle up to 50 orders per minute

### 6.2 Security
- **Data Protection**: Secure storage of all order and customer data
- **Access Control**: Role-based access to different system components
- **Input Validation**: Comprehensive validation of all user inputs
- **Error Handling**: Graceful handling of errors with user-friendly messages

### 6.3 Reliability
- **Uptime**: 99.9% system availability
- **Data Integrity**: No data loss during any system operation
- **Error Recovery**: Automatic recovery from minor system errors
- **Backup**: Regular automated backups of all system data

### 6.4 Scalability
- **Horizontal Scaling**: Ability to deploy across multiple servers
- **Database Optimization**: Indexed queries for fast data access
- **Load Balancing**: Support for distributing traffic across instances

## 7. Business Rules

### 7.1 Order Processing
- Orders are automatically categorized as "kitchen", "bar", or "both" based on contents
- Food items are routed to the kitchen view
- Beverage items are routed to the bar view
- Orders require a customer last name for identification
- Large pizza sizes incur an additional $2.00 charge
- Each added topping incurs an additional charge based on topping price

### 7.2 Status Management
- New orders start with "new" status
- Kitchen orders progress through: new → preparing → ready → delivered
- Bar orders follow the same status progression
- Orders containing both food and drinks are completed when both components are delivered
- Completed orders are archived but remain searchable in the system

### 7.3 Menu Management
- Menu items can be temporarily disabled without deletion
- Toppings can be marked as unavailable when out of stock
- Preset pizza configurations have default toppings that can be modified
- Menu items must have descriptions and accurate pricing

## 8. Implementation Details

### 8.1 Database Schema
- **Tables**: menu_items, toppings, menu_item_toppings, tables, orders
- **Relationships**: Defined relations between menu items and toppings
- **Order Storage**: JSON structure for flexible order item storage
- **Status Tracking**: Separate tracking for kitchen and bar order components

### 8.2 API Endpoints
- **GET /api/menu**: Retrieve all menu items
- **GET /api/menu/:id**: Retrieve specific menu item
- **POST /api/orders**: Create new order
- **GET /api/orders/type/:type**: Get orders by type (kitchen/bar)
- **PATCH /api/orders/:id/status**: Update order status
- **WebSocket**: Real-time order updates and notifications

### 8.3 Deployment Architecture
- **Web Server**: Nginx as reverse proxy
- **Application Server**: Node.js with PM2 process management
- **Database Server**: PostgreSQL
- **Static Assets**: Served through Nginx
- **SSL**: HTTPS encryption for all connections

## 9. Implementation Status

All core features have been implemented and are operational:

- ✅ Customer ordering interface with QR code integration
- ✅ Menu browsing and cart management
- ✅ Pizza customization with toppings
- ✅ Order submission and confirmation
- ✅ Kitchen and bar order views
- ✅ Real-time order status updates
- ✅ Admin management interfaces
- ✅ 1861 Public House branding and theming
- ✅ Responsive design for all device sizes
- ✅ WebSocket-based real-time communications
- ✅ Order confirmation page with confetti animation

## 10. Future Enhancements

The following enhancements are planned for future releases:

- 🔄 Customer authentication for order history
- 🔄 Payment processing integration
- 🔄 Loyalty program integration
- 🔄 Scheduled/advance ordering
- 🔄 Push notifications for order status
- 🔄 Analytics dashboard for restaurant management
- 🔄 Inventory management and automatic availability updates
- 🔄 Mobile application for staff order management
- 🔄 Integration with kitchen display systems
- 🔄 Multi-language support for international customers

## 11. Maintenance and Support

The system requires ongoing maintenance:

- Regular database backups
- Security patches and updates
- Performance monitoring
- Periodic code reviews
- User feedback collection and feature refinement

## 12. Conclusion

The 1861 Public House Ordering System successfully delivers a comprehensive digital solution for restaurant order management. By streamlining the ordering process from table to kitchen/bar and providing real-time updates throughout the order lifecycle, the system enhances both customer experience and operational efficiency.