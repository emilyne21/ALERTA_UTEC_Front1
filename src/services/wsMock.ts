// Simulación de WebSocket para desarrollo sin backend
// Emite eventos periódicamente para simular actualizaciones en tiempo real

import type { WebSocketMessage } from '../types/incidentes';

type MessageCallback = (message: WebSocketMessage) => void;
type ConnectionCallback = (connected: boolean) => void;

class WebSocketMock {
  private messageCallbacks: MessageCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];
  private isConnected: boolean = false;
  private intervalId: number | null = null;
  private reconnectIntervalId: number | null = null;
  private incidentIds: string[] = [];

  connect(incidentIds: string[] = []) {
    if (this.isConnected) return;

    this.incidentIds = incidentIds;
    this.isConnected = true;
    this.notifyConnectionChange(true);

    // Simular actualizaciones periódicas cada 8-15 segundos
    this.intervalId = window.setInterval(() => {
      this.emitRandomUpdate();
    }, 8000 + Math.random() * 7000);

    // Simular reconexión automática si se desconecta
    this.reconnectIntervalId = window.setInterval(() => {
      if (!this.isConnected) {
        this.connect(this.incidentIds);
      }
    }, 30000);
  }

  disconnect() {
    this.isConnected = false;
    this.notifyConnectionChange(false);

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.reconnectIntervalId !== null) {
      clearInterval(this.reconnectIntervalId);
      this.reconnectIntervalId = null;
    }
  }

  onMessage(callback: MessageCallback) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  onConnectionChange(callback: ConnectionCallback) {
    this.connectionCallbacks.push(callback);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
    };
  }

  private emitRandomUpdate() {
    if (!this.isConnected || this.incidentIds.length === 0) return;

    const randomIncidentId = this.incidentIds[Math.floor(Math.random() * this.incidentIds.length)];
    const updateType = Math.random() > 0.8 ? 'nuevo_incidente' : 'actualizacion_incidente';

    // Simular progresión de estados: pendiente -> en_atencion -> resuelto
    const estados: Array<'pendiente' | 'en_atencion' | 'resuelto'> = ['pendiente', 'en_atencion', 'resuelto'];
    const randomEstado = estados[Math.floor(Math.random() * estados.length)];

    const message: WebSocketMessage = {
      tipo: updateType,
      incidenteId: randomIncidentId,
      datos: {
        estado: randomEstado,
        actualizadoEn: Math.floor(Date.now() / 1000),
        atendidoPor: randomEstado !== 'pendiente' ? 'trabajador@utec.edu.pe' : null,
      },
      timestamp: Math.floor(Date.now() / 1000),
    };

    this.notifyMessage(message);
  }

  private notifyMessage(message: WebSocketMessage) {
    this.messageCallbacks.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error en callback de WebSocket:', error);
      }
    });
  }

  private notifyConnectionChange(connected: boolean) {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error en callback de conexión:', error);
      }
    });
  }

  // Método para forzar una actualización (útil para testing)
  forceUpdate(incidenteId: string, estado: 'pendiente' | 'en_atencion' | 'resuelto') {
    const message: WebSocketMessage = {
      tipo: 'actualizacion_incidente',
      incidenteId,
      datos: {
        estado,
        actualizadoEn: Math.floor(Date.now() / 1000),
      },
      timestamp: Math.floor(Date.now() / 1000),
    };
    this.notifyMessage(message);
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Instancia singleton
export const wsMock = new WebSocketMock();

