# AlertaUTEC Frontend - Dashboard Estudiante

Frontend completo del sistema de gestión de incidentes para UTEC, construido con tecnologías modernas y conectado al backend real mediante API REST y WebSocket.

## 🚀 Stack Tecnológico

- **Bundler**: Vite
- **Framework**: React 18
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Router**: React Router DOM
- **Estado**: Context API + Custom Hooks
- **HTTP Client**: Axios con interceptores para JWT automático
- **WebSocket**: Conexión en tiempo real para actualizaciones
- **Backend**: Conectado a API REST y WebSocket reales

## ✨ Características Implementadas

### Dashboard Estudiante
- ✅ **Summary Cards**: Contadores de incidentes por estado (Pendientes, En atención, Resueltos)
- ✅ **Lista de Incidentes**: Cards responsive (mobile) y tabla (desktop), ordenados por más recientes
- ✅ **Crear Incidente**: Modal con formulario completo (tipo, ubicación, descripción, urgencia)
- ✅ **Optimistic UI**: Los incidentes se agregan inmediatamente a la lista
- ✅ **Panel Lateral de Detalle**: Se abre al hacer clic en un incidente
- ✅ **Historial/Timeline**: Visualización completa del historial con línea de tiempo
- ✅ **Agregar Comentarios**: Los usuarios pueden agregar comentarios al historial
- ✅ **WebSocket Simulado**: Actualizaciones en tiempo real cada 8-15 segundos
- ✅ **Indicador de Conexión**: Muestra estado de conexión WS y última sincronización
- ✅ **Toasts/Notificaciones**: Feedback visual para todas las acciones
- ✅ **Estados de UI**: Loading, empty state, error state

### Autenticación
- ✅ Login con formulario + botones de acceso rápido
- ✅ Registro de nuevos usuarios (guardado en localStorage)
- ✅ Verificación de cuentas al iniciar sesión
- ✅ Persistencia de sesión en localStorage

## 📦 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+ y npm

