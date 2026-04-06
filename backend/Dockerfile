# 1. Usa una imagen oficial de Python ligera
FROM python:3.11-slim

# 2. Configuración de entorno para optimizar Python en Docker
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 3. Instala dependencias del sistema necesarias para mysqlclient y compilación
RUN apt-get update && apt-get install -y \
    python3-dev \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# 4. Establece el directorio de trabajo
WORKDIR /app

# 5. Copia e instala las librerías (Copiamos solo requirements primero para usar caché)
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# 6. Instalamos Gunicorn explícitamente para producción
RUN pip install gunicorn

# 7. Copia todo el código del backend al contenedor
COPY . /app/

# 8. Expone el puerto de Django
EXPOSE 8000

# 9. Comando de producción
# REEMPLAZA 'roarmot' por el nombre de la carpeta donde está tu archivo wsgi.py
# El primer 'backend' es la carpeta que contiene el archivo wsgi.py
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]