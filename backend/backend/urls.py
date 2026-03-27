from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.routers import DefaultRouter
from mantenimientos.views import AlertaViewSet

# Configuración del Router para Alertas
router = DefaultRouter()
router.register(r'alertas', AlertaViewSet, basename='alertas')

@api_view(['GET'])
@permission_classes([AllowAny])
def index_api(request):
    return Response({"mensaje": "¡Conexión exitosa desde Django!", "status": "OK"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/index/', index_api), 
    path('api/users/', include('users.urls')),
    path('api/motos/', include('motos.urls')), 
    # Esta línea ahora buscará el archivo que acabamos de crear:
    path('api/mantenimientos/', include('mantenimientos.urls')), 
    path('api/vendedor/', include('vendedor.urls')),
]

# Servir archivos multimedia (fotos de productos) en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)