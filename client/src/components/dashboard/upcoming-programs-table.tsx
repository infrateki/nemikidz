import { Program } from "@shared/schema";
import { Link } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { Laptop, Sprout, Music } from "lucide-react";

interface UpcomingProgramsTableProps {
  programs: Program[];
}

export default function UpcomingProgramsTable({ programs }: UpcomingProgramsTableProps) {
  // Icons for programs
  const getProgramIcon = (index: number) => {
    const icons = [
      { icon: <Laptop className="text-indigo-600" />, bg: "bg-indigo-100" },
      { icon: <Sprout className="text-green-600" />, bg: "bg-green-100" },
      { icon: <Music className="text-purple-600" />, bg: "bg-purple-100" }
    ];
    
    return icons[index % icons.length];
  };

  // Function to calculate program duration in weeks
  const calculateDuration = (startDate: string | Date, endDate: string | Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.ceil(diffDays / 7);
    return `${weeks} semana${weeks !== 1 ? 's' : ''}`;
  };

  // Function to determine status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Activo</span>;
      case 'cancelled':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Cancelado</span>;
      case 'complete':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Completado</span>;
      case 'draft':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Borrador</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Inscripciones Abiertas</span>;
    }
  };

  // Function to simulate enrollment progress
  const getEnrollmentProgress = (index: number, capacity: number) => {
    // For real implementation, we would use actual enrollment data
    const enrollments = [4, 12, 2];
    const enrolled = enrollments[index % enrollments.length];
    const percentage = Math.round((enrolled / capacity) * 100);
    return { enrolled, percentage };
  };

  return (
    <div className="mt-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Próximos Programas</h3>
        </div>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mt-2 flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Programa</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidad</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inscritos</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Acciones</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {programs.length > 0 ? (
                        programs.map((program, index) => {
                          const { icon, bg } = getProgramIcon(index);
                          const { enrolled, percentage } = getEnrollmentProgress(index, program.capacity);
                          
                          return (
                            <tr key={program.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className={`flex-shrink-0 h-10 w-10 rounded ${bg} flex items-center justify-center`}>
                                    {icon}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{program.name}</div>
                                    <div className="text-sm text-gray-500">{formatCurrency(Number(program.price))}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {format(new Date(program.startDate), "d MMMM, yyyy", { locale: es })}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {calculateDuration(program.startDate, program.endDate)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{program.capacity} niños</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{enrolled}</div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-primary-600 h-2.5 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(program.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link href={`/programs/${program.id}/edit`}>
                                  <a className="text-primary-600 hover:text-primary-900 mr-3">Editar</a>
                                </Link>
                                <Link href={`/programs/${program.id}`}>
                                  <a className="text-primary-600 hover:text-primary-900">Ver</a>
                                </Link>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                            No hay programas próximos programados
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
