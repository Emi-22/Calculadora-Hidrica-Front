import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/apiClient';
import styles from './PreguntasPage.module.css';

import logoInstitucional from '../assets/logo-itl.png';

// Mapeo de emojis para las preguntas basado en palabras clave
const getEmojiForQuestion = (texto) => {
    const textoLower = texto.toLowerCase();
    if (textoLower.includes('agua') || textoLower.includes('litros') || textoLower.includes('consumo')) return '💧';
    if (textoLower.includes('ducha') || textoLower.includes('duchas')) return '🚿';
    if (textoLower.includes('tiempo') || textoLower.includes('minutos') || textoLower.includes('dura')) return '⏱️';
    if (textoLower.includes('dientes') || textoLower.includes('dental')) return '🦷';
    if (textoLower.includes('llave') || textoLower.includes('grifo')) return '🚰';
    if (textoLower.includes('inodoro') || textoLower.includes('baño')) return '🚽';
    if (textoLower.includes('trastes') || textoLower.includes('platos') || textoLower.includes('lavar')) return '🍽️';
    if (textoLower.includes('enjabon') || textoLower.includes('jabón')) return '🧽';
    if (textoLower.includes('ropa') || textoLower.includes('lavar ropa')) return '👕';
    if (textoLower.includes('lavadora')) return '🧺';
    if (textoLower.includes('trapear') || textoLower.includes('pisos') || textoLower.includes('limpiar')) return '🧹';
    if (textoLower.includes('embotellada') || textoLower.includes('botella')) return '🥤';
    if (textoLower.includes('automóvil') || textoLower.includes('auto') || textoLower.includes('carro')) return '🚗';
    if (textoLower.includes('carne')) return '🥩';
    if (textoLower.includes('fiesta') || textoLower.includes('reunión')) return '🎉';
    if (textoLower.includes('alcohólicas') || textoLower.includes('alcohol')) return '🍺';
    if (textoLower.includes('bebidas')) return '🍷';
    return '💧'; // default
};

