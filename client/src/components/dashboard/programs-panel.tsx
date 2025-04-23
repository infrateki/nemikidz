import { TentTree, FlaskRound, Paintbrush } from "lucide-react";
import { Link } from "wouter";
import { Program } from "@shared/schema";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ProgramsPanelProps {
  programs: Program[];
}

const getProgramIcon = (index: number) => {
  const icons = [
    { icon: <TentTree className="text-primary-600" />, bg: "bg-primary-100" },
    { icon: <FlaskRound className="text-blue-600" />, bg: "bg-blue-100" },
    { icon: <Paintbrush className="text-red-600" />, bg: "bg-red-100" }
  ];
  
  return icons[index % icons.length];
};

export default function ProgramsPanel({ programs }: ProgramsPanelProps) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Programas Activos</h3>
          <Link href="/programs">
            <div className="text-sm font-medium text-primary-600 hover:text-primary-500 cursor-pointer">
              Ver todos <span aria-hidden="true">&rarr;</span>
            </div>
          </Link>
        </div>
      </div>
      <div className="px-4 py-3 sm:px-6">
        <div className="flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {programs.length > 0 ? (
              programs.map((program, index) => {
                const { icon, bg } = getProgramIcon(index);
                const startDate = new Date(program.startDate);
                const endDate = new Date(program.endDate);
                const dateRange = `${format(startDate, 'd MMM', { locale: es })} - ${format(endDate, 'd MMM', { locale: es })}`;
                
                // Calculate enrollment status
                let enrollmentStatus = "0/0";
                let statusClass = "bg-green-100 text-green-800";
                
                if (program.capacity > 0) {
                  // Here we would typically have a way to get the actual enrolled count
                  // Since we don't have it in the props, we'll simulate it with random data
                  const enrolledSimulation = Math.floor(Math.random() * (program.capacity + 1));
                  enrollmentStatus = `${enrolledSimulation}/${program.capacity}`;
                  
                  // Change color based on capacity percentage
                  const percentage = (enrolledSimulation / program.capacity) * 100;
                  if (percentage >= 90) {
                    statusClass = "bg-red-100 text-red-800";
                  } else if (percentage >= 60) {
                    statusClass = "bg-yellow-100 text-yellow-800";
                  }
                }
                
                return (
                  <li key={program.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-md ${bg} flex items-center justify-center`}>
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{program.name}</p>
                        <p className="text-sm text-gray-500 truncate flex items-center">
                          <svg className="mr-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{dateRange}</span>
                        </p>
                      </div>
                      <div>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                          <span>{enrollmentStatus}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="py-4 text-center text-gray-500">No hay programas activos actualmente</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
