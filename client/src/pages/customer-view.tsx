import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { MenuItem } from "@shared/schema";

// Type for cart items
interface CartItem {
  menuItemId: number;
  name: string;
  price: string;
  quantity: number;
  size?: string;
  notes?: string;
}

export default function CustomerView() {
  // Get the table ID from URL params
  const params = useParams<{ tableId: string }>();
  const tableId = params ? parseInt(params.tableId) : null;
  
  // State for menu items
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for cart
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Add item to cart
  const addToCart = (item: MenuItem) => {
    // Check if item is already in cart
    const existingCartItem = cart.find(cartItem => cartItem.menuItemId === item.id);
    
    if (existingCartItem) {
      // Update quantity if item exists
      setCart(cart.map(cartItem => 
        cartItem.menuItemId === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 } 
          : cartItem
      ));
    } else {
      // Add new item
      const newItem: CartItem = {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      };
      setCart([...cart, newItem]);
    }
  };
  
  // Remove item from cart
  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };
  
  // Calculate total price
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0).toFixed(2);
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
        setMenuItems(data);
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
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Our Menu</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map(item => (
                  <div key={item.id} className="border p-3 rounded bg-white">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{item.name}</h4>
                      <span className="font-semibold">${item.price}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <button 
                      className="mt-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => addToCart(item)}
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Cart will go here */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium mb-2">Your Order</h3>
          <p>Cart is empty. Add items from the menu to get started.</p>
        </div>
        
        {/* Place order button */}
        <div className="mt-6">
          <button 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            disabled={true}
          >
            Place Order
          </button>
        </div>
      </div>
      
      <Link href="/">
        <span className="text-blue-600 hover:underline cursor-pointer">← Back to Home</span>
      </Link>
    </div>
  );
}