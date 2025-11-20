// AWS Configuration - Sin credenciales hardcodeadas
class AWSConfig {
    constructor() {
        this.config = null;
        this.isInitialized = false;
    }

    // Cargar configuración desde archivo JSON
    async initialize() {
        try {
            // Cargar desde archivo de configuración
            const response = await fetch('./assets/data/aws-config.json');
            if (response.ok) {
                this.config = await response.json();
            } else {
                // Configuración hardcodeada como fallback (solo IDs públicos)
                this.config = {
                    region: 'us-east-1',
                    userPoolId: 'us-east-1_Cg5yUjR6L',
                    clientId: '1gsjecdf86pgdgvvis7l30hha1',
                    identityPoolId: 'us-east-1:a6680bc2-cd1a-47d8-b8cc-71c19f600abd'
                };
            }
            
            this.isInitialized = true;
            return this.config;
        } catch (error) {
            console.error('Error loading AWS configuration:', error);
            // Usar configuración hardcodeada como fallback
            this.config = {
                region: 'us-east-1',
                userPoolId: 'us-east-1_Cg5yUjR6L',
                clientId: '1gsjecdf86pgdgvvis7l30hha1',
                identityPoolId: 'us-east-1:a6680bc2-cd1a-47d8-b8cc-71c19f600abd'
            };
            this.isInitialized = true;
            return this.config;
        }
    }

    getConfig() {
        if (!this.isInitialized) {
            throw new Error('AWS Config not initialized. Call initialize() first.');
        }
        return this.config;
    }

    // Validar que la configuración esté completa
    validateConfig() {
        const config = this.getConfig();
        const required = ['region', 'userPoolId', 'clientId'];
        
        for (const field of required) {
            if (!config[field]) {
                throw new Error(`Missing required AWS configuration: ${field}`);
            }
        }
        
        return true;
    }
}

// Instancia singleton
const awsConfig = new AWSConfig();

// Exportar para uso en otros módulos
window.AWSConfig = awsConfig;
