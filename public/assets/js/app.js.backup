// =============================================================================
// CONFIGURACIÓN Y CARGA DE DATOS
// =============================================================================

// Configuración de URLs - Lambda primero, local como fallback
const DATA_SOURCES = {
    lambda: 'https://fklo6233x5.execute-api.us-east-1.amazonaws.com/prod/get-content/',
    local: '/assets/data/'
};

// Función para cargar datos con fallback
async function loadData(filename) {
    try {
        // Intentar Lambda primero
        const lambdaResponse = await fetch(DATA_SOURCES.lambda + filename);
        if (lambdaResponse.ok) {
            console.log(`✅ Cargando ${filename} desde Lambda/S3`);
            return await lambdaResponse.json();
        }
    } catch (error) {
        console.log(`⚠️ Lambda no disponible para ${filename}, usando local`);
    }
    
    // Fallback a local
    try {
        const localResponse = await fetch(DATA_SOURCES.local + filename);
        if (localResponse.ok) {
            console.log(`📁 Cargando ${filename} desde local`);
            return await localResponse.json();
        }
    } catch (error) {
        console.error(`❌ Error cargando ${filename}:`, error);
        return null;
    }
}

// =============================================================================
// NÚCLEO: INICIALIZACIÓN Y FUNCIONES PRINCIPALES
// =============================================================================

async function loadHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) {
        return; // No hay placeholder, no hacer nada.
    }

    try {
        // Cargar el nuevo CSS del header dinámicamente
        const headerCssLink = document.createElement('link');
        headerCssLink.rel = 'stylesheet';
        headerCssLink.href = 'assets/css/header.css';
        document.head.appendChild(headerCssLink);

        // Cargar el CSS de la top-bar
        const topBarCssLink = document.createElement('link');
        topBarCssLink.rel = 'stylesheet';
        topBarCssLink.href = 'assets/css/top-bar.css';
        document.head.appendChild(topBarCssLink);

        const response = await fetch('assets/shared/header.html'); // Cargar la nueva versión del header
        if (!response.ok) throw new Error(`Error al cargar header: ${response.status}`);
        
        const headerHTML = await response.text();
        headerPlaceholder.outerHTML = headerHTML;
        
        // Crear y añadir el overlay del menú móvil
        const menuOverlay = document.createElement('div');
        menuOverlay.classList.add('menu-overlay');
        document.body.appendChild(menuOverlay);
        
        // Una vez que el header y scripts esenciales están en el DOM, inicializamos su funcionalidad.
        loadTheme(); 
        addHeaderEventListeners();
        
    } catch (error) {
        console.error('loadHeader: Error al cargar el header:', error);
        if(headerPlaceholder) headerPlaceholder.innerHTML = '<p style="color:red; text-align:center;">Error al cargar el menú.</p>';
    }
}

// Esperar a que los scripts de autenticación se carguen completamente
document.addEventListener('authScriptsLoaded', async () => {
    await loadHeader(); // Carga el header y sus eventos primero

    // Añade listeners para el contenido específico de la página
    addPageEventListeners(); 

    // Inicializa el resto de componentes de la página
    if (document.getElementById('particles-js')) {
        initParticles();
    }

    initBackToTopButton(); // Añadido para el botón de volver arriba

    if (document.getElementById('events-container')) {
        loadEvents();
    }
    if (document.getElementById('resources-grid')) {
        loadResources();
    }
    if (document.getElementById('logic-games-grid')) {
        loadLogicGames();
    }
    if (document.getElementById('workshops-container')) {
        loadWorkshops();
    }
    if (document.getElementById('glossary-container')) { // New
        loadGlossary();
    }
    if (document.querySelector('.badge-carousel-wrapper')) {
        initCarousel();
    }
    if (document.getElementById('feed-container')) {
        loadFeed();
    }
    initScrollAnimations();
});

// =============================================================================
// REGISTRO CENTRAL DE EVENT LISTENERS
// =============================================================================

