// Mensaje para quienes intentan acceso no autorizado - Enfoque de reclutamiento

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

    unifiedSecurityMessage();

    // Redirect después de 15 segundos - tiempo suficiente para leer
    setTimeout(() => {
        window.location.href = '/';
    }, 15000);
})();

