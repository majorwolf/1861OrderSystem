import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Table } from "@shared/schema";
import { useState } from "react";
import { useLocation } from "wouter";
import { useOrderContext } from "@/context/OrderContext";

export default function TableSelection() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { setTableId } = useOrderContext();
  
  const { data: tables, isLoading } = useQuery<Table[]>({
    queryKey: ['/api/tables'],
  });
  
  const handleTableSelect = (table: Table) => {
    setTableId(table.id);
    navigate(`/table/${table.tableNumber}`);
    toast({
      title: "Table Selected",
      description: `You're now ordering at Table ${table.tableNumber}`,
    });
  };
  
  const goToStaffView = (path: string) => {
    navigate(path);
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="text-primary mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              Pizza Palace
            </CardTitle>
            <CardDescription>
              Select a table to begin your order or access staff views
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 mb-8">
              <Button 
                onClick={() => goToStaffView('/kitchen')}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Kitchen Staff View
              </Button>
              <Button 
                onClick={() => goToStaffView('/bar')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Bar Staff View
              </Button>
              <Button 
                onClick={() => goToStaffView('/admin/qrcodes')}
                variant="outline"
              >
                QR Code Management
              </Button>
            </div>
            
            <h2 className="text-xl font-bold mb-4">Customer Table Selection</h2>
            {isLoading ? (
              <p>Loading tables...</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {tables?.map((table) => (
                  <Button
                    key={table.id}
                    variant="outline"
                    className="h-16 text-lg"
                    onClick={() => handleTableSelect(table)}
                  >
                    Table {table.tableNumber}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
