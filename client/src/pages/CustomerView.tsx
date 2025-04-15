import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useOrderContext } from "@/context/OrderContext";
import MenuTabs from "@/components/MenuTabs";
import Cart from "@/components/Cart";
import { Table, Order } from "@shared/schema";

export default function CustomerView() {
  const { tableId } = useParams();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, menuItems, setTableId } = useOrderContext();
  
  // Get table information
  const { data: table, isLoading: isTableLoading } = useQuery<Table>({
    queryKey: [`/api/tables/number/${tableId}`],
  });
  
  // Get orders for this table
  const { data: tableOrders } = useQuery<Order[]>({
    queryKey: [`/api/orders/table/${table?.id}`],
    enabled: !!table?.id,
    refetchInterval: 30000, // Poll every 30 seconds
  });
  
  // Set table ID in context when table data is loaded
  useEffect(() => {
    if (table?.id) {
      setTableId(table.id);
    }
  }, [table?.id, setTableId]);
  
  // Calculate total quantity of items in cart
  const cartQuantity = cart.reduce((total, item) => total + item.quantity, 0);
  
  // Show pending orders count
  const activeOrders = tableOrders?.filter(
    order => order.status !== "completed"
  ).length || 0;
  
  if (isTableLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading table information...</p>
      </div>
    );
  }
  
  if (!table) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h2 className="text-2xl font-bold mb-2">Table Not Found</h2>
        <p className="text-gray-600 mb-4">The table you're looking for doesn't exist.</p>
        <Button onClick={() => window.location.href = "/"}>
          Return to Table Selection
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header with table info */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h1 className="text-xl font-bold text-gray-900">Pizza Palace</h1>
          </div>
          <div className="flex items-center">
            <div className="text-sm mr-3">
              <span className="text-gray-500">Table</span>
              <span className="font-bold text-gray-900 ml-1">{table.tableNumber}</span>
            </div>
            <button
              className="relative p-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-6 w-6 text-gray-700" />
              {cartQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartQuantity}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Menu Tabs and Content */}
      <MenuTabs menuItems={menuItems} />

      {/* Active orders notification */}
      {activeOrders > 0 && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg">
          <span className="text-sm font-medium">
            {activeOrders} order{activeOrders !== 1 ? 's' : ''} in progress
          </span>
        </div>
      )}

      {/* Checkout Floating Button */}
      {cartQuantity > 0 && (
        <div className="fixed bottom-6 right-6">
          <Button 
            className="rounded-full shadow-lg flex items-center justify-center p-4 bg-primary hover:bg-red-700"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-6 w-6 mr-2" />
            <span>Checkout</span>
          </Button>
        </div>
      )}

      {/* Cart Side Sheet */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
