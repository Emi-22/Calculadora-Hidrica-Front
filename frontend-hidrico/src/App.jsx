// src/App.jsx
import { Outlet, Link } from 'react-router-dom';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.appContainer}>
      {/* RF10: Menú superior con enlaces */}
      <nav className={styles.nav}>
        <Link to="/registro" className={styles.navLink}>
          Registro
        </Link>
        <Link to="/preguntas" className={styles.navLink}>
          Preguntas
        </Link>
        <Link to="/usuarios" className={styles.navLink}>
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