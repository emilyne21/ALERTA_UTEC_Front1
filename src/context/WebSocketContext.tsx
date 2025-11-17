import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import type { WebSocketMessage } from '../types/incidentes';

interface WebSocketContextType {
  lastMessage: WebSocketMessage | null;
  isConnected: boolean;
  send: (message: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({
  children,
  token,
}: {
  children: ReactNode;
  token: string | null;
}) {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const WS_URL = import.meta.env.VITE_WS_URL;
    const USE_MOCK = !WS_URL || WS_URL.includes('tu-api');
    
    // No conectar WebSocket en modo mock
    if (!token || USE_MOCK) {
      return;
    }

    const connect = () => {
      try {
        const ws = new WebSocket(`${WS_URL}?token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket conectado');
          setIsConnected(true);
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        };

        ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            setLastMessage(message);
          } catch (error) {
            console.error('Error al parsear mensaje WebSocket:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('Error en WebSocket:', error);
        };

        ws.onclose = () => {
          console.log('WebSocket desconectado');
          setIsConnected(false);
          wsRef.current = null;

          // Reintentar conexión después de 3 segundos
          if (token) {
            reconnectTimeoutRef.current = window.setTimeout(() => {
              connect();
            }, 3000);
          }
        };
      } catch (error) {
        console.error('Error al conectar WebSocket:', error);
      }
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [token]);

  const send = (message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    }
  };

  return (
    <WebSocketContext.Provider value={{ lastMessage, isConnected, send }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket debe usarse dentro de un WebSocketProvider');
  }
  return context;
}

