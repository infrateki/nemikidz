import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Necesitamos esperar hasta que el componente esté montado
  // para acceder al tema y evitar hidratación incorrecta
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // También actualizamos el elemento html directamente para asegurar el cambio
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Evitar problemas de hidratación
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full w-8 h-8 opacity-0"
      >
        <span className="sr-only">Cambiar tema</span>
      </Button>
    );
  }
  
  const currentTheme = resolvedTheme || theme;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-8 h-8"
          >
            <Sun className={`h-5 w-5 transition-all ${
              currentTheme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
            }`} />
            <Moon className={`absolute h-5 w-5 transition-all ${
              currentTheme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'
            }`} />
            <span className="sr-only">Cambiar tema</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Cambiar a modo {currentTheme === 'dark' ? 'claro' : 'oscuro'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}