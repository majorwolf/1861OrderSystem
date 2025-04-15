import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Order, OrderItem } from "@shared/schema";
import OrderStatusBadge from "./OrderStatusBadge";
import { format } from "date-fns";
import { updateOrderStatus } from "@/lib/websocket";

interface OrderCardProps {
  order: Order;
  type: "kitchen" | "bar";
}

export default function OrderCard({ order, type }: OrderCardProps) {
  const handleStatusChange = (status: string) => {
    updateOrderStatus(order.id, status);
  };
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return format(new Date(date), "h:mm a");
  };
  
  // Border color based on status
  const getBorderColor = () => {
    switch (order.status) {
      case "new":
        return "border-blue-500";
      case "preparing":
        return "border-yellow-500";
      case "ready":
        return "border-green-500";
      case "completed":
        return "border-gray-500";
      default:
        return "border-gray-300";
    }
  };
  
  return (
    <Card className={`border-l-4 ${getBorderColor()}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <OrderStatusBadge status={order.status as any} />
            <span className="ml-2 font-medium">Table {order.tableId}</span>
          </div>
          <span className="text-sm text-gray-500">
            {formatTime(order.createdAt)}
          </span>
        </div>
        
        <ul className="space-y-2 mb-4">
          {order.items.map((item: OrderItem, index) => (
            <li key={index} className="flex justify-between">
              <span className="text-gray-800">{item.quantity}× {item.name}</span>
              <span className="text-gray-600 text-sm">{item.size || ""}</span>
            </li>
          ))}
        </ul>
        
        {order.notes && (
          <div className="mb-4 p-2 bg-gray-50 rounded text-sm text-gray-700">
            <p className="font-medium mb-1">Notes:</p>
            <p>{order.notes}</p>
          </div>
        )}
        
        <div className="flex space-x-2 mt-4">
          {order.status !== "new" && (
            <Button 
              variant="outline"
              className="flex-grow"
              onClick={() => handleStatusChange("new")}
            >
              New
            </Button>
          )}
          
          {order.status !== "preparing" && (
            <Button 
              variant={order.status === "new" ? "default" : "outline"}
              className={order.status === "new" ? "flex-grow bg-blue-500 hover:bg-blue-600" : "flex-grow"}
              onClick={() => handleStatusChange("preparing")}
            >
              Preparing
            </Button>
          )}
          
          {order.status !== "ready" && (
            <Button 
              variant={order.status === "preparing" ? "default" : "outline"}
              className={order.status === "preparing" ? "flex-grow bg-yellow-500 hover:bg-yellow-600" : "flex-grow"}
              onClick={() => handleStatusChange("ready")}
            >
              Ready
            </Button>
          )}
          
          {order.status === "ready" && (
            <Button 
              className="flex-grow bg-green-500 hover:bg-green-600"
              onClick={() => handleStatusChange("completed")}
            >
              Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
