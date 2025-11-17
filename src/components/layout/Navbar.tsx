import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { useNavigate, Link } from 'react-router-dom';
import alertaImage from '../../assets/alerta.png';

interface NavbarProps {
  onToggleSidebar: () => void;
  sidebarVisible: boolean;
}

export function Navbar({ onToggleSidebar, sidebarVisible }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = () => 'Estudiante';

  return (
    <nav style={{ backgroundColor: '#adcc9c', borderBottom: '1px solid #7d9670' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg transition-all hover:scale-105 active:scale-95"
              style={{ 
                backgroundColor: sidebarVisible ? '#4a5a40' : '#7d9670',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
              aria-label={sidebarVisible ? 'Ocultar sidebar' : 'Mostrar sidebar'}
              title={sidebarVisible ? 'Ocultar menú lateral' : 'Mostrar menú lateral'}
            >
              <svg
                className="w-6 h-6"
                style={{ color: '#ffffff' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {sidebarVisible ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <img 
                src={alertaImage} 
                alt="AlertaUTEC Logo" 
                className="h-8 w-auto"
              />
              <h1 className="text-2xl font-bold" style={{ color: '#4a5a40' }}>AlertaUTEC</h1>
            </div>
          </div>
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <Link 
                    to="/perfil" 
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    {/* Avatar con inicial */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                      style={{ 
                        backgroundColor: '#4a5a40', 
                        color: '#ffffff',
                      }}
                    >
                      {user.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm" style={{ color: '#4a5a40' }}>
                      <span className="font-medium">{user.nombre}</span>
                    </div>
                  </Link>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium border"
                    style={{ backgroundColor: '#4a5a40', color: '#ffffff', borderColor: '#4a5a40' }}
                  >
                    {getRoleLabel()}
                  </span>
                  <Button variant="secondary" onClick={handleLogout}>
                    Cerrar sesión
                  </Button>
                </>
              )}
            </div>
        </div>
      </div>
    </nav>
  );
}
