import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Switch, Route, Link } from "wouter";
import { OrderProvider } from "@/context/OrderContext";
import { DataPoller } from "@/components/DataPoller";

// Import page components
import CustomerView from "./pages/customer-view";
import KitchenView from "./pages/kitchen-view";
import BarView from "./pages/bar-view";
import QRCodeView from "./pages/qrcode-view";
import AdminView from "./pages/admin-view";
import ToppingsManagement from "./pages/toppings-management";
import OrderConfirmationView from "./pages/order-confirmation-view";
import NotFound from "./pages/not-found";

// Simple Home Component
function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/assets/cropped-4TyF5CXA-272x300.png" 
            alt="1861 Public House Logo" 
            className="h-40 mb-4"
          />
          <h1 className="text-4xl font-bold text-primary text-center">
            Digital Order System
          </h1>
          <p className="text-slate-600 mt-2 text-center max-w-xl">
            Welcome to the 1861 Public House digital ordering platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-8 rounded-xl shadow-md border border-slate-100">
            <h2 className="text-2xl font-semibold mb-4 text-primary">Customer Portal</h2>
            <p className="mb-6 text-slate-600">For customers scanning QR codes at their table:</p>
            
            <div className="flex flex-col space-y-3">
              {[1, 2, 3, 4, 5].map(tableNumber => (
                <Link key={tableNumber} href={`/table/${tableNumber}`}>
                  <span className="flex items-center justify-center bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer text-center font-medium">
                    Table {tableNumber} Ordering
                  </span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md border border-slate-100">
            <h2 className="text-2xl font-semibold mb-4 text-primary">Staff Portal</h2>
            <p className="mb-6 text-slate-600">For restaurant staff only:</p>
            
            <div className="flex flex-col space-y-3">
              <Link href="/kitchen">
                <span className="flex items-center justify-center bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer text-center font-medium">
                  Kitchen View
                </span>
              </Link>
              
              <Link href="/bar">
                <span className="flex items-center justify-center bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer text-center font-medium">
                  Bar View
                </span>
              </Link>
              
              <h3 className="text-lg font-medium mt-4 mb-2 text-slate-700">Admin Tools</h3>
              
              <Link href="/admin/qrcodes">
                <span className="flex items-center justify-center bg-slate-600 text-white py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer text-center">
                  QR Code Management
                </span>
              </Link>
              
              <Link href="/admin/menu">
                <span className="flex items-center justify-center bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors cursor-pointer text-center">
                  Menu Management
                </span>
              </Link>
              
              <Link href="/admin/toppings">
                <span className="flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-center">
                  Toppings Management
                </span>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="text-center text-sm text-slate-500">
          <p>© 2025 1861 Public House, Barboursville, WV</p>
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
      <OrderProvider>
        <div className="app-container min-h-screen bg-gray-50">
          {loaded ? (
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/table/:tableId" component={CustomerView} />
              <Route path="/order-confirmation/:tableId" component={OrderConfirmationView} />
              <Route path="/kitchen" component={KitchenView} /> 
              <Route path="/bar" component={BarView} />
              <Route path="/admin/qrcodes" component={QRCodeView} />
              <Route path="/admin/menu" component={AdminView} />
              <Route path="/admin/toppings" component={ToppingsManagement} />
              <Route component={NotFound} />
            </Switch>
          ) : (
            <div className="loading-container">
              <p>Loading application...</p>
            </div>
          )}
        </div>
        
        <Toaster />
      </OrderProvider>
    </QueryClientProvider>
  );
}

export default App;
