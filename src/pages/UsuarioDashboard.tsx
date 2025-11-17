// Dashboard completo del estudiante con todas las funcionalidades mock
// Incluye: lista de incidentes, crear incidente, detalle con panel lateral, WebSocket simulado

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useIncidentes } from '../hooks/useIncidentes';
import { useToast } from '../components/common/ToastProvider';
import { IncidentForm } from '../components/incidents/IncidentForm';
import { IncidentTable } from '../components/incidents/IncidentTable';
import { IncidentSummaryCards } from '../components/incidents/IncidentSummaryCards';
import { IncidentDetailPanel } from '../components/incidents/IncidentDetailPanel';
import { ChatPanel } from '../components/incidents/ChatPanel';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';
import { wsMock } from '../services/wsMock';
import type { Incidente, WebSocketMessage } from '../types/incidentes';

export function UsuarioDashboard() {
  const { user, token } = useAuth();
  const {
    incidentes: allIncidentes,
    loading,
    error,
    crearIncidente,
    obtenerHistorial,
    agregarComentario,
    actualizarIncidente,
    obtenerMensajes,
    enviarMensaje,
  } = useIncidentes(token || '', {});
  const { showToast } = useToast();
  
  const [showForm, setShowForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incidente | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Filtrar solo los incidentes del usuario actual y ordenar por más recientes primero
  const incidentes = allIncidentes
    .filter(inc => inc.reportadoPor === user?.email)
    .sort((a, b) => b.creadoEn - a.creadoEn); // Más recientes primero

  // Conectar WebSocket simulado al montar
  useEffect(() => {
    if (!token) return;

    // Conectar incluso si no hay incidentes (para cuando se creen nuevos)
    const incidentIds = incidentes.map(inc => inc.id);
    wsMock.connect(incidentIds);
    setWsConnected(true);
    setLastSync(new Date());

    // Escuchar mensajes del WebSocket
    const unsubscribe = wsMock.onMessage((message: WebSocketMessage) => {
      handleWebSocketMessage(message);
    });

    // Escuchar cambios de conexión
    const unsubscribeConnection = wsMock.onConnectionChange((connected) => {
      setWsConnected(connected);
      if (connected) {
        setLastSync(new Date());
      }
    });

    return () => {
      unsubscribe();
      unsubscribeConnection();
      wsMock.disconnect();
    };
  }, [token]);

  // Actualizar IDs cuando cambian los incidentes
  useEffect(() => {
    if (wsConnected && token) {
      const incidentIds = incidentes.map(inc => inc.id);
      wsMock.disconnect();
      wsMock.connect(incidentIds);
    }
  }, [incidentes.map(inc => inc.id).join(','), wsConnected, token]);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    if (message.tipo === 'actualizacion_incidente') {
      // Buscar el incidente en la lista filtrada del usuario actual
      const incidente = incidentes.find(inc => inc.id === message.incidenteId);
      if (incidente && message.datos) {
        const updated: Incidente = {
          ...incidente,
          estado: message.datos.estado || incidente.estado,
          actualizadoEn: message.datos.actualizadoEn || incidente.actualizadoEn,
          atendidoPor: message.datos.atendidoPor !== undefined ? message.datos.atendidoPor : incidente.atendidoPor,
        };
        
        actualizarIncidente(updated);
        
        // Si el panel está abierto, actualizar el incidente seleccionado
        if (selectedIncident?.id === updated.id) {
          setSelectedIncident(updated);
        }

        const estadoLabels: Record<string, string> = {
          pendiente: 'Pendiente',
          en_atencion: 'En Atención',
          resuelto: 'Resuelto',
        };

        showToast(
          `Incidente actualizado: ${estadoLabels[updated.estado]}`,
          'info'
        );
      }
    } else if (message.tipo === 'nuevo_incidente') {
      showToast('Nuevo incidente reportado', 'info');
      // En producción, aquí se recargarían los incidentes
    }
  }, [incidentes, selectedIncident, actualizarIncidente, showToast]);

  const handleCreateIncident = async (data: {
    tipo: string;
    ubicacion: string;
    descripcion: string;
    urgencia: string;
  }) => {
    try {
      // Optimistic update: crear el incidente inmediatamente
      await crearIncidente(data);
      setShowForm(false);
      showToast('Incidente reportado exitosamente', 'success');
      
      // Simular confirmación del servidor después de 800ms
      setTimeout(() => {
        showToast('Incidente confirmado por el servidor', 'success');
      }, 800);
    } catch (error) {
      showToast('Error al reportar incidente', 'error');
    }
  };

  const handleAgregarComentario = async (incidenteId: string, comentario: string) => {
    try {
      await agregarComentario(incidenteId, comentario);
      showToast('Comentario agregado exitosamente', 'success');
    } catch (error) {
      showToast('Error al agregar comentario', 'error');
    }
  };

  const formatLastSync = () => {
    if (!lastSync) return 'Nunca';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSync.getTime()) / 1000);
    
    if (diff < 60) return `Hace ${diff}s`;
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)}m`;
    return `Hace ${Math.floor(diff / 3600)}h`;
  };

  return (
    <div className="relative">
      {/* Header con estado de conexión */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#4a5a40' }}>Mis Incidentes</h1>
          <p style={{ color: '#4a5a40' }}>Revisa el estado de los reportes que has enviado</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Indicador de conexión WebSocket */}
          <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: '#adcc9c' }}>
            <div
              className={`w-2 h-2 rounded-full ${
                wsConnected ? 'animate-pulse' : ''
              }`}
              style={{ backgroundColor: wsConnected ? '#4a5a40' : '#d32f2f' }}
              title={wsConnected ? 'Conectado' : 'Desconectado'}
            />
            <span className="text-xs" style={{ color: '#4a5a40' }}>
              {wsConnected ? 'En tiempo real' : 'Sin conexión'}
            </span>
            {lastSync && (
              <span className="text-xs" style={{ color: '#666666' }}>({formatLastSync()})</span>
            )}
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="flex-1 md:flex-none"
          >
            {showForm ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo incidente
              </>
            )}
          </Button>
        </div>
      </div>

        {/* Summary Cards */}
        <IncidentSummaryCards incidentes={incidentes} />

        {/* Chat Panel */}
        {selectedIncident && (
          <ChatPanel
            incidente={selectedIncident}
            obtenerMensajes={obtenerMensajes}
            enviarMensaje={enviarMensaje}
            currentUserEmail={user?.email || ''}
          />
        )}

      {/* Formulario de nuevo incidente */}
      {showForm && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg p-6 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-semibold mb-4 text-slate-100">Nuevo Incidente</h2>
          <IncidentForm onSubmit={handleCreateIncident} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Lista de incidentes */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      ) : error ? (
        <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5' }}>
          <p className="font-semibold" style={{ color: '#dc2626' }}>Error al cargar incidentes</p>
          <p className="text-sm mt-1" style={{ color: '#991b1b' }}>{error}</p>
        </div>
      ) : incidentes.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)' }}>
          <svg
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: '#7d9670' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#333333' }}>No hay incidentes reportados</h3>
          <p className="mb-4" style={{ color: '#666666' }}>
            Comienza reportando un nuevo incidente para que podamos ayudarte
          </p>
          <Button onClick={() => setShowForm(true)}>Reportar primer incidente</Button>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Mostrando {incidentes.length} incidente{incidentes.length !== 1 ? 's' : ''}
            </p>
          </div>
          <IncidentTable
            incidentes={incidentes}
            onSelect={setSelectedIncident}
          />
        </div>
      )}

      {/* Panel lateral de detalle */}
      {selectedIncident && (
        <IncidentDetailPanel
          incidente={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          obtenerHistorial={obtenerHistorial}
          agregarComentario={handleAgregarComentario}
          onUpdate={actualizarIncidente}
        />
      )}

    </div>
  );
}
