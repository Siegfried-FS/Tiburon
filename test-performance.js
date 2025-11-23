// Performance Test Suite
const puppeteer = require('puppeteer');

class PerformanceTest {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async init() {
        this.browser = await puppeteer.launch({ headless: true });
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1200, height: 800 });
    }

    async testPageLoad(url) {
        const start = Date.now();
        await this.page.goto(url, { waitUntil: 'networkidle0' });
        const loadTime = Date.now() - start;
        
        const metrics = await this.page.metrics();
        return {
            loadTime,
            jsHeapUsedSize: metrics.JSHeapUsedSize,
            jsHeapTotalSize: metrics.JSHeapTotalSize,
            nodes: metrics.Nodes
        };
    }

    async testServiceWorker(url) {
        await this.page.goto(url);
        
        // Wait for service worker registration
        await this.page.waitForFunction(() => 
            navigator.serviceWorker.controller !== null, 
            { timeout: 5000 }
        );
        
        const swRegistered = await this.page.evaluate(() => 
            navigator.serviceWorker.controller !== null
        );
        
        return { serviceWorkerActive: swRegistered };
    }

    async testLazyLoading(url) {
        await this.page.goto(url);
        
        // Count images with data-src (lazy)
        const lazyImages = await this.page.$$eval('img[data-src]', imgs => imgs.length);
        
        // Scroll to trigger lazy loading
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await this.page.waitForTimeout(1000);
        
        // Count loaded images
        const loadedImages = await this.page.$$eval('img.loaded', imgs => imgs.length);
        
        return { lazyImages, loadedImages };
    }

    async runAllTests(baseUrl) {
        console.log('🧪 Running Performance Tests...\n');
        
        // Test 1: Initial page load
        console.log('📊 Test 1: Page Load Performance');
        const loadMetrics = await this.testPageLoad(`${baseUrl}/feed.html`);
        console.log(`   Load Time: ${loadMetrics.loadTime}ms`);
        console.log(`   JS Heap: ${(loadMetrics.jsHeapUsedSize / 1024 / 1024).toFixed(2)}MB`);
        console.log(`   DOM Nodes: ${loadMetrics.nodes}\n`);
        
        // Test 2: Service Worker
        console.log('🔧 Test 2: Service Worker Registration');
        const swTest = await this.testServiceWorker(`${baseUrl}/feed.html`);
        console.log(`   Service Worker Active: ${swTest.serviceWorkerActive ? '✅' : '❌'}\n`);
        
        // Test 3: Lazy Loading
        console.log('🖼️ Test 3: Lazy Loading');
        const lazyTest = await this.testLazyLoading(`${baseUrl}/feed.html`);
        console.log(`   Lazy Images: ${lazyTest.lazyImages}`);
        console.log(`   Loaded Images: ${lazyTest.loadedImages}\n`);
        
        // Performance Score
        const score = this.calculateScore(loadMetrics, swTest, lazyTest);
        console.log(`🎯 Performance Score: ${score}/100`);
        
        return { loadMetrics, swTest, lazyTest, score };
    }

    calculateScore(load, sw, lazy) {
        let score = 100;
        
        // Deduct points for slow loading
        if (load.loadTime > 2000) score -= 20;
        else if (load.loadTime > 1000) score -= 10;
        
        // Deduct points if service worker not working
        if (!sw.serviceWorkerActive) score -= 30;
        
        // Deduct points if lazy loading not working
        if (lazy.lazyImages === 0) score -= 20;
        
        return Math.max(0, score);
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    (async () => {
        const test = new PerformanceTest();
        await test.init();
        
        try {
            await test.runAllTests('http://localhost:8000');
        } catch (error) {
            console.error('❌ Test failed:', error.message);
        } finally {
            await test.close();
        }
    })();
}

module.exports = PerformanceTest;
