# Documentación: Panel de Administración de Usuarios

## 📋 Resumen de Implementación

Se ha creado un sistema completo de panel de administración con acceso restringido solo para usuarios con rol de administrador. El sistema incluye autenticación, autorización y gestión completa de usuarios (CRUD).

---

## 🏗️ Arquitectura y Componentes Creados

### 1. **Sistema de Autenticación** (`src/context/AuthContext.jsx`)

**Propósito:** Gestionar el estado global de autenticación de la aplicación.

**Funcionalidades:**
- Almacena el usuario autenticado en el estado
- Persiste la sesión en `localStorage`
- Verifica si el usuario tiene rol de administrador
- Proporciona funciones `login()` y `logout()`
- Expone un hook personalizado `useAuth()` para acceder al contexto

**Estructura del objeto usuario:**
```javascript
{
  id: number,
  usuario: string,
  correo: string,
  rol: 'administrador' | 'usuario'
}
```

---

### 2. **Componente de Ruta Protegida** (`src/components/ProtectedRoute.jsx`)

**Propósito:** Proteger rutas que requieren autenticación y/o permisos de administrador.

**Funcionalidades:**
- Verifica si el usuario está autenticado
- Verifica si el usuario tiene rol de administrador (cuando `requireAdmin={true}`)
- Redirige a `/login` si no hay sesión
- Muestra mensaje de acceso denegado si no tiene permisos
- Maneja estados de carga durante la verificación

**Uso:**
```jsx
<ProtectedRoute requireAdmin={true}>
  <UsuariosPage />
</ProtectedRoute>
```

---

### 3. **Panel de Administración** (`src/pages/UsuariosPage.jsx`)

**Propósito:** Interfaz completa para gestionar usuarios del sistema.

#### Funcionalidades Implementadas:

**a) Visualización de Usuarios:**
- Tabla con información completa de usuarios
- Columnas: ID, Usuario, Correo, Rol, Sexo, Nivel Educativo, Fecha Registro, Acciones
- Badges de colores para identificar roles (rojo para administrador, teal para usuario)

**b) Búsqueda y Filtrado:**
- Búsqueda en tiempo real por nombre de usuario o correo electrónico
- Filtro por rol (Todos, Administradores, Usuarios)

**c) Operaciones CRUD:**

1. **Crear Usuario:**
   - Modal con formulario completo
   - Campos: usuario, correo, contraseña, rol, sexo, nivel educativo
   - Validación de campos requeridos
   - Validación de formato de correo
   - Validación de longitud de contraseña (mínimo 8 caracteres)

2. **Editar Usuario:**
   - Modal prellenado con datos del usuario
   - Permite modificar todos los campos excepto ID
   - La contraseña es opcional (solo se actualiza si se proporciona)

3. **Eliminar Usuario:**
   - Confirmación antes de eliminar
   - Protección: no permite eliminar el propio usuario
   - Actualización inmediata de la lista

**d) Validaciones:**
- Validación de correo electrónico (formato)
- Validación de campos requeridos
- Validación de longitud de contraseña
- Mensajes de error específicos por campo

**e) Feedback al Usuario:**
- Mensajes de éxito/error
- Estados de carga
- Animaciones suaves

---

### 4. **Integración con el Sistema Existente**

**Archivos Modificados:**

- **`src/main.jsx`**: 
  - Envuelto con `AuthProvider` para proveer el contexto
  - Ruta `/usuarios` protegida con `ProtectedRoute`

- **`src/App.jsx`**: 
  - Muestra enlace "Usuarios" solo si el usuario es administrador
  - Muestra información del usuario autenticado
  - Botón de cerrar sesión

- **`src/pages/LoginPage.jsx`**: 
  - Integrado con `AuthContext`
  - Autentica usuarios desde `localStorage`
  - Credenciales por defecto: `admin@example.com` / `admin123`
  - Redirige según el rol del usuario

- **`src/pages/RegistroPage.jsx`**: 
  - Guarda nuevos usuarios en `localStorage`
  - Verifica duplicados (correo/usuario)
  - Asigna rol "usuario" por defecto

---

## 🔌 Integración con Backend

### Estado Actual (Frontend con localStorage)

Actualmente, el sistema utiliza `localStorage` para simular un backend. Los datos se almacenan localmente en el navegador.

### Cómo Migrar a Backend Real

#### 1. **Configuración de API**

Crear un archivo de configuración para las llamadas al backend:

```javascript
// src/services/api.js
const API_BASE_URL = 'http://tu-backend.com/api';

export const api = {
  // Autenticación
  login: async (correo, contrasena) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena })
    });
    return response.json();
  },

  // Usuarios
  getUsuarios: async (token) => {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  createUsuario: async (usuario, token) => {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(usuario)
    });
    return response.json();
  },

  updateUsuario: async (id, usuario, token) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(usuario)
    });
    return response.json();
  },

  deleteUsuario: async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};
```

#### 2. **Actualizar AuthContext**

