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
    - **Implementación:** Se utiliza el flujo de "Authorization Code Grant" con un proveedor federado (Google). Los roles de usuario (`Admin`, `Capitán`, etc.) se gestionan a través de **Grupos de Cognito**.
- **AWS S3 (Simple Storage Service):**
    - **Función:** Almacena el archivo `feed.json`.
    - **Implementación:** Se utiliza un bucket de S3 estándar. Se configuró para tener **acceso de lectura público** en el archivo `feed.json` mediante una ACL (Access Control List). Esto permite que el sitio web (JavaScript) pueda obtener el archivo para mostrar el feed, mientras que la escritura se controla de forma segura a través de una función Lambda. Esta arquitectura desacopla los datos del código y es extremadamente costo-eficiente.
- **AWS Lambda:**
    - **Función:** Provee la lógica de backend sin necesidad de un servidor.
    - **Implementación:** Tenemos una función (`og-renderer-lambda`) escrita en Node.js que genera dinámicamente las metaetiquetas Open Graph para las vistas previas en redes sociales.
- **AWS API Gateway:**
    - **Función:** Actúa como la puerta de enlace HTTP para nuestra función Lambda.
    - **Implementación:** Se configuró una API HTTP con una ruta `GET /share` que se integra con la función `og-renderer-lambda`. Esto crea una URL pública que podemos usar para los enlaces de "Compartir".

### Hosting
- **AWS Amplify:** Se utiliza para el despliegue y alojamiento del sitio web. Provee un flujo de CI/CD (Integración y Entrega Continuas) que despliega automáticamente los cambios cuando se hace `git push` a la rama principal.

---

## 💸 Uso de la Capa Gratuita de AWS (Free Tier)

Este proyecto está diseñado para operar, en su mayor parte, dentro de la generosa capa gratuita de AWS, lo que lo hace muy económico de mantener.

- **AWS Cognito:** Los primeros **50,000 usuarios activos mensuales (MAUs)** son gratuitos.
- **AWS Lambda:** El primer **1 millón de invocaciones por mes** es gratuito. Nuestra función se invoca solo cuando alguien comparte un post, por lo que es muy poco probable superar este límite.
- **AWS API Gateway:** El primer **1 millón de llamadas a la API HTTP por mes** es gratuito.
- **AWS S3:** Los primeros **5 GB de almacenamiento estándar** son gratuitos, junto con 20,000 peticiones `GET`. Nuestro `feed.json` ocupa solo unos pocos KB.
- **AWS Amplify:** Ofrece una capa gratuita que incluye **1,000 minutos de build y 5 GB de almacenamiento** al mes, suficiente para este proyecto.

**Conclusión:** Mientras la comunidad tenga menos de 50,000 usuarios activos y el tráfico de compartidos sea razonable, el costo de mantener este proyecto en AWS debería ser de **cero o unos pocos centavos al mes**.

---

## 📂 Estructura del Proyecto

El proyecto está organizado de la siguiente manera para separar el contenido, la lógica y los estilos.

```
.
├── public/                  # Directorio raíz del sitio web, lo que se despliega.
│   ├── assets/              # Todos los recursos estáticos.
│   │   ├── css/             # Hojas de estilo (styles.css, auth.css, etc.).
│   │   ├── data/            # Archivos JSON con el contenido dinámico.
│   │   ├── images/          # Imágenes, logos, QRs.
│   │   └── js/              # Scripts de JavaScript (app.js, auth.js, etc.).
│   ├── shared/            # Fragmentos de HTML reutilizables (ej. header.html).
│   ├── *.html             # Todas las páginas principales del sitio.
│   └── ...
├── INSTRUCCIONES_LAMBDA_SSR.md # Guía completa para configurar la Lambda.
├── SETUP_MANUAL.md          # Guía de configuración manual de la infraestructura.
├── SOCIAL_SHARING_README.md # Documentación del sistema para compartir.
├── *.sh                     # Scripts de automatización (despliegue, pruebas, etc.).
├── amplify.yml              # Configuración de build para AWS Amplify.
├── og-renderer-lambda.js    # Código fuente de la función Lambda.
└── README.md                # Este archivo.
```

---

## 🔧 Configuración y Despliegue

- Para la configuración del entorno local y el despliegue, por favor, consulta la sección correspondiente en `SOCIAL_SHARING_README.md` o sigue las instrucciones en `SETUP_MANUAL.md`.
- El despliegue a producción se realiza automáticamente al hacer `git push` a la rama `main` a través de AWS Amplify.

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


