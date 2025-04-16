import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
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
  const [_, setLocation] = useLocation();
  
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
      
      <div className="flex flex-col items-center mb-8">
        <img 
          src="/assets/cropped-4TyF5CXA-272x300.png" 
          alt="1861 Public House Logo" 
          className="h-28 mb-2"
        />
        <h1 className="text-3xl font-bold mb-2 text-primary text-center">Table {tableId} Ordering</h1>
        <p className="text-slate-600 text-center">View our menu and place your order below</p>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-primary">Welcome to 1861 Public House!</h2>
        <p className="mb-2 text-slate-600">Browse our menu and add items to your cart.</p>
        <p className="mb-4 text-slate-600">When you're ready, enter your last name and place your order.</p>
        
        {/* Menu section */}
        <div className="mt-8 space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600">Loading menu items...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center bg-red-50 rounded-xl border border-red-200">
              <p className="text-red-600">{error}</p>
            </div>
          ) : menuItems.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-slate-600">No menu items available at this time.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Pizza Section */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="h-10 w-2 bg-primary rounded-full mr-3"></div>
                  <h3 className="font-bold text-2xl text-primary">Pizza</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {menuItems
                    .filter(item => item.category === 'pizza')
                    .map(item => (
                      <MenuItemCard key={item.id} item={item} />
                    ))}
                </div>
              </div>
              
              {/* Drinks Section */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="h-10 w-2 bg-primary rounded-full mr-3"></div>
                  <h3 className="font-bold text-2xl text-primary">Drinks</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div className="mt-10 p-6 bg-white rounded-xl shadow-md border border-slate-100">
          <h3 className="font-bold text-xl text-primary mb-4">Your Order</h3>
          
          {cart.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-600">Your cart is empty. Add items from the menu to get started.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {cart.map((item, index) => (
                  <CartItem key={index} item={item} index={index} />
                ))}
              </div>
              
              <div className="flex justify-between font-bold text-lg border-t border-slate-200 pt-4 mt-4">
                <span className="text-slate-800">Total:</span>
                <span className="text-primary">${calculateTotal()}</span>
              </div>
            </>
          )}
        </div>
        
        {/* Last Name Input */}
        {cart.length > 0 && (
          <div className="mt-8 p-6 bg-white rounded-xl shadow-md border border-slate-100">
            <h3 className="font-bold text-xl text-primary mb-4">Your Information</h3>
            <div className="mb-4">
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                Last Name (for order identification)
              </label>
              <input
                type="text"
                id="lastName"
                value={customerLastName}
                onChange={(e) => setCustomerLastName(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary"
                placeholder="Enter your last name"
              />
            </div>
          </div>
        )}
        
        {/* Place order button */}
        <div className="mt-8">
          <Button 
            className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-lg shadow-md"
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
                
                // Clear the form and redirect to confirmation page
                clearCart();
                setCustomerLastName("");
                
                // Redirect to the confirmation page
                setLocation(`/order-confirmation/${tableId}`);
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