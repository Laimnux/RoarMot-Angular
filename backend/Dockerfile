# Usa una imagen oficial de Python ligera
FROM python:3.11-slim

# Evita que Python genere archivos .pyc y permite ver logs en tiempo real
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Instala dependencias del sistema necesarias para mysqlclient
RUN apt-get update && apt-get install -y \
    python3-dev \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia e instala las librerías de tu pip freeze
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo el código de tu carpeta backend al contenedor
COPY . /app/

# Expone el puerto donde corre Django
EXPOSE 8000

# Comando para arrancar el servidor
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]