# Usar una imagen base oficial de Python
FROM python:3.9-slim

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos necesarios
COPY requirements.txt .

# Instalar las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código del microservicio
COPY . .

# Exponer el puerto en el que el microservicio estará corriendo
EXPOSE 5001

# Ejecutar el microservicio
CMD ["python", "MqttDataSave.py"]
