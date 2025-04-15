import { MenuItem } from "@shared/schema";
import MenuItemCard from "./MenuItemCard";

interface PizzaMenuProps {
  pizzaItems: MenuItem[];
}

export default function PizzaMenu({ pizzaItems }: PizzaMenuProps) {
  // Group pizzas by specialty vs others
  const specialtyPizzas = pizzaItems.filter(pizza => 
    pizza.name.startsWith("The") || 
    pizza.name === "Build Your Own Pizza" || 
    pizza.name === "Supreme Pizza"
  );
  
  const otherPizzas = pizzaItems.filter(pizza => 
    !pizza.name.startsWith("The") && 
    pizza.name !== "Build Your Own Pizza" && 
    pizza.name !== "Supreme Pizza"
  );
  
  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Specialty Pizzas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {specialtyPizzas.map(pizza => (
          <MenuItemCard key={pizza.id} item={pizza} />
        ))}
      </div>
      
      {otherPizzas.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">More Pizzas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherPizzas.map(pizza => (
              <MenuItemCard key={pizza.id} item={pizza} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
