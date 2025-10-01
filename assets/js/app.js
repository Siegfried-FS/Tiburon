// Script principal del proyecto Fenix - Blog AWS Cloud Practitioner

// Configuración de particles.js con colores elegantes
function initParticles() {
    const isLight = document.body.getAttribute('data-theme') === 'light';
    const particleColor = isLight ? '#1e40af' : '#00d4ff';
    
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
                value: particleColor
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
}

// Inicializar particles
initParticles();

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
// Funciones para labs dinámicos
function showContent(contentId, type) {
    const content = document.getElementById(contentId);
    const buttons = ['btn-1-pdf', 'btn-1-arch', 'btn-1-desc'];
    
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) btn.className = 'secondary-btn';
    });
    
    if (type === 'pdf') document.getElementById('btn-1-pdf').className = 'primary-btn';
    if (type === 'architecture') document.getElementById('btn-1-arch').className = 'primary-btn';
    if (type === 'description') document.getElementById('btn-1-desc').className = 'primary-btn';
    
    if (type === 'pdf') {
        content.innerHTML = '<div class="pdf-preview-simple"><embed src="restart-labs/fundamentos-nube/01-Cloud-Databases.pdf#page=1&zoom=60" type="application/pdf" width="100%" height="500px"></div>';
    } else if (type === 'architecture') {
        content.innerHTML = '<div class="architecture-view"><img src="assets/images/architecture-placeholder.svg" alt="Arquitectura" style="width:100%;"><p>Diagrama de arquitectura</p></div>';
    } else if (type === 'description') {
        content.innerHTML = '<div class="description-view"><h3>📝 Descripción</h3><p>Laboratorio de bases de datos en la nube</p></div>';
    }
}

function showContent2(contentId, type) {
    const content = document.getElementById(contentId);
    const buttons = ['btn-2-pdf', 'btn-2-arch', 'btn-2-desc'];
    
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) btn.className = 'secondary-btn';
    });
    
    if (type === 'pdf') document.getElementById('btn-2-pdf').className = 'primary-btn';
    if (type === 'architecture') document.getElementById('btn-2-arch').className = 'primary-btn';
    if (type === 'description') document.getElementById('btn-2-desc').className = 'primary-btn';
    
    if (type === 'pdf') {
        content.innerHTML = '<div class="pdf-preview-simple"><embed src="restart-labs/fundamentos-nube/02-Well-Architected.pdf#page=1&zoom=60" type="application/pdf" width="100%" height="500px"></div>';
    } else if (type === 'architecture') {
        content.innerHTML = '<div class="architecture-view"><img src="assets/images/architecture-placeholder.svg" alt="Arquitectura" style="width:100%;"><p>Well-Architected Framework</p></div>';
    } else if (type === 'description') {
        content.innerHTML = '<div class="description-view"><h3>📝 Descripción</h3><p>Framework de buenas prácticas AWS</p></div>';
    }
}

