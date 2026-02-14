# 🔗 Integración con Credly API - Guía de Deployment

## 📋 Resumen

Sistema automático para obtener y mostrar solo badges de AWS desde tu perfil de Credly.

### **Ventajas:**
- ✅ Actualización automática cuando obtienes nuevas certificaciones
- ✅ Solo muestra badges de AWS (filtra automáticamente)
- ✅ Separa certificaciones oficiales de badges
- ✅ Fallback a enlace de Credly si falla la API
- ✅ Cache de 1 hora para optimizar performance

---

## 🚀 Deployment Paso a Paso

### **Paso 1: Desplegar Lambda**

```bash
cd /home/siegfried_fs/Desktop/Tiburon

# Editar el script con tu ARN de rol
nano scripts/deployment/deploy-credly-lambda.sh
# Cambiar: ROLE_ARN="arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role"

# Ejecutar deployment
./scripts/deployment/deploy-credly-lambda.sh
```

### **Paso 2: Crear API Gateway**

```bash
# Obtener tu Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Crear API HTTP
API_ID=$(aws apigatewayv2 create-api \
    --name credly-badges-api \
    --protocol-type HTTP \
    --target arn:aws:lambda:us-east-1:$ACCOUNT_ID:function:credly-badges-lambda \
    --region us-east-1 \
    --query ApiId \
    --output text)

echo "API ID: $API_ID"

# Obtener URL del endpoint
API_ENDPOINT=$(aws apigatewayv2 get-api \
    --api-id $API_ID \
    --region us-east-1 \
    --query ApiEndpoint \
    --output text)

echo "API Endpoint: $API_ENDPOINT"
```

### **Paso 3: Dar permisos a API Gateway**

```bash
aws lambda add-permission \
    --function-name credly-badges-lambda \
    --statement-id apigateway-invoke \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:us-east-1:$ACCOUNT_ID:$API_ID/*" \
    --region us-east-1
```

### **Paso 4: Actualizar Frontend**

```bash
# Editar credly-loader.js con tu endpoint
nano public/assets/js/credly-loader.js

# Cambiar línea 6:
# const LAMBDA_ENDPOINT = 'https://YOUR_API_GATEWAY_URL/credly-badges';
# Por:
# const LAMBDA_ENDPOINT = 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com';
```

### **Paso 5: Desplegar Frontend**

```bash
git add .
git commit -m "🔗 Add Credly API integration"
git push origin main
```

---

## 🧪 Testing

### **Test 1: Lambda directamente**

```bash
aws lambda invoke \
    --function-name credly-badges-lambda \
    --region us-east-1 \
    response.json

cat response.json | jq
```

### **Test 2: API Gateway**

```bash
curl https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com | jq
```

### **Test 3: Frontend**

```bash
# Abrir en navegador
cd public
python3 -m http.server 8000

# Visitar: http://localhost:8000
# Verificar que los badges se cargan automáticamente
```

---

## 📊 Estructura de Respuesta

```json
{
  "success": true,
  "count": 7,
  "badges": [
    {
      "id": "abc123",
      "name": "AWS Certified Cloud Practitioner",
      "description": "...",
      "imageUrl": "https://images.credly.com/...",
      "issuedDate": "2024-01-15T00:00:00Z",
      "expiresAt": null,
      "url": "https://www.credly.com/badges/abc123",
      "issuer": "Amazon Web Services",
      "isOfficial": true
    }
  ],
  "lastUpdated": "2026-02-14T20:44:00Z"
}
```

---

## 🔧 Configuración Avanzada

### **Dominio Personalizado (Opcional)**

```bash
# Crear certificado SSL
aws acm request-certificate \
    --domain-name api.tiburoncp.siegfried-fs.com \
    --validation-method DNS \
    --region us-east-1

# Crear dominio personalizado en API Gateway
aws apigatewayv2 create-domain-name \
    --domain-name api.tiburoncp.siegfried-fs.com \
    --domain-name-configurations CertificateArn=YOUR_CERT_ARN

# Mapear API al dominio
aws apigatewayv2 create-api-mapping \
    --domain-name api.tiburoncp.siegfried-fs.com \
    --api-id $API_ID \
    --stage '$default'
```

### **Cache Mejorado con CloudFront (Opcional)**

```bash
# Crear distribución CloudFront apuntando a API Gateway
# Configurar TTL de 1 hora
# Agregar custom headers para CORS
```

---

## 🐛 Troubleshooting

### **Error: "No se pudieron cargar las certificaciones"**

1. Verificar que Lambda esté desplegada:
   ```bash
   aws lambda get-function --function-name credly-badges-lambda --region us-east-1
   ```

2. Verificar logs de Lambda:
   ```bash
   aws logs tail /aws/lambda/credly-badges-lambda --follow --region us-east-1
   ```

3. Verificar CORS en API Gateway:
   ```bash
   aws apigatewayv2 get-api --api-id $API_ID --region us-east-1
   ```

### **Error: "CORS policy"**

La Lambda ya incluye headers CORS. Si persiste:

```bash
# Agregar configuración CORS explícita
aws apigatewayv2 update-api \
    --api-id $API_ID \
    --cors-configuration AllowOrigins="*",AllowMethods="GET,OPTIONS" \
    --region us-east-1
```

### **Error: "Rate limit exceeded"**

Credly tiene rate limits. La Lambda incluye cache de 1 hora. Si necesitas más:

```bash
# Agregar DynamoDB para cache persistente
# O usar CloudFront con TTL más largo
```

---

## 💰 Costos

### **Dentro del Free Tier:**
- **Lambda:** 1M invocaciones/mes gratis
- **API Gateway:** 1M requests/mes gratis
- **CloudWatch Logs:** 5GB gratis

### **Estimación para tu sitio:**
- ~100 visitas/día = 3,000 requests/mes
- Con cache de 1 hora: ~125 invocaciones Lambda/mes
- **Costo: $0.00/mes** ✅

---

## 🔄 Mantenimiento

### **Actualizar Lambda:**

```bash
# Editar código
nano backend/lambdas/credly-badges-lambda.js

# Re-desplegar
./scripts/deployment/deploy-credly-lambda.sh
```

### **Monitoreo:**

```bash
# Ver métricas
aws cloudwatch get-metric-statistics \
    --namespace AWS/Lambda \
    --metric-name Invocations \
    --dimensions Name=FunctionName,Value=credly-badges-lambda \
    --start-time 2026-02-14T00:00:00Z \
    --end-time 2026-02-14T23:59:59Z \
    --period 3600 \
    --statistics Sum \
    --region us-east-1
```

---

## 📚 Recursos

- [Credly API Docs](https://www.credly.com/docs/issued_badges)
- [AWS Lambda Node.js](https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html)
- [API Gateway HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html)

---

## ✅ Checklist de Deployment

- [ ] Lambda desplegada
- [ ] API Gateway creada
- [ ] Permisos configurados
- [ ] Endpoint actualizado en frontend
- [ ] Testing completado
- [ ] Frontend desplegado
- [ ] Verificación en producción

**¡Listo! Tus badges de AWS se actualizarán automáticamente desde Credly!** 🎉
