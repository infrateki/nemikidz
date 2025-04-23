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
import { Plus, Edit, Eye, Trash2, Calendar, User, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { Enrollment } from "@shared/schema";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function Enrollments() {
  const { data: enrollments, isLoading, error } = useQuery<Enrollment[]>({
    queryKey: ['/api/enrollments'],
  });

  if (error) {
    console.error('Enrollments fetch error:', error);
  }

  // Function to determine status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendiente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout title="Inscripciones">
      <div className="flex justify-between items-center mt-4 mb-6">
        <div>
          <p className="text-gray-500 text-sm">
            Gestiona todas las inscripciones a programas
          </p>
        </div>
        <Link href="/enrollments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Inscripción
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
          ) : enrollments && enrollments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Programa</TableHead>
                  <TableHead>Niño</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <Link href={`/programs/${enrollment.programId}`}>
                        <Button variant="ghost" className="p-0 hover:bg-transparent">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-primary-600" />
                            <span>Programa #{enrollment.programId}</span>
                          </div>
                        </Button>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/children/${enrollment.childId}`}>
                        <Button variant="ghost" className="p-0 hover:bg-transparent">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-blue-600" />
                            <span>Niño #{enrollment.childId}</span>
                          </div>
                        </Button>
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(enrollment.enrollmentDate)}</TableCell>
                    <TableCell>
                      <div className="font-medium text-green-700">
                        {formatCurrency(Number(enrollment.amount))}
                        {Number(enrollment.discount) > 0 && (
                          <span className="ml-2 text-xs text-gray-500">
                            Descuento: {formatCurrency(Number(enrollment.discount))}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/payments?enrollmentId=${enrollment.id}`}>
                          <Button variant="outline" size="sm">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Pagos
                          </Button>
                        </Link>
                        <Link href={`/enrollments/${enrollment.id}`}>
                          <Button variant="outline" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/enrollments/${enrollment.id}/edit`}>
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
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
              <h3 className="text-lg font-medium text-gray-900">No hay inscripciones registradas</h3>
              <p className="text-gray-500 text-center mt-2">
                Crea una nueva inscripción para comenzar.
              </p>
              <Link href="/enrollments/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Inscripción
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
