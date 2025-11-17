// src/App.jsx
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import styles from './App.module.css';

function App() {
  const { user, isAdmin, logout, isLoading } = useAuth();
  const location = useLocation();

  // Función para verificar si una ruta está activa
  const isActive = (path) => {
    return location.pathname === path;
  };


  return (
    <div className={styles.appContainer}>
      {/* RF10: Menú superior con enlaces */}
      <nav className={styles.nav}>
        {!isLoading && !user && (
          <Link 
            to="/registro" 
            className={`${styles.navLink} ${isActive('/registro') ? styles.active : ''}`}
          >
            Registro
          </Link>
        )}
        {!isLoading && user && (
          <Link 
            to="/preguntas" 
            className={`${styles.navLink} ${isActive('/preguntas') ? styles.active : ''}`}
          >
            Preguntas
          </Link>
        )}
        {!isLoading && isAdmin && (
          <>
            <Link 
              to="/estadisticas" 
              className={`${styles.navLink} ${isActive('/estadisticas') ? styles.active : ''}`}
            >
              Estadísticas
            </Link>
            <Link 
              to="/usuarios" 
              className={`${styles.navLink} ${isActive('/usuarios') ? styles.active : ''}`}
            >
              Usuarios
            </Link>
          </>
        )}
        {!isLoading && user ? (
          <>
            <span className={styles.userInfo}>
              {user.nombre || user.usuario} {user.rol ? `(${user.rol})` : ''}
            </span>
            <button onClick={logout} className={styles.logoutButton}>
              Cerrar Sesión
            </button>
          </>
        ) : !isLoading ? (
          <Link 
            to="/login" 
            className={`${styles.navLink} ${isActive('/login') ? styles.active : ''}`}
          >
            Iniciar Sesión
          </Link>
        ) : null}
      </nav>

      <main className={styles.main}>
        {/* RF11: Aquí se renderizará el componente de la ruta activa */}
        <Outlet />
      </main>
    </div>
  );
}

export default App;