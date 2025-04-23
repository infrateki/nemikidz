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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertParentSchema, type InsertParent, type Parent } from "@shared/schema";
import { ArrowLeft } from "lucide-react";
import * as z from "zod";

// Create a custom form schema that matches the database schema
const formSchema = z.object({
  name: z.string().min(1, "El nombre del padre es requerido"),
  email: z.string().email("El email es inválido").min(1, "El email es requerido"),
  phone: z.string().min(1, "El número telefónico es requerido"),
  emergencyPhone: z.string().nullable(),
  neighborhood: z.string().nullable(),
  address: z.string().nullable(),
  notes: z.string().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditParent() {
  const [match, params] = useRoute<{ id: string }>("/parents/:id/edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch parent data
  const { data: parent, isLoading, error } = useQuery<Parent>({
    queryKey: ['/api/parents', params?.id],
    queryFn: async () => {
      const res = await fetch(`/api/parents/${params?.id}`);
      if (!res.ok) throw new Error("Failed to fetch parent details");
      return res.json();
    },
    enabled: !!params?.id,
  });

  // Define form with zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      emergencyPhone: null,
      neighborhood: null,
      address: null,
      notes: null
    }
  });

  // Update form values when parent data is loaded
  useEffect(() => {
    if (parent) {
      form.reset({
        name: parent.name,
        email: parent.email,
        phone: parent.phone,
        emergencyPhone: parent.emergencyPhone,
        neighborhood: parent.neighborhood,
        address: parent.address,
        notes: parent.notes
      });
    }
  }, [parent, form]);

  // Update parent mutation
  const updateParentMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("PATCH", `/api/parents/${params?.id}`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al actualizar padre");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Padre actualizado con éxito",
        description: "La información del padre ha sido actualizada",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/parents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/parents', params?.id] });
      navigate(`/parents/${params?.id}`);
    },
    onError: (error) => {
      console.error("Error updating parent:", error);
      toast({
        title: "Error al actualizar",
        description: error.message || "Hubo un error al actualizar la información del padre",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    updateParentMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <AppLayout title="Editar Padre">
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

  if (error || !parent) {
    return (
      <AppLayout title="Editar Padre">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-red-500">Error al cargar la información del padre. Por favor, intenta nuevamente.</p>
            <Button className="mt-4" onClick={() => navigate("/parents")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la lista
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Editar Padre">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate(`/parents/${params?.id}`)} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a detalles
        </Button>
        <h2 className="text-2xl font-serif font-medium">Editar Información del Padre</h2>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Información del Padre/Tutor</CardTitle>
          <CardDescription>
            Actualiza la información personal y de contacto del padre/tutor
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo del padre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Dirección de email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="Número telefónico principal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="emergencyPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono de Emergencia</FormLabel>
                    <FormControl>
                      <Input placeholder="Contacto alternativo para emergencias" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>
                      Un número alternativo para emergencias
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="neighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Colonia/Sector</FormLabel>
                    <FormControl>
                      <Input placeholder="Colonia o sector" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Dirección completa" 
                        className="min-h-[80px]" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Adicionales</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Cualquier otra información importante" 
                        className="min-h-[80px]" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => navigate(`/parents/${params?.id}`)}>
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