function openFullPDF(pdfPath) {
    window.open(pdfPath, '_blank');
}
// Función para abrir lab específico
function openLab(labId) {
    if (labId === 'lab1') {
        // Crear vista interactiva para Lab 1
        document.querySelector('main .container').innerHTML = `
            <div class="breadcrumb">
                <a href="laboratorios.html">🧪 Laboratorios</a> > 
                <a href="lab-fundamentos.html">🌥️ Fundamentos</a> > 
                📊 Cloud Databases
            </div>
            
            <h1>📊 Cloud Databases</h1>
            
            <div class="lab-controls">
                <button onclick="showLabContent('lab1-content', 'pdf')" class="primary-btn" id="lab1-pdf">📄 PDF</button>
                <button onclick="showLabContent('lab1-content', 'architecture')" class="secondary-btn" id="lab1-arch">🏗️ Arquitectura</button>
                <button onclick="showLabContent('lab1-content', 'description')" class="secondary-btn" id="lab1-desc">📝 Descripción</button>
                <button onclick="openFullPDF('restart-labs/fundamentos-nube/01-Cloud-Databases.pdf')" class="primary-btn">Ver Completo</button>
            </div>

            <div class="lab-content" id="lab1-content">
                <div class="pdf-preview-simple">
                    <embed src="restart-labs/fundamentos-nube/01-Cloud-Databases.pdf#page=1&zoom=60" type="application/pdf" width="100%" height="500px">
                </div>
            </div>
        `;
    } else if (labId === 'lab2') {
        // Crear vista interactiva para Lab 2
        document.querySelector('main .container').innerHTML = `
            <div class="breadcrumb">
                <a href="laboratorios.html">🧪 Laboratorios</a> > 
                <a href="lab-fundamentos.html">🌥️ Fundamentos</a> > 
                🏛️ Well-Architected
            </div>
            
            <h1>🏛️ Well-Architected Framework</h1>
            
            <div class="lab-controls">
                <button onclick="showLabContent('lab2-content', 'pdf')" class="primary-btn" id="lab2-pdf">📄 PDF</button>
                <button onclick="showLabContent('lab2-content', 'architecture')" class="secondary-btn" id="lab2-arch">🏗️ Arquitectura</button>
                <button onclick="showLabContent('lab2-content', 'description')" class="secondary-btn" id="lab2-desc">📝 Descripción</button>
                <button onclick="openFullPDF('restart-labs/fundamentos-nube/02-Well-Architected.pdf')" class="primary-btn">Ver Completo</button>
            </div>

            <div class="lab-content" id="lab2-content">
                <div class="pdf-preview-simple">
                    <embed src="restart-labs/fundamentos-nube/02-Well-Architected.pdf#page=1&zoom=60" type="application/pdf" width="100%" height="500px">
                </div>
            </div>
        `;
    }
}
// Función para mostrar contenido en tarjetas flip
function showCardContent(cardId, type) {
    const card = document.getElementById(cardId);
    const front = card.querySelector('.flip-card-front');
    const buttons = front.querySelectorAll('.card-controls button:not(.btn-full)');
    
    // Reset button styles (except Ver Completo)
    buttons.forEach(btn => btn.classList.remove('btn-active'));
    
    // Set active button
    event.target.classList.add('btn-active');
    
    // Get card number from cardId
    const cardNum = cardId.replace('card', '');
    
    // Update content based on type
    if (type === 'pdf') {
        const pdfSrc = cardNum === '1' ? 
            "restart-labs/fundamentos-nube/OReilly-Cloud-Databases-eBook.pdf" : 
            'restart-labs/fundamentos-nube/20250923-RETO4-ROBERTOFLORESSEGUNDO.pdf';
        
        // Mostrar loading
        front.querySelector('.pdf-preview').innerHTML = 
            `<div class="pdf-placeholder">
                <div class="placeholder-icon">⏳</div>
                <p>Cargando PDF...</p>
            </div>`;
            
        // Cargar PDF después de un momento
        setTimeout(() => {
            front.querySelector('.pdf-preview').innerHTML = 
                `<embed src="${pdfSrc}#page=1&zoom=60" type="application/pdf" width="100%" height="300px">`;
        }, 500);
            
    } else if (type === 'architecture') {
        const imageSrc = cardNum === '1' ? 
            'restart-labs/fundamentos-nube/810009.jpg' : 
            'restart-labs/fundamentos-nube/810009.jpg';
            
        front.querySelector('.pdf-preview').innerHTML = 
            `<div class="architecture-view">
                <img src="${imageSrc}" 
                     alt="Arquitectura" 
                     style="width:100%; height:100%; object-fit:contain; cursor:pointer; border-radius:10px;"
                     onclick="openImageModal('${imageSrc}')">
                <p style="color:#ccc; margin-top:10px; font-size:0.9em;">🔍 Clic para ampliar</p>
            </div>`;
            
    } else if (type === 'description') {
        const description = cardNum === '1' ? 
            'Laboratorio sobre conceptos fundamentales de bases de datos en la nube, incluyendo tipos de bases de datos, escalabilidad y mejores prácticas.' :
            'Documento del Reto 4 completado por Roberto Flores Segundo, demostrando conocimientos adquiridos en el programa AWS Re/Start.';
            
        front.querySelector('.pdf-preview').innerHTML = 
            `<div class="description-view" style="padding:20px; text-align:left; color:#ccc; line-height:1.6;">
                <h4 style="color:#00d4ff; margin-bottom:15px;">📝 Descripción del Laboratorio</h4>
                <p>${description}</p>
                <div style="margin-top:20px; padding:15px; background:rgba(0,212,255,0.1); border-radius:10px;">
                    <strong style="color:#00ff88;">💡 Objetivos:</strong><br>
                    • Comprender conceptos clave<br>
                    • Aplicar mejores prácticas<br>
                    • Implementar soluciones escalables
                </div>
            </div>`;
    }
}

// Función para abrir PDF completo en nueva pestaña
function openFullPDF(pdfPath) {
    window.open(pdfPath, '_blank');
}

// Función para abrir imagen en modal
function openImageModal(imageSrc) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9); display: flex; justify-content: center;
        align-items: center; z-index: 9999; cursor: pointer;
    `;
    
    const img = document.createElement('img');
    img.src = imageSrc;
    img.style.cssText = 'max-width: 90%; max-height: 90%; border-radius: 10px;';
    
    modal.appendChild(img);
    modal.onclick = () => document.body.removeChild(modal);
    document.body.appendChild(modal);
}
// Función para cambiar tema
function toggleTheme() {
    const body = document.body;
    const html = document.documentElement;
    const themeToggle = document.querySelector('.theme-toggle');
    
    if (body.getAttribute('data-theme') === 'light') {
        body.removeAttribute('data-theme');
        html.removeAttribute('data-theme');
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
    } else {
        body.setAttribute('data-theme', 'light');
        html.setAttribute('data-theme', 'light');
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'light');
    }
    
    // Cerrar menú hamburguesa si está abierto
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    if (navMenu && hamburger) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
    
    // Reinicializar particles con nuevo color
    setTimeout(() => {
        initParticles();
    }, 100);
}

// Cargar tema guardado
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.querySelector('.theme-toggle');
    
    if (savedTheme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        if (themeToggle) themeToggle.textContent = '☀️';
    } else {
        document.body.removeAttribute('data-theme');
        if (themeToggle) themeToggle.textContent = '🌙';
    }
}

// Cargar tema inmediatamente (antes del DOM)
(function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();

// Cargar tema al iniciar
document.addEventListener('DOMContentLoaded', loadTheme);
