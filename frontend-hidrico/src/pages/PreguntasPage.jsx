import { useState, useEffect } from 'react';
import styles from './PreguntasPage.module.css';

import logoInstitucional from '../assets/logo-itl.png';

// Datos de las preguntas con sus opciones e impacto hídrico
const questionsData = [
    {
        id: 1,
        text: "¿Cuántos litros de agua estimas en tu consumo al día?",
        image: "💧",
        options: [
            { label: "Menos de 50 litros", value: 1, waterImpact: 10 },
            { label: "50-100 litros", value: 2, waterImpact: 25 },
            { label: "100-200 litros", value: 3, waterImpact: 50 },
            { label: "Más de 200 litros", value: 4, waterImpact: 80 },
        ],
    },
    {
        id: 2,
        text: "¿Cuántas veces al día te duchas?",
        image: "🚿",
        options: [
            { label: "1 vez", value: 1, waterImpact: 15 },
            { label: "2 veces", value: 2, waterImpact: 35 },
            { label: "3 o más veces", value: 3, waterImpact: 60 },
        ],
    },
    {
        id: 3,
        text: "¿Cuánto dura cada ducha?",
        image: "⏱️",
        options: [
            { label: "Menos de 5 minutos", value: 1, waterImpact: 10 },
            { label: "5-10 minutos", value: 2, waterImpact: 25 },
            { label: "10-15 minutos", value: 3, waterImpact: 45 },
            { label: "Más de 15 minutos", value: 4, waterImpact: 70 },
        ],
    },
    {
        id: 4,
        text: "¿Usas regadera de ahorro o convencional?",
        image: "🚿",
        options: [
            { label: "Regadera de ahorro", value: 1, waterImpact: 5 },
            { label: "Regadera convencional", value: 2, waterImpact: 30 },
        ],
    },
    {
        id: 5,
        text: "¿Cuántas veces al día lavas tus dientes?",
        image: "🦷",
        options: [
            { label: "1 vez", value: 1, waterImpact: 5 },
            { label: "2 veces", value: 2, waterImpact: 10 },
            { label: "3 o más veces", value: 3, waterImpact: 20 },
        ],
    },
    {
        id: 6,
        text: "¿Dejas la llave abierta?",
        image: "🚰",
        options: [
            { label: "Siempre la cierro", value: 1, waterImpact: 5 },
            { label: "A veces la dejo abierta", value: 2, waterImpact: 20 },
            { label: "Casi siempre la dejo abierta", value: 3, waterImpact: 40 },
        ],
    },
    {
        id: 7,
        text: "¿Cuántas veces al día utilizas el inodoro?",
        image: "🚽",
        options: [
            { label: "1-3 veces", value: 1, waterImpact: 10 },
            { label: "4-6 veces", value: 2, waterImpact: 25 },
            { label: "Más de 6 veces", value: 3, waterImpact: 45 },
        ],
    },
    {
        id: 8,
        text: "¿Tu inodoro es de descarga ahorradora o convencional?",
        image: "🚽",
        options: [
            { label: "Ahorradora", value: 1, waterImpact: 5 },
            { label: "Convencional", value: 2, waterImpact: 30 },
        ],
    },
    {
        id: 9,
        text: "¿Cuántas veces por semana lavas los trastes?",
        image: "🍽️",
        options: [
            { label: "1-2 veces", value: 1, waterImpact: 10 },
            { label: "3-4 veces", value: 2, waterImpact: 20 },
            { label: "5-7 veces", value: 3, waterImpact: 35 },
            { label: "Más de 7 veces", value: 4, waterImpact: 50 },
        ],
    },
    {
        id: 10,
        text: "¿Enjabonas con la llave abierta o cerrada?",
        image: "🧽",
        options: [
            { label: "Siempre cerrada", value: 1, waterImpact: 5 },
            { label: "A veces abierta", value: 2, waterImpact: 20 },
            { label: "Casi siempre abierta", value: 3, waterImpact: 40 },
        ],
    },
    {
        id: 11,
        text: "¿Cuántas veces lavas por semana tu ropa?",
        image: "👕",
        options: [
            { label: "1-2 veces", value: 1, waterImpact: 15 },
            { label: "3-4 veces", value: 2, waterImpact: 35 },
            { label: "5-7 veces", value: 3, waterImpact: 60 },
            { label: "Más de 7 veces", value: 4, waterImpact: 85 },
        ],
    },
    {
        id: 12,
        text: "¿Tu lavadora es de alta eficiencia o convencional?",
        image: "🧺",
        options: [
            { label: "Alta eficiencia", value: 1, waterImpact: 10 },
            { label: "Convencional", value: 2, waterImpact: 40 },
        ],
    },
    {
        id: 13,
        text: "¿Cuántas veces a la semana trapeas o limpias pisos haciendo uso de agua?",
        image: "🧹",
        options: [
            { label: "1-2 veces", value: 1, waterImpact: 10 },
            { label: "3-4 veces", value: 2, waterImpact: 20 },
            { label: "5-7 veces", value: 3, waterImpact: 35 },
            { label: "Más de 7 veces", value: 4, waterImpact: 50 },
        ],
    },
    {
        id: 14,
        text: "¿Consumes agua embotellada regularmente?",
        image: "🥤",
        options: [
            { label: "Nunca", value: 1, waterImpact: 5 },
            { label: "Ocasionalmente", value: 2, waterImpact: 20 },
            { label: "Frecuentemente", value: 3, waterImpact: 45 },
            { label: "Siempre", value: 4, waterImpact: 70 },
        ],
    },
    {
        id: 15,
        text: "¿Tienes automóvil propio?",
        image: "🚗",
        options: [
            { label: "No", value: 1, waterImpact: 0 },
            { label: "Sí", value: 2, waterImpact: 30 },
        ],
    },
    {
        id: 16,
        text: "¿Cuántas veces al mes lo lavas?",
        image: "🚗",
        options: [
            { label: "No aplica", value: 1, waterImpact: 0 },
            { label: "1-2 veces", value: 2, waterImpact: 15 },
            { label: "3-4 veces", value: 3, waterImpact: 30 },
            { label: "Más de 4 veces", value: 4, waterImpact: 50 },
        ],
    },
    {
        id: 17,
        text: "¿Aproximadamente cuántas veces por mes consumes carne para alimentarte?",
        image: "🥩",
        options: [
            { label: "Nunca (vegetariano/vegano)", value: 1, waterImpact: 5 },
            { label: "1-5 veces", value: 2, waterImpact: 20 },
            { label: "6-15 veces", value: 3, waterImpact: 45 },
            { label: "Más de 15 veces", value: 4, waterImpact: 75 },
        ],
    },
    {
        id: 18,
        text: "¿Sales regularmente de fiesta?",
        image: "🎉",
        options: [
            { label: "Nunca", value: 1, waterImpact: 5 },
            { label: "Ocasionalmente", value: 2, waterImpact: 20 },
            { label: "Frecuentemente", value: 3, waterImpact: 40 },
        ],
    },
    {
        id: 19,
        text: "¿Consumes bebidas alcohólicas?",
        image: "🍺",
        options: [
            { label: "No", value: 1, waterImpact: 5 },
            { label: "Sí", value: 2, waterImpact: 30 },
        ],
    },
    {
        id: 20,
        text: "¿Cuál es tu consumo estimado de bebidas alcohólicas por reunión?",
        image: "🍷",
        options: [
            { label: "No aplica", value: 1, waterImpact: 0 },
            { label: "1-2 bebidas", value: 2, waterImpact: 15 },
            { label: "3-4 bebidas", value: 3, waterImpact: 35 },
            { label: "Más de 4 bebidas", value: 4, waterImpact: 60 },
        ],
    },
];

