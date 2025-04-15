import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Switch, Route, Link } from "wouter";

// Simple Home Component
function Home() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Pizza Palace Order System</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <p className="mb-4">Welcome to the Pizza Palace Order System!</p>
        <p className="mb-4">Please select a view:</p>
        
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <Link href="/customer">
            <a className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Customer View
            </a>
          </Link>
          
          <Link href="/kitchen">
            <a className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Kitchen View
            </a>
          </Link>
          
          <Link href="/bar">
            <a className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Bar View
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Simple placeholder components for each view
function CustomerView() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Customer View</h1>
      <div className="bg-white p-6 rounded-lg shadow mb-4">
        <p>This is where customers would order food and drinks.</p>
      </div>
      <Link href="/">
        <a className="text-blue-600 hover:underline">← Back to Home</a>
      </Link>
    </div>
  );
}

function KitchenView() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Kitchen View</h1>
      <div className="bg-white p-6 rounded-lg shadow mb-4">
        <p>This is where kitchen staff would see food orders.</p>
      </div>
      <Link href="/">
        <a className="text-blue-600 hover:underline">← Back to Home</a>
      </Link>
    </div>
  );
}

function BarView() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Bar View</h1>
      <div className="bg-white p-6 rounded-lg shadow mb-4">
        <p>This is where bar staff would see drink orders.</p>
      </div>
      <Link href="/">
        <a className="text-blue-600 hover:underline">← Back to Home</a>
      </Link>
    </div>
  );
}

function NotFound() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Page Not Found</h1>
      <div className="bg-white p-6 rounded-lg shadow mb-4">
        <p>The page you're looking for doesn't exist.</p>
      </div>
      <Link href="/">
        <a className="text-blue-600 hover:underline">← Back to Home</a>
      </Link>
    </div>
  );
}

function App() {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    console.log("App component mounted");
    setLoaded(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container min-h-screen bg-gray-50">
        {loaded ? (
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/customer" component={CustomerView} />
            <Route path="/kitchen" component={KitchenView} /> 
            <Route path="/bar" component={BarView} />
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
