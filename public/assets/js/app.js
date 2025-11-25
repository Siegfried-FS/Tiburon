// =============================================================================
// UTILIDADES DE TEMA (APLICACIÓN INMEDIATA PARA PREVENIR FLICKER)
// =============================================================================

function applyThemeImmediately() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}
applyThemeImmediately(); // Ejecutar inmediatamente para prevenir el "flicker"

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
    // Usar solo rutas locales por ahora para diagnosticar
    try {
        const localResponse = await fetch(DATA_SOURCES.local + filename);
        if (localResponse.ok) {
            console.log(`📁 Cargando ${filename} desde local`);
            return await localResponse.json();
        } else {
            console.error(`❌ Error HTTP ${localResponse.status} cargando ${filename}`);
        }
    } catch (error) {
        console.error(`❌ Error cargando ${filename}:`, error);
    }
    return null;
}

// =============================================================================
// UTILIDADES DE RENDERIZADO (ELIMINAR DUPLICACIÓN)
// =============================================================================

// Mensajes de error estándar
const ERROR_MESSAGES = {
    noData: (type) => `No hay ${type} disponibles en este momento.`,
    loadError: (type) => `Error al cargar ${type}. Intenta recargar la página.`,
    noResults: 'No se encontraron resultados que coincidan con la búsqueda o filtro.'
};

// Función utilitaria para renderizar contenido con manejo de errores
function renderContent(container, html, callback = null) {
    if (!container) return;
    container.innerHTML = html;
    if (callback) callback();
}

// Función utilitaria para manejar carga de datos con mensajes estándar
async function loadAndRender(filename, container, renderFunction, dataType, callback = null) {
    if (!container) return;
    
    try {
        const data = await loadData(filename);
        if (!data || data.length === 0) {
            renderContent(container, `<p style="text-align: center;">${ERROR_MESSAGES.noData(dataType)}</p>`);
            return;
        }
        
        const html = renderFunction(data);
        renderContent(container, html, callback);
        
    } catch (error) {
        console.error(`Error al cargar ${dataType}:`, error);
        renderContent(container, `<p style="text-align: center;">${ERROR_MESSAGES.loadError(dataType)}</p>`);
    }
}

// =============================================================================
// INICIALIZACIÓN
// =============================================================================

document.addEventListener('authScriptsLoaded', async () => {
    // Cargar header dinámico primero
    await loadHeader();
    
    // Inicializar componentes básicos
    loadTheme();
    
    // Cargar contenido dinámico
    if (document.getElementById('events-container')) {
        loadEvents();
    }
    if (document.getElementById('feed-container')) {
        loadFeed();
    }
    if (document.getElementById('resources-grid')) {
        loadResources();
    }
    if (document.getElementById('glossary-container')) {
        loadGlossary();
    }
    if (document.getElementById('logic-games-grid')) {
        loadLogicGames();
    }
    
    // Inicializar funcionalidades
    initScrollAnimations();
    initBackToTopButton();
    
    // Event listeners
    setupEventListeners();

                // Asegurar que la UI de autenticación se actualice después de cargar el header
                window.authManager.init(); // Llama a init(), que a su vez llama a checkAuthState()
                updateAdminNavigation();});

// =============================================================================
// CARGA DEL HEADER DINÁMICO
// =============================================================================

async function loadHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) {
        return; // No hay placeholder, no hacer nada
    }

    try {
        const response = await fetch('assets/shared/header.html');
        if (!response.ok) throw new Error(`Error al cargar header: ${response.status}`);
        
        const headerHTML = await response.text();
        headerPlaceholder.outerHTML = headerHTML;
        
        // Configurar event listeners del header después de cargarlo
        setupHeaderEventListeners();
        
    } catch (error) {
        console.error('Error al cargar el header:', error);
        if(headerPlaceholder) {
            headerPlaceholder.innerHTML = '<p style="color:red; text-align:center;">Error al cargar el menú.</p>';
        }
    }
}

