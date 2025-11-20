// Componentes de UI para Autenticación
class AuthUI {
    constructor() {
        this.isModalOpen = false;
        this.currentModal = null;
    }

    // Inicializar componentes de UI
    init() {
        this.createAuthModals();
        this.addAuthButtonsToHeader();
        this.bindEvents();
        this.updateUIBasedOnAuth();
    }

    // Agregar botones de auth al header existente
    addAuthButtonsToHeader() {
        // Esperar a que el header se cargue
        const checkHeader = () => {
            const navMenu = document.getElementById('nav-menu');
            if (navMenu && !document.getElementById('authButtons')) {
                // Crear elemento de navegación para auth
                const authNavItem = document.createElement('li');
                authNavItem.className = 'auth-nav-item';
                authNavItem.innerHTML = `
                    <div id="authButtons" class="auth-buttons">
                        <button id="loginBtn" class="btn-secondary">Iniciar Sesión</button>
                        <button id="registerBtn" class="btn-primary">Registrarse</button>
                    </div>
                    <div id="userMenu" class="user-menu" style="display: none;">
                        <span id="userName">Usuario</span>
                        <div class="user-dropdown">
                            <button id="dashboardBtn">Dashboard</button>
                            <button id="logoutBtn">Cerrar Sesión</button>
                        </div>
                    </div>
                `;
                
                // Agregar antes del botón de tema
                const themeButton = navMenu.querySelector('.theme-toggle');
                if (themeButton && themeButton.parentElement) {
                    navMenu.insertBefore(authNavItem, themeButton.parentElement);
                } else {
                    navMenu.appendChild(authNavItem);
                }
                
                // Rebind events después de agregar elementos
                this.bindEvents();
            } else if (!navMenu) {
                // Si el header no se ha cargado, intentar de nuevo
                setTimeout(checkHeader, 100);
            }
        };
        
        checkHeader();
    }

