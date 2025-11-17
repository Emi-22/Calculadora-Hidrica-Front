// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Función para iniciar sesión usando el backend
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const login = async (email, password) => {
    try {
      const response = await api.login(email, password);
      
      // El backend devuelve: { message, token, usuario: { id, nombre, email, sexo, nivel_educativo, rol } }
      const userData = {
        id: response.usuario.id,
        nombre: response.usuario.nombre,
        email: response.usuario.email,
        sexo: response.usuario.sexo,
        nivel_educativo: response.usuario.nivel_educativo,
        token: response.token,
        // Mantener compatibilidad con código existente que usa 'usuario' y 'rol'
        usuario: response.usuario.nombre,
        rol: response.usuario.rol || 'usuario', // El backend devuelve el rol
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: error.message || 'Error al iniciar sesión. Por favor, intenta nuevamente.' 
      };
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Verificar si el usuario es administrador
  const isAdmin = user && (user.rol === 'administrador' || user.rol === 'admin');

  const value = {
    user,
    login,
    logout,
    isAdmin,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

