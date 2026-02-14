/**
 * Admin Panel Security - Cognito Authentication
 * Protege el panel de administración con AWS Cognito
 */

// Configuración de Cognito
const COGNITO_CONFIG = {
    UserPoolId: 'us-east-1_Cg5yUjR6L',
    ClientId: '1gsjecdf86pgdgvvis7l30hha1',
    Region: 'us-east-1'
};

let currentUser = null;
let idToken = null;

// Verificar autenticación inmediatamente
(function checkAuthImmediately() {
    const poolData = {
        UserPoolId: COGNITO_CONFIG.UserPoolId,
        ClientId: COGNITO_CONFIG.ClientId
    };
    
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    currentUser = userPool.getCurrentUser();

    if (!currentUser) {
        console.warn('⛔ No hay sesión activa');
        window.location.href = 'auth.html?redirect=admin-panel.html';
        return;
    }

    // Verificar sesión válida
    currentUser.getSession((err, session) => {
        if (err) {
            console.error('❌ Error obteniendo sesión:', err);
            window.location.href = 'auth.html?redirect=admin-panel.html';
            return;
        }

        if (!session.isValid()) {
            console.warn('⛔ Sesión expirada');
            window.location.href = 'auth.html?redirect=admin-panel.html';
            return;
        }

        idToken = session.getIdToken().getJwtToken();

        // Verificar que sea Admin
        const groups = session.getIdToken().payload['cognito:groups'] || [];
        if (!groups.includes('Admins')) {
            console.error('⛔ Usuario no es administrador');
            alert('⛔ Acceso denegado. Solo administradores pueden acceder a este panel.');
            window.location.href = 'index.html';
            return;
        }

        const username = session.getIdToken().payload['cognito:username'] || 'Admin';
        console.log(`✅ Autenticado como Admin: ${username}`);
        
        // Mostrar nombre del admin en el panel
        const adminNameEl = document.getElementById('admin-name');
        if (adminNameEl) {
            adminNameEl.textContent = username;
        }
    });
})();

// Función para hacer peticiones autenticadas
window.authenticatedFetch = async function(url, options = {}) {
    if (!idToken) {
        throw new Error('No hay token de autenticación');
    }

    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
    };

    return fetch(url, options);
};

// Función para cerrar sesión
window.adminLogout = function() {
    if (currentUser) {
        currentUser.signOut();
        console.log('👋 Sesión cerrada');
    }
    window.location.href = 'index.html';
};
