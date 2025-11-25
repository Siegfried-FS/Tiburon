# ⚔️ Estrategia de Branches - Flujo Zanpakutō

Inspirado en las espadas de Bleach, nuestro flujo de desarrollo sigue la evolución natural de una Zanpakutō.

## 🗡️ Branches Principales

### `main` - Estado Sellado (Producción)
- **Propósito**: Código estable en producción
- **URL**: https://tiburoncp.siegfried-fs.com
- **Protección**: Solo merge desde `shikai` con PR aprobado
- **Deploy**: Automático via AWS Amplify

### `shikai` (始解) - Primera Liberación (QA/Staging)
- **Propósito**: Testing y validación antes de producción
- **URL**: `shikai.d1w1ma3qitwxej.amplifyapp.com` (por configurar)
- **Merge desde**: `asauchi`
- **Merge hacia**: `main`

### `asauchi` (浅打) - Espada Sin Nombre (Desarrollo)
- **Propósito**: Desarrollo activo, experimentación, nuevas features
- **URL**: `asauchi.d1w1ma3qitwxej.amplifyapp.com` (por configurar)
- **Merge desde**: Feature branches temporales
- **Merge hacia**: `shikai`

## 🔄 Flujo de Trabajo

```
Feature Branch → asauchi → shikai → main
    ↓              ↓         ↓        ↓
Desarrollo    Integración  Testing  Producción
```

### 1. Desarrollo de Feature
```bash
git checkout asauchi
git pull origin asauchi
git checkout -b feature/nueva-funcionalidad
# ... desarrollo ...
git push origin feature/nueva-funcionalidad
# Crear PR hacia asauchi
```

### 2. Integración en Asauchi
```bash
# Después de merge del PR
git checkout asauchi
git pull origin asauchi
# Testing local, refactoring, cleanup
```

### 3. Promoción a Shikai (QA)
```bash
git checkout shikai
git pull origin shikai
git merge asauchi
git push origin shikai
# Testing en ambiente de staging
```

### 4. Release a Producción
```bash
git checkout main
git pull origin main
git merge shikai
git push origin main
# Deploy automático a producción
```

## 🚫 Branches Eliminadas

Las siguientes branches fueron eliminadas por ser redundantes:
- `development` - Reemplazada por `asauchi`
- `feature/admin-module-testing` - Features van en branches temporales
- `refactor/cleanup` - Refactoring se hace en `asauchi`

## 🛡️ Reglas de Protección

### Branch `main`
- ✅ Require PR reviews
- ✅ Require status checks
- ✅ No direct pushes
- ✅ Delete head branches after merge

### Branch `shikai`
- ✅ Require PR reviews (opcional)
- ✅ Allow direct pushes desde `asauchi`

### Branch `asauchi`
- ✅ Allow direct pushes
- ✅ Playground para desarrollo

## 🎯 Convenciones

### Nombres de Feature Branches
- `feature/nombre-descriptivo`
- `fix/bug-especifico`
- `refactor/area-codigo`
- `docs/actualizacion`

### Commits
- Usar conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Mensajes en español para el equipo local
- Incluir contexto del cambio

## 🚀 Configuración de Ambientes

### Producción (`main`)
- **Dominio**: tiburoncp.siegfried-fs.com
- **SSL**: Certificado personalizado
- **CDN**: CloudFront (si aplica)
- **Monitoreo**: CloudWatch

### Staging (`shikai`)
- **Dominio**: Por configurar en Amplify
- **Propósito**: Testing final antes de producción
- **Datos**: Copia de producción o datos de prueba

### Desarrollo (`asauchi`)
- **Dominio**: Por configurar en Amplify  
- **Propósito**: Testing de features en desarrollo
- **Datos**: Datos de prueba, mocks

## 📚 Referencias

- [Bleach Wiki - Zanpakutō](https://bleach.fandom.com/wiki/Zanpakut%C5%8D)
- [AWS Amplify Branch Deployments](https://docs.aws.amazon.com/amplify/latest/userguide/multi-environments.html)
- [Conventional Commits](https://www.conventionalcommits.org/)
