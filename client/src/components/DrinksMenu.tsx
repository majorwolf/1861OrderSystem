import { MenuItem } from "@shared/schema";
import MenuItemCard from "./MenuItemCard";

interface DrinksMenuProps {
  drinkItems: MenuItem[];
}

export default function DrinksMenu({ drinkItems }: DrinksMenuProps) {
  // Group drinks by type
  const nonAlcoholicDrinks = drinkItems.filter(drink => 
    !drink.name.toLowerCase().includes("beer") && 
    !drink.name.toLowerCase().includes("wine")
  );
  
  const alcoholicDrinks = drinkItems.filter(drink => 
    drink.name.toLowerCase().includes("beer") || 
    drink.name.toLowerCase().includes("wine")
  );
  
  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Soft Drinks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {nonAlcoholicDrinks.map(drink => (
          <MenuItemCard key={drink.id} item={drink} />
        ))}
      </div>
      
      {alcoholicDrinks.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Alcoholic Beverages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alcoholicDrinks.map(drink => (
              <MenuItemCard key={drink.id} item={drink} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
