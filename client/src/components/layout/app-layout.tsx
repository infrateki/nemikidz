import { ReactNode, useState } from "react";
import Sidebar from "./sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <div className={cn("fixed inset-0 flex z-40", mobileMenuOpen ? "block" : "hidden")}>
          {/* Mobile sidebar backdrop */}
          <div 
            className={cn("fixed inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity", 
              mobileMenuOpen ? "opacity-100" : "opacity-0"
            )} 
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Mobile sidebar panel */}
          <div className={cn(
            "relative flex-1 flex flex-col max-w-xs w-full bg-sidebar transform transition-transform ease-in-out duration-300",
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
        <div className="flex flex-col w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
          <Sidebar />
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navigation bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-card shadow">
          <button 
            className="px-4 border-r border-border text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Abrir menú</span>
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex items-center justify-between">
            {/* Centered NEMI NAVIGATOR Title with elegant style */}
            <div className="flex-1 flex justify-center">
              <h1 className="text-xl font-light tracking-widest uppercase text-center text-foreground/90 hidden md:block">
                NEMI NAVIGATOR
              </h1>
            </div>
            
            <div className="ml-4 flex items-center space-x-4">
              {/* Theme toggle */}
              <ThemeToggle />
              
              {/* Notification bell */}
              <button className="p-1 rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary relative">
                <span className="sr-only">Notificaciones</span>
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-destructive ring-2 ring-card"></span>
              </button>
              
              {/* User Profile Picture */}
              <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center border-2 border-border">
                {user?.profilePic ? (
                  <img 
                    src={user.profilePic} 
                    alt={`${user.name || user.username}'s profile`} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-medium text-muted-foreground">
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
              <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
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
