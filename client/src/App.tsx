import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

function App() {
  // Basic state to verify the component is rendering
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    // Simple effect to verify component mounting
    console.log("App component mounted");
    setLoaded(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
        <div className="p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Pizza Palace Order System</h1>
          
          {loaded ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="mb-2">The application is loading successfully.</p>
              <p>This is a simplified view to troubleshoot the rendering issue.</p>
            </div>
          ) : (
            <div className="loading-container">
              <p>Loading application...</p>
            </div>
          )}
        </div>
      </div>
      
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
