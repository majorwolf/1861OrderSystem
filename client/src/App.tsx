import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Switch, Route, Link } from "wouter";

// Import page components
import CustomerView from "./pages/customer-view";
import KitchenView from "./pages/kitchen-view";
import BarView from "./pages/bar-view";
import QRCodeView from "./pages/qrcode-view";
import NotFound from "./pages/not-found";

// Simple Home Component
function Home() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Pizza Palace Order System</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Restaurant Experience</h2>
        <p className="mb-4">For customers scanning QR codes at their table:</p>
        
        <div className="mb-6">
          <Link href="/table/1">
            <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer">
              Customer Ordering (Table 1)
            </span>
          </Link>
        </div>
        
        <div className="border-t pt-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Staff Access</h2>
          <p className="mb-4">For restaurant staff only:</p>
          
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <Link href="/kitchen">
              <span className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer">
                Kitchen View
              </span>
            </Link>
            
            <Link href="/bar">
              <span className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 cursor-pointer">
                Bar View
              </span>
            </Link>
            
            <Link href="/admin/qrcodes">
              <span className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 cursor-pointer">
                QR Code Management
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// All component implementations have been moved to their own files in the pages directory

function App() {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    console.log("App component mounted");
    setLoaded(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* The OrderContext provider needs to be here, outside of the routing */}
      {/* so that all components can access the shared order state */}
      <div className="app-container min-h-screen bg-gray-50">
        {loaded ? (
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/table/:tableId" component={CustomerView} />
            <Route path="/kitchen" component={KitchenView} /> 
            <Route path="/bar" component={BarView} />
            <Route path="/admin/qrcodes" component={QRCodeView} />
            <Route component={NotFound} />
          </Switch>
        ) : (
          <div className="loading-container">
            <p>Loading application...</p>
          </div>
        )}
      </div>
      
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
