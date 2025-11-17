import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { updateRegisteredUser } from '../utils/userStorage';
import type { Usuario } from '../types/auth';
import comegalletasPerfilImg from '../assets/comegalletas_perfil-Photoroom.png';

export function EditProfilePage() {
  const { user, login, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    codigo: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      // Si el nombre contiene espacio, separarlo en nombre y apellido
      const nombreCompleto = user.nombre || '';
      const partes = nombreCompleto.split(' ');
      const nombre = partes[0] || '';
      const apellido = partes.slice(1).join(' ') || user.apellido || '';
      
      setFormData({
        nombre: nombre,
        apellido: apellido,
        email: user.email || '',
        codigo: user.codigo || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // Validaciones
      if (!formData.nombre.trim()) {
        setError('El nombre es requerido');
        setLoading(false);
        return;
      }

      if (!formData.apellido.trim()) {
        setError('El apellido es requerido');
        setLoading(false);
        return;
      }

      if (!formData.email.trim()) {
        setError('El correo es requerido');
        setLoading(false);
        return;
      }

      if (!formData.email.includes('@utec.edu.pe')) {
        setError('Debes usar un correo institucional de UTEC');
        setLoading(false);
        return;
      }

        if (!formData.codigo.trim()) {
          setError('El código de estudiante es requerido');
          setLoading(false);
          return;
        }

        // Validar que el código tenga exactamente 9 dígitos
        const codigoLimpio = formData.codigo.trim().replace(/\D/g, ''); // Solo números
        if (codigoLimpio.length !== 9) {
          setError('El código de estudiante debe tener exactamente 9 dígitos');
          setLoading(false);
          return;
        }

        // Actualizar el usuario en localStorage (usar código limpio con solo números)
        const updatedUser = updateRegisteredUser(user?.email || '', {
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          email: formData.email.trim(),
          codigo: codigoLimpio,
        });

      if (!updatedUser) {
        setError('Error al actualizar el perfil');
        setLoading(false);
        return;
      }

      // Actualizar el usuario en el contexto
      if (formData.email !== user?.email) {
        // Si el email cambió, necesitamos hacer login con el nuevo email
        await login(formData.email, updatedUser.password);
      } else {
        // Si el email no cambió, solo actualizar el usuario en el contexto
        const codigoLimpioParaContexto = formData.codigo.trim().replace(/\D/g, ''); // Solo números
        const updatedUserData: Usuario = {
          ...user!,
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          codigo: codigoLimpioParaContexto,
          email: formData.email.trim(),
        };
        updateUser(updatedUserData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/inicio');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto relative">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#4a5a40' }}>
          Editar Perfil
        </h1>
        <p style={{ color: '#666666' }}>
          Actualiza tu información personal
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div 
          className="rounded-xl p-6 mb-6 relative"
          style={{ 
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            overflow: 'visible',
          }}
        >
          {error && (
            <div 
              className="mb-4 p-3 rounded-lg"
              style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5' }}
            >
              <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>{error}</p>
            </div>
          )}

          {success && (
            <div 
              className="mb-4 p-3 rounded-lg"
              style={{ backgroundColor: '#d1fae5', border: '1px solid #86efac' }}
            >
              <p className="text-sm font-semibold" style={{ color: '#059669' }}>
                Perfil actualizado exitosamente
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label 
                htmlFor="nombre" 
                className="block text-sm font-medium mb-2"
                style={{ color: '#4a5a40' }}
              >
                Nombre
              </label>
              <Input
                id="nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Ingresa tu nombre"
              />
            </div>

            <div>
              <label 
                htmlFor="apellido" 
                className="block text-sm font-medium mb-2"
                style={{ color: '#4a5a40' }}
              >
                Apellido
              </label>
              <Input
                id="apellido"
                name="apellido"
                type="text"
                value={formData.apellido}
                onChange={handleChange}
                required
                placeholder="Ingresa tu apellido"
              />
            </div>

            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium mb-2"
                style={{ color: '#4a5a40' }}
              >
                Correo Electrónico
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu.correo@utec.edu.pe"
              />
            </div>

            <div>
              <label 
                htmlFor="codigo" 
                className="block text-sm font-medium mb-2"
                style={{ color: '#4a5a40' }}
              >
                Código de Estudiante
              </label>
              <Input
                id="codigo"
                name="codigo"
                type="text"
                value={formData.codigo}
                onChange={(e) => {
                  // Solo permitir números
                  const valor = e.target.value.replace(/\D/g, '');
                  if (valor.length <= 9) {
                    handleChange({ ...e, target: { ...e.target, value: valor } });
                  }
                }}
                required
                placeholder="202012345 (9 dígitos)"
                maxLength={9}
              />
              <p className="text-xs text-slate-500 mt-1">
                Debe tener exactamente 9 dígitos numéricos
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/inicio')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>

        {/* Imagen del comegalletas sobrepuesta */}
        <div 
          className="absolute bottom-0 right-0 hidden lg:block"
          style={{ 
            width: '300px', 
            height: '300px',
            transform: 'translateX(40px)',
            zIndex: 20,
          }}
        >
          <img 
            src={comegalletasPerfilImg} 
            alt="Comegalletas" 
            className="w-full h-full object-contain"
          />
        </div>
      </form>
    </div>
  );
}

