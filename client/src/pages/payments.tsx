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
import { Plus, Edit, Eye, Trash2, Receipt, Calendar } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Payment } from "@shared/schema";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Payments() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const enrollmentId = searchParams.get('enrollmentId');

  const { data: payments, isLoading, error } = useQuery<Payment[]>({
    queryKey: enrollmentId 
      ? ['/api/payments', { enrollmentId }] 
      : ['/api/payments'],
  });

  if (error) {
    console.error('Payments fetch error:', error);
  }

  // Function to determine payment method badge
  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'cash':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Efectivo</Badge>;
      case 'transfer':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Transferencia</Badge>;
      case 'card':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Tarjeta</Badge>;
      case 'other':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Otro</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  // Function to determine status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendiente</Badge>;
      case 'refunded':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Reembolsado</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Fallido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout title={enrollmentId ? "Pagos de Inscripción" : "Pagos"}>
      <div className="flex justify-between items-center mt-4 mb-6">
        <div>
          <p className="text-gray-500 text-sm">
            {enrollmentId 
              ? `Gestiona los pagos de la inscripción #${enrollmentId}` 
              : "Gestiona todos los pagos de inscripciones"}
          </p>
        </div>
        <Link href={enrollmentId ? `/payments/new?enrollmentId=${enrollmentId}` : "/payments/new"}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Pago
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
          ) : payments && payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Inscripción</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">#{payment.id}</TableCell>
                    <TableCell>
                      <Button variant="ghost" className="p-0 hover:bg-transparent" asChild>
                        <Link href={`/enrollments/${payment.enrollmentId}`}>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-primary-600" />
                            <span>Inscripción #{payment.enrollmentId}</span>
                          </div>
                        </Link>
                      </Button>
                    </TableCell>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell className="font-medium text-green-700">
                      {formatCurrency(Number(payment.amount))}
                    </TableCell>
                    <TableCell>{getMethodBadge(payment.method)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/payments/${payment.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/payments/${payment.id}/edit`}>
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
              <Receipt className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No hay pagos registrados</h3>
              <p className="text-gray-500 text-center mt-2">
                {enrollmentId 
                  ? "Registra un nuevo pago para esta inscripción." 
                  : "Registra un nuevo pago para comenzar."}
              </p>
              <Link href={enrollmentId ? `/payments/new?enrollmentId=${enrollmentId}` : "/payments/new"}>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Pago
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
