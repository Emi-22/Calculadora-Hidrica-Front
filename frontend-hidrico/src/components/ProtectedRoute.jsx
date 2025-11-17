// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './ProtectedRoute.module.css';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isAdmin, isLoading } = useAuth();

  // Mostrar carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Cargando...</p>
      </div>
    );
  }

  // Si requiere autenticación y no hay usuario, redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si requiere ser administrador y el usuario no lo es, mostrar error
  if (requireAdmin && !isAdmin) {
    return (
      <div className={styles.errorContainer}>
        <h2 className={styles.errorTitle}>Acceso Denegado</h2>
        <p className={styles.errorMessage}>
          No tienes permisos para acceder a esta página.
        </p>
        <p className={styles.errorMessage}>
          Solo los administradores pueden acceder al panel de administración.
        </p>
      </div>
    );
  }

  return children;
}

