# Calculadora Hídrica Frontend

Aplicación web basada en React para calcular la huella hídrica mediante encuestas y cuestionarios interactivos. Sistema completo con autenticación, gestión de usuarios y panel de administración.

## 🚀 Características

- **Sistema de autenticación completo**
  - Registro de usuarios
  - Inicio de sesión con JWT
  - Recuperación de contraseña por correo electrónico
  - Restablecimiento de contraseña con token seguro

- **Cuestionario interactivo de huella hídrica**
  - Preguntas dinámicas cargadas desde el backend
  - Cálculo en tiempo real del nivel hídrico
  - Visualización con termómetro interactivo
  - Guardado automático de respuestas

- **Panel de administración**
  - Gestión completa de usuarios (CRUD)
  - Estadísticas detalladas de respuestas
  - Control de acceso basado en roles
  - Paginación y búsqueda de usuarios

- **Sistema de roles**
  - Usuarios regulares: acceso al cuestionario
  - Administradores: acceso completo al panel de administración

- **Diseño responsive**
  - Interfaz moderna y profesional
  - Compatible con dispositivos móviles y tablets
  - Navegación intuitiva

## 🛠️ Stack Tecnológico

- **React 19** - Biblioteca de UI
- **React Router v7** - Enrutamiento
- **Vite 7** - Build tool y dev server
- **ESLint** - Linter para calidad de código
- **CSS Modules** - Estilos modulares
- **Context API** - Gestión de estado global (autenticación)

## 📋 Prerrequisitos

- Node.js (versión LTS recomendada)
- npm o yarn
- Backend de la aplicación ejecutándose (ver [INTEGRACION_BACKEND.md](frontend-hidrico/INTEGRACION_BACKEND.md))

## 💻 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/Emi-22/Calculadora-Hidrica-Front.git
```

2. Navega al directorio del proyecto:
```bash
cd frontend-hidrico
```

3. Instala las dependencias:
```bash
npm install
```

4. Configura las variables de entorno (ver sección [Configuración de Variables de Entorno](#-configuración-de-variables-de-entorno) para más detalles)

5. Inicia el servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🚀 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo con hot reload
- `npm run build` - Construye la aplicación para producción (genera la carpeta `dist/`)
- `npm run lint` - Ejecuta ESLint para verificar la calidad del código
- `npm run preview` - Previsualiza la build de producción localmente

### 🚀 Despliegue a Producción

1. **Construye la aplicación:**
   ```bash
   npm run build
   ```

2. **La carpeta `dist/` contiene los archivos estáticos listos para producción**

3. **Configura las variables de entorno en tu plataforma de hosting:**
   - `VITE_API_BASE_URL` - URL de tu backend en producción
   - `VITE_API_TIMEOUT` - Timeout para las peticiones (opcional)

4. **Sirve los archivos estáticos** usando cualquier servidor web (Nginx, Apache, Vercel, Netlify, etc.)

## 🌐 Estructura del Proyecto

```
frontend-hidrico/
├── src/
│   ├── components/
│   │   ├── ProtectedRoute.jsx          # Componente para proteger rutas
│   │   └── ProtectedRoute.module.css
│   ├── context/
│   │   └── AuthContext.jsx              # Contexto de autenticación
│   ├── pages/
│   │   ├── LoginPage.jsx                # Página de inicio de sesión
│   │   ├── RegistroPage.jsx            # Página de registro
│   │   ├── PreguntasPage.jsx            # Cuestionario de huella hídrica
│   │   ├── EstadisticasPage.jsx         # Panel de estadísticas (admin)
│   │   ├── UsuariosPage.jsx             # Gestión de usuarios (admin)
│   │   ├── RecuperarPasswordPage.jsx    # Solicitar recuperación
│   │   └── ResetPasswordPage.jsx        # Restablecer contraseña
│   ├── services/
│   │   └── apiClient.js                 # Cliente API centralizado
│   ├── assets/
│   │   └── logo-itl.png                 # Logo institucional
│   ├── App.jsx                          # Componente principal con navegación
│   ├── App.module.css                   # Estilos modulares del componente principal
│   ├── main.jsx                         # Punto de entrada de la aplicación
│   └── index.css                        # Estilos globales
├── public/
│   └── vite.svg
├── .env                                 # Variables de entorno (crear)
├── vite.config.js                       # Configuración de Vite
├── package.json
├── INTEGRACION_BACKEND.md              # Documentación de integración
└── DOCUMENTACION_PANEL_ADMIN.md        # Documentación del panel admin
```

## 📱 Rutas

### Públicas
- `/` - Página de registro (redirige si ya estás logueado)
- `/registro` - Registro de nuevos usuarios
- `/login` - Inicio de sesión
- `/recuperar` - Solicitar recuperación de contraseña
- `/reset-password?token=...` - Restablecer contraseña con token

### Protegidas (requieren autenticación)
- `/preguntas` - Cuestionario de huella hídrica

### Solo Administradores
- `/estadisticas` - Panel de estadísticas de respuestas
- `/usuarios` - Gestión de usuarios (CRUD completo)

## ⚙️ Configuración de Variables de Entorno

El proyecto utiliza variables de entorno para configurar la conexión con el backend. Crea un archivo `.env` en la raíz de `frontend-hidrico/` (al mismo nivel que `package.json`):

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT=10000
```

