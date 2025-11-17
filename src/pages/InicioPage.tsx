import { useAuth } from '../hooks/useAuth';
import { useIncidentes } from '../hooks/useIncidentes';
import comegalletasImg from '../assets/comegalletas-Photoroom.png';
import hojasIcon from '../assets/hojas.png';
import relojIcon from '../assets/reloj.png';

export function InicioPage() {
  const { user, token } = useAuth();
  const { incidentes } = useIncidentes(token || '', {});

  return (
    <div className="relative">
      {/* Banner de bienvenida */}
      <div 
        className="rounded-2xl p-8 md:p-12 mb-8 relative"
        style={{ 
          backgroundColor: '#adcc9c',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
          overflow: 'visible',
        }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          {/* Texto de bienvenida */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: '#4a5a40' }}>
              Hola, <span style={{ fontStyle: 'italic', fontWeight: 'bold' }}>{user?.nombre || 'Usuario'}</span>
            </h1>
            <p className="text-lg md:text-xl" style={{ color: '#4a5a40' }}>
              ¿Listo para gestionar tus incidentes hoy?
            </p>
          </div>
        </div>

        {/* Imagen del comegalletas sobrepuesta */}
        <div 
          className="absolute bottom-0 right-0"
          style={{ 
            width: '300px', 
            height: '200px',
            transform: 'translateX(20px)',
            zIndex: 20,
          }}
        >
          <img 
            src={comegalletasImg} 
            alt="Comegalletas" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Incidentes reportados hoy */}
        <div 
          className="rounded-xl p-6 flex items-center gap-4"
          style={{ 
            backgroundColor: '#C8D9E6',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#567C8D' }}
          >
            <svg className="w-6 h-6" style={{ color: '#ffffff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1" style={{ color: '#2F4156' }}>
              {incidentes.filter(inc => {
                const hoy = new Date();
                const fechaIncidente = new Date(inc.creadoEn * 1000);
                return fechaIncidente.toDateString() === hoy.toDateString();
              }).length}
            </div>
            <div className="text-sm" style={{ color: '#2F4156' }}>
              Reportados hoy
            </div>
          </div>
        </div>

        {/* Incidentes pendientes */}
        <div 
          className="rounded-xl p-6 flex items-center gap-4"
          style={{ 
            backgroundColor: '#F5EFEB',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#567C8D' }}
          >
            <svg className="w-6 h-6" style={{ color: '#ffffff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1" style={{ color: '#2F4156' }}>
              {incidentes.filter(inc => inc.estado === 'pendiente').length}
            </div>
            <div className="text-sm" style={{ color: '#2F4156' }}>
              Pendientes
            </div>
          </div>
        </div>

        {/* Incidentes completados */}
        <div 
          className="rounded-xl p-6 flex items-center gap-4"
          style={{ 
            backgroundColor: '#C8D9E6',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#2F4156' }}
          >
            <svg className="w-6 h-6" style={{ color: '#ffffff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1" style={{ color: '#2F4156' }}>
              {incidentes.filter(inc => inc.estado === 'resuelto').length}
            </div>
            <div className="text-sm" style={{ color: '#2F4156' }}>
              Completados
            </div>
          </div>
        </div>
      </div>

      {/* Sección de información adicional */}
      <div className="grid grid-cols-1 gap-6">
        <div 
          className="rounded-xl p-6"
          style={{ 
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={hojasIcon} 
              alt="Mis Incidentes" 
              className="w-10 h-10"
            />
            <h2 className="text-xl font-semibold" style={{ color: '#4a5a40' }}>
              Mis Incidentes
            </h2>
          </div>
          <p className="text-sm" style={{ color: '#666666' }}>
            Revisa y gestiona todos los incidentes que has reportado. Puedes ver su estado, agregar comentarios y comunicarte con el trabajador asignado.
          </p>
        </div>

        <div 
          className="rounded-xl p-6"
          style={{ 
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={relojIcon} 
              alt="Historial" 
              className="w-10 h-10"
            />
            <h2 className="text-xl font-semibold" style={{ color: '#4a5a40' }}>
              Historial
            </h2>
          </div>
          <p className="text-sm" style={{ color: '#666666' }}>
            Consulta el historial completo de incidentes resueltos anteriormente para tener un registro de todas las soluciones.
          </p>
        </div>
      </div>
    </div>
  );
}

