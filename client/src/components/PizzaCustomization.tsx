import { useState, useEffect } from "react";
import { MenuItem } from "@shared/schema";
import { useOrderContext } from "@/context/OrderContext";

// Define the ToppingItem interface for our component
interface ToppingItem {
  id: number;
  name: string;
  price: string;
  category: string;
  available: boolean;
}

interface PizzaCustomizationProps {
  menuItem: MenuItem;
  onClose: () => void;
  onAddToCart: () => void;
}

export default function PizzaCustomization({ menuItem, onClose, onAddToCart }: PizzaCustomizationProps) {
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("Regular");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [presetToppings, setPresetToppings] = useState<ToppingItem[]>([]);
  const [allToppings, setAllToppings] = useState<ToppingItem[]>([]);
  const [addedToppings, setAddedToppings] = useState<ToppingItem[]>([]);
  const [removedToppings, setRemovedToppings] = useState<ToppingItem[]>([]);
  
  const { addToCart } = useOrderContext();
  
  // Parse the base price (removing the $ and any + sign)
  const basePrice = parseFloat(menuItem.price.replace('$', '').replace('+', ''));

  // Calculate the total price with added toppings
  const calculateTotalPrice = (): number => {
    // Base price
    let total = basePrice;
    
    // Add size pricing
    if (size === "Large") {
      total += 2; // $2 extra for large
    }
    
    // Add additional toppings pricing
    addedToppings.forEach(topping => {
      const toppingPrice = parseFloat(topping.price.replace('$', '').replace('+', ''));
      total += toppingPrice;
    });
    
    // Remove pricing of removed toppings (we don't decrease the price, but it's useful to track)
    // This would be needed if we ever wanted to allow discounts for removing toppings
    
    // Calculate total for one pizza
    let singleItemTotal = total;
    
    // Multiply by quantity
    total = singleItemTotal * quantity;
    
    return total;
  };
  
  // Format the price in $XX.XX format
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  // Fetch the preset toppings for this menu item
  useEffect(() => {
    const fetchPresetToppings = async () => {
      try {
        const response = await fetch(`/api/menu/${menuItem.id}/toppings`);
        if (!response.ok) {
          throw new Error('Failed to fetch preset toppings');
        }
        const data = await response.json();
        setPresetToppings(data);
        
        // For non-customizable (prebuilt) pizzas, set all preset toppings as already applied
        // This allows customers to remove toppings from prebuilt pizzas
        if (data.length > 0) {
          console.log(`Found ${data.length} preset toppings for ${menuItem.name}`);
          
          // Show preset toppings message
          if (data.length > 0) {
            const toppingNames = data.map((t: ToppingItem) => t.name).join(", ");
            console.log(`Pizza comes with: ${toppingNames}`);
          }
        }
      } catch (error) {
        console.error('Error fetching preset toppings:', error);
        setError('Failed to load preset toppings');
      }
    };

    const fetchAllToppings = async () => {
      try {
        const response = await fetch('/api/toppings');
        if (!response.ok) {
          throw new Error('Failed to fetch toppings');
        }
        const data = await response.json();
        setAllToppings(data);
      } catch (error) {
        console.error('Error fetching all toppings:', error);
        setError('Failed to load toppings');
      } finally {
        setLoading(false);
      }
    };

    fetchPresetToppings();
    fetchAllToppings();
  }, [menuItem.id]);

  // Handle adding topping
  const handleAddTopping = (topping: ToppingItem) => {
    // Check if the topping is already a preset and not in the removed list
    const isPreset = presetToppings.some(t => t.id === topping.id);
    
    if (isPreset) {
      // If it's a preset topping, remove it from the removed list
      setRemovedToppings(prev => prev.filter(t => t.id !== topping.id));
    } else {
      // If it's not a preset topping, add it to the added list if not already there
      if (!addedToppings.some(t => t.id === topping.id)) {
        setAddedToppings(prev => [...prev, topping]);
      }
    }
  };

  // Handle removing topping
  const handleRemoveTopping = (topping: ToppingItem) => {
    // Check if the topping is a preset
    const isPreset = presetToppings.some(t => t.id === topping.id);
    
    if (isPreset) {
      // If it's a preset topping, add it to the removed list
      if (!removedToppings.some(t => t.id === topping.id)) {
        setRemovedToppings(prev => [...prev, topping]);
      }
    } else {
      // If it's not a preset topping, remove it from the added list
      setAddedToppings(prev => prev.filter(t => t.id !== topping.id));
    }
  };

  // Check if a topping is currently applied (preset and not removed, or added)
  const isToppingApplied = (topping: ToppingItem): boolean => {
    const isPreset = presetToppings.some(t => t.id === topping.id);
    const isRemoved = removedToppings.some(t => t.id === topping.id);
    const isAdded = addedToppings.some(t => t.id === topping.id);
    
    return (isPreset && !isRemoved) || isAdded;
  };

  // Group toppings by category
  const getToppingsByCategory = (category: string): ToppingItem[] => {
    return allToppings.filter(topping => 
      topping.category === category && topping.available
    );
  };

  // Handle adding the customized pizza to cart
  const handleAddCustomPizzaToCart = () => {
    // Calculate price for one pizza
    let singlePizzaPrice = basePrice;
    
    // Add size pricing
    if (size === "Large") {
      singlePizzaPrice += 2; // $2 extra for large
    }
    
    // Add additional toppings pricing
    addedToppings.forEach(topping => {
      const toppingPrice = parseFloat(topping.price.replace('$', '').replace('+', ''));
      singlePizzaPrice += toppingPrice;
    });
    
    // Format price per unit (this is what shows in the cart line item)
    const formattedSinglePrice = formatPrice(singlePizzaPrice);
    
    // Calculate total price (quantity * single price)
    const totalPrice = singlePizzaPrice * quantity;
    
    console.log('Adding to cart - single price:', singlePizzaPrice, 'quantity:', quantity, 'total:', totalPrice);
    
    // Prepare the toppings lists
    const finalAddedToppings = addedToppings.length > 0 ? addedToppings : undefined;
    const finalRemovedToppings = removedToppings.length > 0 ? removedToppings : undefined;
    
    // Add to cart
    addToCart({
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: formattedSinglePrice, // Use the single item price for display in cart
      quantity,
      size,
      category: menuItem.category,
      notes: notes.trim() || undefined,
      addedToppings: finalAddedToppings,
      removedToppings: finalRemovedToppings
    });
    
    // Notify parent component
    onAddToCart();
  };

  if (loading) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={onClose}
          className="w-full py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">{menuItem.name}</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Display preset toppings for this pizza if any */}
      {presetToppings.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Includes:</span>{' '}
            {presetToppings.map((t: ToppingItem) => t.name).join(", ")}
          </p>
          <p className="text-xs text-gray-500 mt-1">You can customize by adding or removing toppings below.</p>
        </div>
      )}
      
      <div className="border-b pb-4 mb-4">
        <div className="font-semibold mb-2">Size</div>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="size"
              checked={size === "Regular"}
              onChange={() => setSize("Regular")}
              className="mr-2"
            />
            Regular
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="size"
              checked={size === "Large"}
              onChange={() => setSize("Large")}
              className="mr-2"
            />
            Large (+$2.00)
          </label>
        </div>
      </div>
      
      <div className="border-b pb-4 mb-4">
        <div className="font-semibold mb-2">Quantity</div>
        <div className="flex items-center">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-1 bg-gray-200 rounded-l hover:bg-gray-300"
          >
            -
          </button>
          <span className="px-4 py-1 border-t border-b">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-3 py-1 bg-gray-200 rounded-r hover:bg-gray-300"
          >
            +
          </button>
        </div>
      </div>
      
      {/* Toppings Section */}
      <div className="border-b pb-4 mb-4">
        <div className="font-semibold mb-2">Toppings</div>
        
        {/* Cheese Toppings */}
        <div className="mb-4">
          <h3 className="text-sm uppercase text-gray-500 mb-2">Cheese</h3>
          <div className="grid grid-cols-2 gap-2">
            {getToppingsByCategory('cheese').map(topping => (
              <label key={topping.id} className="flex items-center p-2 border rounded hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={isToppingApplied(topping)}
                  onChange={() => 
                    isToppingApplied(topping) 
                      ? handleRemoveTopping(topping) 
                      : handleAddTopping(topping)
                  }
                  className="mr-2"
                />
                <span>{topping.name}</span>
                <span className="ml-auto text-sm text-gray-500">{topping.price}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Meat Toppings */}
        <div className="mb-4">
          <h3 className="text-sm uppercase text-gray-500 mb-2">Meat</h3>
          <div className="grid grid-cols-2 gap-2">
            {getToppingsByCategory('meat').map(topping => (
              <label key={topping.id} className="flex items-center p-2 border rounded hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={isToppingApplied(topping)}
                  onChange={() => 
                    isToppingApplied(topping) 
                      ? handleRemoveTopping(topping) 
                      : handleAddTopping(topping)
                  }
                  className="mr-2"
                />
                <span>{topping.name}</span>
                <span className="ml-auto text-sm text-gray-500">{topping.price}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Veggie Toppings */}
        <div className="mb-4">
          <h3 className="text-sm uppercase text-gray-500 mb-2">Vegetables</h3>
          <div className="grid grid-cols-2 gap-2">
            {getToppingsByCategory('veggie').map(topping => (
              <label key={topping.id} className="flex items-center p-2 border rounded hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={isToppingApplied(topping)}
                  onChange={() => 
                    isToppingApplied(topping) 
                      ? handleRemoveTopping(topping) 
                      : handleAddTopping(topping)
                  }
                  className="mr-2"
                />
                <span>{topping.name}</span>
                <span className="ml-auto text-sm text-gray-500">{topping.price}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      {/* Special Instructions */}
      <div className="border-b pb-4 mb-4">
        <div className="font-semibold mb-2">Special Instructions</div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special requests?"
          className="w-full p-2 border rounded"
          rows={2}
        />
      </div>
      
      {/* Total Price and Add to Cart */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total:</span>
          <span className="text-xl font-bold">{formatPrice(calculateTotalPrice())}</span>
        </div>
        <button
          onClick={handleAddCustomPizzaToCart}
          className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}