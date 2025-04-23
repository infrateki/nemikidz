import { Link } from "wouter";
import { 
  UserPlus, 
  ClipboardCheck, 
  Receipt, 
  CalendarPlus 
} from "lucide-react";

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  link: string;
}

export default function QuickActions() {
  const actions: QuickAction[] = [
    {
      title: "Registrar Niño",
      description: "Nuevo registro en el sistema",
      icon: <UserPlus className="text-xl" />,
      iconBgColor: "bg-primary-100",
      iconColor: "text-primary-600",
      link: "/children/new"
    },
    {
      title: "Tomar Asistencia",
      description: "Registro diario de asistencia",
      icon: <ClipboardCheck className="text-xl" />,
      iconBgColor: "bg-green-100",
      iconColor: "text-green-600",
      link: "/attendance"
    },
    {
      title: "Registrar Pago",
      description: "Agregar nuevo pago al sistema",
      icon: <Receipt className="text-xl" />,
      iconBgColor: "bg-amber-100",
      iconColor: "text-amber-600",
      link: "/payments/new"
    },
    {
      title: "Crear Programa",
      description: "Nuevo programa de actividades",
      icon: <CalendarPlus className="text-xl" />,
      iconBgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      link: "/programs/new"
    }
  ];

  return (
    <div className="mt-8 mb-8">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {actions.map((action, index) => (
          <Link key={index} href={action.link}>
            <div className="block bg-white shadow rounded-lg overflow-hidden hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${action.iconBgColor} rounded-md p-3`}>
                    <div className={`${action.iconColor}`}>{action.icon}</div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-medium text-gray-900">{action.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
