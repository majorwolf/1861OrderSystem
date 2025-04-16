import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, Fragment } from "react";
import { useOrderContext } from "@/context/OrderContext";
import { useLocation } from "wouter";
import CartItem from "./CartItem";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { OrderItem } from "@shared/schema";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { cart, tableId, clearCart } = useOrderContext();
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_, setLocation] = useLocation();
  
  const calculateSubtotal = (): number => {
    return cart.reduce((sum, item) => {
      let basePrice = parseFloat(item.price.replace('$', '').replace('+', ''));
      
      // Add price based on size
      if (item.size === "Large") {
        basePrice += 2; // $2 extra for large
      }
      
      // Add additional toppings pricing
      if (item.addedToppings && item.addedToppings.length > 0) {
        item.addedToppings.forEach(topping => {
          const toppingPrice = parseFloat(topping.price.replace('$', ''));
          basePrice += toppingPrice;
        });
      }
      
      // Calculate final price with quantity
      return sum + (basePrice * item.quantity);
    }, 0);
  };
  
  const subtotal = calculateSubtotal();
  
  const categorizeItems = (items: OrderItem[]) => {
    const kitchen: OrderItem[] = [];
    const bar: OrderItem[] = [];
    
    items.forEach(item => {
      if (item.category === "drink") {
        bar.push(item);
      } else {
        kitchen.push(item);
      }
    });
    
    return { kitchen, bar };
  };
  
  const handleSubmitOrder = async () => {
    if (!tableId) {
      toast({
        title: "Error",
        description: "Table ID is missing. Please select a table.",
        variant: "destructive",
      });
      return;
    }
    
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your order.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Categorize items for kitchen and bar
      const { kitchen, bar } = categorizeItems(cart);
      
      // Create orders for kitchen and bar if they have items
      const orders = [];
      
      if (kitchen.length > 0) {
        orders.push(
          apiRequest("POST", "/api/orders", {
            tableId,
            status: "new",
            type: "kitchen",
            items: kitchen,
            notes
          })
        );
      }
      
      if (bar.length > 0) {
        orders.push(
          apiRequest("POST", "/api/orders", {
            tableId,
            status: "new",
            type: "bar",
            items: bar,
            notes
          })
        );
      }
      
      await Promise.all(orders);
      
      // Clear cart and redirect to confirmation page
      clearCart();
      setNotes("");
      onClose();
      
      // Redirect to the confirmation page
      setLocation(`/order-confirmation/${tableId}`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to submit your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Fragment>
      
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="flex flex-col h-full w-full max-w-md sm:max-w-md">
          <SheetHeader className="text-left">
            <SheetTitle>Your Order</SheetTitle>
            <SheetDescription>
              {cart.length === 0 ? 
                "Your cart is empty." : 
                `You have ${cart.length} item${cart.length !== 1 ? 's' : ''} in your cart.`
              }
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex-grow overflow-auto my-4">
            {cart.map((item, index) => (
              <CartItem key={index} item={item} index={index} />
            ))}
            
            {cart.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>Add items to your cart</p>
              </div>
            )}
          </div>
          
          {cart.length > 0 && (
            <Fragment>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Order Notes</label>
                <Textarea 
                  placeholder="Special instructions or allergies..." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              <div className="py-4 border-t border-gray-200">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>Tax (included)</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </Fragment>
          )}
          
          <SheetFooter className="flex-shrink-0">
            <Button 
              className="w-full bg-primary hover:bg-red-700" 
              disabled={cart.length === 0 || isSubmitting}
              onClick={handleSubmitOrder}
            >
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}