function addHeaderEventListeners() {
    const hamburger = document.querySelector('.hamburger');
    const menuOverlay = document.querySelector('.menu-overlay'); // Obtener el overlay

    if (hamburger) {
        hamburger.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleMenu();
        });
    }

    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (event) => {
            if (window.innerWidth <= 768) {
                const parentDropdown = toggle.parentElement;
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

    document.addEventListener('click', (event) => {
        const nav = document.querySelector('.nav');
        const navMenu = document.getElementById('nav-menu');
        // También cerrar el menú si se hace clic en el overlay
        if (nav && navMenu && !nav.contains(event.target) && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });

    if (menuOverlay) { // Cerrar menú al hacer clic en el overlay
        menuOverlay.addEventListener('click', closeMenu);
    }

    // Asegurarse de que AuthManager configure sus event listeners DESPUÉS de que el header esté en el DOM
    if (window.authManager && typeof window.authManager.setupEventListeners === 'function') {
        window.authManager.setupEventListeners();
    }
}

function addPageEventListeners() {
    const donationBtn = document.querySelector('.donation-btn');
    if (donationBtn) {
        donationBtn.addEventListener('click', showDonationInfo);
    }
}

// =============================================================================
// MENÚ DE NAVEGACIÓN (HAMBURGUESA)
// =============================================================================

function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.querySelector('.hamburger');
    const menuOverlay = document.querySelector('.menu-overlay'); // Obtener el overlay

    if (navMenu && hamburger) {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        if (menuOverlay) {
            menuOverlay.classList.toggle('active'); // Alternar la clase 'active' del overlay
        }
        document.body.classList.toggle('no-scroll'); // Prevenir scroll en el body
    }
}

function closeMenu() {
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.querySelector('.hamburger');
    const menuOverlay = document.querySelector('.menu-overlay'); // Obtener el overlay

    if (navMenu && hamburger) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        if (menuOverlay) {
            menuOverlay.classList.remove('active'); // Quitar la clase 'active' del overlay
        }
        document.body.classList.remove('no-scroll'); // Permitir scroll en el body
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
// PÁGINA DE GLOSARIO (TÉRMINOS INTERACTIVOS)
// =============================================================================

async function loadGlossary() {
    const container = document.getElementById('glossary-container');
    if (!container) return;

    showSkeletonLoader(container, termCardSkeleton, 3); // Mostrar esqueletos

    const searchInput = document.getElementById('glossary-search');
    const alphabetFilterContainer = document.getElementById('alphabet-filter');

    let allTerms = []; // Para almacenar todos los términos para filtrar

    try {
        // Simular un pequeño retraso para que el esqueleto sea visible
        await new Promise(resolve => setTimeout(resolve, 500));

        const response = await loadData('glosario.json');
        allTerms = response || [];

        if (allTerms.length === 0) {
            container.innerHTML = '<p>No hay términos en el glosario en este momento.</p>';
            return;
        }

        // Ordenar términos alfabéticamente
        allTerms.sort((a, b) => a.term.localeCompare(b.term));

        // Renderizar términos iniciales
        renderTerms(allTerms);

        // Generar Filtro Alfabético
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        alphabetFilterContainer.innerHTML = '<button class="active" data-filter="all">Todos</button>';
        alphabet.forEach(letter => {
            const button = document.createElement('button');
            button.textContent = letter;
            button.setAttribute('data-filter', letter);
            alphabetFilterContainer.appendChild(button);
        });

        // Añadir Event Listeners para Búsqueda y Filtro
        searchInput.addEventListener('input', () => filterTerms(allTerms, searchInput.value, alphabetFilterContainer.querySelector('.alphabet-filter button.active').dataset.filter));
        alphabetFilterContainer.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON') {
                alphabetFilterContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                event.target.classList.add('active');
                filterTerms(allTerms, searchInput.value, event.target.dataset.filter);
            }
        });

    } catch (error) {
        console.error('Error al cargar el glosario:', error);
        container.innerHTML = '<p>Error al cargar el glosario. Intenta recargar la página.</p>';
    }

    function renderTerms(termsToRender) {
        let html = '';
        if (termsToRender.length === 0) {
            html = '<p style="text-align: center;">No se encontraron términos que coincidan con tu búsqueda.</p>';
        } else {
            termsToRender.forEach(term => {
                html += `
                    <div class="term-card">
                        <h3>${term.term}</h3>
                        <p>${term.definition}</p>
                        <span class="category-tag">${term.category}</span>
                    </div>
                `;
            });
        }
        container.innerHTML = html;
        initScrollAnimations(); // Reinicializar animaciones de scroll para las nuevas tarjetas
    }

    function filterTerms(terms, searchText, alphaFilter) {
        const filtered = terms.filter(term => {
            const matchesSearch = term.term.toLowerCase().includes(searchText.toLowerCase()) ||
                                  term.definition.toLowerCase().includes(searchText.toLowerCase());
            const matchesAlpha = alphaFilter === 'all' || term.term.toUpperCase().startsWith(alphaFilter);
            return matchesSearch && matchesAlpha;
        });
        renderTerms(filtered);
    }
}



