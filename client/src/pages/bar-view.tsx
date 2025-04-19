import { useState } from "react";
import { Link } from "wouter";
import { Order } from "@shared/schema";
import { updateBarStatus as wsUpdateBarStatus } from "@/lib/websocket";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function BarView() {
  const [hideCompleted, setHideCompleted] = useState<boolean>(true);
  const queryClient = useQueryClient();
  
  // Use React Query for data fetching with polling
  const { 
    data: barOrders = [], 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['/api/orders/type/bar'],
    queryFn: async () => {
      const response = await fetch('/api/orders/type/bar');
      if (!response.ok) {
        throw new Error('Failed to fetch bar orders');
      }
      const data = await response.json();
      // Sort orders by creation time (newest first)
      return [...data].sort((a, b) => {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    },
    refetchInterval: 10000, // Poll every 10 seconds
    refetchOnWindowFocus: true,
    staleTime: 5000 // Consider data fresh for 5 seconds
  });
  
  // Mutation for updating bar status with optimistic updates
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
      const response = await fetch(`/api/orders/${orderId}/bar-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update bar status');
      }
      
      return response.json();
    },
    // Optimistically update the cache
    onMutate: async ({ orderId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/orders/type/bar'] });
      
      // Snapshot the previous value
      const previousOrders = queryClient.getQueryData(['/api/orders/type/bar']);
      
      // Optimistically update the cache with the new status
      queryClient.setQueryData<Order[]>(['/api/orders/type/bar'], (old = []) => {
        return old.map(order => {
          if (order.id === orderId) {
            return { ...order, barStatus: status };
          }
          return order;
        });
      });
      
      // Also send via WebSocket for real-time updates to other clients
      wsUpdateBarStatus(orderId, status);
      
      // Return the snapshot so we can rollback if something goes wrong
      return { previousOrders };
    },
    // If the mutation fails, use the context we returned above
    onError: (_err, _variables, context: any) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(['/api/orders/type/bar'], context.previousOrders);
      }
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders/type/bar'] });
    }
  });

  // Function to handle status button clicks
  const handleStatusUpdate = (orderId: number, status: string) => {
    updateStatusMutation.mutate({ orderId, status });
  };
  
  // Calculate order counts by bar status
  const countOrdersByStatus = () => {
    const counts = {
      preparing: 0,
      ready: 0,
      completed: 0
    };
    
    barOrders.forEach(order => {
      if (order.barStatus === 'preparing') counts.preparing++;
      if (order.barStatus === 'ready') counts.ready++;
      if (order.barStatus === 'completed') counts.completed++;
    });
    
    return counts;
  };
  
  const statusCounts = countOrdersByStatus();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Temporarily commented out until WebSocket issues are fixed */}
      {/* <WebSocketHandler /> */}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bar Orders</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <label htmlFor="hideCompleted" className="mr-2 text-sm font-medium">
              Hide Delivered
            </label>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input 
                type="checkbox" 
                id="hideCompleted" 
                name="hideCompleted"
                checked={hideCompleted}
                onChange={() => setHideCompleted(!hideCompleted)}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label 
                htmlFor="hideCompleted" 
                className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${hideCompleted ? 'bg-green-400' : 'bg-gray-300'}`}
              ></label>
            </div>
          </div>
          <Link href="/">
            <span className="text-blue-600 hover:underline cursor-pointer">← Back to Home</span>
          </Link>
        </div>
      </div>
      
      {/* Add CSS for toggle switch */}
      <style>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #68D391;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #68D391;
        }
        .toggle-checkbox {
          right: 0;
          transition: all 0.3s;
          left: 0;
          border-color: #CBD5E0;
        }
      `}</style>
      
      {/* Order Status Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <h3 className="text-yellow-700 font-semibold text-lg">Preparing</h3>
          <p className="text-3xl font-bold text-yellow-600">{statusCounts.preparing}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <h3 className="text-green-700 font-semibold text-lg">Ready</h3>
          <p className="text-3xl font-bold text-green-600">{statusCounts.ready}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <h3 className="text-blue-700 font-semibold text-lg">Delivered</h3>
          <p className="text-3xl font-bold text-blue-600">{statusCounts.completed}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading orders...</span>
          </div>
        ) : error ? (
          <div className="col-span-full bg-white p-6 rounded-lg shadow">
            <p className="text-center text-red-500">{String(error)}</p>
          </div>
        ) : barOrders.filter(order => !hideCompleted || order.barStatus !== 'completed').length === 0 ? (
          <div className="col-span-full bg-white p-6 rounded-lg shadow">
            <p className="text-center text-gray-500">
              {hideCompleted 
                ? "No active drink orders at the moment."
                : "No drink orders at the moment."}
            </p>
          </div>
        ) : (
          barOrders
            .filter(order => !hideCompleted || order.barStatus !== 'completed')
            .map(order => (
            <div key={order.id} className="bg-white p-4 rounded-lg shadow transition-all duration-300 ease-in-out">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Order #{order.id}</h2>
                <span className={`px-2 py-1 rounded text-xs ${getStatusClass(order.barStatus)}`}>
                  {capitalize(order.barStatus)}
                </span>
              </div>
              
              <p className="text-base font-medium mb-2">Table: <span className="text-xl font-bold">{order.tableId}</span></p>
              <p className="text-sm mb-2">Time: {formatTime(order.createdAt)}</p>
              <p className="text-sm mb-3">Customer: {extractCustomerName(order.notes)}</p>
              
              <h3 className="font-medium mb-2 border-t pt-2">Drinks:</h3>
              <ul className="space-y-2">
                {order.items
                  .filter(item => item.category === "drink")
                  .map((item: any, index: number) => (
                    <li key={index} className="flex justify-between">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{item.size && `(${item.size})`}</span>
                    </li>
                  ))}
              </ul>
              
              {/* Item-specific notes are still shown, but the general order notes are no longer displayed */}
              
              <div className="mt-4 pt-3 border-t flex justify-end space-x-2">
                <button 
                  className={`px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition-all ${order.barStatus === 'preparing' ? 'ring-2 ring-yellow-300' : ''}`}
                  onClick={() => handleStatusUpdate(order.id, 'preparing')}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending && updateStatusMutation.variables?.orderId === order.id && updateStatusMutation.variables?.status === 'preparing' ? (
                    <span className="flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-1" /> Updating...</span>
                  ) : 'Preparing'}
                </button>
                <button 
                  className={`px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-all ${order.barStatus === 'ready' ? 'ring-2 ring-green-300' : ''}`}
                  onClick={() => handleStatusUpdate(order.id, 'ready')}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending && updateStatusMutation.variables?.orderId === order.id && updateStatusMutation.variables?.status === 'ready' ? (
                    <span className="flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-1" /> Updating...</span>
                  ) : 'Ready'}
                </button>
                <button 
                  className={`px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-all ${order.barStatus === 'completed' ? 'ring-2 ring-blue-300' : ''}`}
                  onClick={() => handleStatusUpdate(order.id, 'completed')}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending && updateStatusMutation.variables?.orderId === order.id && updateStatusMutation.variables?.status === 'completed' ? (
                    <span className="flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-1" /> Updating...</span>
                  ) : 'Delivered'}
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

function extractCustomerName(notes: string | null): string {
  if (!notes) return 'Unknown';
  
  // Extract the customer name from "Order for [LastName]"
  const match = notes.match(/Order for (.*)/i);
  if (match && match[1]) {
    return match[1];
  }
  return 'Unknown';
}

// The updateBarStatus function has been replaced by the React Query mutation above