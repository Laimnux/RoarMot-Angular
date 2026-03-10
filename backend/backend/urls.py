from django.contrib import admin
from django.urls import path, include # Importante agregar 'include'
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.decorators import api_view, permission_classes # Agregamos permission_classes
from rest_framework.permissions import AllowAny # Importamos AllowAny

# Tu vista de prueba se queda igual
@api_view(['GET'])
@permission_classes([AllowAny]) # <--- ESTO ES LO QUE TE FALTABA
def index_api(request):
    return Response({"mensaje": "¡Conexión exitosa desde Django!", "status": "OK"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/index/', index_api), 
    
    # ESTA ES LA LÍNEA QUE FALTA:
    path('api/users/', include('users.urls')),
    path('api/motos/', include('motos.urls')), # <-- Agrega esta línea 
]