import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { InicioPage } from '../pages/InicioPage';
import { UsuarioDashboard } from '../pages/UsuarioDashboard';
import { HistorialPage } from '../pages/HistorialPage';
import { EditProfilePage } from '../pages/EditProfilePage';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { RoleGuard } from '../components/common/RoleGuard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/inicio',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['usuario']}>
          <AppLayout>
            <InicioPage />
          </AppLayout>
        </RoleGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/usuario',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['usuario']}>
          <AppLayout>
            <UsuarioDashboard />
          </AppLayout>
        </RoleGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/historial',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['usuario']}>
          <AppLayout>
            <HistorialPage />
          </AppLayout>
        </RoleGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: '/perfil',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['usuario']}>
          <AppLayout>
            <EditProfilePage />
          </AppLayout>
        </RoleGuard>
      </ProtectedRoute>
    ),
  },
]);

