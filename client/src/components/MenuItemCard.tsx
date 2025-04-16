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
      // If it's a pizza, show the customization modal regardless
      if (item.category === "pizza") {
        setShowCustomizationModal(true);
        return;
      }
      
      // For non-pizza items, add directly to cart
      const orderItem: OrderItem = {
        menuItemId: item.id,
        name: item.name,
        quantity,
        price: item.price,
        size,
        category: item.category
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
      <Card className="overflow-hidden border border-slate-200 shadow-sm rounded-xl hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold text-slate-800">{item.name}</h3>
            <span className="font-bold text-primary">{item.price}</span>
          </div>
          <p className="text-slate-600 text-sm mt-1 min-h-[40px]">{item.description}</p>
          
          {!item.customizable && item.category === "pizza" && (
            <div className="mt-3 mb-3">
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger className="w-full border-slate-300 rounded-lg">
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
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-slate-300" onClick={decrementQuantity}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="mx-3 font-medium text-slate-800 text-lg">{quantity}</span>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-slate-300" onClick={incrementQuantity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              onClick={handleAddToCart} 
              disabled={quantity === 0}
              variant={item.category === "pizza" ? "default" : "default"}
              className={`font-medium rounded-lg ${item.category === "pizza" 
                ? "bg-amber-600 hover:bg-amber-700 text-white" 
                : "bg-primary hover:bg-primary/90 text-white"}`}
            >
              {item.category === "pizza" ? "Customize" : "Add to Order"}
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
