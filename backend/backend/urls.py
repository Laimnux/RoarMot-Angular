from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.routers import DefaultRouter
from mantenimientos.views import AlertaViewSet

# 1. Configuración del Router
# Agrupamos los ViewSets aquí para mantener limpio el urlpatterns
router = DefaultRouter()
router.register(r'alertas', AlertaViewSet, basename='alertas')

@api_view(['GET'])
@permission_classes([AllowAny])
def index_api(request):
    return Response({
        "mensaje": "¡Conexión exitosa a Roarmot API!", 
        "status": "OK",
        "version": "v2.1"
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/index/', index_api), 
    
    # Endpoints de aplicaciones específicas
    path('api/users/', include('users.urls')),
    path('api/motos/', include('motos.urls')), 
    path('api/vendedor/', include('vendedor.urls')),
    
    # Mantenimientos: Aquí incluimos tanto el router como las urls manuales
    path('api/', include(router.urls)), # Genera: api/alertas/
    path('api/mantenimientos/', include('mantenimientos.urls')), 
]

# ESTA PARTE ES CRÍTICA:
# Añade esto al final de todo el archivo para servir archivos subidos por usuarios
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)