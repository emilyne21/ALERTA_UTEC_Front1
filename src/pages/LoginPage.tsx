import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import alertaImage from '../assets/alerta.png';
import googleLogo from '../assets/google_logo.png';
import { INTRANET_URL } from '../config/constants';
import { UserGuideModal } from '../components/common/UserGuideModal';
import { PrivacyPolicyModal } from '../components/common/PrivacyPolicyModal';
import { getUserByEmail } from '../utils/userStorage';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const USE_BACKEND = API_URL && !API_URL.includes('tu-api');

      // Solo verificar localmente si NO estamos usando el backend
      if (!USE_BACKEND) {
        const user = getUserByEmail(email);
        if (!user) {
          setError('Esta cuenta no está registrada. Por favor, regístrate primero.');
          setLoading(false);
          return;
        }
      }

      // Intentar iniciar sesión (con backend si está configurado, o modo mock)
      await login(email, password);
      navigate('/inicio', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-white">
      <div className="flex">
        {/* Sidebar Izquierda - 35% */}
        <aside className="hidden lg:flex lg:w-[35%] bg-[#3d4934] text-[#f0f0f0] p-10 flex-col min-h-screen">
          <header className="flex justify-between items-center mb-8">
            <Link to="/" className="flex items-center gap-3 -ml-10">
              <img src={alertaImage} alt="Alerta" className="w-12 h-12" />
              <div className="text-2xl font-bold">AlertaUTEC</div>
            </Link>
          </header>

          <div className="mt-20 flex-1">
            <h1 className="text-5xl leading-tight font-geometric font-thin mb-4 tracking-tight">
              Bienvenido
              <br />
              <span className="text-[#b7d9a8] font-normal">de vuelta</span>
            </h1>
            <p className="text-lg text-[#c0c0c0] mt-4">
              Inicia sesión para acceder a tu cuenta y gestionar tus incidentes.
            </p>
          </div>
        </aside>

        {/* Contenido Principal - 65% */}
        <main className="w-full lg:w-[65%] p-10 flex flex-col bg-white flex-1">
          {/* Logo para mobile */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-3">
              <img src={alertaImage} alt="Alerta" className="w-12 h-12" />
              <div className="text-2xl font-bold text-slate-900">AlertaUTEC</div>
            </Link>
          </div>

          {/* Formulario de login */}
          <div className="max-w-md mx-auto w-full mt-20">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Iniciar sesión</h2>
              <p className="text-slate-600">Ingresa tus credenciales para acceder</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Correo institucional
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@utec.edu.pe"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-slate-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-slate-900"
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="font-medium">{error}</p>
                      {error.includes('no está registrada') && (
                        <Link to="/register" className="mt-2 inline-block text-red-800 hover:text-red-900 underline font-medium text-sm">
                          Ir a registrarse
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                className="w-full bg-[#3d4934] hover:bg-[#4a5a40] text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>

            {/* Separador */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">O</span>
              </div>
            </div>

            {/* Botón de Google */}
            <button
              type="button"
              onClick={() => {
                // TODO: Implementar autenticación con Google
                console.log('Iniciar sesión con Google');
              }}
              className="w-full flex items-center justify-center gap-3 border border-slate-300 hover:border-slate-400 bg-white text-slate-700 px-4 py-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
            >
              <img src={googleLogo} alt="Google" className="w-5 h-5" />
              Iniciar sesión con Google
            </button>

            {/* Botones de acceso rápido para demo */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                ¿No tienes una cuenta?{' '}
                <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Regístrate
                </Link>
              </p>
            </div>
          </div>

            {/* Espaciado adicional para que el footer esté más abajo */}
            <div className="h-48"></div>
        </main>
      </div>

      {/* Pie de página */}
      <footer className="w-full bg-slate-800 border-t border-slate-700 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Columna 1 - Información general */}
            <div>
              <h3 className="font-semibold text-slate-100 mb-4">AlertaUTEC</h3>
              <p className="text-sm text-slate-400">
                Sistema de gestión de incidentes para la comunidad UTEC.
              </p>
            </div>

            {/* Columna 2 - Soporte */}
            <div>
              <h3 className="font-semibold text-slate-100 mb-4">Soporte</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href={INTRANET_URL} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">Centro de ayuda</a></li>
                <li><button onClick={() => setIsGuideOpen(true)} className="hover:text-emerald-400 transition-colors text-left text-slate-400 text-sm">Guía de usuario</button></li>
                <li><button onClick={() => setIsPrivacyOpen(true)} className="hover:text-emerald-400 transition-colors text-left text-slate-400 text-sm">Política de privacidad</button></li>
              </ul>
            </div>

            {/* Columna 3 - Contacto */}
            <div>
              <h3 className="font-semibold text-slate-100 mb-4">Contacto</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Email: soporte@alerta.utec.edu.pe</li>
                <li>Teléfono: (01) 123-4567</li>
                <li>Dirección: Campus UTEC</li>
                <li className="pt-2">
                  <a href="https://www.instagram.com/utecuniversidad/?hl=es-la" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">Instagram</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Línea divisoria y copyright */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
              <p>© 2024 AlertaUTEC. Todos los derechos reservados.</p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-emerald-400 transition-colors">Términos de servicio</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">Política de privacidad</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <UserGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
}
