import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useOrderContext } from "@/context/OrderContext";
import { WebSocketHandler } from "@/components/WebSocketHandler";
import { Order } from "@shared/schema";

export default function KitchenView() {
  const { orders } = useOrderContext();
  const [kitchenOrders, setKitchenOrders] = useState<Order[]>([]);
  
  // Filter orders that are for the kitchen (food items)
  useEffect(() => {
    const foodOrders = orders.filter(order => order.type === 'kitchen');
    setKitchenOrders(foodOrders);
  }, [orders]);
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Temporarily commented out until WebSocket issues are fixed */}
      {/* <WebSocketHandler /> */}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kitchen Orders</h1>
        <Link href="/">
          <span className="text-blue-600 hover:underline cursor-pointer">← Back to Home</span>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kitchenOrders.length === 0 ? (
          <div className="col-span-full bg-white p-6 rounded-lg shadow">
            <p className="text-center text-gray-500">No kitchen orders at the moment.</p>
          </div>
        ) : (
          kitchenOrders.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Order #{order.id}</h2>
                <span className={`px-2 py-1 rounded text-xs ${getStatusClass(order.status)}`}>
                  {capitalize(order.status)}
                </span>
              </div>
              
              <p className="text-sm mb-2">Table: {order.tableId}</p>
              <p className="text-sm mb-3">Time: {formatTime(order.createdAt)}</p>
              
              <h3 className="font-medium mb-2 border-t pt-2">Items:</h3>
              <ul className="space-y-2">
                {order.items.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{item.size && `(${item.size})`}</span>
                  </li>
                ))}
              </ul>
              
              {order.notes && (
                <div className="mt-3 border-t pt-2">
                  <h3 className="font-medium mb-1">Notes:</h3>
                  <p className="text-sm italic">{order.notes}</p>
                </div>
              )}
              
              <div className="mt-4 pt-3 border-t flex justify-end space-x-2">
                <button 
                  className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                  onClick={() => updateOrderStatus(order.id, 'preparing')}
                  disabled={order.status !== 'new'}
                >
                  Preparing
                </button>
                <button 
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                  onClick={() => updateOrderStatus(order.id, 'ready')}
                  disabled={order.status !== 'preparing'}
                >
                  Ready
                </button>
                <button 
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  onClick={() => updateOrderStatus(order.id, 'completed')}
                  disabled={order.status !== 'ready'}
                >
                  Complete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Helper functions
function formatTime(timestamp: Date | null): string {
  if (!timestamp) return 'Unknown';
  return new Date(timestamp).toLocaleTimeString();
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'new':
      return 'bg-red-100 text-red-800';
    case 'preparing':
      return 'bg-yellow-100 text-yellow-800';
    case 'ready':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function updateOrderStatus(orderId: number, status: string) {
  // This should use the websocket function from websocket.ts
  // For now, we'll just add a console.log placeholder
  console.log(`Updating order ${orderId} to status: ${status}`);
  
  // Call the updateOrderStatus function from the websocket lib
  // updateOrderStatus(orderId, status);
}