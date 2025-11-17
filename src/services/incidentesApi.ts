import apiClient from './apiClient';
import type { Incidente, HistorialItem, IncidenteFilters } from '../types/incidentes';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Lista todos los incidentes con filtros opcionales
 * @param filters Filtros opcionales (estado, tipo, urgencia)
 * @param token Token JWT (se añade automáticamente por el interceptor de apiClient)
 * @returns Lista de incidentes
 */
export async function listarIncidentes(
  filters: IncidenteFilters = {},
  _token: string
): Promise<Incidente[]> {
  if (!API_URL || API_URL.includes('tu-api')) {
    throw new Error('Backend no configurado. Usando modo mock.');
  }

  try {
    // Construir query params
    const params = new URLSearchParams();
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.tipo) params.append('tipo', filters.tipo);
    if (filters.urgencia) params.append('urgencia', filters.urgencia);

    const queryString = params.toString();
    const path = queryString ? `/incidentes?${queryString}` : '/incidentes';

    // Usar apiClient que ya tiene el interceptor de JWT configurado
    const response = await apiClient.get<Incidente[]>(path);

    return response.data;
  } catch (error: any) {
    // Si el error ya tiene un mensaje, lanzarlo directamente
    if (error.message) {
      throw error;
    }
    
    // Si no, crear un mensaje de error genérico
    throw new Error('Error al cargar los incidentes. Intenta nuevamente.');
  }
}

/**
 * Crea un nuevo reporte de incidente
 * @param data Datos del incidente a crear
 * @param token Token JWT (se añade automáticamente por el interceptor de apiClient)
 * @returns El incidente creado
 */
export async function crearIncidente(
  data: {
    tipo: string;
    ubicacion: string;
    descripcion: string;
    urgencia: string;
  },
  _token: string
): Promise<Incidente> {
  if (!API_URL || API_URL.includes('tu-api')) {
    throw new Error('Backend no configurado. Usando modo mock.');
  }

  try {
    // Usar apiClient que ya tiene el interceptor de JWT configurado
    // El token se añade automáticamente, pero lo pasamos por compatibilidad
    const response = await apiClient.post<Incidente>('/incidentes', {
      tipo: data.tipo,
      ubicacion: data.ubicacion,
      descripcion: data.descripcion,
      urgencia: data.urgencia,
    });

    return response.data;
  } catch (error: any) {
    // Si el error ya tiene un mensaje, lanzarlo directamente
    if (error.message) {
      throw error;
    }
    
    // Si no, crear un mensaje de error genérico
    throw new Error('Error al crear el incidente. Verifica tus datos e intenta nuevamente.');
  }
}

export async function asignarIncidente(id: string, token: string): Promise<Incidente> {
  if (!API_URL || API_URL.includes('tu-api')) {
    throw new Error('Backend no configurado. Usando modo mock.');
  }

  const response = await fetch(`${API_URL}/incidentes/${id}/asignar`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function resolverIncidente(id: string, token: string): Promise<Incidente> {
  if (!API_URL || API_URL.includes('tu-api')) {
    throw new Error('Backend no configurado. Usando modo mock.');
  }

  const response = await fetch(`${API_URL}/incidentes/${id}/resolver`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Obtiene el historial de un incidente específico
 * @param id ID del incidente
 * @param token Token JWT (se añade automáticamente por el interceptor de apiClient)
 * @returns Lista de items del historial
 */
export async function obtenerHistorial(
  id: string,
  _token: string
): Promise<HistorialItem[]> {
  if (!id) {
    throw new Error('ID de incidente no proporcionado');
  }

  if (!API_URL || API_URL.includes('tu-api')) {
    throw new Error('Backend no configurado. Usando modo mock.');
  }

  try {
    // Usar apiClient que ya tiene el interceptor de JWT configurado
    const response = await apiClient.get<HistorialItem[]>(`/incidentes/${id}/historial`);

    return response.data;
  } catch (error: any) {
    // Si el error ya tiene un mensaje, lanzarlo directamente
    if (error.message) {
      throw error;
    }
    
    // Si no, crear un mensaje de error genérico
    throw new Error('Error al cargar el historial. Intenta nuevamente.');
  }
}
