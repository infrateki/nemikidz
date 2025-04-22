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
import { Plus, Edit, Eye, Calendar, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { Program } from "@shared/schema";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function Programs() {
  const { data: programs, isLoading, error } = useQuery<Program[]>({
    queryKey: ['/api/programs'],
  });

  if (error) {
    console.error('Programs fetch error:', error);
  }

  // Function to determine status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Activo</span>;
      case 'cancelled':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Cancelado</span>;
      case 'complete':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Completado</span>;
      case 'draft':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Borrador</span>;
      default:
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <AppLayout title="Programas">
      <div className="flex justify-between items-center mt-4 mb-6">
        <div>
          <p className="text-gray-500 text-sm">
            Gestiona todos los programas y actividades
          </p>
        </div>
        <Link href="/programs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Programa
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
          ) : programs && programs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Capacidad</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="bg-primary-100 p-2 rounded-md mr-2">
                          <Calendar className="h-4 w-4 text-primary-600" />
                        </div>
                        {program.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(program.startDate)}</div>
                        <div className="text-gray-500">al {formatDate(program.endDate)}</div>
                      </div>
                    </TableCell>
                    <TableCell>{program.capacity}</TableCell>
                    <TableCell>{formatCurrency(Number(program.price))}</TableCell>
                    <TableCell>{getStatusBadge(program.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/programs/${program.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/programs/${program.id}/edit`}>
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
              <Calendar className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No hay programas disponibles</h3>
              <p className="text-gray-500 text-center mt-2">
                Crea un nuevo programa para comenzar a planificar actividades.
              </p>
              <Link href="/programs/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Programa
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
