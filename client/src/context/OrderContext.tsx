import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { MenuItem, Order, OrderItem } from "@shared/schema";
import { fetchMenuItems, fetchOrders } from "@/lib/api-client";

interface OrderContextType {
  menuItems: MenuItem[];
  orders: Order[];
  cart: OrderItem[];
  tableId: number | null;
  setMenuItems: (items: MenuItem[]) => void;
  setOrders: (orders: Order[]) => void;
  addToCart: (item: OrderItem) => void;
  removeFromCart: (index: number) => void;
  updateCartItemQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  setTableId: (id: number | null) => void;
  updateOrder: (order: Order) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [tableId, setTableId] = useState<number | null>(null);
  
  // Default polling intervals (in milliseconds)
  const MENU_POLL_INTERVAL = 30000; // 30 seconds
  const ORDERS_POLL_INTERVAL = 5000; // 5 seconds
  
  // Cart operations
  const addToCart = (item: OrderItem) => {
    // Check if item is already in cart
    const existingIndex = cart.findIndex(cartItem => 
      cartItem.menuItemId === item.menuItemId && 
      cartItem.size === item.size
    );

    if (existingIndex >= 0) {
      // Update quantity if already in cart
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += item.quantity;
      setCart(updatedCart);
    } else {
      // Add new item to cart
      setCart([...cart, item]);
    }
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const updateCartItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }

    const newCart = [...cart];
    newCart[index].quantity = quantity;
    setCart(newCart);
  };

  const clearCart = () => {
    setCart([]);
  };
  
  // Order operations
  const handleOrderUpdate = (updatedOrder: Order) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
  };
  
  // Define refs outside of useEffect to avoid recreating them on every render
  const menuItemsRef = useRef<MenuItem[]>([]);
  const ordersRef = useRef<Order[]>([]);
  
  // Keep refs up to date with latest state
  useEffect(() => {
    menuItemsRef.current = menuItems;
  }, [menuItems]);
  
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);
  
  // Data polling implementation
  useEffect(() => {
    console.log("Setting up data polling");
    
    // Keep refs up to date with latest state
    menuItemsRef.current = menuItems;
    ordersRef.current = orders;
    
    // Menu items polling
    const fetchMenuItemsHandler = async () => {
      try {
        const response = await fetchMenuItems();
        if (response.success && response.data) {
          if (JSON.stringify(menuItemsRef.current) !== JSON.stringify(response.data)) {
            console.log("Menu items updated:", response.data.length);
            setMenuItems(response.data);
          }
        }
      } catch (error) {
        console.error("Error fetching menu items:", error);
      }
    };
    
    // Initial fetch
    fetchMenuItemsHandler();
    
    // Set up polling interval
    const menuInterval = setInterval(fetchMenuItemsHandler, MENU_POLL_INTERVAL);
    
    // Orders polling
    const fetchOrdersHandler = async () => {
      try {
        const response = await fetchOrders();
        if (response.success && response.data) {
          // Simple equality check would miss some updates, so we do a more thorough check
          const currentOrdersStr = JSON.stringify(ordersRef.current);
          const newOrdersStr = JSON.stringify(response.data);
          
          if (currentOrdersStr !== newOrdersStr) {
            console.log("Orders updated:", response.data.length);
            setOrders(response.data);
          }
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    
    // Initial fetch
    fetchOrdersHandler();
    
    // Set up polling interval
    const ordersInterval = setInterval(fetchOrdersHandler, ORDERS_POLL_INTERVAL);
    
    // Cleanup intervals on unmount
    return () => {
      clearInterval(menuInterval);
      clearInterval(ordersInterval);
    };
  }, []); // Empty dependency array means this runs once on mount
  
  // Create the context value object
  const contextValue = {
    menuItems,
    orders,
    cart,
    tableId,
    setMenuItems,
    setOrders,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    setTableId,
    updateOrder: handleOrderUpdate
  };
  
  return (
    <OrderContext.Provider value={contextValue}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrderContext() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrderContext must be used within an OrderProvider");
  }
  return context;
}
