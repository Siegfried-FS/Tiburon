// Script principal del proyecto Fenix - Blog AWS Cloud Practitioner

// Configuración de particles.js con colores elegantes
particlesJS('particles-js', {
    particles: {
        number: {
            value: 60,
            density: {
                enable: true,
                value_area: 800
            }
        },
        color: {
            value: '#00d4ff'
        },
        shape: {
            type: 'circle',
            stroke: {
                width: 0,
                color: '#000000'
            }
        },
        opacity: {
            value: 0.3,
            random: false,
            anim: {
                enable: false,
                speed: 1,
                opacity_min: 0.1,
                sync: false
            }
        },
        size: {
            value: 2,
            random: true,
            anim: {
                enable: false,
                speed: 40,
                size_min: 0.1,
                sync: false
            }
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#00d4ff',
            opacity: 0.2,
            width: 1
        },
        move: {
            enable: true,
            speed: 3,
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false,
            attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200
            }
        }
    },
    interactivity: {
        detect_on: 'canvas',
        events: {
            onhover: {
                enable: true,
                mode: 'repulse'
            },
            onclick: {
                enable: true,
                mode: 'push'
            },
            resize: true
        },
        modes: {
            grab: {
                distance: 400,
                line_linked: {
                    opacity: 1
                }
            },
            bubble: {
                distance: 400,
                size: 40,
                duration: 2,
                opacity: 8,
                speed: 3
            },
            repulse: {
                distance: 100,
                duration: 0.4
            },
            push: {
                particles_nb: 2
            },
            remove: {
                particles_nb: 2
            }
        }
    },
    retina_detect: true
});

// Funciones del menú hamburguesa
function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function closeMenu() {
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
}

// Datos de servicios AWS con información detallada mejorada
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

