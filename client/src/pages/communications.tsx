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
import { Plus, Edit, Eye, Trash2, User, Mail, MessageSquare, BellRing } from "lucide-react";
import { Link } from "wouter";
import { Communication } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function Communications() {
  const { data: communications, isLoading, error } = useQuery<Communication[]>({
    queryKey: ['/api/communications'],
  });

  if (error) {
    console.error('Communications fetch error:', error);
  }

  // Function to determine communication type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4 mr-2 text-blue-600" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4 mr-2 text-green-600" />;
      case 'notification':
        return <BellRing className="h-4 w-4 mr-2 text-amber-600" />;
      default:
        return <Mail className="h-4 w-4 mr-2 text-gray-600" />;
    }
  };

  // Function to determine status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Enviado</Badge>;
      case 'read':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Leído</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Fallido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout title="Comunicaciones">
      <div className="flex justify-between items-center mt-4 mb-6">
        <div>
          <p className="text-gray-500 text-sm">
            Gestión de comunicaciones con padres y tutores
          </p>
        </div>
        <Link href="/communications/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Comunicación
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
          ) : communications && communications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Destinatario</TableHead>
                  <TableHead>Asunto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {communications.map((communication) => (
                  <TableRow key={communication.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {getTypeIcon(communication.type)}
                        <span className="capitalize">{communication.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" className="p-0 hover:bg-transparent" asChild>
                        <Link href={`/parents/${communication.parentId}`}>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-600" />
                            <span>Padre #{communication.parentId}</span>
                          </div>
                        </Link>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate font-medium">
                        {communication.subject}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(communication.date)}</TableCell>
                    <TableCell>{getStatusBadge(communication.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/communications/${communication.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/communications/${communication.id}/edit`}>
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
              <Mail className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No hay comunicaciones registradas</h3>
              <p className="text-gray-500 text-center mt-2">
                Crea una nueva comunicación para comenzar.
              </p>
              <Link href="/communications/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Comunicación
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
