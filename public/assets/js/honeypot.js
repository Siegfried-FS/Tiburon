// honeypot.js - Trampa de seguridad para detección de inyección SQL
(function() {
    'use strict';

    const unifiedSecurityMessage = () => {
        const msg = `%c
    🕵️‍♀️ ¡Atención, explorador de sistemas!
    
    Este sitio web está bajo monitoreo activo. Se ha detectado una actividad inusual o un patrón que sugiere pruebas de seguridad (por ejemplo, intentos de inyección SQL, escaneo de puertos, o acceso no autorizado).
    
    La seguridad es una prioridad. Si eres un pentester o investigador de seguridad, te animamos a colaborar de forma ética. La diferencia entre un experto y un intruso es el permiso.
    
    🚨 Si has encontrado algo, repórtalo de forma responsable:
    📧 roberto.flores@siegfried-fs.com
    
    ¿Buscas desafíos éticos? Explora plataformas como Hack The Box o Bugcrowd.
    
    Tu habilidad es valiosa. Únete a nuestra comunidad para proteger el ciberespacio.
    📱 https://t.me/+NWYivRxl7fQ4MzNh
    
    Defiende el ciberespacio con nosotros. 🦈
    `;
        console.log(msg, 'color: #FFD700; background: #333; font-size: 14px; line-height: 1.6; font-family: "Lucida Console", Monaco, monospace; padding: 10px; border: 2px solid #FFD700; border-radius: 5px;');
    };

    const detectSqlInjection = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const url = window.location.href.toLowerCase();

        const sqlPatterns = [
            /select.+from/i, /union.+select/i, /insert.+into/i, /delete.+from/i, /drop.+table/i,
            /alter.+table/i, /update.+set/i, /--/, /xp_cmdshell/, /\bexec\b/, /\bsys.fn_varbintoa\b/,
            /\bor\s+'\d+'='1'/i, /'or'1'='1/, /having\s+\d+=\d+/i, /waitfor\s+delay/,
            /benchmark\s*\((\d+),(\d+)\)/i, /pg_sleep/i, /\band\s+\d+=\d+/i, /xand\x20\d+=\d+/i
        ];

        // Check URL parameters
        for (const [key, value] of urlParams.entries()) {
            if (sqlPatterns.some(pattern => pattern.test(key.toLowerCase()) || pattern.test(value.toLowerCase()))) {
                unifiedSecurityMessage();
                console.warn('SQL Injection attempt detected in URL parameters! Redirecting...');
                window.location.replace('/admin-denied.html');
                return true;
            }
        }

        // Check full URL path (useful for path-based injections)
        if (sqlPatterns.some(pattern => pattern.test(url))) {
            unifiedSecurityMessage();
            console.warn('SQL Injection attempt detected in URL path! Redirecting...');
            window.location.replace('/admin-denied.html');
            return true;
        }

        return false;
    };

    // Run detection immediately on page load
    if (!detectSqlInjection()) {
        // If no SQL injection is detected, still show the unified message in console if developer tools are open
        // This is for console-security.js replacement logic
        // unifiedSecurityMessage(); // This will be handled by console-security.js itself
    }

})();
