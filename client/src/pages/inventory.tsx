import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/app-layout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Box, Package, Tag } from "lucide-react";
import { Link } from "wouter";
import { Inventory } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

export default function InventoryPage() {
  const { data: inventoryItems, isLoading, error } = useQuery<Inventory[]>({
    queryKey: ['/api/inventory'],
  });

  if (error) {
    console.error('Inventory fetch error:', error);
  }

  // Function to determine item status based on quantity
  const getQuantityStatus = (quantity: number) => {
    if (quantity <= 0) {
      return <Badge className="bg-red-100 text-red-800">Agotado</Badge>;
    } else if (quantity < 5) {
      return <Badge className="bg-yellow-100 text-yellow-800">Bajo</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Disponible</Badge>;
    }
  };

  return (
    <AppLayout title="Inventario">
      <div className="flex justify-between items-center mt-4 mb-6">
        <div>
          <p className="text-gray-500 text-sm">
            Gestión de materiales y recursos disponibles
          </p>
        </div>
        <Link href="/inventory/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Artículo
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : inventoryItems && inventoryItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artículo</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Box className="h-4 w-4 mr-2 text-primary-600" />
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-gray-500" />
                        {item.category || <span className="text-gray-400">Sin categoría</span>}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.quantity}</TableCell>
                    <TableCell>{getQuantityStatus(item.quantity)}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm text-gray-500">
                        {item.notes || <span className="text-gray-400">Sin notas</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/inventory/${item.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-60 p-4">
              <Package className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No hay artículos en el inventario</h3>
              <p className="text-gray-500 text-center mt-2">
                Agrega nuevos artículos para comenzar a gestionar tu inventario.
              </p>
              <Link href="/inventory/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Artículo
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
