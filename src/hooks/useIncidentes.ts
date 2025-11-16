import { useState, useEffect, useCallback, useRef } from 'react';
import type { Incidente, IncidenteFilters, HistorialItem, ChatMessage } from '../types/incidentes';
import { crearIncidente as crearIncidenteApi, listarIncidentes as listarIncidentesApi } from '../services/incidentesApi';

// Estado global en memoria (solo para modo mock)
let incidentesEnMemoria: Incidente[] = [];
let historialEnMemoria: Record<string, HistorialItem[]> = {};
let mensajesEnMemoria: Record<string, ChatMessage[]> = {};

// Función para simular delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useIncidentes(token: string | null, filters: IncidenteFilters = {}) {
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const [loading, setLoading] = useState(true); // Iniciar en true para la primera carga
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const lastTokenRef = useRef<string | null>(null);

  // Cargar incidentes solo una vez al montar o cuando cambia el token
  useEffect(() => {
    if (!token) {
      setLoading(false);
      setIncidentes([]);
      hasLoadedRef.current = false;
      lastTokenRef.current = null;
      return;
    }

    // Si el token no cambió y ya se cargó, no hacer nada
    if (hasLoadedRef.current && lastTokenRef.current === token) {
      return;
    }

    // Resetear si cambió el token
    if (lastTokenRef.current !== token) {
      hasLoadedRef.current = false;
      lastTokenRef.current = token;
    }

    // Solo cargar si no se ha cargado antes
    if (hasLoadedRef.current) return;

    setLoading(true);
    setError(null);
    
    const loadData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const USE_BACKEND = API_URL && !API_URL.includes('tu-api');

        if (USE_BACKEND) {
          // Cargar incidentes del backend
          const incidentes = await listarIncidentesApi(filters, token);
          setIncidentes(incidentes);
        } else {
          // Modo mock: usar datos en memoria
          await delay(300);
          
          let filtered = [...incidentesEnMemoria];
          
          if (filters.estado) {
            filtered = filtered.filter(inc => inc.estado === filters.estado);
          }
          if (filters.tipo) {
            filtered = filtered.filter(inc => inc.tipo === filters.tipo);
          }
          if (filters.urgencia) {
            filtered = filtered.filter(inc => inc.urgencia === filters.urgencia);
          }
          
          setIncidentes(filtered);
        }
        
        hasLoadedRef.current = true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar incidentes');
        hasLoadedRef.current = true;
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]); // Solo cargar cuando cambia el token

  const cargarIncidentes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const USE_BACKEND = API_URL && !API_URL.includes('tu-api');

      if (USE_BACKEND) {
        // Cargar incidentes del backend
        const incidentes = await listarIncidentesApi(filters, token);
        setIncidentes(incidentes);
      } else {
        // Modo mock: usar datos en memoria
        await delay(300);
        let filtered = [...incidentesEnMemoria];
        
        if (filters.estado) {
          filtered = filtered.filter(inc => inc.estado === filters.estado);
        }
        if (filters.tipo) {
          filtered = filtered.filter(inc => inc.tipo === filters.tipo);
        }
        if (filters.urgencia) {
          filtered = filtered.filter(inc => inc.urgencia === filters.urgencia);
        }
        
        setIncidentes(filtered);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar incidentes');
    } finally {
      setLoading(false);
    }
  }, [token, filters.estado, filters.tipo, filters.urgencia]);

  const crearIncidente = async (data: {
    tipo: string;
    ubicacion: string;
    descripcion: string;
    urgencia: string;
  }) => {
    if (!token) throw new Error('No hay token de autenticación');

    const API_URL = import.meta.env.VITE_API_URL;
    const USE_BACKEND = API_URL && !API_URL.includes('tu-api');

    try {
      if (USE_BACKEND) {
        // Crear incidente con el backend
        const nuevo = await crearIncidenteApi(data, token);
        
        // Actualizar el estado local con el incidente creado
        setIncidentes((prev) => [nuevo, ...prev]);
        return nuevo;
      } else {
        // Modo mock: crear en memoria
        await delay(400);
        
        const userStr = localStorage.getItem('alerta_utec_user');
        const user = userStr ? JSON.parse(userStr) : null;
        
        const nuevo: Incidente = {
          id: `mock_${Date.now()}`,
          estado: 'pendiente',
          reportadoPor: user?.email || 'estudiante@utec.edu.pe',
          creadoEn: Math.floor(Date.now() / 1000),
          actualizadoEn: Math.floor(Date.now() / 1000),
          tipo: data.tipo as any,
          ubicacion: data.ubicacion,
          descripcion: data.descripcion,
          urgencia: data.urgencia as any,
          atendidoPor: null,
        };
        
        incidentesEnMemoria.unshift(nuevo);
        
        // Agregar al historial
        historialEnMemoria[nuevo.id] = [{
          timestamp: nuevo.creadoEn,
          accion: 'CREADO',
          realizadoPor: nuevo.reportadoPor,
          detalles: 'Incidente creado con estado pendiente',
        }];
        
        setIncidentes((prev) => [nuevo, ...prev]);
        return nuevo;
      }
    } catch (err) {
      throw err;
    }
  };

  const asignarIncidente = async (id: string) => {
    if (!token) throw new Error('No hay token de autenticación');

    try {
      await delay(300);
      
      const userStr = localStorage.getItem('alerta_utec_user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      const incidente = incidentesEnMemoria.find(inc => inc.id === id);
      if (!incidente) throw new Error('Incidente no encontrado');
      
      incidente.estado = 'en_atencion';
      incidente.atendidoPor = user?.email || 'trabajador@utec.edu.pe';
      incidente.actualizadoEn = Math.floor(Date.now() / 1000);
      
      // Agregar al historial
      if (!historialEnMemoria[id]) historialEnMemoria[id] = [];
      historialEnMemoria[id].push({
        timestamp: incidente.actualizadoEn,
        accion: 'ASIGNADO',
        realizadoPor: incidente.atendidoPor,
        detalles: `Incidente asignado a ${incidente.atendidoPor}`,
      });
      
      setIncidentes((prev) =>
        prev.map((inc) => (inc.id === id ? { ...incidente } : inc))
      );
      return { ...incidente };
    } catch (err) {
      throw err;
    }
  };

  const resolverIncidente = async (id: string) => {
    if (!token) throw new Error('No hay token de autenticación');

    try {
      await delay(300);
      
      const userStr = localStorage.getItem('alerta_utec_user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      const incidente = incidentesEnMemoria.find(inc => inc.id === id);
      if (!incidente) throw new Error('Incidente no encontrado');
      
      incidente.estado = 'resuelto';
      incidente.actualizadoEn = Math.floor(Date.now() / 1000);
      
      // Agregar al historial
      if (!historialEnMemoria[id]) historialEnMemoria[id] = [];
      historialEnMemoria[id].push({
        timestamp: incidente.actualizadoEn,
        accion: 'RESUELTO',
        realizadoPor: user?.email || incidente.atendidoPor || 'trabajador@utec.edu.pe',
        detalles: 'Incidente resuelto exitosamente',
      });
      
      setIncidentes((prev) =>
        prev.map((inc) => (inc.id === id ? { ...incidente } : inc))
      );
      return { ...incidente };
    } catch (err) {
      throw err;
    }
  };

  const obtenerHistorial = async (id: string): Promise<HistorialItem[]> => {
    await delay(200);
    return historialEnMemoria[id] || [];
  };

  const agregarComentario = async (id: string, comentario: string): Promise<void> => {
    if (!token) throw new Error('No hay token de autenticación');

    await delay(300);

    const userStr = localStorage.getItem('alerta_utec_user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!historialEnMemoria[id]) historialEnMemoria[id] = [];
    historialEnMemoria[id].push({
      timestamp: Math.floor(Date.now() / 1000),
      accion: 'COMENTARIO',
      realizadoPor: user?.email || 'usuario@utec.edu.pe',
      detalles: comentario,
    });

    // Actualizar el incidente
    const incidente = incidentesEnMemoria.find(inc => inc.id === id);
    if (incidente) {
      incidente.actualizadoEn = Math.floor(Date.now() / 1000);
      setIncidentes((prev) =>
        prev.map((inc) => (inc.id === id ? { ...incidente } : inc))
      );
    }

    // Recargar historial si está abierto
    return Promise.resolve();
  };

  const actualizarIncidente = (incidenteActualizado: Incidente) => {
    const index = incidentesEnMemoria.findIndex(inc => inc.id === incidenteActualizado.id);
    if (index !== -1) {
      incidentesEnMemoria[index] = incidenteActualizado;
      setIncidentes((prev) =>
        prev.map((inc) => (inc.id === incidenteActualizado.id ? incidenteActualizado : inc))
      );
    }
  };

    const obtenerMensajes = useCallback(async (incidenteId: string): Promise<ChatMessage[]> => {
      await delay(200);
      return mensajesEnMemoria[incidenteId] || [];
    }, []);

    const enviarMensaje = useCallback(async (incidenteId: string, mensaje: string): Promise<void> => {
      if (!token) throw new Error('No hay token de autenticación');

      await delay(300);

      const userStr = localStorage.getItem('alerta_utec_user');
      const user = userStr ? JSON.parse(userStr) : null;

      const nuevoMensaje: ChatMessage = {
        id: `msg_${Date.now()}`,
        incidenteId,
        enviadoPor: user?.email || 'usuario@utec.edu.pe',
        mensaje,
        timestamp: Math.floor(Date.now() / 1000),
        leido: false,
      };

      if (!mensajesEnMemoria[incidenteId]) {
        mensajesEnMemoria[incidenteId] = [];
      }
      mensajesEnMemoria[incidenteId].push(nuevoMensaje);

      // Simular respuesta automática del trabajador después de 2-4 segundos
      setTimeout(() => {
        const incidente = incidentesEnMemoria.find(inc => inc.id === incidenteId);
        if (incidente && incidente.atendidoPor) {
          const respuestas = [
            'Entendido, voy a revisar el incidente.',
            'Gracias por la información, lo estoy atendiendo.',
            'Perfecto, ya estoy trabajando en ello.',
            'Recibido, te mantendré informado del progreso.',
          ];
          const respuestaAleatoria = respuestas[Math.floor(Math.random() * respuestas.length)];

          const respuesta: ChatMessage = {
            id: `msg_${Date.now()}_auto`,
            incidenteId,
            enviadoPor: incidente.atendidoPor,
            mensaje: respuestaAleatoria,
            timestamp: Math.floor(Date.now() / 1000),
            leido: false,
          };

          if (!mensajesEnMemoria[incidenteId]) {
            mensajesEnMemoria[incidenteId] = [];
          }
          mensajesEnMemoria[incidenteId].push(respuesta);
        }
      }, Math.random() * 2000 + 2000); // Entre 2 y 4 segundos

      return Promise.resolve();
    }, [token]);

    return {
      incidentes,
      loading,
      error,
      cargarIncidentes,
      crearIncidente,
      asignarIncidente,
      resolverIncidente,
      obtenerHistorial,
      agregarComentario,
      actualizarIncidente,
      obtenerMensajes,
      enviarMensaje,
    };
  }
