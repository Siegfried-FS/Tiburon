// Sistema de monitoreo de integridad del sitio
(function() {
    'use strict';
    
    // Hashes esperados de archivos críticos (en producción usar SRI)
    const expectedHashes = {
        'auth.js': 'expected_hash_here',
        'aws-config.js': 'expected_hash_here'
    };
    
    // 1. Verificar integridad de scripts críticos
    function verifyScriptIntegrity() {
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            const src = script.src;
            if (src.includes('auth.js') || src.includes('aws-config.js')) {
                // En producción, verificar hash SRI
                if (!script.integrity) {
                    console.warn('🚨 Script crítico sin verificación de integridad:', src);
                }
            }
        });
    }
    
    // 2. Monitorear cambios en el DOM crítico
    const criticalSelectors = [
        'script[src*="auth"]',
        'script[src*="aws"]',
        'form[id*="login"]',
        'form[id*="register"]'
    ];
    
    function setupDOMMonitoring() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Verificar si se agregaron elementos sospechosos
                            if (node.tagName === 'SCRIPT' || node.tagName === 'IFRAME') {
                                const src = node.src || node.innerHTML;
                                if (src && !isWhitelistedSource(src)) {
                                    console.warn('🚨 Elemento sospechoso agregado:', node);
                                    reportSecurityIncident('suspicious_element_added', {
                                        tagName: node.tagName,
                                        src: src,
                                        innerHTML: node.innerHTML.substring(0, 100)
                                    });
                                }
                            }
                        }
                    });
                }
                
                // Monitorear cambios en atributos críticos
                if (mutation.type === 'attributes') {
                    const target = mutation.target;
                    if (target.tagName === 'FORM' && mutation.attributeName === 'action') {
                        const newAction = target.getAttribute('action');
                        if (newAction && !isWhitelistedURL(newAction)) {
                            console.warn('🚨 Acción de formulario modificada:', newAction);
                            reportSecurityIncident('form_action_modified', {
                                formId: target.id,
                                newAction: newAction
                            });
                        }
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'action', 'href']
        });
    }
    
    // 3. Lista blanca de fuentes permitidas
    function isWhitelistedSource(src) {
        const whitelist = [
            'assets/js/',
            'https://sdk.amazonaws.com',
            'https://unpkg.com/amazon-cognito-identity-js',
            'https://cdnjs.cloudflare.com'
        ];
        
        return whitelist.some(allowed => src.includes(allowed));
    }
    
    function isWhitelistedURL(url) {
        const whitelist = [
            window.location.origin,
            'https://tiburoncp.siegfried-fs.com',
            'https://auth.tiburoncp.siegfried-fs.com'
        ];
        
        return whitelist.some(allowed => url.startsWith(allowed));
    }
    
    // 4. Verificar configuración de seguridad del navegador
    function checkBrowserSecurity() {
        const securityChecks = {
            https: window.location.protocol === 'https:',
            cookieSecure: document.cookie.includes('Secure'),
            noReferrer: document.referrer === '' || document.referrer.includes(window.location.hostname),
            csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]') !== null
        };
        
        Object.entries(securityChecks).forEach(([check, passed]) => {
            if (!passed) {
                console.warn(`🚨 Verificación de seguridad fallida: ${check}`);
            }
        });
        
        return securityChecks;
    }
    
    // 5. Monitorear intentos de acceso a datos sensibles
    function monitorSensitiveDataAccess() {
        const sensitiveKeys = [
            'CognitoIdentityServiceProvider',
            'aws-cognito-identity-id',
            'accessToken',
            'idToken',
            'refreshToken'
        ];
        
        const originalGetItem = localStorage.getItem;
        localStorage.getItem = function(key) {
            if (sensitiveKeys.some(sensitive => key.includes(sensitive))) {
                const stack = new Error().stack;
                if (!stack.includes('auth.js') && !stack.includes('amazon-cognito-identity')) {
                    console.warn('🚨 Acceso no autorizado a datos sensibles:', key);
                    reportSecurityIncident('unauthorized_sensitive_access', {
                        key: key,
                        stack: stack.split('\n').slice(0, 3)
                    });
                }
            }
            return originalGetItem.call(this, key);
        };
    }
    
    // 6. Sistema de reporte de incidentes de seguridad
    function reportSecurityIncident(type, details) {
        const incident = {
            type: type,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            details: details,
            sessionId: generateSessionId()
        };
        
        console.error('🚨 INCIDENTE DE SEGURIDAD:', incident);
        
        // En producción, enviar a endpoint de seguridad
        // fetch('/api/security-incident', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(incident)
        // });
        
        // Almacenar localmente para análisis
        const incidents = JSON.parse(localStorage.getItem('security_incidents') || '[]');
        incidents.push(incident);
        localStorage.setItem('security_incidents', JSON.stringify(incidents.slice(-10))); // Mantener últimos 10
    }
    
    // 7. Generar ID de sesión único
    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // 8. Verificar si el sitio está siendo ejecutado en un contexto seguro
    function verifySecureContext() {
        if (!window.isSecureContext) {
            console.warn('🚨 Sitio no está en contexto seguro (HTTPS requerido)');
            reportSecurityIncident('insecure_context', {
                protocol: window.location.protocol,
                host: window.location.host
            });
        }
    }
    
    // 9. Inicializar todas las protecciones
    function initializeIntegrityMonitoring() {
        verifyScriptIntegrity();
        setupDOMMonitoring();
        checkBrowserSecurity();
        monitorSensitiveDataAccess();
        verifySecureContext();
        
        console.log('🛡️ Sistema de monitoreo de integridad activado');
    }
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeIntegrityMonitoring);
    } else {
        initializeIntegrityMonitoring();
    }
    
    // Exponer función para verificar estado de seguridad
    window.tiburon = window.tiburon || {};
    window.tiburon.securityStatus = function() {
        const incidents = JSON.parse(localStorage.getItem('security_incidents') || '[]');
        const browserSecurity = checkBrowserSecurity();
        
        console.log('🛡️ Estado de Seguridad del Tiburón:', {
            incidentsCount: incidents.length,
            lastIncident: incidents[incidents.length - 1] || 'Ninguno',
            browserSecurity: browserSecurity,
            secureContext: window.isSecureContext
        });
    };
    
})();
