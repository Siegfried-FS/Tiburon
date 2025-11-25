#!/bin/bash

# Script to set up custom domain for social sharing
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🌐 Configurando dominio personalizado para compartir...${NC}"

# Get current API Gateway ID
API_ID=$(aws apigatewayv2 get-apis --region us-east-1 --query "Items[?Name=='tiburon-social-share-api'].ApiId" --output text)

if [ -z "$API_ID" ] || [ "$API_ID" = "None" ]; then
    echo -e "${YELLOW}⚠️ No se encontró el API Gateway${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Para ocultar la URL técnica, necesitas:${NC}"
echo ""
echo "1. Añadir este registro DNS a tu dominio:"
echo "   Tipo: CNAME"
echo "   Nombre: _3eb59877223ea773fbe89d35af7e502a.share"
echo "   Valor: _0a8154edbe72053716148203ef20f2e4.jkddzztszm.acm-validations.aws."
echo ""
echo "2. Después añadir:"
echo "   Tipo: CNAME"
echo "   Nombre: share"
echo "   Valor: $API_ID.execute-api.us-east-1.amazonaws.com"
echo ""
echo -e "${GREEN}Una vez configurado, podrás usar:${NC}"
echo "https://share.tiburoncp.siegfried-fs.com/share?postId=post001"
echo ""
echo -e "${YELLOW}¿Quieres que configure los registros DNS automáticamente? (necesitas Route 53)${NC}"
