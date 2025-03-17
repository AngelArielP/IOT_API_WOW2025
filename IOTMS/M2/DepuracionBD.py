import time
import requests
from pymongo import MongoClient
from collections import defaultdict
from datetime import datetime  # Importa datetime para convertir la cadena a datetime
import pytz

# Obtener la zona horaria local de México (Ciudad de México)
local_tz = pytz.timezone("America/Mexico_City")

# 🔹 Conexión a MongoDB
MONGO_URI = "mongodb://admin:adminpassword@91.134.75.7:27017"
MONGO_DB_NAME = "Datacruda"
client_mongo = MongoClient(MONGO_URI)
db = client_mongo[MONGO_DB_NAME]

# Nueva base de datos para almacenar los datos en tiempo real
realtime_db = client_mongo["RealtimePlanta1"]

# Nombre de la colección original
collection_name = "_topic_flexy_2233_0701_24_data"  # Cambia esto si es necesario
collection = db[collection_name]

# URL de la API REST a la que se enviarán los datos
API_URL = "http://91.134.75.7:4100/api/realtimeplanta1"  # Cambia esta URL por la URL de tu API

def fetch_data():
    # Consultar los últimos datos en la colección, ordenados por timestamp de forma descendente
    data = collection.find().sort("timestamp", -1).limit(1)  # Limitar a 1 documento
    return data

def group_data(document):
    # Agrupar datos por grupo
    groups = {
        "OIMA2": [],
        "OIMA3": [],
        "OIMA4": [],
        "OIMA5": [],
        "HuskyA": [],
        "HuskyB": [],
        "HuskyC": [],
        "HuskyD": [],
        "HuskyE": [],
        "HuskyF": [],
        "HuskyG": [],
        "WM1": [],
        "WM2": [],
        "WM3": [],
        "Other": []
    }

    # Procesar los datos del documento
    for entry in document.get('data', []):
        tag = entry.get('tag')
        value = entry.get('value')

        # Agrupar según el tag
        if tag and value:
            if tag.startswith("OIMA2"):
                groups["OIMA2"].append({"tag": tag, "value": value})
            elif tag.startswith("OIMA3"):
                groups["OIMA3"].append({"tag": tag, "value": value})
            elif tag.startswith("OIMA4"):
                groups["OIMA4"].append({"tag": tag, "value": value})
            elif tag.startswith("OIMA5"):
                groups["OIMA5"].append({"tag": tag, "value": value})
            elif tag.startswith("HuskyA"):
                groups["HuskyA"].append({"tag": tag, "value": value})
            elif tag.startswith("HuskyB"):
                groups["HuskyB"].append({"tag": tag, "value": value})
            elif tag.startswith("HuskyC"):
                groups["HuskyC"].append({"tag": tag, "value": value})
            elif tag.startswith("HuskyD"):
                groups["HuskyD"].append({"tag": tag, "value": value})
            elif tag.startswith("HuskyE"):
                groups["HuskyE"].append({"tag": tag, "value": value})
            elif tag.startswith("HuskyF"):
                groups["HuskyF"].append({"tag": tag, "value": value})
            elif tag.startswith("HuskyG"):
                groups["HuskyG"].append({"tag": tag, "value": value})
            elif tag.startswith("WM1"):
                groups["WM1"].append({"tag": tag, "value": value})
            elif tag.startswith("WM2"):
                groups["WM2"].append({"tag": tag, "value": value})
            elif tag.startswith("WM3"):
                groups["WM3"].append({"tag": tag, "value": value})
            else:
                groups["Other"].append({"tag": tag, "value": value})

    return groups

def send_to_api(group_name, data, timestamp):
    # Convertir el timestamp de cadena a objeto datetime
    if isinstance(timestamp, str):
        timestamp = datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")  # Convierte la cadena a datetime
    
    # Crear el documento a enviar
    document_to_send = {
        "maquina": group_name,  # Agregar el nombre del grupo (Maquina)
        "data": data,
        "timestamp": timestamp.isoformat(),  # Convertir el timestamp a formato ISO para la API
    }
      
    # Enviar los datos a la API
    try:
        response = requests.post(API_URL, json=document_to_send)
        
        # Verificar si la respuesta es exitosa
        if response.status_code == 200:
            print(f"Datos del grupo {group_name} enviados exitosamente a la API.")
        else:
            print(f"Error al enviar datos del grupo {group_name}: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Error en la solicitud HTTP: {e}")

def display_and_send_data():
    # Obtener los datos
    data = fetch_data()
    
    for document in data:
        timestamp = document['timestamp']  # Obtener el timestamp del documento original de Datacruda
        print(f"Timestamp: {timestamp}")
        print(f"Topic: {document['topic']}")
        
        # Agrupar los datos por grupo
        grouped_data = group_data(document)
        
        print("Data agrupada por grupo:")
        for group, items in grouped_data.items():
            print(f"\nGrupo: {group}")
            for item in items:
                print(f"  tag: {item['tag']}, value: {item['value']}")
            
            # Enviar los datos de cada grupo a la API
            send_to_api(group, items, timestamp)

        print("\n")

# 🔹 Ejecutar cada 30 segundos
try:
    while True:
        display_and_send_data()  # Mostrar los datos más recientes, agruparlos y enviarlos a la API
        time.sleep(30)  # Esperar 30 segundos antes de consultar nuevamente
except KeyboardInterrupt:
    print("Desconectando...")
