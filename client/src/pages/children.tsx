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
import { Plus, Edit, Eye, Trash2, User } from "lucide-react";
import { Link } from "wouter";
import { Child } from "@shared/schema";
import { calculateAge } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Children() {
  const { data: children, isLoading, error } = useQuery<Child[]>({
    queryKey: ['/api/children'],
  });

  if (error) {
    console.error('Children fetch error:', error);
  }

  return (
    <AppLayout title="Niños">
      <div className="flex justify-between items-center mt-4 mb-6">
        <div>
          <p className="text-gray-500 text-sm">
            Información de todos los niños registrados
          </p>
        </div>
        <Link href="/children/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Registrar Niño
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
          ) : children && children.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Alergias</TableHead>
                  <TableHead>Notas Médicas</TableHead>
                  <TableHead>Padres</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {children.map((child) => (
                  <TableRow key={child.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Avatar className="mr-2 h-8 w-8">
                          <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {child.name}
                      </div>
                    </TableCell>
                    <TableCell>{child.age || calculateAge(child.birthDate)} años</TableCell>
                    <TableCell>
                      {child.allergies ? (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          {child.allergies}
                        </Badge>
                      ) : (
                        <span className="text-gray-500 text-sm">Sin alergias</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {child.medicalNotes || <span className="text-gray-500 text-sm">Sin notas</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/parents/${child.parentId}`}>
                          <User className="h-3 w-3 mr-1" />
                          Ver Padre
                        </Link>
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/children/${child.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/children/${child.id}/edit`}>
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
              <User className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No hay niños registrados</h3>
              <p className="text-gray-500 text-center mt-2">
                Registra un nuevo niño para comenzar.
              </p>
              <Link href="/children/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Niño
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
