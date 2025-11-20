// Protecciones de seguridad reales para el sitio
(function() {
    'use strict';
    
    // 1. Protección contra inyección de scripts maliciosos
    const originalEval = window.eval;
    window.eval = function(code) {
        console.warn('🚨 Intento de eval() bloqueado por seguridad');
        throw new Error('eval() está deshabilitado por seguridad');
    };
    
    // 2. Protección contra Function constructor malicioso
    const originalFunction = window.Function;
    window.Function = function(...args) {
        console.warn('🚨 Intento de Function() constructor bloqueado');
        throw new Error('Function constructor deshabilitado por seguridad');
    };
    
    // 3. Protección contra modificación del DOM crítico
    const criticalElements = ['script', 'iframe', 'object', 'embed'];
    const originalCreateElement = document.createElement;
    
    document.createElement = function(tagName) {
        if (criticalElements.includes(tagName.toLowerCase())) {
            console.warn(`🚨 Intento de crear elemento ${tagName} bloqueado`);
            // Permitir solo si viene de nuestro código
            const stack = new Error().stack;
            if (!stack.includes('auth.js') && !stack.includes('app.js')) {
                throw new Error(`Creación de ${tagName} bloqueada por seguridad`);
            }
        }
        return originalCreateElement.call(document, tagName);
    };
    
    // 4. Protección contra modificación de cookies críticas
    const originalCookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
    Object.defineProperty(document, 'cookie', {
        get: originalCookieDescriptor.get,
        set: function(value) {
            // Bloquear modificación de cookies de autenticación
            if (value.includes('CognitoIdentityServiceProvider') || 
                value.includes('accessToken') || 
                value.includes('idToken')) {
                console.warn('🚨 Intento de modificar cookie de autenticación bloqueado');
                return;
            }
            return originalCookieDescriptor.set.call(this, value);
        }
    });
    
    // 5. Protección contra acceso a localStorage crítico
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;
    const originalRemoveItem = localStorage.removeItem;
    
    localStorage.setItem = function(key, value) {
        if (key.includes('CognitoIdentityServiceProvider') || 
            key.includes('aws-cognito') ||
            key.includes('accessToken')) {
            const stack = new Error().stack;
            if (!stack.includes('auth.js') && !stack.includes('amazon-cognito-identity')) {
                console.warn('🚨 Intento de modificar datos de autenticación bloqueado');
                return;
            }
        }
        return originalSetItem.call(this, key, value);
    };
    
    // 6. Detección de herramientas de hacking comunes
    const suspiciousPatterns = [
        'document.write',
        'innerHTML',
        'outerHTML',
        'insertAdjacentHTML',
        'eval(',
        'Function(',
        'setTimeout(',
        'setInterval(',
        'XMLHttpRequest',
        'fetch('
    ];
    
    // Monitor de actividad sospechosa
    let suspiciousActivity = 0;
    const originalConsoleLog = console.log;
    
    console.log = function(...args) {
        const message = args.join(' ');
        suspiciousPatterns.forEach(pattern => {
            if (message.includes(pattern)) {
                suspiciousActivity++;
                if (suspiciousActivity > 3) {
                    console.warn('🚨 Actividad sospechosa detectada - Reportando...');
                    // Aquí podrías enviar un log a tu servidor
                    reportSuspiciousActivity(message);
                }
            }
        });
        return originalConsoleLog.apply(console, args);
    };
    
    // 7. Protección contra clickjacking
    if (window.top !== window.self) {
        console.warn('🚨 Posible clickjacking detectado');
        window.top.location = window.self.location;
    }
    
    // 8. Protección contra modificación de headers críticos
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        // Verificar que no se modifiquen headers de autenticación
        if (options.headers) {
            const headers = new Headers(options.headers);
            if (headers.has('Authorization') || headers.has('X-Amz-Security-Token')) {
                const stack = new Error().stack;
                if (!stack.includes('auth.js') && !stack.includes('aws-sdk')) {
                    console.warn('🚨 Intento de modificar headers de autenticación bloqueado');
                    delete options.headers['Authorization'];
                    delete options.headers['X-Amz-Security-Token'];
                }
            }
        }
        return originalFetch.call(this, url, options);
    };
    
    // 9. Función para reportar actividad sospechosa
    function reportSuspiciousActivity(activity) {
        // En producción, esto enviaría datos a tu servidor de logs
        const report = {
            timestamp: new Date().toISOString(),
            activity: activity,
            userAgent: navigator.userAgent,
            url: window.location.href,
            referrer: document.referrer
        };
        
        console.warn('🚨 Reporte de seguridad:', report);
        
        // Opcional: Enviar a endpoint de seguridad
        // fetch('/api/security-report', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(report)
        // });
    }
    
    // 10. Protección contra modificación de variables globales críticas
    Object.defineProperty(window, 'AuthManager', {
        writable: false,
        configurable: false
    });
    
    Object.defineProperty(window, 'AWSConfig', {
        writable: false,
        configurable: false
    });
    
    // 11. Detección de extensiones maliciosas del navegador
    setTimeout(() => {
        const suspiciousExtensions = [
            'chrome-extension://',
            'moz-extension://',
            'safari-extension://'
        ];
        
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
            if (script.src) {
                suspiciousExtensions.forEach(ext => {
                    if (script.src.includes(ext)) {
                        console.warn('🚨 Script de extensión detectado:', script.src);
                        reportSuspiciousActivity(`Extension script: ${script.src}`);
                    }
                });
            }
        });
    }, 2000);
    
    console.log('🛡️ Protecciones de seguridad activadas');
    
})();
