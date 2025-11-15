// Índice de PDFs generado automáticamente
const pdfIndex = {
    'bases-datos': [
        { name: 'AWS Well Architected Framework', file: 'AWS_Well-Architected_Framework.pdf' },
    ],
    'conexion': [
    ],
    'fundamentos-nube': [
        { name: 'O'Reilly Introduction to Cloud Databases eBook FINAL ESXL', file: 'O'Reilly-Introduction-to-Cloud-Databases-eBook-FINAL-ESXL.pdf' },
    ],
    'jumpstart-aws': [
    ],
    'jumpstart-aws-advanced': [
    ],
    'linux': [
    ],
    'python': [
    ],
    'seguridad': [
    ],
};

// Función para cargar PDFs dinámicamente
function loadPDFsFromIndex() {
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

    Object.keys(pdfIndex).forEach(module => {
        const container = document.getElementById(labModules[module]);
        if (container && pdfIndex[module].length > 0) {
            container.innerHTML = '';
            
            pdfIndex[module].forEach(pdf => {
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

// Auto-ejecutar cuando se carga la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPDFsFromIndex);
} else {
    loadPDFsFromIndex();
}
