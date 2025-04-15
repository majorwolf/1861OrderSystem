import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MenuItem, OrderItem } from "@shared/schema";
import { Minus, Plus } from "lucide-react";
import { useOrderContext } from "@/context/OrderContext";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PizzaCustomization from "./PizzaCustomization";

interface MenuItemCardProps {
  item: MenuItem;
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const { addToCart } = useOrderContext();
  const [quantity, setQuantity] = useState(0);
  const [size, setSize] = useState("Regular");
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  
  const handleAddToCart = () => {
    if (quantity > 0) {
      // If it's a customizable item, show the customization modal
      if (item.customizable) {
        setShowCustomizationModal(true);
        return;
      }
      
      // Otherwise, add directly to cart
      const orderItem: OrderItem = {
        menuItemId: item.id,
        name: item.name,
        quantity,
        price: item.price,
        size
      };
      
      addToCart(orderItem);
      resetState();
    }
  };
  
  const resetState = () => {
    setQuantity(0);
    setSize("Regular");
    setShowCustomizationModal(false);
  };
  
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decrementQuantity = () => {
    if (quantity > 0) {
      setQuantity(prev => prev - 1);
    }
  };
  
  return (
    <>
      <Card className="overflow-hidden border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
            <span className="font-bold text-primary">{item.price}</span>
          </div>
          <p className="text-gray-600 text-sm mt-1 min-h-[40px]">{item.description}</p>
          
          {!item.customizable && item.category === "pizza" && (
            <div className="mt-2 mb-3">
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Large">Large (+$2.00)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={decrementQuantity}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="mx-2 font-medium text-gray-900">{quantity}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={incrementQuantity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              onClick={handleAddToCart} 
              disabled={quantity === 0}
              variant={item.customizable ? "outline" : "default"}
              className={item.customizable ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-primary hover:bg-red-700"}
            >
              {item.customizable ? "Customize" : "Add to Order"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Pizza Customization Modal */}
      {showCustomizationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
            <PizzaCustomization 
              menuItem={item} 
              onClose={resetState} 
              onAddToCart={resetState}
            />
          </div>
        </div>
      )}
    </>
  );
}
