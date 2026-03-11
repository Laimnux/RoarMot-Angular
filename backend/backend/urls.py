from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
def index_api(request):
    return Response({"mensaje": "¡Conexión exitosa desde Django!", "status": "OK"})

# 1. Definición de rutas normales
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/index/', index_api), 
    path('api/users/', include('users.urls')),
    path('api/motos/', include('motos.urls')), 
]

# 2. CONFIGURACIÓN PARA IMÁGENES (MEDIA)
# Esto permite que Django "sirva" los archivos de la carpeta media
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)