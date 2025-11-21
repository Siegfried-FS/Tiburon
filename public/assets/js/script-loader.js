(function() {
    'use strict';

    // Lista de scripts esenciales para la autenticación y funcionalidad base
    const scriptsToLoad = [
        'https://sdk.amazonaws.com/js/aws-sdk-2.1563.0.min.js',
        'https://unpkg.com/amazon-cognito-identity-js@6.3.12/dist/amazon-cognito-identity.min.js',
        'assets/js/auth.js',
        'assets/js/console-security.js'
    ];

    // Función para cargar un script y devolver una promesa
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = false; // Garantiza que los scripts se carguen en orden
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Función asíncrona para cargar todos los scripts en secuencia
    async function loadAllScripts() {
        for (const scriptSrc of scriptsToLoad) {
            try {
                await loadScript(scriptSrc);
            } catch (error) {
                // Se mantiene este console.error porque es crítico para saber si un script base no cargó
                console.error(`Error crítico al cargar el script: ${scriptSrc}`, error);
            }
        }

        // Una vez que todos los scripts se han cargado, se emite el evento.
        // Otros scripts (como app.js y perfil.js) esperan este evento.
        document.dispatchEvent(new Event('authScriptsLoaded'));
    }

    // Iniciar la carga de scripts
    loadAllScripts();

})();
