import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Payment, Enrollment, Child, Program } from "@shared/schema";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Edit, Trash2, FileText, Calendar, User, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export default function PaymentDetails() {
  const [match, params] = useRoute<{ id: string }>("/payments/:id");
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch payment details
  const { data: payment, isLoading: paymentLoading, error: paymentError } = useQuery<Payment>({
    queryKey: ['/api/payments', params?.id],
    queryFn: async () => {
      const res = await fetch(`/api/payments/${params?.id}`);
      if (!res.ok) throw new Error("Error al cargar los detalles del pago");
      return res.json();
    },
    enabled: !!params?.id,
  });

  // Fetch enrollment details if payment data is available
  const { data: enrollment, isLoading: enrollmentLoading } = useQuery<Enrollment>({
    queryKey: ['/api/enrollments', payment?.enrollmentId],
    queryFn: async () => {
      const res = await fetch(`/api/enrollments/${payment?.enrollmentId}`);
      if (!res.ok) throw new Error("Error al cargar los detalles de la inscripción");
      return res.json();
    },
    enabled: !!payment?.enrollmentId,
  });

  // Fetch child details if enrollment data is available
  const { data: child, isLoading: childLoading } = useQuery<Child>({
    queryKey: ['/api/children', enrollment?.childId],
    queryFn: async () => {
      const res = await fetch(`/api/children/${enrollment?.childId}`);
      if (!res.ok) throw new Error("Error al cargar los detalles del niño");
      return res.json();
    },
    enabled: !!enrollment?.childId,
  });

  // Fetch program details if enrollment data is available
  const { data: program, isLoading: programLoading } = useQuery<Program>({
    queryKey: ['/api/programs', enrollment?.programId],
    queryFn: async () => {
      const res = await fetch(`/api/programs/${enrollment?.programId}`);
      if (!res.ok) throw new Error("Error al cargar los detalles del programa");
      return res.json();
    },
    enabled: !!enrollment?.programId,
  });

  // Delete payment mutation
  const deletePaymentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/payments/${params?.id}`);
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
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      navigate("/payments");
    },
    onError: (error) => {
      console.error("Error deleting payment:", error);
      toast({
        title: "Error al eliminar",
        description: error.message || "Hubo un error al eliminar el registro del pago",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  });

  // Handle delete
  const handleDelete = () => {
    setIsDeleting(true);
    deletePaymentMutation.mutate();
  };

  // Function to get method badge
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

  // Function to get status badge
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

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'pending':
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
      case 'refunded':
        return <AlertTriangle className="h-12 w-12 text-red-500" />;
      case 'failed':
        return <AlertTriangle className="h-12 w-12 text-red-500" />;
      default:
        return <FileText className="h-12 w-12 text-gray-400" />;
    }
  };

  if (paymentLoading || enrollmentLoading || childLoading || programLoading) {
    return (
      <AppLayout title="Detalles del Pago">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-[200px]" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  if (paymentError || !payment) {
    return (
      <AppLayout title="Detalles del Pago">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-red-500">Error al cargar los detalles del pago. Por favor, intenta nuevamente.</p>
            <Button className="mt-4" onClick={() => navigate("/payments")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la lista
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`Pago #${payment.id}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="sm" onClick={() => navigate("/payments")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <h2 className="text-2xl font-serif font-medium">Detalles del Pago</h2>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-2">
          <Link href={`/payments/${payment.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente el registro de pago por {formatCurrency(Number(payment.amount))} y no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-red-500 hover:bg-red-600" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">Detalles de Pago</CardTitle>
                  <CardDescription>
                    Pago realizado el {formatDate(payment.paymentDate)}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-center">
                  {getStatusIcon(payment.status)}
                  <div className="mt-2">
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Monto pagado</p>
                    <h3 className="text-3xl font-semibold text-green-600">{formatCurrency(Number(payment.amount))}</h3>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <p className="text-sm text-muted-foreground">Método de pago</p>
                    <div className="flex items-center mt-1">
                      {getMethodBadge(payment.method)}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <p className="text-sm text-muted-foreground">Fecha de pago</p>
                    <p className="font-medium">{formatDate(payment.paymentDate)}</p>
                  </div>
                </div>
              </div>

              {enrollment && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Información de la Inscripción</h3>
                  <Link href={`/enrollments/${enrollment.id}`}>
                    <Button variant="outline" className="w-full mb-4">
                      <Calendar className="mr-2 h-4 w-4" />
                      Ver Inscripción #{enrollment.id}
                    </Button>
                  </Link>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="border p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Estado de la inscripción</p>
                      <p className="font-medium">
                        {enrollment.status === 'pending' && "Pendiente"}
                        {enrollment.status === 'confirmed' && "Confirmada"}
                        {enrollment.status === 'cancelled' && "Cancelada"}
                      </p>
                    </div>
                    <div className="border p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Fecha de inscripción</p>
                      <p className="font-medium">{formatDate(enrollment.enrollmentDate)}</p>
                    </div>
                    <div className="border p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Monto de la inscripción</p>
                      <p className="font-medium">{formatCurrency(Number(enrollment.amount))}</p>
                    </div>
                    {enrollment.discount && (
                      <div className="border p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">Descuento aplicado</p>
                        <p className="font-medium">{formatCurrency(Number(enrollment.discount))}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {payment.notes && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium text-lg mb-2">Notas del Pago</h3>
                  <p className="text-gray-700">{payment.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          {child && (
            <Card>
              <CardHeader>
                <CardTitle>Información del Niño</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/children/${child.id}`}>
                  <Button variant="outline" className="w-full mb-4">
                    <User className="mr-2 h-4 w-4" />
                    Ver Niño: {child.name}
                  </Button>
                </Link>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Edad:</span>
                    <span className="font-medium">{child.age} años</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha de Nacimiento:</span>
                    <span className="font-medium">{formatDate(child.birthDate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {program && (
            <Card>
              <CardHeader>
                <CardTitle>Información del Programa</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/programs/${program.id}`}>
                  <Button variant="outline" className="w-full mb-4">
                    <Calendar className="mr-2 h-4 w-4" />
                    Ver Programa: {program.name}
                  </Button>
                </Link>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <Badge className={
                      program.status === 'active' ? "bg-green-100 text-green-800" :
                      program.status === 'cancelled' ? "bg-red-100 text-red-800" :
                      program.status === 'complete' ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }>
                      {program.status === 'active' && "Activo"}
                      {program.status === 'complete' && "Completado"}
                      {program.status === 'cancelled' && "Cancelado"}
                      {program.status === 'draft' && "Borrador"}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fechas:</span>
                    <span className="font-medium">
                      {formatDate(program.startDate)} - {formatDate(program.endDate)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Precio:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(Number(program.price))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}