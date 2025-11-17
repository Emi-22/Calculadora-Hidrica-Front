# Integración con Backend

Este documento explica cómo está configurada la integración del frontend con el backend.

## 📋 Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz de `frontend-hidrico/` (al mismo nivel que `package.json`):

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT=10000
```

**Nota:** En desarrollo, el proxy de Vite redirige las peticiones a `/api` automáticamente al backend en `http://localhost:5000`. En producción, necesitarás ajustar `VITE_API_BASE_URL` a la URL real de tu backend.

### 2. Estructura del Servicio API

El servicio API está centralizado en `src/services/apiClient.js` y proporciona:

- ✅ Manejo automático de tokens JWT
- ✅ Interceptores para agregar headers de autenticación
- ✅ Manejo centralizado de errores
- ✅ Timeout configurable
- ✅ Redirección automática a login si el token expira

## 🔌 Endpoints Disponibles

### Autenticación

#### `POST /api/auth/registro`
Registra un nuevo usuario.

**Request:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "contraseña123",
  "sexo": "masculino",
  "nivel_educativo": "universitario"
}
```

**Response (201):**
```json
{
  "id": 1,
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "sexo": "masculino",
  "nivel_educativo": "universitario"
}
```

#### `POST /api/auth/login`
Inicia sesión y obtiene un token JWT.

**Request:**
```json
{
  "email": "juan@example.com",
  "password": "contraseña123"
}
```

**Response (200):**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "sexo": "masculino",
    "nivel_educativo": "universitario"
  }
}
```

### Preguntas

#### `GET /api/preguntas`
Obtiene todas las preguntas con sus opciones (no requiere autenticación).

**Response (200):**
```json
[
  {
    "id": 1,
    "codigo": "P001",
    "texto": "¿Cuántas veces te bañas al día?",
    "opciones": [
      { "id": 1, "texto": "Una vez" },
      { "id": 2, "texto": "Dos veces" }
    ]
  }
]
```

### Respuestas

#### `POST /api/respuestas` (Requiere autenticación)
Guarda las respuestas del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "opciones": [1, 3, 5, 8]
}
```

**Response (201):**
```json
{
  "message": "Respuestas guardadas exitosamente."
}
```

### Consumo

#### `POST /api/calcular-consumo`
Calcula y guarda el consumo diario.

**Request:**
```json
{
  "id_usuario": 1,
  "respuestas": null
}
```

#### `GET /api/historial/:id_usuario`
Obtiene el historial de consumo de un usuario.

## 🔐 Autenticación

El sistema usa **JWT (JSON Web Tokens)** para autenticación:

1. El usuario inicia sesión con email y password
2. El backend devuelve un token JWT
3. El token se guarda en `localStorage` junto con los datos del usuario
4. Todas las peticiones protegidas incluyen el header: `Authorization: Bearer <token>`
5. Si el token expira o es inválido, el usuario es redirigido automáticamente al login

## 📝 Uso del Servicio API

### Ejemplo: Login

```javascript
import { api } from '../services/apiClient';

const result = await api.login(email, password);
if (result.success) {
  // Usuario autenticado
}
```

### Ejemplo: Obtener Preguntas

```javascript
import { api } from '../services/apiClient';

const preguntas = await api.getPreguntas();
```

### Ejemplo: Guardar Respuestas

```javascript
import { api } from '../services/apiClient';

// El token se agrega automáticamente desde localStorage
await api.guardarRespuestas([1, 3, 5, 8]);
```

## 🛠️ Configuración del Proxy (Desarrollo)

El archivo `vite.config.js` incluye un proxy que redirige las peticiones a `/api` al backend:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

Esto evita problemas de CORS en desarrollo.

## ⚠️ Notas Importantes

1. **Valores de Sexo permitidos:** `masculino`, `femenino`, `otro`, `prefiero_no_decir`
2. **Valores de Nivel Educativo permitidos:** `primaria`, `secundaria`, `tecnico`, `universitario`, `postgrado`, `otro`
3. El backend normaliza estos valores a minúsculas y reemplaza espacios con guiones bajos
4. El campo `rol` no está implementado en el backend actual, se asume `usuario` por defecto

## 🚀 Próximos Pasos

- [ ] Implementar refresh token para renovar tokens expirados
- [ ] Agregar manejo de roles en el backend
- [ ] Implementar endpoint para recuperar contraseña
- [ ] Agregar validación de tokens al cargar la aplicación