// Función para crear tarjeta de servicio mejorada
function createServiceCard(service) {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.onclick = () => toggleServiceDetail(card);
    
    const typeTags = Object.keys(service.types).map(type => 
        `<span class="type-tag" onclick="event.stopPropagation(); showTypeDetail('${service.name}', '${type}')">${type}</span>`
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
        <div class="type-detail"></div>
    `;
    
    return card;
}

// Función para mostrar/ocultar detalles del servicio
function toggleServiceDetail(card) {
    const detail = card.querySelector('.service-detail');
    const isExpanded = card.classList.contains('expanded');
    
    // Cerrar otros detalles abiertos
    document.querySelectorAll('.service-card.expanded').forEach(c => {
        if (c !== card) {
            c.classList.remove('expanded');
            c.querySelector('.service-detail').classList.remove('show');
        }
    });
    
    if (isExpanded) {
        card.classList.remove('expanded');
        detail.classList.remove('show');
    } else {
        card.classList.add('expanded');
        detail.classList.add('show');
    }
}

// Función para mostrar detalles de tipos específicos
function showTypeDetail(serviceName, typeName) {
    const service = awsServices.find(s => s.name === serviceName);
    if (!service) return;
    
    const cards = document.querySelectorAll('.service-card');
    const targetCard = Array.from(cards).find(card => 
        card.querySelector('h3').textContent === serviceName
    );
    
    if (targetCard) {
        const typeDetail = targetCard.querySelector('.type-detail');
        const typeInfo = service.types[typeName];
        
        typeDetail.innerHTML = `
            <h4>${typeName}</h4>
            <p>${typeInfo}</p>
        `;
        typeDetail.classList.add('show');
        
        setTimeout(() => {
            typeDetail.classList.remove('show');
        }, 5000);
    }
}

// Función para toggle de términos en temario
function toggleTermino(elemento) {
    const detail = elemento.querySelector('.termino-detail');
    const isVisible = detail.classList.contains('show');
    
    // Cerrar otros términos abiertos en la misma tarjeta
    const card = elemento.closest('.temario-card');
    card.querySelectorAll('.termino-detail.show').forEach(d => {
        if (d !== detail) d.classList.remove('show');
    });
    
    if (isVisible) {
        detail.classList.remove('show');
    } else {
        detail.classList.add('show');
    }
}

// Función para cargar servicios AWS dinámicamente
function loadAWSServices() {
    const servicesContainer = document.getElementById('services-container');
    if (!servicesContainer) return;

    awsServices.forEach(service => {
        const serviceCard = createServiceCard(service);
        servicesContainer.appendChild(serviceCard);
    });
}

// Función para cargar PDFs de laboratorios
function loadLabPDFs() {
    // Mapeo de carpetas a IDs de contenedores
    const labModules = {
        'fundamentos-nube': 'fundamentos-pdfs',
        'linux': 'linux-pdfs',
        'conexion': 'conexion-pdfs',
        'seguridad': 'seguridad-pdfs',
        'python': 'python-pdfs',
        'bases-datos': 'bases-pdfs',
        'jumpstart-aws': 'jumpstart-pdfs',
        'jumpstart-aws-advanced': 'jumpstart-advanced-pdfs'
    };

    // PDFs conocidos (actualiza esta lista cuando agregues más)
    const knownPDFs = {
        'fundamentos-nube': [
            {
                name: "O'Reilly - Introduction to Cloud Databases",
                file: "O'Reilly-Introduction-to-Cloud-Databases-eBook-FINAL-ESXL.pdf"
            }
        ]
    };

    // Actualizar cada módulo
    Object.keys(knownPDFs).forEach(module => {
        const container = document.getElementById(labModules[module]);
        if (container && knownPDFs[module].length > 0) {
            // Limpiar placeholder
            container.innerHTML = '';
            
            // Agregar PDFs
            knownPDFs[module].forEach(pdf => {
                const pdfItem = document.createElement('a');
                pdfItem.className = 'pdf-item';
                pdfItem.href = `restart-labs/${module}/${pdf.file}`;
                pdfItem.target = '_blank';
                pdfItem.innerHTML = `
                    <span>📄</span>
                    <span>${pdf.name}</span>
                `;
                container.appendChild(pdfItem);
            });
        }
    });
}

// Cargar PDFs cuando la página esté lista
document.addEventListener('DOMContentLoaded', function() {
    loadLabPDFs();
});

// Exportar funciones para uso global
window.showDonationInfo = showDonationInfo;
window.toggleMenu = toggleMenu;
window.closeMenu = closeMenu;
window.toggleTermino = toggleTermino;

// Función para escanear y mostrar PDFs en las carpetas
function loadPDFs() {
    const modules = [
        { id: 'fundamentos-pdfs', folder: 'fundamentos-nube' },
        { id: 'linux-pdfs', folder: 'linux' },
        { id: 'conexion-pdfs', folder: 'conexion' },
        { id: 'seguridad-pdfs', folder: 'seguridad' },
        { id: 'python-pdfs', folder: 'python' },
        { id: 'bases-pdfs', folder: 'bases-datos' },
        { id: 'jumpstart-pdfs', folder: 'jumpstart-aws' },
        { id: 'jumpstart-advanced-pdfs', folder: 'jumpstart-aws-advanced' }
    ];

    modules.forEach(module => {
        const container = document.getElementById(module.id);
        if (container) {
            container.innerHTML = `
                <div class="pdf-placeholder">
                    <p>📁 Carpeta: restart-labs/${module.folder}/</p>
                    <p>Los PDFs aparecerán aquí cuando los subas</p>
                </div>
            `;
        }
    });
}

// Función para mostrar información de donaciones
function showDonationInfo() {
    alert('¡Gracias por tu interés en apoyar el proyecto! 🙏\n\nEn el futuro aquí habrá opciones para donaciones voluntarias.\nPor ahora, compartir el proyecto ya es una gran ayuda. 😊');
}

// Cerrar menú al hacer clic fuera
document.addEventListener('click', function(event) {
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav');
    
    if (!nav.contains(event.target) && navMenu.classList.contains('active')) {
        closeMenu();
    }
});

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 Proyecto Fenix - Blog AWS Cloud Practitioner iniciado');
    
    // Inicializar funcionalidades
    loadAWSServices();
    loadPDFs();
    
    // Mostrar mensaje de bienvenida
    setTimeout(() => {
        console.log('✨ ¡Bienvenido al proyecto Fenix! Haz clic en las tarjetas de servicios para ver más detalles');
    }, 2000);
});

// Exportar funciones para uso global
window.showDonationInfo = showDonationInfo;
window.toggleMenu = toggleMenu;
window.closeMenu = closeMenu;
