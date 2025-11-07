// =============================================================================
// NÚCLEO: INICIALIZACIÓN Y FUNCIONES PRINCIPALES
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🦈 Proyecto Tiburón iniciado');

    // Cargar tema guardado al inicio
    loadTheme();

    // Inicializar Particles.js
    if (document.getElementById('particles-js')) {
        initParticles();
    }

    // Cargar servicios de AWS si estamos en la página de servicios
    if (document.getElementById('services-container')) {
        loadAWSServices();
    }
});

// =============================================================================
// MENÚ DE NAVEGACIÓN (HAMBURGUESA)
// =============================================================================

function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.querySelector('.hamburger');
    if (navMenu && hamburger) {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    }
}

function closeMenu() {
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.querySelector('.hamburger');
    if (navMenu && hamburger) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
}

// Cierra el menú si se hace clic fuera de él
document.addEventListener('click', (event) => {
    const nav = document.querySelector('.nav');
    const navMenu = document.getElementById('nav-menu');
    if (nav && navMenu && !nav.contains(event.target) && navMenu.classList.contains('active')) {
        closeMenu();
    }
});

// =============================================================================
// CAMBIO DE TEMA (CLARO/OSCURO)
// =============================================================================

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const themeToggle = document.querySelector('.theme-toggle');

    if (currentTheme === 'light') {
        html.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        if(themeToggle) themeToggle.textContent = '🌙';
    } else {
        html.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        if(themeToggle) themeToggle.textContent = '☀️';
    }

    // Re-inicializar particles.js para que tome el nuevo color de fondo
    if (document.getElementById('particles-js')) {
        setTimeout(initParticles, 100);
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.querySelector('.theme-toggle');
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        if(themeToggle) themeToggle.textContent = '☀️';
    } else {
        document.documentElement.removeAttribute('data-theme');
        if(themeToggle) themeToggle.textContent = '🌙';
    }
}

// Aplica el tema guardado inmediatamente al cargar la página para evitar el parpadeo
(function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();

// =============================================================================
// EFECTO DE PARTÍCULAS (PARTICLES.JS)
// =============================================================================

function initParticles() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const particleColor = isLight ? '#1e40af' : '#00d4ff'; // Azul en claro, cian en oscuro
    const lineColor = isLight ? '#3b82f6' : '#00d4ff'; // Azul más claro en claro, cian en oscuro

    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: particleColor },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: lineColor, opacity: 0.2, width: 1 },
            move: { enable: true, speed: 2, direction: 'none', random: false, straight: false, out_mode: 'out' }
        },
        interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
            modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
        },
        retina_detect: true
    });
}

// =============================================================================
// PÁGINA DE SERVICIOS (TARJETAS INTERACTIVAS)
// =============================================================================

