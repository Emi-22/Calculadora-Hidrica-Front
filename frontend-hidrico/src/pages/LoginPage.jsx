import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

import logoInstitucional from '../assets/logo-itl.png';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    
    // Estados del formulario
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [recordarSesion, setRecordarSesion] = useState(false);
    
    // Estados para validación y feedback
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

    // Función para validar formato de correo electrónico
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Función para validar todos los campos
    const validateForm = () => {
        const newErrors = {};

        // Validar correo electrónico
        if (!correo.trim()) {
            newErrors.correo = 'El correo electrónico es requerido';
        } else if (!validateEmail(correo)) {
            newErrors.correo = 'El correo no es válido';
        }

        // Validar contraseña
        if (!contrasena.trim()) {
            newErrors.contrasena = 'La contraseña es requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // Limpiar mensajes previos
        setSubmitMessage({ type: '', text: '' });
        
        // Validar formulario antes de enviar
        if (!validateForm()) {
            return;
        }

        // Simular envío con estado de carga
        setIsLoading(true);
        
        try {
            // Simular espera de 1-2 segundos
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Simular autenticación: verificar usuarios en localStorage
            const savedUsuarios = localStorage.getItem('usuarios');
            let usuarios = [];
            if (savedUsuarios) {
                usuarios = JSON.parse(savedUsuarios);
            }
            
            // Buscar usuario por correo y contraseña
            const usuarioEncontrado = usuarios.find(
                u => u.correo === correo && u.contrasena === contrasena
            );
            
            // Si no se encuentra, usar credenciales por defecto para admin
            if (!usuarioEncontrado) {
                // Credenciales por defecto para administrador
                if (correo === 'admin@example.com' && contrasena === 'admin123') {
                    const adminUser = {
                        id: 1,
                        usuario: 'admin',
                        correo: 'admin@example.com',
                        rol: 'administrador'
                    };
                    login(adminUser);
                    setSubmitMessage({ 
                        type: 'success', 
                        text: '¡Inicio de sesión exitoso!' 
                    });
                    setTimeout(() => {
                        navigate('/usuarios');
                    }, 1000);
                } else {
                    setSubmitMessage({ 
                        type: 'error', 
                        text: 'Credenciales incorrectas. Por favor intenta nuevamente.' 
                    });
                }
            } else {
                // Usuario encontrado en la lista
                const userData = {
                    id: usuarioEncontrado.id,
                    usuario: usuarioEncontrado.usuario,
                    correo: usuarioEncontrado.correo,
                    rol: usuarioEncontrado.rol
                };
                login(userData);
                setSubmitMessage({ 
                    type: 'success', 
                    text: '¡Inicio de sesión exitoso!' 
                });
                setTimeout(() => {
                    // Redirigir según el rol
                    if (userData.rol === 'administrador') {
                        navigate('/usuarios');
                    } else {
                        navigate('/preguntas');
                    }
                }, 1000);
            }
            
            // Limpiar formulario después de éxito
            if (usuarioEncontrado || (correo === 'admin@example.com' && contrasena === 'admin123')) {
                setCorreo('');
                setContrasena('');
                setErrors({});
            }
        } catch (error) {
            setSubmitMessage({ 
                type: 'error', 
                text: 'Ocurrió un error. Por favor intenta nuevamente.' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Función para limpiar errores cuando el usuario empieza a escribir
    const handleFieldChange = (field, value, setter) => {
        setter(value);
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
        // Limpiar mensaje de éxito/error al modificar campos
        if (submitMessage.type) {
            setSubmitMessage({ type: '', text: '' });
        }
    };

    return (
        <div className={styles.pageContainer}>
            
            {/* Logo Institucional */}
            <img src={logoInstitucional} alt="Logo Institucional" className={styles.logo} />

            {/* Contenedor del formulario centrado */}
            <div className={styles.formContainer}>
                
                <h2 className={styles.title}>Inicia Sesión</h2> 
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    
                    {/* --- Campo Correo Electrónico --- */}
                    <div className={styles.formGroup}>
                        <label htmlFor="correo" className={styles.label}>Correo Electrónico:</label>
                        <input 
                            type="email" 
                            id="correo"
                            className={`${styles.input} ${errors.correo ? styles.inputError : ''}`}
                            placeholder="tu@correo.com"
                            value={correo}
                            onChange={(e) => handleFieldChange('correo', e.target.value, setCorreo)}
                        />
                        {errors.correo && <span className={styles.errorMessage}>{errors.correo}</span>}
                    </div>

                    {/* --- Campo Contraseña --- */}
                    <div className={styles.formGroup}>
                        <label htmlFor="contrasena" className={styles.label}>Contraseña:</label>
                        <input 
                            type="password" 
                            id="contrasena"
                            className={`${styles.input} ${errors.contrasena ? styles.inputError : ''}`}
                            placeholder="••••••••"
                            value={contrasena}
                            onChange={(e) => handleFieldChange('contrasena', e.target.value, setContrasena)}
                        />
                        {errors.contrasena && <span className={styles.errorMessage}>{errors.contrasena}</span>}
                    </div>

                    {/* --- Opción Recordar Sesión --- */}
                    <div className={styles.optionsRow}>
                        <label className={styles.checkboxLabel}>
                            <input 
                                type="checkbox"
                                checked={recordarSesion}
                                onChange={(e) => setRecordarSesion(e.target.checked)}
                                className={styles.checkbox}
                            />
                            <span>Recordar sesión</span>
                        </label>
                        <Link to="/recuperar" className={styles.forgotLink}>
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    {/* --- Mensaje de éxito/error --- */}
                    {submitMessage.type && (
                        <div className={`${styles.submitMessage} ${styles[submitMessage.type]}`}>
                            {submitMessage.text}
                        </div>
                    )}

                    {/* --- Botón de Inicio de Sesión --- */}
                    <button 
                        type="submit" 
                        className={`${styles.submitButton} ${styles.fullWidth}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className={styles.buttonContent}>
                                <span className={styles.spinner}></span>
                                Iniciando sesión...
                            </span>
                        ) : (
                            'Iniciar Sesión'
                        )}
                    </button>

                    {/* --- Enlace a Registro --- */}
                    <div className={styles.registerLink}>
                        <span>¿No tienes cuenta? </span>
                        <Link to="/registro" className={styles.link}>
                            Regístrate aquí
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