function setupHeaderEventListeners() {
    // Hamburger menu
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleMenu();
        });
    }

    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            // Always prevent default for links in nav-menu that are just '#'
            if (this.getAttribute('href') === '#') {
                event.preventDefault();
            }

            // Handle dropdown toggles (mobile logic)
            if (this.classList.contains('dropdown-toggle')) {
                event.stopPropagation(); // Stop event from bubbling up to the document click listener

                if (window.innerWidth <= 768) {
                    const parentLi = this.parentElement;
                    
                    // Close other open submenus
                    parentLi.parentElement.querySelectorAll('.dropdown.active').forEach(openDropdown => {
                        if (openDropdown !== parentLi) {
                            openDropdown.classList.remove('active');
                        }
                    });

                    parentLi.classList.toggle('active');
                }
            } else {
                // For regular links that are not dropdown toggles, close the menu
                // If they are actual navigation links, the browser will navigate AFTER this click handler.
                closeMenu();
            }
        });
    });

    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        const nav = document.querySelector('.nav');
        const navMenu = document.getElementById('nav-menu');
        if (nav && navMenu && !nav.contains(event.target) && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });
}

// =============================================================================
// TEMA CLARO/OSCURO
// =============================================================================

function toggleTheme() {
    const html = document.documentElement;
    const themeToggle = document.querySelector('.theme-toggle');
    const currentTheme = html.getAttribute('data-theme');

    if (currentTheme === 'light') {
        html.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        if(themeToggle) themeToggle.textContent = '🌙';
    } else {
        html.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        if(themeToggle) themeToggle.textContent = '☀️';
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

// Aplicar tema inmediatamente
// Moved to applyThemeImmediately() function
applyThemeImmediately();

// =============================================================================
// EVENT LISTENERS
// =============================================================================

function setupEventListeners() {
    // Los event listeners del header se configuran en setupHeaderEventListeners()
    // Aquí solo ponemos listeners generales que no dependen del header
    
    // Scroll to post if hash in URL
    if (window.location.hash) {
        setTimeout(() => {
            const targetId = window.location.hash.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetElement.style.border = '2px solid #0066cc';
                targetElement.style.borderRadius = '8px';
                setTimeout(() => {
                    targetElement.style.border = '';
                    targetElement.style.borderRadius = '';
                }, 3000);
            }
        }, 1000);
    }
}

function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    if (navMenu && hamburger) {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    }
}

function closeMenu() {
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    if (navMenu && hamburger) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
}

// =============================================================================
// CARGA DE CONTENIDO
// =============================================================================

async function loadEvents() {
    const container = document.getElementById('events-container');
    
    function renderEventsHTML(events) {
        // Filtrar y ordenar eventos por fecha
        const now = new Date();
        const sortedEvents = events
            .filter(event => event.date)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

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

        return html || '<p>No hay eventos disponibles. ¡Vuelve pronto!</p>';
    }

    await loadAndRender('events.json', container, renderEventsHTML, 'eventos');
}

function renderEventCard(event) {
    const eventDate = new Date(event.date);
    const now = new Date();
    const isPast = eventDate < now || event.status === 'cerrado' || event.status === 'cancelado';

    const day = eventDate.getDate();
    const month = eventDate.toLocaleString('es-ES', { month: 'short' }).toUpperCase();
    const year = eventDate.getFullYear();
    const formattedTime = eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    let statusBadge = '';
    let registrationButton = '';
    let eventStatusClass = '';

    switch(event.status) {
        case 'abierto':
            if (!isPast) {
                statusBadge = '<span class="event-status upcoming">Próximo</span>';
                eventStatusClass = 'upcoming-event';
                if (event.registration_url) { // Changed to registration_url to match events.json
                    registrationButton = `<a href="${event.registration_url}" target="_blank" class="register-btn">Registrarse <span class="btn-icon">➡️</span></a>`;
                }
            } else {
                statusBadge = '<span class="event-status past">Finalizado</span>';
                eventStatusClass = 'past-event';
            }
            break;
        case 'cerrado':
            statusBadge = '<span class="event-status past">Finalizado</span>';
            eventStatusClass = 'past-event';
            break;
        case 'cancelado':
            statusBadge = '<span class="event-status past">Cancelado</span>';
            eventStatusClass = 'past-event';
            break;
        default: // Handle events without explicit status or past events
            if (isPast) {
                statusBadge = '<span class="event-status past">Finalizado</span>';
                eventStatusClass = 'past-event';
            } else {
                 statusBadge = '<span class="event-status upcoming">Próximo</span>';
                 eventStatusClass = 'upcoming-event';
                 if (event.registration_url) {
                    registrationButton = `<a href="${event.registration_url}" target="_blank" class="register-btn">Registrarse <span class="btn-icon">➡️</span></a>`;
                }
            }
            break;
    }
    
    // Price tag
    const priceTag = event.price === 'free' ? '<span class="price-tag free">Gratis</span>' : (event.price ? `<span class="price-tag paid">${event.price}</span>` : '');

    return `
        <div class="event-card ${isPast ? 'past-event-card' : ''}">
            <div class="event-date-block ${eventStatusClass}">
                <span class="day">${day}</span>
                <span class="month">${month}</span>
                <span class="year">${year}</span>
            </div>
            <div class="event-details">
                <h3 class="event-title">${event.title}</h3>
                <p class="event-description">${event.description || ''}</p>
                <div class="event-badges">
                    ${statusBadge}
                    ${priceTag}
                    ${event.format ? `<span class="tag format-tag">${event.format}</span>` : ''}
                </div>
                ${event.location ? `<p class="event-location"><span class="tag">📍 ${event.location}</span></p>` : ''}
                <div class="event-actions">
                    ${registrationButton}
                </div>
            </div>
        </div>
    `;
}