    // Crear modales de login y registro
    createAuthModals() {
        const modalHTML = `
            <!-- Modal de Login -->
            <div id="loginModal" class="auth-modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Iniciar Sesión</h2>
                        <button class="close-modal" data-modal="loginModal">&times;</button>
                    </div>
                    
                    <!-- Botones de OAuth -->
                    <div class="oauth-buttons">
                        <button type="button" id="googleSignInLogin" class="btn-google">
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continuar con Google
                        </button>
                    </div>
                    
                    <div class="divider">
                        <span>o</span>
                    </div>
                    
                    <form id="loginForm" class="auth-form">
                        <div class="form-group">
                            <label for="loginEmail">Email:</label>
                            <input type="email" id="loginEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">Contraseña:</label>
                            <input type="password" id="loginPassword" required>
                        </div>
                        <button type="submit" class="btn-primary">Iniciar Sesión</button>
                        <div class="auth-links">
                            <a href="#" id="showRegister">¿No tienes cuenta? Regístrate</a>
                        </div>
                    </form>
                    <div id="loginError" class="error-message" style="display: none;"></div>
                </div>
            </div>

            <!-- Modal de Registro -->
            <div id="registerModal" class="auth-modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Crear Cuenta</h2>
                        <button class="close-modal" data-modal="registerModal">&times;</button>
                    </div>
                    
                    <!-- Botones de OAuth -->
                    <div class="oauth-buttons">
                        <button type="button" id="googleSignIn" class="btn-google">
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continuar con Google
                        </button>
                    </div>
                    
                    <div class="divider">
                        <span>o</span>
                    </div>
                    
                    <form id="registerForm" class="auth-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="registerName">Nombre completo:</label>
                                <input type="text" id="registerName" required>
                            </div>
                            <div class="form-group">
                                <label for="registerAge">Edad:</label>
                                <input type="number" id="registerAge" min="13" max="100">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="registerEmail">Email:</label>
                            <input type="email" id="registerEmail" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="registerCity">Ciudad:</label>
                                <input type="text" id="registerCity" placeholder="Ej: Playa Vicente, Veracruz">
                            </div>
                            <div class="form-group">
                                <label for="registerCountry">País:</label>
                                <select id="registerCountry">
                                    <option value="">Seleccionar...</option>
                                    <option value="MX">México</option>
                                    <option value="US">Estados Unidos</option>
                                    <option value="ES">España</option>
                                    <option value="AR">Argentina</option>
                                    <option value="CO">Colombia</option>
                                    <option value="other">Otro</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="registerEducation">Nivel de estudios:</label>
                            <select id="registerEducation">
                                <option value="">Seleccionar...</option>
                                <option value="high_school">Preparatoria/Bachillerato</option>
                                <option value="technical">Técnico/Tecnólogo</option>
                                <option value="bachelor">Licenciatura/Ingeniería</option>
                                <option value="master">Maestría</option>
                                <option value="phd">Doctorado</option>
                                <option value="other">Otro</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="registerProfession">Profesión/Área:</label>
                            <select id="registerProfession">
                                <option value="">Seleccionar...</option>
                                <option value="developer">Desarrollador/Programador</option>
                                <option value="sysadmin">Administrador de Sistemas</option>
                                <option value="devops">DevOps/SRE</option>
                                <option value="data">Ciencia de Datos/Analytics</option>
                                <option value="security">Ciberseguridad</option>
                                <option value="student">Estudiante</option>
                                <option value="manager">Gerente/Manager IT</option>
                                <option value="consultant">Consultor</option>
                                <option value="other">Otro</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="registerExperience">Experiencia con AWS:</label>
                            <select id="registerExperience">
                                <option value="">Seleccionar...</option>
                                <option value="none">Sin experiencia</option>
                                <option value="beginner">Principiante (< 1 año)</option>
                                <option value="intermediate">Intermedio (1-3 años)</option>
                                <option value="advanced">Avanzado (3+ años)</option>
                                <option value="expert">Experto/Arquitecto</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="registerPassword">Contraseña:</label>
                            <input type="password" id="registerPassword" required>
                            <div class="password-strength" id="passwordStrength">
                                <div class="strength-bar">
                                    <div class="strength-fill" id="strengthFill"></div>
                                </div>
                                <span class="strength-text" id="strengthText">Ingresa una contraseña</span>
                            </div>
                            <small>Mínimo 12 caracteres, incluir: mayúscula, minúscula, número y símbolo especial (!@#$%^&*)</small>
                        </div>
                        
                        <div class="form-group checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="registerNewsletter" checked>
                                <span class="checkmark"></span>
                                Quiero recibir notificaciones de eventos y contenido nuevo
                            </label>
                        </div>
                        
                        <button type="submit" class="btn-primary">Crear Cuenta</button>
                        <div class="auth-links">
                            <a href="#" id="showLogin">¿Ya tienes cuenta? Inicia sesión</a>
                        </div>
                    </form>
                    <div id="registerError" class="error-message" style="display: none;"></div>
                    <div id="registerSuccess" class="success-message" style="display: none;"></div>
                </div>
            </div>
        `;

        // Agregar al DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Vincular eventos
    bindEvents() {
        // Botones principales
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        
        if (loginBtn && !loginBtn.hasAttribute('data-bound')) {
            loginBtn.addEventListener('click', () => this.showModal('loginModal'));
            loginBtn.setAttribute('data-bound', 'true');
        }
        
        if (registerBtn && !registerBtn.hasAttribute('data-bound')) {
            registerBtn.addEventListener('click', () => this.showModal('registerModal'));
            registerBtn.setAttribute('data-bound', 'true');
        }
        
        // Enlaces entre modales
        const showRegister = document.getElementById('showRegister');
        const showLogin = document.getElementById('showLogin');
        
        if (showRegister && !showRegister.hasAttribute('data-bound')) {
            showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchModal('loginModal', 'registerModal');
            });
            showRegister.setAttribute('data-bound', 'true');
        }
        
