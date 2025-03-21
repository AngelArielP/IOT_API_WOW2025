import paho.mqtt.client as mqtt
import json
from datetime import datetime
from pymongo import MongoClient
import pytz

import os

MONGO_USER = os.getenv("MONGO_INITDB_ROOT_USERNAME", "default_user")
MONGO_PASS = os.getenv("MONGO_INITDB_ROOT_PASSWORD", "default_pass")
PORT_MONGO = os.getenv("PORT_MONGO", "27017")
IP_PROD = os.getenv("IP_PROD", "localhost")

MONGO_URI = f"mongodb://{MONGO_USER}:{MONGO_PASS}@{IP_PROD}:{PORT_MONGO}"

print(f"Conectando a MongoDB en {MONGO_URI}")
# Obtener la zona horaria local de México (Ciudad de México)
local_tz = pytz.timezone("America/Mexico_City")
# 🔹 Conexión a MongoDB
MONGO_DB_NAME = "Datacruda"

client_mongo = MongoClient(MONGO_URI)
db = client_mongo[MONGO_DB_NAME]

# 🔹 Definir parámetros del broker MQTT
MQTT_BROKER_URL = "tools.ewonsupport.biz"
MQTT_BROKER_PORT = 1883
MQTT_KEEP_ALIVE_INTERVAL = 60

# 🔹 Temas a suscribirse
MQTT_TOPIC_1 = "/topic/flexy/2409-0024-21/data"
MQTT_TOPIC_2 = "/topic/flexy/2409-0049-21/data"
MQTT_TOPIC_3 = "/topic/flexy/2233-0701-24/data"


# 📌 Función que maneja la conexión al broker MQTT
def on_connect(client, userdata, flags, rc):
    print(f"Conectado al broker MQTT con resultado: {rc}")
    client.subscribe(MQTT_TOPIC_1)
    client.subscribe(MQTT_TOPIC_2)
    client.subscribe(MQTT_TOPIC_3)

# 📌 Función que maneja los mensajes recibidos
def on_message(client, userdata, msg):
    print(f"Mensaje recibido en {msg.topic}: Data recibida")
    
    try:
        # 🔹 Convertir el mensaje JSON a un diccionario
        data = json.loads(msg.payload.decode())

        # 🔹 Agregar la fecha y hora actual
        current_time = datetime.now(local_tz).strftime("%Y-%m-%d %H:%M:%S")
        
        # 🔹 Formato de datos para MongoDB
        document = {
            "timestamp": current_time,
            "topic": msg.topic,
            "data": data
        }

        # 🔹 Seleccionar la colección correspondiente al tópico MQTT
        collection_name = msg.topic.replace("/", "_").replace("-", "_")  # Reemplazar "/" y "-" por "_"
        collection = db[collection_name]
        
        # 🔹 Insertar en MongoDB
        collection.insert_one(document)
        
        print(f"✅ Datos insertados en MongoDB ({collection_name})")

    except json.JSONDecodeError:
        print("❌ Error al decodificar el mensaje JSON.")

# 🔹 Crear el cliente MQTT
client = mqtt.Client()

# 🔹 Configurar los callbacks
client.on_connect = on_connect
client.on_message = on_message

# 🔹 Conectar al broker
client.connect(MQTT_BROKER_URL, MQTT_BROKER_PORT, MQTT_KEEP_ALIVE_INTERVAL)

# 🔹 Mantener la conexión abierta y escuchar mensajes
client.loop_start()

# 🔹 Mantener el script corriendo
try:
    while True:
        pass
except KeyboardInterrupt:
    print("Desconectando...")
    client.loop_stop()
    client.disconnect()
