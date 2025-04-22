import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Activity {
  id: number;
  type: 'enrollment' | 'payment' | 'notification' | 'program';
  subject?: string;
  program?: string;
  amount?: string;
  payerName?: string;
  recipientName?: string;
  programName?: string;
  time: Date;
}

interface ActivityPanelProps {
  activities: Activity[];
}

export default function ActivityPanel({ activities }: ActivityPanelProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment':
        return {
          bg: "bg-blue-500",
          icon: (
            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          )
        };
      case 'payment':
        return {
          bg: "bg-green-500",
          icon: (
            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'notification':
        return {
          bg: "bg-yellow-500",
          icon: (
            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          )
        };
      case 'program':
        return {
          bg: "bg-red-500",
          icon: (
            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )
        };
      default:
        return {
          bg: "bg-gray-500",
          icon: (
            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  const getActivityDescription = (activity: Activity) => {
    switch (activity.type) {
      case 'enrollment':
        return (
          <p className="text-sm text-gray-500">
            Nueva inscripción: <span className="font-medium text-gray-900">{activity.subject}</span> en{' '}
            <span className="font-medium text-gray-900">{activity.program}</span>
          </p>
        );
      case 'payment':
        return (
          <p className="text-sm text-gray-500">
            Pago registrado: <span className="font-medium text-gray-900">{activity.amount}</span> por{' '}
            <span className="font-medium text-gray-900">{activity.payerName}</span>
          </p>
        );
      case 'notification':
        return (
          <p className="text-sm text-gray-500">
            Recordatorio enviado a <span className="font-medium text-gray-900">{activity.recipientName}</span>
          </p>
        );
      case 'program':
        return (
          <p className="text-sm text-gray-500">
            Nuevo programa creado: <span className="font-medium text-gray-900">{activity.programName}</span>
          </p>
        );
      default:
        return <p className="text-sm text-gray-500">Actividad registrada</p>;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Actividad Reciente</h3>
      </div>
      <div className="px-4 py-3 sm:px-6">
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.length > 0 ? (
              activities.map((activity, index) => {
                const { bg, icon } = getActivityIcon(activity.type);
                const isLast = index === activities.length - 1;
                
                return (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {!isLast && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        ></span>
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full ${bg} flex items-center justify-center ring-8 ring-white`}>
                            {icon}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            {getActivityDescription(activity)}
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time>
                              {formatDistanceToNow(activity.time, { addSuffix: true, locale: es })}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="py-4 text-center text-gray-500">No hay actividad reciente</li>
            )}
          </ul>
        </div>
        <div className="mt-6">
          <Button variant="outline" className="w-full">
            Ver más actividad
          </Button>
        </div>
      </div>
    </div>
  );
}
