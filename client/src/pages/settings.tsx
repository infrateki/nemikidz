import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Lock, 
  BellRing, 
  Mail, 
  Shield,
  Check,
  Save,
  Upload 
} from "lucide-react";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor ingresa un email válido.",
  }),
});

const securityFormSchema = z.object({
  currentPassword: z.string().min(1, {
    message: "Por favor ingresa tu contraseña actual.",
  }),
  newPassword: z.string().min(8, {
    message: "La contraseña debe tener al menos 8 caracteres.",
  }),
  confirmPassword: z.string().min(8, {
    message: "La contraseña debe tener al menos 8 caracteres.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type SecurityFormValues = z.infer<typeof securityFormSchema>;

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onProfileSubmit(data: ProfileFormValues) {
    toast({
      title: "Perfil actualizado",
      description: "Tu información de perfil ha sido actualizada exitosamente.",
    });
  }

  function onSecuritySubmit(data: SecurityFormValues) {
    toast({
      title: "Contraseña actualizada",
      description: "Tu contraseña ha sido cambiada exitosamente.",
    });
  }

  return (
    <AppLayout title="Configuración">
      <Tabs defaultValue="profile" className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex mb-6">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>
                Administra tu información de perfil y cómo es mostrada en el sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {user?.name ? user.name.charAt(0).toUpperCase() : user?.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Foto de perfil</h4>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-3 w-3 mr-1" />
                      Cambiar foto
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Tu nombre completo" {...field} />
                        </FormControl>
                        <FormDescription>
                          Este es el nombre que se mostrará en tu perfil.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo electrónico</FormLabel>
                        <FormControl>
                          <Input placeholder="tu@ejemplo.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Correo electrónico para notificaciones y comunicaciones.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar cambios
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>
                Administra tu contraseña y la configuración de seguridad de tu cuenta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                  <FormField
                    control={securityForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña actual</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Separator />
                  
                  <FormField
                    control={securityForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nueva contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Debe tener al menos 8 caracteres e incluir letras y números.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={securityForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar nueva contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button type="submit">
                      <Lock className="h-4 w-4 mr-2" />
                      Actualizar contraseña
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>
                Configura cómo y cuándo recibes notificaciones sobre actividades en el sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Notificaciones por correo electrónico
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-inscriptions">Nuevas inscripciones</Label>
                      <p className="text-sm text-gray-500">
                        Recibe alertas cuando se registre una nueva inscripción.
                      </p>
                    </div>
                    <Switch 
                      id="email-inscriptions" 
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-payments">Pagos registrados</Label>
                      <p className="text-sm text-gray-500">
                        Recibe confirmaciones cuando se registre un nuevo pago.
                      </p>
                    </div>
                    <Switch 
                      id="email-payments" 
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-reminders">Recordatorios</Label>
                      <p className="text-sm text-gray-500">
                        Recibe recordatorios sobre actividades próximas.
                      </p>
                    </div>
                    <Switch 
                      id="email-reminders" 
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center">
                  <BellRing className="h-4 w-4 mr-2" />
                  Notificaciones SMS
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms-inscriptions">Nuevas inscripciones</Label>
                      <p className="text-sm text-gray-500">
                        Recibe SMS cuando se registre una nueva inscripción.
                      </p>
                    </div>
                    <Switch 
                      id="sms-inscriptions" 
                      checked={smsNotifications}
                      onCheckedChange={setSmsNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms-payments">Pagos registrados</Label>
                      <p className="text-sm text-gray-500">
                        Recibe SMS cuando se registre un nuevo pago.
                      </p>
                    </div>
                    <Switch 
                      id="sms-payments" 
                      checked={smsNotifications}
                      onCheckedChange={setSmsNotifications}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" className="mr-2">Cancelar</Button>
              <Button onClick={() => {
                toast({
                  title: "Configuración guardada",
                  description: "Tu configuración de notificaciones ha sido actualizada.",
                });
              }}>
                <Check className="h-4 w-4 mr-2" />
                Guardar configuración
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
