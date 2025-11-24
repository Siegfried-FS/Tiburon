// Configuración de AWS Cognito
const cognitoConfig = {
    region: 'us-east-1',
    userPoolId: 'us-east-1_Cg5yUjR6L',
    userPoolWebClientId: '1gsjecdf86pgdgvvis7l30hha1',
    oauth: {
        domain: 'auth.tiburoncp.siegfried-fs.com',
        scope: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
        redirectSignIn: window.location.origin,
        redirectSignOut: window.location.origin,
        responseType: 'code'
    }
};

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Verificar si hay un usuario autenticado al cargar la página
        this.checkAuthState();
    }

    setupEventListeners() {
        // Botón de login
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.signInWithGoogle());
        }

        // Botón de logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.signOut());
        }
    }

    async checkAuthState() {
        try {
            // Verificar si hay un código de autorización en la URL
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            
    async checkAuthState() {
        try {
            // Verificar si hay un código de autorización en la URL
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            
            if (code) {
                await this.handleAuthCallback(code);
                // Limpiar la URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                // Verificar si hay tokens guardados
                const accessToken = sessionStorage.getItem('accessToken');
                const idToken = sessionStorage.getItem('idToken');
                
                if (accessToken && idToken) {
                    try {
                        // Verificar que el token no haya expirado
                        const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
                        const now = Math.floor(Date.now() / 1000);
                        
                        if (tokenPayload.exp > now) {
                            // Token válido, obtener información del usuario
                            const idTokenPayload = JSON.parse(atob(idToken.split('.')[1]));
                            
                            this.currentUser = {
                                name: idTokenPayload.name || idTokenPayload.email,
                                email: idTokenPayload.email,
                                picture: idTokenPayload.picture,
                                groups: idTokenPayload['cognito:groups'] || []
                            };
                            
                            this.updateUI(true);
                            this.setupEventListeners();
                            return;
                        } else {
                            // Token expirado, limpiar
                            sessionStorage.clear();
                        }
                    } catch (error) {
                        console.error('Error parsing tokens:', error);
                        sessionStorage.clear();
                    }
                }
                
                // No hay tokens válidos
                this.updateUI(false);
                this.setupEventListeners();
            }
                // Verificar si hay tokens en localStorage
                const accessToken = sessionStorage.getItem('accessToken');
                if (accessToken) {
                    await this.validateToken(accessToken);
                } else {
                    this.updateUI(false);
                }
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
            this.updateUI(false);
        }
    }

    async handleAuthCallback(code) {
        try {
            // Intercambiar código por tokens
            const tokens = await this.exchangeCodeForTokens(code);
            
            // Guardar tokens
            sessionStorage.setItem('accessToken', tokens.access_token);
            sessionStorage.setItem('idToken', tokens.id_token);
            sessionStorage.setItem('refreshToken', tokens.refresh_token);
            sessionStorage.setItem('justLoggedIn', 'true'); // Flag para el mensaje de bienvenida
            
            // Obtener información del usuario
            await this.getUserInfo(tokens.access_token);
            
        } catch (error) {
            console.error('Error handling auth callback:', error);
            this.updateUI(false);
        }
    }

    async exchangeCodeForTokens(code) {
        const response = await fetch(`https://${cognitoConfig.oauth.domain}/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: cognitoConfig.userPoolWebClientId,
                code: code,
                redirect_uri: cognitoConfig.oauth.redirectSignIn
            })
        });

        if (!response.ok) {
            throw new Error('Failed to exchange code for tokens');
        }

        return await response.json();
    }

    async validateToken(accessToken) {
        try {
            await this.getUserInfo(accessToken);
        } catch (error) {
            console.error('validateToken: La validación del token falló. Error:', error);
            // Token inválido, limpiar localStorage
            this.signOut();
        }
    }

    async getUserInfo(accessToken) {
        // Usamos la API GetUser de Cognito para obtener todos los atributos.
        const response = await fetch(`https://cognito-idp.${cognitoConfig.region}.amazonaws.com/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-amz-json-1.1',
                'X-Amz-Target': 'AWSCognitoIdentityProviderService.GetUser'
            },
            body: JSON.stringify({
                AccessToken: accessToken
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get user info from GetUser API');
        }

        const data = await response.json();
        
        // La respuesta de GetUser es un array de atributos. Lo transformamos a un objeto.
        const userInfo = data.UserAttributes.reduce((acc, attr) => {
            acc[attr.Name] = attr.Value;
            return acc;
        }, {});

        // Decodificar el idToken para obtener los grupos/roles
        const idToken = sessionStorage.getItem('idToken');
        if (idToken) {
            const decodedToken = this.parseJwt(idToken);
            userInfo.groups = decodedToken['cognito:groups'] || [];
        } else {
            userInfo.groups = [];
        }

        this.currentUser = userInfo;
        this.updateUI(true);
    }

    getUserRole() {
        if (!this.currentUser || !this.currentUser.groups) {
            return null;
        }
        // Define la jerarquía de roles, de mayor a menor importancia
        const roleHierarchy = ['Capitán', 'Corsario', 'Navegante', 'Explorador'];
        for (const role of roleHierarchy) {
            if (this.currentUser.groups.includes(role)) {
                return role;
            }
        }
        return 'Explorador'; // Rol por defecto si no tiene otro asignado
    }

    isAdministrator() {
        return this.currentUser && this.currentUser.groups && this.currentUser.groups.includes('Admins');
    }

    parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Error decoding JWT", e);
            return {};
        }
    }

    signInWithGoogle() {
        const authUrl = `https://${cognitoConfig.oauth.domain}/oauth2/authorize?` +
            `response_type=code&` +
            `client_id=${cognitoConfig.userPoolWebClientId}&` +
            `redirect_uri=${encodeURIComponent(cognitoConfig.oauth.redirectSignIn)}&` +
            `scope=${cognitoConfig.oauth.scope.join('%20')}&` +
            `identity_provider=Google&` +
            `prompt=select_account`;
        
        window.location.href = authUrl;
    }

    signOut() {
        // Limpiar sessionStorage
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('idToken');
        sessionStorage.removeItem('refreshToken');
        
        this.currentUser = null;
        this.updateUI(false);
        
        // Redirigir a logout de Cognito para invalidar la sesión también en el proveedor de identidad
        window.location.href = `https://${cognitoConfig.oauth.domain}/logout?client_id=${cognitoConfig.userPoolWebClientId}&logout_uri=${encodeURIComponent(cognitoConfig.oauth.redirectSignOut)}`;
    }

    updateUI(isAuthenticated) {
        const authButtons = document.getElementById('authButtons');
        const userInfoDisplay = document.getElementById('userInfo');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');

        if (isAuthenticated && this.currentUser) {
            // Usuario autenticado
            if (authButtons) authButtons.style.display = 'none';
            if (userInfoDisplay) userInfoDisplay.style.display = 'flex'; // Usar 'flex' para mostrar correctamente el layout
            
            if (userAvatar) userAvatar.src = this.currentUser.picture || '/assets/images/profile-photo.jpg';
            if (userName) userName.textContent = this.currentUser.name || this.currentUser.email;
            
            // Mostrar insignia de admin si corresponde
            const adminBadge = document.getElementById('admin-badge');
            const userRoleBadge = document.getElementById('user-role');
            const adminPanelBtn = document.getElementById('adminPanelBtn');

            if (this.isAdministrator()) {
                if(adminBadge) adminBadge.style.display = 'inline-block';
                if(userRoleBadge) userRoleBadge.style.display = 'none';
                if(adminPanelBtn) adminPanelBtn.style.display = 'block';
            } else {
                if(adminBadge) adminBadge.style.display = 'none';
                if(adminPanelBtn) adminPanelBtn.style.display = 'none';
                const userRole = this.getUserRole();
                if (userRole && userRoleBadge) {
                    userRoleBadge.textContent = userRole;
                    userRoleBadge.style.display = 'inline-block';
                } else if (userRoleBadge) {
                    userRoleBadge.style.display = 'none';
                }
            }

            this.setupUserMenuListeners(); // Configurar listeners para los elementos del menú de usuario

            // Mostrar mensaje de bienvenida si acaba de iniciar sesión
            if (sessionStorage.getItem('justLoggedIn') === 'true') {
                alert(`¡Bienvenido, ${this.currentUser.name || this.currentUser.email} al AWS User Group Playa Vicente!`);
                sessionStorage.removeItem('justLoggedIn');
                
                // Verificar si hay un redirect pendiente
                const postLoginRedirect = sessionStorage.getItem('postLoginRedirect');
                if (postLoginRedirect) {
                    sessionStorage.removeItem('postLoginRedirect');
                    // Redirigir después de un breve delay para que se vea el mensaje
                    setTimeout(() => {
                        window.location.href = postLoginRedirect + '.html';
                    }, 1500);
                }
            }

        } else {
            // Usuario no autenticado
            if (authButtons) authButtons.style.display = 'flex'; // Usar 'flex' para mostrar correctamente el layout
            if (userInfoDisplay) userInfoDisplay.style.display = 'none';
            
            if (userAvatar) userAvatar.src = '/assets/images/profile-photo.jpg'; // Resetear a la imagen por defecto
            if (userName) userName.textContent = ''; // Limpiar nombre de usuario
        }
        
        // Notificar al resto de la aplicación que el estado de autenticación está resuelto
        document.dispatchEvent(new CustomEvent('authStateReady', { detail: { isAuthenticated } }));
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    setupUserMenuListeners() {
        const userInfoContainer = document.getElementById('userInfo');
        const userDropdownContent = document.querySelector('.user-dropdown-menu');
        let menuTimeout;

        if (!userInfoContainer || !userDropdownContent) return;

        const openMenu = () => {
            clearTimeout(menuTimeout);
            userDropdownContent.classList.add('show');
        };

        const closeMenu = () => {
            menuTimeout = setTimeout(() => {
                userDropdownContent.classList.remove('show');
            }, 300); // Un pequeño delay para que el usuario pueda mover el ratón
        };

        userInfoContainer.addEventListener('mouseenter', openMenu);
        userDropdownContent.addEventListener('mouseenter', openMenu);

        userInfoContainer.addEventListener('mouseleave', closeMenu);
        userDropdownContent.addEventListener('mouseleave', closeMenu);

        // Cierre forzado si se hace clic en cualquier otro lugar
        window.addEventListener('click', (event) => {
            if (!userInfoContainer.contains(event.target)) {
                userDropdownContent.classList.remove('show');
            }
        });

        // Abrir también con un clic en el avatar, para consistencia
        userInfoContainer.addEventListener('click', (event) => {
            event.stopPropagation();
            userDropdownContent.classList.toggle('show');
        });
    }

    async updateUserAttributes(attributesToUpdate) {
        const accessToken = sessionStorage.getItem('accessToken');
        if (!accessToken) {
            throw new Error('No estás autenticado.');
        }

        const userAttributes = Object.entries(attributesToUpdate).map(([key, value]) => ({
            Name: key,
            Value: value
        }));

        try {
            const response = await fetch(`https://cognito-idp.${cognitoConfig.region}.amazonaws.com/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-amz-json-1.1',
                    'X-Amz-Target': 'AWSCognitoIdentityProviderService.UpdateUserAttributes'
                },
                body: JSON.stringify({
                    AccessToken: accessToken,
                    UserAttributes: userAttributes
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error al actualizar atributos en Cognito:', errorData);
                throw new Error(errorData.message || 'No se pudieron actualizar los atributos.');
            }
            
            // Atributos actualizados con éxito, ahora actualizamos la data local
            for (const attr of userAttributes) {
                this.currentUser[attr.Name] = attr.Value;
            }
            
            // Forzar una actualización de la UI si es necesario (ej. el nombre en el header)
            this.updateUI(true);

            return { success: true };

        } catch (error) {
            console.error('Error en la llamada a updateUserAttributes:', error);
            throw error;
        }
    }

    editUserProfile() {
        // Esta función ahora simplemente redirige a la página de perfil.
        window.location.href = '/perfil.html';
    }

    deleteAccount() {
        console.log('--- Eliminar Cuenta ---');
        console.log('Esta es una operación sensible y debe ser manejada con cuidado.');
        console.log('Para implementar esto, necesitarías:');
        console.log('1. Confirmar la acción con el usuario (ej. pedir contraseña o una doble confirmación).');
        console.log('2. Utilizar el AWS SDK para llamar a la API de Cognito para eliminar el usuario (AdminDeleteUser API si es desde un backend, o deleteUser si es desde el cliente y se requiere la contraseña).');
        console.log('3. Considerar la eliminación de datos asociados al usuario en otros servicios (S3, DynamoDB, etc.) a través de un backend.');
        if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.')) {
            alert('Funcionalidad "Eliminar Cuenta" en desarrollo. Se requiere implementación de backend/Cognito. Consulta la consola para más detalles.');
        }
    }
}

// Crear e inicializar el gestor de autenticación
window.authManager = new AuthManager();

// Show admin navigation if user is admin
async function updateAdminNavigation() {
    try {
        // Verificar si hay usuario autenticado
        if (!window.authManager || !window.authManager.currentUser) {
            return;
        }

        const isAdmin = window.authManager.isAdministrator();
        
        // Show/hide admin link in navigation
        const adminNavItems = document.querySelectorAll('#adminNavItem, .admin-nav-item, #adminPanelBtn');
        adminNavItems.forEach(item => {
            if (item) {
                item.style.display = isAdmin ? 'block' : 'none';
            }
        });
        
    } catch (error) {
        console.error('Error updating admin navigation:', error);
    }
}

// Call this after page loads
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si hay tokens y actualizar UI inmediatamente
    const accessToken = sessionStorage.getItem('accessToken');
    const idToken = sessionStorage.getItem('idToken');
    
    if (accessToken && idToken) {
        try {
            const tokenPayload = JSON.parse(atob(idToken.split('.')[1]));
            const groups = tokenPayload['cognito:groups'] || [];
            
            window.authManager.currentUser = {
                name: tokenPayload.name || tokenPayload.email,
                email: tokenPayload.email,
                picture: tokenPayload.picture,
                groups: groups
            };
            
            window.authManager.updateUI(true);
        } catch (error) {
            console.error('Error parsing token:', error);
            sessionStorage.clear();
        }
    }
    
    updateAdminNavigation();
});
