
# AlertaUTEC Frontend - Guía de Funcionamiento

Esta documentación describe la operatividad y el flujo de uso de la interfaz de usuario para el sistema de gestión de incidentes de UTEC (Dashboard de Estudiante).

## 1. Módulos Principales

La aplicación se divide en dos grandes áreas funcionales: **Autenticación** y **Gestión de Incidentes**.

### 🔐 Autenticación y Sesión
El sistema gestiona el acceso y la persistencia de usuarios mediante las siguientes funciones:
* **Registro de Usuarios:** Permite crear nuevas cuentas que se almacenan localmente (localStorage) para simular la persistencia.
* **Inicio de Sesión (Login):** Verificación de credenciales con acceso rápido mediante formulario.
* **Persistencia:** La sesión se mantiene activa incluso si se recarga la página gracias al guardado en almacenamiento local.
* **Protección de Rutas:** El sistema verifica la sesión antes de permitir el acceso al Dashboard.

### 📊 Dashboard del Estudiante
Es la vista principal donde se centraliza la información:
* **Tarjetas de Resumen (Summary Cards):** Contadores en tiempo real que muestran el estado de los incidentes:
    * 🔴 Pendientes
    * 🟡 En atención
    * 🟢 Resueltos
* **Lista de Incidentes:**
    * **Vista de Escritorio:** Tabla detallada ordenada por los eventos más recientes.
    * **Vista Móvil:** Tarjetas adaptables (responsive) para facilitar la lectura en dispositivos pequeños.

## 2. Gestión de Incidentes

El núcleo funcional permite a los usuarios interactuar con los reportes de la siguiente manera:

### 📝 Crear Incidente
* Se accede a través de un botón dedicado que abre un **Modal con formulario**.
* **Campos requeridos:** Tipo de incidente, ubicación, descripción y nivel de urgencia.
* **Optimistic UI:** Al enviar el formulario, el incidente aparece *inmediatamente* en la lista para dar una sensación de fluidez, mientras se confirma en segundo plano.

### 🔍 Detalle e Historial
Al hacer clic en cualquier incidente de la lista:
* **Panel Lateral:** Se despliega un panel con la información completa del reporte sin salir de la pantalla actual.
* **Línea de Tiempo (Timeline):** Visualización cronológica de todos los cambios de estado y actualizaciones del incidente.
* **Comentarios:** Los usuarios pueden agregar comentarios directamente en el historial del incidente para aportar más contexto.

## 3. Conectividad en Tiempo Real

El frontend está diseñado para mantener la información siempre actualizada:
* **Sincronización WebSocket:** La interfaz escucha cambios cada 8-15 segundos (simulado o real según conexión) para reflejar actualizaciones de otros usuarios sin necesidad de recargar la página.
* **Indicadores de Estado:**
    * **Toasts/Notificaciones:** Alertas visuales emergentes que confirman acciones (creación exitosa, error de conexión, etc.).
    * **Monitor de Conexión:** Un indicador visual muestra si la conexión con el servidor (WebSocket) está activa y cuándo fue la última sincronización.


