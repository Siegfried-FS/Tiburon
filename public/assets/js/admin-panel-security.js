// DEFENSA DE TIERRA QUEMADA Y DEPURACIÓN
(function() {
    'use strict';
    try {
        const token = sessionStorage.getItem('accessToken'); // CORREGIDO: sessionStorage y 'accessToken'
        const userGroups = localStorage.getItem('userGroups');

        console.log('--- Verificación de Acceso Admin ---');
        console.log('Token encontrado:', !!token);
        console.log('Grupos encontrados:', userGroups);

        if (!token || !userGroups) {
            console.error('Acceso denegado: Falta token o grupos. Redirigiendo...');
            window.location.replace('/admin-denied.html');
            return;
        }

        const groups = JSON.parse(userGroups);
        const isAdmin = groups.includes('Admins');

        console.log('¿Es administrador?:', isAdmin);

        if (!isAdmin) {
            console.error('Acceso denegado: El usuario no pertenece al grupo "Admins". Redirigiendo...');
            window.location.replace('/admin-denied.html');
            return;
        }

        // Si todas las verificaciones pasan, mostrar la página
        console.log('%cAcceso concedido. Mostrando panel de administración.', 'color: green; font-weight: bold;');
        document.documentElement.style.display = 'block';

    } catch (e) {
        console.error('Error crítico en la verificación de acceso. Redirigiendo...', e);
        window.location.replace('/admin-denied.html');
    }
})();
