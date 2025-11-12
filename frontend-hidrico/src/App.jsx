// src/App.jsx
import { Outlet, Link, useLocation } from 'react-router-dom';
import styles from './App.module.css';

function App() {
  const location = useLocation();

  // Función para determinar si un enlace está activo
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className={styles.appContainer}>
      {/* RF10: Menú superior con enlaces */}
      <nav className={styles.nav}>
        <Link 
          to="/registro" 
          className={`${styles.navLink} ${isActive('/registro') ? styles.active : ''}`}
        >
          Registro
        </Link>
        <Link 
          to="/preguntas" 
          className={`${styles.navLink} ${isActive('/preguntas') ? styles.active : ''}`}
        >
          Preguntas
        </Link>
        <Link 
          to="/usuarios" 
          className={`${styles.navLink} ${isActive('/usuarios') ? styles.active : ''}`}
        >
          Usuarios
        </Link>
      </nav>

      <main className={styles.main}>
        {/* RF11: Aquí se renderizará el componente de la ruta activa */}
        <Outlet />
      </main>
    </div>
  );
}

export default App;