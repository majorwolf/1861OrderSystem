import { OrderItem } from "@shared/schema";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrderContext } from "@/context/OrderContext";

interface CartItemProps {
  item: OrderItem;
  index: number;
}

export default function CartItem({ item, index }: CartItemProps) {
  const { updateCartItemQuantity, removeFromCart } = useOrderContext();
  
  const handleIncrement = () => {
    updateCartItemQuantity(index, item.quantity + 1);
  };
  
  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateCartItemQuantity(index, item.quantity - 1);
    } else {
      removeFromCart(index);
    }
  };
  
  const handleRemove = () => {
    removeFromCart(index);
  };
  
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0">
      <div className="flex-grow">
        <div className="flex justify-between">
          <span className="font-medium">{item.quantity}× {item.name}</span>
          <div className="text-right">
            <span className="font-medium">${calculatePrice(item)}</span>
            <div className="text-xs text-gray-500">
              ${calculateUnitPrice(item)} each
            </div>
          </div>
        </div>
        {item.size && (
          <span className="text-sm text-gray-500">{item.size}</span>
        )}
        
        {/* Show added toppings */}
        {item.addedToppings && item.addedToppings.length > 0 && (
          <div className="text-sm text-gray-600 mt-1">
            <span className="font-medium">Added:</span>{' '}
            {item.addedToppings.map(topping => topping.name).join(', ')}
          </div>
        )}
        
        {/* Show removed toppings */}
        {item.removedToppings && item.removedToppings.length > 0 && (
          <div className="text-sm text-gray-600 mt-1">
            <span className="font-medium">Removed:</span>{' '}
            {item.removedToppings.map(topping => topping.name).join(', ')}
          </div>
        )}
        
        {item.notes && (
          <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
        )}
      </div>
      <div className="flex items-center ml-4">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDecrement}>
          <Minus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={handleRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleIncrement}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Helper function to calculate unit price
function calculateUnitPrice(item: OrderItem): string {
  // Parse the base price removing the $ and any + sign
  let basePrice = parseFloat(item.price.replace('$', '').replace('+', ''));
  
  // Add price based on size
  if (item.size === "Large") {
    basePrice += 2; // $2 extra for large
  }
  
  // Add cost of additional toppings if present
  if (item.addedToppings && item.addedToppings.length > 0) {
    item.addedToppings.forEach(topping => {
      basePrice += parseFloat(topping.price.replace('$', ''));
    });
  }
  
  return basePrice.toFixed(2);
}

// Helper function to calculate total price based on quantity and size
function calculatePrice(item: OrderItem): string {
  const unitPrice = parseFloat(calculateUnitPrice(item));
  
  // Calculate total with quantity
  const totalPrice = (unitPrice * item.quantity).toFixed(2);
  return totalPrice;
}
