#!/bin/bash

# =============================================================================
# Cleanup Script for Social Media Sharing Infrastructure
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Limpiando infraestructura de compartir en redes sociales...${NC}"
echo "=================================================="

# Configuration
LAMBDA_FUNCTION_NAME="og-renderer-lambda"
ROLE_NAME="LambdaSocialShareRole"
API_NAME="tiburon-social-share-api"
REGION="us-east-1"

# Step 1: Delete API Gateway
echo -e "${YELLOW}🌐 Paso 1: Eliminando API Gateway...${NC}"
API_ID=$(aws apigatewayv2 get-apis --region $REGION --query "Items[?Name=='$API_NAME'].ApiId" --output text 2>/dev/null || echo "")

if [ -n "$API_ID" ] && [ "$API_ID" != "None" ]; then
    aws apigatewayv2 delete-api --api-id $API_ID --region $REGION
    echo -e "${GREEN}✅ API Gateway eliminado: $API_ID${NC}"
else
    echo -e "${YELLOW}⚠️ API Gateway no encontrado o ya eliminado${NC}"
fi

# Step 2: Delete Lambda Function
echo -e "${YELLOW}⚡ Paso 2: Eliminando función Lambda...${NC}"
if aws lambda get-function --function-name $LAMBDA_FUNCTION_NAME --region $REGION >/dev/null 2>&1; then
    aws lambda delete-function --function-name $LAMBDA_FUNCTION_NAME --region $REGION
    echo -e "${GREEN}✅ Función Lambda eliminada: $LAMBDA_FUNCTION_NAME${NC}"
else
    echo -e "${YELLOW}⚠️ Función Lambda no encontrada o ya eliminada${NC}"
fi

# Step 3: Delete IAM Role
echo -e "${YELLOW}🔐 Paso 3: Eliminando rol IAM...${NC}"
if aws iam get-role --role-name $ROLE_NAME >/dev/null 2>&1; then
    # Detach policies first
    aws iam detach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole 2>/dev/null || true
    aws iam detach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess 2>/dev/null || true
    
    # Delete role
    aws iam delete-role --role-name $ROLE_NAME
    echo -e "${GREEN}✅ Rol IAM eliminado: $ROLE_NAME${NC}"
else
    echo -e "${YELLOW}⚠️ Rol IAM no encontrado o ya eliminado${NC}"
fi

# Step 4: Reset Lambda function code to template
echo -e "${YELLOW}📝 Paso 4: Restaurando código Lambda a plantilla...${NC}"
sed -i 's/tiburon-community-data-[0-9]*/TU_BUCKET_DE_S3_AQUI/g' og-renderer-lambda.js
echo -e "${GREEN}✅ Código Lambda restaurado${NC}"

# Clean up any temporary files
rm -f lambda-function.zip lambda-deployment.zip trust-policy.json bucket-policy.json 2>/dev/null || true

echo ""
echo -e "${BLUE}🎉 ¡Limpieza completada!${NC}"
echo "=================================================="
echo -e "${GREEN}✅ API Gateway eliminado${NC}"
echo -e "${GREEN}✅ Función Lambda eliminada${NC}"
echo -e "${GREEN}✅ Rol IAM eliminado${NC}"
echo -e "${GREEN}✅ Código Lambda restaurado${NC}"
echo ""
echo -e "${YELLOW}📋 Próximo paso:${NC}"
echo "Ejecuta: ./setup-social-sharing-fixed.sh"
echo ""
echo -e "${GREEN}✨ ¡Listo para recrear la infraestructura desde cero!${NC}"