// =============================================================================
// CARGA DINÁMICA DE CONTENIDO (EVENTOS Y RECURSOS)
// =============================================================================

async function loadEvents() {
    const container = document.getElementById('events-container');
    if (!container) return;

    showSkeletonLoader(container, eventCardSkeleton, 2, 'events-grid');

    try {
        await new Promise(resolve => setTimeout(resolve, 500));

        const events = await loadData('events.json');
        if (!events) return;

        if (events.length === 0) {
            container.innerHTML = '<p>No hay eventos próximos. ¡Vuelve pronto!</p>';
            return;
        }

        // Filtrar y ordenar eventos por fecha (más recientes primero)
        const now = new Date();
        const sortedEvents = events
            .filter(event => event.date) // Solo eventos con fecha
            .sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA; // Más recientes primero
            });

        // Separar eventos por estado
        const upcomingEvents = sortedEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= now && event.status === 'abierto';
        });

        const pastEvents = sortedEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate < now || event.status === 'cerrado' || event.status === 'cancelado';
        });

        let html = '';

        // Eventos próximos
        if (upcomingEvents.length > 0) {
            html += '<h2 class="events-section-title">🟢 Próximos Eventos</h2>';
            html += '<div class="events-grid">';
            upcomingEvents.forEach(event => {
                html += renderEventCard(event);
            });
            html += '</div>';
        }

        // Eventos pasados
        if (pastEvents.length > 0) {
            html += '<h2 class="events-section-title">📅 Eventos Pasados</h2>';
            html += '<div class="events-grid past-events">';
            pastEvents.forEach(event => {
                html += renderEventCard(event);
            });
            html += '</div>';
        }

        if (upcomingEvents.length === 0 && pastEvents.length === 0) {
            html = '<p>No hay eventos disponibles. ¡Vuelve pronto!</p>';
        }

        container.innerHTML = html;

    } catch (error) {
        console.error('Error loading events:', error);
        container.innerHTML = '<p>Error al cargar eventos. Intenta más tarde.</p>';
    }
}

