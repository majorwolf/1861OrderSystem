import { Badge } from "@/components/ui/badge";

type OrderStatus = "new" | "preparing" | "ready" | "completed";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  let badgeClass = "";
  let label = "";

  switch (status) {
    case "new":
      badgeClass = "bg-blue-500 hover:bg-blue-600";
      label = "New Order";
      break;
    case "preparing":
      badgeClass = "bg-yellow-500 hover:bg-yellow-600";
      label = "Preparing";
      break;
    case "ready":
      badgeClass = "bg-green-500 hover:bg-green-600";
      label = "Ready";
      break;
    case "completed":
      badgeClass = "bg-gray-500 hover:bg-gray-600";
      label = "Completed";
      break;
  }

  return (
    <Badge className={`${badgeClass} text-white`}>
      {label}
    </Badge>
  );
}