async function loadFeed() {
    const container = document.getElementById('feed-container');
    if (!container) return;

    try {
        const feedData = await loadData('feed.json');
        if (!feedData) {
            throw new Error('No se pudo cargar el feed');
        }

        // Manejar diferentes formatos de datos
        let posts;
        if (Array.isArray(feedData)) {
            posts = feedData;
        } else if (feedData.posts) {
            posts = feedData.posts;
        } else {
            posts = [];
        }

        console.log('📰 Posts cargados en feed público:', posts.length);

        if (!posts || posts.length === 0) {
            container.innerHTML = '<p style="text-align: center;">Aún no hay nada en el feed. ¡Vuelve pronto!</p>';
            return;
        }

        // Ordenar posts por fecha
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        let html = '';
        posts.forEach(post => {
            const postDate = new Date(post.date).toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
            const isLiked = localStorage.getItem(`like_${post.id}`) === 'true';
            const shareUrl = `https://share.tiburoncp.siegfried-fs.com/share?postId=${post.id}&v=${Date.now()}`;

            html += `
                <div class="feed-post" id="post-${post.id}">
                    <div class="feed-post-header">
                        <img src="${post.author.avatar || '/assets/images/avatar-default.png'}" alt="Avatar de ${post.author.name}">
                        <div class="author-info">
                            <div class="author-name">${post.author.name}</div>
                            <div class="post-date">${postDate}</div>
                        </div>
                    </div>
                    ${post.imageUrl ? `<img src="${post.imageUrl}" alt="" class="feed-post-image" loading="lazy">` : ''}
                    <div class="feed-post-content">
                        <h3>${post.title}</h3>
                        <p>${post.content.replace(/\n/g, '<br>')}</p>
                    </div>
                    <div class="feed-post-actions">
                        <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
                            <span class="like-icon">${isLiked ? '❤️' : '🤍'}</span>
                            <span class="like-count">${post.likes || 0}</span>
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

    } catch (error) {
        console.error('Error al cargar el feed:', error);
        container.innerHTML = '<p>Error al cargar el feed. Intenta recargar la página.</p>';
    }
}

function addFeedEventListeners() {
    // Like buttons
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const postId = button.dataset.postId;
            const likeIcon = button.querySelector('.like-icon');
            const likeCount = button.querySelector('.like-count');
            
            let isLiked = localStorage.getItem(`like_${postId}`) === 'true';
            let currentLikes = parseInt(likeCount.textContent) || 0;

            if (isLiked) {
                localStorage.removeItem(`like_${postId}`);
                button.classList.remove('liked');
                likeIcon.textContent = '🤍';
                likeCount.textContent = Math.max(0, currentLikes - 1);
            } else {
                localStorage.setItem(`like_${postId}`, 'true');
                button.classList.add('liked');
                likeIcon.textContent = '❤️';
                likeCount.textContent = currentLikes + 1;
            }
        });
    });

    // Share buttons
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(button => {
        button.addEventListener('click', () => {
            const shareUrl = button.dataset.shareUrl;
            const shareTitle = button.dataset.shareTitle;
            openShareModal(shareUrl, shareTitle);
        });
    });
}

// Función para abrir el modal de compartir
function openShareModal(url, title) {
    // Crear el modal si no existe
    let modal = document.getElementById('shareModal');
    if (!modal) {
        modal = createShareModal();
        document.body.appendChild(modal);
    }

    // Actualizar contenido del modal
    const modalTitle = modal.querySelector('.share-modal-title');
    const shareOptions = modal.querySelector('.share-options-grid');
    
    modalTitle.textContent = `Compartir: ${title}`;
    
    // Configurar opciones de compartir
    const shareData = [
        {
            name: 'Facebook',
            icon: '📘',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            color: '#1877F2'
        },
        {
            name: 'Twitter',
            icon: '🐦',
            url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
            color: '#1DA1F2'
        },
        {
            name: 'LinkedIn',
            icon: '💼',
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            color: '#0A66C2'
        },
        {
            name: 'WhatsApp',
            icon: '💬',
            url: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
            color: '#25D366'
        },
        {
            name: 'Telegram',
            icon: '✈️',
            url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
            color: '#0088CC'
        },
        {
            name: 'Gmail',
            icon: '📧',
            url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
            color: '#EA4335'
        },
        {
            name: 'Copiar',
            icon: '📋',
            action: 'copy',
            color: '#6B7280'
        }
    ];

    shareOptions.innerHTML = shareData.map(option => `
        <button class="share-option" 
                data-url="${option.url || ''}" 
                data-action="${option.action || 'open'}"
                data-copy-url="${url}"
                style="--share-color: ${option.color}">
            <span class="share-icon">${option.icon}</span>
            <span class="share-name">${option.name}</span>
        </button>
    `).join('');

    // Agregar event listeners a las opciones
    shareOptions.querySelectorAll('.share-option').forEach(option => {
        option.addEventListener('click', () => {
            const action = option.dataset.action;
            if (action === 'copy') {
                copyToClipboard(option.dataset.copyUrl);
                showToast('¡Enlace copiado al portapapeles!');
            } else {
                window.open(option.dataset.url, '_blank', 'width=600,height=400');
            }
            closeShareModal();
        });
    });

    // Mostrar modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Animación de entrada
    requestAnimationFrame(() => {
        modal.classList.add('active');
    });
}

// Función para crear el modal de compartir
function createShareModal() {
    const modal = document.createElement('div');
    modal.id = 'shareModal';
    modal.className = 'share-modal';
    modal.innerHTML = `
        <div class="share-modal-overlay"></div>
        <div class="share-modal-content">
            <div class="share-modal-header">
                <h3 class="share-modal-title">Compartir Post</h3>
                <button class="share-modal-close" onclick="closeShareModal()">✕</button>
            </div>
            <div class="share-options-grid">
                <!-- Las opciones se cargan dinámicamente -->
            </div>
        </div>
    `;

    // Event listener para cerrar al hacer clic en el overlay
    modal.querySelector('.share-modal-overlay').addEventListener('click', closeShareModal);
    
    return modal;
}

// Función para cerrar el modal de compartir
function closeShareModal() {
    const modal = document.getElementById('shareModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Función para copiar al portapapeles
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

// Función para mostrar toast notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animación de entrada
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    // Remover después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

async function loadResources() {
    const container = document.getElementById('resources-grid');
    
    function renderResourcesHTML(allCategories) {
        let html = '';
        allCategories.forEach(category => {
            if (category.items && category.items.length > 0) {
                category.items.forEach(resource => {
                    html += `
                        <div class="lab-module">
                            <div class="resource-card-image-container">
                                <img src="${resource.image}" alt="${resource.title}" loading="lazy">
                            </div>
                            <h3>${resource.title}</h3>
                            <p>${resource.description}</p>
                            <a href="${resource.url}" target="_blank" class="cta-button">Ver Recurso</a>
                        </div>
                    `;
                });
            }
        });
        return html;
    }

    await loadAndRender('resources.json', container, renderResourcesHTML, 'recursos', initScrollAnimations);
}

async function loadGlossary() {
    const container = document.getElementById('glossary-container');
    
    function renderGlossaryHTML(terms) {
        // Sort terms alphabetically
        terms.sort((a, b) => a.term.localeCompare(b.term));
        
        let html = '';
        terms.forEach(term => {
            html += renderGlossaryCard(term);
        });
        return html;
    }
    
    function afterRender() {
        const terms = JSON.parse(container.dataset.terms || '[]');
        setupGlossarySearch(terms);
        setupAlphabetFilter(terms);
        initScrollAnimations();
    }

    const terms = await loadData('glosario.json');
    if (terms) {
        container.dataset.terms = JSON.stringify(terms);
        await loadAndRender('glosario.json', container, renderGlossaryHTML, 'términos del glosario', afterRender);
    }
}

function renderGlossaryCard(term) {
    return `
        <div class="term-card">
            <h3>${term.term}</h3>
            ${term.category ? `<p class="glossary-category">Categoría: <span>${term.category}</span></p>` : ''}
            <p>${term.definition}</p>
        </div>
    `;
}

function setupGlossarySearch(terms) {
    const searchInput = document.getElementById('glossary-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        filterAndRenderGlossaryTerms(terms, searchTerm, '');
    });
}

function setupAlphabetFilter(terms) {
    const alphabetFilterContainer = document.getElementById('alphabet-filter');
    if (!alphabetFilterContainer) return;

    // Clear existing filters
    alphabetFilterContainer.innerHTML = '';

    // Create "All" button
    const allButton = document.createElement('button');
    allButton.textContent = 'Todos';
    allButton.classList.add('filter-button');
    allButton.classList.add('active'); // Initially active
    allButton.addEventListener('click', () => {
        filterAndRenderGlossaryTerms(terms, '', '');
        setActiveFilterButton(allButton);
    });
    alphabetFilterContainer.appendChild(allButton);

    // Create alphabet buttons
    for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode(65 + i); // A-Z
        const button = document.createElement('button');
        button.textContent = letter;
        button.classList.add('filter-button');
        button.addEventListener('click', () => {
            filterAndRenderGlossaryTerms(terms, '', letter);
            setActiveFilterButton(button);
        });
        alphabetFilterContainer.appendChild(button);
    }
}

function setActiveFilterButton(activeButton) {
    document.querySelectorAll('.filter-button').forEach(button => {
        button.classList.remove('active');
    });
    activeButton.classList.add('active');
}

function filterAndRenderGlossaryTerms(allTerms, searchTerm, filterLetter) {
    const container = document.getElementById('glossary-container');
    if (!container) return;

    let filteredTerms = allTerms;

    if (searchTerm) {
        filteredTerms = filteredTerms.filter(term => 
            term.term.toLowerCase().includes(searchTerm) ||
            term.definition.toLowerCase().includes(searchTerm) ||
            (term.category && term.category.toLowerCase().includes(searchTerm))
        );
    }

    if (filterLetter) {
        filteredTerms = filteredTerms.filter(term => 
            term.term.toLowerCase().startsWith(filterLetter.toLowerCase())
        );
    }

    if (filteredTerms.length === 0) {
        renderContent(container, `<p style="text-align: center;">${ERROR_MESSAGES.noResults}</p>`);
        return;
    }

    let html = '';
    filteredTerms.forEach(term => {
        html += renderGlossaryCard(term);
    });
    renderContent(container, html, initScrollAnimations);
}

// Add this function after loadGlossary
async function loadLogicGames() {
    const container = document.getElementById('logic-games-grid');
    
    function renderLogicGamesHTML(games) {
        let html = '';
        games.forEach(game => {
            html += renderLogicGameCard(game);
        });
        return html;
    }
    
    function afterRender() {
        const games = JSON.parse(container.dataset.games || '[]');
        setupLogicGameTagFilter(games);
        initScrollAnimations();
    }

    const games = await loadData('logic-games.json');
    if (games) {
        container.dataset.games = JSON.stringify(games);
        await loadAndRender('logic-games.json', container, renderLogicGamesHTML, 'juegos de lógica', afterRender);
    }
}

function renderLogicGameCard(game) {
    return `
        <div class="logic-game-card">
            ${game.image ? `<img src="${game.image}" alt="${game.title}" class="logic-game-image">` : ''}
            <div class="logic-game-content">
                <h3>${game.title}</h3>
                <p>${game.description || ''}</p>
                ${game.tags && game.tags.length > 0 ? `
                    <div class="logic-game-tags">
                        ${game.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
                <a href="${game.url}" target="_blank" class="cta-button">Jugar <span class="btn-icon">🎮</span></a>
            </div>
        </div>
    `;
}

// Add setupLogicGameTagFilter placeholder for now
function setupLogicGameTagFilter(games) {
    // Placeholder for future tag filtering logic
    console.log("Setting up logic game tag filter (placeholder). Games:", games);
}

// =============================================================================
// UTILIDADES
// =============================================================================

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.content-section, .nav-card, .badge-item, .about-card, .contact-card, .animate-on-scroll, .lab-module, .event-card, .feed-post, .glossary-card, .logic-game-card');
    
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

function initBackToTopButton() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'back-to-top-btn';
    backToTopBtn.innerHTML = '↑';
    backToTopBtn.setAttribute('aria-label', 'Volver arriba');
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
