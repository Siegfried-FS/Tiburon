#!/bin/bash

# Script para generar índice de PDFs automáticamente
echo "Generando índice de PDFs..."

# Crear archivo JSON con todos los PDFs
cat > assets/js/pdf-index.js << 'EOF'
// Índice de PDFs generado automáticamente
const pdfIndex = {
EOF

# Buscar PDFs en cada carpeta
for folder in restart-labs/*/; do
    if [ -d "$folder" ]; then
        folder_name=$(basename "$folder")
        echo "    '$folder_name': [" >> assets/js/pdf-index.js
        
        # Buscar PDFs en la carpeta
        find "$folder" -name "*.pdf" -type f | while read pdf; do
            filename=$(basename "$pdf")
            # Limpiar nombre para mostrar
            display_name=$(echo "$filename" | sed 's/\.pdf$//' | sed 's/_/ /g' | sed 's/-/ /g')
            echo "        { name: '$display_name', file: '$filename' }," >> assets/js/pdf-index.js
        done
        
        echo "    ]," >> assets/js/pdf-index.js
    fi
done

# Cerrar el objeto JavaScript
cat >> assets/js/pdf-index.js << 'EOF'
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
EOF

echo "✅ Índice generado en assets/js/pdf-index.js"
