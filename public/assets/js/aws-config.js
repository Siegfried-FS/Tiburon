// AWS Configuration - Sin credenciales hardcodeadas
class AWSConfig {
    constructor() {
        this.config = null;
        this.isInitialized = false;
    }

    // Cargar configuración desde variables de entorno o archivo de configuración
    async initialize() {
        try {
            // En producción, estas variables vendrán de las variables de entorno de Amplify
            // En desarrollo, las cargaremos de un archivo de configuración
            const response = await fetch('/assets/data/aws-config.json');
            if (response.ok) {
                this.config = await response.json();
            } else {
                // Fallback a configuración por defecto (solo IDs públicos, no secretos)
                this.config = {
                    region: 'us-east-1',
                    userPoolId: process.env.COGNITO_USER_POOL_ID || '',
                    clientId: process.env.COGNITO_CLIENT_ID || '',
                    identityPoolId: process.env.COGNITO_IDENTITY_POOL_ID || ''
                };
            }
            
            this.isInitialized = true;
            return this.config;
        } catch (error) {
            console.error('Error loading AWS configuration:', error);
            throw new Error('Failed to initialize AWS configuration');
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
