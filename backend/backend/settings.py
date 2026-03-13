import os
from pathlib import Path
from datetime import timedelta

# --- DIRECTORIOS BASE ---
# Esto detecta automáticamente la raíz de tu proyecto
BASE_DIR = Path(__file__).resolve().parent.parent

# --- SEGURIDAD ---
SECRET_KEY = 'django-insecure-9&jmbm^uk7r7c3%*^9j9v7wr==f=93z48=zp^ri)7tdyj*#g8d'
DEBUG = True
# Permitir '*' facilita el trabajo entre diferentes PCs en la misma red
ALLOWED_HOSTS = ['*']

# --- MODELO DE USUARIO PERSONALIZADO ---
AUTH_USER_MODEL = 'users.Usuario'

# --- PARCHE PARA XAMPP / MARIADB ANTIGUO ---
from django.db.backends.base.base import BaseDatabaseWrapper
BaseDatabaseWrapper.check_database_version_supported = lambda self: None

# --- APLICACIONES ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'users',
    'motos',
    'mantenimientos',
]

# --- MIDDLEWARE ---
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.template.context_processors.media', # Agregado para imágenes
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# --- BASE DE DATOS (MySQL / XAMPP) ---
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'mymoto',
        'USER': 'root',
        'PASSWORD': '',
        'HOST': '127.0.0.1',
        'PORT': '3306',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}

# --- CORS CONFIGURATION ---
CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",
    "http://127.0.0.1:4200",
]
CORS_ALLOW_CREDENTIALS = True

# --- REST FRAMEWORK ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny', 
    ),
}

# --- JWT CONFIGURATION ---
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'ID_USUARIO',
}

# --- ARCHIVOS ESTÁTICOS Y MULTIMEDIA ---
# Estáticos (CSS, JS del admin)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Multimedia (Fotos de las motos)
# URL que se usa en el navegador: http://127.0.0.1:8000/media/
MEDIA_URL = '/media/'

# Ruta física donde están tus carpetas: C:\...\backend\media
# Usar el operador / es la forma más segura en Mac y Windows
MEDIA_ROOT = BASE_DIR / 'media'

# --- OTROS ---
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
LANGUAGE_CODE = 'es-co'
TIME_ZONE = 'America/Bogota'
USE_I18N = True
USE_TZ = True