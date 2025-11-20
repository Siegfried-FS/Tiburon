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
                reject(new Error('Email inválido'));
                return;
            }
            
            if (!this.validatePassword(password)) {
                reject(new Error('Contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'));
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

    // Validaciones de seguridad
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        // Al menos 8 caracteres, una mayúscula, una minúscula, un número
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    // Sanitizar entrada del usuario
    sanitizeInput(input) {
        return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                   .replace(/[<>]/g, '')
                   .trim();
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
