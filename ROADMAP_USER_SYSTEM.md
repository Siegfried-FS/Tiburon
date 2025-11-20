# 🚀 Roadmap: Sistema de Gestión de Usuarios - Proyecto Tiburón

## 📋 Resumen del Proyecto
Implementar un sistema de usuarios con roles diferenciados para el AWS User Group de Playa Vicente, optimizado para usar únicamente la capa gratuita de AWS.

---

## 👥 Estructura de Roles

### **Admin (Roberto)**
- Control total del sitio web
- Gestión de usuarios y asignación de roles
- Aprobación de contenido de moderadores
- Acceso a analytics completos
- Vista privada del mapa de miembros
- Exportar lista de emails para envío manual

### **Moderator/Contributor**
- Crear/editar eventos (requiere aprobación del admin)
- Subir recursos a la biblioteca
- Proponer entradas para el feed comunitario
- Ver métricas básicas de sus contribuciones

### **Member (Usuario Registrado)**
- Invitaciones anticipadas a eventos con cupo limitado
- Perfil básico con información opcional
- Sistema de favoritos/bookmarks
- Historial de eventos asistidos
- Participación en community feed

---

## 🛠️ Tecnologías a Implementar (Capa Gratuita)

### **Backend/Servicios AWS**
- **AWS Cognito**: 50,000 usuarios únicos por mes gratis (MAU = Monthly Active Users)
- **API Gateway**: 1 millón de requests por mes gratis
- **AWS Lambda**: 1 millón de requests por mes gratis
- **DynamoDB**: 25GB gratis de almacenamiento
- **S3**: 5GB gratis de almacenamiento
- **CloudFront**: 1TB transferencia gratis por mes

### **Frontend (Extensión del actual)**
- **JavaScript Vanilla**: Mantener la arquitectura actual
- **Nuevos componentes**: Login, registro, dashboard de usuario
- **Panel de administración**: Interfaz web para gestión de contenido
- **Sistema de permisos**: Control de acceso basado en roles

### **Alternativas para Emails (Gratis)**
- **Exportar CSV**: Lista de emails para envío manual desde Gmail
- **EmailJS**: Envío directo desde frontend (300 emails/mes gratis)

---

## ✨ Funcionalidades Principales

### **Sistema de Autenticación**
- [x] Registro de usuarios con AWS Cognito
- [x] Login/logout con sesiones persistentes
- [x] Recuperación de contraseña
- [x] Verificación de email

### **Panel de Administración**
- [x] Dashboard con métricas de usuarios
- [x] Gestión de contenido (editar JSONs desde web)
- [x] Aprobación de contenido de moderadores
- [x] Exportar lista de emails para invitaciones manuales
- [x] Vista del mapa de miembros (privada)

### **Community Feed**
- [x] Publicación de logros de miembros
- [x] Anuncios de eventos organizados por la comunidad
- [x] Destacar contribuciones de recursos
- [x] Sistema de aprobación para publicaciones

### **Analytics y Métricas**
- [x] Recursos más visitados
- [x] Crecimiento mensual de usuarios
- [x] Engagement por sección del sitio
- [x] Estadísticas de asistencia a eventos

### **Beneficios para Miembros**
- [x] Notificación de eventos (vía exportación de emails)
- [x] Sistema de favoritos/bookmarks
- [x] Historial personal de eventos
- [x] Perfil público básico (opcional)

---

## 🗺️ Mapa de Implementación

### **Fase 1: Fundación (Semana 1-2)**
1. Setup de AWS Cognito
2. Componentes básicos de login/registro
3. Estructura de base de datos en DynamoDB
4. Panel de admin básico

### **Fase 2: Gestión de Contenido (Semana 3)**
1. CRUD de eventos desde panel admin
2. Sistema de aprobación para moderadores
3. Gestión de usuarios y roles
4. Exportador de emails CSV

### **Fase 3: Community Features (Semana 4)**
1. Community feed con sistema de aprobación
2. Sistema de favoritos para usuarios
3. Historial de eventos
4. Mapa de miembros (vista admin)

