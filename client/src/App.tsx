import { Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NemiBotButton from "@/components/nemibot/nemi-bot-button";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Programs from "@/pages/programs";
import Children from "@/pages/children";
import Parents from "@/pages/parents";
import Enrollments from "@/pages/enrollments";
import Payments from "@/pages/payments";
import Attendance from "@/pages/attendance";
import Communications from "@/pages/communications";
import Inventory from "@/pages/inventory";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import { Route } from "wouter";
import NewProgram from "@/pages/programs/new";
import NewChild from "@/pages/children/new";
import NewParent from "@/pages/parents/new";
import NewEnrollment from "@/pages/enrollments/new";
import NewPayment from "@/pages/payments/new";
import NewInventoryItem from "@/pages/inventory/new";
import NewCommunication from "@/pages/communications/new";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/programs" component={Programs} />
      <ProtectedRoute path="/programs/new" component={NewProgram} />
      <ProtectedRoute path="/children" component={Children} />
      <ProtectedRoute path="/children/new" component={NewChild} />
      <ProtectedRoute path="/parents" component={Parents} />
      <ProtectedRoute path="/parents/new" component={NewParent} />
      <ProtectedRoute path="/enrollments" component={Enrollments} />
      <ProtectedRoute path="/enrollments/new" component={NewEnrollment} />
      <ProtectedRoute path="/payments" component={Payments} />
      <ProtectedRoute path="/payments/new" component={NewPayment} />
      <ProtectedRoute path="/attendance" component={Attendance} />
      <ProtectedRoute path="/communications" component={Communications} />
      <ProtectedRoute path="/communications/new" component={NewCommunication} />
      <ProtectedRoute path="/inventory" component={Inventory} />
      <ProtectedRoute path="/inventory/new" component={NewInventoryItem} />
      <ProtectedRoute path="/reports" component={Reports} />
      <ProtectedRoute path="/settings" component={Settings} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Componente contenedor para el chatbot que solo muestra cuando el usuario está autenticado
function ChatbotContainer() {
  const { user } = useAuth();
  return user ? <NemiBotButton /> : null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <ChatbotContainer />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
