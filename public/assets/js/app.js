// =============================================================================
// NÚCLEO: INICIALIZACIÓN Y FUNCIONES PRINCIPALES
// =============================================================================

async function loadHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return; // No hay placeholder, no hacer nada.

    try {
        const response = await fetch('assets/shared/header.html');
        if (!response.ok) throw new Error(`Error al cargar header: ${response.status}`);
        
        const headerHTML = await response.text();
        headerPlaceholder.outerHTML = headerHTML;
        
        // Una vez que el header está en el DOM, inicializamos su funcionalidad.
        loadTheme(); 
        addHeaderEventListeners();

    } catch (error) {
        console.error('Error al cargar el header:', error);
        if(headerPlaceholder) headerPlaceholder.innerHTML = '<p style="color:red; text-align:center;">Error al cargar el menú.</p>';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadHeader(); // Carga el header y sus eventos primero

    // Añade listeners para el contenido específico de la página
    addPageEventListeners(); 

    // Inicializa el resto de componentes de la página
    if (document.getElementById('particles-js')) {
        initParticles();
    }

    if (document.getElementById('events-container')) {
        loadEvents();
    }
    if (document.getElementById('resources-container')) {
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
    initScrollAnimations();
});

// =============================================================================
// REGISTRO CENTRAL DE EVENT LISTENERS
// =============================================================================

