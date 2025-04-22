import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { CalendarIcon, Download, DownloadCloud, FileText } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample data for charts - in a real app, this would come from API
const enrollmentData = [
  { name: 'Ene', cantidad: 12 },
  { name: 'Feb', cantidad: 19 },
  { name: 'Mar', cantidad: 15 },
  { name: 'Abr', cantidad: 22 },
  { name: 'May', cantidad: 25 },
  { name: 'Jun', cantidad: 18 },
  { name: 'Jul', cantidad: 30 },
  { name: 'Ago', cantidad: 28 },
  { name: 'Sep', cantidad: 24 },
  { name: 'Oct', cantidad: 22 },
  { name: 'Nov', cantidad: 15 },
  { name: 'Dic', cantidad: 10 },
];

const incomeData = [
  { name: 'Ene', ingresos: 15000 },
  { name: 'Feb', ingresos: 22000 },
  { name: 'Mar', ingresos: 18000 },
  { name: 'Abr', ingresos: 25000 },
  { name: 'May', ingresos: 32000 },
  { name: 'Jun', ingresos: 28000 },
  { name: 'Jul', ingresos: 40000 },
  { name: 'Ago', ingresos: 38000 },
  { name: 'Sep', ingresos: 32000 },
  { name: 'Oct', ingresos: 28000 },
  { name: 'Nov', ingresos: 20000 },
  { name: 'Dic', ingresos: 15000 },
];

const programDistributionData = [
  { name: 'Campamento de Verano', value: 45 },
  { name: 'Arte y Creatividad', value: 20 },
  { name: 'Ciencia Divertida', value: 15 },
  { name: 'Robótica', value: 10 },
  { name: 'Música', value: 10 },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Reports() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date()
  });

  return (
    <AppLayout title="Reportes">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 mb-6">
        <div>
          <p className="text-gray-500 text-sm">
            Análisis y estadísticas del desempeño del programa
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
          <Select defaultValue="2025">
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Generar Reporte
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="inscripciones">Inscripciones</TabsTrigger>
          <TabsTrigger value="financiero">Financiero</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inscripciones por Mes</CardTitle>
                <CardDescription>Total de inscripciones registradas por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={enrollmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} inscripciones`, 'Cantidad']} />
                      <Legend />
                      <Bar dataKey="cantidad" fill="#6366f1" name="Inscripciones" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Programa</CardTitle>
                <CardDescription>Porcentaje de niños por programa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={programDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {programDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Porcentaje']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ingresos Mensuales</CardTitle>
              <CardDescription>Total de ingresos por mes (MXN)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={incomeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Ingresos']} />
                    <Legend />
                    <Line type="monotone" dataKey="ingresos" stroke="#10b981" activeDot={{ r: 8 }} name="Ingresos" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inscripciones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Inscripciones</CardTitle>
              <CardDescription>Análisis detallado de inscripciones</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-6">Selecciona un rango de fechas para analizar las inscripciones:</p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full sm:w-[300px] justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                            {format(dateRange.to, "LLL dd, y", { locale: es })}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y", { locale: es })
                        )
                      ) : (
                        <span>Seleccionar rango de fechas</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={(range) => range && setDateRange(range as any)}
                      numberOfMonths={2}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                
                <Button>
                  <DownloadCloud className="mr-2 h-4 w-4" />
                  Exportar Datos
                </Button>
              </div>
              
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} inscripciones`, 'Cantidad']} />
                    <Legend />
                    <Bar dataKey="cantidad" fill="#6366f1" name="Inscripciones" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financiero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis Financiero</CardTitle>
              <CardDescription>Resumen de ingresos y gastos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-6">Selecciona un mes para ver el detalle financiero:</p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full sm:w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "MMMM yyyy", { locale: es }) : <span>Seleccionar mes</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Reporte
                </Button>
              </div>
              
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={incomeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Ingresos']} />
                    <Legend />
                    <Line type="monotone" dataKey="ingresos" stroke="#10b981" activeDot={{ r: 8 }} name="Ingresos" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
