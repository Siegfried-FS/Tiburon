# 🦈 Proyecto Tiburón - AWS User Group Playa Vicente

> **Plataforma Serverless 100% Gratuita con Seguridad Enterprise**

**🌐 Sitio:** [tiburoncp.siegfried-fs.com](https://tiburoncp.siegfried-fs.com/)  
**🔐 Admin:** [admin-panel.html](https://tiburoncp.siegfried-fs.com/admin-panel.html) (requiere autenticación)

---

## ✨ Características

- **🔐 Seguridad:** Cognito + JWT Authorizer + Lambda
- **🏆 Badges Dinámicos:** Integración con Credly API
- **📝 Panel Admin:** CRUD completo protegido
- **🎨 Diseño 2026:** Tema vibrante claro/oscuro
- **💰 Costo:** $0.00/mes (100% Free Tier)

---

## 🏛️ Arquitectura

```
CloudFront → Amplify → GitHub (CI/CD)
     ↓
API Gateway + Authorizer → Lambda → DynamoDB
     ↓
Cognito (Auth) + Google OAuth
```

**Stack:** HTML5, CSS3, Vanilla JS | Node.js 20.x | DynamoDB | Cognito

---

## 📂 Estructura

```
public/          # Frontend (Amplify)
backend/lambdas/ # Funciones Lambda
scripts/         # Deployment scripts
docs/            # Documentación
```

---

## 🚀 Deployment

### Frontend (Automático):
```bash
git push origin main  # Amplify despliega automáticamente
```

### Backend (Manual):
```bash
./scripts/deployment/deploy-credly-lambda.sh
./scripts/deployment/deploy-cognito-authorizer.sh
```

---

## 🔐 Seguridad

**Sistema de 3 capas:**
1. **Frontend:** Verificación de sesión Cognito
2. **API Gateway:** Lambda Authorizer con JWT
3. **Backend:** Validación de grupo "Admins"

**Documentación:** `docs/SECURITY_IMPLEMENTATION.md`

---

## 📚 Documentación

- `docs/guides/CREDLY_INTEGRATION.md` - Integración Credly API
- `docs/SECURITY_IMPLEMENTATION.md` - Sistema de seguridad
- `VISUAL_UPDATE_2026.md` - Diseño moderno
- `NARRATIVE_UPDATE_2026.md` - Narrativa del sitio

---

## 💰 Costos (Free Tier)

| Servicio | Uso | Límite Gratuito | Costo |
|----------|-----|-----------------|-------|
| Cognito | 2 usuarios | 50K MAUs | $0.00 |
| Lambda | ~200 invocaciones | 1M/mes | $0.00 |
| API Gateway | ~100 requests | 1M/mes | $0.00 |
| DynamoDB | 2 posts | 25GB | $0.00 |
| Amplify | 1 build | 1000 min/mes | $0.00 |

**Total: $0.00/mes** ✅

---

## 🎨 Diseño

**Paleta 2026:**
- Púrpura: #8b5cf6
- Azul: #3b82f6
- Ámbar: #f59e0b

**Características:**
- Bento box design
- Micro-interacciones
- Gradientes suaves
- Cards 3D

---

## 👥 Comunidad

**AWS User Group Playa Vicente:**
- [Telegram](https://t.me/AUGPlayaVicente)
- [Instagram](https://instagram.com/usergroupplayavigente)
- [LinkedIn](https://linkedin.com/company/aws-user-group-playa-vicente)

**Roberto Flores:**
- [LinkedIn](https://linkedin.com/in/roberto-flores-b1a012322/)
- [GitHub](https://github.com/Siegfried-FS)
- [AWS Builder](https://builder.aws.com/community/@robertoflores)

---

## 📄 Licencia

Código abierto para la comunidad.

---

**Hecho con ❤️ en Playa Vicente, Veracruz 🇲🇽**

**🦈 Transformando vidas a través de la tecnología**