### Variables Disponibles

- **`VITE_API_BASE_URL`** (requerida)
  - URL base del backend API
  - **Desarrollo:** `http://localhost:5000/api`
  - **Producción:** Cambia a la URL de tu servidor de producción (ej: `https://api.tudominio.com/api`)
  - **Nota:** En desarrollo, el proxy de Vite redirige automáticamente las peticiones a `/api` al backend configurado en `vite.config.js`

- **`VITE_API_TIMEOUT`** (opcional)
  - Tiempo máximo de espera para las peticiones HTTP en milisegundos
  - **Valor por defecto:** `10000` (10 segundos)
  - Ajusta según las necesidades de tu backend

### Importante

- ⚠️ **Nunca subas el archivo `.env` al repositorio** (debe estar en `.gitignore`)
- 🔒 En producción, configura estas variables en tu plataforma de hosting
- 📝 El prefijo `VITE_` es necesario para que Vite exponga estas variables al código del frontend

### Ejemplo para Producción

```env
VITE_API_BASE_URL=https://api.tudominio.com/api
VITE_API_TIMEOUT=15000
```

## 🔐 Autenticación y Autorización

El sistema utiliza JWT (JSON Web Tokens) para la autenticación:

- Los tokens se almacenan en `localStorage`
- Se envían automáticamente en las peticiones al backend
- El sistema redirige automáticamente al login si el token expira
- Las rutas protegidas verifican el rol del usuario antes de permitir el acceso

## 🔌 Integración con Backend

La aplicación se comunica con un backend REST API. Para más detalles sobre la integración, consulta:
- [INTEGRACION_BACKEND.md](frontend-hidrico/INTEGRACION_BACKEND.md) - Guía completa de integración
- [DOCUMENTACION_PANEL_ADMIN.md](frontend-hidrico/DOCUMENTACION_PANEL_ADMIN.md) - Documentación del panel de administración

### Configuración del Proxy

**⚠️ Importante:** El proxy de Vite solo funciona en desarrollo. En producción:

1. **Opción 1 (Recomendada):** Configura `VITE_API_BASE_URL` en tu `.env` de producción con la URL completa de tu backend
2. **Opción 2:** Configura un proxy reverso en tu servidor web (Nginx, Apache, etc.) para redirigir `/api` a tu backend

En desarrollo, Vite está configurado para redirigir automáticamente las peticiones a `/api` al backend en `http://localhost:5000`. Ver `vite.config.js` para más detalles.

## 🎨 Características de UI/UX

- **Diseño moderno y profesional** con gradientes y animaciones suaves
- **Feedback visual** en todas las acciones del usuario
- **Estados de carga** claramente indicados
- **Manejo de errores** con mensajes descriptivos
- **Validación de formularios** en tiempo real
- **Responsive design** para todos los dispositivos

## 📚 Documentación Adicional

- **INTEGRACION_BACKEND.md** - Guía completa de integración con el backend, endpoints disponibles y configuración
- **DOCUMENTACION_PANEL_ADMIN.md** - Documentación detallada del panel de administración, arquitectura y funcionalidades

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request