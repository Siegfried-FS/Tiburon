#!/bin/bash

# Deploy Credly Badges Lambda
# Este script despliega la función Lambda que obtiene badges de Credly

set -e

FUNCTION_NAME="credly-badges-lambda"
REGION="us-east-1"
RUNTIME="nodejs20.x"
HANDLER="credly-badges-lambda.handler"
ROLE_ARN="arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role" # Actualizar con tu ARN

echo "🚀 Desplegando Lambda: $FUNCTION_NAME"

# Crear directorio temporal
TEMP_DIR=$(mktemp -d)
cd backend/lambdas

# Copiar archivo Lambda
cp credly-badges-lambda.js $TEMP_DIR/

# Crear package.json si no existe
if [ ! -f "$TEMP_DIR/package.json" ]; then
    cat > $TEMP_DIR/package.json << EOF
{
  "name": "credly-badges-lambda",
  "version": "1.0.0",
  "type": "module",
  "description": "Fetch AWS badges from Credly API"
}
EOF
fi

# Crear ZIP
cd $TEMP_DIR
zip -r function.zip .

# Verificar si la función existe
if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION 2>/dev/null; then
    echo "📦 Actualizando función existente..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://function.zip \
        --region $REGION
else
    echo "📦 Creando nueva función..."
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime $RUNTIME \
        --role $ROLE_ARN \
        --handler $HANDLER \
        --zip-file fileb://function.zip \
        --timeout 30 \
        --memory-size 256 \
        --region $REGION \
        --description "Fetch AWS badges from Credly API"
fi

# Limpiar
rm -rf $TEMP_DIR

echo "✅ Lambda desplegada exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Crear API Gateway HTTP endpoint"
echo "2. Conectar Lambda con API Gateway"
echo "3. Actualizar LAMBDA_ENDPOINT en credly-loader.js"
echo ""
echo "Comando para crear API Gateway:"
echo "aws apigatewayv2 create-api --name credly-badges-api --protocol-type HTTP --target arn:aws:lambda:$REGION:YOUR_ACCOUNT_ID:function:$FUNCTION_NAME"
