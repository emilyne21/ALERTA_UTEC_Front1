import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Constantes de configuración desde variables de entorno
const API_URL = import.meta.env.VITE_API_URL;
const WS_URL = import.meta.env.VITE_WS_URL;

// Clave para el token en localStorage (debe coincidir con AuthContext)
const STORAGE_KEY_TOKEN = 'alerta_utec_token';

// Crear instancia de Axios configurada
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// Interceptor de solicitudes: añade automáticamente el token JWT si existe
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtener el token del localStorage
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    
    // Si existe un token, añadirlo al header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    // Manejar errores de la solicitud
    return Promise.reject(error);
  }
);

// Interceptor de respuestas: maneja errores comunes
apiClient.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, simplemente la retornamos
    return response;
  },
  (error: AxiosError) => {
    // Manejar errores de respuesta
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      const status = error.response.status;
      
      // Si el token es inválido o expiró, limpiar el localStorage
      if (status === 401) {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem('alerta_utec_user');
        // Opcional: redirigir al login
        // window.location.href = '/login';
      }
      
      // Extraer mensaje de error del servidor si está disponible
      const errorMessage = (error.response.data as any)?.message || 
                          error.message || 
                          `Error HTTP ${status}: ${error.response.statusText}`;
      
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      return Promise.reject(
        new Error('No se pudo conectar con el servidor. Verifica que la API esté disponible y que VITE_API_URL esté correctamente configurada.')
      );
    } else {
      // Algo pasó al configurar la solicitud
      return Promise.reject(error);
    }
  }
);

// Exportar la instancia configurada y las constantes
export default apiClient;
export { API_URL, WS_URL };

// Mantener compatibilidad con código existente que use apiFetch
export interface ApiOptions extends RequestInit {
  token?: string | null;
}

/**
 * @deprecated Usa apiClient directamente en su lugar.
 * Esta función se mantiene solo para compatibilidad con código existente.
 */
export async function apiFetch(
  path: string,
  options: ApiOptions = {}
): Promise<Response> {
  if (!API_URL || API_URL.includes('tu-api')) {
    throw new Error('VITE_API_URL no está configurada. Por favor, crea un archivo .env con la URL de la API.');
  }
  
  const { token, ...fetchOptions } = options;
  
  const url = `${API_URL}${path}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: `Error HTTP ${response.status}: ${response.statusText}` 
      }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica que la API esté disponible y que VITE_API_URL esté correctamente configurada.');
    }
    throw error;
  }
}
