import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Eye, Trash2, Receipt, Calendar } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Payment } from "@shared/schema";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: payments, isLoading, error } = useQuery<Payment[]>({
    queryKey: enrollmentId 
      ? ['/api/payments', { enrollmentId }] 
      : ['/api/payments'],
  });

  // Delete payment mutation
  const deletePaymentMutation = useMutation({
    mutationFn: async (paymentId: number) => {
      const res = await apiRequest("DELETE", `/api/payments/${paymentId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error eliminando pago");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Pago eliminado con éxito",
        description: "El registro del pago ha sido eliminado del sistema",
      });
      // Invalidate payments query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      // Also invalidate dashboard stats since it includes payment information
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      setDeletingId(null);
    },
    onError: (error) => {
      console.error("Error deleting payment:", error);
      toast({
        title: "Error al eliminar",
        description: error.message || "Hubo un error al eliminar el registro del pago",
        variant: "destructive",
      });
      setDeletingId(null);
    }
  });
  
  // Handle delete payment
  const handleDeletePayment = (paymentId: number) => {
    setDeletingId(paymentId);
    deletePaymentMutation.mutate(paymentId);
  };

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
                      <Link href={`/enrollments/${payment.enrollmentId}`}>
                        <Button variant="ghost" className="p-0 hover:bg-transparent">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-primary-600" />
                            <span>Inscripción #{payment.enrollmentId}</span>
                          </div>
                        </Button>
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell className="font-medium text-green-700">
                      {formatCurrency(Number(payment.amount))}
                    </TableCell>
                    <TableCell>{getMethodBadge(payment.method)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/payments/${payment.id}`}>
                          <Button variant="outline" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/payments/${payment.id}/edit`}>
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteDialog 
                          title="¿Estás seguro?"
                          description={`Esta acción eliminará permanentemente el registro de pago por ${formatCurrency(Number(payment.amount))} y no se puede deshacer.`}
                          onConfirm={() => handleDeletePayment(payment.id)}
                          isDeleting={deletingId === payment.id}
                        />
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