### **Fase 4: Analytics y Optimización (Semana 5)**
1. Dashboard de métricas
2. Tracking de recursos más visitados
3. Integración con Luma (importar asistentes)
4. Optimización de performance

---

## 📊 Estructura de Base de Datos

### **Tabla Users**
```
- userId (PK)
- email
- name
- role (admin/moderator/member)
- city (opcional)
- createdAt
- lastLogin
- preferences
- wantsEmails (boolean)
```

### **Tabla Events**
```
- eventId (PK)
- title
- description
- date
- capacity
- attendees[]
- createdBy
- status (draft/approved/published)
- notificationSent (boolean)
```

### **Tabla Feed**
```
- feedId (PK)
- type (achievement/event/resource)
- content
- userId
- status (pending/approved/published)
- createdAt
```

### **Tabla Analytics**
```
- date (PK)
- pageViews
- resourceViews
- newUsers
- activeUsers
```

---

## 📧 Sistema de Notificaciones (Manual)

### **Flujo de Invitaciones**
1. Admin crea evento en el panel
2. Sistema genera lista de emails de miembros interesados
3. Admin exporta CSV con emails
4. Envío manual desde Gmail con template predefinido

### **Templates de Email**
- Invitación a evento con cupo limitado
- Notificación de nuevo contenido
- Bienvenida a nuevos miembros
- Resumen mensual de actividades

---

## 💰 Costos AWS (100% Gratis)

### **Límites de Capa Gratuita**
- **Cognito**: 50,000 usuarios únicos por mes (MAU)
- **Lambda**: 1M requests + 400,000 GB-segundos/mes
- **DynamoDB**: 25GB almacenamiento + 25 unidades de lectura/escritura
- **API Gateway**: 1M requests/mes
- **S3**: 5GB almacenamiento + 20,000 GET + 2,000 PUT
- **CloudFront**: 1TB transferencia + 10M requests/mes

### **¿Qué significa MAU?**
MAU = Monthly Active Users = Usuarios únicos que se loguean al menos una vez por mes.
Para tu comunidad actual (menos de 3 personas), tienes espacio para crecer hasta 50,000 usuarios activos mensuales sin costo.

---

## 🔒 Consideraciones de Seguridad

- Validación de roles en cada endpoint
- Sanitización de inputs del usuario
- Rate limiting en APIs (dentro de límites gratuitos)
- Logs básicos de auditoría
- Protección de datos personales (GDPR básico)

---

## 📈 Métricas de Éxito

- **Adopción**: % de visitantes que se registran
- **Engagement**: Usuarios activos mensuales
- **Retención**: Usuarios que regresan después de 30 días
- **Contenido**: Recursos más populares
- **Eventos**: Tasa de asistencia vs invitados

---

## 🚀 Funcionalidades Futuras (Post-MVP)

- Integración con Telegram Bot
- Sistema de badges/gamificación
- Job board comunitario
- Study groups y networking
- PWA (Progressive Web App)
- Automatización de emails (cuando justifique el costo)

---

## 📝 Notas de Implementación

- Mantener la arquitectura actual del frontend
- Implementación progresiva sin romper funcionalidad existente
- Backup manual de DynamoDB (export/import)
- Testing en ambiente de desarrollo
- Documentación básica de APIs

---

## ⚠️ Limitaciones Actuales

- Envío de emails manual (no automatizado)
- Límites de almacenamiento en S3 (5GB)
- Sin notificaciones push automáticas
- Analytics básicos (no en tiempo real)

---

## 🎯 Objetivos a Corto Plazo

1. **Diciembre 2025**: Sistema básico de usuarios funcionando
2. **Enero 2026**: Panel de admin completo
3. **Febrero 2026**: Community feed activo
4. **Marzo 2026**: Analytics y métricas implementadas

---

**Fecha de creación**: Noviembre 19, 2025  
**Última actualización**: Noviembre 19, 2025  
**Estado**: En planificación  
**Presupuesto**: $0 USD/mes (solo capa gratuita)  
**Branch**: feature/user-management-system