function renderEventCard(event) {
    const eventDate = new Date(event.date);
    const now = new Date();
    const isPast = eventDate < now || event.status === 'cerrado' || event.status === 'cancelado';
    
    // Formatear fecha
    const formattedDate = eventDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Estado del evento
    let statusBadge = '';
    let registrationButton = '';
    
    switch(event.status) {
        case 'abierto':
            if (!isPast) {
                statusBadge = '<span class="event-status open">🟢 Abierto</span>';
                if (event.registrationUrl) {
                    registrationButton = `<a href="${event.registrationUrl}" target="_blank" class="btn-register">Registrarse</a>`;
                }
            } else {
                statusBadge = '<span class="event-status closed">🔴 Finalizado</span>';
            }
            break;
        case 'cerrado':
            statusBadge = '<span class="event-status closed">🔴 Cerrado</span>';
            break;
        case 'cancelado':
            statusBadge = '<span class="event-status cancelled">⚫ Cancelado</span>';
            break;
    }

    return `
        <div class="event-card ${isPast ? 'past-event' : ''}">
            ${event.image ? `<img src="${event.image}" alt="${event.title}" class="event-image">` : ''}
            <div class="event-content">
                <div class="event-header">
                    <h3>${event.title}</h3>
                    ${statusBadge}
                </div>
                <p class="event-date">📅 ${formattedDate}</p>
                ${event.location ? `<p class="event-location">📍 ${event.location}</p>` : ''}
                <p class="event-description">${event.description || event.content || ''}</p>
                ${registrationButton}
            </div>
        </div>
    `;
}

        let html = '';
        const sortedYears = Object.keys(eventsByYear).sort((a, b) => b - a);

        sortedYears.forEach(year => {
            html += `<section class="content-section"><h2>Eventos ${year}</h2><div class="events-grid">`;
            
            eventsByYear[year].forEach(event => {
                const tagsHtml = event.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
                const formatHtml = event.format ? `<span class="tag format-tag">${event.format}</span>` : '';
                
                // Indicador de precio
                const priceHtml = event.price ? 
                    `<span class="price-tag ${event.price}">${event.price === 'free' ? '🆓 GRATIS' : '💰 DE PAGO'}</span>` : '';
                
                // Determinar si el evento es próximo o pasado
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
                
                let isPastEvent = false;
                let isUpcoming = false;
                let statusIndicator = '';
                
                if (event.date) {
                    const eventDate = new Date(event.date);
                    eventDate.setHours(0, 0, 0, 0);
                    isPastEvent = eventDate < today;
                    isUpcoming = eventDate >= today;
                    
                    if (isPastEvent) {
                        statusIndicator = '<span class="event-status past">✓ REALIZADO</span>';
                    } else {
                        statusIndicator = '<span class="event-status upcoming">🔥 PRÓXIMO</span>';
                    }
                } else {
                    // Eventos sin fecha específica (como "Próximamente")
                    isUpcoming = true;
                    statusIndicator = '<span class="event-status upcoming">🗓️ PRÓXIMO</span>';
                }
                
                let dateBlockHtml = '';
                if (event.date) {
                    const date = new Date(event.date);
                    const month = date.toLocaleString('es-ES', { month: 'short' }).toUpperCase().replace('.','');
                    const day = date.getDate();
                    const statusClass = isPastEvent ? 'past-event' : 'upcoming-event';
                    dateBlockHtml = `
                        <div class="event-date-block ${statusClass}">
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

                // Botón de registro mejorado - solo para eventos próximos con URL
                const registrationButton = (event.registration_url && isUpcoming) ? 
                    `<div class="event-registration">
                        <a href="${event.registration_url}" target="_blank" class="register-btn">
                            <span class="btn-icon">🎯</span>
                            <span class="btn-text">Registrarse Ahora</span>
                        </a>
                    </div>` : '';

                const cardClass = isPastEvent ? 'event-card past-event-card' : 'event-card';

                html += `
                    <div class="${cardClass}">
                        ${dateBlockHtml}
                        <div class="event-details">
                            <div class="event-badges">
                                ${statusIndicator}
                                ${priceHtml}
                            </div>
                            <h3 class="event-title">${event.title}</h3>
                            <p class="event-description">${event.description}</p>
                            <div class="event-tags">${tagsHtml}${formatHtml}</div>
                            ${registrationButton}
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
    const container = document.getElementById('resources-grid');
    const headersContainer = document.getElementById('resources-tab-headers');
    if (!container || !headersContainer) return;

    let allCategories = [];
    let activeCategory = 'all';

    try {
        allCategories = await loadData('resources.json');
        if (!allCategories) return;

        if (allCategories.length === 0) {
            container.innerHTML = '<p>No hay recursos disponibles en este momento.</p>';
            return;
        }

        render();

        // Event listener para filtros
        headersContainer.addEventListener('click', (event) => {
            const tabHeader = event.target.closest('.tab-header');
            if (tabHeader) {
                activeCategory = tabHeader.getAttribute('data-category');
                render();
            }
        });

    } catch (error) {
        console.error('Error al cargar los recursos:', error);
        container.innerHTML = '<p>Error al cargar los recursos. Intenta recargar la página.</p>';
    }

    function render() {
        // Renderizar filtros
        const categories = ['all', ...allCategories.map(cat => cat.category)];
        headersContainer.innerHTML = categories.map(category => `
            <button class="tab-header ${category === activeCategory ? 'active' : ''}" data-category="${category}">
                ${category === 'all' ? 'Todos' : category}
            </button>
        `).join('');

        // Filtrar y renderizar recursos
        let itemsToShow = [];
        if (activeCategory === 'all') {
            allCategories.forEach(category => {
                itemsToShow.push(...category.items);
            });
        } else {
            const categoryData = allCategories.find(c => c.category === activeCategory);
            itemsToShow = categoryData ? categoryData.items : [];
        }

        container.innerHTML = itemsToShow.map(resource => `
            <div class="lab-module">
                <div class="resource-card-image-container">
                    <img src="${resource.image}" alt="${resource.title}" loading="lazy">
                </div>
                <h3>${resource.title}</h3>
                <p>${resource.description}</p>
                <a href="${resource.url}" target="_blank" class="cta-button">Ver Recurso</a>
            </div>
        `).join('');

        initScrollAnimations();
    }
}

// =============================================================================
// PÁGINA DE JUEGOS DE LÓGICA
// =============================================================================

async function loadLogicGames() {
    const container = document.getElementById('logic-games-grid');
    if (!container) return;

    const tagFilterContainer = document.getElementById('logic-games-tag-filter');
    if (!tagFilterContainer) return;

    showSkeletonLoader(container, labCardSkeleton, 6);

    let allGames = [];
    let activeTag = 'all';

    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        allGames = await loadData('logic-games.json');
        if (!allGames) return;

        if (allGames.length === 0) {
            container.innerHTML = '<p>No hay juegos de lógica disponibles en este momento.</p>';
            return;
        }

        render();

        tagFilterContainer.addEventListener('click', (event) => {
            const tagButton = event.target.closest('.tag-filter-btn');
            if (tagButton) {
                activeTag = tagButton.getAttribute('data-tag');
                render();
            }
        });

    } catch (error) {
        console.error('Error al cargar los juegos de lógica:', error);
        container.innerHTML = '<p>Error al cargar los juegos. Intenta recargar la página.</p>';
    }

    function render() {
        // 1. Extraer y renderizar los filtros de etiquetas
        const allTags = new Set(['all']);
        allGames.forEach(item => {
            item.tags.forEach(tag => allTags.add(tag));
        });

        tagFilterContainer.innerHTML = Array.from(allTags).sort().map(tag => `
            <button class="tag-filter-btn ${tag === activeTag ? 'active' : ''}" data-tag="${tag}">
                ${tag === 'all' ? 'Todos' : tag}
            </button>
        `).join('');

        // 2. Filtrar y renderizar el contenido
        const filteredGames = activeTag === 'all'
            ? allGames
            : allGames.filter(item => item.tags.includes(activeTag));

        let html = '';
        if (filteredGames.length > 0) {
            filteredGames.forEach(game => {
                const tagsHtml = game.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
                html += `
                    <a href="${game.url}" target="_blank" class="lab-card active">
                        <div class="lab-card-image-container">
                            <img src="${game.image}" alt="Imagen de ${game.title}" class="resource-image">
                        </div>
                        <div class="lab-card-content">
                            <h3>${game.title}</h3>
                            <p>${game.description}</p>
                            <div class="resource-tags">${tagsHtml}</div>
                        </div>
                    </a>
                `;
            });
        } else {
            html = '<p style="text-align: center; grid-column: 1 / -1;">No hay juegos que coincidan con el filtro seleccionado.</p>';
        }

        container.innerHTML = html;
        initScrollAnimations();
    }
}

// =============================================================================
// PÁGINA DE HISTORIAL DE TALLERES
// =============================================================================

async function loadWorkshops() {
    const container = document.getElementById('workshops-container');
    if (!container) return;

    const tagFilterContainer = document.getElementById('workshops-tag-filter');
    if (!tagFilterContainer) return;

    showSkeletonLoader(container, labCardSkeleton, 4);

    let allWorkshops = [];
    let activeTag = 'all';

    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        allWorkshops = await loadData('workshops.json');
        if (!allWorkshops) return;

        if (allWorkshops.length === 0) {
            container.innerHTML = '<p>Aún no hay talleres en el historial. ¡Vuelve pronto!</p>';
            return;
        }

        // Sort by date, newest first
        allWorkshops.sort((a, b) => new Date(b.date) - new Date(a.date));

        render();

        tagFilterContainer.addEventListener('click', (event) => {
            const tagButton = event.target.closest('.tag-filter-btn');
            if (tagButton) {
                activeTag = tagButton.getAttribute('data-tag');
                render();
            }
        });

    } catch (error) {
        console.error('Error al cargar los talleres:', error);
        container.innerHTML = '<p>Error al cargar el historial de talleres.</p>';
    }

    function render() {
        // 1. Extraer y renderizar los filtros de etiquetas
        const allTags = new Set(['all']);
        allWorkshops.forEach(item => {
            item.tags.forEach(tag => allTags.add(tag));
        });

        tagFilterContainer.innerHTML = Array.from(allTags).sort().map(tag => `
            <button class="tag-filter-btn ${tag === activeTag ? 'active' : ''}" data-tag="${tag}">
                ${tag === 'all' ? 'Todos' : tag}
            </button>
        `).join('');

        // 2. Filtrar y renderizar el contenido
        const filteredWorkshops = activeTag === 'all'
            ? allWorkshops
            : allWorkshops.filter(item => item.tags.includes(activeTag));

        let html = '';
        if (filteredWorkshops.length > 0) {
            filteredWorkshops.forEach(workshop => {
                const tagsHtml = workshop.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
                const materialsButton = workshop.materials_link
                    ? `<a href="${workshop.materials_link}" target="_blank" class="card-button">Ver Materiales</a>`
                    : '';
                const formattedDate = new Date(workshop.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

                html += `
                    <div class="lab-card active">
                        <div class="lab-card-image-container">
                            <img src="${workshop.image}" alt="Imagen de ${workshop.title}" class="resource-image" loading="lazy">
                        </div>
                        <div class="lab-card-content">
                            <p class="card-date">${formattedDate}</p>
                            <h3>${workshop.title}</h3>
                            <p>${workshop.description}</p>
                            <div class="resource-tags">${tagsHtml}</div>
                            ${materialsButton}
                        </div>
                    </div>
                `;
            });
        } else {
            html = '<p style="text-align: center; grid-column: 1 / -1;">No hay talleres que coincidan con el filtro seleccionado.</p>';
        }

        container.innerHTML = html;
        initScrollAnimations();
    }
}

// =============================================================================
// FEED DE LA COMUNIDAD
// =============================================================================

async function loadFeed() {
    const container = document.getElementById('feed-container');
    if (!container) return;

    showSkeletonLoader(container, feedPostSkeleton, 2);

    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Cargar feed desde S3 con fallback a local
        const feedData = await loadData('feed.json');
        if (!feedData) {
            throw new Error('No se pudo cargar el feed');
        }

        // Manejar diferentes formatos de datos
        let posts;
        if (Array.isArray(feedData)) {
            posts = feedData; // Si es array directo
        } else if (feedData.posts) {
            posts = feedData.posts; // Si tiene propiedad posts
        } else {
            posts = []; // Fallback
        }

        console.log('📰 Posts cargados en feed público:', posts.length);

        if (!posts || posts.length === 0) {
            container.innerHTML = '<p style="text-align: center;">Aún no hay nada en el feed. ¡Vuelve pronto!</p>';
            return;
        }

        // Ordenar posts por fecha, más nuevos primero
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        let html = '';
        posts.forEach(post => {
            const postDate = new Date(post.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
            const isLiked = localStorage.getItem(`like_${post.id}`) === 'true';

            // ¡CAMBIO IMPORTANTE! La URL para compartir ahora apunta a tu API Gateway.
            const shareUrl = `https://share.tiburoncp.siegfried-fs.com/share?postId=${post.id}&v=${Date.now()}`;

            html += `
                <div class="feed-post" id="post-${post.id}">
                    <div class="feed-post-header">
                        <img src="${post.author.avatar}" alt="Avatar de ${post.author.name}">
                        <div class="author-info">
                            <div class="author-name">${post.author.name}</div>
                            <div class="post-date">${postDate}</div>
                        </div>
                    </div>
                    ${post.imageUrl ? `<img data-src="${post.imageUrl}" alt="" class="feed-post-image" loading="lazy">` : ''}
                    <div class="feed-post-content">
                        <h3>${post.title}</h3>
                        <p>${post.content.replace(/\n/g, '<br>')}</p>
                    </div>
                    <div class="feed-post-actions">
                        <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
                            <span class="like-icon">${isLiked ? '❤️' : '🤍'}</span>
                            <span class="like-count">${post.likes}</span>
                        </button>
                        <div class="share-options">
                            <button class="action-btn share-btn" data-share-url="${shareUrl}" data-share-title="${post.title}">📤 Compartir</button>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        addFeedEventListeners();
        initScrollAnimations();
        
        // Activate lazy loading for images
        if (window.lazyLoader) {
            window.lazyLoader.observeAll();
        }
        
        // Check if there's a hash in the URL to scroll to specific post
        if (window.location.hash) {
            const targetId = window.location.hash.substring(1); // Remove #
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetElement.style.border = '2px solid #0066cc';
                    targetElement.style.borderRadius = '8px';
                    setTimeout(() => {
                        targetElement.style.border = '';
                        targetElement.style.borderRadius = '';
                    }, 3000);
                }, 500);
            }
        }

    } catch (error) {
        console.error('Error al cargar el feed:', error);
        container.innerHTML = '<p>Error al cargar el feed. Intenta recargar la página.</p>';
    }
}

function addFeedEventListeners() {
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const postId = button.dataset.postId;
            const postElement = document.getElementById(`post-${postId}`);
            const likeIcon = button.querySelector('.like-icon');
            const likeCount = button.querySelector('.like-count');
            
            let isLiked = localStorage.getItem(`like_${postId}`) === 'true';
            let currentLikes = parseInt(likeCount.textContent);

            if (isLiked) {
                localStorage.removeItem(`like_${postId}`);
                button.classList.remove('liked');
                likeIcon.textContent = '🤍';
                likeCount.textContent = currentLikes - 1;
            } else {
                localStorage.setItem(`like_${postId}`, 'true');
                button.classList.add('liked');
                likeIcon.textContent = '❤️';
                likeCount.textContent = currentLikes + 1;
            }
        });
    });

    // Add share button event listeners
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(button => {
        button.addEventListener('click', () => {
            const shareUrl = button.dataset.shareUrl;
            const shareTitle = button.dataset.shareTitle;
            openShareModal(shareUrl, shareTitle);
        });
    });
}

// =============================================================================
// COMPONENTES DE UI
// =============================================================================

const feedPostSkeleton = `
<div class="feed-post skeleton">
    <div class="feed-post-header">
        <div class="avatar"></div>
        <div class="author-info">
            <div class="line-1"></div>
            <div class="line-2"></div>
        </div>
    </div>
    <div class="feed-post-image-skeleton"></div>
    <div class="feed-post-content">
        <div class="line-1"></div>
        <div class="line-2"></div>
        <div class="line-1"></div>
    </div>
</div>
`;

// Plantillas de Esqueleto para Carga
const termCardSkeleton = `
<div class="term-card skeleton">
    <h3></h3>
    <p class="line-1"></p>
    <p class="line-2"></p>
    <span class="category-tag"></span>
</div>
`;

const labCardSkeleton = `
<div class="lab-card skeleton">
    <div class="lab-card-image-container"></div>
    <div class="lab-card-content">
        <p class="card-date"></p>
        <h3></h3>
        <p class="line-1"></p>
        <p class="line-2"></p>
        <div class="resource-tags">
            <span class="tag"></span>
            <span class="tag"></span>
        </div>
    </div>
</div>
`;

const eventCardSkeleton = `
<div class="event-card skeleton">
    <div class="event-date-block">
        <span class="day"></span>
        <span class="month"></span>
    </div>
    <div class="event-details">
        <h3 class="event-title"></h3>
        <p class="event-description line-1"></p>
        <p class="event-description line-2"></p>
        <div class="event-tags">
            <span class="tag"></span>
            <span class="tag"></span>
        </div>
    </div>
</div>
`;


/**
 * Muestra un cargador de esqueleto en un contenedor.
 * @param {HTMLElement} container - El elemento contenedor.
 * @param {string} skeletonHTML - La cadena HTML para una sola tarjeta de esqueleto.
 * @param {number} defaultCount - El número de esqueletos a mostrar por defecto.
 * @param {string} [gridClassName] - El nombre de la clase de la cuadrícula para buscar dentro del contenedor.
 */
function showSkeletonLoader(container, skeletonHTML, defaultCount, gridClassName) {
    if (!container) return;

    let count = defaultCount;
    let targetContainer = container;

    // Si se proporciona un gridClassName, buscamos ese contenedor específico para los esqueletos.
    if (gridClassName) {
        const grid = container.querySelector('.' + gridClassName);
        if (grid) {
            targetContainer = grid;
        } else {
            // Si no se encuentra la cuadrícula, creamos una estructura temporal para los esqueletos.
            container.innerHTML = `<section class="content-section"><div class="${gridClassName}"></div></section>`;
            targetContainer = container.querySelector('.' + gridClassName);
        }
    }
    
    // Intenta calcular el número de esqueletos basado en las columnas del grid.
    const gridComputedStyle = window.getComputedStyle(targetContainer);
    const gridCols = gridComputedStyle.getPropertyValue('grid-template-columns').split(' ').length;
    
    if (gridCols > 1) {
        count = gridCols * 2; // Mostrar 2 filas de esqueletos
    }

    let skeletons = '';
    for (let i = 0; i < count; i++) {
        skeletons += skeletonHTML;
    }
    targetContainer.innerHTML = skeletons;
}


function initBackToTopButton() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'back-to-top-btn';
    backToTopBtn.className = 'back-to-top-btn';
    backToTopBtn.innerHTML = '&#8679;'; // Flecha hacia arriba
    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
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
    const animatedElements = document.querySelectorAll('.content-section, .nav-card, .badge-item, .about-card, .contact-card, .lab-card, .event-card'); // Add .lab-card and .event-card

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
// Share Modal Functions
function openShareModal(url, title) {
    const modal = document.getElementById('shareModal');
    
    // Update share links
    document.getElementById('shareFacebook').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    document.getElementById('shareTwitter').href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    document.getElementById('shareLinkedIn').href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    document.getElementById('shareWhatsApp').href = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
    document.getElementById('shareTelegram').href = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    document.getElementById('shareGmail').href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(title + '\n\n' + url)}`;
    
    // Copy button
    document.getElementById('shareCopy').onclick = function() {
        navigator.clipboard.writeText(url).then(() => {
            this.innerHTML = '<div class="share-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>';
            setTimeout(() => {
                this.innerHTML = '<div class="share-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg></div>';
            }, 2000);
        });
    };
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeShareModal() {
    const modal = document.getElementById('shareModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('shareModal');
    if (event.target === modal) {
        closeShareModal();
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeShareModal();
    }
});
