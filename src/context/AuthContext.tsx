import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AuthContextType, Usuario, Rol } from '../types/auth';
import { mockUsuarios, mockTokens } from '../mocks/usuarios';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_TOKEN = 'alerta_utec_token';
const STORAGE_KEY_USER = 'alerta_utec_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Recuperar del localStorage al montar
    const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEY_USER);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error al recuperar datos de autenticación:', error);
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    }
  }, []);

  const loginAs = async (role: Rol) => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const usuario = mockUsuarios[role];
    const tokenValue = mockTokens[role];
    
    if (!usuario || !tokenValue) {
      throw new Error(`Rol ${role} no válido`);
    }

    setToken(tokenValue);
    setUser(usuario);
    localStorage.setItem(STORAGE_KEY_TOKEN, tokenValue);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(usuario));
  };

  const login = async (email: string, password: string) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const USE_BACKEND = API_URL && !API_URL.includes('tu-api');

    if (USE_BACKEND) {
      // Intentar login con el backend
      try {
        const { login: loginApi } = await import('../services/authApi');
        const response = await loginApi(email, password);

        // Guardar token y usuario del backend
        setToken(response.token);
        setUser(response.usuario);
        localStorage.setItem(STORAGE_KEY_TOKEN, response.token);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(response.usuario));
        return;
      } catch (error) {
        // Si el backend falla, lanzar el error para que se muestre al usuario
        throw error;
      }
    }

    // Modo mock: verificar si el usuario está registrado localmente
    const { verifyUser, convertToUsuario } = await import('../utils/userStorage');
    const registeredUser = verifyUser(email, password);
    
    if (!registeredUser) {
      throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
    }

    const usuario = convertToUsuario(registeredUser);
    const tokenValue = `mock-token-${email}-${Date.now()}`;

    setToken(tokenValue);
    setUser(usuario);
    localStorage.setItem(STORAGE_KEY_TOKEN, tokenValue);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(usuario));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  const updateUser = (updatedUser: Usuario) => {
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
  };

  const setAuth = (tokenValue: string, usuario: Usuario) => {
    setToken(tokenValue);
    setUser(usuario);
    localStorage.setItem(STORAGE_KEY_TOKEN, tokenValue);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(usuario));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loginAs,
        login,
        logout,
        updateUser,
        setAuth,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
