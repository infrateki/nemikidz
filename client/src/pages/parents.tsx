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
import { Plus, Edit, Eye, Trash2, Users, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "wouter";
import { Parent } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Parents() {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();
  
  const { data: parents, isLoading, error } = useQuery<Parent[]>({
    queryKey: ['/api/parents'],
  });
  
  // Delete parent mutation
  const deleteParentMutation = useMutation({
    mutationFn: async (parentId: number) => {
      const res = await apiRequest("DELETE", `/api/parents/${parentId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error eliminando padre");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Padre eliminado con éxito",
        description: "El registro del padre ha sido eliminado del sistema",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/parents'] });
      setDeletingId(null);
    },
    onError: (error) => {
      console.error("Error deleting parent:", error);
      toast({
        title: "Error al eliminar",
        description: error.message || "Hubo un error al eliminar el registro del padre",
        variant: "destructive",
      });
      setDeletingId(null);
    }
  });
  
  // Handle delete parent
  const handleDeleteParent = (parentId: number) => {
    setDeletingId(parentId);
    deleteParentMutation.mutate(parentId);
  };

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
                      <Link href={`/children?parentId=${parent.id}`}>
                        <Button variant="outline" size="sm">
                          <Users className="h-3 w-3 mr-1" />
                          Ver Hijos
                        </Button>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/parents/${parent.id}`}>
                          <Button variant="outline" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/parents/${parent.id}/edit`}>
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
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
                                onClick={() => handleDeleteParent(parent.id)}
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
