import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { useOrderContext } from "@/context/OrderContext";
import { WebSocketHandler } from "@/components/WebSocketHandler";

export default function CustomerView() {
  // Get the table ID from URL params
  const params = useParams<{ tableId: string }>();
  const tableId = params ? parseInt(params.tableId) : null;
  
  // Access order context
  const { setTableId } = useOrderContext();
  
  useEffect(() => {
    // Set the table ID in the order context when component mounts
    if (tableId) {
      console.log("Setting table ID:", tableId);
      setTableId(tableId);
    }
    
    // Clear the table ID when the component unmounts
    return () => {
      setTableId(null);
    };
  }, [tableId, setTableId]);

  if (!tableId) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Invalid Table</h1>
        <div className="bg-white p-6 rounded-lg shadow mb-4">
          <p>No valid table ID provided.</p>
        </div>
        <Link href="/">
          <span className="text-blue-600 hover:underline cursor-pointer">← Back to Home</span>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Hidden WebSocket handler */}
      <WebSocketHandler />
      
      <h1 className="text-3xl font-bold mb-6">Order for Table {tableId}</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome to Pizza Palace!</h2>
        <p className="mb-4">This is the customer ordering view for Table {tableId}.</p>
        <p>Here you can browse the menu and place your order.</p>
        
        {/* Menu tabs will go here */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p>Menu loading...</p>
        </div>
        
        {/* Cart will go here */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium mb-2">Your Order</h3>
          <p>Cart is empty. Add items from the menu to get started.</p>
        </div>
        
        {/* Place order button */}
        <div className="mt-6">
          <button 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            disabled={true}
          >
            Place Order
          </button>
        </div>
      </div>
      
      <Link href="/">
        <span className="text-blue-600 hover:underline cursor-pointer">← Back to Home</span>
      </Link>
    </div>
  );
}