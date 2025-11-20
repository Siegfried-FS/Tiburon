// Mensaje educativo de seguridad en consola - Estilo amigable AWS User Group
(function() {
    'use strict';
    
    // Estilos para la consola
    const styles = {
        title: 'color: #FF6B35; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);',
        warning: 'color: #E74C3C; font-size: 16px; font-weight: bold;',
        info: 'color: #3498DB; font-size: 14px; line-height: 1.6;',
        aws: 'color: #FF9900; font-size: 14px; font-weight: bold;',
        shark: 'color: #2ECC71; font-size: 18px;'
    };
    
    // Mensaje educativo amigable
    console.log('%c🦈 ¡Hola, futuro Cloud Architect!', styles.title);
    console.log('%c⚠️ Momento educativo de seguridad', styles.warning);
    console.log('');
    console.log('%cSi alguien te pidió que copies y pegues código aquí, ¡DETENTE! 🛑', styles.info);
    console.log('%cEsto podría ser un ataque llamado "Self-XSS" que puede:', styles.info);
    console.log('%c• Robar tu información personal', styles.info);
    console.log('%c• Acceder a tu cuenta sin permiso', styles.info);
    console.log('%c• Comprometer tu seguridad digital', styles.info);
    console.log('');
    console.log('%c🎓 En el AWS User Group te enseñamos seguridad REAL:', styles.aws);
    console.log('%c• Cómo protegerte de ataques comunes', styles.info);
    console.log('%c• Mejores prácticas de ciberseguridad', styles.info);
    console.log('%c• Arquitecturas seguras en la nube', styles.info);
    console.log('');
    console.log('%c🚀 ¿Quieres aprender desarrollo seguro?', styles.shark);
    console.log('%cÚnete a nuestros talleres: https://tiburoncp.siegfried-fs.com', styles.aws);
    console.log('');
    console.log('%c💡 Recuerda: Un verdadero desarrollador nunca te pedirá que pegues código random en la consola.', styles.info);
    console.log('%cSi tienes dudas sobre seguridad, contáctanos: roberto.ciberseguridad@gmail.com', styles.info);
    console.log('');
    console.log('%c🦈 Stay secure, stay sharp! - AWS User Group Playa Vicente', styles.shark);
    
    // Mensaje adicional para desarrolladores legítimos
    setTimeout(() => {
        console.log('');
        console.log('%c👨‍💻 Para desarrolladores:', 'color: #9B59B6; font-size: 12px; font-style: italic;');
        console.log('%cSi eres desarrollador y necesitas debuggear, ¡perfecto! Pero siempre valida el código antes de ejecutarlo.', 'color: #95A5A6; font-size: 11px;');
        console.log('%cEste sitio está construido con AWS Cognito, Amplify y mucho ❤️', 'color: #95A5A6; font-size: 11px;');
    }, 2000);
    
    // Detección educativa de actividad sospechosa (sin bloquear)
    let consoleWarningCount = 0;
    const originalConsoleLog = console.log;
    const originalEval = window.eval;
    
    // Monitorear uso excesivo de console
    console.log = function(...args) {
        consoleWarningCount++;
        if (consoleWarningCount > 10) {
            originalConsoleLog('%c🤔 Veo que estás muy activo en la consola...', 'color: #F39C12; font-size: 14px;');
            originalConsoleLog('%c¿Estás aprendiendo desarrollo? ¡Genial! Solo asegúrate de entender lo que ejecutas.', 'color: #3498DB; font-size: 12px;');
            consoleWarningCount = 0; // Reset counter
        }
        return originalConsoleLog.apply(console, args);
    };
    
    // Advertencia educativa sobre eval (sin bloquear)
    window.eval = function(code) {
        console.log('%c⚠️ Detectamos uso de eval() - ¡Cuidado!', 'color: #E74C3C; font-size: 14px; font-weight: bold;');
        console.log('%cEval puede ser peligroso. En el AWS User Group te enseñamos alternativas seguras.', 'color: #E67E22; font-size: 12px;');
        return originalEval.call(this, code);
    };
    
    // Easter egg para desarrolladores curiosos
    window.tiburon = function() {
        console.log('%c🦈 ¡Encontraste el easter egg!', 'color: #2ECC71; font-size: 20px; font-weight: bold;');
        console.log('%c¡Eres curioso como un buen desarrollador! 🎉', 'color: #3498DB; font-size: 14px;');
        console.log('%cEscribe tiburon.info() para más comandos secretos...', 'color: #9B59B6; font-size: 12px;');
    };
    
    window.tiburon.info = function() {
        console.log('%c🎯 Comandos secretos del Tiburón:', 'color: #E74C3C; font-size: 16px; font-weight: bold;');
        console.log('%ctiburon.stats() - Estadísticas del sitio', 'color: #3498DB; font-size: 12px;');
        console.log('%ctiburon.security() - Tips de seguridad', 'color: #3498DB; font-size: 12px;');
        console.log('%ctiburon.aws() - Recursos de AWS', 'color: #3498DB; font-size: 12px;');
    };
    
    window.tiburon.stats = function() {
        console.log('%c📊 Estadísticas del Tiburón:', 'color: #F39C12; font-size: 14px; font-weight: bold;');
        console.log(`%c• Construido con: AWS Cognito, Amplify, Route53`, 'color: #95A5A6; font-size: 11px;');
        console.log(`%c• Certificado SSL: ✅ Válido`, 'color: #95A5A6; font-size: 11px;');
        console.log(`%c• Seguridad: 🔒 Nivel Tiburón`, 'color: #95A5A6; font-size: 11px;');
        console.log(`%c• Creado por: Roberto Flores (Siegfried FS)`, 'color: #95A5A6; font-size: 11px;');
    };
    
    window.tiburon.security = function() {
        console.log('%c🔒 Tips de Seguridad del Tiburón:', 'color: #E74C3C; font-size: 14px; font-weight: bold;');
        console.log('%c1. Nunca pegues código desconocido en la consola', 'color: #3498DB; font-size: 12px;');
        console.log('%c2. Usa contraseñas únicas y fuertes (12+ caracteres)', 'color: #3498DB; font-size: 12px;');
        console.log('%c3. Habilita 2FA en todas tus cuentas importantes', 'color: #3498DB; font-size: 12px;');
        console.log('%c4. Mantén tus dependencias actualizadas', 'color: #3498DB; font-size: 12px;');
        console.log('%c5. Aprende sobre OWASP Top 10', 'color: #3498DB; font-size: 12px;');
    };
    
    window.tiburon.aws = function() {
        console.log('%c☁️ Recursos AWS del Tiburón:', 'color: #FF9900; font-size: 14px; font-weight: bold;');
        console.log('%c• AWS Free Tier: https://aws.amazon.com/free/', 'color: #3498DB; font-size: 12px;');
        console.log('%c• AWS Training: https://aws.amazon.com/training/', 'color: #3498DB; font-size: 12px;');
        console.log('%c• AWS Certification: https://aws.amazon.com/certification/', 'color: #3498DB; font-size: 12px;');
        console.log('%c• Nuestros talleres: https://tiburoncp.siegfried-fs.com/talleres.html', 'color: #3498DB; font-size: 12px;');
    };
    
})();
