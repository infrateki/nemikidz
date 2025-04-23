import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Calendar,
  Users,
  User,
  ClipboardList,
  DollarSign,
  CheckSquare,
  Inbox,
  Package, 
  BarChart2,
  Settings,
  LogOut,
  Baby
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SidebarProps {
  setMobileMenuOpen?: (open: boolean) => void;
}

export default function Sidebar({ setMobileMenuOpen }: SidebarProps = {}) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleLinkClick = () => {
    if (setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const navItems = [
    { path: "/", icon: <Home className="mr-3 h-5 w-5" />, label: "Dashboard" },
    { path: "/programs", icon: <Calendar className="mr-3 h-5 w-5" />, label: "Programas" },
    { path: "/children", icon: <Baby className="mr-3 h-5 w-5" />, label: "Niños" },
    { path: "/parents", icon: <Users className="mr-3 h-5 w-5" />, label: "Padres" },
    { path: "/enrollments", icon: <ClipboardList className="mr-3 h-5 w-5" />, label: "Inscripciones" },
    { path: "/payments", icon: <DollarSign className="mr-3 h-5 w-5" />, label: "Pagos" },
    { path: "/attendance", icon: <CheckSquare className="mr-3 h-5 w-5" />, label: "Asistencia" },
    { path: "/communications", icon: <Inbox className="mr-3 h-5 w-5" />, label: "Comunicaciones" },
    { path: "/inventory", icon: <Package className="mr-3 h-5 w-5" />, label: "Inventario" },
    { path: "/reports", icon: <BarChart2 className="mr-3 h-5 w-5" />, label: "Reportes" },
    { path: "/settings", icon: <Settings className="mr-3 h-5 w-5" />, label: "Configuración" },
  ];

  return (
    <div className="flex flex-col h-0 flex-1">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-primary-600">NEMI</h1>
        </div>
        
        {user && (
          <div className="mt-2 px-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Avatar>
                  <AvatarFallback>{user.name?.charAt(0) || user.username.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user.name || user.username}</p>
                <p className="text-xs font-medium text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
        
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center px-3 py-2 my-1 font-medium rounded-md",
                location === item.path
                  ? "bg-primary-50 text-primary-600"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <Button
          variant="ghost"
          className="flex-shrink-0 group block text-left w-full"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <div className="flex items-center">
            <div>
              <LogOut className="text-gray-500 mr-3 h-5 w-5" />
            </div>
            <div className="text-sm font-medium text-gray-700">
              {logoutMutation.isPending ? "Cerrando sesión..." : "Cerrar sesión"}
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
}
