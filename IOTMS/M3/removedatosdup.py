import requests
from pymongo import MongoClient
from datetime import datetime
import time

# Conectar a MongoDB
client = MongoClient("mongodb://admin:adminpassword@91.134.75.7:27017")  # Cambia la URL según tu configuración
db = client["test"]  # Reemplaza con tu base de datos
collection = db["realtimeplanta1"]  # Reemplaza con tu colección
turno = "Turno1"  # Reemplaza con el turno real que estés utilizando

# URL de la API a la que se enviarán los datos
API_URL = "http://91.134.75.7:4100/api/ciclosplanta1"  # Reemplaza con la URL real de tu API


def obtener_documentos_husky():
    """
    Función que obtiene los documentos de la máquina HuskyF desde las 00:00 horas de hoy.
    """
    today = datetime.today().date()  # Obtener solo la fecha actual (sin la parte de la hora)
    start_of_day = datetime.combine(today, datetime.min.time())  # Combina la fecha con la hora 00:00

    pipeline = [
        {
            "$match": {
                "maquina": "HuskyF",  # Filtra solo los documentos de la máquina específica
                "timestamp": {"$gte": start_of_day}  # Filtra los documentos desde las 00:00 horas de hoy

            }
        },
        {
            "$sort": {"timestamp": 1}  # Aseguramos que están ordenados por fecha
        }
    ]
    
    documentos = list(collection.aggregate(pipeline))  # Ejecutamos la agregación
    return documentos


def limpiar_duplicados():
    """
    Función que elimina documentos duplicados basados en el valor de HuskyF_L2.
    """
    try:
        documentos = obtener_documentos_husky()
        print(f"Total de documentos recuperados: {len(documentos)}")
        
        # Inicializar variables para la limpieza de duplicados
        last_husky_l2 = None  # Guardamos el valor anterior de HuskyF_L2
        documentos_a_eliminar = []  # Lista de documentos duplicados a eliminar
        first_zero_found = False  # Para rastrear si el primer 0 ha sido encontrado

        for documento in documentos:
            husky_l2_value = None
            # Buscar el valor de HuskyF_L2 en el documento
            for data_point in documento["data"]:
                if data_point["tag"] == "HuskyF_L2":
                    husky_l2_value = data_point["value"]
                    break

            # Si el valor de HuskyF_L2 es 0, comprobamos si es el primer 0
            if husky_l2_value == 0:
                if first_zero_found:  # Si ya se encontró un 0 antes, lo marcamos para eliminar
                    documentos_a_eliminar.append(documento["_id"])
                else:  # Si es el primer 0, lo conservamos
                    first_zero_found = True
            else:
                first_zero_found = False  # Reiniciar si encontramos un valor diferente a 0

            # Si el valor de HuskyF_L2 es el mismo que el anterior, lo marcamos para eliminar
            if husky_l2_value == last_husky_l2:
                documentos_a_eliminar.append(documento["_id"])  # Marcamos el documento para eliminación
            else:
                last_husky_l2 = husky_l2_value  # Actualizamos el último valor de HuskyF_L2

        # Eliminar los documentos marcados
        if documentos_a_eliminar:
            result = collection.delete_many({"_id": {"$in": documentos_a_eliminar}})
            print(f"Se han eliminado {result.deleted_count} documentos duplicados.")
        else:
            print("No se encontraron documentos duplicados para eliminar.")
    
    except Exception as e:
        print(f"Error al limpiar duplicados: {e}")

def contar_veces_que_aparece_uno():
    """
    Función que cuenta las veces que aparece el valor '1' en el campo HuskyF_L2
    y actualiza o inserta el registro en la API.
    """
    try:
        documentos = obtener_documentos_husky()
        print(f"Total de documentos recuperados para contar los '1': {len(documentos)}")

        total_ones = 0  # Contador de las veces que aparece el valor 1 en "HuskyF_L2"

        # Contabilizamos cuántas veces aparece el valor 1 en "HuskyF_L2"
        for documento in documentos:
            for data_point in documento["data"]:
                if data_point["tag"] == "HuskyF_L2" and data_point["value"] == 1:
                    total_ones += 1

        # Imprimir cuántas veces ha aparecido el valor 1 en HuskyF_L2
        print(f"Total de veces que '1' apareció en 'HuskyF_L2': {total_ones}")

        # Generar el payload para insertar o actualizar
        today_str = datetime.today().date().strftime("%Y-%m-%d")  # Convertir la fecha a formato string (YYYY-MM-DD)
        payload = {
            "maquina": "HuskyF",
            "contadorCiclos": total_ones,
            "turno": turno,
            "fechacicloinicial": today_str,
            "fechaciclofinal": today_str,
        }

        # Comprobar si ya existe un registro para el día actual en la API
        response = requests.get(f"{API_URL}/search", params={"maquina": "HuskyF", "fechacicloinicial": today_str, "turno": turno})
        
        if response.status_code == 200:
            ciclos = response.json()
            if ciclos:  # Si ya existe el ciclo
                 ciclo = ciclos[0]  # Supongo que siempre devolverá un solo ciclo por día/turno
                 print(f"El ciclo de planta para la fecha {today_str} y turno {turno} ya existe con _id: {ciclo['_id']}.")
                 
                 # Ahora actualizamos el contadorCiclos en el ciclo existente
                 update_payload = {
                     "contadorCiclos": total_ones,  # Actualizamos el contador de ciclos
                     "fechaciclofinal": today_str  # Aseguramos que la fecha final también se actualiza
                 }
                 
                 # Hacemos una solicitud PUT para actualizar el registro
                 update_response = requests.put(f"{API_URL}/actualizar/{ciclo['_id']}", json=update_payload)
                 if update_response.status_code == 200:
                     print(f"Registro actualizado para {today_str} y turno {turno}. Nuevo contador de ciclos: {total_ones}")
                 else:
                     print(f"Error al actualizar el registro: {update_response.status_code}")
            else:
                # Si no existe, insertamos un nuevo registro
                insert_response = requests.post(f"{API_URL}/insertar", json=payload)
                if insert_response.status_code == 201:
                    print(f"Nuevo ciclo de planta insertado para {today_str} y turno {turno}")
                else:
                    print(f"Error al insertar el registro: {insert_response.status_code}")
    
    except Exception as e:
        print(f"Error al contar las veces que aparece '1': {e}")


def ejecutar():
    """
    Función que ejecuta la limpieza de duplicados y luego cuenta las veces que aparece el valor 1.
    """
    while True:
        limpiar_duplicados()  # Ejecutar la limpieza de duplicados
        contar_veces_que_aparece_uno()  # Ejecutar el conteo de los valores '1' y enviar a la API
        time.sleep(1)  # Esperar 1 segundo antes de la siguiente ejecución


if __name__ == "__main__":
    ejecutar()
