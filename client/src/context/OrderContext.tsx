import { createContext, useContext, useState, ReactNode } from "react";
import { MenuItem, Order, OrderItem } from "@shared/schema";

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

  const updateOrder = (updatedOrder: Order) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
  };

  return (
    <OrderContext.Provider
      value={{
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
        updateOrder
      }}
    >
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
