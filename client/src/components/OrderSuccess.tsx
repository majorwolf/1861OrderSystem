import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

interface OrderSuccessProps {
  onClose: () => void;
}

export default function OrderSuccess({ onClose }: OrderSuccessProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        numberOfPieces={confettiPieces}
        recycle={false}
        colors={['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4']}
      />
      
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-10 w-10 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Order Confirmed!</h2>
        <p className="text-gray-600 mb-6">
          Your order has been sent to the kitchen and bar. 
          Time to sit back and relax while we prepare your delicious food!
        </p>
        
        <Button 
          onClick={onClose} 
          className="w-full py-3 bg-primary hover:bg-red-700 transition-colors"
        >
          Continue Browsing Menu
        </Button>
      </div>
    </div>
  );
}