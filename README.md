# IOT_API_WOW2025

## Descripción

Este repositorio contiene el **backend IoT** para el proyecto **WOW Plasteca**.

## Requisitos

Antes de comenzar, asegúrate de tener instalados los siguientes programas en tu máquina:

- **Docker**: Para manejar los contenedores.
- **Node.js** y **npm**: Para manejar las dependencias del proyecto.

## Instalación

1. Clona este repositorio en tu máquina local:

   ```bash
   git clone https://github.com/AngelArielP/IOT_API_WOW2025.git
   cd IOT_API_WOW2025
   ```

2. Instala las dependencias necesarias utilizando npm:

   ```bash
   npm install
   ```

## Levantar el Proyecto

Para ejecutar la aplicación, utiliza **Docker Compose**. Asegúrate de tener Docker y Docker Compose instalados en tu máquina.

1. Levanta los servicios definidos en el archivo `docker-compose.yaml`:

   ```bash
   sudo docker-compose up -d
   ```

2. Este comando iniciará los contenedores en segundo plano. Puedes verificar que los contenedores estén funcionando correctamente con:

   ```bash
   sudo docker-compose ps
   ```

## Uso

Una vez que el backend esté en funcionamiento, puedes interactuar con la API IoT de la siguiente manera:

- Accede a la API a través de `http://localhost:<puerto>` (sustituye `<puerto>` por el puerto configurado).
  
- Revisa la documentación de la API para conocer los endpoints y cómo hacer peticiones.

## Contribuciones

Si deseas contribuir a este proyecto, por favor sigue estos pasos:

1. Realiza un fork de este repositorio.
2. Crea una nueva rama (`git checkout -b feature/tu-feature`).
3. Realiza tus cambios y haz commit de ellos (`git commit -am 'Añadir nueva feature'`).
4. Haz push de tu rama (`git push origin feature/tu-feature`).
5. Abre un Pull Request.

## Licencia

Este proyecto está bajo la licencia **MIT**.

---
