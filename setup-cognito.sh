#!/bin/bash

# Script para configurar AWS Cognito User Pool para Proyecto Tiburón
# Asegúrate de tener AWS CLI configurado con las credenciales correctas

echo "🚀 Configurando AWS Cognito User Pool para Proyecto Tiburón..."

# Variables
REGION="us-east-1"
USER_POOL_NAME="tiburon-user-pool"
CLIENT_NAME="tiburon-web-client"

# Crear User Pool
echo "📝 Creando User Pool..."
USER_POOL_ID=$(aws cognito-idp create-user-pool \
    --pool-name "$USER_POOL_NAME" \
    --region "$REGION" \
    --policies '{
        "PasswordPolicy": {
            "MinimumLength": 8,
            "RequireUppercase": true,
            "RequireLowercase": true,
            "RequireNumbers": true,
            "RequireSymbols": false
        }
    }' \
    --auto-verified-attributes email \
    --username-attributes email \
    --schema '[
        {
            "Name": "email",
            "AttributeDataType": "String",
            "Required": true,
            "Mutable": true
        },
        {
            "Name": "name",
            "AttributeDataType": "String",
            "Required": true,
            "Mutable": true
        },
        {
            "Name": "city",
            "AttributeDataType": "String",
            "Required": false,
            "Mutable": true
        },
        {
            "Name": "role",
            "AttributeDataType": "String",
            "Required": false,
            "Mutable": true
        }
    ]' \
    --query 'UserPool.Id' \
    --output text)

if [ $? -eq 0 ]; then
    echo "✅ User Pool creado exitosamente: $USER_POOL_ID"
else
    echo "❌ Error creando User Pool"
    exit 1
fi

# Crear User Pool Client
echo "📱 Creando User Pool Client..."
CLIENT_ID=$(aws cognito-idp create-user-pool-client \
    --user-pool-id "$USER_POOL_ID" \
    --client-name "$CLIENT_NAME" \
    --region "$REGION" \
    --no-generate-secret \
    --explicit-auth-flows ADMIN_NO_SRP_AUTH USER_PASSWORD_AUTH \
    --supported-identity-providers COGNITO \
    --query 'UserPoolClient.ClientId' \
    --output text)

if [ $? -eq 0 ]; then
    echo "✅ User Pool Client creado exitosamente: $CLIENT_ID"
else
    echo "❌ Error creando User Pool Client"
    exit 1
fi

# Crear Identity Pool
echo "🆔 Creando Identity Pool..."
IDENTITY_POOL_ID=$(aws cognito-identity create-identity-pool \
    --identity-pool-name "tiburon_identity_pool" \
    --region "$REGION" \
    --allow-unauthenticated-identities \
    --cognito-identity-providers ProviderName=cognito-idp.$REGION.amazonaws.com/$USER_POOL_ID,ClientId=$CLIENT_ID \
    --query 'IdentityPoolId' \
    --output text)

if [ $? -eq 0 ]; then
    echo "✅ Identity Pool creado exitosamente: $IDENTITY_POOL_ID"
else
    echo "❌ Error creando Identity Pool"
    exit 1
fi

# Actualizar archivo de configuración
echo "📄 Actualizando archivo de configuración..."
cat > public/assets/data/aws-config.json << EOF
{
  "region": "$REGION",
  "userPoolId": "$USER_POOL_ID",
  "clientId": "$CLIENT_ID",
  "identityPoolId": "$IDENTITY_POOL_ID",
  "note": "Configuración generada automáticamente - $(date)"
}
EOF

# Crear archivo .env para desarrollo
echo "🔧 Creando archivo .env..."
cat > .env << EOF
# AWS Cognito Configuration
AWS_REGION=$REGION
COGNITO_USER_POOL_ID=$USER_POOL_ID
COGNITO_CLIENT_ID=$CLIENT_ID
COGNITO_IDENTITY_POOL_ID=$IDENTITY_POOL_ID

# DynamoDB Configuration
DYNAMODB_USERS_TABLE=tiburon-users
DYNAMODB_EVENTS_TABLE=tiburon-events
DYNAMODB_FEED_TABLE=tiburon-feed
DYNAMODB_ANALYTICS_TABLE=tiburon-analytics

# Environment
NODE_ENV=development
EOF

echo ""
echo "🎉 ¡Configuración completada exitosamente!"
echo ""
echo "📋 Resumen de recursos creados:"
echo "   User Pool ID: $USER_POOL_ID"
echo "   Client ID: $CLIENT_ID"
echo "   Identity Pool ID: $IDENTITY_POOL_ID"
echo "   Región: $REGION"
echo ""
echo "📁 Archivos actualizados:"
echo "   - public/assets/data/aws-config.json"
echo "   - .env"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Agrega .env al .gitignore para mantener la seguridad"
echo "   - Configura las variables de entorno en AWS Amplify"
echo "   - El primer usuario registrado debe ser configurado como admin manualmente"
echo ""
echo "🚀 ¡Ya puedes probar el sistema de autenticación!"
