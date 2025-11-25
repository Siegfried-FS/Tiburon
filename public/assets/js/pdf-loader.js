class PDFAutoLoader {
    constructor() {
        this.pdfs = [];
        this.currentIndex = 0;
        this.isLoading = false;
        this.container = null;
        this.observer = null;
    }

    init(containerSelector, pdfPaths) {
        this.container = document.querySelector(containerSelector);
        this.pdfs = pdfPaths;
        this.setupContainer();
        this.setupIntersectionObserver();
        this.loadInitialPDFs();
    }

    setupContainer() {
        this.container.innerHTML = `
            <div class="pdf-scroll-container">
                <div class="pdf-list" id="pdf-list"></div>
                <div class="loading-indicator" id="loading-indicator" style="display: none;">
                    <div class="spinner"></div>
                    <p>Cargando PDF...</p>
                </div>
            </div>
        `;
    }

    setupIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isLoading) {
                    this.loadNextPDF();
                }
            });
        }, { threshold: 0.1 });
    }

    async loadInitialPDFs() {
        const pdfList = document.getElementById('pdf-list');
        
        // Cargar los primeros 2 PDFs
        for (let i = 0; i < Math.min(2, this.pdfs.length); i++) {
            await this.createPDFPreview(this.pdfs[i], i);
        }

        // Agregar sentinel para lazy loading
        if (this.pdfs.length > 2) {
            const sentinel = document.createElement('div');
            sentinel.className = 'pdf-sentinel';
            sentinel.style.height = '1px';
            pdfList.appendChild(sentinel);
            this.observer.observe(sentinel);
        }
    }

    async loadNextPDF() {
        if (this.currentIndex >= this.pdfs.length - 1 || this.isLoading) return;

        this.isLoading = true;
        this.showLoading();

        this.currentIndex++;
        await this.createPDFPreview(this.pdfs[this.currentIndex], this.currentIndex);

        this.hideLoading();
        this.isLoading = false;

        // Mover sentinel si hay más PDFs
        if (this.currentIndex < this.pdfs.length - 1) {
            const pdfList = document.getElementById('pdf-list');
            const sentinel = pdfList.querySelector('.pdf-sentinel');
            pdfList.appendChild(sentinel);
        }
    }

    async createPDFPreview(pdfPath, index) {
        const pdfList = document.getElementById('pdf-list');
        
        const pdfCard = document.createElement('div');
        pdfCard.className = 'pdf-card';
        pdfCard.innerHTML = `
            <div class="pdf-header">
                <h3>📄 ${this.extractFileName(pdfPath)}</h3>
                <div class="pdf-actions">
                    <button class="btn-primary" data-action="open-pdf" data-pdf-path="${pdfPath}">
                        📖 Abrir PDF
                    </button>
                    <button class="btn-secondary" data-action="download-pdf" data-pdf-path="${pdfPath}">
                        💾 Descargar
                    </button>
                </div>
            </div>
            <div class="pdf-preview" id="pdf-preview-${index}">
                <div class="pdf-loading">Generando preview...</div>
            </div>
        `;

        pdfList.appendChild(pdfCard);
        
        // Attach event listeners to the buttons
        pdfCard.querySelector('[data-action="open-pdf"]').addEventListener('click', () => {
            window.open(pdfPath, '_blank');
        });
        pdfCard.querySelector('[data-action="download-pdf"]').addEventListener('click', () => {
            this.downloadPDF(pdfPath);
        });

        // Generar preview del PDF
        setTimeout(() => this.generatePDFPreview(pdfPath, index), 100);
    }

    async generatePDFPreview(pdfPath, index) {
        const previewContainer = document.getElementById(`pdf-preview-${index}`);
        
        try {
            // Simulación de preview (en producción usarías PDF.js)
            previewContainer.innerHTML = `
                <div class="pdf-thumbnail">
                    <div class="pdf-page-preview">
                        <div class="pdf-content-simulation">
                            <div class="pdf-header-sim"></div>
                            <div class="pdf-text-lines">
                                <div class="text-line"></div>
                                <div class="text-line"></div>
                                <div class="text-line short"></div>
                                <div class="text-line"></div>
                                <div class="text-line short"></div>
                            </div>
                        </div>
                    </div>
                    <div class="pdf-info">
                        <span class="page-count">📄 Múltiples páginas</span>
                        <span class="file-size">${await this.getFileSize(pdfPath)}</span>
                    </div>
                </div>
            `;
        } catch (error) {
            previewContainer.innerHTML = `
                <div class="pdf-error">
                    <p>❌ Error al cargar preview</p>
                    <small>Haz clic en "Abrir PDF" para ver el contenido</small>
                </div>
            `;
        }
    }

    extractFileName(path) {
        return path.split('/').pop().replace('.pdf', '');
    }

    async getFileSize(path) {
        // Simulación del tamaño del archivo
        return "~2.5 MB";
    }

    showLoading() {
        document.getElementById('loading-indicator').style.display = 'block';
    }

    hideLoading() {
        document.getElementById('loading-indicator').style.display = 'none';
    }

    downloadPDF(pdfPath) {
        const link = document.createElement('a');
        link.href = pdfPath;
        link.download = this.extractFileName(pdfPath) + '.pdf';
        link.click();
    }
}

// CSS para el componente
const pdfLoaderStyles = `
.pdf-scroll-container {
    max-width: 800px;
    margin: 0 auto;
}

.pdf-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    margin-bottom: 20px;
    overflow: hidden;
    box-shadow: var(--shadow);
    transition: all 0.3s ease;
}

.pdf-card:hover {
    background: var(--bg-card-hover);
    transform: translateY(-2px);
}

.pdf-header {
    padding: 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
}

.pdf-header h3 {
    color: var(--text-primary);
    margin: 0;
    font-size: 1.2em;
}

.pdf-actions {
    display: flex;
    gap: 10px;
}

.btn-primary, .btn-secondary {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9em;
    transition: all 0.3s ease;
}

.btn-primary {
    background: var(--gradient-accent);
    color: white;
}

.btn-secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.pdf-preview {
    padding: 20px;
}

.pdf-thumbnail {
    display: flex;
    gap: 20px;
    align-items: flex-start;
}

.pdf-page-preview {
    width: 120px;
    height: 160px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.pdf-content-simulation {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.pdf-header-sim {
    height: 20px;
    background: linear-gradient(90deg, #333 0%, #666 100%);
    border-radius: 2px;
}

.text-line {
    height: 4px;
    background: #ccc;
    border-radius: 2px;
}

.text-line.short {
    width: 70%;
}

.pdf-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.page-count, .file-size {
    color: var(--text-muted);
    font-size: 0.9em;
}

.loading-indicator {
    text-align: center;
    padding: 40px;
    color: var(--text-muted);
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border-color);
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 15px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.pdf-error {
    text-align: center;
    padding: 40px;
    color: var(--text-muted);
}

@media (max-width: 768px) {
    .pdf-header {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .pdf-thumbnail {
        flex-direction: column;
        align-items: center;
    }
    
    .pdf-actions {
        width: 100%;
        justify-content: center;
    }
}
`;

// Inyectar estilos
const styleSheet = document.createElement('style');
styleSheet.textContent = pdfLoaderStyles;
document.head.appendChild(styleSheet);