export default function PreguntasPage() {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [preguntas, setPreguntas] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [waterLevel, setWaterLevel] = useState(0);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showCompletionScreen, setShowCompletionScreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Cargar preguntas desde el backend
    useEffect(() => {
        const loadPreguntas = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await api.getPreguntas();
                
                // Mapear datos del backend al formato que espera el componente
                const preguntasMapeadas = data.map((pregunta) => {
                    return {
                        id: pregunta.id,
                        codigo: pregunta.codigo,
                        text: pregunta.texto,
                        image: getEmojiForQuestion(pregunta.texto),
                        options: pregunta.opciones.map((opcion) => ({
                            id: opcion.id,
                            label: opcion.texto,
                            value: opcion.id, // Usar el ID de la opción como valor
                            waterImpact: opcion.valor_consumo || 0, // Usar el valor real del backend
                        }))
                    };
                });
                
                setPreguntas(preguntasMapeadas);
            } catch (err) {
                console.error('Error al cargar preguntas:', err);
                setError('Error al cargar las preguntas. Por favor, recarga la página.');
            } finally {
                setIsLoading(false);
            }
        };

        loadPreguntas();
    }, []);

    const currentQuestion = preguntas[currentQuestionIndex];
    const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : null;
    const totalQuestions = preguntas.length;
    const answeredQuestions = Object.keys(answers).length;

    // Calcular nivel hídrico basado en las respuestas
    useEffect(() => {
        if (preguntas.length === 0) return;
        
        let totalImpact = 0;
        let answeredQuestionsMaxImpact = 0;
        let allQuestionsMaxImpact = 0;

        preguntas.forEach(question => {
            // Calcular máximo impacto posible para esta pregunta
            const maxImpactForQuestion = Math.max(...question.options.map(opt => opt.waterImpact));
            allQuestionsMaxImpact += maxImpactForQuestion;

            // Si la pregunta tiene respuesta, sumar su impacto y su máximo posible
            if (answers[question.id]) {
                const answer = answers[question.id];
                const option = question.options.find(opt => opt.value === answer.value);
                if (option) {
                    totalImpact += option.waterImpact;
                    answeredQuestionsMaxImpact += maxImpactForQuestion;
                }
            }
        });

        // Calcular porcentaje basado en el consumo actual
        // El porcentaje se calcula sobre el máximo impacto posible de todas las preguntas
        // para mantener una escala consistente de 0-100%
        let percentage = 0;
        if (allQuestionsMaxImpact > 0) {
            percentage = (totalImpact / allQuestionsMaxImpact) * 100;
        }
        
        // Asegurar que el porcentaje esté entre 0 y 100
        setWaterLevel(Math.min(100, Math.max(0, percentage)));
    }, [answers, preguntas]);

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: { value }
        }));
    };

    const handleNext = async () => {
        if (currentQuestionIndex < preguntas.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Fin del cuestionario - guardar respuestas y mostrar modal
            await handleSaveAnswers();
            setShowCompletionModal(true);
        }
    };

    // Guardar respuestas en el backend
    const handleSaveAnswers = async () => {
        if (!user) {
            setError('Debes iniciar sesión para guardar tus respuestas.');
            return;
        }

        try {
            setIsSaving(true);
            setSaveSuccess(false);
            // Convertir respuestas al formato que espera el backend
            // El backend espera un array de IDs de opciones
            const opcionesIds = Object.values(answers).map(answer => answer.value);
            
            await api.guardarRespuestas(opcionesIds);
            setSaveSuccess(true);
        } catch (error) {
            console.error('Error al guardar respuestas:', error);
            setSaveSuccess(false);
            // Mostrar mensaje de error en el modal
            setError('Error al guardar las respuestas. Por favor, intenta nuevamente.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCloseModal = () => {
        setShowCompletionModal(false);
        // Mostrar pantalla de completado después de cerrar el modal
        if (saveSuccess) {
            setShowCompletionScreen(true);
        }
        // Limpiar error al cerrar el modal
        if (error) {
            setError(null);
        }
    };

    const handleRestartQuiz = () => {
        // Reiniciar el cuestionario
        setAnswers({});
        setCurrentQuestionIndex(0);
        setWaterLevel(0);
        setShowCompletionScreen(false);
        setShowCompletionModal(false);
        setSaveSuccess(false);
        setError(null);
    };

    // Efecto para manejar la tecla Escape y bloquear scroll cuando el modal está abierto
    useEffect(() => {
        if (showCompletionModal) {
            // Bloquear scroll del body
            document.body.style.overflow = 'hidden';
            
            // Función para cerrar con Escape
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    setShowCompletionModal(false);
                }
            };
            
            // Agregar listener
            document.addEventListener('keydown', handleEscape);
            
            // Cleanup
            return () => {
                document.body.style.overflow = 'unset';
                document.removeEventListener('keydown', handleEscape);
            };
        } else {
            // Asegurar que el scroll esté habilitado cuando el modal está cerrado
            document.body.style.overflow = 'unset';
        }
    }, [showCompletionModal]);

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    // Determinar el color del nivel hídrico
    const getWaterLevelColor = () => {
        if (waterLevel >= 75) return '#ff4d4d'; // Crítico - Rojo
        if (waterLevel >= 50) return '#ffd700'; // Medio - Amarillo
        return '#4CAF50'; // Óptimo - Verde
    };

    // Determinar la etiqueta del nivel
    const getWaterLevelLabel = () => {
        if (waterLevel >= 75) return 'Crítico!';
        if (waterLevel >= 50) return 'Medio';
        return 'Óptimo';
    };

    // Obtener el gradiente del líquido según el nivel actual
    const getLiquidGradient = () => {
        if (waterLevel <= 0) {
            // Sin líquido
            return 'transparent';
        } else if (waterLevel < 50) {
            // Óptimo: Solo verde (0% a waterLevel%)
            return 'linear-gradient(to top, #4CAF50 0%, #4CAF50 100%)';
        } else if (waterLevel < 75) {
            // Medio: Verde desde 0% hasta 50% del nivel total, amarillo desde 50% hasta el final
            // El agua llena desde 0% hasta waterLevel%
            // De 0% a 50% del termómetro es verde (zona óptima)
            // De 50% a waterLevel% del termómetro es amarillo (zona media)
            // Pero el gradiente se aplica sobre el líquido, que va de 0% a waterLevel%
            // Necesitamos calcular qué porcentaje del líquido corresponde a cada zona
            const greenZoneEnd = 50; // Fin de la zona verde en el termómetro
            const greenPercentInLiquid = (greenZoneEnd / waterLevel) * 100;
            return `linear-gradient(to top, #4CAF50 0%, #4CAF50 ${greenPercentInLiquid}%, #ffd700 ${greenPercentInLiquid}%, #ffd700 100%)`;
        } else {
            // Crítico: Verde (0-50%), amarillo (50-75%), rojo (75-waterLevel%)
            // El agua llena desde 0% hasta waterLevel%
            // De 0% a 50% del termómetro es verde
            // De 50% a 75% del termómetro es amarillo
            // De 75% a waterLevel% del termómetro es rojo
            // Necesitamos calcular qué porcentaje del líquido corresponde a cada zona
            const greenZoneEnd = 50;
            const yellowZoneEnd = 75;
            const greenPercentInLiquid = (greenZoneEnd / waterLevel) * 100;
            const yellowPercentInLiquid = (yellowZoneEnd / waterLevel) * 100;
            return `linear-gradient(to top, #4CAF50 0%, #4CAF50 ${greenPercentInLiquid}%, #ffd700 ${greenPercentInLiquid}%, #ffd700 ${yellowPercentInLiquid}%, #ff4d4d ${yellowPercentInLiquid}%, #ff3333 100%)`;
        }
    };

    // Mostrar loading
    if (isLoading) {
        return (
            <div className={styles.pageContainer}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh',
                    fontSize: '1.5rem',
                    color: '#004a99',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div style={{ fontSize: '3rem' }}>💧</div>
                    <div>Cargando preguntas...</div>
                </div>
            </div>
        );
    }

    // Mostrar error
    if (error && preguntas.length === 0) {
        return (
            <div className={styles.pageContainer}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh',
                    fontSize: '1.5rem',
                    color: '#ff4444',
                    flexDirection: 'column',
                    gap: '1rem',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '3rem' }}>⚠️</div>
                    <div>{error}</div>
                    <button 
                        onClick={() => {
                            setError(null);
                            setIsLoading(true);
                            window.location.reload();
                        }} 
                        style={{
                            marginTop: '1rem',
                            padding: '0.7rem 1.5rem',
                            fontSize: '1rem',
                            backgroundColor: '#004a99',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#0066ff'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#004a99'}
                    >
                        Recargar página
                    </button>
                </div>
            </div>
        );
    }

    // Mostrar pantalla de completado
    if (showCompletionScreen) {
        return (
            <div className={styles.pageContainer}>
                <img src={logoInstitucional} alt="Logo ITL" className={styles.logo} />
                <div className={styles.completionScreen}>
                    <div className={styles.completionIcon} style={{ 
                        backgroundColor: waterLevel >= 75 
                            ? 'rgba(255, 77, 77, 0.1)' 
                            : waterLevel >= 50 
                            ? 'rgba(255, 215, 0, 0.1)' 
                            : 'rgba(76, 175, 80, 0.1)',
                        color: getWaterLevelColor()
                    }}>
                        {waterLevel >= 75 ? '⚠️' : waterLevel >= 50 ? '⚡' : '✓'}
                    </div>
                    <h1 className={styles.completionTitle}>¡Encuesta Completada!</h1>
                    <p className={styles.completionMessage}>
                        Gracias por completar el cuestionario de huella hídrica.
                    </p>
                    
                    <div className={styles.completionResults}>
                        <div className={styles.completionResultCard}>
                            <span className={styles.completionResultLabel}>Tu Nivel Hídrico:</span>
                            <span 
                                className={styles.completionResultValue}
                                style={{ color: getWaterLevelColor() }}
                            >
                                {waterLevel.toFixed(1)}%
                            </span>
                        </div>
                        <div className={styles.completionResultCard}>
                            <span className={styles.completionResultLabel}>Estado:</span>
                            <span 
                                className={styles.completionResultBadge}
                                style={{ 
                                    backgroundColor: getWaterLevelColor(),
                                    color: 'white'
                                }}
                            >
                                {getWaterLevelLabel()}
                            </span>
                        </div>
                    </div>

                    <div className={styles.completionDescription}>
                        {waterLevel >= 75 ? (
                            <p>Tu consumo de agua es crítico. Te recomendamos implementar medidas de ahorro urgentes.</p>
                        ) : waterLevel >= 50 ? (
                            <p>Tu consumo de agua es moderado. Hay espacio para mejorar y optimizar tu uso del agua.</p>
                        ) : (
                            <p>¡Excelente! Tu consumo de agua es óptimo. Sigue manteniendo estas buenas prácticas.</p>
                        )}
                    </div>

                    <div className={styles.completionActions}>
                        {isAdmin && (
                            <button 
                                className={styles.completionButton}
                                onClick={() => navigate('/estadisticas')}
                            >
                                Ver Estadísticas
                            </button>
                        )}
                        <button 
                            className={`${styles.completionButton} ${isAdmin ? styles.completionButtonSecondary : ''}`}
                            onClick={handleRestartQuiz}
                        >
                            Realizar Otra Vez
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return null;
    }

    return (
        <div className={styles.pageContainer}>
            {/* Logo en la esquina superior izquierda */}
            <img src={logoInstitucional} alt="Logo ITL" className={styles.logo} />

            {/* Contenedor principal */}
            <div className={styles.mainContainer}>
                <h1 className={styles.mainTitle}>Calculando Huella Hídrica</h1>

                {/* Tarjeta central dividida en dos secciones */}
                <div className={styles.card}>
                    {/* Sección izquierda - Pregunta (fondo celeste) */}
                    <div className={styles.questionSection}>
                        {/* Ilustración dinámica */}
                        <div className={styles.illustrationContainer}>
                            <div className={styles.illustration}>
                                {currentQuestion.image}
                            </div>
                        </div>

                        {/* Texto de la pregunta */}
                        <p className={styles.questionText}>
                            {currentQuestion.text}
                        </p>

                        {/* Opciones de respuesta */}
                        <div className={styles.optionsContainer}>
                            {currentQuestion.options.map((option, index) => (
                                <label
                                    key={index}
                                    className={`${styles.optionLabel} ${
                                        selectedAnswer?.value === option.value ? styles.selected : ''
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${currentQuestion.id}`}
                                        value={option.value}
                                        checked={selectedAnswer?.value === option.value}
                                        onChange={() => handleAnswerChange(currentQuestion.id, option.value)}
                                        className={styles.radioInput}
                                    />
                                    <span className={styles.optionText}>{option.label}</span>
                                </label>
                            ))}
                        </div>

                        {/* Indicador de progreso */}
                        <div className={styles.progressIndicator}>
                            Pregunta {currentQuestionIndex + 1} de {totalQuestions}
                        </div>

                        {/* Botones de navegación */}
                        <div className={styles.navigationButtons}>
                            <button
                                type="button"
                                onClick={handlePrevious}
                                disabled={currentQuestionIndex === 0}
                                className={styles.buttonAnterior}
                            >
                                Anterior
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={!selectedAnswer || isSaving}
                                className={styles.buttonSiguiente}
                            >
                                {isSaving ? 'Guardando...' : currentQuestionIndex === totalQuestions - 1 ? 'Finalizar' : 'Siguiente'}
                            </button>
                        </div>
                    </div>

                    {/* Sección derecha - Termómetro (fondo blanco) */}
                    <div className={styles.thermometerSection}>
                        <h3 className={styles.thermometerTitle}>Nivel Hídrico</h3>
                        
                        <div className={styles.thermometerContainer}>
                            {/* Termómetro */}
                            <div className={styles.thermometer}>
                                {/* Escala de colores (invertida: rojo arriba, verde abajo) */}
                                <div className={styles.thermometerScale}>
                                    <div className={styles.scaleSegment}>
                                        <span className={styles.scaleLabel}>Crítico!</span>
                                        <span className={styles.scalePercentage}>75-100%</span>
                                    </div>
                                    <div className={styles.scaleSegment}>
                                        <span className={styles.scaleLabel}>Medio</span>
                                        <span className={styles.scalePercentage}>50-75%</span>
                                    </div>
                                    <div className={styles.scaleSegment}>
                                        <span className={styles.scaleLabel}>Óptimo</span>
                                        <span className={styles.scalePercentage}>0-50%</span>
                                    </div>
                                </div>

                                {/* Líquido del termómetro */}
                                {waterLevel > 0 && (
                                    <div 
                                        className={styles.thermometerLiquid}
                                        style={{ 
                                            height: `${waterLevel}%`,
                                            background: getLiquidGradient()
                                        }}
                                    />
                                )}
                            </div>
                            
                            {/* Etiqueta del nivel */}
                            <div className={styles.thermometerLevelLabel} style={{ color: getWaterLevelColor() }}>
                                {getWaterLevelLabel()}
                            </div>
                            
                            {/* Porcentaje debajo del indicador */}
                            <div className={styles.percentageDisplay} style={{ 
                                backgroundColor: getWaterLevelColor(),
                                color: 'white'
                            }}>
                                {waterLevel.toFixed(0)}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de finalización */}
            {showCompletionModal && (
                <div className={styles.modalOverlay} onClick={handleCloseModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalIcon} style={{ 
                                backgroundColor: waterLevel >= 75 
                                    ? 'rgba(255, 77, 77, 0.1)' 
                                    : waterLevel >= 50 
                                    ? 'rgba(255, 215, 0, 0.1)' 
                                    : 'rgba(76, 175, 80, 0.1)',
                                color: getWaterLevelColor()
                            }}>
                                {waterLevel >= 75 ? '⚠️' : waterLevel >= 50 ? '⚡' : '✓'}
                            </div>
                            <h2 className={styles.modalTitle}>¡Encuesta Completada!</h2>
                        </div>

                        <div className={styles.modalBody}>
                            <p className={styles.modalMessage}>
                                Has completado exitosamente el cuestionario de huella hídrica.
                            </p>
                            {saveSuccess && (
                                <p style={{ 
                                    color: '#4CAF50', 
                                    fontWeight: '600', 
                                    marginTop: '0.5rem',
                                    fontSize: '0.95rem'
                                }}>
                                    ✅ Tus respuestas han sido guardadas correctamente en la base de datos.
                                </p>
                            )}
                            
                            <div className={styles.resultContainer}>
                                <div className={styles.resultItem}>
                                    <span className={styles.resultLabel}>Nivel Hídrico:</span>
                                    <span 
                                        className={styles.resultValue}
                                        style={{ color: getWaterLevelColor() }}
                                    >
                                        {waterLevel.toFixed(1)}%
                                    </span>
                                </div>
                                <div className={styles.resultItem}>
                                    <span className={styles.resultLabel}>Estado:</span>
                                    <span 
                                        className={styles.resultBadge}
                                        style={{ 
                                            backgroundColor: getWaterLevelColor(),
                                            color: 'white'
                                        }}
                                    >
                                        {getWaterLevelLabel()}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.resultDescription}>
                                {waterLevel >= 75 ? (
                                    <p>Tu consumo de agua es crítico. Te recomendamos implementar medidas de ahorro urgentes.</p>
                                ) : waterLevel >= 50 ? (
                                    <p>Tu consumo de agua es moderado. Hay espacio para mejorar y optimizar tu uso del agua.</p>
                                ) : (
                                    <p>¡Excelente! Tu consumo de agua es óptimo. Sigue manteniendo estas buenas prácticas.</p>
                                )}
                            </div>
                            
                            {/* Mostrar error si hubo problema al guardar */}
                            {error && !saveSuccess && (
                                <div style={{ 
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    backgroundColor: '#f8d7da',
                                    color: '#721c24',
                                    borderRadius: '8px',
                                    border: '1px solid #f5c6cb'
                                }}>
                                    <strong>⚠️ Error:</strong> {error}
                                </div>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <button 
                                className={styles.modalButton}
                                onClick={handleCloseModal}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
