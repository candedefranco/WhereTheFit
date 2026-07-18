# gunicorn.conf.py - configuracion de produccion para gunicorn
import os

# bind al puerto 5001 en localhost (nginx hace de reverse proxy)
bind = "127.0.0.1:5001"

# cantidad de workers (2 * num_cores + 1 es la recomendacion)
workers = 3

# timeout de 120 segundos (por si gemini tarda)
timeout = 120

# logging
accesslog = "/var/log/wtf/gunicorn-access.log"
errorlog = "/var/log/wtf/gunicorn-error.log"
loglevel = "info"

# nombre del proceso
proc_name = "wherethefit"
