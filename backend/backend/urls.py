from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.routers import DefaultRouter # Importa esto
from mantenimientos.views import AlertaViewSet # Ya lo tienes

# Creamos el router y registramos la ruta de alertas
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
    # 3. AGREGAMOS LAS RUTAS DEL ROUTER (Aquí se crea /api/alertas/)
    path('api/', include(router.urls)), 
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)