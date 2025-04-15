import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import OrderCard from "@/components/OrderCard";
import StaffHeader from "@/components/StaffHeader";
import { useOrderContext } from "@/context/OrderContext";

export default function KitchenView() {
  const { orders } = useOrderContext();
  
  // Get kitchen orders from API (initial load)
  const { data: kitchenOrders, refetch } = useQuery<Order[]>({
    queryKey: ['/api/orders/type/kitchen'],
  });
  
  // Filter orders from context for kitchen
  const displayOrders = orders.filter(order => 
    order.type === 'kitchen' && order.status !== 'completed'
  );
  
  // Sort orders by status and creation date
  const sortedOrders = [...displayOrders].sort((a, b) => {
    // First sort by status priority
    const statusPriority = {
      "new": 0,
      "preparing": 1,
      "ready": 2,
      "completed": 3
    };
    
    const statusDiff = statusPriority[a.status as keyof typeof statusPriority] - 
                      statusPriority[b.status as keyof typeof statusPriority];
    
    if (statusDiff !== 0) return statusDiff;
    
    // Then by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  // Poll for updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [refetch]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <StaffHeader title="Kitchen Order Display" />
      
      <div className="flex-grow p-6 bg-gray-100">
        {sortedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <p className="text-xl font-medium">No active orders</p>
            <p className="mt-2">New orders will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedOrders.map(order => (
              <OrderCard key={order.id} order={order} type="kitchen" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
