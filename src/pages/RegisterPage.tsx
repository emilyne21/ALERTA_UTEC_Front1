import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import alertaImage from '../assets/alerta.png';
import { INTRANET_URL } from '../config/constants';
import { UserGuideModal } from '../components/common/UserGuideModal';
import { PrivacyPolicyModal } from '../components/common/PrivacyPolicyModal';
import { saveRegisteredUser } from '../utils/userStorage';
import { register as registerApi } from '../services/authApi';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones básicas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!formData.email.includes('@utec.edu.pe')) {
      setError('Debes usar un correo institucional de UTEC');
      return;
    }

    setLoading(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const USE_BACKEND = API_URL && !API_URL.includes('tu-api');

      if (USE_BACKEND) {
        // Registrar con el backend
        await registerApi({
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          email: formData.email.trim(),
          codigo: '',
          password: formData.password,
        });

        // Después del registro exitoso, redirigir a la página de login
        navigate('/login', { replace: true });
      } else {
        // Modo mock: guardar en localStorage
        saveRegisteredUser({
          email: formData.email.trim(),
          password: formData.password,
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          codigo: '',
        });
        
        // Redirigir a la página de login
        navigate('/login', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
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
            <div className="flex items-center gap-3 -ml-10">
              <img src={alertaImage} alt="Alerta" className="w-12 h-12" />
              <div className="text-2xl font-bold">AlertaUTEC</div>
            </div>
          </header>

          <div className="mt-20 flex-1">
            <h1 className="text-5xl leading-tight font-geometric font-thin mb-4 tracking-tight">
              Únete a la
              <br />
              <span className="text-[#b7d9a8] font-normal">Comunidad</span>
            </h1>
            <p className="text-lg text-[#c0c0c0] mt-4">
              Crea tu cuenta y comienza a reportar incidentes de manera rápida y sencilla.
            </p>
          </div>
        </aside>

      {/* Contenido Principal - 65% */}
      <main className="w-full lg:w-[65%] p-10 flex flex-col bg-white flex-1">
          {/* Logo para mobile */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <img src={alertaImage} alt="Alerta" className="w-12 h-12" />
              <div className="text-2xl font-bold text-slate-900">AlertaUTEC</div>
            </div>
          </div>

          {/* Formulario de registro */}
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Crear cuenta</h2>
              <p className="text-slate-600">Completa tus datos para registrarte</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-slate-900"
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-slate-900"
                    placeholder="Pérez"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Correo institucional
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-slate-900"
                  placeholder="usuario@utec.edu.pe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-slate-900"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-slate-900"
                  placeholder="Repite tu contraseña"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#3d4934] hover:bg-[#4a5a40] text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Inicia sesión
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

