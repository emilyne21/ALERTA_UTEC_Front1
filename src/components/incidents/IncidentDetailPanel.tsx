// Panel lateral para mostrar el detalle de un incidente
// Se puede abrir/cerrar desde el dashboard

import { useState, useEffect } from 'react';
import { IncidentStatusBadge } from './IncidentStatusBadge';
import { IncidentTimeline } from './IncidentTimeline';
import { Button } from '../common/Button';
import { Loader } from '../common/Loader';
import type { Incidente, HistorialItem } from '../../types/incidentes';

interface IncidentDetailPanelProps {
  incidente: Incidente | null;
  onClose: () => void;
  obtenerHistorial: (id: string) => Promise<HistorialItem[]>;
  agregarComentario: (incidenteId: string, comentario: string) => Promise<void>;
  onUpdate?: (incidente: Incidente) => void;
}

export function IncidentDetailPanel({
  incidente,
  onClose,
  obtenerHistorial,
  agregarComentario,
}: IncidentDetailPanelProps) {
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [comentario, setComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [currentIncident, setCurrentIncident] = useState<Incidente | null>(incidente);

  useEffect(() => {
    setCurrentIncident(incidente);
  }, [incidente]);

  useEffect(() => {
    if (!incidente) return;

    const cargarHistorial = async () => {
      setLoadingHistorial(true);
      try {
        const data = await obtenerHistorial(incidente.id);
        setHistorial(data);
      } catch (error) {
        console.error('Error al cargar historial:', error);
      } finally {
        setLoadingHistorial(false);
      }
    };

    cargarHistorial();
  }, [incidente, obtenerHistorial]);

  const handleAgregarComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidente || !comentario.trim()) return;

    setEnviandoComentario(true);
    try {
      await agregarComentario(incidente.id, comentario);
      setComentario('');
      // Recargar historial
      const data = await obtenerHistorial(incidente.id);
      setHistorial(data);
    } catch (error) {
      console.error('Error al agregar comentario:', error);
    } finally {
      setEnviandoComentario(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUrgenciaColor = (urgencia: string) => {
    const colors: Record<string, string> = {
      baja: 'text-slate-400 bg-slate-800',
      media: 'text-yellow-400 bg-yellow-500/20',
      alta: 'text-orange-400 bg-orange-500/20',
      critica: 'text-red-400 bg-red-500/20',
    };
    return colors[urgencia] || 'text-slate-400 bg-slate-800';
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      infraestructura: 'Infraestructura',
      limpieza: 'Limpieza',
      seguridad: 'Seguridad',
      tecnologia: 'Tecnología',
      otro: 'Otro',
    };
    return labels[tipo] || tipo;
  };

  if (!currentIncident) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel lateral */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out" style={{ backgroundColor: '#ffffff', borderLeft: '1px solid #d1d5db' }}>
        {/* Header */}
        <div className="sticky top-0 p-6 flex justify-between items-start z-10" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #d1d5db' }}>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#4a5a40' }}>Detalle del Incidente</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <IncidentStatusBadge estado={currentIncident.estado} />
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgenciaColor(
                  currentIncident.urgencia
                )}`}
              >
                {currentIncident.urgencia.toUpperCase()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="transition-colors p-2"
            style={{ color: '#666666' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#333333'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#666666'}
            aria-label="Cerrar panel"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-medium mb-1" style={{ color: '#666666' }}>Tipo</h3>
              <p className="text-lg" style={{ color: '#333333' }}>{getTipoLabel(currentIncident.tipo)}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-1" style={{ color: '#666666' }}>Ubicación</h3>
              <p className="text-lg" style={{ color: '#333333' }}>{currentIncident.ubicacion}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-1" style={{ color: '#666666' }}>Descripción</h3>
              <p className="whitespace-pre-wrap" style={{ color: '#333333' }}>{currentIncident.descripcion}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2" style={{ borderTop: '1px solid #d1d5db' }}>
              <div>
                <h3 className="text-sm font-medium mb-1" style={{ color: '#666666' }}>Reportado por</h3>
                <p className="text-sm" style={{ color: '#333333' }}>{currentIncident.reportadoPor}</p>
              </div>
              {currentIncident.atendidoPor && (
                <div>
                  <h3 className="text-sm font-medium mb-1" style={{ color: '#666666' }}>Atendido por</h3>
                  <p className="text-sm" style={{ color: '#333333' }}>{currentIncident.atendidoPor}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2" style={{ borderTop: '1px solid #d1d5db' }}>
              <div>
                <h3 className="text-sm font-medium mb-1" style={{ color: '#666666' }}>Creado</h3>
                <p className="text-sm" style={{ color: '#333333' }}>{formatDate(currentIncident.creadoEn)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1" style={{ color: '#666666' }}>Última actualización</h3>
                <p className="text-sm" style={{ color: '#333333' }}>{formatDate(currentIncident.actualizadoEn)}</p>
              </div>
            </div>
          </div>

          {/* Formulario para agregar comentario */}
          <div className="pt-6" style={{ borderTop: '1px solid #d1d5db' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#4a5a40' }}>Agregar Comentario</h3>
            <form onSubmit={handleAgregarComentario} className="space-y-3">
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Escribe un comentario sobre este incidente..."
                rows={3}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  borderColor: '#d1d5db',
                  backgroundColor: '#ffffff',
                  color: '#333333',
                }}
                required
              />
              <Button type="submit" disabled={enviandoComentario || !comentario.trim()}>
                {enviandoComentario ? 'Enviando...' : 'Agregar comentario'}
              </Button>
            </form>
          </div>

          {/* Historial */}
          <div className="pt-6" style={{ borderTop: '1px solid #d1d5db' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#4a5a40' }}>Historial</h3>
            {loadingHistorial ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : (
              <IncidentTimeline historial={historial} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

