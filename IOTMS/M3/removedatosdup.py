import pytz
from pymongo import MongoClient
from datetime import datetime, timedelta
import time

# Conectar a MongoDB
client = MongoClient("mongodb://admin:adminpassword@91.134.75.7:27017")
db = client["test"]
collection_realtime = db["realtimeplanta1"]
collection_ciclos = db["ciclosplanta1"]

# Lista de máquinas
maquinas = [
    "OIMA2", "OIMA3", "OIMA4", "OIMA5",
    "HuskyA", "HuskyB", "HuskyC", "HuskyD", "HuskyE", "HuskyF", "HuskyG"
]

def obtener_documentos_por_turno(maquina, start_time, end_time):
    """Obtiene los documentos de una máquina en un rango de tiempo específico."""
    return list(collection_realtime.find(
        {"maquina": maquina, "timestamp": {"$gte": start_time, "$lt": end_time}},
        {"timestamp": 1, "data": 1}  # Solo traemos los datos necesarios
    ).sort("timestamp", 1))

def limpiar_duplicados(maquina):
    """Elimina documentos duplicados basados en el valor de {maquina}_L2."""
    documentos = obtener_documentos_por_turno(maquina, datetime.combine(datetime.today().date(), datetime.min.time()), datetime.now())
    
    last_value = None
    documentos_a_eliminar = []
    first_zero_found = False

    for doc in documentos:
        sensor_value = next((d["value"] for d in doc["data"] if d["tag"] == f"{maquina}_L2"), None)

        if sensor_value == 0:
            if first_zero_found:
                documentos_a_eliminar.append(doc["_id"])
            else:
                first_zero_found = True
        else:
            first_zero_found = False  

        if sensor_value == last_value:
            documentos_a_eliminar.append(doc["_id"])
        else:
            last_value = sensor_value  

    if documentos_a_eliminar:
        result = collection_realtime.delete_many({"_id": {"$in": documentos_a_eliminar}})
        print(f"[{maquina}] Se eliminaron {result.deleted_count} documentos duplicados.")
    else:
        print(f"[{maquina}] No se encontraron duplicados.")

def contar_ciclos_por_turno(maquina):
    """Cuenta los ciclos para cada turno y actualiza un único registro con todos los turnos."""
    today = datetime.today().date()
    start_of_day = datetime.combine(today, datetime.min.time())

    # Definir los turnos
    turnos = [
        {"turno": "Turno1", "start": start_of_day.replace(hour=6), "end": start_of_day.replace(hour=14)},
        {"turno": "Turno2", "start": start_of_day.replace(hour=14), "end": start_of_day.replace(hour=22)},
        {"turno": "Turno3", "start": start_of_day.replace(hour=22), "end": (start_of_day + timedelta(days=1)).replace(hour=6)}
    ]

    turnos_data = []
    ciclo_total = 0

    for turno in turnos:
        documentos = obtener_documentos_por_turno(maquina, turno["start"], turno["end"])
        total_ones = sum(1 for doc in documentos for data in doc["data"] if data["tag"] == f"{maquina}_L2" and data["value"] == 1)

        if documentos:
            fechacicloinicial = documentos[0]["timestamp"].isoformat()
            fechaciclofinal = documentos[-1]["timestamp"].isoformat()
        else:
            fechacicloinicial = fechaciclofinal = None

        turnos_data.append({
            "turno": turno["turno"],
            "contadorCiclos": total_ones,
            "fechacicloinicial": fechacicloinicial,
            "fechaciclofinal": fechaciclofinal
        })

        ciclo_total += total_ones

    # Fecha de creación del registro
    tz_mexico = pytz.timezone("America/Mexico_City")
    fecha_creacion = datetime.now(tz_mexico).replace(hour=0, minute=0, second=0, microsecond=0).isoformat() + "Z"

    payload = {
        "maquina": maquina,
        "turnos": turnos_data,
        "fechaCreacion": fecha_creacion,
        "cicloTotal": ciclo_total
    }

    if ciclo_total > 0:  # Solo actualiza si hay datos
        existing_entry = collection_ciclos.find_one({"maquina": maquina, "fechaCreacion": fecha_creacion})
        if existing_entry:
            collection_ciclos.update_one({"_id": existing_entry["_id"]}, {"$set": payload})
            print(f"[{maquina}] Registro actualizado en la base de datos.")
        else:
            collection_ciclos.insert_one(payload)
            print(f"[{maquina}] Nuevo registro insertado en la base de datos.")

def ejecutar():
    """Ejecuta la limpieza y el conteo para todas las máquinas."""
    while True:
        for maquina in maquinas:
            limpiar_duplicados(maquina)
            contar_ciclos_por_turno(maquina)
        time.sleep(1)  # Reducimos la frecuencia para evitar sobrecarga

if __name__ == "__main__":
    ejecutar()
