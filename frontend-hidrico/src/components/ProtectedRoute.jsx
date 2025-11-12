// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isAdmin, isLoading } = useAuth();

  // Mostrar carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <p>Cargando...</p>
      </div>
    );
  }

  // Si requiere autenticación y no hay usuario, redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si requiere ser administrador y el usuario no lo es, redirigir
  if (requireAdmin && !isAdmin) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center' 
      }}>
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta página.</p>
        <p>Solo los administradores pueden acceder al panel de administración.</p>
      </div>
    );
  }

  return children;
}

