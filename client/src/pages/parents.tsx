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
import { Plus, Edit, Eye, Trash2, Users, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "wouter";
import { Parent } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Parents() {
  const { data: parents, isLoading, error } = useQuery<Parent[]>({
    queryKey: ['/api/parents'],
  });

  if (error) {
    console.error('Parents fetch error:', error);
  }

  return (
    <AppLayout title="Padres">
      <div className="flex justify-between items-center mt-4 mb-6">
        <div>
          <p className="text-gray-500 text-sm">
            Información de contacto de padres y tutores
          </p>
        </div>
        <Link href="/parents/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Padre
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
          ) : parents && parents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Hijos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parents.map((parent) => (
                  <TableRow key={parent.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Avatar className="mr-2 h-8 w-8">
                          <AvatarFallback>{parent.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {parent.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1 text-gray-500" /> {parent.phone}
                        {parent.emergencyPhone && (
                          <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                            Emergencia: {parent.emergencyPhone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1 text-gray-500" /> {parent.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm max-w-xs truncate">
                        <MapPin className="h-3 w-3 mr-1 text-gray-500 flex-shrink-0" /> 
                        <span className="truncate">
                          {parent.neighborhood || parent.address || "No especificado"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/children?parentId=${parent.id}`}>
                          <Users className="h-3 w-3 mr-1" />
                          Ver Hijos
                        </Link>
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/parents/${parent.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/parents/${parent.id}/edit`}>
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
              <Users className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No hay padres registrados</h3>
              <p className="text-gray-500 text-center mt-2">
                Registra un nuevo padre o tutor para comenzar.
              </p>
              <Link href="/parents/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Padre
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
