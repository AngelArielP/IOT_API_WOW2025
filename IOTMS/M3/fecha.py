from datetime import datetime

# Obtener la fecha y hora actual
fecha_hora_actual = datetime.now()

# Mostrar la fecha y hora actual
print("Fecha y hora actual:", fecha_hora_actual)

# Para solo mostrar la fecha (sin la hora)
fecha_actual = fecha_hora_actual.date()
print("Fecha actual:", fecha_actual)

# Para solo mostrar la hora (sin la fecha)
hora_actual = fecha_hora_actual.time()
print("Hora actual:", hora_actual)
