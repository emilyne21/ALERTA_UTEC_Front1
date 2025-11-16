/**
 * Servicio de WebSocket para conexión en tiempo real con el backend
 * 
 * Este servicio proporciona una interfaz para conectarse al WebSocket del backend
 * usando la URL configurada en las variables de entorno.
 */

const WS_URL = import.meta.env.VITE_WS_URL;

export interface WebSocketConfig {
  token?: string | null;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: MessageEvent) => void;
  reconnectInterval?: number; // en milisegundos
  maxReconnectAttempts?: number;
}

class SocketService {
  private ws: WebSocket | null = null;
  private reconnectTimeoutId: number | null = null;
  private reconnectAttempts: number = 0;
  private config: WebSocketConfig | null = null;
  private isManualClose: boolean = false;

  /**
   * Conecta al WebSocket del backend
   * @param config Configuración de la conexión WebSocket
   */
  connect(config: WebSocketConfig = {}): void {
    if (!WS_URL || WS_URL.includes('tu-api')) {
      console.warn('VITE_WS_URL no está configurada. WebSocket no se conectará.');
      return;
    }

    // Si ya hay una conexión activa, no crear otra
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket ya está conectado');
      return;
    }

    this.config = config;
    this.isManualClose = false;
    this.reconnectAttempts = 0;

    this._connect();
  }

  /**
   * Método interno para establecer la conexión
   */
  private _connect(): void {
    try {
      // Construir la URL con el token si está disponible
      let url = WS_URL;
      if (this.config?.token) {
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}token=${encodeURIComponent(this.config.token)}`;
      }

      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket conectado');
        this.reconnectAttempts = 0;
        this.config?.onOpen?.();
      };

      this.ws.onmessage = (event: MessageEvent) => {
        this.config?.onMessage?.(event);
      };

      this.ws.onerror = (error: Event) => {
        console.error('Error en WebSocket:', error);
        this.config?.onError?.(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket desconectado');
        this.config?.onClose?.();
        this.ws = null;

        // Reintentar conexión si no fue un cierre manual
        if (!this.isManualClose) {
          this._scheduleReconnect();
        }
      };
    } catch (error) {
      console.error('Error al conectar WebSocket:', error);
      this.config?.onError?.(error as Event);
      this._scheduleReconnect();
    }
  }

  /**
   * Programa un intento de reconexión
   */
  private _scheduleReconnect(): void {
    if (this.isManualClose) return;

    const maxAttempts = this.config?.maxReconnectAttempts ?? Infinity;
    if (this.reconnectAttempts >= maxAttempts) {
      console.warn('Se alcanzó el número máximo de intentos de reconexión');
      return;
    }

    const interval = this.config?.reconnectInterval ?? 3000;
    this.reconnectAttempts++;

    console.log(`Reintentando conexión WebSocket en ${interval}ms (intento ${this.reconnectAttempts})`);

    this.reconnectTimeoutId = window.setTimeout(() => {
      this._connect();
    }, interval);
  }

  /**
   * Desconecta el WebSocket
   */
  disconnect(): void {
    this.isManualClose = true;

    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Envía un mensaje a través del WebSocket
   * @param message Mensaje a enviar (string o objeto que se serializará a JSON)
   */
  send(message: string | object): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket no está conectado. No se puede enviar el mensaje.');
      return;
    }

    const messageToSend = typeof message === 'string' ? message : JSON.stringify(message);
    this.ws.send(messageToSend);
  }

  /**
   * Obtiene el estado actual de la conexión
   */
  getState(): number {
    if (!this.ws) return WebSocket.CLOSED;
    return this.ws.readyState;
  }

  /**
   * Verifica si el WebSocket está conectado
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Exportar una instancia singleton del servicio
export const socketService = new SocketService();

// Exportar también la clase para casos donde se necesite múltiples instancias
export default SocketService;

// Constantes útiles para el estado del WebSocket
export const WS_STATE = {
  CONNECTING: WebSocket.CONNECTING,
  OPEN: WebSocket.OPEN,
  CLOSING: WebSocket.CLOSING,
  CLOSED: WebSocket.CLOSED,
};

