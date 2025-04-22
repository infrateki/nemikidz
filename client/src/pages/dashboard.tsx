import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/app-layout";
import StatsCard from "@/components/dashboard/stats-card";
import ProgramsPanel from "@/components/dashboard/programs-panel";
import ActivityPanel from "@/components/dashboard/activity-panel";
import UpcomingProgramsTable from "@/components/dashboard/upcoming-programs-table";
import QuickActions from "@/components/dashboard/quick-actions";
import { Program } from "@shared/schema";
import { Users, CheckCircle, Calendar, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
  stats: {
    childrenCount: number;
    activePrograms: number;
    monthlyIncome: string;
    todayAttendance: {
      present: number;
      total: number;
    };
  };
  activePrograms: Program[];
  upcomingPrograms: Program[];
}

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

// Sample recent activities (in a real app, this would come from the API)
const recentActivities: Activity[] = [
  {
    id: 1,
    type: 'enrollment',
    subject: 'Sofia Rodríguez',
    program: 'Campamento de Verano',
    time: new Date(Date.now() - 12 * 60 * 1000) // 12 minutes ago
  },
  {
    id: 2,
    type: 'payment',
    amount: '$1,200',
    payerName: 'Carlos Méndez',
    time: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
  },
  {
    id: 3,
    type: 'notification',
    recipientName: 'padres de Arte y Creatividad',
    time: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
  },
  {
    id: 4,
    type: 'program',
    programName: 'Robótica para Principiantes',
    time: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
  }
];

export default function Dashboard() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard'],
  });

  if (error) {
    console.error('Dashboard fetch error:', error);
  }

  return (
    <AppLayout title="Dashboard">
      {/* Stats section */}
      <div className="mt-6">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white overflow-hidden shadow rounded-lg p-5">
                <Skeleton className="h-10 w-10 rounded-md mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-6 w-1/4" />
              </div>
            ))
          ) : (
            <>
              <StatsCard
                title="Niños Inscritos"
                value={data?.stats.childrenCount || 0}
                icon={<Users />}
                iconBgColor="bg-primary-100"
                iconColor="text-primary-600"
              />
              <StatsCard
                title="Programas Activos"
                value={data?.stats.activePrograms || 0}
                icon={<Calendar />}
                iconBgColor="bg-green-100"
                iconColor="text-green-600"
              />
              <StatsCard
                title="Ingresos del Mes"
                value={`$${data?.stats.monthlyIncome || '0'}`}
                icon={<DollarSign />}
                iconBgColor="bg-amber-100"
                iconColor="text-amber-600"
                trend={{ value: "12%", isPositive: true }}
              />
              <StatsCard
                title="Asistencia Hoy"
                value={`${data?.stats.todayAttendance?.present || 0}/${data?.stats.todayAttendance?.total || 0}`}
                icon={<CheckCircle />}
                iconBgColor="bg-blue-100"
                iconColor="text-blue-600"
                trend={data?.stats.todayAttendance?.total ? { 
                  value: `${Math.round((data.stats.todayAttendance.present / data.stats.todayAttendance.total) * 100)}%`, 
                  isPositive: true 
                } : undefined}
              />
            </>
          )}
        </dl>
      </div>

      {/* Programs & Recent Activity sections */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {isLoading ? (
          Array(2).fill(0).map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg p-5">
              <Skeleton className="h-6 w-1/3 mb-4" />
              <div className="space-y-4">
                {Array(3).fill(0).map((_, j) => (
                  <div key={j} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <>
            <ProgramsPanel programs={data?.activePrograms || []} />
            <ActivityPanel activities={recentActivities} />
          </>
        )}
      </div>

      {/* Upcoming Programs Table */}
      {isLoading ? (
        <div className="mt-8 bg-white overflow-hidden shadow rounded-lg p-5">
          <Skeleton className="h-6 w-1/4 mb-4" />
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-4" />
              ))}
            </div>
            <div className="border-t pt-4" />
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4">
                {Array(6).fill(0).map((_, j) => (
                  <Skeleton key={j} className="h-10" />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <UpcomingProgramsTable programs={data?.upcomingPrograms || []} />
      )}

      {/* Quick Actions Section */}
      <QuickActions />
    </AppLayout>
  );
}