```javascript
// src/context/AuthContext.jsx
import { api } from '../services/api';

// En la función login:
const login = async (correo, contrasena) => {
  try {
    const response = await api.login(correo, contrasena);
    if (response.success) {
      const userData = {
        id: response.user.id,
        usuario: response.user.usuario,
        correo: response.user.correo,
        rol: response.user.rol,
        token: response.token // Guardar token JWT
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', response.token);
      return { success: true };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

#### 3. **Actualizar UsuariosPage**

Reemplazar las funciones que usan `localStorage`:

```javascript
// src/pages/UsuariosPage.jsx
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function UsuariosPage() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  const loadUsuarios = async () => {
    setIsLoading(true);
    try {
      const response = await api.getUsuarios(token);
      if (response.success) {
        setUsuarios(response.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al cargar usuarios' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      let response;
      if (modalMode === 'create') {
        response = await api.createUsuario(formData, token);
      } else {
        response = await api.updateUsuario(selectedUsuario.id, formData, token);
      }

      if (response.success) {
        setMessage({ type: 'success', text: response.message });
        await loadUsuarios(); // Recargar lista
        setShowModal(false);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleDelete = async (usuario) => {
    if (window.confirm(`¿Eliminar usuario "${usuario.usuario}"?`)) {
      try {
        const response = await api.deleteUsuario(usuario.id, token);
        if (response.success) {
          setMessage({ type: 'success', text: 'Usuario eliminado' });
          await loadUsuarios();
        }
      } catch (error) {
        setMessage({ type: 'error', text: error.message });
      }
    }
  };
}
```

#### 4. **Endpoints del Backend Requeridos**

El backend debe implementar los siguientes endpoints:

**Autenticación:**
- `POST /api/auth/login`
  - Body: `{ correo: string, contrasena: string }`
  - Response: `{ success: boolean, user: {...}, token: string }`

**Usuarios (requieren autenticación JWT):**
- `GET /api/usuarios`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: boolean, data: Usuario[] }`

- `POST /api/usuarios`
  - Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
  - Body: `{ usuario, correo, contrasena, rol, sexo, nivelEducativo }`
  - Response: `{ success: boolean, message: string, data: Usuario }`

- `PUT /api/usuarios/:id`
  - Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
  - Body: `{ usuario, correo, contrasena?, rol, sexo, nivelEducativo }`
  - Response: `{ success: boolean, message: string, data: Usuario }`

- `DELETE /api/usuarios/:id`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: boolean, message: string }`

#### 5. **Middleware de Autenticación en Backend**

El backend debe verificar:
- Token JWT válido en cada petición
- Rol de administrador para acceder a `/api/usuarios`
- Validación de permisos (no permitir eliminar el propio usuario)

**Ejemplo (Node.js/Express):**
```javascript
// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No autorizado' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Token inválido' });
    req.user = user;
    next();
  });
};

// Middleware de autorización (solo admin)
const requireAdmin = (req, res, next) => {
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ success: false, message: 'Acceso denegado' });
  }
  next();
};

// Rutas protegidas
app.get('/api/usuarios', authenticateToken, requireAdmin, getUsuarios);
app.post('/api/usuarios', authenticateToken, requireAdmin, createUsuario);
app.put('/api/usuarios/:id', authenticateToken, requireAdmin, updateUsuario);
app.delete('/api/usuarios/:id', authenticateToken, requireAdmin, deleteUsuario);
```

---

## 🔐 Seguridad

### Consideraciones de Seguridad:

1. **Tokens JWT:** Almacenar tokens de forma segura (considerar `httpOnly` cookies)
2. **Validación Backend:** Nunca confiar solo en validación del frontend
3. **Hashing de Contraseñas:** El backend debe hashear contraseñas (bcrypt, argon2)
4. **HTTPS:** Usar HTTPS en producción
5. **CORS:** Configurar CORS correctamente en el backend
6. **Rate Limiting:** Implementar límites de peticiones

---

## 📝 Estructura de Datos

### Modelo de Usuario:
```typescript
interface Usuario {
  id: number;
  usuario: string;
  correo: string;
  contrasena?: string; // Solo en creación/actualización, nunca en respuestas
  rol: 'administrador' | 'usuario';
  sexo?: 'masculino' | 'femenino' | 'otro';
  nivelEducativo?: 'secundaria' | 'preparatoria' | 'universitario' | 'posgrado';
  fechaRegistro: string; // ISO 8601
}
```

---

## 🎨 Estilos y UI

- Diseño responsive (móvil y desktop)
- Colores consistentes con el tema de la aplicación
- Animaciones suaves para mejor UX
- Contraste adecuado para accesibilidad
- Tabla con hover effects
- Modal con overlay
- Mensajes de feedback claros

---

## 🚀 Próximos Pasos para Integración

1. Crear servicio de API (`src/services/api.js`)
2. Reemplazar llamadas a `localStorage` por llamadas a API
3. Implementar manejo de errores de red
4. Agregar interceptor para refrescar tokens
5. Implementar logout automático en caso de token expirado
6. Agregar tests unitarios

---

## 📞 Soporte

Para cualquier duda sobre la implementación o integración con el backend, revisar los comentarios en el código o consultar esta documentación.

