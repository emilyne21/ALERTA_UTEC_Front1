import { useState } from 'react';
import { IncidentStatusBadge } from '../components/incidents/IncidentStatusBadge';
import { useAuth } from '../hooks/useAuth';
import { useIncidentes } from '../hooks/useIncidentes';
import { Loader } from '../components/common/Loader';

export function HistorialPage() {
  const { token } = useAuth();
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  
  // Usar el hook para cargar incidentes del backend
  const filters = filtroEstado === 'todos' ? {} : { estado: filtroEstado as any };
  const { incidentes, loading, error } = useIncidentes(token, filters);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const getUrgenciaColor = (urgencia: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      baja: { bg: '#e5e7eb', text: '#374151', border: '#d1d5db' },
      media: { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' },
      alta: { bg: '#fed7aa', text: '#9a3412', border: '#fb923c' },
    };
    return colors[urgencia] || colors.baja;
  };

  const incidentesOrdenados = [...incidentes].sort((a, b) => b.creadoEn - a.creadoEn);

  if (loading) {
    return (
      <div className="relative">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#4a5a40' }}>Historial de Incidentes</h1>
          <p style={{ color: '#4a5a40' }}>Revisa los incidentes que se han resuelto anteriormente</p>
        </div>
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#4a5a40' }}>Historial de Incidentes</h1>
          <p style={{ color: '#4a5a40' }}>Revisa los incidentes que se han resuelto anteriormente</p>
        </div>
        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)' }}>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#4a5a40' }}>Historial de Incidentes</h1>
        <p style={{ color: '#4a5a40' }}>Revisa los incidentes que se han resuelto anteriormente</p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setFiltroEstado('todos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filtroEstado === 'todos' ? 'text-white' : ''
          }`}
          style={filtroEstado === 'todos' 
            ? { backgroundColor: '#4a5a40' }
            : { backgroundColor: '#f3f4f6', color: '#4a5a40' }
          }
        >
          Todos
        </button>
        <button
          onClick={() => setFiltroEstado('pendiente')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filtroEstado === 'pendiente' ? 'text-white' : ''
          }`}
          style={filtroEstado === 'pendiente' 
            ? { backgroundColor: '#4a5a40' }
            : { backgroundColor: '#f3f4f6', color: '#4a5a40' }
          }
        >
          Pendientes
        </button>
        <button
          onClick={() => setFiltroEstado('en_atencion')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filtroEstado === 'en_atencion' ? 'text-white' : ''
          }`}
          style={filtroEstado === 'en_atencion' 
            ? { backgroundColor: '#7d9670' }
            : { backgroundColor: '#f3f4f6', color: '#4a5a40' }
          }
        >
          En Atención
        </button>
        <button
          onClick={() => setFiltroEstado('resuelto')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filtroEstado === 'resuelto' ? 'text-white' : ''
          }`}
          style={filtroEstado === 'resuelto' 
            ? { backgroundColor: '#adcc9c' }
            : { backgroundColor: '#f3f4f6', color: '#4a5a40' }
          }
        >
          Resueltos
        </button>
      </div>

      {/* Lista de incidentes */}
      {incidentesOrdenados.length === 0 ? (
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
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#333333' }}>
            No hay incidentes {filtroEstado !== 'todos' ? 'con este estado' : ''}
          </h3>
          <p className="text-sm" style={{ color: '#666666' }}>
            {filtroEstado !== 'todos' 
              ? 'Intenta cambiar el filtro para ver más incidentes.'
              : 'Aún no hay incidentes en el historial.'}
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm mb-4" style={{ color: '#666666' }}>
            Mostrando {incidentesOrdenados.length} incidente{incidentesOrdenados.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-4">
            {incidentesOrdenados.map((incidente) => {
              const urgenciaColor = getUrgenciaColor(incidente.urgencia);
              return (
                <div
                  key={incidente.id}
                  className="rounded-xl p-5 transition-all"
                  style={{
                    backgroundColor: '#ffffff',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <IncidentStatusBadge estado={incidente.estado} />
                        <span className="text-sm font-medium capitalize" style={{ color: '#333333' }}>
                          {getTipoLabel(incidente.tipo)}
                        </span>
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-medium border"
                          style={{
                            backgroundColor: urgenciaColor.bg,
                            color: urgenciaColor.text,
                            borderColor: urgenciaColor.border,
                          }}
                        >
                          {incidente.urgencia.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-2 text-lg" style={{ color: '#333333' }}>
                        {incidente.ubicacion}
                      </h3>
                      <p className="text-sm mb-3" style={{ color: '#666666' }}>
                        {incidente.descripcion}
                      </p>
                      <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: '#666666' }}>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDate(incidente.creadoEn)}
                        </span>
                        {incidente.atendidoPor && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Atendido por: {incidente.atendidoPor.split('@')[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

