import requests
import pytz
from pymongo import MongoClient
from datetime import datetime, timedelta
import time

# Conectar a MongoDB
client = MongoClient("mongodb://admin:adminpassword@91.134.75.7:27017")
db = client["test"]
collection = db["realtimeplanta1"]

# Lista de máquinas
maquinas = [
    "OIMA2", "OIMA3", "OIMA4", "OIMA5",
    "HuskyA", "HuskyB", "HuskyC", "HuskyD", "HuskyE", "HuskyF", "HuskyG",
    "WM1", "WM2", "WM3", "Other"
]

turno = "Turno1"  # Reemplaza con el turno real que estés utilizando
API_URL = "http://91.134.75.7:4100/api/ciclosplanta1"


def obtener_documentos_maquina(maquina):
    """Obtiene los documentos de una máquina específica desde las 00:00 horas de hoy."""
    today = datetime.today().date()
    start_of_day = datetime.combine(today, datetime.min.time())

    pipeline = [
        {"$match": {"maquina": maquina, "timestamp": {"$gte": start_of_day}}},  # Filtrar desde las 00:00 horas de hoy
        {"$sort": {"timestamp": 1}}
    ]
    
    return list(collection.aggregate(pipeline))


def limpiar_duplicados(maquina):
    """Elimina documentos duplicados basados en el valor de {maquina}_L2."""
    try:
        documentos = obtener_documentos_maquina(maquina)
        print(f"[{maquina}] Total documentos recuperados: {len(documentos)}")

        last_value = None
        documentos_a_eliminar = []
        first_zero_found = False

        for documento in documentos:
            sensor_value = None
            for data_point in documento["data"]:
                if data_point["tag"] == f"{maquina}_L2":
                    sensor_value = data_point["value"]
                    break

            if sensor_value == 0:
                if first_zero_found:
                    documentos_a_eliminar.append(documento["_id"])
                else:
                    first_zero_found = True
            else:
                first_zero_found = False  

            if sensor_value == last_value:
                documentos_a_eliminar.append(documento["_id"])
            else:
                last_value = sensor_value  

        if documentos_a_eliminar:
            result = collection.delete_many({"_id": {"$in": documentos_a_eliminar}})
            print(f"[{maquina}] Se eliminaron {result.deleted_count} documentos duplicados.")
        else:
            print(f"[{maquina}] No se encontraron duplicados.")

    except Exception as e:
        print(f"Error al limpiar duplicados en {maquina}: {e}")


def contar_ciclos_por_turno(maquina):
    """Cuenta los ciclos para cada turno y actualiza un único registro con todos los turnos."""
    try:
        today = datetime.today().date()
        start_of_day = datetime.combine(today, datetime.min.time())
        
        # Definir los rangos de los tres turnos
        turnos = [
            {"turno": "Turno1", "start": start_of_day.replace(hour=6, minute=0), "end": start_of_day.replace(hour=14, minute=0)},
            {"turno": "Turno2", "start": start_of_day.replace(hour=14, minute=0), "end": start_of_day.replace(hour=22, minute=0)},
            {"turno": "Turno3", "start": start_of_day.replace(hour=22, minute=0), "end": (start_of_day + timedelta(days=1)).replace(hour=6, minute=0)}
        ]
        
        turnos_data = []
        ciclo_total = 0  # Variable para acumular el total de ciclos
        
        for turno in turnos:
            documentos = obtener_documentos_por_turno(maquina, turno["start"], turno["end"])
            total_ones = 0
            primer_timestamp = None
            ultimo_timestamp = None

            for doc in documentos:
                for data in doc["data"]:
                    if data["tag"] == f"{maquina}_L2" and data["value"] == 1:
                        total_ones += 1
                        if primer_timestamp is None:
                            primer_timestamp = doc["timestamp"]  # Primer `1` registrado
                        ultimo_timestamp = doc["timestamp"]  # Se actualiza con cada `1`
            
            print(f"[{maquina}] Total de '1' en {maquina}_L2 para {turno['turno']}: {total_ones}")

            if primer_timestamp:
                fechacicloinicial = primer_timestamp.isoformat()
            else:
                fechacicloinicial = None

            if ultimo_timestamp:
                fechaciclofinal = ultimo_timestamp.isoformat()
            else:
                fechaciclofinal = None

            turnos_data.append({
                "turno": turno["turno"],
                "contadorCiclos": total_ones,
                "fechacicloinicial": fechacicloinicial,
                "fechaciclofinal": fechaciclofinal
            })

            ciclo_total += total_ones  # Sumar al ciclo total

        # Fecha de creación del registro completo
        tz_mexico = pytz.timezone("America/Mexico_City")
        fecha_creacion = datetime.now(tz_mexico).replace(hour=0, minute=0, second=0, microsecond=0).isoformat() + "Z"
        
        payload = {
            "maquina": maquina,
            "turnos": turnos_data,
            "fechaCreacion": fecha_creacion,
            "cicloTotal": ciclo_total  # Incluir el total de ciclos
        }

        # Buscar si ya existe un registro para el día y máquina
        response = requests.get(f"{API_URL}/search", params={"maquina": maquina, "fechacicloinicial": today.strftime("%Y-%m-%d")})

        if response.status_code == 200:
            ciclos = response.json()
            if ciclos:
                ciclo = ciclos[0]
                print(f"[{maquina}] Ya existe registro para {today}, actualizando...")

                update_response = requests.put(f"{API_URL}/actualizar/{ciclo['_id']}", json=payload)
                if update_response.status_code == 200:
                    print(f"[{maquina}] Registro actualizado.")
                else:
                    print(f"[{maquina}] Error al actualizar: {update_response.status_code}")
            else:
                insert_response = requests.post(f"{API_URL}/insertar", json=payload)
                if insert_response.status_code == 201:
                    print(f"[{maquina}] Nuevo registro insertado.")
                else:
                    print(f"[{maquina}] Error al insertar: {insert_response.status_code}")

    except Exception as e:
        print(f"Error en el conteo de {maquina}: {e}")


def obtener_documentos_por_turno(maquina, start_time, end_time):
    """Obtiene los documentos de una máquina en un rango de tiempo específico."""
    pipeline = [
        {"$match": {"maquina": maquina, "timestamp": {"$gte": start_time, "$lt": end_time}}},
        {"$sort": {"timestamp": 1}}
    ]
    
    return list(collection.aggregate(pipeline))


def ejecutar():
    """Ejecuta la limpieza y el conteo para todas las máquinas en bucle."""
    while True:
        for maquina in maquinas:
            limpiar_duplicados(maquina)
            contar_ciclos_por_turno(maquina)
        time.sleep(1)


if __name__ == "__main__":
    ejecutar()
