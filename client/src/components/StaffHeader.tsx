import { Link, useLocation } from "wouter";

interface StaffHeaderProps {
  title?: string;
}

export default function StaffHeader({ title = "Pizza Palace Order Management" }: StaffHeaderProps) {
  const [location] = useLocation();
  
  return (
    <header className="bg-gray-900 text-white py-4 px-6 shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">{title}</h1>
        <div className="flex space-x-4">
          <Link href="/kitchen">
            <a className={`px-4 py-2 rounded-md transition-colors ${location === "/kitchen" ? "bg-primary text-white" : "text-gray-300 hover:text-white"}`}>
              Kitchen View
            </a>
          </Link>
          <Link href="/bar">
            <a className={`px-4 py-2 rounded-md transition-colors ${location === "/bar" ? "bg-primary text-white" : "text-gray-300 hover:text-white"}`}>
              Bar View
            </a>
          </Link>
          <Link href="/">
            <a className="text-gray-300 hover:text-white px-4 py-2 rounded-md transition-colors">
              Table Selection
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
}
