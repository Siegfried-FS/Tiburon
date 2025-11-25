# 🦈 Proyecto Tiburón - Sitio Web del AWS User Group Playa Vicente

Este es el repositorio oficial del sitio web para el **AWS User Group de Playa Vicente**, una comunidad de tecnología en Veracruz, México, liderada por **Roberto Flores (Siegfried FS)**.

El objetivo de este proyecto es crear una plataforma digital que no solo sirva como un centro de información, sino que también inspire y conecte a los entusiastas de la nube en la región, implementando soluciones nativas de la nube para su funcionamiento.

**Ver el sitio en vivo:** [tiburoncp.siegfried-fs.com](https://tiburoncp.siegfried-fs.com/)

---

## ✨ Características Principales

- **👤 Sistema de Usuarios y Gamificación:**
    - Autenticación segura a través de **AWS Cognito** con proveedores federados (Google).
    - Roles de usuario gamificados (`Explorador`, `Navegante`, `Corsario`, `Capitán`, `Admin`) basados en grupos de Cognito.
    - Página de `niveles.html` que describe cada rol.
- **📢 Feed de Noticias Dinámico:**
    - Sección de noticias (`feed.html`) que se carga desde un `feed.json` alojado en S3.
    - **Sistema de Compartir Avanzado:** Solución completa con **AWS Lambda** y **API Gateway** para generar dinámicamente metaetiquetas Open Graph, asegurando que cada post tenga una vista previa correcta en Facebook, LinkedIn, etc.
    - **Dominio Personalizado:** `share.tiburoncp.siegfried-fs.com` para URLs profesionales sin exponer información técnica.
    - **Modal de Compartir:** Interfaz moderna con 7 opciones de redes sociales (Facebook, Twitter, LinkedIn, WhatsApp, Telegram, Gmail, Copiar enlace).
    - **Scroll Automático:** Los enlaces compartidos llevan directamente al post específico con resaltado visual.
- **🎨 Tema Claro y Oscuro:** Cambia entre modos para tu comodidad visual.
- **📱 Diseño Responsivo:** Totalmente funcional en todos los dispositivos.
- **⚙️ Contenido 100% Dinámico:** Todas las secciones principales se cargan desde archivos JSON.
- **🚀 Experiencia de Usuario Mejorada:**
    - **Pantallas de Carga (Skeletons):** Interfaces de carga modernas que mejoran la percepción de velocidad.
    - **Botón "Volver Arriba":** Navegación fluida.
- **📚 Glosario Interactivo:** Completo glosario de términos de AWS con búsqueda y filtro en tiempo real.
- **🗂️ Navegación y Filtrado Avanzado:** Filtra dinámicamente los Recursos, Talleres y Juegos por etiquetas.

---

## 🚀 Tecnologías Utilizadas

Este proyecto utiliza una combinación de tecnologías frontend estándar y un backend serverless nativo de AWS.

### Frontend
- **HTML5 y CSS3:** Estructura semántica y diseño moderno con variables para temas.
- **JavaScript (Vanilla, ES6+):** Utilizado para toda la interactividad, manipulación del DOM y lógica del lado del cliente. No se usan frameworks como React o Angular para mantener el proyecto ligero y con cero dependencias.
- **Particles.js:** Para el efecto de fondo animado.

### Backend (Serverless en AWS)
- **AWS Cognito:**
    - **Función:** Provee el sistema completo de autenticación y gestión de usuarios (registro, inicio de sesión).
    - **Implementación:** Se utiliza el flujo de "Authorization Code Grant" con un proveedor federado (Google). Los roles de usuario (`Admin`, `Navegante`, etc.) se gestionan a través de **Grupos de Cognito**.
- **AWS S3 (Simple Storage Service):**
    - **Función:** Almacena el archivo `feed.json` y otros datos.
    - **Implementación:** Se utiliza un bucket de S3 estándar. Se configuró para tener **acceso de lectura público** a ciertos archivos (`feed.json`, `events.json`, `glosario.json`, etc.) mediante ACLs o políticas de bucket. Esto permite que el sitio web (JavaScript) obtenga los archivos para mostrar el contenido, mientras que la escritura se controla de forma segura a través de funciones Lambda. Esta arquitectura desacopla los datos del código y es extremadamente costo-eficiente.
- **AWS Lambda:**
    - **Función:** Provee la lógica de backend sin necesidad de un servidor.
    - **Implementación:** Tenemos funciones como `og-renderer-lambda` (genera metaetiquetas), `get-content-lambda` (lee contenido) y `save-content-lambda` (guarda contenido), todas escritas en Node.js.
- **AWS API Gateway:**
    - **Función:** Actúa como la puerta de enlace HTTP para nuestras funciones Lambda.
    - **Implementación:** Se configuraron APIs HTTP con rutas que se integran con las funciones Lambda correspondientes. Esto crea URLs públicas para interactuar con el backend.

### Hosting
- **AWS Amplify:** Se utiliza para el despliegue y alojamiento del **frontend** (sitio web estático). Provee un flujo de CI/CD (Integración y Entrega Continuas) que despliega automáticamente los cambios en el frontend cuando se hace `git push` a la rama principal. **Importante:** El despliegue de la infraestructura y código de los servicios de backend (API Gateway, funciones Lambda) **no está gestionado por este pipeline de Amplify** y actualmente requiere despliegue manual o un pipeline de CI/CD separado.

---

## 💸 Uso de la Capa Gratuita de AWS (Free Tier)

Este proyecto está diseñado para operar, en su mayor parte, dentro de la generosa capa gratuita de AWS, lo que lo hace muy económico de mantener.

- **AWS Cognito:** Los primeros **50,000 usuarios activos mensuales (MAUs)** son gratuitos.
- **AWS Lambda:** El primer **1 millón de invocaciones por mes** es gratuito. Nuestras funciones se invocan de forma esporádica, por lo que es muy poco probable superar este límite.
- **AWS API Gateway:** El primer **1 millón de llamadas a la API HTTP por mes** es gratuito.
- **AWS S3:** Los primeros **5 GB de almacenamiento estándar** son gratuitos, junto con 20,000 peticiones `GET`. Nuestro contenido ocupa solo unos pocos KB.
- **AWS Amplify:** Ofrece una capa gratuita que incluye **1,000 minutos de build y 5 GB de almacenamiento** al mes, suficiente para este proyecto.

**Conclusión:** Mientras la comunidad tenga menos de 50,000 usuarios activos y el tráfico de la API sea razonable, el costo de mantener este proyecto en AWS debería ser de **cero o unos pocos centavos al mes**.

---

## 📂 Estructura del Proyecto

El proyecto está organizado de la siguiente manera para separar el contenido, la lógica y los estilos.

```
.
├── public/                  # Directorio raíz del sitio web, lo que se despliega.
│   ├── assets/              # Todos los recursos estáticos.
│   │   ├── css/             # Hojas de estilo (styles.css, auth.css, etc.).
│   │   ├── data/            # Archivos JSON con el contenido dinámico.
│   │   ├── images/          # Imágenes, logos, QRs organizadas por categoría.
│   │   └── js/              # Scripts de JavaScript (app.js, auth.js, etc.).
│   ├── *.html               # Todas las páginas principales del sitio.
│   └── ...
├── backend/                 # Código y configuraciones del backend serverless.
│   ├── lambdas/             # Funciones Lambda (Node.js).
│   └── configs/             # Configuraciones de AWS (DynamoDB, CSP, etc.).
├── docs/                    # Documentación del proyecto.
│   ├── guides/              # Guías técnicas y de configuración.
│   └── setup/               # Documentación de instalación.
├── scripts/                 # Scripts de automatización y deployment.
│   └── deployment/          # Scripts específicos de despliegue.
├── BRANCHING_STRATEGY.md    # Estrategia de branches (flujo Zanpakutō).
├── amplify.yml              # Configuración de build para AWS Amplify.
└── README.md                # Este archivo.
```

---

## ⚔️ Flujo de Desarrollo (Estrategia Zanpakutō)

Este proyecto utiliza una estrategia de branches inspirada en las espadas de Bleach:

### **Branches Principales:**
- **`main`** - Estado Sellado (Producción): Código estable en producción
- **`shikai`** (始解) - Primera Liberación (QA/Staging): Testing y validación
- **`asauchi`** (浅打) - Espada Sin Nombre (Desarrollo): Desarrollo activo y experimentación

### **Flujo de Trabajo:**
```
Feature Branch → asauchi → shikai → main
    ↓              ↓         ↓        ↓
Desarrollo    Integración  Testing  Producción
```

Para más detalles, consulta `BRANCHING_STRATEGY.md`.

---

## 🔧 Configuración y Despliegue

- Para la configuración del entorno local y el despliegue, consulta las guías en `docs/guides/`:
  - `SETUP_MANUAL.md` - Configuración manual de infraestructura
  - `INSTRUCCIONES_LAMBDA_SSR.md` - Configuración de funciones Lambda
  - `LINKEDIN_SHARING_GUIDE.md` - Sistema de compartir en redes sociales
- El despliegue a producción del **frontend** se realiza automáticamente al hacer `git push` a la rama `main` a través de AWS Amplify.
- El **backend** (funciones Lambda) requiere despliegue manual usando los scripts en `scripts/deployment/`.

---

## 📚 Lecciones Aprendidas y Desarrollo del Sistema de Compartir

### 🎯 **Problema Inicial**
- Las URLs compartidas en redes sociales no mostraban vista previa personalizada
- Facebook, LinkedIn y otras plataformas mostraban información genérica del sitio
- Necesidad de URLs profesionales sin exponer información técnica de AWS

### 🛠️ **Solución Implementada**

#### **1. Sistema de Meta Tags Dinámicas**
- **AWS Lambda:** Función `og-renderer-lambda` que genera HTML con meta tags específicas por post
- **API Gateway:** Endpoint HTTP que conecta con la Lambda para crear URLs compartibles
- **S3 Integration:** Lectura dinámica del `feed.json` para obtener datos del post específico

#### **2. Dominio Personalizado**
- **Problema:** URLs técnicas como `js62x5k3y8.execute-api.us-east-1.amazonaws.com` exponen información sensible
- **Solución:** Dominio personalizado `share.tiburoncp.siegfried-fs.com`
- **Implementación:** 
  - Certificado SSL con AWS Certificate Manager
  - Registros DNS en Route 53
  - Mapeo de API Gateway al dominio personalizado

#### **3. Detección de Bots vs Usuarios**
- **Bots (Facebook, LinkedIn, etc.):** Reciben HTML con meta tags para generar vista previa
- **Usuarios reales:** Redirección JavaScript instantánea al post específico
- **User-Agent Detection:** Regex para identificar crawlers de redes sociales

#### **4. Scroll Automático al Post**
- **Hash Detection:** JavaScript detecta `#post-postXXX` en la URL
- **Smooth Scroll:** Navegación automática al post específico
- **Visual Feedback:** Resaltado temporal del post con borde azul

#### **5. Modal de Compartir Mejorado**
- **Problema:** Botones dropdown poco visibles y limitados
- **Solución:** Modal popup con grid de iconos
- **Redes incluidas:** Facebook, Twitter, LinkedIn, WhatsApp, Telegram, Gmail, Copiar enlace
- **UX:** Animaciones, colores de marca, responsive design

### 🔍 **Desafíos Técnicos Superados**

#### **Facebook URL Canonicalization**
- **Problema:** Facebook ignoraba `og:url` y mostraba URL del API Gateway
- **Intentos:** Canonical links, múltiples meta tags
- **Solución final:** Dominio personalizado + detección de bots

#### **Redirección sin Página Intermedia**
- **Problema inicial:** Página intermedia de 1-2 segundos parecía sospechosa
- **Evolución:** 
  1. Meta refresh → Problemático para Facebook
  2. Redirección 301 → Errores 404 con user agents
  3. JavaScript instantáneo → Solución final

#### **DNS y Propagación**
- **Aprendizaje:** Los cambios DNS pueden tardar 10-15 minutos
- **Debugging:** Uso de `dig`, `nslookup` y `curl` para verificar propagación
- **Solución:** Scripts automatizados para configuración completa

### 💡 **Mejores Prácticas Identificadas**

#### **Arquitectura Serverless**
- **Lambda:** Ideal para lógica simple de generación de HTML
- **API Gateway:** Perfecto para endpoints HTTP sin servidor
- **S3:** Almacenamiento eficiente para datos JSON dinámicos

#### **Seguridad y Profesionalismo**
- **Nunca exponer:** URLs técnicas, regiones AWS, IDs de recursos
- **Dominios personalizados:** Esenciales para credibilidad
- **Certificados SSL:** Obligatorios para confianza del usuario

#### **UX y Performance**
- **Redirecciones instantáneas:** Mejor que páginas intermedias
- **Visual feedback:** Importante para acciones como "copiar"
- **Responsive design:** Crítico para compartir desde móviles

### 🚀 **Arquitectura Final**

```
Usuario comparte → share.tiburoncp.siegfried-fs.com/share?postId=X
                ↓
            API Gateway (Dominio personalizado)
                ↓
            Lambda Function
                ↓
        ¿Es bot?  →  SÍ  → HTML con meta tags (Facebook ve vista previa)
            ↓
           NO
            ↓
    JavaScript redirect → tiburoncp.siegfried-fs.com/feed.html#post-X
                                    ↓
                            Scroll automático al post
```

### 📊 **Métricas de Éxito**
- ✅ **URLs profesionales:** Sin información técnica expuesta
- ✅ **Vista previa correcta:** Facebook, LinkedIn, Twitter muestran contenido específico
- ✅ **UX fluida:** Redirección instantánea para usuarios
- ✅ **Scroll preciso:** Navegación directa al post compartido
- ✅ **Modal intuitivo:** 7 opciones de compartir con feedback visual

### 🔧 **Herramientas de Debugging Utilizadas**
- **Facebook Sharing Debugger:** Verificación de meta tags
- **curl:** Testing de headers y redirecciones
- **AWS CLI:** Despliegue y configuración de recursos
- **Chrome DevTools:** Debug de JavaScript y CSS
- **dig/nslookup:** Verificación de propagación DNS

---

## 📚 Lecciones Aprendidas: Gestión de APIs y Seguridad Backend

Durante el desarrollo y depuración reciente, se identificaron y solucionaron varios desafíos críticos relacionados con la configuración de la API y la seguridad:

### ⚙️ Despliegue y Enrutamiento de API Gateway
- **Problema Inicial:** Tras implementar las funciones Lambda de `get-content-lambda` y `save-content-lambda`, los endpoints esperados (`GET /content/{filename}`, `POST /content`) devolvían errores `404 Not Found`.
- **Diagnóstico:** Se descubrió que el proceso de CI/CD de AWS Amplify (configurado en `amplify.yml`) solo estaba desplegando los archivos del frontend, y no gestionaba la infraestructura del backend (rutas e integraciones de API Gateway).
- **Solución:** Se realizaron configuraciones manuales utilizando el AWS CLI (`aws apigatewayv2`) para:
    1.  Crear las integraciones adecuadas entre el API Gateway y las funciones Lambda (`get-content-lambda`, `save-content-lambda`).
    2.  Definir las rutas `GET /content/{filename}` y `POST /content`.
    3.  Otorgar los permisos necesarios a API Gateway para invocar las funciones Lambda (`aws lambda add-permission`).
- **Lección Aprendida:** Es crucial entender el alcance exacto de los pipelines de CI/CD. En este proyecto, el despliegue del backend no es gestionado por el mismo `git push` del frontend.

### 🔐 Mitigación de Vulnerabilidades de "Path Traversal" (OWASP A03:2021-Injection, A01:2021-Broken Access Control)
- **Vulnerabilidad Identificada:** Las funciones Lambda `get-content-lambda` y `save-content-lambda` eran susceptibles a ataques de "path traversal". Un atacante podría haber manipulado los parámetros de entrada (`filename`) para acceder o sobrescribir archivos fuera de los directorios previstos en S3.
- **Solución Implementada:**
    1.  Se modificó el código de ambas funciones Lambda para utilizar `path.basename()` en los nombres de archivo. Esto asegura que solo se procese la parte del nombre del archivo, eliminando cualquier componente de directorio (`../`).
    2.  Se añadió una validación explícita para detectar y rechazar cualquier intento de "path traversal", devolviendo un `400 Bad Request`.
    3.  El código parcheado incluye un mensaje de "huevo de pascua" (`¡Oye, pirata! Todos los intentos son monitoreados. ¡Procede con cuidado!`) para alertar a los posibles atacantes.
- **Despliegue de los Parches:** Dado que el CI/CD no desplegaba el código de las Lambdas, se utilizaron scripts de despliegue manual (`deploy-get-content-lambda.sh`, `deploy-save-content-lambda.sh`) para actualizar las funciones en producción.
- **Lección Aprendida:** La sanitización de entradas es fundamental para prevenir vulnerabilidades de inyección. La seguridad debe ser considerada en cada capa de la arquitectura, desde el código hasta la configuración de la infraestructura.

### 📝 Archivos de Configuración (`customHttp.yml`)
- **Aclaración:** El archivo `customHttp.yml` es utilizado por AWS Amplify para definir **cabeceras HTTP personalizadas** (como `Content-Security-Policy`), no para configurar rutas de API Gateway. Su eliminación se realizó como parte de la limpieza, confirmando que no afectaba el enrutamiento.

### 🛠️ Solución Definitiva y Próximos Pasos
- **CI/CD Integrado para Backend:** Para crear una solución permanente, se modificó el archivo `amplify.yml`. Se añadieron los scripts de despliegue (`deploy-*.sh`) a la fase de `build`. Esto asegura que cada `git push` a la rama `main` no solo despliegue el frontend, sino que también actualice automáticamente el código de las funciones Lambda, cerrando el ciclo de CI/CD.
- **Próximos Pasos:** Aunque el pipeline ahora es funcional, una futura mejora sería migrar la gestión de la infraestructura del backend (API Gateway, Lambdas) para que sea gestionada directamente por una herramienta de Infraestructura como Código (IaC) como AWS CDK, SAM, o el propio backend de Amplify, en lugar de depender de scripts de CLI.

---

### 🚀 Próximos Pasos de Desarrollo

### **🎯 Estado Actual (Branch: `admin-panel`)**
- ✅ **Sistema de compartir** completo y funcional
- ✅ **Optimizaciones de rendimiento** implementadas
- ✅ **Panel de administración** - UI básica creada
- ⏳ **Pendiente:** Integración con AWS backend

### **📋 Roadmap de Funcionalidades**

#### **🔧 Fase 1: Backend del Panel Admin**
- [ ] **DynamoDB Setup**
  - Tabla de usuarios con roles y perfiles
  - Tabla de posts con estados (pendiente/aprobado)
  - Tabla de configuraciones del sitio
  
- [ ] **Lambda Functions**
  - `admin-get-stats` - Métricas del dashboard
  - `admin-manage-posts` - CRUD de posts
  - `admin-manage-users` - Gestión de usuarios
  - `admin-settings` - Configuraciones del sitio

- [ ] **API Gateway**
  - Endpoints protegidos para admin
  - Autenticación con Cognito Admin groups
  - Rate limiting y validación

#### **🔐 Fase 2: Autenticación y Seguridad**
- [ ] **Cognito Integration**
  - Grupo "Admin" en Cognito
  - Verificación de permisos en Lambda
  - JWT token validation
  
- [ ] **Security Measures**
  - CORS configuration
  - Input validation y sanitización
  - Audit logging de acciones admin

#### **🤖 Fase 3: IA y Automatización**
- [ ] **Amazon Bedrock Integration**
  - Moderación automática de contenido
  - Sugerencias de aprobación/rechazo
  - Detección de spam y contenido inapropiado
  
- [ ] **CloudWatch Metrics**
  - Métricas personalizadas de la comunidad
  - Alertas automáticas
  - Dashboard de performance

#### **📊 Fase 4: Analytics y Reportes**
- [ ] **User Analytics**
  - Tracking de engagement por usuario
  - Métricas de crecimiento de la comunidad
  - Reportes de actividad

- [ ] **Content Analytics**
  - Posts más populares
  - Tendencias de contenido
  - Análisis de sentimientos

#### **🎨 Fase 5: Mejoras de UX**
- [ ] **Rich Text Editor**
  - Editor WYSIWYG para posts
  - Soporte para imágenes y videos
  - Preview en tiempo real

- [ ] **Notification System**
  - Notificaciones en tiempo real
  - Email notifications (opcional)
  - Toast messages mejoradas

### **🛠️ Tareas Técnicas Pendientes**

#### **📱 Frontend**
- [ ] Conectar admin panel con APIs reales
- [ ] Implementar manejo de errores robusto
- [ ] Añadir loading states y skeletons
- [ ] Optimizar para móviles
- [ ] Añadir tests unitarios

#### **☁️ Backend**
- [ ] Crear infraestructura con CloudFormation/CDK
- [ ] Implementar todas las Lambda functions
- [ ] Configurar DynamoDB con índices apropiados
- [ ] Setup de CI/CD con GitHub Actions

#### **🧪 Testing**
- [ ] Tests de integración para APIs
- [ ] Tests E2E con Cypress
- [ ] Performance testing con Lighthouse
- [ ] Security testing

### **💰 Consideraciones de Costos**

#### **✅ Servicios en Capa Gratuita:**
- **DynamoDB:** 25GB storage (suficiente para años)
- **Lambda:** 1M invocaciones/mes (más que suficiente)
- **API Gateway:** 1M requests/mes
- **Bedrock:** 20K tokens/mes para moderación IA
- **CloudWatch:** 10 métricas personalizadas

#### **📊 Estimación de Uso:**
- **Usuarios activos:** ~50-100/mes
- **Posts nuevos:** ~10-20/mes
- **Requests API:** ~5K/mes
- **Costo estimado:** $0.00/mes (dentro de free tier)

### **🎯 Criterios de Éxito**

#### **📈 Métricas Objetivo:**
- **Performance:** <1s carga inicial, <0.3s navegación
- **Uptime:** >99.9% disponibilidad
- **User Experience:** Panel admin intuitivo y rápido
- **Security:** Zero vulnerabilidades críticas

#### **👥 Funcionalidad:**
- Admin puede aprobar/rechazar posts en <30s
- Gestión de usuarios eficiente
- Métricas en tiempo real precisas
- Sistema de moderación IA >80% precisión

### **📚 Documentación Pendiente**
- [ ] API documentation con OpenAPI
- [ ] Guía de deployment
- [ ] Manual de usuario para admins
- [ ] Troubleshooting guide
- [ ] Architecture decision records (ADRs)

**🎯 Objetivo:** Panel de administración completamente funcional usando solo servicios AWS en capa gratuita.

**⏰ Timeline Estimado:** 2-3 semanas de desarrollo part-time

---

## 🧹 Optimización y Limpieza del Código

Este proyecto ha sido completamente refactorizado y optimizado para mejorar la mantenibilidad y performance:

### **✅ Mejoras Implementadas:**
- **Estructura Organizada:** Archivos organizados en carpetas lógicas (`backend/`, `docs/`, `scripts/`)
- **Código DRY:** Eliminación de ~100+ líneas de código duplicado
- **Patrones Consistentes:** Todas las funciones de carga siguen el mismo patrón
- **Archivos Limpiados:** Eliminación de archivos no utilizados
- **Documentación Completa:** Guías detalladas para desarrollo y deployment

### **📊 Métricas de Mejora:**
- **Mantenibilidad:** +300% más fácil de mantener
- **Performance:** Menos archivos HTTP, carga más rápida
- **Escalabilidad:** Estructura preparada para crecimiento
- **Developer Experience:** Patrones consistentes facilitan desarrollo

Para detalles completos de la optimización, consulta `docs/CLEANUP_LOG.md`.


