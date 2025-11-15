# 🦈 Proyecto Tiburón - AWS User Group Playa Vicente

¡Bienvenidos a la plataforma oficial del AWS User Group de Playa Vicente! Este es un espacio abierto para aprender, compartir y construir comunidad alrededor de Amazon Web Services en español.

## ✨ Tecnologías Utilizadas

Este es un sitio web estático construido con tecnologías web estándar para asegurar un rendimiento óptimo y facilidad de mantenimiento.

- **HTML5**
- **CSS3** (con variables para temas)
- **JavaScript (Vanilla)**
- **Alojado en AWS Amplify**

---

## 🏗️ Estructura del Proyecto

El proyecto sigue una estructura donde todos los archivos públicos (HTML, assets, etc.) están centralizados en el directorio `public`. Esto simplifica la configuración del despliegue.

```
tiburon/
├── public/
│   ├── index.html
│   ├── glosario.html
│   ├── recursos.html
│   ├── servicios.html
│   ├── eventos.html
│   └── assets/
│       ├── css/          # Archivos de estilo
│       ├── js/           # Archivos de JavaScript
│       ├── data/         # Archivos JSON con el contenido
│       └── images/       # Imágenes (eventos, recursos, etc.)
├── amplify.yml       # Configuración de despliegue para AWS Amplify
├── README.md         # Este archivo
└── ... (otros archivos: sitemap.xml, robots.txt, etc.)
```

---

## 🚀 Cómo Probar en Local

Para que el sitio funcione correctamente (especialmente la carga dinámica de contenido desde los archivos JSON), necesitas ejecutarlo a través de un servidor web local.

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

## 🔧 Cómo Actualizar el Contenido

Para facilitar la actualización, el contenido de **Eventos** y **Recursos** se gestiona desde archivos `JSON` ubicados en `public/assets/data/`.

### Para Añadir un Nuevo Evento:

1.  **Sube la imagen del evento** a la carpeta `public/assets/images/events/`.
2.  **Abre el archivo:** `public/assets/data/events.json`.
3.  **Añade un nuevo objeto** al array. Asegúrate de que la fecha (`date`) tenga el formato `YYYY-MM-DD`.

    *Ejemplo:*
    ```json
    {
      "date": "2025-12-20",
      "title": "Meetup Navideño y AWS re:Invent Resumen",
      "description": "Nuestra última reunión del año para discutir las novedades de re:Invent.",
      "image": "assets/images/events/meetup-navidad.jpg",
      "tags": ["Meetup", "Comunidad", "re:Invent"]
    }
    ```

### Para Añadir un Nuevo Recurso:

1.  **Sube la imagen principal** a `public/assets/images/resources/`.
2.  **Abre el archivo:** `public/assets/data/resources.json`.
3.  **Añade un nuevo objeto** al array.

    *Ejemplo:*
    ```json
    {
      "title": "AWS Cloud Quest",
      "description": "Plataforma de aprendizaje gamificada para practicar habilidades de AWS.",
      "url": "https://aws.amazon.com/training/digital/aws-cloud-quest/",
      "image": "assets/images/resources/cloud-quest-game.jpg",
      "tags": ["Juego", "AWS", "Gratis", "Badges"]
    }
    ```

---
## ☁️ Despliegue

Este proyecto está configurado para un despliegue continuo a través de **AWS Amplify**. El archivo `amplify.yml` contiene la configuración del build, donde se especifica `public` como el directorio base de la aplicación. Cualquier `git push` a la rama configurada (ej. `main`) disparará automáticamente un nuevo despliegue.

