#!/bin/bash

# Complete custom domain setup
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CERT_ARN="arn:aws:acm:us-east-1:864981725738:certificate/43dad0a6-d982-4081-8e7b-a5a792b7df3b"
HOSTED_ZONE_ID="Z04438833U88CAQGS3ZW5"
DOMAIN_NAME="share.tiburoncp.siegfried-fs.com"

echo -e "${BLUE}🔐 Esperando validación del certificado SSL...${NC}"

# Wait for certificate validation
while true; do
    STATUS=$(aws acm describe-certificate --certificate-arn $CERT_ARN --region us-east-1 --query "Certificate.Status" --output text)
    echo "Estado del certificado: $STATUS"
    
    if [ "$STATUS" = "ISSUED" ]; then
        echo -e "${GREEN}✅ Certificado validado exitosamente${NC}"
        break
    elif [ "$STATUS" = "FAILED" ]; then
        echo -e "${RED}❌ Error en la validación del certificado${NC}"
        exit 1
    fi
    
    echo "Esperando... (esto puede tomar varios minutos)"
    sleep 30
done

# Create custom domain in API Gateway
echo -e "${YELLOW}🌐 Creando dominio personalizado en API Gateway...${NC}"
aws apigatewayv2 create-domain-name \
    --domain-name $DOMAIN_NAME \
    --domain-name-configurations CertificateArn=$CERT_ARN \
    --region us-east-1

# Get API Gateway ID
API_ID=$(aws apigatewayv2 get-apis --region us-east-1 --query "Items[?Name=='tiburon-social-share-api'].ApiId" --output text)

# Create API mapping
echo -e "${YELLOW}🔗 Creando mapeo de API...${NC}"
aws apigatewayv2 create-api-mapping \
    --domain-name $DOMAIN_NAME \
    --api-id $API_ID \
    --stage '$default' \
    --region us-east-1

# Get domain name target
TARGET=$(aws apigatewayv2 get-domain-name --domain-name $DOMAIN_NAME --region us-east-1 --query "DomainNameConfigurations[0].TargetDomainName" --output text)

# Create DNS record for the custom domain
echo -e "${YELLOW}📝 Creando registro DNS para el dominio personalizado...${NC}"
aws route53 change-resource-record-sets --hosted-zone-id $HOSTED_ZONE_ID --change-batch "{
  \"Changes\": [{
    \"Action\": \"CREATE\",
    \"ResourceRecordSet\": {
      \"Name\": \"$DOMAIN_NAME\",
      \"Type\": \"CNAME\",
      \"TTL\": 300,
      \"ResourceRecords\": [{\"Value\": \"$TARGET\"}]
    }
  }]
}"

echo -e "${GREEN}🎉 ¡Dominio personalizado configurado exitosamente!${NC}"
echo ""
echo -e "${GREEN}Nueva URL para compartir:${NC}"
echo "https://$DOMAIN_NAME/share?postId=post001"
echo ""
echo -e "${YELLOW}Nota: Puede tomar unos minutos en propagarse por DNS${NC}"
