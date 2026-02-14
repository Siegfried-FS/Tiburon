/**
 * Credly Badges Loader
 * Carga badges de AWS desde Lambda/Credly API
 */

const LAMBDA_ENDPOINT = 'https://yi3uyb20q6.execute-api.us-east-1.amazonaws.com';

async function loadCredlyBadges() {
    const container = document.getElementById('aws-badges-container');
    
    try {
        const response = await fetch(LAMBDA_ENDPOINT);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Error al cargar badges');
        }
        
        // Separar certificaciones oficiales de badges
        const officialCerts = data.badges.filter(b => b.isOfficial);
        const otherBadges = data.badges.filter(b => !b.isOfficial);
        
        let html = '<div class="cert-categories">';
        
        // Certificaciones Oficiales
        if (officialCerts.length > 0) {
            html += `
                <div class="cert-category">
                    <h3>🎓 Certificaciones Oficiales AWS</h3>
                    <div class="badge-grid">
            `;
            
            officialCerts.forEach(badge => {
                html += `
                    <div class="badge-item featured">
                        <a href="${badge.url}" target="_blank" rel="noopener">
                            <img loading="lazy" src="${badge.imageUrl}" alt="${badge.name}">
                        </a>
                        <p>${badge.name.replace('Amazon Web Services', 'AWS')}</p>
                        <span class="badge-status completed">✅ Certificado</span>
                    </div>
                `;
            });
            
            html += '</div></div>';
        }
        
        // Otros Badges de AWS
        if (otherBadges.length > 0) {
            html += `
                <div class="cert-category">
                    <h3>🏅 Badges y Especializaciones AWS</h3>
                    <div class="badge-grid compact">
            `;
            
            otherBadges.forEach(badge => {
                const shortName = badge.name
                    .replace('Amazon Web Services', '')
                    .replace('AWS', '')
                    .replace('Knowledge Badge Assessment:', '')
                    .replace('Educate Getting Started with', '')
                    .trim();
                
                html += `
                    <div class="badge-item">
                        <a href="${badge.url}" target="_blank" rel="noopener">
                            <img loading="lazy" src="${badge.imageUrl}" alt="${badge.name}">
                        </a>
                        <p>${shortName}</p>
                    </div>
                `;
            });
            
            html += '</div></div>';
        }
        
        html += '</div>';
        
        // Actualizar contenedor
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading Credly badges:', error);
        
        // Fallback: Mostrar mensaje de error con enlace a Credly
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p style="color: var(--text-secondary); margin-bottom: 20px;">
                    ⚠️ No se pudieron cargar las certificaciones automáticamente
                </p>
                <a href="https://www.credly.com/users/roberto-flores.0f207daf/badges" 
                   target="_blank" 
                   class="cta-button">
                    Ver Certificaciones en Credly →
                </a>
            </div>
        `;
    }
}

// Cargar badges cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCredlyBadges);
} else {
    loadCredlyBadges();
}
