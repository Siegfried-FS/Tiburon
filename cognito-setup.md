# Configuración de AWS Cognito para Autenticación con Google

## Pasos para configurar AWS Cognito

### 1. Crear User Pool en AWS Cognito

1. Ve a la consola de AWS Cognito
2. Crea un nuevo User Pool
3. Configura los siguientes ajustes:
   - **Sign-in options**: Email
   - **Password policy**: Según tus preferencias
   - **MFA**: Opcional
   - **User account recovery**: Email

### 2. Configurar Google como Identity Provider

1. En tu User Pool, ve a **Sign-in experience** > **Federated identity provider sign-in**
2. Agrega **Google** como identity provider
3. Necesitarás:
   - **Google Client ID**: Obtenido de Google Cloud Console
   - **Google Client Secret**: Obtenido de Google Cloud Console
   - **Authorized scopes**: `profile email openid`

### 3. Configurar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google+ API**
4. Ve a **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
5. Configura:
   - **Application type**: Web application
   - **Authorized JavaScript origins**: `https://tu-dominio.com`
   - **Authorized redirect URIs**: 
     - `https://your-domain.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
     - `https://tu-dominio.com` (tu sitio web)

### 4. Configurar App Client en Cognito

1. En tu User Pool, ve a **App integration** > **App clients**
2. Crea un nuevo App client:
   - **App type**: Public client
   - **App client name**: tiburon-web-client
   - **Authentication flows**: Allow all
3. En **Hosted UI**:
   - **Allowed callback URLs**: `https://tu-dominio.com`
   - **Allowed sign-out URLs**: `https://tu-dominio.com`
   - **Identity providers**: Google
   - **OAuth 2.0 grant types**: Authorization code grant
   - **OpenID Connect scopes**: email, openid, profile

### 5. Actualizar configuración en auth.js

Reemplaza los valores en `assets/js/auth.js`:

```javascript
const cognitoConfig = {
    region: 'us-east-1', // Tu región de AWS
    userPoolId: 'us-east-1_XXXXXXXXX', // Tu User Pool ID
    userPoolWebClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX', // Tu App Client ID
    oauth: {
        domain: 'your-domain.auth.us-east-1.amazoncognito.com', // Tu dominio de Cognito
        scope: ['email', 'openid', 'profile'],
        redirectSignIn: 'https://tu-dominio.com', // Tu URL de producción
        redirectSignOut: 'https://tu-dominio.com',
        responseType: 'code'
    }
};
```

### 6. Configurar dominio personalizado (Opcional)

1. En Cognito, ve a **App integration** > **Domain**
2. Configura un dominio personalizado o usa el dominio de Amazon Cognito

## Comandos AWS CLI para automatizar la configuración

```bash
# Crear User Pool
aws cognito-idp create-user-pool \
    --pool-name "tiburon-user-pool" \
    --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}" \
    --auto-verified-attributes email \
    --region us-east-1

# Crear App Client
aws cognito-idp create-user-pool-client \
    --user-pool-id us-east-1_XXXXXXXXX \
    --client-name "tiburon-web-client" \
    --generate-secret false \
    --supported-identity-providers Google \
    --callback-urls "https://tu-dominio.com" \
    --logout-urls "https://tu-dominio.com" \
    --allowed-o-auth-flows "code" \
    --allowed-o-auth-scopes "email" "openid" "profile" \
    --allowed-o-auth-flows-user-pool-client \
    --region us-east-1
```

## Notas importantes

- Asegúrate de que las URLs de callback coincidan exactamente
- El dominio de Cognito debe estar configurado antes de usar OAuth
- Para desarrollo local, puedes usar `http://localhost:8000` en las URLs de callback
- Los tokens se almacenan en localStorage del navegador
- Considera implementar refresh token logic para sesiones más largas

## Testing

Para probar localmente:
1. Actualiza las URLs de callback en Cognito para incluir `http://localhost:8000`
2. Ejecuta el servidor local: `cd public && python3 -m http.server`
3. Visita `http://localhost:8000` y prueba el login
