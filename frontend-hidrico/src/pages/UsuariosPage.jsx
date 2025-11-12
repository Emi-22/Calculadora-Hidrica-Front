// src/pages/UsuariosPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './UsuariosPage.module.css';

export default function UsuariosPage() {
    const { user: currentUser } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRol, setFilterRol] = useState('todos');
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' o 'edit'
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [formData, setFormData] = useState({
        usuario: '',
        correo: '',
        contrasena: '',
        rol: 'usuario',
        sexo: '',
        nivelEducativo: ''
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });

    // Cargar usuarios desde localStorage (simulación de API)
    useEffect(() => {
        loadUsuarios();
    }, []);

    const loadUsuarios = () => {
        setIsLoading(true);
        try {
            // Simular carga de usuarios desde localStorage
            const savedUsuarios = localStorage.getItem('usuarios');
            if (savedUsuarios) {
                setUsuarios(JSON.parse(savedUsuarios));
            } else {
                // Datos de ejemplo
                const ejemploUsuarios = [
                    {
                        id: 1,
                        usuario: 'admin',
                        correo: 'admin@example.com',
                        rol: 'administrador',
                        sexo: 'masculino',
                        nivelEducativo: 'universitario',
                        fechaRegistro: new Date().toISOString()
                    },
                    {
                        id: 2,
                        usuario: 'usuario1',
                        correo: 'usuario1@example.com',
                        rol: 'usuario',
                        sexo: 'femenino',
                        nivelEducativo: 'preparatoria',
                        fechaRegistro: new Date().toISOString()
                    }
                ];
                setUsuarios(ejemploUsuarios);
                localStorage.setItem('usuarios', JSON.stringify(ejemploUsuarios));
            }
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            setMessage({ type: 'error', text: 'Error al cargar usuarios' });
        } finally {
            setIsLoading(false);
        }
    };

    // Guardar usuarios en localStorage
    const saveUsuarios = (newUsuarios) => {
        localStorage.setItem('usuarios', JSON.stringify(newUsuarios));
        setUsuarios(newUsuarios);
    };

    // Validar formulario
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.usuario.trim()) {
            newErrors.usuario = 'El usuario es requerido';
        }
        
        if (!formData.correo.trim()) {
            newErrors.correo = 'El correo es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
            newErrors.correo = 'El correo no es válido';
        }
        
        if (modalMode === 'create' && !formData.contrasena.trim()) {
            newErrors.contrasena = 'La contraseña es requerida';
        } else if (formData.contrasena && formData.contrasena.length < 8) {
            newErrors.contrasena = 'La contraseña debe tener al menos 8 caracteres';
        }
        
        if (!formData.rol) {
            newErrors.rol = 'El rol es requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Abrir modal para crear usuario
    const handleCreate = () => {
        setModalMode('create');
        setSelectedUsuario(null);
        setFormData({
            usuario: '',
            correo: '',
            contrasena: '',
            rol: 'usuario',
            sexo: '',
            nivelEducativo: ''
        });
        setErrors({});
        setMessage({ type: '', text: '' });
        setShowModal(true);
    };

    // Abrir modal para editar usuario
    const handleEdit = (usuario) => {
        setModalMode('edit');
        setSelectedUsuario(usuario);
        setFormData({
            usuario: usuario.usuario,
            correo: usuario.correo,
            contrasena: '', // No mostrar contraseña
            rol: usuario.rol,
            sexo: usuario.sexo || '',
            nivelEducativo: usuario.nivelEducativo || ''
        });
        setErrors({});
        setMessage({ type: '', text: '' });
        setShowModal(true);
    };

    // Guardar usuario (crear o editar)
    const handleSave = () => {
        if (!validateForm()) {
            return;
        }

        try {
            let newUsuarios = [...usuarios];
            
            if (modalMode === 'create') {
                const newUsuario = {
                    id: Date.now(),
                    ...formData,
                    fechaRegistro: new Date().toISOString()
                };
                newUsuarios.push(newUsuario);
                setMessage({ type: 'success', text: 'Usuario creado exitosamente' });
            } else {
                const index = newUsuarios.findIndex(u => u.id === selectedUsuario.id);
                if (index !== -1) {
                    newUsuarios[index] = {
                        ...newUsuarios[index],
                        usuario: formData.usuario,
                        correo: formData.correo,
                        rol: formData.rol,
                        sexo: formData.sexo,
                        nivelEducativo: formData.nivelEducativo,
                        ...(formData.contrasena && { contrasena: formData.contrasena })
                    };
                    setMessage({ type: 'success', text: 'Usuario actualizado exitosamente' });
                }
            }
            
            saveUsuarios(newUsuarios);
            setShowModal(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al guardar usuario' });
        }
    };

    // Eliminar usuario
    const handleDelete = (usuario) => {
        if (usuario.id === currentUser?.id) {
            setMessage({ type: 'error', text: 'No puedes eliminar tu propio usuario' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            return;
        }

        if (window.confirm(`¿Estás seguro de eliminar al usuario "${usuario.usuario}"?`)) {
            try {
                const newUsuarios = usuarios.filter(u => u.id !== usuario.id);
                saveUsuarios(newUsuarios);
                setMessage({ type: 'success', text: 'Usuario eliminado exitosamente' });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } catch (error) {
                setMessage({ type: 'error', text: 'Error al eliminar usuario' });
            }
        }
    };

    // Filtrar usuarios
    const filteredUsuarios = usuarios.filter(usuario => {
        const matchesSearch = 
            usuario.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
            usuario.correo.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRol = filterRol === 'todos' || usuario.rol === filterRol;
        
        return matchesSearch && matchesRol;
    });

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <p>Cargando usuarios...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Panel de Administración</h1>
                <p className={styles.subtitle}>Gestión de Usuarios</p>
            </div>

            {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            <div className={styles.controls}>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Buscar por usuario o correo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.filters}>
                    <select
                        value={filterRol}
                        onChange={(e) => setFilterRol(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="todos">Todos los roles</option>
                        <option value="administrador">Administradores</option>
                        <option value="usuario">Usuarios</option>
                    </select>
                    <button onClick={handleCreate} className={styles.createButton}>
                        + Nuevo Usuario
                    </button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>Correo</th>
                            <th>Rol</th>
                            <th>Sexo</th>
                            <th>Nivel Educativo</th>
                            <th>Fecha Registro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsuarios.length === 0 ? (
                            <tr>
                                <td colSpan="8" className={styles.noData}>
                                    No se encontraron usuarios
                                </td>
                            </tr>
                        ) : (
                            filteredUsuarios.map(usuario => (
                                <tr key={usuario.id}>
                                    <td>{usuario.id}</td>
                                    <td>{usuario.usuario}</td>
                                    <td>{usuario.correo}</td>
                                    <td>
                                        <span className={`${styles.badge} ${styles[usuario.rol]}`}>
                                            {usuario.rol}
                                        </span>
                                    </td>
                                    <td>{usuario.sexo || '-'}</td>
                                    <td>{usuario.nivelEducativo || '-'}</td>
                                    <td>
                                        {usuario.fechaRegistro 
                                            ? new Date(usuario.fechaRegistro).toLocaleDateString('es-MX')
                                            : '-'
                                        }
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                onClick={() => handleEdit(usuario)}
                                                className={styles.editButton}
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(usuario)}
                                                className={styles.deleteButton}
                                                title="Eliminar"
                                                disabled={usuario.id === currentUser?.id}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal para crear/editar usuario */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{modalMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}</h2>
                            <button
                                className={styles.closeButton}
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>Usuario *</label>
                                <input
                                    type="text"
                                    value={formData.usuario}
                                    onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                                    className={errors.usuario ? styles.inputError : ''}
                                />
                                {errors.usuario && <span className={styles.errorText}>{errors.usuario}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Correo Electrónico *</label>
                                <input
                                    type="email"
                                    value={formData.correo}
                                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                                    className={errors.correo ? styles.inputError : ''}
                                />
                                {errors.correo && <span className={styles.errorText}>{errors.correo}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Contraseña {modalMode === 'create' && '*'}</label>
                                <input
                                    type="password"
                                    value={formData.contrasena}
                                    onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                                    placeholder={modalMode === 'edit' ? 'Dejar vacío para no cambiar' : ''}
                                    className={errors.contrasena ? styles.inputError : ''}
                                />
                                {errors.contrasena && <span className={styles.errorText}>{errors.contrasena}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Rol *</label>
                                <select
                                    value={formData.rol}
                                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                                    className={errors.rol ? styles.inputError : ''}
                                >
                                    <option value="usuario">Usuario</option>
                                    <option value="administrador">Administrador</option>
                                </select>
                                {errors.rol && <span className={styles.errorText}>{errors.rol}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label>Sexo</label>
                                <select
                                    value={formData.sexo}
                                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="masculino">Masculino</option>
                                    <option value="femenino">Femenino</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Nivel Educativo</label>
                                <select
                                    value={formData.nivelEducativo}
                                    onChange={(e) => setFormData({ ...formData, nivelEducativo: e.target.value })}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="secundaria">Secundaria</option>
                                    <option value="preparatoria">Preparatoria</option>
                                    <option value="universitario">Universitario</option>
                                    <option value="posgrado">Posgrado</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button onClick={() => setShowModal(false)} className={styles.cancelButton}>
                                Cancelar
                            </button>
                            <button onClick={handleSave} className={styles.saveButton}>
                                {modalMode === 'create' ? 'Crear' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
