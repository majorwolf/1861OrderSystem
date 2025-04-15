import { useState, useEffect } from "react";
import { Link } from "wouter";
import { MenuItem } from "@shared/schema";

// Type for a new menu item form
interface NewMenuItem {
  name: string;
  description: string;
  price: string;
  category: string;
  customizable: boolean;
}

export default function AdminView() {
  // State for menu items
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for toggling item availability
  const [unavailableItems, setUnavailableItems] = useState<Set<number>>(new Set());
  const [savingChanges, setSavingChanges] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // State for add/delete functionality
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newItem, setNewItem] = useState<NewMenuItem>({
    name: "",
    description: "",
    price: "",
    category: "pizza",
    customizable: false
  });
  const [addingItem, setAddingItem] = useState(false);
  const [deletingItem, setDeletingItem] = useState<number | null>(null);
  
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
        
        // Initialize unavailable items from the fetched data
        const initialUnavailable = new Set<number>();
        data.forEach((item: MenuItem) => {
          if (item.available === false) {
            initialUnavailable.add(item.id);
          }
        });
        setUnavailableItems(initialUnavailable);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError('Failed to load menu. Please try again.');
        setLoading(false);
      }
    }
    
    fetchMenuItems();
  }, []);
  
  // Toggle item availability
  const toggleItemAvailability = (itemId: number) => {
    setUnavailableItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };
  
  // Save changes to the server
  const saveChanges = async () => {
    try {
      setSavingChanges(true);
      
      // Prepare the updated items data
      const updatedItems = menuItems.map(item => ({
        id: item.id,
        available: !unavailableItems.has(item.id)
      }));
      
      // Send the update to the server
      const response = await fetch('/api/menu/update-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItems),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update menu items');
      }
      
      setSuccessMessage('Menu items availability updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating menu items:', err);
      setError('Failed to update menu items. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSavingChanges(false);
    }
  };
  
  // Function to add a new menu item
  const addMenuItem = async () => {
    if (!newItem.name || !newItem.description || !newItem.price) {
      setError('Please fill in all required fields');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setAddingItem(true);
      
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add menu item');
      }
      
      const data = await response.json();
      
      setMenuItems(prev => [...prev, data]);
      setSuccessMessage('Menu item added successfully!');
      
      // Reset form
      setNewItem({
        name: "",
        description: "",
        price: "",
        category: "pizza",
        customizable: false
      });
      setShowAddItemForm(false);
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error adding menu item:', err);
      setError('Failed to add menu item. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setAddingItem(false);
    }
  };
  
  // Function to delete a menu item
  const deleteMenuItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeletingItem(id);
      
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete menu item');
      }
      
      setMenuItems(prev => prev.filter(item => item.id !== id));
      setSuccessMessage('Menu item deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting menu item:', err);
      setError('Failed to delete menu item. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeletingItem(null);
    }
  };
  
  // Handle input changes for new item form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setNewItem(prev => ({ ...prev, [name]: checked }));
    } else {
      setNewItem(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Menu Management</h1>
        <Link href="/">
          <span className="text-blue-600 hover:underline cursor-pointer">← Back to Home</span>
        </Link>
      </div>
      
      {/* Success and Error Messages */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Add New Menu Item Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Menu Item</h2>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => setShowAddItemForm(!showAddItemForm)}
          >
            {showAddItemForm ? 'Cancel' : 'Add New Item'}
          </button>
        </div>
        
        {showAddItemForm && (
          <div className="bg-gray-50 p-4 rounded mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={newItem.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Item name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                <input
                  type="text"
                  name="price"
                  value={newItem.price}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="$0.00"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={newItem.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="Item description"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={newItem.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="pizza">Pizza</option>
                  <option value="drink">Drink</option>
                  <option value="side">Side</option>
                  <option value="dessert">Dessert</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="customizable"
                  name="customizable"
                  checked={newItem.customizable}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="customizable" className="text-sm font-medium text-gray-700">
                  Customizable
                </label>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                onClick={addMenuItem}
                disabled={addingItem}
              >
                {addingItem ? 'Adding...' : 'Add Item'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Menu Items Availability Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Menu Items Management</h2>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
            onClick={saveChanges}
            disabled={savingChanges}
          >
            {savingChanges ? 'Saving...' : 'Save Availability Changes'}
          </button>
        </div>
        
        {loading ? (
          <p className="text-center py-4">Loading menu items...</p>
        ) : menuItems.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No menu items available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {menuItems.map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.description.substring(0, 50)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={!unavailableItems.has(item.id)}
                          onChange={() => toggleItemAvailability(item.id)}
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ms-3 text-sm font-medium text-gray-900">
                          {unavailableItems.has(item.id) ? 'Unavailable' : 'Available'}
                        </span>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => deleteMenuItem(item.id)}
                        disabled={deletingItem === item.id}
                        className="text-xs px-2 py-1 text-white bg-red-600 rounded hover:bg-red-700 disabled:bg-gray-400"
                      >
                        {deletingItem === item.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}