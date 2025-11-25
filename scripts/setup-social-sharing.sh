#!/bin/bash

# =============================================================================
# Setup Script for Social Media Sharing with Lambda and API Gateway
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUCKET_NAME="tiburon-community-data-$(date +%s)"
LAMBDA_FUNCTION_NAME="og-renderer-lambda"
ROLE_NAME="LambdaSocialShareRole"
API_NAME="tiburon-social-share-api"
REGION="us-east-1"

echo -e "${BLUE}🦈 Configurando el sistema de compartir en redes sociales para Tiburón${NC}"
echo "=================================================="

# Step 1: Create S3 Bucket
echo -e "${YELLOW}📦 Paso 1: Creando bucket S3...${NC}"
aws s3 mb s3://$BUCKET_NAME --region $REGION
echo -e "${GREEN}✅ Bucket creado: $BUCKET_NAME${NC}"

# Step 2: Upload feed.json to S3
echo -e "${YELLOW}📤 Paso 2: Subiendo feed.json a S3...${NC}"
aws s3 cp public/assets/data/feed.json s3://$BUCKET_NAME/data/feed.json
aws s3api put-object-acl --bucket $BUCKET_NAME --key data/feed.json --acl public-read
echo -e "${GREEN}✅ feed.json subido y configurado como público${NC}"

# Step 3: Create IAM Role for Lambda
echo -e "${YELLOW}🔐 Paso 3: Creando rol IAM para Lambda...${NC}"

# Create trust policy
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create the role
aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document file://trust-policy.json

# Attach policies
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

# Clean up temp file
rm trust-policy.json

echo -e "${GREEN}✅ Rol IAM creado: $ROLE_NAME${NC}"

# Step 4: Update Lambda function with bucket name
echo -e "${YELLOW}⚙️ Paso 4: Actualizando función Lambda con el nombre del bucket...${NC}"
sed -i "s/TU_BUCKET_DE_S3_AQUI/$BUCKET_NAME/g" og-renderer-lambda.js
echo -e "${GREEN}✅ Función Lambda actualizada${NC}"

# Step 5: Create Lambda function
echo -e "${YELLOW}⚡ Paso 5: Creando función Lambda...${NC}"

# Zip the function
zip lambda-function.zip og-renderer-lambda.js

# Get account ID for role ARN
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME"

# Wait for role to be available
echo "Esperando que el rol esté disponible..."
sleep 10

# Create Lambda function
aws lambda create-function \
    --function-name $LAMBDA_FUNCTION_NAME \
    --runtime nodejs20.x \
    --role $ROLE_ARN \
    --handler og-renderer-lambda.handler \
    --zip-file fileb://lambda-function.zip \
    --region $REGION

echo -e "${GREEN}✅ Función Lambda creada: $LAMBDA_FUNCTION_NAME${NC}"

# Step 6: Create API Gateway
echo -e "${YELLOW}🌐 Paso 6: Creando API Gateway...${NC}"

# Create API
API_ID=$(aws apigatewayv2 create-api \
    --name $API_NAME \
    --protocol-type HTTP \
    --region $REGION \
    --query 'ApiId' \
    --output text)

# Get Lambda function ARN
LAMBDA_ARN=$(aws lambda get-function --function-name $LAMBDA_FUNCTION_NAME --region $REGION --query 'Configuration.FunctionArn' --output text)

# Create integration
INTEGRATION_ID=$(aws apigatewayv2 create-integration \
    --api-id $API_ID \
    --integration-type AWS_PROXY \
    --integration-uri $LAMBDA_ARN \
    --payload-format-version "2.0" \
    --region $REGION \
    --query 'IntegrationId' \
    --output text)

# Create route
aws apigatewayv2 create-route \
    --api-id $API_ID \
    --route-key "GET /share" \
    --target "integrations/$INTEGRATION_ID" \
    --region $REGION

# Create stage
aws apigatewayv2 create-stage \
    --api-id $API_ID \
    --stage-name '$default' \
    --auto-deploy \
    --region $REGION

# Add permission for API Gateway to invoke Lambda
aws lambda add-permission \
    --function-name $LAMBDA_FUNCTION_NAME \
    --statement-id apigateway-invoke \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/*" \
    --region $REGION

# Get API Gateway URL
API_URL="https://$API_ID.execute-api.$REGION.amazonaws.com"

echo -e "${GREEN}✅ API Gateway creado: $API_URL${NC}"

# Step 7: Update app.js with the correct URLs
echo -e "${YELLOW}📝 Paso 7: Actualizando app.js con las URLs correctas...${NC}"

# Update S3 URL in app.js
S3_URL="https://$BUCKET_NAME.s3.amazonaws.com/data/feed.json"
sed -i "s|https://TU_BUCKET_DE_S3_AQUI.s3.amazonaws.com/data/feed.json|$S3_URL|g" public/assets/js/app.js

# Update API Gateway URL in app.js
sed -i "s|https://TU_API_GATEWAY_URL_AQUI|$API_URL|g" public/assets/js/app.js

echo -e "${GREEN}✅ app.js actualizado con las URLs correctas${NC}"

# Clean up
rm lambda-function.zip

# Summary
echo ""
echo -e "${BLUE}🎉 ¡Configuración completada!${NC}"
echo "=================================================="
echo -e "${GREEN}S3 Bucket:${NC} $BUCKET_NAME"
echo -e "${GREEN}S3 Feed URL:${NC} $S3_URL"
echo -e "${GREEN}Lambda Function:${NC} $LAMBDA_FUNCTION_NAME"
echo -e "${GREEN}API Gateway URL:${NC} $API_URL"
echo ""
echo -e "${YELLOW}📋 Próximos pasos:${NC}"
echo "1. Sube una imagen og-tiburon.jpg a tu sitio web para las vistas previas"
echo "2. Prueba compartir un post en Facebook o LinkedIn"
echo "3. Para actualizar el feed, sube el nuevo feed.json a S3:"
echo "   aws s3 cp public/assets/data/feed.json s3://$BUCKET_NAME/data/feed.json"
echo ""
echo -e "${GREEN}✨ ¡El sistema de compartir en redes sociales está listo!${NC}"
