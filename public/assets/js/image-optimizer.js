// Image Optimization with WebP support
class ImageOptimizer {
    constructor() {
        this.supportsWebP = null;
        this.init();
    }

    async init() {
        this.supportsWebP = await this.checkWebPSupport();
    }

    checkWebPSupport() {
        return new Promise(resolve => {
            const webP = new Image();
            webP.onload = webP.onerror = () => resolve(webP.height === 2);
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    optimizeImageUrl(originalUrl) {
        if (!originalUrl) return originalUrl;
        
        // If WebP is supported and it's a JPEG/PNG, try WebP version
        if (this.supportsWebP && (originalUrl.includes('.jpg') || originalUrl.includes('.png'))) {
            const webpUrl = originalUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            return webpUrl;
        }
        
        return originalUrl;
    }

    createOptimizedImage(src, alt = '', className = '') {
        const img = document.createElement('img');
        
        // Add loading attribute for native lazy loading
        img.loading = 'lazy';
        img.alt = alt;
        if (className) img.className = className;
        
        // Use optimized URL
        const optimizedSrc = this.optimizeImageUrl(src);
        
        // Use data-src for intersection observer
        img.setAttribute('data-src', optimizedSrc);
        
        // Add fallback for WebP
        if (this.supportsWebP && optimizedSrc !== src) {
            img.onerror = () => {
                img.src = src; // Fallback to original
            };
        }
        
        return img;
    }
}

// Global instance
window.imageOptimizer = new ImageOptimizer();
