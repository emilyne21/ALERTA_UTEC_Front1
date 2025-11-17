import { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useIncidentes } from '../hooks/useIncidentes';
import { IncidentTable } from '../components/incidents/IncidentTable';
import { IncidentFilters } from '../components/incidents/IncidentFilters';
import { IncidentDetailPage } from './IncidentDetailPage';
import { Loader } from '../components/common/Loader';
import type { Incidente, IncidenteFilters } from '../types/incidentes';

export function SupervisorDashboard() {
  const { token } = useAuth();
  const [filters, setFilters] = useState<IncidenteFilters>({});
  const { incidentes, loading, error, obtenerHistorial } = useIncidentes(token || '', filters);
  const [selectedIncident, setSelectedIncident] = useState<Incidente | null>(null);

  // Calcular estadísticas
  const estadisticas = useMemo(() => {
    const porEstado = {
      pendiente: incidentes.filter((inc) => inc.estado === 'pendiente').length,
      en_atencion: incidentes.filter((inc) => inc.estado === 'en_atencion').length,
      resuelto: incidentes.filter((inc) => inc.estado === 'resuelto').length,
    };

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const delDia = incidentes.filter(
      (inc) => new Date(inc.creadoEn * 1000) >= hoy
    ).length;

    // Esta semana
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    const estaSemana = incidentes.filter(
      (inc) => new Date(inc.creadoEn * 1000) >= inicioSemana
    ).length;

    // Tiempo medio de resolución (simulado)
    const resueltos = incidentes.filter(inc => inc.estado === 'resuelto');
    const tiemposResolucion = resueltos.map(inc => inc.actualizadoEn - inc.creadoEn);
    const tiempoMedio = tiemposResolucion.length > 0
      ? Math.round(tiemposResolucion.reduce((a, b) => a + b, 0) / tiemposResolucion.length / 3600)
      : 0;

    // Incidentes por tipo
    const porTipo: Record<string, number> = {};
    incidentes.forEach((inc) => {
      porTipo[inc.tipo] = (porTipo[inc.tipo] || 0) + 1;
    });

    // Incidentes por urgencia
    const porUrgencia: Record<string, number> = {};
    incidentes.forEach((inc) => {
      porUrgencia[inc.urgencia] = (porUrgencia[inc.urgencia] || 0) + 1;
    });

    return { porEstado, delDia, estaSemana, tiempoMedio, porTipo, porUrgencia };
  }, [incidentes]);

  if (selectedIncident) {
    return (
      <IncidentDetailPage
        incidente={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        obtenerHistorial={obtenerHistorial}
      />
    );
  }

  const maxTipo = Math.max(...Object.values(estadisticas.porTipo), 1);
  const maxUrgencia = Math.max(...Object.values(estadisticas.porUrgencia), 1);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-100 mb-2">
        Tablero General de Incidentes
      </h1>
      <p className="text-slate-400 mb-6">Vista global y análisis de todos los incidentes</p>

      <IncidentFilters filters={filters} onChange={setFilters} />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-medium text-slate-400 mb-1">Incidentes Totales (Hoy)</h3>
          <p className="text-2xl font-bold text-emerald-400">{estadisticas.delDia}</p>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-medium text-slate-400 mb-1">Pendientes Actuales</h3>
          <p className="text-2xl font-bold text-yellow-400">{estadisticas.porEstado.pendiente}</p>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-medium text-slate-400 mb-1">Tiempo Medio Resolución</h3>
          <p className="text-2xl font-bold text-blue-400">{estadisticas.tiempoMedio}h</p>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-medium text-slate-400 mb-1">Esta Semana</h3>
          <p className="text-2xl font-bold text-purple-400">{estadisticas.estaSemana}</p>
        </div>
      </div>

      {/* Analítica Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Incidentes por Tipo */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Incidentes por Tipo</h3>
          <div className="space-y-3">
            {Object.entries(estadisticas.porTipo).map(([tipo, count]) => (
              <div key={tipo}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-300 capitalize">{tipo}</span>
                  <span className="text-sm font-medium text-slate-100">{count}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${(count / maxTipo) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incidentes por Urgencia */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Incidentes por Urgencia</h3>
          <div className="space-y-3">
            {Object.entries(estadisticas.porUrgencia).map(([urgencia, count]) => {
              const colors: Record<string, string> = {
                baja: 'bg-slate-400',
                media: 'bg-yellow-500',
                alta: 'bg-red-500',
              };
              return (
                <div key={urgencia}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-300 capitalize">{urgencia}</span>
                    <span className="text-sm font-medium text-slate-100">{count}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className={`${colors[urgencia] || 'bg-slate-400'} h-2 rounded-full transition-all`}
                      style={{ width: `${(count / maxUrgencia) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabla de Incidentes */}
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error al cargar incidentes</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : (
        <IncidentTable
          incidentes={incidentes}
          onSelect={setSelectedIncident}
        />
      )}
    </div>
  );
}
