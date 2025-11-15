// =============================================================================
// NÚCLEO: INICIALIZACIÓN Y FUNCIONES PRINCIPALES
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🦈 Proyecto Tiburón iniciado');
    loadTheme();
    addEventListeners();

    if (document.getElementById('particles-js')) {
        initParticles();
    }
    if (document.getElementById('services-container')) {
        loadAWSServices();
    }
    if (document.getElementById('events-container')) {
        loadEvents();
    }
    if (document.getElementById('resources-container')) {
        loadResources();
    }
    if (document.getElementById('matching-game')) {
        initMatchingGame();
    }
    if (document.querySelector('.badge-carousel-wrapper')) {
        initCarousel();
    }
    initScrollAnimations();
});

// =============================================================================
// REGISTRO CENTRAL DE EVENT LISTENERS
// =============================================================================

function addEventListeners() {
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleMenu();
        });
    }

    // Dropdown functionality for mobile
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (event) => {
            const parentDropdown = toggle.parentElement;
            // Only enable click-toggle on mobile view
            if (window.innerWidth <= 768 && parentDropdown.classList.contains('dropdown')) {
                event.preventDefault();
                parentDropdown.classList.toggle('active');
            }
        });
    });

    const navLinks = document.querySelectorAll('.nav-menu a:not(.dropdown-toggle)');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    const terminos = document.querySelectorAll('.termino');
    terminos.forEach(termino => {
        termino.addEventListener('click', () => toggleTermino(termino));
    });

    const donationBtn = document.querySelector('.donation-btn');
    if (donationBtn) {
        donationBtn.addEventListener('click', showDonationInfo);
    }

    document.addEventListener('click', (event) => {
        const nav = document.querySelector('.nav');
        const navMenu = document.getElementById('nav-menu');
        if (nav && navMenu && !nav.contains(event.target) && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });
}

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
    const particleColor = isLight ? '#1e40af' : '#00d4ff';
    const lineColor = isLight ? '#3b82f6' : '#00d4ff';

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

    const typeTags = Object.keys(service.types).map(type =>
        `<span class="type-tag" data-service="${service.name}" data-type="${type}">${type}</span>`
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
        servicesContainer.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('click', () => toggleServiceDetail(card));
        });
        servicesContainer.querySelectorAll('.type-tag').forEach(tag => {
            tag.addEventListener('click', (event) => {
                event.stopPropagation();
                showTypeDetail(tag, tag.dataset.service, tag.dataset.type);
            });
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
// CARGA DINÁMICA DE CONTENIDO (EVENTOS Y RECURSOS)
// =============================================================================

async function loadEvents() {
    const container = document.getElementById('events-container');
    if (!container) return;

    try {
        const response = await fetch('assets/data/events.json');
        const events = await response.json();

        if (events.length === 0) {
            container.innerHTML = '<p>No hay eventos próximos. ¡Vuelve pronto!</p>';
            return;
        }

        // Sort events: events with specific dates first, then by date; events with only year last.
        events.sort((a, b) => {
            const aDate = a.date ? new Date(a.date) : null;
            const bDate = b.date ? new Date(b.date) : null;
            if (aDate && bDate) return bDate - aDate;
            if (aDate) return -1;
            if (bDate) return 1;
            return b.year - a.year;
        });

        // Group events by year
        const eventsByYear = events.reduce((acc, event) => {
            const year = event.date ? new Date(event.date).getFullYear() : event.year;
            if (!acc[year]) {
                acc[year] = [];
            }
            acc[year].push(event);
            return acc;
        }, {});

        let html = '';
        const sortedYears = Object.keys(eventsByYear).sort((a, b) => b - a);

        sortedYears.forEach(year => {
            html += `<section class="content-section"><h2>Eventos ${year}</h2><div class="events-grid">`;
            
            eventsByYear[year].forEach(event => {
                const tagsHtml = event.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
                const formatHtml = event.format ? `<span class="tag format-tag">${event.format}</span>` : '';
                
                let dateBlockHtml = '';
                if (event.date) {
                    const date = new Date(event.date);
                    const month = date.toLocaleString('es-ES', { month: 'short' }).toUpperCase().replace('.','');
                    const day = date.getDate();
                    dateBlockHtml = `
                        <div class="event-date-block">
                            <span class="day">${day}</span>
                            <span class="month">${month}</span>
                        </div>
                    `;
                } else {
                    dateBlockHtml = `
                        <div class="event-date-block coming-soon">
                            <span class="day">🗓️</span>
                            <span class="month">PRÓXIMO</span>
                        </div>
                    `;
                }

                html += `
                    <div class="event-card">
                        ${dateBlockHtml}
                        <div class="event-details">
                            <h3 class="event-title">${event.title}</h3>
                            <p class="event-description">${event.description}</p>
                            <div class="event-tags">${tagsHtml}${formatHtml}</div>
                        </div>
                    </div>
                `;
            });

            html += `</div></section>`;
        });

        container.innerHTML = html;
        // Re-initialize scroll animations to include the new cards
        initScrollAnimations();
    } catch (error) {
        console.error('Error al cargar los eventos:', error);
        container.innerHTML = '<p>Error al cargar los eventos. Intenta recargar la página.</p>';
    }
}

async function loadResources() {
    const container = document.getElementById('resources-container');
    if (!container) return;

    try {
        const response = await fetch('assets/data/resources.json');
        const categories = await response.json();

        if (categories.length === 0) {
            container.innerHTML = '<p>No hay recursos disponibles en este momento.</p>';
            return;
        }

        let html = '';
        categories.forEach(category => {
            html += `<section class="content-section"><h2>${category.category}</h2><div class="labs-grid">`;
            
            category.items.forEach(resource => {
                const tagsHtml = resource.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
                
                let badgesHtml = '';
                if (resource.badges && resource.badges.length > 0) {
                    badgesHtml = '<div class="resource-badges-strip">';
                    resource.badges.forEach(badgeSrc => {
                        badgesHtml += `<img src="${badgeSrc}" alt="Badge de recurso" class="resource-badge-icon">`;
                    });
                    badgesHtml += '</div>';
                }

                html += `
                    <a href="${resource.url}" target="_blank" class="lab-card active">
                        <div class="lab-card-image-container">
                            <img src="${resource.image}" alt="Imagen de ${resource.title}" class="resource-image">
                        </div>
                        <div class="lab-card-content">
                            ${badgesHtml}
                            <h3>${resource.title}</h3>
                            <p>${resource.description}</p>
                            <div class="resource-tags">${tagsHtml}</div>
                        </div>
                    </a>
                `;
            });

            html += `</div></section>`;
        });

        container.innerHTML = html;
        // Re-initialize scroll animations to include the new cards
        initScrollAnimations();
    } catch (error) {
        console.error('Error al cargar los recursos:', error);
        container.innerHTML = '<p>Error al cargar los recursos. Intenta recargar la página.</p>';
    }
}

// =============================================================================
// OTRAS FUNCIONES
// =============================================================================

function showDonationInfo() {
    alert('¡Gracias por tu interés en apoyar el proyecto! 🙏\n\nEn el futuro aquí habrá opciones para donaciones voluntarias. Por ahora, ¡compartir el proyecto ya es una gran ayuda! 😊');
}

// =============================================================================
// ANIMACIONES DE SCROLL
// =============================================================================

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.content-section, .nav-card, .badge-item, .about-card, .contact-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// =============================================================================
// JUEGO DE RELACIONAR SERVICIOS
// =============================================================================

function initMatchingGame() {
    const gameContainer = document.getElementById('matching-game');
    if (!gameContainer) return;

    const questionEl = document.getElementById('game-question').querySelector('p');
    const optionsContainer = document.getElementById('game-options');
    const correctScoreEl = document.getElementById('game-score-correct');
    const incorrectScoreEl = document.getElementById('game-score-incorrect');
    const accuracyEl = document.getElementById('game-accuracy');
    const nextButton = document.getElementById('next-question-btn');
    const feedbackContainer = document.getElementById('feedback-container');

    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let currentCorrectAnswer = null;
    let answered = false;

    function updateStats() {
        const total = correctAnswers + incorrectAnswers;
        const accuracy = total === 0 ? 100 : Math.round((correctAnswers / total) * 100);
        correctScoreEl.textContent = correctAnswers;
        incorrectScoreEl.textContent = incorrectAnswers;
        accuracyEl.textContent = `${accuracy}%`;
    }

    function generateQuestion() {
        answered = false;
        optionsContainer.innerHTML = '';
        feedbackContainer.innerHTML = '';
        nextButton.style.display = 'none';

        const correctIndex = Math.floor(Math.random() * awsServices.length);
        currentCorrectAnswer = awsServices[correctIndex];

        const incorrectServices = awsServices
            .filter(s => s.name !== currentCorrectAnswer.name)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        const options = [currentCorrectAnswer, ...incorrectServices].sort(() => 0.5 - Math.random());

        questionEl.textContent = currentCorrectAnswer.description;

        options.forEach(option => {
            const optionCard = document.createElement('div');
            optionCard.className = 'option-card';
            optionCard.dataset.serviceName = option.name;
            optionCard.innerHTML = `
                <div class="option-icon">${option.icon}</div>
                <h4>${option.name}</h4>
            `;
            optionCard.addEventListener('click', handleAnswer);
            optionsContainer.appendChild(optionCard);
        });
    }

    function handleAnswer(event) {
        if (answered) return;
        answered = true;

        const selectedCard = event.currentTarget;
        const selectedService = selectedCard.dataset.serviceName;

        if (selectedService === currentCorrectAnswer.name) {
            correctAnswers++;
            selectedCard.classList.add('correct');
            feedbackContainer.innerHTML = `<p style="color: var(--success-color);">¡Correcto! ✅</p>`;
        } else {
            incorrectAnswers++;
            selectedCard.classList.add('incorrect');
            const correctCard = optionsContainer.querySelector(`[data-service-name="${currentCorrectAnswer.name}"]`);
            if (correctCard) {
                correctCard.classList.add('correct');
            }
            feedbackContainer.innerHTML = `
                <p style="color: var(--accent-color);">Incorrecto. La respuesta era <strong>${currentCorrectAnswer.name}</strong>.</p>
                <p style="font-size: 0.9rem; color: var(--text-muted);">${currentCorrectAnswer.detail}</p>
            `;
        }

        updateStats();
        nextButton.style.display = 'block';
    }

    nextButton.addEventListener('click', generateQuestion);

    updateStats();
    generateQuestion();
}

function initCarousel() {
    const wrapper = document.querySelector('.badge-carousel-wrapper');
    if (!wrapper) return;

    const carousel = wrapper.querySelector('.credly-badges');
    const prevButton = wrapper.querySelector('.carousel-arrow.prev');
    const nextButton = wrapper.querySelector('.carousel-arrow.next');

    if (!carousel || !prevButton || !nextButton) return;

    nextButton.addEventListener('click', () => {
        carousel.scrollBy({ left: 300, behavior: 'smooth' });
    });

    prevButton.addEventListener('click', () => {
        carousel.scrollBy({ left: -300, behavior: 'smooth' });
    });
}