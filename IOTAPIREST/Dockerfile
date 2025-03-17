# Usar una imagen base de Node.js
FROM node:16

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar el archivo package.json y package-lock.json al contenedor
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install

# Copiar todos los archivos del proyecto al contenedor
COPY . .

# Exponer el puerto en el que corre la API (ajústalo si es necesario)
EXPOSE 4100

# Comando para iniciar el servidor de la API
CMD ["npm", "start"]