const awsServices = [
    {
        name: 'Amazon EC2',
        icon: '🖥️',
        description: 'Servidores virtuales escalables en la nube',
        detail: 'Elastic Compute Cloud proporciona capacidad de cómputo redimensionable. Puedes lanzar instancias en minutos y pagar solo por lo que uses.',
        types: {
            'On-Demand': 'Pago por hora/segundo sin compromisos. Ideal para cargas impredecibles.',
            'Reserved': 'Hasta 75% descuento con compromiso 1-3 años. Mejor para uso constante.',
            'Spot': 'Hasta 90% descuento, pero AWS puede terminar con 2 min aviso. Para cargas tolerantes a fallos.',
            'Dedicated': 'Hardware dedicado para cumplimiento regulatorio. Más costoso pero aislado.'
        }
    },
    {
        name: 'Amazon S3',
        icon: '🗄️',
        description: 'Almacenamiento de objetos infinitamente escalable',
        detail: 'Simple Storage Service almacena y recupera cualquier cantidad de datos desde cualquier lugar. Durabilidad 99.999999999%.',
        types: {
            'Standard': 'Acceso frecuente. $0.023/GB/mes. Disponibilidad 99.99%.',
            'IA': 'Acceso infrecuente. $0.0125/GB/mes + cargo por acceso.',
            'Glacier': 'Archivo a largo plazo. $0.004/GB/mes. Recuperación 1-5 min a 12 horas.',
            'Deep Archive': 'Archivo más barato. $0.00099/GB/mes. Recuperación 12 horas.'
        }
    },
    {
        name: 'Amazon RDS',
        icon: '🗃️',
        description: 'Bases de datos relacionales administradas',
        detail: 'Relational Database Service facilita configurar, operar y escalar bases de datos relacionales en la nube.',
        types: {
            'MySQL': 'Base de datos open source popular. Compatible con aplicaciones web.',
            'PostgreSQL': 'Base de datos avanzada con características empresariales.',
            'Oracle': 'Base de datos empresarial con licencias incluidas o BYOL.',
            'Aurora': 'Compatible MySQL/PostgreSQL. 5x más rápida que MySQL estándar.'
        }
    },
    {
        name: 'AWS Lambda',
        icon: '⚡',
        description: 'Ejecuta código sin gestionar servidores',
        detail: 'Servicio de computación serverless. Ejecuta código en respuesta a eventos y escala automáticamente.',
        types: {
            'Event-driven': 'Se ejecuta automáticamente por eventos (S3, DynamoDB, API Gateway).',
            'Serverless': 'Sin servidores que gestionar. AWS maneja toda la infraestructura.',
            'Pay-per-use': 'Solo pagas por tiempo de ejecución. Primer millón requests gratis.',
            'Auto-scaling': 'Escala de 0 a miles de ejecuciones concurrentes automáticamente.'
        }
    },
    {
        name: 'Amazon VPC',
        icon: '🌐',
        description: 'Red privada virtual aislada',
        detail: 'Virtual Private Cloud permite crear una red aislada en AWS con control completo sobre el entorno de red.',
        types: {
            'Subnets': 'Segmentos de red públicos o privados dentro de la VPC.',
            'Route Tables': 'Definen hacia dónde se dirige el tráfico de red.',
            'Internet Gateway': 'Permite acceso a internet desde subnets públicas.',
            'NAT Gateway': 'Permite acceso saliente a internet desde subnets privadas.'
        }
    },
    {
        name: 'Amazon CloudFront',
        icon: '🚀',
        description: 'Red de entrega de contenido global',
        detail: 'CDN que entrega contenido con baja latencia desde ubicaciones edge cercanas a los usuarios.',
        types: {
            'Edge Locations': 'Más de 400 ubicaciones globalmente para cache de contenido.',
            'Origin': 'Fuente original del contenido (S3, EC2, Load Balancer).',
            'Distribution': 'Configuración que define cómo se entrega el contenido.',
            'Cache Behaviors': 'Reglas que determinan cómo se cachea el contenido.'
        }
    }
];

function createServiceCard(service) {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.onclick = () => toggleServiceDetail(card);

    const typeTags = Object.keys(service.types).map(type =>
        `<span class="type-tag" onclick="event.stopPropagation(); showTypeDetail(this, '${service.name}', '${type}')">${type}</span>`
    ).join('');

    card.innerHTML = `
        <div class="service-icon">${service.icon}</div>
        <h3>${service.name}</h3>
        <p class="service-description">${service.description}</p>
        <div class="service-types">${typeTags}</div>
        <div class="service-detail">
            <h4>💡 Información Clave</h4>
            <p>${service.detail}</p>
        </div>
        <div class="type-detail-popup"></div>
    `;
    return card;
}

function toggleServiceDetail(card) {
    card.classList.toggle('expanded');
}

function showTypeDetail(element, serviceName, typeName) {
    const service = awsServices.find(s => s.name === serviceName);
    if (!service) return;

    const card = element.closest('.service-card');
    const popup = card.querySelector('.type-detail-popup');
    const typeInfo = service.types[typeName];

    popup.innerHTML = `<h4>${typeName}</h4><p>${typeInfo}</p>`;
    popup.classList.add('show');

    setTimeout(() => {
        popup.classList.remove('show');
    }, 4000);
}

function loadAWSServices() {
    const servicesContainer = document.getElementById('services-container');
    if (servicesContainer) {
        awsServices.forEach(service => {
            const serviceCard = createServiceCard(service);
            servicesContainer.appendChild(serviceCard);
        });
    }
}

// =============================================================================
// PÁGINA DE GLOSARIO (TÉRMINOS EXPANDIBLES)
// =============================================================================

function toggleTermino(elemento) {
    const detail = elemento.querySelector('.termino-detail');
    if (detail) {
        detail.classList.toggle('show');
    }
}

// =============================================================================
// OTRAS FUNCIONES
// =============================================================================

function showDonationInfo() {
    alert('¡Gracias por tu interés en apoyar el proyecto! 🙏\n\nEn el futuro aquí habrá opciones para donaciones voluntarias. Por ahora, ¡compartir el proyecto ya es una gran ayuda! 😊');
}

// =============================================================================
// EXPORTACIÓN DE FUNCIONES PARA USO EN HTML (onclick)
// =============================================================================

window.toggleMenu = toggleMenu;
window.closeMenu = closeMenu;
window.toggleTheme = toggleTheme;
window.toggleTermino = toggleTermino;
window.showDonationInfo = showDonationInfo;