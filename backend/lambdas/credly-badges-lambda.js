/**
 * Lambda: Credly Badges Fetcher
 * Obtiene badges de AWS desde Credly API y los filtra
 */

export const handler = async (event) => {
    const CREDLY_USER = 'roberto-flores.0f207daf';
    const CREDLY_API = `https://www.credly.com/users/${CREDLY_USER}/badges.json`;
    
    try {
        // Fetch badges desde Credly
        const response = await fetch(CREDLY_API);
        
        if (!response.ok) {
            throw new Error(`Credly API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Filtrar solo badges de AWS
        const awsBadges = data.data
            .filter(badge => {
                const name = badge.badge_template?.name?.toLowerCase() || '';
                const issuer = badge.badge_template?.issuer?.name?.toLowerCase() || '';
                return issuer.includes('amazon') || issuer.includes('aws') || name.includes('aws');
            })
            .map(badge => ({
                id: badge.id,
                name: badge.badge_template?.name || 'Unknown',
                description: badge.badge_template?.description || '',
                imageUrl: badge.badge_template?.image_url || '',
                issuedDate: badge.issued_at,
                expiresAt: badge.expires_at,
                url: badge.vanity_url || `https://www.credly.com/badges/${badge.id}`,
                issuer: badge.badge_template?.issuer?.name || 'AWS',
                // Detectar si es certificación oficial
                isOfficial: badge.badge_template?.name?.toLowerCase().includes('certified') || false
            }))
            .sort((a, b) => {
                // Certificaciones oficiales primero
                if (a.isOfficial && !b.isOfficial) return -1;
                if (!a.isOfficial && b.isOfficial) return 1;
                // Luego por fecha (más reciente primero)
                return new Date(b.issuedDate) - new Date(a.issuedDate);
            });
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=3600' // Cache 1 hora
            },
            body: JSON.stringify({
                success: true,
                count: awsBadges.length,
                badges: awsBadges,
                lastUpdated: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error('Error fetching Credly badges:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: error.message,
                fallback: true
            })
        };
    }
};
