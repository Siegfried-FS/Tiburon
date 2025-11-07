# 🦈 AWS User Group Playa Vicente

¡Bienvenidos a la plataforma oficial del AWS User Group de Playa Vicente! Este es un espacio abierto para aprender, compartir y construir comunidad alrededor de Amazon Web Services en español.

## 🦈 ¿Por Qué "Tiburón"?

- **Nunca paran de moverse**: Siempre aprendiendo, siempre evolucionando
- **Nuevos dientes crecen**: Constantemente desarrollando nuevas habilidades técnicas  
- **Depredadores del océano**: Dominando las aguas de AWS
- **Jarocho del Golfo**: Tiburón tech desde Veracruz 🌊

## 🎯 Nuestra Misión

Crear una comunidad inclusiva y vibrante para entusiastas de AWS en el sur de Veracruz y más allá. Nuestra misión es democratizar el conocimiento de la nube, ofreciendo recursos, talleres y un espacio para conectar y crecer profesionalmente, todo en español.

## 📚 Contenido

### 🌊 Glosario de Términos
Diccionario completo de siglas y términos técnicos AWS:
- **EC2** = Elastic Compute Cloud
- **S3** = Simple Storage Service
- **VPC** = Virtual Private Cloud
- **IAM** = Identity and Access Management
- Y muchos más organizados por categoría

### 🎲 Recursos y Juegos
Talleres, tutoriales y juegos interactivos para aprender AWS de forma práctica:
- **Workshops**: Guías prácticas de nuestros eventos.
- **AWS Cloud Quest**: Aprende y obtén badges de Cloud Practitioner y GenAI.
- **AWS Card Clash**: Domina la arquitectura de AWS jugando.
- **Recursos para Novatos**: Enlaces a AWS Educate, Skillbuilder y más.

### 🗓️ Eventos
Calendario de nuestras próximas reuniones, webinars y talleres. ¡No te pierdas ninguno!

### 🛠️ Servicios AWS Interactivos
Tarjetas interactivas con información detallada:
- Haz clic en cada servicio para ver información general
- Haz clic en los tipos para detalles específicos
- Información práctica para el examen

## 🚀 Características Técnicas

- **Diseño Responsivo**: Funciona en desktop, tablet y móvil
- **Navegación Intuitiva**: Páginas separadas para mejor organización
- **Efectos Visuales**: Particles.js y animaciones suaves
- **Interactividad**: Tarjetas expandibles y contenido dinámico
- **Accesibilidad**: Diseño inclusivo y fácil navegación

## 📁 Estructura del Proyecto

```
tiburon/
├── index.html              # Landing page del User Group
├── glosario.html           # Diccionario de términos AWS
├── recursos.html           # Workshops, tutoriales y juegos
├── servicios.html          # Guía de Servicios AWS
├── eventos.html            # Calendario de eventos
├── assets/
│   ├── css/
│   │   └── styles.css      # Estilos principales
│   ├── js/
│   │   └── app.js          # JavaScript funcional
│   └── images/
│       └── profile-photo.jpg
├── restart-labs/           # (Legado) PDFs de laboratorios
└── README.md
```

## 🗃️ Gestión de Contenido (¡Nuevo!)

Para facilitar la actualización del sitio sin tener que editar el HTML, el contenido de las secciones de Eventos y Recursos se gestiona a través de archivos JSON.

### ¿Cómo Añadir un Nuevo Evento?

1.  **Abre el archivo:** `assets/data/events.json`
2.  **Añade un nuevo objeto** al array con la siguiente estructura:
    ```json
    {
      "date": "YYYY-MM-DD",
      "title": "Título del Evento",
      "description": "Descripción del evento.",
      "image": "assets/images/events/nombre-de-tu-imagen.jpg",
      "tags": ["Tag1", "Tag2"]
    }
    ```
3.  **Sube la imagen:** Asegúrate de subir la imagen correspondiente a la carpeta `assets/images/events/`.

### ¿Cómo Añadir un Nuevo Recurso?

1.  **Abre el archivo:** `assets/data/resources.json`
2.  **Añade un nuevo objeto** al array con la siguiente estructura:
    ```json
    {
      "title": "Título del Recurso",
      "description": "Descripción del recurso.",
      "url": "https://enlace.al/recurso",
      "image": "assets/images/resources/nombre-de-tu-imagen.jpg",
      "tags": ["Tag1", "Tag2"]
    }
    ```
3.  **Sube la imagen:** Asegúrate de subir la imagen correspondiente a la carpeta `assets/images/resources/`.

### Futuro: Escalado con Amazon S3

Actualmente, las imágenes se guardan localmente en el proyecto. El siguiente paso en la hoja de ruta es migrar todo el contenido multimedia (imágenes, videos, PDFs) a un **bucket de Amazon S3**. Las rutas en los archivos JSON se actualizarán para apuntar a las URLs de S3, haciendo el sitio más ligero y escalable.

## 🚀 ¿Cómo Participar?

1. **Explora los Recursos**: Navega por el glosario, los tutoriales y los juegos.
2. **Revisa los Eventos**: Apúntate a nuestros próximos meetups y workshops.
3. **Aprende y Comparte**: Utiliza los materiales para aprender y no dudes en compartir tus conocimientos.
4. **Únete a la Comunidad**: ¡Participa activamente y ayúdanos a crecer!

## 🌐 Despliegue

Optimizado para despliegue en:
- GitHub Pages
- Netlify  
- Vercel
- AWS S3 + CloudFront (¡por supuesto!)

## 🦈 La Evolución Continúa

### Próximas Metas de la Comunidad
- [ ] Foro o canal de discusión para miembros.
- [ ] Galería de proyectos de la comunidad.
- [ ] Sección de "Miembros Destacados".
- [ ] Videos de nuestros workshops.

## 🤝 Para la Comunidad

Este proyecto es la plataforma de nuestro **AWS User Group Playa Vicente**, y está diseñado para ser un recurso **completamente gratuito** y abierto para todos los que deseen aprender y crecer en el mundo de AWS. ¡Tu participación es clave para que sigamos creciendo!

## 🦈 Apoya al User Group

Si este contenido te resulta útil y quieres apoyar las actividades del User Group, puedes "alimentar al tiburón" para que siga nadando y creando más eventos y recursos de calidad.

## 📄 Licencia

Proyecto de código abierto para uso educativo. El conocimiento debe ser libre como el océano.

## 🌊 Agradecimientos

- A la comunidad de AWS en general por su constante innovación y apoyo.
- A todos los miembros del AWS User Group Playa Vicente por su entusiasmo y participación.
- A todos los que comparten conocimiento y hacen de la nube un lugar más accesible.

---

**"Juntos, navegamos las aguas de AWS y crecemos como comunidad."** 🦈⚡

*AWS User Group Playa Vicente - Conectando la nube en el Golfo de México*
