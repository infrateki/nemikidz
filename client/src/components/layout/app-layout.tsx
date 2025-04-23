import { ReactNode, useState } from "react";
import Sidebar from "./sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Menu, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <div className={cn("fixed inset-0 flex z-40", mobileMenuOpen ? "block" : "hidden")}>
          {/* Mobile sidebar backdrop */}
          <div 
            className={cn("fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity", 
              mobileMenuOpen ? "opacity-100" : "opacity-0"
            )} 
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Mobile sidebar panel */}
          <div className={cn(
            "relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform ease-in-out duration-300",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button 
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Cerrar menú</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            
            {/* Mobile sidebar content */}
            <Sidebar setMobileMenuOpen={setMobileMenuOpen} />
          </div>
        </div>
      </div>
      
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <Sidebar />
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navigation bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button 
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Abrir menú</span>
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex items-center justify-between">
            {/* Centered NEMI NAVIGATOR Title with elegant style */}
            <div className="flex-1 flex justify-center">
              <h1 className="text-xl font-light tracking-widest uppercase text-center text-gray-700 hidden md:block">
                NEMI NAVIGATOR
              </h1>
            </div>
            
            <div className="ml-4 flex items-center space-x-4">
              {/* Notification bell */}
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 relative">
                <span className="sr-only">Notificaciones</span>
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>
              
              {/* User Profile Picture */}
              <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border-2 border-gray-100">
                {user?.profilePic ? (
                  <img 
                    src={user.profilePic} 
                    alt={`${user.name || user.username}'s profile`} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-medium text-gray-500">
                    {user?.name?.[0] || user?.username?.[0] || "U"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content wrapper */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            {/* Page header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
