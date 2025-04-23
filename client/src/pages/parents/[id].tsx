import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Parent, Child } from "@shared/schema";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Phone, Mail, MapPin, Users, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ParentDetails() {
  const [match, params] = useRoute<{ id: string }>("/parents/:id");
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch parent details
  const { data: parent, isLoading: parentLoading, error: parentError } = useQuery<Parent>({
    queryKey: ['/api/parents', params?.id],
    queryFn: async () => {
      const res = await fetch(`/api/parents/${params?.id}`);
      if (!res.ok) throw new Error("Failed to fetch parent details");
      return res.json();
    },
    enabled: !!params?.id,
  });

  // Fetch children of this parent
  const { data: children, isLoading: childrenLoading, error: childrenError } = useQuery<Child[]>({
    queryKey: ['/api/children', { parentId: params?.id }],
    queryFn: async () => {
      const res = await fetch(`/api/children?parentId=${params?.id}`);
      if (!res.ok) throw new Error("Failed to fetch children");
      return res.json();
    },
    enabled: !!params?.id,
  });

  // Delete parent mutation
  const deleteParentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/parents/${params?.id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error deleting parent");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Parent deleted successfully",
        description: "The parent has been removed from the system",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/parents'] });
      navigate("/parents");
    },
    onError: (error) => {
      console.error("Error deleting parent:", error);
      toast({
        title: "Error deleting parent",
        description: error.message || "There was an error deleting the parent",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  });

  // Handle delete
  const handleDelete = () => {
    setIsDeleting(true);
    deleteParentMutation.mutate();
  };

  if (parentLoading) {
    return (
      <AppLayout title="Detalles del Padre">
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

  if (parentError || !parent) {
    return (
      <AppLayout title="Detalles del Padre">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-red-500">Error al cargar los detalles del padre. Por favor, intenta nuevamente.</p>
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
    <AppLayout title={`Padre: ${parent.name}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="sm" onClick={() => navigate("/parents")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <h2 className="text-2xl font-serif font-medium">Detalles del Padre</h2>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-2">
          <Link href={`/parents/${parent.id}/edit`}>
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
                  Esta acción eliminará permanentemente el registro de {parent.name} y no se puede deshacer.
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
              <div className="flex items-center mb-2">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarFallback>{parent.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{parent.name}</CardTitle>
                  <CardDescription>Padre/Tutor</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground">Información de Contacto</h3>
                  
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{parent.email}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{parent.phone}</span>
                  </div>
                  
                  {parent.emergencyPhone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-red-500" />
                      <span className="flex items-center">
                        {parent.emergencyPhone}
                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                          Emergencia
                        </span>
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground">Ubicación</h3>
                  
                  {parent.neighborhood && (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-medium">Colonia/Sector:</div>
                        <div>{parent.neighborhood}</div>
                      </div>
                    </div>
                  )}
                  
                  {parent.address && (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-medium">Dirección completa:</div>
                        <div>{parent.address}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {parent.notes && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Notas Adicionales</h3>
                  <p>{parent.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Hijos</CardTitle>
                <Link href={`/children/new?parentId=${parent.id}`}>
                  <Button size="sm" variant="outline">
                    Agregar Hijo
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {childrenLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : children && children.length > 0 ? (
                <div className="space-y-3">
                  {children.map(child => (
                    <Link key={child.id} href={`/children/${child.id}`}>
                      <div className="flex items-center p-3 rounded-md border hover:bg-accent hover:cursor-pointer">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{child.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(child.birthDate).toLocaleDateString('es-ES')} 
                            ({child.age} años)
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users className="h-12 w-12 mx-auto text-muted mb-2" />
                  <p className="text-muted-foreground mb-4">
                    No hay niños registrados para este padre
                  </p>
                  <Link href={`/children/new?parentId=${parent.id}`}>
                    <Button>Registrar un niño</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}