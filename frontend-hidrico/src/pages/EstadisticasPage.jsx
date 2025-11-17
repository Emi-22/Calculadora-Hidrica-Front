import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/apiClient';
import styles from './EstadisticasPage.module.css';

import logoInstitucional from '../assets/logo-itl.png';

export default function EstadisticasPage() {
    const { user } = useAuth();
    const [estadisticas, setEstadisticas] = useState([]);
    const [resumen, setResumen] = useState({
        totalUsuariosCompletaron: 0,
        totalPreguntas: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadEstadisticas = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                // Cargar estadísticas de respuestas
                const response = await api.getEstadisticasRespuestas();
                const data = response.estadisticas || response; // Compatibilidad con formato anterior
                const totalUsuariosCompletaron = response.totalUsuariosCompletaron || 0;
                
                // Agrupar por pregunta para facilitar la visualización
                const estadisticasPorPregunta = {};
                const preguntasUnicas = new Set();

                data.forEach(item => {
                    const preguntaId = item.id_pregunta;
                    preguntasUnicas.add(preguntaId);
                    
                    if (!estadisticasPorPregunta[preguntaId]) {
                        estadisticasPorPregunta[preguntaId] = {
                            id: preguntaId,
                            codigo: item.codigo_pregunta,
                            texto: item.texto_pregunta,
                            opciones: []
                        };
                    }
                    
                    estadisticasPorPregunta[preguntaId].opciones.push({
                        id: item.id_opcion,
                        texto: item.texto_opcion,
                        total: item.total_respuestas
                    });
                });

                // Convertir objeto a array y ordenar
                const estadisticasArray = Object.values(estadisticasPorPregunta).sort((a, b) => a.id - b.id);
                
                setEstadisticas(estadisticasArray);
                
                // Calcular resumen
                setResumen({
                    totalPreguntas: preguntasUnicas.size,
                    totalUsuariosCompletaron: totalUsuariosCompletaron
                });
                
            } catch (err) {
                console.error('Error al cargar estadísticas:', err);
                setError('Error al cargar las estadísticas. Por favor, intenta nuevamente.');
            } finally {
                setIsLoading(false);
            }
        };

        loadEstadisticas();
    }, []);

    // Calcular el total de respuestas para una pregunta
    const calcularTotalPregunta = (opciones) => {
        return opciones.reduce((sum, opcion) => sum + opcion.total, 0);
    };

    // Calcular porcentaje de una opción
    const calcularPorcentaje = (totalOpcion, totalPregunta) => {
        if (totalPregunta === 0) return 0;
        return ((totalOpcion / totalPregunta) * 100).toFixed(1);
    };

    if (isLoading) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Cargando estadísticas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.errorContainer}>
                    <p>⚠️ {error}</p>
                    <button 
                        onClick={() => {
                            setError(null);
                            setIsLoading(true);
                            window.location.reload();
                        }} 
                        className={styles.retryButton}
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <img src={logoInstitucional} alt="Logo ITL" className={styles.logo} />
            
            <div className={styles.mainContainer}>
                <h1 className={styles.title}>Estadísticas de Consumo Hídrico</h1>
                
                {/* Tarjetas de Resumen */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>📊</div>
                        <h3 className={styles.statTitle}>Total de Preguntas</h3>
                        <div className={styles.statValue}>{resumen.totalPreguntas}</div>
                        <p className={styles.statLabel}>Preguntas en el cuestionario</p>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>✅</div>
                        <h3 className={styles.statTitle}>Encuestas Completadas</h3>
                        <div className={styles.statValue}>{resumen.totalUsuariosCompletaron}</div>
                        <p className={styles.statLabel}>Veces que la encuesta fue respondida</p>
                    </div>
                </div>

                {/* Tabla de Estadísticas por Pregunta */}
                <div className={styles.tableSection}>
                    <h2 className={styles.sectionTitle}>Estadísticas Detalladas por Pregunta</h2>
                    
                    {estadisticas.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No hay estadísticas disponibles aún.</p>
                        </div>
                    ) : (
                        <div className={styles.tablesContainer}>
                            {estadisticas.map((pregunta) => {
                                const totalPregunta = calcularTotalPregunta(pregunta.opciones);
                                
                                return (
                                    <div key={pregunta.id} className={styles.questionTableWrapper}>
                                        <div className={styles.questionHeader}>
                                            <h3 className={styles.questionText}>{pregunta.texto}</h3>
                                            <span className={styles.questionTotal}>
                                                Total: {totalPregunta} respuestas
                                            </span>
                                        </div>
                                        
                                        <table className={styles.dataTable}>
                                            <thead>
                                                <tr>
                                                    <th>Opción</th>
                                                    <th>Respuestas</th>
                                                    <th>Porcentaje</th>
                                                    <th>Visualización</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pregunta.opciones
                                                    .sort((a, b) => b.total - a.total)
                                                    .map((opcion) => {
                                                        const porcentaje = calcularPorcentaje(opcion.total, totalPregunta);
                                                        return (
                                                            <tr key={opcion.id}>
                                                                <td className={styles.optionText}>{opcion.texto}</td>
                                                                <td className={styles.numberCell}>{opcion.total}</td>
                                                                <td className={styles.numberCell}>{porcentaje}%</td>
                                                                <td className={styles.barCell}>
                                                                    <div className={styles.barContainer}>
                                                                        <div 
                                                                            className={styles.barFill}
                                                                            style={{ 
                                                                                width: `${porcentaje}%`,
                                                                                backgroundColor: porcentaje > 50 
                                                                                    ? '#ff4d4d' 
                                                                                    : porcentaje > 25 
                                                                                    ? '#ffd700' 
                                                                                    : '#4CAF50'
                                                                            }}
                                                                        ></div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
