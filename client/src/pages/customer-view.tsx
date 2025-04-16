import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { MenuItem, OrderItem } from "@shared/schema";
import MenuItemCard from "@/components/MenuItemCard";
import CartItem from "@/components/CartItem";
import { Button } from "@/components/ui/button";
import { useOrderContext } from "@/context/OrderContext";

// We're using the OrderItem type from shared/schema.ts now

export default function CustomerView() {
  // Get the table ID from URL params
  const params = useParams<{ tableId: string }>();
  const tableId = params ? parseInt(params.tableId) : null;
  
  // State for menu items
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerLastName, setCustomerLastName] = useState<string>("");
  
  // State for order submission
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Get cart from order context
  const { cart, setTableId, clearCart } = useOrderContext();
  
  // Set table ID in context when it changes
  useEffect(() => {
    if (tableId) {
      setTableId(tableId);
    }
  }, [tableId, setTableId]);
  
  // Calculate total price
  const calculateTotal = (): string => {
    let total = 0;
    
    cart.forEach(item => {
      let itemPrice = parseFloat(item.price.replace('$', '').replace('+', ''));
      total += itemPrice * item.quantity;
    });
    
    return total.toFixed(2);
  };
  
  // Fetch menu items
  useEffect(() => {
    async function fetchMenuItems() {
      try {
        setLoading(true);
        const response = await fetch('/api/menu');
        if (!response.ok) {
          throw new Error('Failed to fetch menu items');
        }
        const data = await response.json();
        
        // Filter out unavailable items for the customer view
        const availableItems = data.filter((item: MenuItem) => item.available !== false);
        console.log('Filtered available items:', availableItems);
        
        setMenuItems(availableItems);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError('Failed to load menu. Please try again.');
        setLoading(false);
      }
    }
    
    if (tableId) {
      fetchMenuItems();
    }
  }, [tableId]);

  if (!tableId) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Invalid Table</h1>
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
    <div className="p-8 max-w-4xl mx-auto">
      {/* Temporarily commented out until WebSocket issues are fixed */}
      {/* <WebSocketHandler /> */}
      
      <h1 className="text-3xl font-bold mb-6">Order for Table {tableId}</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome to Pizza Palace!</h2>
        <p className="mb-4">This is the customer ordering view for Table {tableId}.</p>
        <p>Here you can browse the menu and place your order.</p>
        
        {/* Menu section */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          {loading ? (
            <p className="text-center">Loading menu...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : menuItems.length === 0 ? (
            <p className="text-center text-gray-500">No menu items available.</p>
          ) : (
            <div className="space-y-8">
              {/* Pizza Section */}
              <div>
                <h3 className="font-semibold text-xl border-b pb-2 mb-4">Pizza</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems
                    .filter(item => item.category === 'pizza')
                    .map(item => (
                      <MenuItemCard key={item.id} item={item} />
                    ))}
                </div>
              </div>
              
              {/* Drinks Section */}
              <div>
                <h3 className="font-semibold text-xl border-b pb-2 mb-4">Drinks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems
                    .filter(item => item.category === 'drink')
                    .map(item => (
                      <MenuItemCard key={item.id} item={item} />
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Cart section */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Your Order</h3>
          
          {cart.length === 0 ? (
            <p className="text-gray-500">Cart is empty. Add items from the menu to get started.</p>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {cart.map((item, index) => (
                  <CartItem key={index} item={item} index={index} />
                ))}
              </div>
              
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total:</span>
                <span>${calculateTotal()}</span>
              </div>
            </>
          )}
        </div>
        
        {/* Last Name Input */}
        {cart.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Your Information</h3>
            <div className="mb-4">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name (for order identification)
              </label>
              <input
                type="text"
                id="lastName"
                value={customerLastName}
                onChange={(e) => setCustomerLastName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your last name"
              />
            </div>
          </div>
        )}
        
        {/* Place order button */}
        <div className="mt-6">
          <Button 
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg"
            disabled={cart.length === 0 || (cart.length > 0 && !customerLastName.trim()) || submitting}
            onClick={async () => {
              try {
                setSubmitting(true);
                setSubmitError(null);
                
                // Determine order type based on cart items
                const hasFood = cart.some(item => {
                  // Consider an item as food if it's in the pizza category or another food category
                  return item.category === 'pizza' || 
                         (item.category && item.category !== 'drink');
                });
                const hasDrink = cart.some(item => 
                  item.category === 'drink'
                );
                
                // Set the type based on contents
                let orderType = "kitchen"; // Default to kitchen
                if (hasFood && hasDrink) {
                  orderType = "both"; // Both kitchen and bar
                } else if (!hasFood && hasDrink) {
                  orderType = "bar"; // Only drinks, send to bar
                }
                
                // Create the order payload
                const order = {
                  tableId,
                  type: orderType,
                  status: "new",
                  items: cart,
                  notes: `Order for ${customerLastName}`
                };
                
                console.log('Submitting order:', order);
                
                // Submit the order to the server
                const response = await fetch('/api/orders', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(order)
                });
                
                if (!response.ok) {
                  throw new Error('Failed to submit order');
                }
                
                const createdOrder = await response.json();
                console.log('Order created successfully:', createdOrder);
                
                // Show success message and clear the form
                alert(`Order placed successfully for ${customerLastName}!`);
                clearCart();
                setCustomerLastName("");
              } catch (err) {
                console.error('Error placing order:', err);
                setSubmitError('Failed to place order. Please try again.');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {submitting ? 'Placing Order...' : 'Place Order'}
          </Button>
          {cart.length > 0 && !customerLastName.trim() && (
            <p className="text-red-500 text-sm mt-2">Please enter your last name to place the order</p>
          )}
          {submitError && (
            <p className="text-red-500 text-sm mt-2">{submitError}</p>
          )}
        </div>
      </div>
      
      <Link href="/">
        <span className="text-blue-600 hover:underline cursor-pointer">← Back to Home</span>
      </Link>
    </div>
  );
}