function addHeaderEventListeners() {
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleMenu();
        });
    }

    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (event) => {
            const parentDropdown = toggle.parentElement;
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

    document.addEventListener('click', (event) => {
        const nav = document.querySelector('.nav');
        const navMenu = document.getElementById('nav-menu');
        if (nav && navMenu && !nav.contains(event.target) && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });
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
// PÁGINA DE GLOSARIO (TÉRMINOS INTERACTIVOS)
// =============================================================================

async function loadGlossary() {
    const container = document.getElementById('glossary-container');
    if (!container) return;

    const searchInput = document.getElementById('glossary-search');
    const alphabetFilterContainer = document.getElementById('alphabet-filter');

    let allTerms = []; // Para almacenar todos los términos para filtrar

    try {
        const response = await fetch('assets/data/glosario.json');
        allTerms = await response.json();

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
// PÁGINA DE GLOSARIO (TÉRMINOS INTERACTIVOS)
// =============================================================================

async function loadGlossary() {
    const container = document.getElementById('glossary-container');
    if (!container) return;

    const searchInput = document.getElementById('glossary-search');
    const alphabetFilterContainer = document.getElementById('alphabet-filter');

    let allTerms = []; // Para almacenar todos los términos para filtrar

    try {
        const response = await fetch('assets/data/glosario.json');
        allTerms = await response.json();

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
        searchInput.addEventListener('input', () => {
            const activeFilter = alphabetFilterContainer.querySelector('button.active');
            filterTerms(allTerms, searchInput.value, activeFilter ? activeFilter.dataset.filter : 'all');
        });
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

function addResourceTabListeners() {
    const tabContainer = document.getElementById('resources-container');
    if (!tabContainer) return;

    const tabHeaders = tabContainer.querySelectorAll('.tab-header');
    const tabContents = tabContainer.querySelectorAll('.tab-content');

    tabHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const targetTab = header.getAttribute('data-category');

            tabHeaders.forEach(h => h.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            header.classList.add('active');
            const newActiveContent = tabContainer.querySelector(`.tab-content[data-category="${targetTab}"]`);
            if (newActiveContent) {
                newActiveContent.classList.add('active');
            }
        });
    });
}

async function loadResources() {
    const container = document.getElementById('resources-container');
    if (!container) return;

    const headersContainer = document.getElementById('resources-tab-headers');
    const contentsContainer = document.getElementById('resources-tab-contents');

    if (!headersContainer || !contentsContainer) {
        // Si no están los contenedores de pestañas, no hacer nada.
        // Esto evita errores si la página no tiene la nueva estructura.
        return;
    }

    try {
        const response = await fetch('assets/data/resources.json');
        const categories = await response.json();

        if (categories.length === 0) {
            container.innerHTML = '<p>No hay recursos disponibles en este momento.</p>';
            return;
        }

        categories.forEach((category, index) => {
            // Crear cabecera de pestaña
            const header = document.createElement('button');
            header.className = 'tab-header';
            header.textContent = category.category;
            header.setAttribute('data-category', category.category);
            if (index === 0) {
                header.classList.add('active');
            }
            headersContainer.appendChild(header);

            // Crear contenido de pestaña
            const content = document.createElement('div');
            content.className = 'tab-content';
            content.setAttribute('data-category', category.category);
            if (index === 0) {
                content.classList.add('active');
            }
            
            let itemsHtml = '<div class="labs-grid">';
            category.items.forEach(resource => {
                const tagsHtml = resource.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
                
                itemsHtml += `
                    <a href="${resource.url}" target="_blank" class="resource-card">
                        <div class="resource-card-image-container">
                            <img src="${resource.image}" alt="Imagen de ${resource.title}" class="resource-card-image" loading="lazy">
                        </div>
                        <div class="resource-card-content">
                            <h3>${resource.title}</h3>
                            <p>${resource.description}</p>
                            <div class="resource-tags">${tagsHtml}</div>
                        </div>
                    </a>
                `;
            });
            itemsHtml += '</div>';
            content.innerHTML = itemsHtml;
            contentsContainer.appendChild(content);
        });

        // Añadir listeners para las nuevas pestañas
        addResourceTabListeners();
        // Reinicializar animaciones de scroll para las nuevas tarjetas
        initScrollAnimations();

    } catch (error) {
        console.error('Error al cargar los recursos:', error);
        container.innerHTML = '<p>Error al cargar los recursos. Intenta recargar la página.</p>';
    }
}

// =============================================================================
// PÁGINA DE JUEGOS DE LÓGICA
// =============================================================================

async function loadLogicGames() {
    const container = document.getElementById('logic-games-grid');
    if (!container) {
        return;
    }

    try {
        const response = await fetch('assets/data/logic-games.json');

        if (!response.ok) {
            container.innerHTML = `<p>Error al cargar los juegos: ${response.status}. Intenta recargar la página.</p>`;
            return;
        }

        const games = await response.json();

        if (games.length === 0) {
            container.innerHTML = '<p>No hay juegos de lógica disponibles en este momento.</p>';
            return;
        }

        let html = '';
        games.forEach(game => {
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

        container.innerHTML = html;
        initScrollAnimations(); // Re-initialize scroll animations for new cards
    } catch (error) {
        container.innerHTML = '<p>Error al cargar los juegos. Intenta recargar la página.</p>';
    }
}

// =============================================================================
// PÁGINA DE HISTORIAL DE TALLERES
// =============================================================================

async function loadWorkshops() {
    const container = document.getElementById('workshops-container');
    if (!container) return;

    try {
        const response = await fetch('assets/data/workshops.json');
        const workshops = await response.json();

        if (workshops.length === 0) {
            container.innerHTML = '<p>Aún no hay talleres en el historial. ¡Vuelve pronto!</p>';
            return;
        }

        // Sort by date, newest first
        workshops.sort((a, b) => new Date(b.date) - new Date(a.date));

        let html = '';
        workshops.forEach(workshop => {
            const tagsHtml = workshop.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
            const materialsButton = workshop.materials_link 
                ? `<a href="${workshop.materials_link}" target="_blank" class="card-button">Ver Materiales</a>`
                : '';

            // Format date to be more readable
            const workshopDate = new Date(workshop.date);
            const formattedDate = workshopDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

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

        container.innerHTML = html;
        initScrollAnimations();

    } catch (error) {
        console.error('Error al cargar los talleres:', error);
        container.innerHTML = '<p>Error al cargar el historial de talleres.</p>';
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