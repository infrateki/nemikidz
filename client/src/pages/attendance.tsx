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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, CheckCircle, XCircle, User, Edit } from "lucide-react";
import { Link } from "wouter";
import { Attendance, Child } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: children, isLoading: childrenLoading } = useQuery<Child[]>({
    queryKey: ['/api/children'],
  });

  const { data: attendanceRecords, isLoading: attendanceLoading, error } = useQuery<Attendance[]>({
    queryKey: ['/api/attendance', { date: selectedDate.toISOString() }],
  });

  if (error) {
    console.error('Attendance fetch error:', error);
  }

  const isLoading = childrenLoading || attendanceLoading;

  // Check if a child is present based on attendance records
  const isChildPresent = (childId: number) => {
    if (!attendanceRecords) return false;
    const record = attendanceRecords.find(record => record.childId === childId);
    return record?.present || false;
  };

  // Get attendance record ID if exists
  const getAttendanceId = (childId: number) => {
    if (!attendanceRecords) return null;
    const record = attendanceRecords.find(record => record.childId === childId);
    return record?.id || null;
  };

  return (
    <AppLayout title="Asistencia">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 mb-6 gap-4">
        <div>
          <p className="text-gray-500 text-sm">
            Registro de asistencia diaria de los niños
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "PPP", { locale: es })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asistencia para {format(selectedDate, "PPP", { locale: es })}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : children && children.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Niño</TableHead>
                  <TableHead>Presente</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {children.map((child) => {
                  const isPresent = isChildPresent(child.id);
                  const attendanceId = getAttendanceId(child.id);
                  
                  return (
                    <TableRow key={child.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="mr-2 h-8 w-8">
                            <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{child.name}</div>
                            <div className="text-xs text-gray-500">{child.age || "Sin edad"} años</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Checkbox
                            id={`attendance-${child.id}`}
                            checked={isPresent}
                            disabled={attendanceLoading}
                          />
                          <label
                            htmlFor={`attendance-${child.id}`}
                            className="ml-2 flex items-center text-sm font-medium"
                          >
                            {isPresent ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            {isPresent ? "Presente" : "Ausente"}
                          </label>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Notas de asistencia"
                          className="h-8 text-sm"
                          disabled={attendanceLoading}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {attendanceId ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/attendance/${attendanceId}/edit`}>
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Link>
                          </Button>
                        ) : (
                          <Button size="sm">
                            Guardar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-60 p-4">
              <User className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No hay niños registrados</h3>
              <p className="text-gray-500 text-center mt-2">
                Registra niños para poder tomar asistencia.
              </p>
              <Link href="/children/new">
                <Button className="mt-4">
                  Registrar Niño
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
