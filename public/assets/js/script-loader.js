(function() {
    'use strict';

    const scriptsToLoad = [
        'https://sdk.amazonaws.com/js/aws-sdk-2.1563.0.min.js',
        'https://unpkg.com/amazon-cognito-identity-js@6.3.12/dist/amazon-cognito-identity.min.js',
        'assets/js/auth.js',
        'assets/js/console-security.js'
    ];

    // Function to load scripts sequentially
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = false; // Ensure scripts are loaded in order
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script); // Append to head for better practice
        });
    }

    // Load all scripts sequentially
    async function loadAllScripts() {
        for (const scriptSrc of scriptsToLoad) {
            try {
                await loadScript(scriptSrc);
            } catch (error) {
                console.error(`Error loading script: ${scriptSrc}`, error);
            }
        }
        // Initialize AuthManager after all auth scripts are loaded
        if (window.authManager && typeof window.authManager.init === 'function') {
            try {
                // AuthManager se inicializa en su constructor, no requiere una llamada explícita a initialize()
                // Si init() necesita ser llamado manualmente, se hará aquí.
                // Pero AuthManager.init() se llama en el constructor.
                // Solo necesitamos asegurarnos de que la instancia exista.
            } catch (error) {
                console.error('Error al asegurar que AuthManager está disponible:', error);
            }
        } else {
            console.error('window.authManager no está disponible. Posible error de carga.');
        }
        console.log('script-loader.js: Todos los scripts de autenticación cargados y AuthManager procesado.');
        document.dispatchEvent(new Event('authScriptsLoaded')); // Dispatch custom event
    }

    loadAllScripts();

})();