// Módulo de Autenticación con AWS Cognito
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userPool = null;
        this.isInitialized = false;
    }

    // Inicializar Cognito con configuración segura
    async initialize() {
        try {
            // Cargar configuración AWS
            await window.AWSConfig.initialize();
            const config = window.AWSConfig.getConfig();
            window.AWSConfig.validateConfig();

            // Configurar AWS SDK
            AWS.config.region = config.region;
            
            // Configurar User Pool
            const poolData = {
                UserPoolId: config.userPoolId,
                ClientId: config.clientId
            };
            
            this.userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
            this.isInitialized = true;
            
            // Verificar si hay una sesión activa
            await this.checkCurrentSession();
            
            return true;
        } catch (error) {
            console.error('Error initializing auth:', error);
            throw error;
        }
    }

    // Registrar nuevo usuario
    async register(email, password, name, additionalData = {}) {
        if (!this.isInitialized) {
            throw new Error('Auth not initialized');
        }

        return new Promise((resolve, reject) => {
            // Validar entrada
            if (!this.validateEmail(email)) {
                reject(new Error('Email inválido o demasiado largo'));
                return;
            }
            
            if (!this.validatePassword(password)) {
                reject(new Error('Contraseña debe tener mínimo 12 caracteres, incluir mayúscula, minúscula, número y símbolo especial. No usar patrones comunes.'));
                return;
            }

            // Validar y sanitizar todos los inputs
            const sanitizedName = this.sanitizeInput(name);
            if (!this.validateInput(name) || sanitizedName !== name) {
                reject(new Error('Nombre contiene caracteres no permitidos'));
                return;
            }

            // Validar y sanitizar campos adicionales
            if (additionalData.city && (!this.validateInput(additionalData.city) || 
                this.sanitizeInput(additionalData.city) !== additionalData.city)) {
                reject(new Error('Ciudad contiene caracteres no permitidos'));
                return;
            }

            if (additionalData.age && (additionalData.age < 13 || additionalData.age > 120)) {
                reject(new Error('Edad debe estar entre 13 y 120 años'));
                return;
            }

            const attributeList = [
                new AmazonCognitoIdentity.CognitoUserAttribute({
                    Name: 'email',
                    Value: email
                }),
                new AmazonCognitoIdentity.CognitoUserAttribute({
                    Name: 'name',
                    Value: this.sanitizeInput(name)
                })
            ];

            // Agregar campos adicionales como custom attributes
            if (additionalData.age) {
                attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({
                    Name: 'custom:age',
                    Value: additionalData.age.toString()
                }));
            }

            if (additionalData.city) {
                attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({
                    Name: 'custom:city',
                    Value: this.sanitizeInput(additionalData.city)
                }));
            }

            if (additionalData.country) {
                attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({
                    Name: 'custom:country',
                    Value: additionalData.country
                }));
            }

            if (additionalData.education) {
                attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({
                    Name: 'custom:education',
                    Value: additionalData.education
                }));
            }

            if (additionalData.profession) {
                attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({
                    Name: 'custom:profession',
                    Value: additionalData.profession
                }));
            }

            if (additionalData.experience) {
                attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({
                    Name: 'custom:experience',
                    Value: additionalData.experience
                }));
            }

            if (additionalData.newsletter !== undefined) {
                attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({
                    Name: 'custom:newsletter',
                    Value: additionalData.newsletter.toString()
                }));
            }

            this.userPool.signUp(email, password, attributeList, null, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({
                    user: result.user,
                    userConfirmed: result.userConfirmed
                });
            });
        });
    }

    // Login de usuario
    async login(email, password) {
        if (!this.isInitialized) {
            throw new Error('Auth not initialized');
        }

        return new Promise((resolve, reject) => {
            const authenticationData = {
                Username: email,
                Password: password,
            };
            
            const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
            const userData = {
                Username: email,
                Pool: this.userPool
            };
            
            const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
            
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: (result) => {
                    this.currentUser = cognitoUser;
                    resolve({
                        accessToken: result.getAccessToken().getJwtToken(),
                        idToken: result.getIdToken().getJwtToken(),
                        refreshToken: result.getRefreshToken().getToken()
                    });
                },
                onFailure: (err) => {
                    reject(err);
                },
                newPasswordRequired: (userAttributes, requiredAttributes) => {
                    reject(new Error('New password required'));
                }
            });
        });
    }

    // Logout
    async logout() {
        if (this.currentUser) {
            this.currentUser.signOut();
            this.currentUser = null;
        }
    }

    // Verificar sesión actual
    async checkCurrentSession() {
        return new Promise((resolve) => {
            const cognitoUser = this.userPool.getCurrentUser();
            
            if (cognitoUser != null) {
                cognitoUser.getSession((err, session) => {
                    if (err) {
                        resolve(null);
                        return;
                    }
                    
                    if (session.isValid()) {
                        this.currentUser = cognitoUser;
                        resolve(session);
                    } else {
                        resolve(null);
                    }
                });
            } else {
                resolve(null);
            }
        });
    }

    // Obtener información del usuario actual
    async getCurrentUserInfo() {
        if (!this.currentUser) {
            return null;
        }

        return new Promise((resolve, reject) => {
            this.currentUser.getUserAttributes((err, attributes) => {
                if (err) {
                    reject(err);
                    return;
                }

                const userInfo = {};
                attributes.forEach(attr => {
                    userInfo[attr.getName()] = attr.getValue();
                });
                
                resolve(userInfo);
            });
        });
    }

    // Validaciones de seguridad mejoradas
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && email.length <= 254;
    }

    validatePassword(password) {
        // Validación robusta: mínimo 12 caracteres, mayúscula, minúscula, número, símbolo
        const minLength = 12;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
        
        // Verificar que no contenga patrones comunes inseguros
        const commonPatterns = [
            /123456/, /password/, /qwerty/, /admin/, /letmein/,
            /welcome/, /monkey/, /dragon/, /master/, /shadow/
        ];
        
        const hasCommonPattern = commonPatterns.some(pattern => 
            pattern.test(password.toLowerCase())
        );
        
        // Verificar que no sea solo caracteres repetidos
        const isRepeated = /^(.)\1+$/.test(password);
        
        return password.length >= minLength && 
               hasUpperCase && 
               hasLowerCase && 
               hasNumbers && 
               hasSpecialChar && 
               !hasCommonPattern && 
               !isRepeated;
    }

    // Sanitizar entrada del usuario (prevenir XSS e inyecciones)
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        
        return input
            // Remover scripts maliciosos
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            // Remover eventos JavaScript
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
            // Remover tags HTML peligrosos
            .replace(/<(iframe|object|embed|form|input|meta|link)[^>]*>/gi, '')
            // Escapar caracteres especiales HTML
            .replace(/[<>'"&]/g, function(match) {
                const escapeMap = {
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#x27;',
                    '&': '&amp;'
                };
                return escapeMap[match];
            })
            // Limitar longitud
            .substring(0, 255)
            .trim();
    }

    // Validar entrada contra inyección SQL (aunque Cognito no usa SQL)
    validateInput(input) {
        if (typeof input !== 'string') return false;
        
        // Patrones sospechosos
        const suspiciousPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
            /(script|javascript|vbscript|onload|onerror|onclick)/i,
            /[<>{}]/,
            /\$\{.*\}/,  // Template literals
            /eval\s*\(/i,
            /function\s*\(/i
        ];
        
        return !suspiciousPatterns.some(pattern => pattern.test(input));
    }

    // Generar contraseña segura sugerida
    generateSecurePassword(length = 16) {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        let password = '';
        
        // Asegurar al menos uno de cada tipo
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];
        
        // Completar con caracteres aleatorios
        const allChars = uppercase + lowercase + numbers + symbols;
        for (let i = password.length; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        
        // Mezclar caracteres
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    // Verificar si el usuario está autenticado
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Obtener rol del usuario (desde custom attributes)
    async getUserRole() {
        try {
            const userInfo = await this.getCurrentUserInfo();
            return userInfo['custom:role'] || 'member';
        } catch (error) {
            return 'member';
        }
    }
}

// Instancia singleton
const authManager = new AuthManager();

// Exportar para uso global
window.AuthManager = authManager;
