import React, { useState } from 'react';
import { Bot, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NemiBotChat from './nemi-bot-chat';

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
          {isChatOpen ? <X size={24} /> : <Bot size={24} />}
        </Button>
      </div>
      
      {/* Componente de la ventana de chat */}
      {isChatOpen && (
        <NemiBotChat onClose={() => setIsChatOpen(false)} />
      )}
    </>
  );
};

export default NemiBotButton;