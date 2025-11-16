import apiClient from './apiClient';
import type { LoginResponse } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL;

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  codigo?: string; // Opcional, no se envía al backend
  password: string;
}

/**
 * Realiza el login con el backend
 * @param email Correo electrónico del usuario
 * @param password Contraseña del usuario
 * @returns Respuesta con el token y datos del usuario
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  // Verificar que la API esté configurada
  if (!API_URL || API_URL.includes('tu-api')) {
    throw new Error('Backend no configurado. Verifica que VITE_API_URL esté configurada en el archivo .env');
  }

  try {
    // Usar apiClient (Axios) para hacer la petición
    // Nota: No necesitamos añadir el token aquí porque el login no requiere autenticación
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    return response.data;
  } catch (error: any) {
    // Si el error ya tiene un mensaje, lanzarlo directamente
    if (error.message) {
      throw error;
    }
    
    // Si no, crear un mensaje de error genérico
    throw new Error('Error al iniciar sesión. Verifica tus credenciales e intenta nuevamente.');
  }
}

/**
 * Registra un nuevo usuario en el backend
 * @param registerData Datos del usuario a registrar
 * @returns Respuesta con el token y datos del usuario
 */
export async function register(registerData: RegisterRequest): Promise<LoginResponse> {
  // Verificar que la API esté configurada
  if (!API_URL || API_URL.includes('tu-api')) {
    throw new Error('Backend no configurado. Verifica que VITE_API_URL esté configurada en el archivo .env');
  }

  try {
    // Usar apiClient (Axios) para hacer la petición
    // Nota: No necesitamos añadir el token aquí porque el registro no requiere autenticación
    
    // Combinar nombre y apellido en un solo campo "nombre"
    const nombreCompleto = registerData.apellido
      ? `${registerData.nombre.trim()} ${registerData.apellido.trim()}`.trim()
      : registerData.nombre.trim();
    
    // Construir el payload con solo los campos requeridos
    const payload: {
      email: string;
      password: string;
      nombre: string;
      rol: string;
    } = {
      email: registerData.email.trim(),
      password: registerData.password,
      nombre: nombreCompleto,
      rol: 'usuario', // Rol fijo para todos los registros
    };
    
    const response = await apiClient.post<LoginResponse>('/auth/register', payload);

    return response.data;
  } catch (error: any) {
    // Si el error ya tiene un mensaje, lanzarlo directamente
    if (error.message) {
      throw error;
    }
    
    // Si no, crear un mensaje de error genérico
    throw new Error('Error al registrarse. Verifica tus datos e intenta nuevamente.');
  }
}
