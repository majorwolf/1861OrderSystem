import { useEffect, useRef } from "react";
import { useOrderContext } from "@/context/OrderContext";
import { fetchMenuItems, fetchOrders } from "@/lib/api-client";
import { Order } from "@shared/schema";

// Default polling intervals (in milliseconds)
const DEFAULT_MENU_POLL_INTERVAL = 30000; // 30 seconds
const DEFAULT_ORDERS_POLL_INTERVAL = 5000; // 5 seconds

interface DataPollerProps {
  menuPollInterval?: number;
  ordersPollInterval?: number;
  ordersType?: string; // 'kitchen', 'bar', or undefined for all
}

/**
 * DataPoller component that replaces WebSocketHandler with standard API polling
 * This provides real-time updates without requiring WebSockets
 */
export function DataPoller({
  menuPollInterval = DEFAULT_MENU_POLL_INTERVAL,
  ordersPollInterval = DEFAULT_ORDERS_POLL_INTERVAL,
  ordersType
}: DataPollerProps) {
  const { setMenuItems, setOrders, updateOrder } = useOrderContext();
  
  // Use refs to store the latest version of state setters
  // This prevents stale closures in the interval handlers
  const setMenuItemsRef = useRef(setMenuItems);
  const setOrdersRef = useRef(setOrders);
  const updateOrderRef = useRef(updateOrder);
  
  // Update refs when props change
  useEffect(() => {
    setMenuItemsRef.current = setMenuItems;
    setOrdersRef.current = setOrders;
    updateOrderRef.current = updateOrder;
  }, [setMenuItems, setOrders, updateOrder]);
  
  // Fetch menu items periodically
  useEffect(() => {
    // Initial fetch
    const fetchInitialMenuItems = async () => {
      console.log("Fetching initial menu items");
      const response = await fetchMenuItems();
      if (response.success && response.data) {
        console.log("Received initial menu items:", response.data.length);
        setMenuItemsRef.current(response.data);
      }
    };
    
    fetchInitialMenuItems();
    
    // Set up polling interval
    const menuInterval = setInterval(async () => {
      const response = await fetchMenuItems();
      if (response.success && response.data) {
        console.log("Received updated menu items:", response.data.length);
        setMenuItemsRef.current(response.data);
      }
    }, menuPollInterval);
    
    // Cleanup
    return () => clearInterval(menuInterval);
  }, [menuPollInterval]);
  
  // Fetch orders periodically
  useEffect(() => {
    // Track which orders we've seen to detect updates
    const orderCache = new Map<number, Order>();
    
    // Initial fetch
    const fetchInitialOrders = async () => {
      console.log("Fetching initial orders", ordersType ? `for type: ${ordersType}` : "");
      const response = await fetchOrders(ordersType);
      if (response.success && response.data) {
        console.log("Received initial orders:", response.data.length);
        response.data.forEach(order => {
          orderCache.set(order.id, order);
        });
        setOrdersRef.current(response.data);
      }
    };
    
    fetchInitialOrders();
    
    // Set up polling interval
    const ordersInterval = setInterval(async () => {
      const response = await fetchOrders(ordersType);
      if (response.success && response.data) {
        // Process orders to detect new and updated ones
        let hasChanges = false;
        const currentOrderIds = new Set<number>();
        
        // Check for new or updated orders
        response.data.forEach(order => {
          currentOrderIds.add(order.id);
          const existingOrder = orderCache.get(order.id);
          
          if (!existingOrder) {
            // New order
            console.log("Detected new order:", order.id);
            orderCache.set(order.id, order);
            hasChanges = true;
          } else if (
            existingOrder.status !== order.status ||
            existingOrder.kitchenStatus !== order.kitchenStatus ||
            existingOrder.barStatus !== order.barStatus
          ) {
            // Updated order
            console.log("Detected updated order:", order.id);
            orderCache.set(order.id, order);
            updateOrderRef.current(order);
          }
        });
        
        // Check for removed orders
        const removedOrders: number[] = [];
        orderCache.forEach((_, id) => {
          if (!currentOrderIds.has(id)) {
            removedOrders.push(id);
          }
        });
        
        // Clean up removed orders from cache
        removedOrders.forEach(id => {
          orderCache.delete(id);
          hasChanges = true;
        });
        
        // If there are new or removed orders, update the state
        if (hasChanges) {
          setOrdersRef.current(Array.from(orderCache.values()));
        }
      }
    }, ordersPollInterval);
    
    // Cleanup
    return () => clearInterval(ordersInterval);
  }, [ordersPollInterval, ordersType]);
  
  // This component doesn't render anything
  return null;
}