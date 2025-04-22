import React, { useState, lazy, Suspense } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NemiLogo from './nemi-logo';

// Importando el componente de chat con lazy para mejor rendimiento
const NemiBotChat = lazy(() => import('@/components/nemibot/nemi-bot-chat'));

/**
 * Componente de botón flotante para acceder al chatbot NEMI
 */
const NemiBotButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  return (
    <>
      {/* Botón flotante para abrir el chat */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`rounded-full w-14 h-14 shadow-lg flex items-center justify-center transition-all duration-300 ${
            isChatOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          aria-label={isChatOpen ? "Cerrar chat" : "Abrir chat con NEMI Bot"}
        >
          {isChatOpen ? 
            <X size={24} /> : 
            <img 
              src="/src/assets/nemi-logo.svg" 
              alt="NEMI Bot Logo" 
              className="w-6 h-6"
            />
          }
        </Button>
      </div>
      
      {/* Componente de la ventana de chat con Suspense para la carga */}
      {isChatOpen && (
        <Suspense fallback={
          <div className="fixed bottom-24 right-6 w-96 h-[500px] shadow-xl z-50 bg-background rounded-lg flex items-center justify-center">
            <div className="text-center">
              <img 
                src="/src/assets/nemi-logo.svg" 
                alt="NEMI Bot Logo" 
                className="w-12 h-12 mx-auto mb-2 animate-pulse" 
              />
              <p>Cargando NEMI Bot...</p>
            </div>
          </div>
        }>
          <NemiBotChat onClose={() => setIsChatOpen(false)} />
        </Suspense>
      )}
    </>
  );
};

export default NemiBotButton;