import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Table } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Printer, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function QRCodeDisplay() {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  
  const { data: tables, isLoading, refetch } = useQuery<Table[]>({
    queryKey: ['/api/tables'],
  });

  const handlePrint = () => {
    window.print();
  };

  // Generate QR code URL for a table
  const getQRCodeUrl = (tableNumber: number) => {
    const currentUrl = window.location.origin;
    const tableUrl = `${currentUrl}/table/${tableNumber}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tableUrl)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Loading QR Codes...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Table QR Codes</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Print these QR codes and place them on each table. Customers can scan them to place orders.
            </p>
            
            {selectedTable ? (
              <div className="flex flex-col items-center p-6 max-w-sm mx-auto">
                <h2 className="text-2xl font-bold mb-4">Table {selectedTable}</h2>
                <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                  <img 
                    src={getQRCodeUrl(selectedTable)} 
                    alt={`QR Code for Table ${selectedTable}`}
                    className="w-64 h-64"
                  />
                </div>
                <p className="text-center mb-4">
                  Scan this code to place an order for Table {selectedTable}
                </p>
                <Button onClick={() => setSelectedTable(null)} variant="outline">
                  Back to All Tables
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tables?.map(table => (
                  <Card key={table.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h3 className="font-bold mb-2">Table {table.tableNumber}</h3>
                        <div className="bg-white rounded-md p-2 mb-3">
                          <img 
                            src={getQRCodeUrl(table.tableNumber)} 
                            alt={`QR Code for Table ${table.tableNumber}`} 
                            className="w-full"
                          />
                        </div>
                        <Button 
                          onClick={() => setSelectedTable(table.tableNumber)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          View Larger
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
