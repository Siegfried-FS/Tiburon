# 🦈 Proyecto Tiburón - Sitio Web del AWS User Group Playa Vicente

Este es el repositorio oficial del sitio web para el **AWS User Group de Playa Vicente**, una comunidad de tecnología en Veracruz, México, liderada por **Roberto Flores (Siegfried FS)**.

El objetivo de este proyecto es crear una plataforma digital que no solo sirva como un centro de información, sino que también inspire y conecte a los entusiastas de la nube en la región.

**Ver el sitio en vivo:** [tiburoncp.siegfried-fs.com](https://tiburoncp.siegfried-fs.com/)

---

## ✍️ Filosofía y Narrativa del Sitio

Este no es solo un sitio web informativo; es el punto de encuentro digital de nuestra comunidad. La comunicación y el tono del sitio deben reflejar nuestros valores y objetivos.

**Principios Clave de la Narrativa:**

1.  **Tono Profesional y Accesible:** Nos comunicamos con un lenguaje claro y fluido, similar al de un "copywriter". Evitamos la jerga excesiva para ser acogedores con los recién llegados, pero mantenemos la precisión técnica para ser valiosos para los expertos.
2.  **Enfoque en Beneficios:** En lugar de solo listar características, explicamos *por qué* son importantes. Por ejemplo, en lugar de decir "Tenemos un glosario", decimos "Aprende el lenguaje de la nube con nuestro glosario interactivo, diseñado para aclarar los conceptos clave".
3.  **Narrativa Coherente y Atractiva:** Cada página cuenta una parte de nuestra historia. El sitio debe guiar al visitante a través de un viaje, desde descubrir qué es AWS hasta unirse activamente a nuestra comunidad y participar en eventos.
4.  **Honestidad y Potencial:** Reflejamos con honestidad el nivel de habilidad actual y celebramos el proceso de aprendizaje. Destacamos el potencial, la capacidad de aprender rápidamente y el deseo de asumir desafíos para crecer profesionalmente.

El objetivo final es que cada visitante sienta que ha encontrado un lugar para **aprender, colaborar y crecer** en el ecosistema de la nube.

---

## ✨ Características Principales

- **🎨 Tema Claro y Oscuro:** Cambia entre modos para tu comodidad visual.
- **📱 Diseño Responsivo:** Totalmente funcional en dispositivos móviles, tablets y computadoras de escritorio.
- **⚙️ Contenido 100% Dinámico:** Todas las secciones principales (Eventos, Talleres, Recursos, Glosario) se cargan desde archivos JSON, facilitando su actualización sin tocar el código HTML.
- **🚀 Experiencia de Usuario Mejorada:**
    - **Pantallas de Carga (Skeletons):** Interfaces de carga modernas que mejoran la percepción de velocidad.
    - **Botón "Volver Arriba":** Navegación fluida en páginas con mucho contenido.
- **📚 Glosario Interactivo:** Un completo glosario de términos de AWS con búsqueda en tiempo real y filtro alfabético.
- **🗂️ Navegación y Filtrado Avanzado:**
    - **Filtro por Etiquetas:** Filtra dinámicamente los Recursos, Talleres y Juegos de Lógica por sus `tags` para encontrar contenido específico rápidamente.
- **📅 Gestión de Eventos Inteligente:**
    - **Indicadores Visuales:** Distingue claramente eventos próximos vs realizados.
    - **Indicadores de Precio:** Identifica eventos gratuitos vs de pago.
- **⚡ Optimizado para el Rendimiento:** Carga diferida de imágenes (`loading="lazy"`) y código modular para una entrega rápida y eficiente.
- **🔍 SEO Mejorado:** Optimizado para ser encontrado en búsquedas relacionadas con "Roberto Flores" y "Playa Vicente".

---

## 🚀 Tecnologías Utilizadas

- **HTML5**
- **CSS3** (con variables para temas y diseño responsivo)
- **JavaScript (Vanilla)** para la interactividad y carga de contenido dinámico.
- **Particles.js** para los efectos de fondo.
- **Alojado en AWS Amplify** para un despliegue continuo y escalable.

---

## 🏗️ Estructura del Proyecto

Todos los archivos públicos (HTML, assets, etc.) están centralizados en el directorio `public`. El contenido editable se encuentra en la carpeta `public/assets/data/`.

```
tiburon/
├── public/
│   ├── index.html        # Página principal
│   ├── guia.html
│   ├── glosario.html
│   ├── recursos.html
│   ├── talleres.html
│   ├── eventos.html
│   ├── logic-games.html
│   └── assets/
│       ├── css/          # Estilos consolidados en styles.css
│       ├── js/           # Lógica principal modular en app.js
│       ├── data/         # ¡AQUÍ SE EDITA EL CONTENIDO! (Archivos JSON)
│       └── images/       # Imágenes, iconos y códigos QR
├── amplify.yml           # Configuración de despliegue para AWS Amplify
├── README.md             # Este archivo
└── ... (otros archivos de configuración)
```

---

## 🔧 Cómo Probar en Local

Para que el sitio funcione correctamente (especialmente la carga de contenido desde los archivos JSON), necesitas ejecutarlo a través de un servidor web local.

1.  Abre una terminal y **navega a la carpeta `public`**:
    ```bash
    cd public
    ```
2.  Ejecuta un servidor web simple con Python:
    ```bash
    python3 -m http.server
    ```
3.  Abre tu navegador y visita la dirección: `http://localhost:8000`

---

## 🔄 Cómo Actualizar el Contenido

Para facilitar la actualización, todo el contenido dinámico se gestiona desde archivos `JSON` ubicados en `public/assets/data/`. Simplemente edita el archivo correspondiente y los cambios se reflejarán en el sitio.

- **Eventos:** `events.json`
- **Glosario:** `glosario.json`
- **Proyectos:** `git-projects.json`
- **Recursos:** `resources.json`
- **Juegos de Lógica:** `logic-games.json`
- **Talleres:** `workshops.json`

---

## ☁️ Despliegue

Este proyecto está configurado para un despliegue continuo a través de **AWS Amplify**. El archivo `amplify.yml` contiene la configuración del build. Cualquier `git push` a la rama `main` disparará automáticamente un nuevo despliegue del sitio.
