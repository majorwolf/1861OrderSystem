import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useOrderContext } from "@/context/OrderContext";
import { WebSocketHandler } from "@/components/WebSocketHandler";
import { Table } from "@shared/schema";

export default function QRCodeView() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch tables data
  useEffect(() => {
    async function fetchTables() {
      try {
        const response = await fetch('/api/tables');
        if (!response.ok) {
          throw new Error('Failed to fetch tables');
        }
        const data = await response.json();
        setTables(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tables:', err);
        setError('Failed to load tables. Please try again later.');
        setLoading(false);
      }
    }
    
    fetchTables();
  }, []);
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Hidden WebSocket handler */}
      <WebSocketHandler />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">QR Code Management</h1>
        <Link href="/">
          <span className="text-blue-600 hover:underline cursor-pointer">← Back to Home</span>
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Restaurant Tables</h2>
        <p className="mb-6">
          Print these QR codes and place them at each table. Customers can scan these to place their orders.
        </p>
        
        {loading ? (
          <div className="text-center py-8">
            <p>Loading tables...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map(table => (
              <div key={table.id} className="border rounded-lg p-4 flex flex-col items-center">
                <h3 className="text-lg font-medium mb-2">Table {table.tableNumber}</h3>
                
                {/* Here we would display an actual QR code */}
                <div className="w-40 h-40 bg-gray-100 flex items-center justify-center mb-3">
                  <p className="text-gray-500 text-sm text-center">
                    QR Code for<br />Table {table.tableNumber}
                  </p>
                </div>
                
                <div className="mt-3 text-center">
                  <p className="text-sm mb-2">
                    URL: {window.location.origin}/table/{table.id}
                  </p>
                  <button className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Print QR Code
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}