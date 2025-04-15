import { useState, useEffect } from "react";
import { Link } from "wouter";
import StaffHeader from "@/components/StaffHeader";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Topping {
  id: number;
  name: string;
  price: string;
  category: string;
  available: boolean;
}

interface NewTopping {
  name: string;
  price: string;
  category: string;
  available: boolean;
}

interface EditTopping extends NewTopping {
  id: number;
}

export default function ToppingsManagement() {
  const { toast } = useToast();
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const [newTopping, setNewTopping] = useState<NewTopping>({
    name: "",
    price: "",
    category: "meat",
    available: true
  });
  
  const [editingTopping, setEditingTopping] = useState<EditTopping | null>(null);
  
  // Fetch all toppings
  useEffect(() => {
    async function fetchToppings() {
      try {
        setLoading(true);
        const response = await fetch('/api/toppings');
        if (!response.ok) {
          throw new Error(`Failed to fetch toppings: ${response.statusText}`);
        }
        const data = await response.json();
        setToppings(data);
      } catch (err) {
        console.error('Error fetching toppings:', err);
        setError('Failed to load toppings. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchToppings();
  }, []);
  
  const startEditingTopping = (topping: Topping) => {
    setEditingTopping({
      id: topping.id,
      name: topping.name,
      price: topping.price.replace('$', ''),
      category: topping.category,
      available: topping.available
    });
    setShowEditDialog(true);
  };
  
  const resetNewTopping = () => {
    setNewTopping({
      name: "",
      price: "",
      category: "meat",
      available: true
    });
  };
  
  const handleAddTopping = async () => {
    // Validate form
    if (!newTopping.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!newTopping.price.trim()) {
      toast({
        title: "Validation Error",
        description: "Price is required",
        variant: "destructive"
      });
      return;
    }
    
    // Format price to ensure it's valid
    let formattedPrice = newTopping.price;
    if (!formattedPrice.startsWith('$')) {
      formattedPrice = '$' + formattedPrice;
    }
    
    try {
      const response = await fetch('/api/toppings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newTopping,
          price: formattedPrice
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create topping: ${response.statusText}`);
      }
      
      const createdTopping = await response.json();
      
      // Update local state
      setToppings(prevToppings => [...prevToppings, createdTopping]);
      
      // Reset form and close dialog
      resetNewTopping();
      setShowAddDialog(false);
      
      toast({
        title: "Success",
        description: `${createdTopping.name} has been added`,
      });
    } catch (err) {
      console.error('Error creating topping:', err);
      toast({
        title: "Error",
        description: "Failed to create topping. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateTopping = async () => {
    if (!editingTopping) return;
    
    // Validation
    if (!editingTopping.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!editingTopping.price.trim()) {
      toast({
        title: "Validation Error",
        description: "Price is required",
        variant: "destructive"
      });
      return;
    }
    
    // Format price
    let formattedPrice = editingTopping.price;
    if (!formattedPrice.startsWith('$')) {
      formattedPrice = '$' + formattedPrice;
    }
    
    try {
      const response = await fetch(`/api/toppings/${editingTopping.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...editingTopping,
          price: formattedPrice
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update topping: ${response.statusText}`);
      }
      
      const updatedTopping = await response.json();
      
      // Update local state
      setToppings(prevToppings => 
        prevToppings.map(topping => 
          topping.id === updatedTopping.id ? updatedTopping : topping
        )
      );
      
      // Reset form and close dialog
      setEditingTopping(null);
      setShowEditDialog(false);
      
      toast({
        title: "Success",
        description: `${updatedTopping.name} has been updated`,
      });
    } catch (err) {
      console.error('Error updating topping:', err);
      toast({
        title: "Error",
        description: "Failed to update topping. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleToggleAvailability = async (topping: Topping) => {
    try {
      const response = await fetch(`/api/toppings/${topping.id}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          available: !topping.available
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update availability: ${response.statusText}`);
      }
      
      const updatedTopping = await response.json();
      
      // Update local state
      setToppings(prevToppings => 
        prevToppings.map(t => 
          t.id === updatedTopping.id ? updatedTopping : t
        )
      );
      
      toast({
        title: "Success",
        description: `${updatedTopping.name} is now ${updatedTopping.available ? 'available' : 'unavailable'}`,
      });
    } catch (err) {
      console.error('Error updating availability:', err);
      toast({
        title: "Error",
        description: "Failed to update availability. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteTopping = async (topping: Topping) => {
    if (!window.confirm(`Are you sure you want to delete ${topping.name}?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/toppings/${topping.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete topping: ${response.statusText}`);
      }
      
      // Update local state
      setToppings(prevToppings => 
        prevToppings.filter(t => t.id !== topping.id)
      );
      
      toast({
        title: "Success",
        description: `${topping.name} has been deleted`,
      });
    } catch (err) {
      console.error('Error deleting topping:', err);
      toast({
        title: "Error",
        description: "Failed to delete topping. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Get toppings by category
  const getToppingsByCategory = (category: string) => {
    return toppings.filter(topping => topping.category === category);
  };
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <StaffHeader title="Toppings Management" />
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Toppings</h2>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add New Topping
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4">Loading toppings...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <Tabs defaultValue="meat">
            <TabsList className="mb-6">
              <TabsTrigger value="meat">Meat</TabsTrigger>
              <TabsTrigger value="veggie">Vegetables</TabsTrigger>
              <TabsTrigger value="cheese">Cheese</TabsTrigger>
            </TabsList>
            
            <TabsContent value="meat" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Price</th>
                      <th className="text-left p-2">Availability</th>
                      <th className="text-right p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getToppingsByCategory('meat').map(topping => (
                      <tr key={topping.id} className="border-t">
                        <td className="p-2">{topping.name}</td>
                        <td className="p-2">{topping.price}</td>
                        <td className="p-2">
                          <div className="flex items-center">
                            <Switch 
                              checked={topping.available}
                              onCheckedChange={() => handleToggleAvailability(topping)}
                              className="mr-2"
                            />
                            <span>{topping.available ? 'Available' : 'Unavailable'}</span>
                          </div>
                        </td>
                        <td className="p-2 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => startEditingTopping(topping)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteTopping(topping)}
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="veggie" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Price</th>
                      <th className="text-left p-2">Availability</th>
                      <th className="text-right p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getToppingsByCategory('veggie').map(topping => (
                      <tr key={topping.id} className="border-t">
                        <td className="p-2">{topping.name}</td>
                        <td className="p-2">{topping.price}</td>
                        <td className="p-2">
                          <div className="flex items-center">
                            <Switch 
                              checked={topping.available}
                              onCheckedChange={() => handleToggleAvailability(topping)}
                              className="mr-2"
                            />
                            <span>{topping.available ? 'Available' : 'Unavailable'}</span>
                          </div>
                        </td>
                        <td className="p-2 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => startEditingTopping(topping)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteTopping(topping)}
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="cheese" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Price</th>
                      <th className="text-left p-2">Availability</th>
                      <th className="text-right p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getToppingsByCategory('cheese').map(topping => (
                      <tr key={topping.id} className="border-t">
                        <td className="p-2">{topping.name}</td>
                        <td className="p-2">{topping.price}</td>
                        <td className="p-2">
                          <div className="flex items-center">
                            <Switch 
                              checked={topping.available}
                              onCheckedChange={() => handleToggleAvailability(topping)}
                              className="mr-2"
                            />
                            <span>{topping.available ? 'Available' : 'Unavailable'}</span>
                          </div>
                        </td>
                        <td className="p-2 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => startEditingTopping(topping)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteTopping(topping)}
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      <div className="mt-6">
        <Link href="/">
          <span className="text-blue-600 hover:underline cursor-pointer">← Back to Home</span>
        </Link>
      </div>
      
      {/* Add Topping Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Topping</DialogTitle>
            <DialogDescription>
              Create a new pizza topping with pricing and category.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input 
                id="name" 
                value={newTopping.name}
                onChange={(e) => setNewTopping({...newTopping, name: e.target.value})}
                className="col-span-3"
                placeholder="e.g. Pepperoni"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Price</Label>
              <Input 
                id="price" 
                value={newTopping.price}
                onChange={(e) => setNewTopping({...newTopping, price: e.target.value})}
                className="col-span-3"
                placeholder="e.g. 1.50"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select
                value={newTopping.category}
                onValueChange={(value) => setNewTopping({...newTopping, category: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meat">Meat</SelectItem>
                  <SelectItem value="veggie">Vegetables</SelectItem>
                  <SelectItem value="cheese">Cheese</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="available" className="text-right">Available</Label>
              <div className="flex items-center col-span-3">
                <Switch 
                  id="available"
                  checked={newTopping.available}
                  onCheckedChange={(checked) => setNewTopping({...newTopping, available: checked})}
                  className="mr-2"
                />
                <span>{newTopping.available ? 'Available' : 'Unavailable'}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTopping}>
              Add Topping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Topping Dialog */}
      {editingTopping && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Topping</DialogTitle>
              <DialogDescription>
                Update topping details and pricing.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Name</Label>
                <Input 
                  id="edit-name" 
                  value={editingTopping.name}
                  onChange={(e) => setEditingTopping({...editingTopping, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">Price</Label>
                <Input 
                  id="edit-price" 
                  value={editingTopping.price}
                  onChange={(e) => setEditingTopping({...editingTopping, price: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">Category</Label>
                <Select
                  value={editingTopping.category}
                  onValueChange={(value) => setEditingTopping({...editingTopping, category: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meat">Meat</SelectItem>
                    <SelectItem value="veggie">Vegetables</SelectItem>
                    <SelectItem value="cheese">Cheese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-available" className="text-right">Available</Label>
                <div className="flex items-center col-span-3">
                  <Switch 
                    id="edit-available"
                    checked={editingTopping.available}
                    onCheckedChange={(checked) => setEditingTopping({...editingTopping, available: checked})}
                    className="mr-2"
                  />
                  <span>{editingTopping.available ? 'Available' : 'Unavailable'}</span>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTopping}>
                Update Topping
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}