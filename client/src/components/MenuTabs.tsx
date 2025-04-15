import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PizzaMenu from "./PizzaMenu";
import DrinksMenu from "./DrinksMenu";
import { MenuItem } from "@shared/schema";

interface MenuTabsProps {
  menuItems: MenuItem[];
}

export default function MenuTabs({ menuItems }: MenuTabsProps) {
  const [activeTab, setActiveTab] = useState("pizzas");
  
  // Filter menu items by category
  const pizzaItems = menuItems.filter(item => item.category === "pizza");
  const drinkItems = menuItems.filter(item => item.category === "drink");
  
  return (
    <Tabs defaultValue="pizzas" className="w-full" onValueChange={setActiveTab} value={activeTab}>
      <div className="bg-white border-b border-gray-200 sticky top-14 z-10">
        <div className="container mx-auto">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pizzas" className="text-sm sm:text-base">Pizzas</TabsTrigger>
            <TabsTrigger value="drinks" className="text-sm sm:text-base">Drinks</TabsTrigger>
            <TabsTrigger value="sides" className="text-sm sm:text-base">Sides</TabsTrigger>
            <TabsTrigger value="desserts" className="text-sm sm:text-base">Desserts</TabsTrigger>
          </TabsList>
        </div>
      </div>
      
      <TabsContent value="pizzas" className="mt-4">
        <PizzaMenu pizzaItems={pizzaItems} />
      </TabsContent>
      
      <TabsContent value="drinks" className="mt-4">
        <DrinksMenu drinkItems={drinkItems} />
      </TabsContent>
      
      <TabsContent value="sides" className="mt-4">
        <div className="py-12 text-center">
          <h3 className="text-lg font-medium text-gray-500">Sides coming soon!</h3>
        </div>
      </TabsContent>
      
      <TabsContent value="desserts" className="mt-4">
        <div className="py-12 text-center">
          <h3 className="text-lg font-medium text-gray-500">Desserts coming soon!</h3>
        </div>
      </TabsContent>
    </Tabs>
  );
}
