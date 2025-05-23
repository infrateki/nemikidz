import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import { insertPaymentSchema, Enrollment, Child, Program } from "@shared/schema";
import * as z from "zod";

// Create a custom form schema that matches the database schema
const formSchema = z.object({
  enrollmentId: z.number({
    required_error: "La inscripción es requerida",
  }),
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

export default function NewPayment() {
  const [location] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // Get enrollmentId from URL parameters if available
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const urlEnrollmentId = searchParams.get('enrollmentId');

  // Fetch all enrollments for dropdown
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery<Enrollment[]>({
    queryKey: ['/api/enrollments'],
  });

  // Define form with zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enrollmentId: urlEnrollmentId ? parseInt(urlEnrollmentId) : undefined,
      amount: "",
      paymentDate: new Date(),
      method: "cash",
      status: "pending",
      notes: null
    }
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/payments", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error creando pago");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Pago creado con éxito",
        description: "El pago ha sido registrado en el sistema",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      navigate(urlEnrollmentId 
        ? `/payments?enrollmentId=${urlEnrollmentId}` 
        : `/payments/${data.id}`);
    },
    onError: (error) => {
      console.error("Error creating payment:", error);
      toast({
        title: "Error al crear pago",
        description: error.message || "Hubo un error al registrar el pago",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  // When enrollment is selected, set the amount from the enrollment
  const selectedEnrollmentId = form.watch("enrollmentId");
  
  // Fetch selected enrollment details if available
  const { data: selectedEnrollment } = useQuery<Enrollment>({
    queryKey: ['/api/enrollments', selectedEnrollmentId],
    queryFn: async () => {
      const res = await fetch(`/api/enrollments/${selectedEnrollmentId}`);
      if (!res.ok) throw new Error("Error al cargar los detalles de la inscripción");
      return res.json();
    },
    enabled: !!selectedEnrollmentId,
  });

  // Fetch child details if enrollment is selected
  const { data: child } = useQuery<Child>({
    queryKey: ['/api/children', selectedEnrollment?.childId],
    queryFn: async () => {
      const res = await fetch(`/api/children/${selectedEnrollment?.childId}`);
      if (!res.ok) throw new Error("Error al cargar los detalles del niño");
      return res.json();
    },
    enabled: !!selectedEnrollment?.childId,
  });

  // Fetch program details if enrollment is selected
  const { data: program } = useQuery<Program>({
    queryKey: ['/api/programs', selectedEnrollment?.programId],
    queryFn: async () => {
      const res = await fetch(`/api/programs/${selectedEnrollment?.programId}`);
      if (!res.ok) throw new Error("Error al cargar los detalles del programa");
      return res.json();
    },
    enabled: !!selectedEnrollment?.programId,
  });

  // Update amount when enrollment changes
  useEffect(() => {
    if (selectedEnrollment) {
      form.setValue("amount", selectedEnrollment.amount);
    }
  }, [selectedEnrollment, form]);

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    createPaymentMutation.mutate(data);
  };

  return (
    <AppLayout title="Nuevo Pago">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(urlEnrollmentId ? `/payments?enrollmentId=${urlEnrollmentId}` : "/payments")} 
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h2 className="text-2xl font-serif font-medium">Registrar Nuevo Pago</h2>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Información del Pago</CardTitle>
          <CardDescription>
            Registra un nuevo pago para una inscripción
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="enrollmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inscripción</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value?.toString()}
                      disabled={!!urlEnrollmentId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar inscripción" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {enrollmentsLoading ? (
                          <SelectItem value="loading" disabled>Cargando inscripciones...</SelectItem>
                        ) : enrollments && enrollments.length > 0 ? (
                          enrollments.map((enrollment) => (
                            <SelectItem key={enrollment.id} value={enrollment.id.toString()}>
                              Inscripción #{enrollment.id} - {enrollment.amount}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No hay inscripciones disponibles</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedEnrollment && child && program && (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm">
                  <h4 className="font-medium mb-2">Detalles de la inscripción seleccionada:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">Niño:</span> {child.name}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Programa:</span> {program.name}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Estado:</span> {selectedEnrollment.status}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Monto total:</span> ${selectedEnrollment.amount}
                    </div>
                  </div>
                </div>
              )}

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
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => navigate(urlEnrollmentId ? `/payments?enrollmentId=${urlEnrollmentId}` : "/payments")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "Registrar Pago"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </AppLayout>
  );
}