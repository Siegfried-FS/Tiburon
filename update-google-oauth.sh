#!/bin/bash

echo "🔗 Actualizando Google OAuth en Cognito..."

# Solicitar credenciales al usuario
read -p "Ingresa tu Google Client ID: " GOOGLE_CLIENT_ID
read -p "Ingresa tu Google Client Secret: " GOOGLE_CLIENT_SECRET

# Actualizar proveedor de Google
aws cognito-idp update-identity-provider \
    --user-pool-id us-east-1_Cg5yUjR6L \
    --provider-name Google \
    --provider-details client_id="$GOOGLE_CLIENT_ID",client_secret="$GOOGLE_CLIENT_SECRET",authorize_scopes="email profile openid" \
    --region us-east-1

if [ $? -eq 0 ]; then
    echo "✅ Google OAuth configurado exitosamente!"
    echo ""
    echo "🚀 Ahora puedes probar el login con Google en:"
    echo "   http://localhost:8000"
else
    echo "❌ Error configurando Google OAuth"
fi
