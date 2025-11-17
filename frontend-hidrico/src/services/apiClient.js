// src/services/apiClient.js
// Cliente API centralizado para comunicarse con el backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10);

/**
 * Obtiene el token de autenticación del localStorage
 */
const getToken = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.token || null;
    } catch (error) {
      console.error('Error al parsear usuario del localStorage:', error);
      return null;
    }
  }
  return null;
};

/**
 * Función auxiliar para realizar peticiones HTTP
 * @param {string} endpoint - Endpoint relativo (ej: '/auth/login')
 * @param {object} options - Opciones de fetch (method, body, headers, etc.)
 * @returns {Promise} - Respuesta parseada como JSON
 */
const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Headers por defecto
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Agregar token de autenticación si existe
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Configuración de la petición
  const config = {
    ...options,
    headers,
  };

  // Timeout usando AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Parsear respuesta
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Si la respuesta no es exitosa, lanzar error
    if (!response.ok) {
      const error = new Error(data.message || `Error ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Manejo de errores específicos
    if (error.name === 'AbortError') {
      throw new Error('La petición tardó demasiado tiempo. Por favor, intenta nuevamente.');
    }
    
    if (error.status === 401 || error.status === 403) {
      // Token inválido o expirado - limpiar localStorage y redirigir
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    }

    throw error;
  }
};

/**
 * Cliente API con métodos para cada endpoint
 */
export const api = {
  // ========== AUTENTICACIÓN ==========
  
  /**
   * Registro de nuevo usuario
   * @param {object} userData - { nombre, email, password, sexo, nivel_educativo }
   * @returns {Promise} - { id, nombre, email, sexo, nivel_educativo }
   */
  registro: async (userData) => {
    return fetchAPI('/auth/registro', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Inicio de sesión
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña
   * @returns {Promise} - { message, token, usuario: { id, nombre, email, sexo, nivel_educativo } }
   */
  login: async (email, password) => {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // ========== PREGUNTAS ==========
  
  /**
   * Obtener todas las preguntas con sus opciones
   * @returns {Promise} - Array de preguntas con opciones
   */
  getPreguntas: async () => {
    return fetchAPI('/preguntas', {
      method: 'GET',
    });
  },

  // ========== RESPUESTAS ==========
  
  /**
   * Guardar respuestas del usuario (requiere autenticación)
   * @param {number[]} opciones - Array de IDs de opciones seleccionadas
   * @returns {Promise} - { message }
   */
  guardarRespuestas: async (opciones) => {
    return fetchAPI('/respuestas', {
      method: 'POST',
      body: JSON.stringify({ opciones }),
    });
  },

  /**
   * Obtener estadísticas de respuestas (requiere autenticación y rol admin)
   * @returns {Promise} - Array de estadísticas por pregunta y opción
   */
  getEstadisticasRespuestas: async () => {
    return fetchAPI('/respuestas/estadisticas', {
      method: 'GET',
    });
  },

  // ========== CONSUMO ==========
  
  /**
   * Calcular y guardar consumo diario
   * @param {number} id_usuario - ID del usuario
   * @param {number[]} respuestas - Array de respuestas (opcional, se calcula desde BD)
   * @returns {Promise} - { success, consumo_total, mensaje }
   */
  calcularConsumo: async (id_usuario, respuestas = null) => {
    return fetchAPI('/calcular-consumo', {
      method: 'POST',
      body: JSON.stringify({ id_usuario, respuestas }),
    });
  },

  /**
   * Obtener historial de consumo de un usuario
   * @param {number} id_usuario - ID del usuario
   * @returns {Promise} - Array de registros de consumo
   */
  getHistorialConsumo: async (id_usuario) => {
    return fetchAPI(`/historial/${id_usuario}`, {
      method: 'GET',
    });
  },

  // ========== USUARIOS (ADMIN) ==========
  
  /**
   * Obtener lista de usuarios (requiere autenticación y rol admin)
   * @param {object} filters - { q: string, rol: string, page: number, pageSize: number }
   * @returns {Promise} - { data: usuarios[], pagination: { total, page, pageSize, totalPages } }
   */
  getUsuarios: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.q) params.append('q', filters.q);
    if (filters.rol) params.append('rol', filters.rol);
    if (filters.page) params.append('page', filters.page);
    if (filters.pageSize) params.append('pageSize', filters.pageSize);
    
    const queryString = params.toString();
    const url = `/usuarios${queryString ? `?${queryString}` : ''}`;
    
    return fetchAPI(url, {
      method: 'GET',
    });
  },

  /**
   * Obtener un usuario por ID (requiere autenticación y rol admin)
   * @param {number} id - ID del usuario
   * @returns {Promise} - Usuario
   */
  getUsuario: async (id) => {
    return fetchAPI(`/usuarios/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Crear un nuevo usuario (requiere autenticación y rol admin)
   * @param {object} userData - { nombre, email, password, sexo, nivel_educativo, rol }
   * @returns {Promise} - Usuario creado
   */
  crearUsuario: async (userData) => {
    return fetchAPI('/usuarios', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Actualizar un usuario (requiere autenticación y rol admin)
   * @param {number} id - ID del usuario
   * @param {object} userData - { nombre?, email?, password?, sexo?, nivel_educativo?, rol? }
   * @returns {Promise} - { message }
   */
  actualizarUsuario: async (id, userData) => {
    return fetchAPI(`/usuarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Eliminar un usuario (requiere autenticación y rol admin)
   * @param {number} id - ID del usuario
   * @returns {Promise} - { message }
   */
  eliminarUsuario: async (id) => {
    return fetchAPI(`/usuarios/${id}`, {
      method: 'DELETE',
    });
  },

  // ========== RECUPERAR CONTRASEÑA ==========
  
  /**
   * Solicitar recuperación de contraseña
   * @param {string} email - Correo electrónico
   * @returns {Promise} - { message }
   */
  forgotPassword: async (email) => {
    return fetchAPI('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Restablecer contraseña con token
   * @param {string} token - Token de recuperación
   * @param {string} password - Nueva contraseña
   * @returns {Promise} - { message }
   */
  resetPassword: async (token, password) => {
    return fetchAPI('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
};

export default api;