export default function PreguntasPage() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [waterLevel, setWaterLevel] = useState(0);
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    const currentQuestion = questionsData[currentQuestionIndex];
    const selectedAnswer = answers[currentQuestion.id];
    const totalQuestions = questionsData.length;
    const answeredQuestions = Object.keys(answers).length;

    // Calcular nivel hídrico basado en las respuestas
    useEffect(() => {
        let totalImpact = 0;
        let answeredQuestionsMaxImpact = 0;
        let allQuestionsMaxImpact = 0;

        questionsData.forEach(question => {
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
    }, [answers]);

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: { value }
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questionsData.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Fin del cuestionario - mostrar modal
            setShowCompletionModal(true);
        }
    };

    const handleCloseModal = () => {
        setShowCompletionModal(false);
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
                                disabled={!selectedAnswer}
                                className={styles.buttonSiguiente}
                            >
                                {currentQuestionIndex === totalQuestions - 1 ? 'Finalizar' : 'Siguiente'}
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

                            {/* Valor numérico y bulbo */}
                            <div 
                                className={styles.thermometerBulb} 
                                style={{ 
                                    background: waterLevel >= 75 
                                        ? 'linear-gradient(135deg, #ff4d4d, #ff3333)'
                                        : waterLevel >= 50 
                                        ? 'linear-gradient(135deg, #ffd700, #ffa500)'
                                        : 'linear-gradient(135deg, #4CAF50, #45a049)'
                                }}
                            >
                                <span className={styles.thermometerValue}>{waterLevel.toFixed(0)}%</span>
                            </div>
                            
                            {/* Etiqueta del nivel */}
                            <div className={styles.thermometerLevelLabel} style={{ color: getWaterLevelColor() }}>
                                {getWaterLevelLabel()}
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
