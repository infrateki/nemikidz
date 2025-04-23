import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { Payment, Enrollment, paymentStatusEnum, paymentMethodEnum } from "@shared/schema";
import * as z from "zod";

// Create a custom form schema that matches the database schema
const formSchema = z.object({
  amount: z.string().min(1, "El monto del pago es requerido"),
  paymentDate: z.date({
    required_error: "La fecha de pago es requerida",
  }),
  method: z.enum(['cash', 'transfer', 'card', 'other'], {
    required_error: "El método de pago es requerido",
  }),
  status: z.enum(['pending', 'completed', 'refunded', 'failed'], {
    required_error: "El estado del pago es requerido",
  }),
  notes: z.string().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditPayment() {
  const [match, params] = useRoute<{ id: string }>("/payments/:id/edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch payment data
  const { data: payment, isLoading, error } = useQuery<Payment>({
    queryKey: ['/api/payments', params?.id],
    queryFn: async () => {
      const res = await fetch(`/api/payments/${params?.id}`);
      if (!res.ok) throw new Error("Error al cargar los detalles del pago");
      return res.json();
    },
    enabled: !!params?.id,
  });

  // Fetch enrollment details if payment data is available
  const { data: enrollment } = useQuery<Enrollment>({
    queryKey: ['/api/enrollments', payment?.enrollmentId],
    queryFn: async () => {
      const res = await fetch(`/api/enrollments/${payment?.enrollmentId}`);
      if (!res.ok) throw new Error("Error al cargar los detalles de la inscripción");
      return res.json();
    },
    enabled: !!payment?.enrollmentId,
  });

  // Define form with zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      paymentDate: new Date(),
      method: "cash",
      status: "pending",
      notes: null
    }
  });

  // Update form values when payment data is loaded
  useEffect(() => {
    if (payment) {
      form.reset({
        amount: payment.amount,
        paymentDate: new Date(payment.paymentDate),
        method: payment.method as any,
        status: payment.status as any,
        notes: payment.notes
      });
    }
  }, [payment, form]);

  // Update payment mutation
  const updatePaymentMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("PATCH", `/api/payments/${params?.id}`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al actualizar pago");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Pago actualizado con éxito",
        description: "La información del pago ha sido actualizada",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payments', params?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      navigate(`/payments/${params?.id}`);
    },
    onError: (error) => {
      console.error("Error updating payment:", error);
      toast({
        title: "Error al actualizar",
        description: error.message || "Hubo un error al actualizar la información del pago",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    updatePaymentMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <AppLayout title="Editar Pago">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full max-w-sm" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  if (error || !payment) {
    return (
      <AppLayout title="Editar Pago">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-red-500">Error al cargar la información del pago. Por favor, intenta nuevamente.</p>
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
    <AppLayout title="Editar Pago">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate(`/payments/${params?.id}`)} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a detalles
        </Button>
        <h2 className="text-2xl font-serif font-medium">Editar Información del Pago</h2>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Detalles del Pago #{payment.id}</CardTitle>
          <CardDescription>
            {enrollment && (
              <span>
                Pago para la inscripción #{enrollment.id}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-3">$</span>
                          <Input type="text" className="pl-7" placeholder="0.00" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Pago</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Pago</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar método de pago" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Efectivo</SelectItem>
                          <SelectItem value="transfer">Transferencia</SelectItem>
                          <SelectItem value="card">Tarjeta</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado del Pago</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado del pago" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="completed">Completado</SelectItem>
                          <SelectItem value="refunded">Reembolsado</SelectItem>
                          <SelectItem value="failed">Fallido</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        El estado determina si el pago ha sido procesado correctamente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas del Pago</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Información adicional sobre el pago" 
                        className="min-h-[100px]" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Cualquier detalle adicional sobre el pago, como referencias o comprobantes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => navigate(`/payments/${params?.id}`)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </AppLayout>
  );
}