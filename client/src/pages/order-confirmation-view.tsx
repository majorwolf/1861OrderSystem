import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import Confetti from "react-confetti";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Home, ArrowLeft } from "lucide-react";

export default function OrderConfirmationView() {
  const params = useParams<{ tableId: string }>();
  const tableId = params ? parseInt(params.tableId) : null;
  
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [confettiPieces, setConfettiPieces] = useState(200);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    
    // Gradually reduce confetti pieces
    const timer = setTimeout(() => {
      setConfettiPieces(50);
    }, 3000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  if (!tableId) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Invalid Order</h1>
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        numberOfPieces={confettiPieces}
        recycle={false}
        colors={['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4']}
      />
      
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-green-600" />
          </div>
          
          <h2 className="text-3xl font-bold mb-2 text-gray-800">Order Confirmed!</h2>
          <p className="text-xl text-gray-600 mb-3">Thank you for your order</p>
          
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <p className="text-gray-600">
              Your order has been sent to the kitchen and bar. 
              Time to sit back and relax while we prepare your delicious food!
            </p>
          </div>
          
          <div className="mt-8 space-y-4">
            <Link href={`/table/${tableId}`}>
              <Button 
                className="w-full py-3 flex items-center justify-center gap-2"
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Menu
              </Button>
            </Link>
            
            <Link href="/">
              <Button 
                className="w-full py-3 bg-primary hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>Order for Table #{tableId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}