### Pasos

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
# Crear archivo .env en la raíz del proyecto
VITE_API_URL=http://alerta-utec-alb-1269448375.us-east-1.elb.amazonaws.com
VITE_WS_URL=wss://ufs7epfg85.execute-api.us-east-1.amazonaws.com/dev
```

**Nota**: El proyecto requiere estas variables para conectarse al backend. Sin ellas, funcionará en modo mock.

3. **Ejecutar servidor de desarrollo:**
```bash
npm run dev
```

4. **Abrir en el navegador:**
```
http://localhost:5173
```

## 📖 Flujo de Uso de la Aplicación

### Flujo Principal: Registro → Login → Dashboard → Gestión de Incidentes

---

### 1. Registro de Usuario

**Objetivo**: Crear una nueva cuenta en el sistema

1. **Acceso**: 
   - Navega a la página de inicio (`/`)
   - Haz clic en "Registrarse" o ve directamente a `/register`

2. **Completar formulario**:
   - **Nombre**: Tu nombre de pila
   - **Apellido**: Tu apellido
   - **Correo institucional**: Debe terminar en `@utec.edu.pe` (requerido)
   - **Contraseña**: Mínimo 6 caracteres (requerido)
   - **Confirmar contraseña**: Debe coincidir con la contraseña

3. **Enviar registro**:
   - Haz clic en "Registrarse"
   - El sistema envía los datos al backend (`POST /auth/register`)
   - El rol se asigna automáticamente como "usuario"

4. **Resultado**:
   - Serás redirigido automáticamente a la página de login (`/login`)
   - Tu cuenta quedará registrada en el backend

**Nota**: El código de estudiante fue removido del formulario. Solo se requieren nombre, apellido, email y contraseña.

### 2. Inicio de Sesión

**Objetivo**: Autenticarse en el sistema con credenciales válidas

1. **Acceso**:
   - Ve a la página de login (`/login`)
   - O desde la página de inicio, haz clic en "Iniciar sesión"

2. **Ingresar credenciales**:
   - **Correo institucional**: Tu email registrado (debe ser `@utec.edu.pe`)
   - **Contraseña**: La contraseña que usaste al registrarte

3. **Autenticación**:
   - Haz clic en "Iniciar sesión"
   - El sistema envía las credenciales al backend (`POST /auth/login`)
   - El backend valida las credenciales y devuelve un token JWT

4. **Resultado exitoso**:
   - El token JWT se guarda automáticamente en `localStorage`
   - Tu información de usuario se guarda en el contexto de autenticación
   - Serás redirigido automáticamente al dashboard de inicio (`/inicio`)

5. **Manejo de errores**:
   - Si las credenciales son incorrectas, verás un mensaje de error
   - Si la cuenta no existe, verás un mensaje con enlace para registrarte

**Nota**: El token JWT se añade automáticamente a todas las peticiones HTTP mediante interceptores de Axios.

### 3. Dashboard de Inicio

**Objetivo**: Vista general con estadísticas y acceso rápido a funcionalidades

Al iniciar sesión, serás redirigido a `/inicio` donde verás:

- **Banner de bienvenida**: 
  - Saludo personalizado "Hola, [Tu Nombre]" usando tu nombre del perfil
  - Imagen del comegalletas sobrepuesta a la derecha
  
- **Tarjetas de estadísticas** (3 tarjetas):
  - **Reportados hoy**: Número de incidentes creados hoy
  - **Pendientes**: Total de incidentes en estado pendiente
  - **Completados**: Total de incidentes resueltos
  
- **Secciones informativas**:
  - **Mis Incidentes**: Acceso rápido con descripción
  - **Historial**: Acceso al historial de incidentes resueltos

**Nota**: Las estadísticas se cargan desde el backend usando `GET /incidentes` con filtros.

### 4. Gestión de Incidentes

#### Ver Mis Incidentes

**Objetivo**: Ver todos tus incidentes reportados y su estado actual

1. **Acceso**:
   - Haz clic en "Mis Incidentes" en el sidebar (ícono de hojas)
   - O desde la página de inicio, haz clic en la sección "Mis Incidentes"

2. **Vista de la página** (`/usuario`):
   - **Tarjetas de resumen** en la parte superior:
     - Pendientes: Incidentes sin asignar
     - En Atención: Incidentes asignados a un trabajador
     - Resueltos: Incidentes completados
     - Total: Suma de todos los incidentes
   - **Lista de incidentes** ordenados por más recientes primero
   - **Indicador de conexión WebSocket** mostrando estado en tiempo real
   - **Botón "+ Nuevo incidente"** para crear reportes

3. **Carga de datos**:
   - Los incidentes se cargan desde el backend usando `GET /incidentes`
   - El token JWT se añade automáticamente a la petición
   - Los filtros se aplican como query parameters

#### Crear un Nuevo Incidente

**Objetivo**: Reportar un nuevo problema o incidente en el campus

1. **Abrir formulario**:
   - En la página "Mis Incidentes", haz clic en el botón "+ Nuevo incidente"
   - Se mostrará un formulario modal

2. **Completar información**:
   - **Tipo** (requerido): Selecciona entre:
     - Infraestructura
     - Limpieza
     - Seguridad
     - Tecnología
     - Otro
   - **Ubicación** (requerido): Describe dónde ocurre el incidente
     - Ejemplo: "Pabellón A, Piso 3, Aula 301"
   - **Descripción** (requerido): Explica detalladamente el problema
   - **Urgencia** (requerido): Selecciona el nivel:
     - Baja
     - Media
     - Alta

3. **Enviar reporte**:
   - Haz clic en "Reportar incidente"
   - El sistema envía los datos al backend (`POST /incidentes`)
   - El token JWT se añade automáticamente
   - El backend crea el incidente y dispara notificaciones WebSocket

4. **Resultado**:
   - El incidente aparece inmediatamente en la lista (actualización optimista)
   - Recibirás un toast de confirmación
   - El formulario se oculta automáticamente
   - El incidente queda en estado "pendiente" inicialmente

#### Ver Detalles de un Incidente

**Objetivo**: Ver información completa y cronología de un incidente específico

1. **Abrir panel de detalles**:
   - Haz clic en cualquier incidente de la lista
   - Se abrirá un **panel lateral** desde la derecha

2. **Información mostrada**:
   - **Información completa** del incidente:
     - Estado actual (pendiente, en_atencion, resuelto)
     - Tipo y urgencia con badges de color
     - Ubicación y descripción completa
     - Fecha de creación y última actualización
     - Trabajador asignado (si aplica)

3. **Historial/Timeline**:
   - Se carga automáticamente desde el backend (`GET /incidentes/:id/historial`)
   - Línea de tiempo visual con todas las acciones realizadas
   - Muestra quién hizo qué y cuándo:
     - CREADO: Cuando se reportó el incidente
     - ASIGNADO: Cuando un trabajador tomó el caso
     - RESUELTO: Cuando se completó la solución
     - COMENTARIO: Comentarios agregados por usuarios o trabajadores

4. **Formulario de comentarios**:
   - Agrega comentarios adicionales al incidente
   - Los comentarios se guardan en el historial

5. **Chat** (si aplica):
   - Si hay un trabajador asignado, podrás chatear con él
   - Los mensajes se sincronizan mediante WebSocket

#### Agregar Comentarios

1. Abre el panel de detalles de un incidente
2. En la sección "Comentarios", escribe tu comentario en el textarea
3. Haz clic en "Agregar comentario"
4. **Observa**: 
   - El comentario aparece inmediatamente en el timeline
   - Se muestra quién lo agregó y cuándo
   - Recibirás un toast de confirmación

#### Cerrar el Panel de Detalles

- Haz clic en el botón "X" en la esquina superior derecha del panel
- O haz clic fuera del panel (en el overlay oscuro)

### 5. Chat con Trabajador

1. Cuando un incidente tiene un trabajador asignado, verás la sección "Mensajería" debajo de las tarjetas de resumen
2. Haz clic en el encabezado del chat para expandir/colapsar
3. **Enviar mensaje**:
   - Escribe tu mensaje en el campo de texto
   - Presiona Enter o haz clic en el botón de enviar
   - El mensaje aparece inmediatamente en el chat
4. **Recibir respuestas**:
   - El trabajador responderá automáticamente después de 2-4 segundos (simulado)
   - Los mensajes se actualizan automáticamente cada 3 segundos
   - Las respuestas aparecen en el lado izquierdo, tus mensajes en el derecho
5. **Nota**: El chat solo está disponible cuando hay un trabajador asignado al incidente

### 6. Historial de Incidentes

**Objetivo**: Ver todos los incidentes reportados con filtros por estado

1. **Acceso**:
   - Haz clic en "Historial" en el sidebar (ícono de reloj)
   - O desde la página de inicio, haz clic en la sección "Historial"

2. **Carga de datos**:
   - Los incidentes se cargan desde el backend usando `GET /incidentes`
   - Se aplican filtros según el estado seleccionado
   - El token JWT se añade automáticamente

3. **Filtros disponibles**:
   - **Todos**: Muestra todos los incidentes (sin filtro)
   - **Pendientes**: Solo incidentes en estado pendiente
   - **En Atención**: Solo incidentes asignados a trabajadores
   - **Resueltos**: Solo incidentes completados

4. **Información mostrada**:
   - Estado final con badge de color
   - Tipo y urgencia
   - Ubicación y descripción
   - Fecha de creación y última actualización
   - Trabajador que lo atendió (si aplica)

5. **Ordenamiento**:
   - Los incidentes están ordenados por más recientes primero
   - Basado en la fecha de creación (`creadoEn`)

**Nota**: Para ver el historial detallado (timeline) de un incidente específico, abre el panel de detalles desde "Mis Incidentes".

### 7. Editar Perfil

1. Haz clic en tu nombre o avatar en el navbar (esquina superior derecha)
2. Serás redirigido a la página de edición de perfil (`/perfil`)
3. Puedes actualizar:
   - **Nombre**: Tu nombre de pila
   - **Apellido**: Tu apellido
   - **Correo electrónico**: Debe ser un correo institucional de UTEC
   - **Código de estudiante**: Tu código único
4. Haz clic en "Guardar Cambios"
5. **Observa**:
   - Un mensaje de éxito aparece
   - Después de 1.5 segundos, serás redirigido automáticamente al dashboard de inicio
   - Tu sesión se mantendrá activa (no se cerrará)
   - Los cambios se reflejan inmediatamente en el navbar
6. **Cancelar**: Haz clic en "Cancelar" para volver al inicio sin guardar cambios

**Nota**: Si cambias el correo electrónico, deberás iniciar sesión nuevamente con el nuevo correo.

### 8. Navegación

#### Sidebar (Menú Lateral)

- **Toggle Sidebar**: Botón en el navbar (esquina superior izquierda) para mostrar/ocultar el sidebar
- **Enlaces disponibles**:
  - 🏠 **Inicio**: Dashboard principal con estadísticas
  - 📋 **Mis Incidentes**: Gestión completa de incidentes
  - 🕐 **Historial**: Incidentes resueltos anteriormente
- **Cookie Monster**: Aparece en la esquina inferior izquierda cuando el sidebar está visible

#### Navbar (Barra Superior)

- **Logo y nombre**: AlertaUTEC con su logo
- **Tu información**:
  - Avatar circular con inicial de tu nombre (clic para editar perfil)
  - Tu nombre completo (clic para editar perfil)
  - Badge de rol (Estudiante)
- **Cerrar sesión**: Botón para salir de la aplicación

### 9. Actualizaciones en Tiempo Real (WebSocket)

**Objetivo**: Recibir notificaciones instantáneas sobre cambios en los incidentes

1. **Conexión WebSocket**:
   - Se establece automáticamente al iniciar sesión
   - Usa la URL configurada en `VITE_WS_URL`
   - El token JWT se envía como parámetro en la URL de conexión
   - Conexión persistente durante toda la sesión

2. **Indicador de conexión**: 
   - En la página "Mis Incidentes", verás un indicador en el header
   - Punto verde pulsante = Conectado al WebSocket
   - Punto rojo = Desconectado
   - Muestra "En tiempo real" cuando está conectado
   - Muestra la última sincronización (ej: "Hace 5s")

3. **Tipos de actualizaciones recibidas**:
   - **Nuevo incidente**: Cuando se crea un incidente
   - **Actualización de incidente**: Cuando cambia el estado, se asigna, o se resuelve
   - **Nuevo comentario**: Cuando se agrega un comentario
   - **Mensajes de chat**: Mensajes del trabajador asignado

4. **Comportamiento**:
   - Las actualizaciones se reciben en tiempo real
   - Recibirás un toast/notificación cuando ocurra un cambio
   - El incidente se actualiza en la lista sin recargar la página
   - Si el panel de detalles está abierto, también se actualiza automáticamente
   - Reconexión automática si se pierde la conexión

5. **Notificaciones toast**:
   - Aparecen en la esquina superior derecha
   - Diferentes tipos: éxito (verde), error (rojo), info (azul)
   - Se ocultan automáticamente después de unos segundos

### 10. Funcionalidades Adicionales

#### Modales Informativos

- **Guía de usuario**:
  - En el footer, haz clic en "Guía de usuario"
  - Se abre un modal con instrucciones generales del sistema
  - Haz clic fuera del modal o en "Cerrar" para cerrarlo

- **Política de privacidad**:
  - En el footer, haz clic en "Política de privacidad"
  - Se abre un modal con la política de privacidad
  - Haz clic fuera del modal o en "Cerrar" para cerrarlo

#### Enlaces Externos

- **Centro de ayuda**: Redirige a la intranet de UTEC
- **Instagram**: Redirige al perfil de Instagram de UTEC

### 11. Cerrar Sesión

1. Haz clic en "Cerrar sesión" en el navbar
2. Serás redirigido automáticamente a la página de login
3. Tu sesión se cerrará completamente
4. Deberás iniciar sesión nuevamente para acceder

### 12. Responsive Design

El sistema se adapta a diferentes tamaños de pantalla:

- **Desktop**: 
  - Sidebar visible a la izquierda
  - Contenido principal a la derecha
  - Tabla de incidentes en formato de tabla

- **Tablet/Mobile**:
  - Sidebar oculto por defecto (usa el botón toggle para mostrarlo)
  - Contenido principal ocupa todo el ancho
  - Incidentes en formato de cards
  - Navegación optimizada para touch

## 🎮 Cómo Probar la Demo

### Flujo Completo Recomendado

1. **Registrarse**: Ve a `/register`, completa el formulario, verifica redirección a `/login`
2. **Iniciar Sesión**: Usa las credenciales registradas, verifica acceso al dashboard
3. **Explorar Dashboard**: Revisa las estadísticas y secciones en la página de inicio
4. **Crear Incidente**: Crea un nuevo incidente, verifica que aparece inmediatamente
5. **Abrir Panel**: Haz clic en el incidente creado, verifica que el panel se abre
6. **Agregar Comentario**: Agrega un comentario, verifica que aparece en el timeline
7. **Usar Chat**: Si hay trabajador asignado, envía un mensaje y espera respuesta
8. **Esperar WebSocket**: Espera 8-15 segundos, verifica que llega una actualización
9. **Ver Actualización**: Verifica que el estado del incidente cambia automáticamente
10. **Ver Historial**: Navega a Historial, verifica que puedes ver incidentes resueltos
11. **Editar Perfil**: Haz clic en tu nombre, actualiza tu información, verifica cambios
12. **Cerrar Sesión**: Cierra sesión y verifica que vuelves al login

## 📁 Estructura del Proyecto

```
src/
├── assets/              # Imágenes y recursos estáticos
├── components/
│   ├── common/         # Componentes reutilizables (Button, Input, Toast, etc.)
│   ├── incidents/      # Componentes específicos de incidentes
│   └── layout/         # Layout y navegación
├── config/             # Configuración (constantes, env)
├── context/            # Context API (Auth, WebSocket)
├── hooks/              # Custom hooks (useAuth, useIncidentes, etc.)
├── mocks/              # Datos mock (usuarios, incidentes)
├── pages/              # Páginas principales
├── services/           # Servicios mock (API, WebSocket)
├── types/              # TypeScript types
└── utils/              # Utilidades (userStorage, etc.)
```

## 🔧 Modificar Datos Mock

### Cambiar Incidentes Iniciales
Edita `src/mocks/incidentes.ts`:
- Modifica `mockIncidentesIniciales` para agregar/cambiar incidentes
- Modifica `mockHistorialInicial` para cambiar el historial

### Cambiar Usuarios Mock
Edita `src/mocks/usuarios.ts`:
- Modifica `mockUsuarios` para agregar/cambiar usuarios de prueba

### Ajustar WebSocket
Edita `src/services/wsMock.ts`:
- Cambia el intervalo de actualizaciones (línea ~30)
- Modifica la lógica de emisión de eventos

## 🧪 Pruebas Manuales Sugeridas

### Flujo Completo de Usuario
1. ✅ **Registrarse**: Ve a `/register`, completa el formulario, verifica redirección a `/login`
2. ✅ **Iniciar Sesión**: Usa las credenciales registradas, verifica acceso al dashboard
3. ✅ **Crear Incidente**: Crea un nuevo incidente, verifica que aparece inmediatamente
4. ✅ **Abrir Panel**: Haz clic en el incidente creado, verifica que el panel se abre
5. ✅ **Agregar Comentario**: Agrega un comentario, verifica que aparece en el timeline
6. ✅ **Esperar WebSocket**: Espera 8-15 segundos, verifica que llega una actualización
7. ✅ **Ver Actualización**: Verifica que el estado del incidente cambia automáticamente
8. ✅ **Cerrar Panel**: Cierra el panel, verifica que vuelves a la lista

### Casos Especiales
- ✅ **Empty State**: Crea una cuenta nueva, verifica el mensaje cuando no hay incidentes
- ✅ **Error Handling**: Simula un error (puedes forzar desconexión WS en el código)
- ✅ **Responsive**: Prueba en mobile y desktop, verifica que todo se adapta

## 🔌 Integración con Backend

La aplicación está **conectada al backend real** mediante:

### Configuración de Variables de Entorno

El archivo `.env` debe contener:
```env
VITE_API_URL=http://alerta-utec-alb-1269448375.us-east-1.elb.amazonaws.com
VITE_WS_URL=wss://ufs7epfg85.execute-api.us-east-1.amazonaws.com/dev
```

### Endpoints Utilizados

#### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar nuevo usuario

#### Incidentes
- `GET /incidentes` - Listar todos los incidentes (con filtros opcionales: estado, tipo, urgencia)
- `POST /incidentes` - Crear nuevo incidente
- `GET /incidentes/:id` - Obtener un incidente específico
- `GET /incidentes/:id/historial` - Obtener historial de un incidente
- `PATCH /incidentes/:id/asignar` - Asignar incidente a trabajador
- `PATCH /incidentes/:id/resolver` - Marcar incidente como resuelto

### Cliente HTTP (Axios)

- **Ubicación**: `src/services/apiClient.ts`
- **Características**:
  - Interceptor automático para añadir token JWT a todas las peticiones
  - Manejo centralizado de errores
  - Limpieza automática de token en caso de 401 (no autorizado)

### Cliente WebSocket

- **Ubicación**: `src/services/socket.ts`
- **Características**:
  - Reconexión automática
  - Envío de token JWT en la URL de conexión
  - Manejo de eventos de conexión/desconexión

### Modo Mock (Fallback)

Si las variables de entorno no están configuradas o contienen valores por defecto, la aplicación funciona en modo mock usando datos en memoria.

## 📝 Notas Técnicas

- **Optimistic UI**: Los incidentes se agregan inmediatamente a la lista antes de confirmación del servidor
- **WebSocket Real**: Conexión persistente con reconexión automática
- **Autenticación JWT**: Token almacenado en `localStorage` y añadido automáticamente a todas las peticiones
- **Interceptores Axios**: Manejo automático de autenticación y errores
- **Estado Global**: Los incidentes se mantienen en el estado de React durante la sesión
- **TypeScript**: Todo el código está tipado para mejor experiencia de desarrollo
- **Responsive Design**: Adaptado para desktop, tablet y mobile

## 🐛 Troubleshooting

**Problema**: Los incidentes no se actualizan automáticamente
- **Solución**: Verifica que el WebSocket esté conectado (indicador verde en el header)

**Problema**: No puedo iniciar sesión con cuenta registrada
- **Solución**: Verifica que el email y contraseña coincidan exactamente (case-sensitive)

**Problema**: El panel lateral no se cierra
- **Solución**: Haz clic fuera del panel o en el botón X

## 📄 Licencia

Este proyecto es parte de AlertaUTEC para UTEC.

---

**Desarrollado para hackathon** - MVP funcional con simulación completa de backend
