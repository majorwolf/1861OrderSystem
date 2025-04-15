import { useEffect } from "react";
import { setupWebSocket } from "@/lib/websocket";
import { useOrderContext } from "@/context/OrderContext";
import { Order } from "@shared/schema";

export function WebSocketHandler() {
  const { setMenuItems, setOrders, updateOrder } = useOrderContext();
  
  useEffect(() => {
    console.log("Setting up WebSocket connection");
    
    // Setup WebSocket connection
    const socket = setupWebSocket();
    
    // Handle WebSocket messages
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data.type);
        
        switch(data.type) {
          case 'initialData':
            // Set initial data
            console.log("Received initial data:", data.payload);
            setMenuItems(data.payload.menuItems || []);
            setOrders(data.payload.activeOrders || []);
            break;
            
          case 'newOrder':
            // Add new order
            console.log("Received new order:", data.payload);
            setOrders((prevOrders: Order[]) => {
              const newOrder = data.payload as Order;
              return [...prevOrders, newOrder];
            });
            break;
            
          case 'orderUpdated':
            // Update existing order
            console.log("Received order update:", data.payload);
            updateOrder(data.payload);
            break;
            
          case 'ordersPurged':
            // All orders have been purged
            console.log("Received orders purged event:", data.payload);
            setOrders([]);
            break;
            
          default:
            console.log("Unhandled message type:", data.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };
    
    socket.addEventListener('message', handleMessage);
    
    // Handle connection status
    socket.addEventListener('open', () => {
      console.log("WebSocket connection established");
    });
    
    socket.addEventListener('error', (error) => {
      console.error("WebSocket error:", error);
    });
    
    socket.addEventListener('close', (event) => {
      console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
    });
    
    return () => {
      console.log("Cleaning up WebSocket connection");
      socket.removeEventListener('message', handleMessage);
      socket.close();
    };
  }, [setMenuItems, setOrders, updateOrder]);
  
  // This component doesn't render anything
  return null;
}