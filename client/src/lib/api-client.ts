import { MenuItem, Order } from "@shared/schema";
import { apiRequest } from "./queryClient";

/**
 * API client for polling data instead of using WebSockets
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Fetch all menu items
export async function fetchMenuItems(): Promise<ApiResponse<MenuItem[]>> {
  try {
    const response = await fetch('/api/menu');
    if (!response.ok) {
      throw new Error(`Failed to fetch menu items: ${response.statusText}`);
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error fetching menu items'
    };
  }
}

// Fetch orders by type (kitchen, bar, or "all")
export async function fetchOrders(type?: string): Promise<ApiResponse<Order[]>> {
  try {
    const url = type && type !== 'all' ? `/api/orders/type/${type}` : '/api/orders';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error fetching orders'
    };
  }
}

// Update kitchen status
export async function updateKitchenStatus(orderId: number, status: string): Promise<ApiResponse<Order>> {
  try {
    const response = await apiRequest('POST', '/api/orders/kitchen-status', {
      id: orderId,
      status
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update kitchen status: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error updating kitchen status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error updating kitchen status'
    };
  }
}

// Update bar status
export async function updateBarStatus(orderId: number, status: string): Promise<ApiResponse<Order>> {
  try {
    const response = await apiRequest('POST', '/api/orders/bar-status', {
      id: orderId,
      status
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update bar status: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error updating bar status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error updating bar status'
    };
  }
}

// Update menu item availability
export async function updateMenuItemAvailability(updates: { id: number, available: boolean }[]): Promise<ApiResponse<MenuItem[]>> {
  try {
    const response = await apiRequest('POST', '/api/menu/update-availability', updates);
    
    if (!response.ok) {
      throw new Error(`Failed to update menu item availability: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { success: true, data: data.updatedItems };
  } catch (error) {
    console.error('Error updating menu item availability:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error updating menu item availability'
    };
  }
}

// Legacy order status update (to be deprecated)
export async function updateOrderStatus(orderId: number, status: string): Promise<ApiResponse<Order>> {
  try {
    const response = await apiRequest('POST', '/api/orders/status', {
      id: orderId,
      status
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update order status: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error updating order status'
    };
  }
}

// Create a new menu item
export async function createMenuItem(menuItem: Partial<MenuItem>): Promise<ApiResponse<MenuItem>> {
  try {
    const response = await apiRequest('POST', '/api/menu', menuItem);
    
    if (!response.ok) {
      throw new Error(`Failed to create menu item: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error creating menu item:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error creating menu item'
    };
  }
}

// Purge all orders
export async function purgeAllOrders(): Promise<ApiResponse<boolean>> {
  try {
    const response = await apiRequest('POST', '/api/orders/purge', {});
    
    if (!response.ok) {
      throw new Error(`Failed to purge orders: ${response.statusText}`);
    }
    
    return { success: true, data: true };
  } catch (error) {
    console.error('Error purging orders:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error purging orders'
    };
  }
}