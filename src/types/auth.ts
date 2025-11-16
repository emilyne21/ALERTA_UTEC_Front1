export type Rol = 'usuario' | 'trabajador' | 'supervisor';

export interface Usuario {
  email: string;
  rol: Rol;
  nombre: string;
  apellido?: string;
  codigo?: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  loginAs: (role: Rol) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Usuario) => void;
  setAuth: (token: string, user: Usuario) => void;
  isAuthenticated: boolean;
}