        if (showLogin && !showLogin.hasAttribute('data-bound')) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchModal('registerModal', 'loginModal');
            });
            showLogin.setAttribute('data-bound', 'true');
        }

        // Cerrar modales
        document.querySelectorAll('.close-modal').forEach(btn => {
            if (!btn.hasAttribute('data-bound')) {
                btn.addEventListener('click', (e) => {
                    this.closeModal(e.target.dataset.modal);
                });
                btn.setAttribute('data-bound', 'true');
            }
        });

        // Cerrar modal al hacer clic fuera
        document.querySelectorAll('.auth-modal').forEach(modal => {
            if (!modal.hasAttribute('data-bound')) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.closeModal(modal.id);
                    }
                });
                modal.setAttribute('data-bound', 'true');
            }
        });

        // Formularios
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginForm && !loginForm.hasAttribute('data-bound')) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            loginForm.setAttribute('data-bound', 'true');
        }
        
        if (registerForm && !registerForm.hasAttribute('data-bound')) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
            registerForm.setAttribute('data-bound', 'true');
        }
        
        // Password strength indicator
        const passwordInput = document.getElementById('registerPassword');
        if (passwordInput && !passwordInput.hasAttribute('data-bound')) {
            passwordInput.addEventListener('input', (e) => this.updatePasswordStrength(e.target.value));
            passwordInput.setAttribute('data-bound', 'true');
        }
    }

    // Mostrar modal
    showModal(modalId) {
        this.closeAllModals();
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            this.currentModal = modalId;
            this.isModalOpen = true;
        }
    }

    // Cambiar entre modales
    switchModal(fromModal, toModal) {
        this.closeModal(fromModal);
        setTimeout(() => this.showModal(toModal), 100);
    }

    // Cerrar modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            this.isModalOpen = false;
            this.currentModal = null;
            this.clearErrors();
        }
    }

    // Cerrar todos los modales
    closeAllModals() {
        document.querySelectorAll('.auth-modal').forEach(modal => {
            modal.style.display = 'none';
        });
        this.isModalOpen = false;
        this.currentModal = null;
    }

    // Manejar login
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        this.showLoading('loginForm');
        this.clearErrors();

        try {
            await window.AuthManager.login(email, password);
            this.closeModal('loginModal');
            this.updateUIBasedOnAuth();
            this.showSuccess('¡Bienvenido de vuelta!');
        } catch (error) {
            this.showError('loginError', this.getErrorMessage(error));
        } finally {
            this.hideLoading('loginForm');
        }
    }

    // Manejar registro
    async handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const age = document.getElementById('registerAge').value;
        const city = document.getElementById('registerCity').value.trim();
        const country = document.getElementById('registerCountry').value;
        const education = document.getElementById('registerEducation').value;
        const profession = document.getElementById('registerProfession').value;
        const experience = document.getElementById('registerExperience').value;
        const newsletter = document.getElementById('registerNewsletter').checked;
        const password = document.getElementById('registerPassword').value;
        
        this.showLoading('registerForm');
        this.clearErrors();

        try {
            const result = await window.AuthManager.register(
                email, 
                password, 
                name, 
                {
                    age,
                    city,
                    country,
                    education,
                    profession,
                    experience,
                    newsletter
                }
            );
            
            if (result.userConfirmed) {
                this.showSuccess('¡Cuenta creada exitosamente! Ya puedes iniciar sesión.');
                setTimeout(() => this.switchModal('registerModal', 'loginModal'), 2000);
            } else {
                this.showSuccess('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.');
            }
        } catch (error) {
            this.showError('registerError', this.getErrorMessage(error));
        } finally {
            this.hideLoading('registerForm');
        }
    }

    // Manejar logout
    async handleLogout() {
        try {
            await window.AuthManager.logout();
            this.updateUIBasedOnAuth();
            this.showSuccess('Sesión cerrada correctamente');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    // Manejar autenticación con Google
    async handleGoogleAuth() {
        try {
            const config = window.AWSConfig.getConfig();
            const cognitoDomain = `https://tiburon-user-pool.auth.${config.region}.amazoncognito.com`;
            
            const params = new URLSearchParams({
                identity_provider: 'Google',
                redirect_uri: window.location.origin,
                response_type: 'code',
                client_id: config.clientId,
                scope: 'email openid profile'
            });
            
            const authUrl = `${cognitoDomain}/oauth2/authorize?${params.toString()}`;
            window.location.href = authUrl;
        } catch (error) {
            console.error('Error with Google auth:', error);
            this.showError('loginError', 'Error al conectar con Google');
        }
    }

    // Actualizar UI basada en estado de autenticación
    async updateUIBasedOnAuth() {
        const isAuthenticated = window.AuthManager.isAuthenticated();
        
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        
        if (isAuthenticated) {
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';
            
            // Actualizar nombre de usuario
            try {
                const userInfo = await window.AuthManager.getCurrentUserInfo();
                const userName = document.getElementById('userName');
                if (userName && userInfo.name) {
                    userName.textContent = userInfo.name;
                }
            } catch (error) {
                console.error('Error getting user info:', error);
            }
        } else {
            if (authButtons) authButtons.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    // Mostrar loading
    showLoading(formId) {
        const form = document.getElementById(formId);
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Cargando...';
        }
    }

    // Ocultar loading
    hideLoading(formId) {
        const form = document.getElementById(formId);
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = formId === 'loginForm' ? 'Iniciar Sesión' : 'Crear Cuenta';
        }
    }

    // Mostrar error
    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    // Mostrar éxito
    showSuccess(message) {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Limpiar errores
    clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });
    }

    // Obtener mensaje de error amigable
    getErrorMessage(error) {
        const errorMessages = {
            'UserNotFoundException': 'Usuario no encontrado',
            'NotAuthorizedException': 'Email o contraseña incorrectos',
            'UserNotConfirmedException': 'Debes confirmar tu email antes de iniciar sesión',
            'UsernameExistsException': 'Ya existe una cuenta con este email',
            'InvalidPasswordException': 'La contraseña no cumple con los requisitos',
            'InvalidParameterException': 'Parámetros inválidos'
        };
        
    // Obtener mensaje de error amigable
    getErrorMessage(error) {
        const errorMessages = {
            'UserNotFoundException': 'Usuario no encontrado',
            'NotAuthorizedException': 'Email o contraseña incorrectos',
            'UserNotConfirmedException': 'Debes confirmar tu email antes de iniciar sesión',
            'UsernameExistsException': 'Ya existe una cuenta con este email',
            'InvalidPasswordException': 'La contraseña no cumple con los requisitos de seguridad',
            'InvalidParameterException': 'Parámetros inválidos'
        };
        
        return errorMessages[error.code] || error.message || 'Ha ocurrido un error';
    }

    // Actualizar indicador de fortaleza de contraseña
    updatePasswordStrength(password) {
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        
        if (!strengthFill || !strengthText) return;
        
        let score = 0;
        let feedback = [];
        
        // Criterios de evaluación
        if (password.length >= 12) score += 20;
        else feedback.push('Mínimo 12 caracteres');
        
        if (/[A-Z]/.test(password)) score += 20;
        else feedback.push('Una mayúscula');
        
        if (/[a-z]/.test(password)) score += 20;
        else feedback.push('Una minúscula');
        
        if (/\d/.test(password)) score += 20;
        else feedback.push('Un número');
        
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) score += 20;
        else feedback.push('Un símbolo especial');
        
        // Penalizaciones
        if (/123456|password|qwerty|admin|letmein/i.test(password)) {
            score -= 30;
            feedback.push('Evita patrones comunes');
        }
        
        if (/^(.)\1+$/.test(password)) {
            score -= 40;
            feedback.push('No uses caracteres repetidos');
        }
        
        // Actualizar UI
        score = Math.max(0, Math.min(100, score));
        strengthFill.style.width = score + '%';
        
        if (score < 40) {
            strengthFill.className = 'strength-fill weak';
            strengthText.textContent = 'Débil: ' + feedback.slice(0, 2).join(', ');
        } else if (score < 80) {
            strengthFill.className = 'strength-fill medium';
            strengthText.textContent = 'Media: ' + (feedback.length > 0 ? feedback.slice(0, 1).join(', ') : 'Mejorando');
        } else {
            strengthFill.className = 'strength-fill strong';
            strengthText.textContent = feedback.length === 0 ? '¡Contraseña segura!' : 'Fuerte: ' + feedback[0];
        }
    }

    // Generar contraseña segura
    generateSecurePassword() {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        let password = '';
        
        // Asegurar al menos uno de cada tipo
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];
        
        // Completar con caracteres aleatorios
        const allChars = uppercase + lowercase + numbers + symbols;
        for (let i = password.length; i < 16; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        
        // Mezclar caracteres
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    // Esperar a que se cargue el header
    setTimeout(async () => {
        try {
            // Inicializar AuthManager
            await window.AuthManager.initialize();
            
            // Inicializar UI
            const authUI = new AuthUI();
            authUI.init();
            
            // Hacer disponible globalmente
            window.AuthUI = authUI;
        } catch (error) {
            console.error('Error initializing auth system:', error);
        }
    }, 500); // Esperar medio segundo para que se cargue el header
});
